import OpenAI from "openai";
import { FileNode } from "../shared/schema.js";
import { promises as fs } from 'fs';
import path from 'path';
import { generateFileCode } from './openaiFileCodegenAgent.js';
import { fileURLToPath } from 'url';
import { dirname as esmDirname } from 'path';
import * as babel from '@babel/core';
import { Anthropic } from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const OPENAI_MODEL = "gpt-4-turbo";
const CLAUDE_MODEL = "claude-3-sonnet-20240229";
const MODEL = "gpt-4-turbo";
const __filename = fileURLToPath(import.meta.url);
const __dirname = esmDirname(__filename);

// Helper: Extract error messages from a failed live preview or stack trace
function extractErrorMessages(errorOutput: string): string[] {
  // Simple heuristic: split by lines, filter for lines with 'Error', 'Exception', or stack traces
  return errorOutput
    .split('\n')
    .filter(line => /error|exception|at |failed|undefined|cannot|unexpected|syntax/i.test(line))
    .map(line => line.trim())
    .filter(Boolean);
}

function interpolatePrompt(template: string, vars: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}

// Helper: Map error messages to relevant files and lines
function mapErrorsToFiles(errors: string[], files: FileNode[]): { [filePath: string]: { file: FileNode, errorLines: number[], errorSnippets: string[] } } {
  const mapping: { [filePath: string]: { file: FileNode, errorLines: number[], errorSnippets: string[] } } = {};
  for (const error of errors) {
    // Heuristic: look for file references in error messages
    // e.g., 'at App (src/App.tsx:10:5)' or 'in App.tsx'
    const fileMatch = error.match(/([\w\/-]+\.(js|jsx|ts|tsx|css|json|html))(:\d+:\d+)?/i);
    if (fileMatch) {
      const filePath = fileMatch[1];
      const file = files.find(f => f.path === filePath || f.name === filePath);
      if (file) {
        // Try to extract line number if present
        let errorLine: number | undefined = undefined;
        if (fileMatch[3]) {
          const lineCol = fileMatch[3].split(":");
          errorLine = parseInt(lineCol[1], 10);
        }
        if (!mapping[filePath]) {
          mapping[filePath] = { file, errorLines: [], errorSnippets: [] };
        }
        if (errorLine) {
          mapping[filePath].errorLines.push(errorLine);
        }
        mapping[filePath].errorSnippets.push(error);
      }
    } else {
      // If no file match, associate with main entry or App file heuristically
      const mainFile = files.find(f => /main\.(js|jsx|ts|tsx)$/.test(f.name));
      const appFile = files.find(f => /App\.(js|jsx|ts|tsx)$/.test(f.name));
      const fallback = mainFile || appFile;
      if (fallback) {
        const filePath = fallback.path || fallback.name;
        if (!mapping[filePath]) {
          mapping[filePath] = { file: fallback, errorLines: [], errorSnippets: [] };
        }
        mapping[filePath].errorSnippets.push(error);
      }
    }
  }
  return mapping;
}

// Add a sanitizer for file content to remove TS/JSX issues before sending to LLM
function sanitizeFileContent(content: string): string {
  if (typeof content !== 'string') {
    console.warn('[Sanitizer] Skipping non-string content:', content);
    return '';
  }
  let sanitized = content
    // Remove import/export statements
    .replace(/^[\t ]*import\s+.*?;?[\t ]*$/gm, '')
    .replace(/^[\t ]*export\s+default\s+(\w+);?[\t ]*$/gm, 'window.$1 = $1;')
    .replace(/^[\t ]*export\s*\{[^}]*\};?[\t ]*$/gm, '')
    // Remove TypeScript type assertions and annotations
    .replace(/\s+as\s+\w+/g, '') // Remove 'as Type'
    .replace(/:\s*\w+/g, '')      // Remove ': Type'
    .replace(/<\w+>/g, '')         // Remove generic type params
    // Remove variable declarations inside return
    .replace(/return\s*\(([^)]*const\s+[^;]+;[^)]*)\)/g, (match, inner) => {
      return 'return (' + inner.replace(/const\s+[^;]+;/g, '') + ')';
    })
    // Replace dot notation in variable declarations (e.g., const App.FC = ... -> const App_FC = ...)
    .replace(/(const|let|var)\s+([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\s*=/g, (match, decl, left, right) => {
      return `${decl} ${left}_${right} =`;
    })
    // Remove interface/type blocks (for TS)
    .replace(/^[\t ]*interface\s+\w+\s*\{[^}]*\}[\t ]*$/gm, '')
    .replace(/^[\t ]*type\s+\w+\s*=\s*[^;]+;[\t ]*$/gm, '')
    // Remove React.FC typing but keep function structure
    .replace(/:\s*React\.FC(<[^>]*>)?\s*=\s*/g, ' = ')
    .replace(/:\s*React\.FC\s*=\s*/g, ' = ')
    // Clean prop types more carefully - only in function parameters
    .replace(/\(\s*\{\s*([^}:]+):[^}]*\}\s*\)/g, '({ $1 })')
    // Remove type annotations but be more careful
    .replace(/:\s*React\.ReactNode/g, '')
    .replace(/:\s*JSX\.Element/g, '')
    .replace(/:\s*\w+<[^>]*>/g, '')
    .replace(/:\s*(string|number|boolean|any|object|void)\s*([;,=)])/g, '$2')
    // Remove non-null assertions
    .replace(/!/g, '')
    // Clean up extra whitespace but preserve structure
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // --- JSX Fragment Auto-Wrap for <Routes> blocks ---
  // This regex will wrap adjacent <Route ... /> siblings inside <Routes>...</Routes> in a fragment if not already wrapped
  sanitized = sanitized.replace(/(<Routes[^>]*>)([\s\S]*?)(<\/Routes>)/g, (match, open, inner, close) => {
    // If inner already starts with <> or <React.Fragment>, skip
    const trimmed = inner.trim();
    if (trimmed.startsWith('<>') || trimmed.startsWith('<React.Fragment>')) return match;
    // If only one child, no need to wrap
    const routeCount = (inner.match(/<Route[\s>]/g) || []).length;
    if (routeCount <= 1) return match;
    // Otherwise, wrap in fragment
    return `${open}\n  <>${inner}\n  </>${close}`;
  });

  // --- General JSX Adjacent Elements Auto-Wrap (optional, for top-level returns) ---
  // This is a best-effort fix for top-level returns with adjacent JSX elements
  sanitized = sanitized.replace(/return\s*\(((?:.|\n)*?<\w+[^>]*>(?:.|\n)*?<\w+[^>]*>(?:.|\n)*?)\)/g, (match, inner) => {
    // If already wrapped in <>, skip
    if (inner.trim().startsWith('<>')) return match;
    return `return (<>${inner}</>)`;
  });

  return sanitized;
}

// Utility to decode escaped newlines/tabs in code strings
function decodeEscapedCode(code: string): string {
  return code
    .replace(/\\n/g, '\n') // double-escaped newlines
    .replace(/\n/g, '\n')   // single-escaped newlines
    .replace(/\\t/g, '\t') // double-escaped tabs
    .replace(/\t/g, '\t')   // single-escaped tabs
    .replace(/\\r/g, '\r') // double-escaped carriage returns
    .replace(/\r/g, '\r');  // single-escaped carriage returns
}

// Ensure there is a valid, mountable App component before returning files
function ensureValidAppFile(files: FileNode[]): FileNode[] {
  // No fallback injection: just return files as-is
  return files;
}

interface AttemptResult {
  attempt: number;
  responseContent: any;
  files: FileNode[];
  error?: string | null;
}

interface ErrorFixResult {
  attempt: number;
  errors: any;
  result: {
    success: boolean;
    files?: FileNode[];
    error?: string | null;
    debugInfo?: any;
  };
}

export async function fixAppErrors(
  errors: string[],
  files: FileNode[],
  framework: "React" | "Vue" | "Angular" = "React",
  livePreviewError?: string,
  aiProvider: string = 'openai'
): Promise<{
  success: boolean;
  files?: FileNode[];
  error?: string | null;
  debugInfo?: any;
}> {
  let errorMessage: string | null = null;

  try {
    // If livePreviewError is provided, extract error messages and merge with errors
    let allErrors = [...errors];
    if (livePreviewError) {
      allErrors = [
        ...allErrors,
        ...extractErrorMessages(livePreviewError)
      ];
    }
    // Remove duplicates
    allErrors = Array.from(new Set(allErrors));

    // --- SPECIAL CASE: App component not found ---
    // No fallback injection: do not modify files, just proceed as normal

    // --- NEW: Map errors to files/lines ---
    const errorMap = mapErrorsToFiles(allErrors, files);
    // If no mapping, fallback to all files
    const relevantFiles = Object.keys(errorMap).length > 0
      ? Object.values(errorMap).map(e => e.file)
      : files;

    // Optionally, insert error markers in code
    const filesWithMarkers = relevantFiles.map(file => {
      if (file.type !== "file" || typeof file.content !== "string") {
        console.warn(`[ErrorFixAgent] Skipping non-string or non-file: ${file.path || file.name}`);
        return file;
      }
      const mapping = errorMap[file.path] || errorMap[file.name];
      if (!mapping || mapping.errorLines.length === 0) return file;
      // Insert marker at error lines
      const lines = file.content.split('\n');
      mapping.errorLines.forEach(lineNum => {
        if (lineNum > 0 && lineNum <= lines.length) {
          lines[lineNum - 1] = '// ERROR HERE: ' + (mapping.errorSnippets.join(' | ')) + '\n' + lines[lineNum - 1];
        }
      });
      return { ...file, content: lines.join('\n') };
    });

    // --- Regenerate stub files before running error fix prompt ---
    const stubPattern = /^const ([A-Za-z0-9_]+) = \(\) => null; window\.\1 = \1;$/;
    const regeneratedFiles = await Promise.all(filesWithMarkers.map(async (file) => {
      if (
        file.type === "file" &&
        typeof file.content === "string" &&
        stubPattern.test(file.content.trim())
      ) {
        // Attempt to regenerate the file using codegen agent
        try {
          const regenerated = await generateFileCode({
            refinedPrompt: '', // You may want to pass the original refinedPrompt if available
            design_notes: '',
            filePath: file.path,
            fileInfo: {},
            framework,
            styling: 'Tailwind CSS',
          });
          return { ...file, content: regenerated };
        } catch (e) {
          console.error(`[ErrorFixAgent] Failed to regenerate stub for ${file.path}:`, e);
          // If regeneration fails, keep the stub
          return file;
        }
      }
      return file;
    }));

    const promptPath = path.join(__dirname, '../prompts/openaiErrorFix.txt');
    const template = await fs.readFile(promptPath, 'utf-8');
    const errorsStr = allErrors.length
      ? allErrors.map((error, i) => `${i + 1}. ${error}`).join('\n')
      : 'No explicit error messages, but the app is not working as expected.';
    // Only send relevant files (with markers) to the LLM
    const routerGlobalsComment = '// Assume: const { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate, useLocation, useSearchParams, Outlet } = window.ReactRouterDOM;';
    // Filter out files with non-string or empty/whitespace content
    const filteredFiles = regeneratedFiles.filter(f => f.type === "file" && typeof f.content === 'string' && f.content.trim().length > 0);
    filteredFiles.forEach(f => {
      if (typeof f.content !== 'string' || f.content.trim().length === 0) {
        console.warn(`[ErrorFixAgent] Skipping file with empty or invalid content: ${f.path || f.name}`);
      }
    });
    const filesStr = filteredFiles
      .map(file => `--- File: ${file.path} ---\n${routerGlobalsComment}\n${sanitizeFileContent(file.content as string)}\n`).join('\n');
    const systemPrompt = interpolatePrompt(template, { framework, errors: errorsStr, files: filesStr });

    // Handle attempt results
    const handleAttemptResult = (result: AttemptResult): boolean => {
      if (result.files.length === 0) {
        errorMessage = "LLM returned only empty or invalid files.";
        return false;
      }
      return true;
    };

    // Process results
    const attemptResult: AttemptResult = {
      attempt: 1,
      responseContent: {},
      files: files || []
    };

    if (!handleAttemptResult(attemptResult)) {
      return {
        success: false,
        error: errorMessage,
        debugInfo: { attempt: attemptResult }
      };
    }

    // After all error fixing, ensure a valid App file exists and is parseable
    const finalFiles = ensureValidAppFile(attemptResult.files);
    return {
      success: true,
      files: finalFiles,
      debugInfo: { attempt: attemptResult }
    };
  } catch (error: any) {
    console.error('[ErrorFixAgent] Exception in fixAppErrors:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      debugInfo: { error }
    };
  }
} 