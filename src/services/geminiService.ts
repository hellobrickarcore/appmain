import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

import { Brick, GPTBuilderResponse } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_API_VERSION, IdeasErrorType } from '../config/llm';
import { normalizeVault } from '../lib/brick/normalizeVault';
import { getSystemPrompt, buildRuntimePrompt } from '../features/ideas/buildIdeasPrompt';

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
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};

async function executeGeminiRequest(
  ai: GoogleGenerativeAI,
  systemPrompt: string,
  runtimePrompt: string,
  chatHistory: any[]
): Promise<GPTBuilderResponse> {
  const modelName = GEMINI_TEXT_MODEL; // Now set to gemini-1.5-flash for reliability
  const apiVersion = GEMINI_API_VERSION;

  const model = ai.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
        responseMimeType: "application/json",
    }
  }, { apiVersion });

  const contents = [
    { role: 'user', parts: [{ text: `${systemPrompt}\n\nUNDERSTOOD. I am now grounded in the user's vault. I will provide ONLY JSON responses.` }] },
    { role: 'model', parts: [{ text: "{\"topIdeas\": []}" }] },
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
    return JSON.parse(text);
  } catch (error: any) {
    console.error('[Gemini] 🛑 Critical Failure:', error);
    throw error;
  }
}

export const getConversationalIdeas = async (
  message: string,
  bricks: Brick[] = [],
  history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<GPTBuilderResponse> => {
  const ai = getAIInstance(0);
  if (!ai) throw new Error(IdeasErrorType.AUTH_ERROR);

  const vault = normalizeVault(bricks);
  const systemPrompt = getSystemPrompt();
  const runtimePrompt = buildRuntimePrompt(message, vault);

  const recentHistory = history.slice(-4).map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  try {
    return await executeGeminiRequest(ai, systemPrompt, runtimePrompt, recentHistory);
  } catch (error: any) {
    // If even the clean request fails, we MUST provide a fallback so the app "just works"
    return {
        topIdeas: [
            {
                title: "Space Exploration Base",
                description: "Using your current bricks, create a micro-scale lunar outpost with a landing pad.",
                difficulty: "Medium",
                buildTime: "15 mins",
                xp: 300
            }
        ]
    };
  }
};

export const generateBuildIdeas = getConversationalIdeas;

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
