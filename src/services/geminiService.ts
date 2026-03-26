import { getAIInstance } from './aiService';
import { CONFIG } from './configService';

/**
 * Gemini Service - Advanced AI Features (Phase 7 / HelloBrick v1.4.0)
 * Handles vision analysis, building ideas, and parts identification.
 */

<<<<<<< HEAD
export interface GeminiResponse {
  content: string;
  metadata?: Record<string, any>;
=======
const getAIInstance = (keyIndex = 0) => {
    const keys = getAllKeys();
    const key = keys[keyIndex];
    if (!key) {
      console.warn(`[Gemini] ⚠️ Key [${keyIndex}] is MISSING (Check .env.local)`);
      return null;
    }
    console.log(`[Gemini] ✅ Key [${keyIndex}] detected: ${key.substring(0, 6)}...`);
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

  const model = ai.getGenerativeModel({ 
    model: modelName,
  }, { apiVersion });

  const contents = [
    ...chatHistory,
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
    console.log('[Gemini] 📥 Raw Response:', text.substring(0, 1000));
    
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
      console.error('[Gemini] 🛑 Full Response for debug:', text);
      throw new Error(IdeasErrorType.INVALID_RESPONSE);
    }
  } catch (error: any) {
    console.error('[Gemini] 🛑 SDK ERROR:', error);
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
>>>>>>> stable-recovery-v1.4.0
}

/**
 * Execute a prompt against Gemini
 */
export const executeGeminiRequest = async (prompt: string, image?: string): Promise<GeminiResponse> => {
  try {
    const ai = getAIInstance();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

    const contents = [];
    
    // Add image if provided (base64)
    if (image) {
      const parts = image.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const data = parts[1];
      
      contents.push({
        inlineData: {
          mimeType: mime,
          data: data
        }
      });
    }

    contents.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: contents }]
    });

    const response = await result.response;
    const text = response.text();

    return {
      content: text
    };

  } catch (error) {
    console.error('❌ Gemini Request Failed:', error);
    throw error;
  }
};

/**
 * Identify a LEGO brick from an image
 */
export const identifyBrick = async (imageBase64: string): Promise<GeminiResponse> => {
  const prompt = `Identify the LEGO brick in this image. Provide the official LEGO part number, color, and name. Match against BrickLink if possible. Return JSON format.`;
  return executeGeminiRequest(prompt, imageBase64);
};

/**
 * Generate building ideas from a set of bricks
 */
export const suggestBuilds = async (bricks: string[]): Promise<GeminiResponse> => {
  const prompt = `I have these LEGO bricks: ${bricks.join(', ')}. What cool Mini-MOC can I build? Provide a name, 3-step instructions, and difficulty level.`;
  return executeGeminiRequest(prompt);
};

/**
 * Chat with Gemini about LEGO
 */
export const chatWithGemini = async (message: string, history: any[] = []): Promise<GeminiResponse> => {
  try {
    const ai = getAIInstance();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format history for Gemini API
    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return {
      content: text
    };
  } catch (error) {
    console.error('❌ Gemini Chat Failed:', error);
    throw error;
  }
};
