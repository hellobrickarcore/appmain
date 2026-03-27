import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GPTBuilderResponse, Brick } from '../types';
import { getAIInstance, getAllKeys, GEMINI_TEXT_MODEL, GEMINI_API_VERSION } from './aiService';

/**
 * Gemini Service - Advanced AI Features (Phase 7 / HelloBrick v1.4.0)
 * Handles vision analysis, building ideas, and parts identification.
 */

export interface GeminiResponse {
  content: string;
  metadata?: Record<string, any>;
}

/**
 * EXECUTE GEMINI REQUEST with structured output and robust parsing
 */
async function executeGeminiRequest(
  ai: GoogleGenerativeAI,
  systemPrompt: string,
  runtimePrompt: string,
  chatHistory: any[]
): Promise<GPTBuilderResponse> {
  const modelName = GEMINI_TEXT_MODEL || "gemini-1.5-flash";
  const apiVersion = GEMINI_API_VERSION || "v1beta";

  console.log(`[Gemini] 🚀 Request Started. Model: ${modelName}, API Version: ${apiVersion}`);

  const model = ai.getGenerativeModel({ 
    model: modelName,
  }, { apiVersion });

  const contents = [
    ...chatHistory.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { 
      role: 'user', 
      parts: [
        { text: `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER REQUEST:\n${runtimePrompt}` }
      ] 
    }
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

    let text = apiResponse.response.text();
    console.log('[Gemini] 📥 Raw Response:', text.substring(0, 500));
    
    // Strict JSON Cleaning & Extraction
    text = text.replace(/```json\n?|```/g, '').trim();
    
    try {
      const parsed = JSON.parse(text);
      console.log('[Gemini] ✅ JSON Parsed Successfully');
      return parsed;
    } catch (e) {
      console.warn('[Gemini] ⚠️ Direct parse failed, trying regex...', e);
      const match = text.match(/{[\s\S]*}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          console.log('[Gemini] ✅ JSON Extracted via Regex');
          return parsed;
        } catch (e2) {
          console.error('[Gemini] 🛑 Regex JSON extraction failed:', match[0]);
        }
      }
      throw new Error("Invalid response format from AI");
    }
  } catch (error: any) {
    console.error('[Gemini] 🛑 SDK ERROR:', error);
    throw error;
  }
}

/**
 * Main entry point for conversational building ideas
 */
export const getConversationalIdeas = async (
  query: string,
  bricks: Brick[],
  history: any[] = []
): Promise<GPTBuilderResponse> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("AI Instance not initialized");

  const inventoryStr = bricks.map(b => `${b.count}x ${b.color} ${b.name}`).join(', ');
  
  const systemPrompt = `
    You are the HelloBrick AI Build Master. 
    The user has these LEGO bricks: ${inventoryStr}.
    
    Your goal is to suggest 1-3 cool things they can build using ONLY or MOSTLY these pieces.
    Respond in STRICT JSON format:
    {
      "assistantMessage": "A creative greeting and summary of what they can build.",
      "topIdeas": [
        {
          "ideaName": "Name of Build",
          "difficulty": "Ready|Almost|Master",
          "estimatedBrickUse": 10,
          "whyItFitsYourVault": "Why this is good for their specific pieces",
          "imagePrompt": "A detailed DALL-E prompt for a LEGO build of this item",
          "buildSteps": ["Step 1...", "Step 2..."]
        }
      ],
      "suggestedQuickReplies": ["Tell me more", "Another idea?"]
    }
  `;

  return executeGeminiRequest(ai, systemPrompt, query, history);
};

export const chatWithGemini = async (message: string, history: any[] = []): Promise<GeminiResponse> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("AI Instance not initialized");
  
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }))
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return { content: response.text() };
};

export const identifyBrick = async (imageBase64: string): Promise<GeminiResponse> => {
  const prompt = `Identify the LEGO brick in this image. Return JSON with part number and name.`;
  // Simple implementation for now
  const ai = getAIInstance();
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = imageBase64.split(',');
  const data = parts[1];
  
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data } }
  ]);
  return { content: result.response.text() };
};
