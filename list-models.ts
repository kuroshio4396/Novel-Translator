import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.list();
  for await (const model of response) {
    if (model.name.includes("gemini-3")) {
      console.log(model.name);
    }
  }
}
run();
