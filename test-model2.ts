import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: 'v1alpha' } });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.0-flash',
      contents: "hello"
    });
    console.log("gemini-3.0-flash works");
  } catch (e) {
    console.log("gemini-3.0-flash failed:", e.message);
  }
}
run();
