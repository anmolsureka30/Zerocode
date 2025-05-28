import OpenAI from "openai";
import { fixAppErrors } from "./openaiErrorFixAgent.js";

// Message type (imported from frontend or redefined for backend)
export interface Message {
  id: string;
  content: string;
  sender: "user" | "system" | "thinking";
  timestamp: string | Date;
}

// Utility: Compute cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

// Utility: Get embedding for a string
async function getEmbedding(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

// Main chatbot agent function
export async function handleChatbotEdit({
  message,
  codeFiles,
  conversationHistory,
}: {
  message: string,
  codeFiles: any[],
  conversationHistory: Message[]
}) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1. Embed all code files
  const fileEmbeddings = await Promise.all(
    codeFiles.map(async (file: any) => ({
      ...file,
      embedding: await getEmbedding(file.content, openai)
    }))
  );

  // 2. Embed the user message
  const messageEmbedding = await getEmbedding(message, openai);

  // 3. Find top 3 relevant files
  const relevantFiles = fileEmbeddings
    .map(file => ({
      ...file,
      similarity: cosineSimilarity(file.embedding, messageEmbedding)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  // 4. Prepare conversation context for LLM
  const historyText = conversationHistory
    .map(msg => `${msg.sender === "user" ? "User" : "System"}: ${msg.content}`)
    .join("\n");

  // 5. For each relevant file, prompt the LLM for code edits
  const updatedFiles = await Promise.all(relevantFiles.map(async (file) => {
    const prompt = `
Conversation so far:
${historyText}

Here is the current content of ${file.path}:
${file.content}

The user wants to make the following change:
"${message}"

Please update only this file to implement the requested change. Return the full updated file content.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: "You are a senior developer making precise code edits." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    return {
      ...file,
      content: response.choices[0].message.content?.trim() || file.content
    };
  }));

  // 6. Apply changes to codeFiles
  const mergedFiles = codeFiles.map((file: any) => {
    const updated = updatedFiles.find(f => f.path === file.path);
    return updated ? { ...file, content: updated.content } : file;
  });

  // 7. Run debug agent
  const debugResult = await fixAppErrors([], mergedFiles, "React");

  return { updatedFiles: mergedFiles, debugResult };
} 