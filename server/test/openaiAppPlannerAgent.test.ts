import { describe, it, expect, beforeAll } from 'vitest';
import { planAppFiles } from '../lib/openaiAppPlannerAgent.js';
import * as geminiPromptRefiner from '../lib/geminiPromptRefiner.js';
import dotenv from 'dotenv';
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const maybeDescribe = (OPENAI_API_KEY && GOOGLE_API_KEY) ? describe : describe.skip;

maybeDescribe('planAppFiles (OpenAI App Planner Agent, with Gemini refined prompt)', () => {
  it('gets a refined prompt from Gemini and plans the app/files with OpenAI', async () => {
    const userPrompt = 'Build a simple todo app with React, Tailwind CSS, and local state.';
    const refined = await geminiPromptRefiner.refinePromptForOpenAI(userPrompt);
    const result = await planAppFiles(refined.improvedPrompt, 'React', 'Tailwind CSS', 'React Hooks', 'Vite');
    console.log('OpenAI App Planner Result:', result);
    expect(Array.isArray(result.files)).toBe(true);
    expect(typeof result.dependencies).toBe('object');
    expect(result.files.length).toBeGreaterThan(0);
  }, 40000);
}); 