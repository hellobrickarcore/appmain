import { GoogleGenAI } from '@google/genai';
import { CustomPart } from '../types';

// Get API key from environment - Vite exposes VITE_ prefixed vars
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (typeof window !== 'undefined' && !apiKey) {
    console.warn('❌ Gemini API Key NOT found in environment! Check VITE_GEMINI_API_KEY');
  }
  return apiKey;
};

const apiKey = getApiKey();
// Only create AI instance if we have a key
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface DetectedObject {
  label: string;
  id?: string;
  confidence?: number;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1
  color?: string; // Building brick color name
  partNumber?: string; // Building brick part number
}

export interface ScanResult {
  items: DetectedObject[];
  quality: {
    sharpness_score: number;
    lighting_condition: string;
    advice?: string;
  };
}

// NITRO MODE: 256px is the absolute minimum for brick shapes but extremely fast
const optimizeImageForSpeed = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.3));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const identifyBricks = async (base64Image: string, customParts: CustomPart[] = []): Promise<ScanResult> => {
  try {
    if (!ai) {
      throw new Error('Gemini API key not configured.');
    }

    const optimizedBase64 = await optimizeImageForSpeed(base64Image);
    const base64Data = optimizedBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    if (!base64Data || base64Data.length < 100) {
      throw new Error('Invalid image data');
    }

    // Use the BEST free model for vision/image detection
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`🚀 Trying vision model: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName });
        
        const apiResponse = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                  },
                },
                {
                  text: `You are an expert building brick detection AI. Your task is to detect EVERY visible building brick in this image with high accuracy.

CRITICAL: You MUST detect ALL bricks across the FULL IMAGE. This image contains many bricks. Be extremely thorough and detect each one individually with a precise bounding box.

Return ONLY valid JSON (no markdown, no code blocks, no explanation):

{
  "items": [
    {
      "label": "2x4 Brick",
      "color": "Blue",
      "partNumber": "3001",
      "box_2d": [0.2, 0.3, 0.6, 0.5],
      "confidence": 0.85
    }
  ],
  "quality": {
    "advice": "Good",
    "sharpness_score": 1,
    "lighting_condition": "Good"
  }
}

DETECTION REQUIREMENTS:
1. box_2d: [ymin, xmin, ymax, xmax] normalized 0.0-1.0
2. label: "[width]x[length] Brick" or "[width]x[length] Plate"
3. partNumber: ID (3001, etc) or "Unknown"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        });

        const result = await apiResponse.response;
        const text = result.text();
        if (text) {
          try {
            return JSON.parse(text);
          } catch (pe) {
            console.warn("Failed to parse JSON, cleaning up...");
            const cleaned = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleaned);
          }
        }
      } catch (modelError: any) {
        lastError = modelError;
        console.warn(`⚠️ ${modelName} failed:`, modelError?.message);
        if (modelError?.status === 404 || modelError?.message?.includes('404')) continue;
        throw modelError;
      }
    }

    throw lastError || new Error('All models failed to detect bricks');
  } catch (error: any) {
    console.error('identifyBricks failed:', error);
    return {
      items: [],
      quality: {
        advice: error?.message || 'Detection failed',
        sharpness_score: 0,
        lighting_condition: 'unknown'
      }
    };
  }
};

/**
 * Generate building ideas based on user message and vault context.
 */
export const getConversationalIdeas = async (message: string, bricks: any[] = []): Promise<{ builds: any[] }> => {
  if (!ai) throw new Error('Gemini API key not configured');

  try {
    const brickContext = bricks.length > 0 
      ? `The user has the following bricks: ${bricks.slice(0, 50).map(b => `${b.count || 1}x ${b.color || ''} ${b.name || 'Brick'}`).join(', ')}.`
      : "The user is looking for building ideas.";

    const prompt = `${brickContext}
         User asks: "${message}"
         Provide 3 creative building ideas. Return ONLY valid JSON:
         {
           "builds": [
             {
               "title": "Mini Spaceship",
               "description": "A sleek explorer using your blue and white bricks.",
               "difficulty": "Ready"
             }
           ]
         }
         Difficulty levels: "Ready" (owned all), "Almost" (missing few), "Expert" (complex).
         Return ONLY the JSON object.`;

    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError: any = null;

    for (const modelId of modelsToTry) {
      try {
        console.log(`🚀 Generating ideas with: ${modelId}`);
        const model = ai.getGenerativeModel({ model: modelId });
        const apiResponse = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await apiResponse.response;
        const text = result?.text();
        if (text) {
            try {
                return JSON.parse(text);
            } catch (e) {
                return JSON.parse(text.replace(/```json|```/g, '').trim());
            }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Ideas generation failed with ${modelId}:`, err?.message);
        if (err?.status === 404 || err?.message?.includes('404')) continue;
        throw err;
      }
    }
    throw lastError || new Error('All models failed');
  } catch (error) {
    console.error('Ideas generation failed:', error);
    return { builds: [] };
  }
};

export const generateBuildIdeas = async (message: string, bricks: any[] = []): Promise<string> => {
  const result = await getConversationalIdeas(message, bricks);
  return result.builds.map(b => `**${b.title}**\n${b.description}\n(Difficulty: ${b.difficulty})`).join('\n\n');
};
