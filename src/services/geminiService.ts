import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Use current version of GoogleGenerativeAI
const getAIInstance = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};

// NITRO MODE: 512px for better quality than 256px but still fast
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
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const identifyBricks = async (base64Image: string): Promise<ScanResult> => {
  try {
    const ai = getAIInstance();
    if (!ai) throw new Error('Gemini API key not configured.');

    const optimizedBase64 = await optimizeImageForSpeed(base64Image);
    const base64Data = optimizedBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    if (!base64Data || base64Data.length < 100) {
      throw new Error('Invalid image data');
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
              text: `Detect building bricks in this image. Return ONLY JSON: {"items": [{"label": "2x4 Brick", "color": "Red", "partNumber": "3001", "box_2d": [y, x, y, x], "confidence": 0.9}], "quality": {"advice": "Good", "sharpness_score": 1, "lighting_condition": "Good"}}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = await apiResponse.response;
    const text = result.text();
    return JSON.parse(text);
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

export const getConversationalIdeas = async (message: string, bricks: any[] = []): Promise<{ builds: any[] }> => {
  const ai = getAIInstance();
  if (!ai) throw new Error('Gemini API key not configured');

  try {
    const brickContext = bricks.length > 0 
      ? `Bricks: ${bricks.slice(0, 50).map(b => `${b.count || 1}x ${b.color || ''} ${b.name || 'Brick'}`).join(', ')}.`
      : "The user is looking for building ideas.";

    const prompt = `${brickContext}
         User asks: "${message}"
         Provide 3 ideas. Even if the user has few bricks or many duplicates, be EXTREMELY creative. 
         Suggest abstract sculptures, micro-scale dioramas, or mosaic patterns. 
         LEGO is about imagination - NEVER say you can't find ideas or that there are "no ideas". 
         Be poetic and visionary.
         Return ONLY JSON:
         {
           "builds": [
             {
               "title": "Cosmic Fragment",
               "description": "An abstract sculpture representing space using your specific part shapes.",
               "difficulty": "Ready"
             }
           ]
         }`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const apiResponse = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await apiResponse.response;
    const text = result.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Ideas generation failed:', error);
    return { builds: [] };
  }
};

export const generateBuildIdeas = async (message: string, bricks: any[] = []): Promise<string> => {
  const result = await getConversationalIdeas(message, bricks);
  if (!result.builds || result.builds.length === 0) {
    return "**The Infinite Totem**\nAn abstract tower that grows with every brick you find. Start with a stable base and stack your colors in a spiral pattern to create a DNA-like structure of your creativity.\n(Difficulty: Beginner)";
  }
  return result.builds.map(b => `**${b.title}**\n${b.description}\n(Difficulty: ${b.difficulty})`).join('\n\n');
};
