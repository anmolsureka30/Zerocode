process.env.GOOGLE_API_KEY = 'AIzaSyDNo-6CNPVKHYYHNnts3tx7sOfiRNorm1w';

import { describe, it, expect, beforeAll } from 'vitest';
import * as geminiPromptRefiner from '../lib/geminiPromptRefiner.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('refinePromptForOpenAI (real Gemini API)', () => {
  let systemPrompt: string;
  beforeAll(async () => {
    const promptPath = path.join(__dirname, '../prompts/geminiPromptRefiner.txt');
    systemPrompt = await fs.readFile(promptPath, 'utf-8');
  });

  it('calls the real Gemini API and logs the refined prompt', async () => {
    const userPrompt = 'Build a task manager app with team collaboration and notifications.';
    const result = await geminiPromptRefiner.refinePromptForOpenAI(userPrompt);
    console.log('Real Refined Prompt Example:', result);
    expect(result.improvedPrompt).toBeTruthy();
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.user_flows)).toBe(true);
    expect(typeof result.technical_notes).toBe('string');
  });
}); 