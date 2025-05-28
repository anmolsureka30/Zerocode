import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
import { promises as fs } from 'fs';
import path from 'path';

const MODEL = "gemini-1.5-flash";

/**
 * Refine a vague user prompt into a highly detailed, actionable prompt for OpenAI code generation and error fixing.
 * Returns: { improvedPrompt: string, features: string[], user_flows: string[], technical_notes: string }
 */
export async function refinePromptForOpenAI(userPrompt: string): Promise<{
  improvedPrompt: string;
  features: string[];
  user_flows: string[];
  technical_notes: string;
}> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required in environment variables');
    }
    const geminiAPI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = geminiAPI.getGenerativeModel({ model: MODEL });
    const promptPath = path.join(__dirname, '../prompts/geminiPromptRefiner.txt');
    const systemPrompt = await fs.readFile(promptPath, 'utf-8');
    const fullPrompt = `${systemPrompt}\n\nUSER PROMPT: ${userPrompt}`;
    let retries = 0;
    const maxRetries = 3;
    let result;
    while (retries < maxRetries) {
      try {
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            topK: 40,
            topP: 0.8,
            responseMimeType: "application/json",
          }
        });
        break;
      } catch (err: any) {
        if (err.message && err.message.includes('429') && retries < maxRetries - 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
          continue;
        }
        throw err;
      }
    }
    if (!result) {
      throw new Error("Failed to refine prompt after multiple attempts");
    }
    const response = result.response;
    const text = response.text();
    let jsonText = text.trim()
      .replace(/^```json?\s*/, '')
      .replace(/\s*```$/, '')
      .trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      console.error('❌ Failed to JSON.parse Gemini output:', err.message);
      console.error('Raw output was:\n', text);
      console.error('What we fed into JSON.parse was:\n', jsonText);
      throw new Error(`Failed to parse JSON from Gemini: ${err.message}`);
    }
    if (!parsed.improvedPrompt || !parsed.features || !parsed.user_flows || !parsed.technical_notes) {
      throw new Error("Gemini did not return all required fields (improvedPrompt, features, user_flows, technical_notes)");
    }
    return parsed;
  } catch (error: any) {
    console.error("Error refining prompt for OpenAI:", error);
    throw new Error(`Failed to refine prompt: ${error.message || "Unknown error"}`);
  }
} 