// cloudVisionService.ts
// Uses Google Cloud Vision REST API directly (Gemini key is billing-blocked, Cloud Vision works).

export interface CloudVisionResult {
  fullText: string;
  entities: string[];
  bestMatch: string;
  isJapanese: boolean;
  pagesWithMatchingImages: string[];
}

// Minimum score for web entities to be considered useful
const MIN_ENTITY_SCORE = 0.35;

export const extractTextWithCloudVision = async (
  canvas: HTMLCanvasElement,
  apiKey: string
): Promise<CloudVisionResult | null> => {
  try {
    // Fast downscale for high-speed upload (640px is optimal for OCR and reduces network payload to ~35KB)
    let sendCanvas = canvas;
    const maxDim = 640;
    if (canvas.width > maxDim || canvas.height > maxDim) {
      const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height);
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = Math.round(canvas.width * scale);
      scaledCanvas.height = Math.round(canvas.height * scale);
      const sCtx = scaledCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        sendCanvas = scaledCanvas;
      }
    }

    const base64Data = sendCanvas.toDataURL('image/jpeg', 0.72).split(',')[1];
    if (!base64Data) return null;

    const payload = {
      requests: [
        {
          image: { content: base64Data },
          features: [
            // DOCUMENT_TEXT_DETECTION handles multi-language perfectly
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
            // WEB_DETECTION reverse image-searches
            { type: 'WEB_DETECTION', maxResults: 8 },
          ],
          imageContext: {
            languageHints: ['en', 'ja', 'ko', 'zh-TW', 'zh-CN'],
          }
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const res = data.responses?.[0];
    if (!res) return null;

    // Full OCR text
    const fullText: string = res.fullTextAnnotation?.text || res.textAnnotations?.[0]?.description || '';

    // Web entities (English labels from Google's Knowledge Graph)
    const rawEntities: string[] = (res.webDetection?.webEntities || [])
      .filter((e: any) => e.score > MIN_ENTITY_SCORE && e.description)
      .map((e: any) => e.description as string);

    // Best guess label — most accurate single descriptor (e.g. "Alakazam Pokémon card")
    const bestGuess: string = res.webDetection?.bestGuessLabels?.[0]?.label || '';

    // Detect Asian language characters
    const jpKorChineseCount = (fullText.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\uac00-\ud7af]/g) || []).length;
    const isJapanese = jpKorChineseCount > 2;

    // Filter out useless generic single-word labels like "darkness", "text", "paper", etc.
    const GENERIC_LABELS = new Set([
      'darkness', 'text', 'paper', 'font', 'black', 'white', 'rectangle', 'square', 'line'
    ]);
    const cleanBestGuess = (bestGuess && !GENERIC_LABELS.has(bestGuess.toLowerCase().trim())) ? bestGuess : '';

    // Extract first clean OCR line (the ground truth text on the physical card/box)
    const ocrLines = fullText.split('\n').map(l => l.trim()).filter(l => l.length >= 2 && !GENERIC_LABELS.has(l.toLowerCase()));
    const firstOcrLine = ocrLines[0] || '';

    // Ground truth: Use OCR text first if present, otherwise clean specific bestGuess / entities
    const bestMatch = firstOcrLine || cleanBestGuess || (rawEntities.find(e => !GENERIC_LABELS.has(e.toLowerCase())) || '') || rawEntities[0] || '';

    // Only return null if the camera saw absolutely nothing (blank screen / completely dark)
    if (!fullText && !bestMatch && rawEntities.length === 0) return null;

    return {
      fullText,
      entities: rawEntities,
      bestMatch: bestMatch || fullText.slice(0, 30),
      isJapanese,
      pagesWithMatchingImages: []
    };
  } catch {
    return null;
  }
};
