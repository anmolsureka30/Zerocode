// client/src/components/LivePreview.tsx

import { useState, useEffect, useRef, ReactNode } from "react";
import {
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewSizeType, FileNode } from "@/lib/types";
import { API_URL } from "@/config/env";
import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { githubLight } from "@codesandbox/sandpack-themes";
import { useToast } from "@/hooks/use-toast";
import apiClient from '../ApiService';

// Define GeneratedApp type if @shared/schema is not available
interface GeneratedApp {
  files?: FileNode[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  meta?: {
    filesGenerated: number;
    validationPassed: boolean;
    warnings: string[];
  };
}

interface LivePreviewProps {
  isGenerating: boolean;
  isComplete: boolean;
  isError: boolean;
  onRegenerateClick?: (files?: FileNode[]) => void;
  generatedFiles?: FileNode[];
  generatedApp?: GeneratedApp;
  aiProvider?: string;
}

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: ReactNode, onReset?: () => void }, { hasError: boolean, error?: Error }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    // Optionally log error
  }
  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Preview Error</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            {this.state.error?.message || "Something went wrong rendering the preview."}
          </p>
          <Button onClick={this.handleReset} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Utility to sanitize code for browser preview
function sanitizeCode(code: string): string {
  // Remove require() calls
  let sanitized = code.replace(/require\(.+?\);?/g, '');
  // Remove incomplete JSX tags at end of lines
  sanitized = sanitized.replace(/<\w+[^>]*>$/gm, '');
  // Remove OpenAI artifacts (e.g., <|endoftext|>)
  sanitized = sanitized.replace(/<\|endoftext\|>/g, '');
  // Optionally, further sanitization can be added here
  return sanitized;
}

function filesFromFileNodes(fileNodes: FileNode[], prefix = ""): Record<string, { code: string }> {
  const files: Record<string, { code: string }> = {};
  for (const node of fileNodes) {
    if (node.type === "file") {
      // Use full path, always starting with '/'
      let fullPath = node.path || (prefix ? prefix + "/" + node.name : "/" + node.name);
      if (!fullPath.startsWith("/")) fullPath = "/" + fullPath;
      // Filter out default Hello World code
      const defaultHelloWorldPatterns = [
        'export default function App() {',
        'return <h1>Hello world</h1>'
      ];
      const code = node.content || "";
      const isDefaultHelloWorld = defaultHelloWorldPatterns.every(p => code.includes(p));
      if (!isDefaultHelloWorld) {
        files[fullPath] = { code: sanitizeCode(code) };
      }
    } else if (node.type === "folder" && node.children) {
      const childPrefix = node.path || (prefix ? prefix + "/" + node.name : "/" + node.name);
      Object.assign(files, filesFromFileNodes(node.children, childPrefix));
    }
  }
  return files;
}

// Update the loadJSZip function
const loadJSZip = async () => {
  const { toast } = useToast();
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      return zip;
    } catch (error) {
      console.error(`Failed to load JSZip (attempts left: ${retries - 1}):`, error);
      retries--;
      
      if (retries === 0) {
        toast({
          title: 'Error',
          description: 'Failed to initialize file compression after multiple attempts. Please refresh the page.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return null;
};

export default function LivePreview({
  isGenerating,
  isComplete,
  isError,
  onRegenerateClick,
  generatedFiles = [],
  generatedApp,
  aiProvider = 'openai'
}: LivePreviewProps) {
  const [previewSize, setPreviewSize] = useState<PreviewSizeType>("desktop");
  const { toast } = useToast();
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sandpack' | 'vm'>('sandpack');
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Convert files for Sandpack
  const files = filesFromFileNodes(generatedFiles);
  // Debug: log the files object to verify keys and contents
  console.log("[LivePreview] Sandpack files:", files);

  // Extract dependencies from package.json if available, else fallback
  let dependencies: Record<string, string> = {
    react: "latest",
    "react-dom": "latest",
  };
  const pkg = generatedFiles.find(f => f.name === "package.json" && f.content);
  if (pkg) {
    try {
      const parsed = JSON.parse(pkg.content as string);
      dependencies = { ...dependencies, ...(parsed.dependencies || {}) };
    } catch {}
  }

  // Device preview widths
  const previewWidths = {
    mobile: 320,
    tablet: 600,
    desktop: "100%",
  };

  // Error boundary for Sandpack
  const handleSandpackError = async (error: any) => {
    if (!error || typeof error !== "string") return;
    setSandboxError(error);
    
    // Only auto-fix for build/runtime errors, not user code errors
    if (/ModuleNotFoundError|SyntaxError|ReferenceError|Cannot find module|Unexpected token/.test(error)) {
      setIsFixing(true);
      toast({ 
        title: "Fixing app errors...", 
        description: error, 
        duration: 3000 
      });
      
      try {
        const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const res = await fetch(`${apiUrl}/fix-errors`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            errors: [error],
            files: generatedFiles,
            framework: "React",
            livePreviewError: error,
            multiStep: true,
            aiProvider
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.files) {
          toast({ 
            title: "App errors fixed!", 
            description: "Preview will reload.", 
            duration: 3000 
          });
          // Replace files with fixed files
          onRegenerateClick?.(data.files);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err: any) {
        toast({ 
          title: "Could not auto-fix app errors", 
          description: err.message || "Unknown error", 
          duration: 4000, 
          variant: "destructive" 
        });
      } finally {
        setIsFixing(false);
      }
    }
  };

  // Update handlePreview function
  const handlePreview = async () => {
    setIsPreviewing(true);
    setPreviewUrl(null);
    setPreviewError(null);
    
    try {
      const zip = await loadJSZip();
      if (!zip) {
        throw new Error('Failed to initialize JSZip');
      }

      // Prepare files object for API
      const filesObj: Record<string, string> = {};
      for (const file of generatedFiles) {
        if (file.type === 'file' && file.content) {
          filesObj[file.path || file.name] = file.content;
        }
      }

      const response = await apiClient.post('/preview', {
        files: filesObj,
        dependencies,
      });

      if (response.data && response.data.previewUrl) {
        console.log('Preview URL:', response.data.previewUrl);
        setPreviewUrl(response.data.previewUrl);
        setPreviewMode('vm');
      } else {
        throw new Error('No preview URL returned');
      }
    } catch (err: any) {
      console.error('Preview error:', err);
      setPreviewError(err.message || 'Failed to generate preview');
      setPreviewMode('sandpack'); // Fallback to Sandpack
      toast({
        title: 'Preview Error',
        description: err.message || 'Failed to generate preview. Falling back to Sandpack.',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  // Add preview mode toggle
  const togglePreviewMode = () => {
    setPreviewMode(prev => prev === 'sandpack' ? 'vm' : 'sandpack');
    if (previewMode === 'vm') {
      setPreviewUrl(null);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Generating Your App</h3>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please wait while we build your preview…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Generation Failed</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
          Something went wrong. Try again with a different prompt.
        </p>
        <Button onClick={() => onRegenerateClick?.()} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!isComplete && Object.keys(files).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-900">
        <Eye className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Preview Your App</h3>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Enter a description and click "Generate App" to see it here.
        </p>
      </div>
    );
  }

  // Main preview UI using Sandpack
  return (
    <div className="flex flex-col h-full" style={{ minHeight: '100%' }}>
      {/* Preview size switcher */}
      <div className="flex items-center justify-between p-2 border-b shrink-0">
        <div className="flex items-center space-x-2">
          <Button
            variant={previewSize === "mobile" ? "default" : "ghost"}
            size="icon"
            aria-label="Mobile preview"
            onClick={() => setPreviewSize("mobile")}
          >
            <Smartphone className="h-5 w-5" />
          </Button>
          <Button
            variant={previewSize === "tablet" ? "default" : "ghost"}
            size="icon"
            aria-label="Tablet preview"
            onClick={() => setPreviewSize("tablet")}
          >
            <Tablet className="h-5 w-5" />
          </Button>
          <Button
            variant={previewSize === "desktop" ? "default" : "ghost"}
            size="icon"
            aria-label="Desktop preview"
            onClick={() => setPreviewSize("desktop")}
          >
            <Monitor className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode === 'sandpack' ? 'default' : 'ghost'}
            size="sm"
            onClick={togglePreviewMode}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {previewMode === 'sandpack' ? 'Switch to VM' : 'Switch to Sandpack'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePreview}
            disabled={isPreviewing || generatedFiles.length === 0}
          >
            {isPreviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Preview on VM
          </Button>
        </div>
      </div>

      {/* Responsive preview container */}
      <div className="flex-1 min-h-0 flex items-stretch p-4">
        <div
          className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col"
          style={{
            width: previewSize === "desktop" ? "100%" : previewWidths[previewSize],
            maxWidth: previewSize === "desktop" ? "100%" : previewWidths[previewSize],
            margin: "0 auto",
            height: '100%'
          }}
        >
          {/* Show iframe if previewUrl is set and mode is VM */}
          {previewMode === 'vm' && previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="600"
              style={{ border: 'none' }}
              title="Live Preview"
              onError={(e) => {
                console.error('Preview iframe error:', e);
                setPreviewError('Failed to load preview');
                setPreviewMode('sandpack');
              }}
            />
          ) : (
            <ErrorBoundary>
              <div style={{ height: '100%' }}>
                <Sandpack
                  template="react"
                  files={files}
                  customSetup={{ dependencies }}
                  theme={githubLight}
                  options={{
                    showNavigator: false,
                    showTabs: false,
                    showLineNumbers: false,
                    showInlineErrors: false,
                    showConsole: false,
                    wrapContent: true,
                    recompileMode: "delayed",
                    recompileDelay: 500,
                    externalResources: [
                      "https://cdn.tailwindcss.com"
                    ],
                    layout: "preview",
                    editorHeight: 0,
                    classes: {
                      'sp-wrapper': 'h-full',
                      'sp-preview-container': 'h-full',
                      'sp-preview': 'h-full',
                      'sp-layout': 'h-full',
                    }
                  }}
                />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}