export const extractTextFromImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    if (!(window as any).Tesseract) {
      // Load script dynamically
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const Tesseract = (window as any).Tesseract;
    console.log('[OCR] Initializing Tesseract worker (this may take a few seconds)...');
    const worker = await Tesseract.createWorker('eng');
    console.log('[OCR] Worker initialized, recognizing canvas...');
    const ret = await worker.recognize(canvas);
    await worker.terminate();
    console.log('[OCR] Recognized text:', ret.data.text.slice(0, 50) + '...');
    return ret.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
};
