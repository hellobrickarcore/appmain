console.log('--- IMAGE SERVICE V2.2 ACTIVE ---');

/**
 * Image Generation Service
 * Switches from text-only placeholders to real AI-generated illustrations 
 * using Pollinations.ai (Flux model) to provide high-quality LEGO builds.
 */

const getAllKeys = () => {
    return [
        import.meta.env.VITE_GEMINI_IMAGE_KEY,
        import.meta.env.VITE_GEMINI_BACKUP_KEY,
        import.meta.env.VITE_GEMINI_API_KEY
    ].filter(Boolean);
};

export const generateIdeaImage = async (prompt: string): Promise<string> => {
    const keys = getAllKeys();
    if (keys.length === 0) {
        console.error('[ImageGenerator] 🛑 No API Keys found');
        return '';
    }

    // Try each key sequentially if we hit a 403 (leaked/blocked) or other retryable error
    for (let i = 0; i < keys.length; i++) {
        const apiKey = keys[i];
        try {
            console.log(`[ImageGenerator] 🎨 Requesting illustration (Key ${i + 1}/${keys.length}):`, prompt.substring(0, 50));
            
            const styleSuffix = ", authentic LEGO brick build, toy photography, professional studio lighting, 8k, ultra-detailed, 3d render style, vibrant colors, isolated on clean background";
            const finalPrompt = prompt + styleSuffix;
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
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
                const error = await response.json().catch(() => ({}));
                const isLeaked = error.error?.message?.includes('leaked') || response.status === 403;
                
                console.warn(`[ImageGenerator] ⚠️ Key ${i + 1} failed (${response.status}):`, error.error?.message);
                
                if (isLeaked && i < keys.length - 1) {
                    console.log('[ImageGenerator] 🔄 Key leaked, rotating to next key...');
                    continue; // Try next key
                }
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

            if (!base64Image) {
                console.error('[ImageGenerator] 🛑 No image data in response');
                return '';
            }

            return `data:image/jpeg;base64,${base64Image}`;
            
        } catch (error) {
            console.error(`[ImageGenerator] 🛑 Attempt ${i + 1} failed:`, error);
            if (i === keys.length - 1) return '';
        }
    }
    return '';
};
