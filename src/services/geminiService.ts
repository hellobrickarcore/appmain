import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
console.log('--- GEMINI SERVICE V2.1 ACTIVE ---');

import { Brick, GPTBuilderResponse } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_API_VERSION, IdeasErrorType } from '../config/llm';
import { normalizeVault } from '../lib/brick/normalizeVault';
import { getSystemPrompt, buildRuntimePrompt } from '../features/ideas/buildIdeasPrompt';

/**
 * Enhanced AI Instance with multi-key support
 * Purges legacy model references or uses centralized config.
 */
const getAllKeys = () => {
  return [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_BACKUP_KEY,
    import.meta.env.VITE_GEMINI_IMAGE_KEY
  ].filter(Boolean);
};

const getAIInstance = (keyIndex = 0) => {
    const keys = getAllKeys();
    const key = keys[keyIndex];
    if (!key) {
      console.error('[Gemini] 🛑 No API Key found for index', keyIndex);
      return null;
    }
    return new GoogleGenerativeAI(key);
};

/**
 * EXECUTE GEMINI REQUEST with structured output and robust parsing
 */
async function executeGeminiRequest(
  ai: GoogleGenerativeAI,
  systemPrompt: string,
  runtimePrompt: string,
  chatHistory: any[]
): Promise<GPTBuilderResponse> {
  const modelName = GEMINI_TEXT_MODEL;
  const apiVersion = GEMINI_API_VERSION;

  console.log(`[Gemini] 🚀 Request Started. Model: ${modelName}, API Version: ${apiVersion}`);

  const model = ai.getGenerativeModel({ model: modelName }, { apiVersion });

  const contents = [
    { role: 'user', parts: [{ text: `${systemPrompt}\n\nUNDERSTOOD. Ready to suggest builds.` }] },
    { role: 'model', parts: [{ text: "Grounded. I will suggest 1-3 builds matching your scanned vault." }] },
    ...chatHistory,
    { role: 'user', parts: [{ text: runtimePrompt }] }
  ];

  try {
    const apiResponse = await model.generateContent({
      contents,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const text = apiResponse.response.text();
    console.log('[Gemini] 📥 Raw Response:', text.substring(0, 500));
    
    // Strict JSON Extraction
    try {
      return JSON.parse(text);
    } catch (e) {
      const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (match) {
        try {
          return JSON.parse(match[1] || match[0]);
        } catch (e2) {
          console.error('[Gemini] 🛑 Regex JSON extraction failed');
        }
      }
      throw new Error(IdeasErrorType.INVALID_RESPONSE);
    }
  } catch (error: any) {
    const errText = error.message?.toLowerCase() || "";

    if (errText.includes("404") || errText.includes("not found") || errText.includes("not supported")) {
      console.error(`[Gemini] 🛑 Error Classifed: MODEL_NOT_FOUND (${modelName})`);
      throw new Error(IdeasErrorType.MODEL_NOT_FOUND);
    }
    if (errText.includes("quota") || errText.includes("429")) {
      throw new Error(IdeasErrorType.QUOTA_ERROR);
    }
    throw error;
  }
}

/**
 * GROUNDED IDEAS GENERATION
 * Main entry point for Ideas screen.
 */
export const getConversationalIdeas = async (
  message: string,
  bricks: Brick[] = [],
  history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<GPTBuilderResponse> => {
  const primaryAi = getAIInstance(0); // Use index 0 for primary
  const backupAi = getAIInstance(1); // Use index 1 for backup

  if (!primaryAi) throw new Error(IdeasErrorType.AUTH_ERROR);

  // 1. Vault Loading & Normalization
  const vault = normalizeVault(bricks);
  console.log('[IdeasGenerator] ✅ vault loaded & normalized');
  console.log('[IdeasGenerator] 🛠️ vault summary:', {
    total: vault.totalBricks,
    colors: Object.keys(vault.countsByColor),
    sizes: Object.keys(vault.countsBySize)
  });

  const systemPrompt = getSystemPrompt();
  const runtimePrompt = buildRuntimePrompt(message, vault);

  // 2. Chat history cleanup
  const recentHistory = history.slice(-6).map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  try {
    // Attempt 1: Primary
    const result = await executeGeminiRequest(primaryAi, systemPrompt, runtimePrompt, recentHistory);
    console.log('[IdeasGenerator] ✅ request success');
    return result;
  } catch (error: any) {
    console.warn('[Gemini] ⚠️ Primary failed, checking fallback eligibility...');

    // If it's a model not found or fatal, don't spam backup if it's the same model
    if (error.message === IdeasErrorType.MODEL_NOT_FOUND) {
       console.error('[IdeasGenerator] 🛑 Blocking retry due to MODEL_NOT_FOUND');
       throw error;
    }

    if (backupAi && backupAi !== primaryAi) { // Ensure backupAi is distinct and exists
      try {
        console.log('[Gemini] 🔄 Retrying with backup service...');
        const result = await executeGeminiRequest(backupAi, systemPrompt, runtimePrompt, recentHistory);
        console.log('[IdeasGenerator] ✅ request success (via backup)');
        return result;
      } catch (backupError) {
        console.error('[Gemini] 🛑 Backup also failed');
      }
    }

    console.log('[IdeasGenerator] ⚠️ request failed, showing fallback UI');
    throw error;
  }
};

/**
 * PHASE 26 Fix: Alias for IdeasChatScreen
 */
export const generateBuildIdeas = getConversationalIdeas;

/**
 * Phase 26 Hard Fix: Cleaner IdentifyBricks call
 */
export const identifyBricks = async (base64Image: string): Promise<any> => {
  const ai = getAIInstance();
  if (!ai) return { items: [] };

  const model = ai.getGenerativeModel({ model: GEMINI_TEXT_MODEL }, { apiVersion: GEMINI_API_VERSION });
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  try {
    const apiResponse = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Detect LEGO bricks. Return ONLY JSON: {"items": [{"label": "2x2", "color": "yellow", "confidence": 0.9}]}` }
        ]
      }]
    });
    const result = await apiResponse.response;
    return JSON.parse(result.text());
  } catch (e) {
    return { items: [] };
  }
};
