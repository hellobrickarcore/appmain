console.log('--- IMAGE SERVICE V3.1 (POLLINATIONS FIX) ---');

export async function generateIdeaImage(prompt: string) {
  try {
    // Gemini 1.5 flash doesn't output images via standard endpoints on its own.
    // Using Pollinations AI for reliable, free AI image generation for previews.
    
    // Add seed and stylistic markers for Lego
    const safePrompt = encodeURIComponent(`A high quality photo of a custom LEGO build: ${prompt}. Studio lighting, isolated on clean background no people.`);
    const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    
    // Return URL directly — img tag handles loading on native iOS
    // (fetch() on native can be blocked by ATS/CORS, but img src is always fine)
    return {
      ok: true,
      dataUrl: url
    };

  } catch (e) {
    console.error("[ImageGenerator] ERROR:", e);
    return { ok: false };
  }
}
