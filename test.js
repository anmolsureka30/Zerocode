import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const models = await openai.models.list();
    console.log(models);
  } catch (e) {
    console.error(e);
  }
}

test();