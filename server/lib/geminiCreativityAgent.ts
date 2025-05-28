import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
import { FileNode, CreativityMetrics } from "../shared/schema.js";
import { promises as fs } from 'fs';
import path from 'path';
const MODEL = "gemini-1.5-flash";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is required in environment variables');
}

const geminiAPI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

function interpolatePrompt(template: string, vars: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}

export async function analyzeCodeCreativity(files: FileNode[]): Promise<CreativityMetrics> {
  try {
    const codeFiles = files.filter(file => file.type === "file" && file.content);
    if (codeFiles.length === 0) {
      throw new Error("No code files found for creativity analysis");
    }
    const promptPath = path.join(__dirname, '../prompts/geminiCreativity.txt');
    const template = await fs.readFile(promptPath, 'utf-8');
    const filesStr = codeFiles.map(file => `--- ${file.path} ---\n${file.content?.substring(0, 1000)}... (truncated)\n`).join('\n');
    const systemPrompt = interpolatePrompt(template, { files: filesStr });
    const model = geminiAPI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.8,
        responseMimeType: "application/json",
      }
    });
    const response = result.response;
    const text = response.text();
    let jsonText = text.trim()
      .replace(/^[\s\S]*?(?=\{)/, '')
      .replace(/\}[\s\S]*$/, '}')
      .replace(/'/g, '"')
      .replace(/,(\s*[\]}])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    try {
      const creativityMetrics = JSON.parse(jsonText) as CreativityMetrics;
      const validateScore = (score: number) => Math.min(100, Math.max(0, score));
      return {
        score: validateScore(creativityMetrics.score),
        novelty: validateScore(creativityMetrics.novelty),
        usefulness: validateScore(creativityMetrics.usefulness),
        elegance: validateScore(creativityMetrics.elegance),
        robustness: validateScore(creativityMetrics.robustness),
        description: creativityMetrics.description || "Code creativity analysis completed."
      };
    } catch (error) {
      console.error("Error parsing creativity metrics:", error);
      return {
        score: 70,
        novelty: 65,
        usefulness: 75,
        elegance: 68,
        robustness: 72,
        description: "Unable to analyze code creativity accurately. Using default assessment."
      };
    }
  } catch (error) {
    console.error("Error analyzing code creativity:", error);
    return {
      score: 65,
      novelty: 60,
      usefulness: 70,
      elegance: 65,
      robustness: 65,
      description: "Failed to analyze code creativity. Using default assessment."
    };
  }
} 