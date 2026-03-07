
import { GoogleGenAI } from "@google/genai";
import { CustomPart } from "../types";

// Get API key from environment - Vite exposes VITE_ prefixed vars
const getApiKey = () => {
  // Try multiple ways to get the key
  const key = import.meta.env.VITE_GEMINI_API_KEY ||
    (import.meta.env as any).VITE_GEMINI_API_KEY ||
    '';

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔑 API Key check:', {
      found: !!key,
      length: key?.length || 0,
      preview: key ? `${key.substring(0, 10)}...` : 'NOT FOUND',
      allEnvKeys: Object.keys(import.meta.env).filter(k => k.includes('GEMINI') || k.includes('API'))
    });
  }

  return key;
};

const apiKey = getApiKey();
if (!apiKey) {
  console.error('❌ VITE_GEMINI_API_KEY not found in environment variables');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

// Only create AI instance if we have a key
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface DetectedObject {
  label: string;
  id?: string;
  confidence?: number;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1
  color?: string; // Building brick color name (e.g., "Red", "Blue", "Yellow")
  partNumber?: string; // Building brick part number (e.g., "3001", "3002")
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
      // 0.3 quality - we just need shapes and colors
      resolve(canvas.toDataURL('image/jpeg', 0.3));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const identifyBricks = async (base64Image: string, customParts: CustomPart[] = []): Promise<ScanResult> => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ENTRY', 'message': 'API call started', 'data': { imageLength: base64Image?.length || 0, hasCustomParts: customParts.length > 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
  // #endregion

  try {
    // Check if AI instance exists (means API key was loaded)
    if (!ai) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ERROR', 'message': 'AI instance not initialized', 'data': {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H6' }) }).catch(() => { });
      // #endregion
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env.local and restart the dev server.');
    }

    // Check if API key is set
    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey.length < 10) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ERROR', 'message': 'Invalid API key', 'data': { keyLength: apiKey?.length || 0, keyPreview: apiKey?.substring(0, 5) || 'none' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H6' }) }).catch(() => { });
      // #endregion
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env.local and restart the dev server.');
    }

    // Validate API key format (should start with AIza)
    if (!apiKey.startsWith('AIza')) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AIza". Get a new key at https://aistudio.google.com/app/apikey');
    }

    const optimizedBase64 = await optimizeImageForSpeed(base64Image);
    const base64Data = optimizedBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:BEFORE_API', 'message': 'Image prepared for API', 'data': { base64Length: base64Data?.length || 0, isValid: base64Data && base64Data.length >= 100 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H5' }) }).catch(() => { });
    // #endregion

    if (!base64Data || base64Data.length < 100) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ERROR', 'message': 'Invalid image data', 'data': { base64Length: base64Data?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H5' }) }).catch(() => { });
      // #endregion
      throw new Error('Invalid image data');
    }

    // Use the BEST free model for vision/image detection
    // Based on @google/genai package README, try these model names
    const modelsToTry = [
      'gemini-2.5-flash',  // Latest from README example (best for vision)
      'gemini-1.5-flash',  // Standard format
      'gemini-1.5-pro',  // Pro version
      'gemini-pro',  // Stable fallback
    ];

    let lastError: any = null;
    let successfulModel: string | null = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`🚀 Trying best vision model: ${modelName}`);

        // Use the format from @google/genai package README
        // According to README: response.text should contain the text
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:BEFORE_API_CALL', 'message': 'Before API call', 'data': { model: modelName, base64Length: base64Data.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
        console.log('📞 Calling Gemini API with model:', modelName);
        const apiResponse = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `You are an expert building brick detection AI. Your task is to detect EVERY visible building brick in this image with high accuracy.

CRITICAL: You MUST detect ALL bricks across the FULL IMAGE, even if they are partially visible, overlapping, or in different colors. This image contains many bricks (up to 50+). Be extremely thorough and detect each one individually with a precise bounding box.

Return ONLY valid JSON (no markdown, no code blocks, no explanation):

{
  "items": [
    {
      "label": "2x4 Brick",
      "color": "Blue",
      "partNumber": "3001",
      "box_2d": [0.2, 0.3, 0.6, 0.5],
      "confidence": 0.85
    },
    {
      "label": "2x2 Brick",
      "color": "Red",
      "partNumber": "3003",
      "box_2d": [0.4, 0.7, 0.65, 0.85],
      "confidence": 0.82
    }
  ],
  "quality": {
    "advice": "Good",
    "sharpness_score": 1,
    "lighting_condition": "Good"
  }
}

DETECTION REQUIREMENTS - PRIORITY ORDER:
CRITICAL: Detect in this exact order of importance:
1. DIMENSIONS (label) - MOST IMPORTANT - Must be accurate
2. COLOR - Second most important
3. MODEL NUMBER (partNumber) - Least critical, can be "Unknown"

DETAILED REQUIREMENTS:

1. box_2d: [ymin, xmin, ymax, xmax] - ALL values MUST be 0.0-1.0 (normalized coordinates)
   - ymin: top edge (0.0 = top of image, 1.0 = bottom)
   - xmin: left edge (0.0 = left of image, 1.0 = right)
   - ymax: bottom edge (MUST be > ymin, between 0.0-1.0)
   - xmax: right edge (MUST be > xmin, between 0.0-1.0)
   - Each box should tightly fit the brick (not too loose, not too tight)
   - SCAN THE FULL IMAGE: Bricks may be located at the very edges or corners. Don't skip them.

2. label (DIMENSIONS - PRIORITY #1): Format as "[width]x[length] Brick" or "[width]x[length] Plate"
   - This is THE MOST IMPORTANT field - get this right above all else
   - Examples: "2x4 Brick", "2x2 Brick", "1x4 Brick", "2x4 Plate", "1x2 Plate"
   - Count studs carefully: 2x4 means 2 studs wide, 4 studs long
   - If uncertain about dimensions, err on the side of the most common size (2x4, 2x2, 1x2)
   - DO NOT guess - if truly uncertain, use "2x4 Brick" as default (most common)

3. color (PRIORITY #2): Detect the building brick color accurately. Common colors:
   - Red, Blue, Yellow, Green, White, Black, Gray/Grey, Orange, Purple, Pink, Brown, Tan, Lime, Cyan, Magenta
   - Use "Unknown" only if color is truly unidentifiable (very rare)
   - Color is important but dimensions are MORE important - if you must choose, prioritize dimensions

4. partNumber (MODEL NUMBER - PRIORITY #3): Identify building brick part numbers when possible:
   - "3001" = 2x4 Brick, "3002" = 2x2 Brick, "3003" = 2x3 Brick
   - "3004" = 1x2 Brick, "3005" = 1x1 Brick, "3020" = 2x4 Plate
   - "3021" = 2x3 Plate, "3022" = 2x2 Plate, "3023" = 1x2 Plate
   - Use "Unknown" if part number cannot be determined - THIS IS OKAY
   - Model number is least critical - dimensions and color are more important

5. confidence: Use 0.7-0.95 for clear detections, 0.5-0.7 for uncertain ones

6. MASS SCANNING MODE: When multiple bricks are visible (10-50+):
   - Detect EVERY brick individually, even if overlapping or tightly packed.
   - Each brick gets its own entry in the items array.
   - Don't group bricks together - each needs its own bounding box.
   - Be extremely thorough - scan the entire image systematically (left-to-right, top-to-bottom).
   - Look in corners, edges, and background areas.
   - If you see 50 bricks, return 50 items. DO NOT truncate the list.

7. DETECTION ACCURACY - BE VERY AGGRESSIVE:
   - If you're 50% sure it's a brick, include it (confidence 0.5-0.6).
   - Better to have false positives than miss real bricks.
   - Lower confidence (0.5-0.7) is acceptable for uncertain detections.
   - The system will filter low-confidence detections later.
   - When in doubt, include it - accuracy and total count are more important than precision here.

8. CRITICAL: If there are clearly 30+ bricks visible, ensuring the total count is accurate is your primary goal. 

9. ONLY return empty items array if absolutely NO building bricks are visible in the image.

Return ONLY the JSON object, nothing else.`
            },
          ],
          config: {
            temperature: 0.1,
            maxOutputTokens: 2048, // Increased for mass scanning (10+ bricks)
            responseMimeType: "application/json",
          },
        });

        // According to README, response.text should work
        // But let's also handle if it's wrapped
        response = apiResponse;

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:API_SUCCESS', 'message': 'API call succeeded', 'data': { model: modelName, responseType: typeof apiResponse, hasText: !!apiResponse?.text, textLength: apiResponse?.text?.length || 0, responseKeys: apiResponse ? Object.keys(apiResponse) : [] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion

        // Log the actual response structure to debug
        console.log(`✅ Success with ${modelName}`);
        console.log('📦 API Response:', apiResponse);
        console.log('📦 Response type:', typeof apiResponse);
        console.log('📦 Response keys:', apiResponse ? Object.keys(apiResponse) : []);
        console.log('📦 Has .text?', !!apiResponse?.text);
        console.log('📦 .text value:', apiResponse?.text);
        console.log('📦 .text type:', typeof apiResponse?.text);

        // Check if response.text exists and is valid
        if (apiResponse?.text && typeof apiResponse.text === 'string' && apiResponse.text.length > 10) {
          console.log('✅ Found response.text directly (as per README)');
        } else {
          console.warn('⚠️ response.text not found or invalid, checking alternatives...');
          console.log('Full response structure:', JSON.stringify(apiResponse, null, 2).substring(0, 1000));
        }

        successfulModel = modelName;
        break; // Success! Exit loop
      } catch (modelError: any) {
        lastError = modelError;
        console.warn(`⚠️ ${modelName} failed:`, modelError?.message?.substring(0, 100));

        // If it's a 404 (model not found), try next model
        if (modelError?.status === 404 ||
          modelError?.message?.includes('404') ||
          modelError?.message?.includes('NOT_FOUND') ||
          modelError?.code === 404) {
          continue; // Try next model
        } else {
          // Other error (auth, quota, etc), but still try next if it's a model issue
          // Only throw if it's clearly an auth/quota issue
          if (modelError?.status === 401 || modelError?.status === 403 ||
            modelError?.message?.includes('API key') ||
            modelError?.message?.includes('quota')) {
            throw modelError; // Auth/quota errors should stop immediately
          }
          // Otherwise continue trying other models
          continue;
        }
      }
    }

    // If we tried all models and none worked
    if (!response || !successfulModel) {
      // Extract detailed error info
      const errorCode = lastError?.code || lastError?.status || lastError?.statusCode || 'Unknown';
      const errorMessage = lastError?.message || lastError?.toString() || 'Unknown error';
      const fullError = `Code: ${errorCode}, Message: ${errorMessage}`;

      console.error('❌ All models failed:', {
        code: errorCode,
        status: lastError?.status,
        message: errorMessage,
        fullError: lastError
      });

      throw new Error(`All models failed. ${fullError.substring(0, 150)}`);
    }

    // Handle response from @google/genai package
    // According to README: response.text should contain the text directly
    let responseText: string = '';
    let json: any = null;

    console.log('🔍 Attempting to extract text from response...');
    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : []);

    // Method 1: response.text (as per README - this should be the primary method)
    if (response?.text) {
      if (typeof response.text === 'string') {
        responseText = response.text;
        console.log('✅ Found text at response.text (as per README)');
      } else if (typeof response.text === 'function') {
        // Might be a getter method
        try {
          responseText = await response.text();
          console.log('✅ Found text via response.text() method');
        } catch (e) {
          console.warn('⚠️ response.text() failed:', e);
        }
      } else {
        console.warn('⚠️ response.text exists but is not a string or function:', typeof response.text);
      }
    }
    // Method 2: Direct string
    else if (typeof response === 'string') {
      responseText = response;
      console.log('✅ Found text as direct string');
    }
    // Method 3: response.response.text
    else if (response?.response?.text) {
      if (typeof response.response.text === 'string') {
        responseText = response.response.text;
        console.log('✅ Found text at response.response.text');
      } else if (typeof response.response.text === 'function') {
        try {
          responseText = await response.response.text();
          console.log('✅ Found text via response.response.text() method');
        } catch (e) {
          console.warn('⚠️ response.response.text() failed:', e);
        }
      }
    }
    // Method 4: Standard Gemini API structure: response.candidates[0].content.parts[0].text
    else if (response?.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
        for (const part of candidate.content.parts) {
          if (part?.text && typeof part.text === 'string') {
            responseText = part.text;
            console.log('✅ Found text at response.candidates[0].content.parts[].text');
            break;
          }
        }
      }
    }
    // Method 5: response.content.parts[0].text
    else if (response?.content?.parts && Array.isArray(response.content.parts)) {
      for (const part of response.content.parts) {
        if (part?.text && typeof part.text === 'string') {
          responseText = part.text;
          console.log('✅ Found text at response.content.parts[].text');
          break;
        }
      }
    }
    // Method 6: Check if response itself is the text (unlikely but possible)
    else if (response && typeof response === 'object') {
      // Try to find any text property recursively
      const findText = (obj: any, depth = 0): string | null => {
        if (depth > 3) return null; // Prevent infinite recursion
        if (typeof obj === 'string' && obj.length > 10) return obj;
        if (typeof obj !== 'object' || obj === null) return null;

        for (const key in obj) {
          if (key === 'text' && typeof obj[key] === 'string' && obj[key].length > 10) {
            return obj[key];
          }
          const found = findText(obj[key], depth + 1);
          if (found) return found;
        }
        return null;
      };

      const found = findText(response);
      if (found) {
        responseText = found;
        console.log('✅ Found text recursively in response object');
      }
    }

    // Last resort: stringify and try to extract JSON
    if (!responseText || responseText.length < 10) {
      console.warn('⚠️ Could not find text in response, trying to extract JSON from stringified response');
      const stringified = JSON.stringify(response);
      console.log('Stringified response (first 500 chars):', stringified.substring(0, 500));

      // Try to extract JSON from the string
      const jsonMatch = stringified.match(/\{[\s\S]{20,}\}/);
      if (jsonMatch) {
        try {
          json = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON from stringified response');
          // If we got JSON directly, skip text extraction
          if (json && typeof json === 'object') {
            responseText = JSON.stringify(json);
          }
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }
    }

    if (!responseText || responseText.length < 10) {
      console.error('❌ No valid response text found after all attempts');
      console.error('Full response:', JSON.stringify(response, null, 2));

      // Create a detailed error message for mobile users
      const responseKeys = response ? Object.keys(response).join(', ') : 'none';
      const responseType = typeof response;
      const errorDetails = `Response type: ${responseType}, Keys: ${responseKeys}`;

      return {
        items: [],
        quality: {
          advice: `API Response Error: No text found. ${errorDetails.substring(0, 80)}`,
          sharpness_score: 0,
          lighting_condition: 'unknown'
        }
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:RESPONSE_TEXT', 'message': 'Extracted response text', 'data': { textLength: responseText?.length || 0, textPreview: responseText?.substring(0, 200) || 'none' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H2' }) }).catch(() => { });
    // #endregion

    console.log('📥 Extracted response text (first 300 chars):', responseText.substring(0, 300));

    // Remove markdown code blocks if present
    let cleanedText = responseText;
    if (cleanedText.includes('```')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    // Parse the JSON response
    try {
      // Try parsing as-is first
      json = JSON.parse(cleanedText);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:JSON_PARSE_SUCCESS', 'message': 'JSON parsed successfully', 'data': { hasItems: !!json?.items, itemsIsArray: Array.isArray(json?.items), itemsLength: json?.items?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H2' }) }).catch(() => { });
      // #endregion
    } catch (parseError) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:JSON_PARSE_ERROR', 'message': 'JSON parse failed', 'data': { error: String(parseError), cleanedTextPreview: cleanedText?.substring(0, 200) || 'none' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H2' }) }).catch(() => { });
      // #endregion
      console.warn("Direct parse failed, trying to extract JSON from text");

      // Try to extract JSON object from text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          json = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e);
          console.error("Text that failed:", cleanedText.substring(0, 500));
        }
      }

      // If still no JSON, check if response is already an object
      if (!json && typeof response === 'object') {
        json = response;
      }
    }

    // If we still don't have valid JSON, return empty result
    if (!json || typeof json !== 'object') {
      console.warn("Could not parse response as JSON, returning empty result");
      return {
        items: [],
        quality: {
          advice: 'Could not parse API response',
          sharpness_score: 0,
          lighting_condition: 'unknown'
        }
      };
    }

    // Validate and normalize response structure
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:BEFORE_VALIDATION', 'message': 'Before items validation', 'data': { hasItems: !!json?.items, itemsIsArray: Array.isArray(json?.items), itemsLength: json?.items?.length || 0, jsonKeys: json ? Object.keys(json) : [] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
    // #endregion

    if (!json.items || !Array.isArray(json.items)) {
      console.warn("Response doesn't have items array, structure:", json);

      // Try to extract items from different possible structures
      if (json.detections && Array.isArray(json.detections)) {
        json.items = json.detections;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ITEMS_FROM_DETECTIONS', 'message': 'Found items in detections', 'data': { itemsLength: json.items.length, items: json.items.map((i: any) => ({ label: i.label, hasBox2d: !!i.box_2d })) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
        console.log('✅ Found', json.items.length, 'items in detections array');
      } else if (json.bricks && Array.isArray(json.bricks)) {
        json.items = json.bricks.map((b: any) => ({
          label: b.type || b.name || 'Brick',
          box_2d: b.box_2d || [0, 0, 1, 1],
          confidence: b.confidence || 0.8
        }));
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ITEMS_FROM_BRICKS', 'message': 'Found items in bricks', 'data': { itemsLength: json.items.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
      } else {
        json.items = [];
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:NO_ITEMS', 'message': 'No items found in response', 'data': { jsonStructure: JSON.stringify(json).substring(0, 300) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:BEFORE_COORD_VALIDATION', 'message': 'Before coordinate validation', 'data': { itemsLength: json.items.length, items: json.items.map((i: any) => ({ hasBox2d: !!i.box_2d, box2d: i.box_2d })) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3' }) }).catch(() => { });
    // #endregion

    // Validate and fix box_2d coordinates
    const itemsBeforeValidation = json.items.length;
    json.items = json.items.map((item: any) => {
      if (!item.box_2d || !Array.isArray(item.box_2d) || item.box_2d.length !== 4) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:INVALID_BOX2D', 'message': 'Invalid box_2d format', 'data': { item: JSON.stringify(item).substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3' }) }).catch(() => { });
        // #endregion
        console.warn('Invalid box_2d format, skipping item:', item);
        return null;
      }

      let [ymin, xmin, ymax, xmax] = item.box_2d;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:COORD_BEFORE', 'message': 'Coordinates before normalization', 'data': { ymin, xmin, ymax, xmax, isNormalized: xmax <= 1 && ymax <= 1 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3' }) }).catch(() => { });
      // #endregion

      // Normalize coordinates if they're in pixel format (> 1.0)
      if (xmax > 1.0 || ymax > 1.0) {
        // Assume coordinates are in pixels, normalize to 0-1
        // We need image dimensions - use a reasonable default (640x480) or detect from response
        const assumedWidth = 1000; // Default assumption
        const assumedHeight = 1000;

        ymin = ymin / assumedHeight;
        xmin = xmin / assumedWidth;
        ymax = ymax / assumedHeight;
        xmax = xmax / assumedWidth;

        console.log('Normalized pixel coordinates to 0-1 range');
      }

      // Validate normalized coordinates
      if (ymin < 0 || xmin < 0 || ymax > 1 || xmax > 1 || ymin >= ymax || xmin >= xmax) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:COORD_INVALID', 'message': 'Invalid coordinates, fixing', 'data': { ymin, xmin, ymax, xmax, beforeFix: item.box_2d }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3' }) }).catch(() => { });
        // #endregion
        console.warn('Invalid normalized coordinates, fixing:', item.box_2d);
        // Clamp to valid range
        ymin = Math.max(0, Math.min(1, ymin));
        xmin = Math.max(0, Math.min(1, xmin));
        ymax = Math.max(ymin + 0.01, Math.min(1, ymax));
        xmax = Math.max(xmin + 0.01, Math.min(1, xmax));
      }

      const finalItem = {
        ...item,
        box_2d: [ymin, xmin, ymax, xmax],
        confidence: item.confidence || 0.5,
        color: item.color || 'Unknown',
        partNumber: item.partNumber || 'Unknown'
      };
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:COORD_AFTER', 'message': 'Coordinates after normalization', 'data': { ymin, xmin, ymax, xmax, label: item.label }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3' }) }).catch(() => { });
      // #endregion
      return finalItem;
    }).filter((item: any) => item !== null); // Remove null items

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:AFTER_VALIDATION', 'message': 'After coordinate validation', 'data': { itemsBefore: itemsBeforeValidation, itemsAfter: json.items.length, items: json.items.map((i: any) => ({ label: i.label, box2d: i.box_2d, confidence: i.confidence })) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H7' }) }).catch(() => { });
    // #endregion

    console.log('✅ Final items after validation:', json.items.length);
    console.log('📦 Items:', json.items.map((i: any) => ({
      label: i.label,
      box_2d: i.box_2d,
      color: i.color,
      partNumber: i.partNumber,
      confidence: i.confidence
    })));

    // Ensure quality object exists
    if (!json.quality) {
      json.quality = {
        sharpness_score: 0,
        lighting_condition: 'unknown',
        advice: 'Good'
      };
    }

    // Log final result
    console.log('✅ Final parsed response:', {
      itemsCount: json.items?.length || 0,
      items: json.items,
      hasQuality: !!json.quality,
      quality: json.quality
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:RETURN', 'message': 'Returning result', 'data': { itemsCount: json.items?.length || 0, items: json.items, hasQuality: !!json.quality }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
    // #endregion

    return json;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'geminiService.ts:identifyBricks:ERROR', 'message': 'API call failed', 'data': { error: String(error), errorMessage: error?.message, errorStatus: error?.status }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H6' }) }).catch(() => { });
    // #endregion
    console.error("Gemini Robotics analysis failed:", error);

    // Provide more specific error messages
    let errorMessage = 'Error';
    if (error?.message?.includes('API key') || error?.message?.includes('401') || error?.message?.includes('403')) {
      errorMessage = 'Invalid API key. Check .env.local';
    } else if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      errorMessage = 'API quota exceeded';
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorMessage = 'Network error';
    } else if (error?.message) {
      errorMessage = error.message.substring(0, 50);
    }

    return {
      items: [],
      quality: {
        advice: errorMessage,
        sharpness_score: 0,
        lighting_condition: 'unknown'
      }
    };
  }
};
