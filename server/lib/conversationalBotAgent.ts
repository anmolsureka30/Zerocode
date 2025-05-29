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
3. End with an encouraging message about implementing the idea.
Be clear, concise, and encouraging. Focus on practical implementation details.
`;

  const userPrompt = `App idea: "${refinedPrompt}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const feedback = response.choices[0].message.content?.trim();
    
    if (!feedback) {
      throw new Error('No feedback generated');
    }

    return feedback;
  } catch (error) {
    console.error('Error generating app idea feedback:', error);
    throw error;
  }
}

export async function getUpdateFeedback(updatePrompt: string, appStateSummary: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `
You are a friendly, expert AI product manager and UX designer.
When the user requests an update to the app, always:
1. Acknowledge the update request positively.
2. Provide a structured response:
   - How the change will be implemented
   - Impact on existing features
   - Required modifications
   - Potential challenges
   - Best practices to follow
3. End with an encouraging message about the update.
Be clear, concise, and practical. Focus on implementation details.
`;

  const userPrompt = `
Current app summary: ${appStateSummary}
User update request: "${updatePrompt}"
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const feedback = response.choices[0].message.content?.trim();
    
    if (!feedback) {
      throw new Error('No feedback generated');
    }

    return feedback;
  } catch (error) {
    console.error('Error generating update feedback:', error);
    throw error;
  }
} 