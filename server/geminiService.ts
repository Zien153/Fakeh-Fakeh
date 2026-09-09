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
          "User-Agent": "aistudio-build",
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
 * FIXED: Executes generateContent with automatic retry and model fallback
 * Handles 503 (High demand / UNAVAILABLE), 429 (Rate limiting), and transient errors.
 * Uses CORRECT model names: gemini-2.0-flash (latest), gemini-1.5-flash (stable), gemini-2.0-flash-lite (lightweight)
 */
export async function generateContentWithRetry(options: GenerateWithRetryOptions) {
  const ai = getAiClient();
  // FIXED: Using correct, up-to-date model names from Gemini API
  const models = [
    options.preferredModel || "gemini-2.0-flash",
    "gemini-2.0-flash", // Latest and most capable
    "gemini-1.5-flash", // Stable fallback
    "gemini-2.0-flash-lite", // Lightweight fallback
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
