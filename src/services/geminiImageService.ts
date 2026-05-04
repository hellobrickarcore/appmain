
console.log('--- GEMINI IMAGE SERVICE V3.0 (HARD FIX) ---');

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_BACKUP_KEY;

export async function generateIdeaImage(prompt: string) {
  const models = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image-preview"
  ];

  for (const model of models) {
    try {
      console.log(`[ImageGenerator] REQUEST: ${model}`, JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }, null, 2));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const data = await res.json();

      console.log("[ImageGenerator] RAW:", model, data);

      if (!res.ok) {
        console.error(`[ImageGenerator] ${model} FAILED:`, data);
        continue;
      }

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);

      if (!imagePart) {
        console.warn(`[ImageGenerator] ${model} - NO IMAGE PART FOUND`);
        continue;
      }

      const base64 = imagePart.inlineData.data;
      const mime = imagePart.inlineData.mimeType || "image/png";

      console.log(`[ImageGenerator] SUCCESS with ${model}`);
      return {
        ok: true,
        dataUrl: `data:${mime};base64,${base64}`
      };

    } catch (e) {
      console.error("[ImageGenerator] ERROR:", model, e);
    }
  }

  return { ok: false };
}
