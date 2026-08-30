import { TextRecognition } from '@capacitor-mlkit/text-recognition';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const extractTextFromImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    if (!base64Data) return '';
    
    const fileName = `ocr_temp_${Date.now()}.jpg`;
    
    // Save frame to a temporary file natively
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache
    });
    
    // Process image using Apple ML Kit natively (Instant & Offline)
    const savedFile = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
    
    // Run the ML Kit OCR
    const result = await TextRecognition.processImage({
      path: savedFile.uri
    });
    
    // Clean up cache
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache
    });
    
    console.log('[OCR] Native MLKit Result:', result.text.slice(0, 100));
    return result.text;
  } catch (error) {
    console.error('Native MLKit Error:', error);
    return '';
  }
};
