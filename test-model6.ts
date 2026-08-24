import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "hello"
    });
    console.log("gemini-3-flash-preview works in default");
  } catch (e) {
    console.log("gemini-3-flash-preview default failed:", e.message);
  }
}
run();
