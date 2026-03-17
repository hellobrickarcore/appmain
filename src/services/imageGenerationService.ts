console.log('--- IMAGE SERVICE V1.0.9 ACTIVE ---');

/**
 * Image Generation Service
 * Switches from text-only placeholders to real AI-generated illustrations 
 * using Pollinations.ai (Flux model) to provide high-quality LEGO builds.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const generateIdeaImage = async (prompt: string): Promise<string> => {
    try {
        if (!GEMINI_API_KEY) {
            console.error('[ImageGenerator] 🛑 Missing API Key');
            return '';
        }

        console.log('[ImageGenerator] 🎨 Requesting Gemini Imagen illustration for:', prompt.substring(0, 50));
        
        // Refine prompt for elite AI generation
        const styleSuffix = ", authentic LEGO brick build, toy photography, professional studio lighting, 8k, ultra-detailed, 3d render style, vibrant colors, isolated on clean background";
        const finalPrompt = prompt + styleSuffix;
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: finalPrompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1",
                        outputMimeType: "image/jpeg"
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[ImageGenerator] 🛑 API Error:', error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

        if (!base64Image) {
            console.error('[ImageGenerator] 🛑 No image data in response');
            return '';
        }

        return `data:image/jpeg;base64,${base64Image}`;
        
    } catch (error) {
        console.error('[ImageGenerator] 🛑 Generation failed:', error);
        return '';
    }
};
