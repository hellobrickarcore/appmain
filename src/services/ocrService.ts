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
    const worker = await Tesseract.createWorker('eng');
    const ret = await worker.recognize(canvas);
    await worker.terminate();
    return ret.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
};
