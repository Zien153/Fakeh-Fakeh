import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

interface GenerateWithRetryOptions {
  contents: string | any[];
  config?: any;
  preferredModel?: string;
}

/**
 * Executes generateContent with automatic retry and model fallback:
 * Handles 503 (High demand / UNAVAILABLE), 429 (Rate limiting), and transient errors.
 * Tries models: gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.8-flash.
 */
export async function generateContentWithRetry(options: GenerateWithRetryOptions) {
  const ai = getAiClient();
  const models = [
    options.preferredModel || "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];
  const uniqueModels = Array.from(new Set(models));

  let lastError: any = null;

  for (const model of uniqueModels) {
    // Up to 2 attempts per model
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        // Verify we got valid text back
        if (response && response.text) {
          return { response, usedModel: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || "").toLowerCase();
        const errStatus = String(err?.status || "").toLowerCase();
        const errCode = String(err?.code || "");
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("unavailable") ||
          errMsg.includes("high demand") ||
          errMsg.includes("resource_exhausted") ||
          errStatus.includes("unavailable") ||
          errStatus.includes("resource_exhausted") ||
          errCode === "503" ||
          errCode === "429";

        if (isTransient && attempt < 2) {
          // Exponential backoff + small jitter
          const delay = 800 * attempt + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Move to next model in fallback chain
          break;
        }
      }
    }
  }

  throw lastError;
}
