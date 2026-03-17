/**
 * Centralized LLM Configuration for HelloBrick
 */
console.log('--- LLM CONFIG V1.0.5 ACTIVE ---');

export const GEMINI_TEXT_MODEL = "gemini-2.0-flash";
export const GEMINI_IMAGE_PROMPT_MODEL = import.meta.env.VITE_GEMINI_IMAGE_PROMPT_MODEL || "gemini-2.0-flash";
export const GEMINI_API_VERSION = "v1beta"; 
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";

export enum IdeasErrorType {
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
  AUTH_ERROR = "AUTH_ERROR",
  QUOTA_ERROR = "QUOTA_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  EMPTY_VAULT = "EMPTY_VAULT",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}
