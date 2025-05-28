import OpenAI from "openai";

export async function getAppIdeaFeedback(refinedPrompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `
You are a friendly, expert AI product manager and UX designer.
When given an app idea, always:
1. Start with a positive, appreciative message about the idea.
2. Give a structured breakdown:
   - Features to be implemented
   - Design/UX approach
   - Tech stack
   - User flows
   - Any other relevant considerations
Be clear, concise, and encouraging.
`;

  const userPrompt = `App idea: "${refinedPrompt}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 800,
  });

  return response.choices[0].message.content?.trim() || "";
}

export async function getUpdateFeedback(updatePrompt: string, appStateSummary: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `
You are a friendly, expert AI product manager and UX designer.
When the user requests an update to the app, always:
1. Acknowledge the update positively.
2. Explain in short , how the change will be implemented 
Be clear, concise, and encouraging.
`;

  const userPrompt = `
Current app summary: ${appStateSummary}
User update request: "${updatePrompt}"
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 800,
  });

  return response.choices[0].message.content?.trim() || "";
} 