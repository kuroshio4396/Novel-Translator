import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash',
      contents: "hello"
    });
    console.log("gemini-3-flash works in v1beta/default");
  } catch (e) {
    console.log("gemini-3-flash v1beta failed:", e.message);
  }
}
run();
