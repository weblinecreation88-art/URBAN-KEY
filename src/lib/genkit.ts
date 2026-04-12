import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit, type Genkit } from "genkit";

// Lazy singleton — avoids module-level crash during build when API key is absent
let _ai: Genkit | null = null;

export function getAI(): Genkit {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
      model: gemini15Flash,
    });
  }
  return _ai;
}

// Keep named export for backward compat — but accessed lazily
export const ai = new Proxy({} as Genkit, {
  get(_target, prop) {
    return (getAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
