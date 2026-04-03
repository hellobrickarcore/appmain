import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service - Centralized LLM Configuration
 */

export const GEMINI_TEXT_MODEL = "gemini-2.0-flash";
export const GEMINI_API_VERSION = "v1beta";

/**
 * Retrieve all configured API keys
 */
export const getAllKeys = (): string[] => {
  const keys = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    console.warn('[AI Service] ⚠️ No Gemini API keys found in environment variables.');
  }

  return keys;
};

/**
 * Get an initialized Google AI instance
 */
export const getAIInstance = (keyIndex = 0): GoogleGenerativeAI | null => {
  const keys = getAllKeys();
  const key = keys[keyIndex];
  
  if (!key) {
    return null;
  }

  return new GoogleGenerativeAI(key);
};
