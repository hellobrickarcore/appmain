export interface CloudVisionResult {
  fullText: string;
  entities: string[];
  bestMatch: string;
}

export const extractTextWithCloudVision = async (canvas: HTMLCanvasElement, apiKey: string): Promise<CloudVisionResult | null> => {
  try {
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    if (!base64Data) return null;

    const payload = {
      requests: [
        {
          image: { content: base64Data },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 2 }, // Gets English and Japanese text
            { type: 'WEB_DETECTION', maxResults: 5 }   // Reverse-image searches the art!
          ]
        }
      ]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Cloud Vision API Error: ${response.status}`);

    const data = await response.json();
    const res = data.responses?.[0];
    if (!res) return null;

    // 1. Extract raw OCR text (Handles Japanese characters perfectly)
    const fullText = res.textAnnotations?.[0]?.description || '';
    
    // 2. Extract Web Entities (Google's Knowledge Graph - often returns the English canonical name of the card even if the text is Japanese!)
    const entities = res.webDetection?.webEntities?.map((e: any) => e.description).filter(Boolean) || [];
    
    // 3. Extract Best Guess Label (What Google Lens thinks the image is)
    const bestMatch = res.webDetection?.bestGuessLabels?.[0]?.label || entities[0] || fullText.slice(0, 20);

    console.log('[CloudVision] Text:', fullText.replace(/\n/g, ' '));
    console.log('[CloudVision] Entities:', entities.join(', '));
    console.log('[CloudVision] Best Match:', bestMatch);

    return { fullText, entities, bestMatch };
  } catch (error) {
    console.error('Cloud Vision Error:', error);
    return null;
  }
};
