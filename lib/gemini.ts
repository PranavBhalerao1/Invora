import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}
