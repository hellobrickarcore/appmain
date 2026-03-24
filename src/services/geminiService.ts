import { getAIInstance } from './aiService';
import { CONFIG } from './configService';

/**
 * Gemini Service - Advanced AI Features (Phase 7 / HelloBrick v1.4.0)
 * Handles vision analysis, building ideas, and parts identification.
 */

export interface GeminiResponse {
  content: string;
  metadata?: Record<string, any>;
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
