import { CAPTURE_PIPELINE_LOCKED } from './lockState';
import { detectBricks, generationFallbackLabel } from '../services/brickDetectionService';
import { colorService } from '../services/colorService';

export interface CapturePipelineResult {
  capturedImage: string;
  detectedBricks: any[];
}

/**
 * 🔒 CAPTURE PIPELINE CORE
 * Restored working implementation of HelloBrick-style capture scanning.
 * takes high resolution snapshot, runs tiled mass_capture inference, generates thumbnails.
 */
export const executeCapturePipeline = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  liveBricks: any[] = []
): Promise<CapturePipelineResult> => {
  if (!CAPTURE_PIPELINE_LOCKED) {
    console.warn("CAPTURE PIPELINE IS UNLOCKED. THIS RISKS REGRESSION!");
  }

  // Holistic Analysis using 'mass_capture' mode for high recall 
  const response = await detectBricks(video, {
    mode: 'mass_capture',
    imgsz: 1024,
    sessionId: `capture_${Date.now()}`
  });

  // Capture static frame for results display
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(video, 0, 0);
  
  const capturedImage = canvas.toDataURL('image/jpeg', 0.9);

  const rawDetections = response.detections
    .filter(d => d.prediction.identityConfidence > 0.25)
    .map(d => ({
      id: d.detectionId,
      name: d.prediction.brickName,
      color: d.prediction.brickColorName,
      family: d.prediction.brickFamily,
      dimensions: d.prediction.dimensionsLabel,
      confidence: d.prediction.identityConfidence,
      selected: d.labelDisplayStatus === 'confirmed' || d.prediction.identityConfidence > 0.4,
      box: d.geometry.bbox,
      displayText: d.compactLabel || generationFallbackLabel(d),
      sourceRes: { width: response.frameWidth, height: response.frameHeight }
    }));

  // MERGE LOGIC: Preserve everything seen in Live mode 
  // Filter liveBricks for confidence too, in case stale ones are low conf
  const mergedBricks = [...liveBricks.filter(lb => (lb.confidence || 0) > 0.25)];

  // Only add raw detections if they don't significantly overlap with live ones
  rawDetections.forEach(rd => {
    const alreadyExists = mergedBricks.some(lb => {
      if (!lb.box || !rd.box) return false;
      const lbCX = (lb.box.xMin + lb.box.xMax) / 2;
      const lbCY = (lb.box.yMin + lb.box.yMax) / 2;
      const rdCX = (rd.box.xMin + rd.box.xMax) / 2;
      const rdCY = (rd.box.yMin + rd.box.yMax) / 2;
      const dist = Math.sqrt(Math.pow(lbCX - rdCX, 2) + Math.pow(lbCY - rdCY, 2));
      return dist < 45; // slightly wider overlap check
    });
    if (!alreadyExists) mergedBricks.push(rd);
  });

  // Generate Review Cards / Cropped Thumbnails
  const bricksWithCrops = await Promise.all(mergedBricks.map(async (brick: any) => {
    if (!brick.box) return brick;

    const cropCanvas = document.createElement('canvas');
    const box = brick.box;
    const width = box.xMax - box.xMin;
    const height = box.yMax - box.yMin;
    const padding = Math.max(width, height) * 0.15;
    const sx = Math.max(0, box.xMin - padding);
    const sy = Math.max(0, box.yMin - padding);
    const sw = Math.min(canvas.width - sx, width + padding * 2);
    const sh = Math.min(canvas.height - sy, height + padding * 2);

    cropCanvas.width = 120; cropCanvas.height = 120;
    const cropCtx = cropCanvas.getContext('2d');
    if (cropCtx) {
      cropCtx.fillStyle = '#0f172a';
      cropCtx.fillRect(0, 0, 120, 120);
      cropCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 120, 120);
    }

    if (ctx) {
      const colorResult = colorService.estimateColor(ctx, sx, sy, sw, sh);
      return {
        ...brick,
        thumbnail: cropCanvas.toDataURL('image/jpeg', 0.8),
        color: colorResult.name,
        color_hex: colorResult.hex,
        displayText: `${colorResult.name} ${brick.name || 'Brick'}`
      };
    }
    return brick;
  }));

  return { capturedImage, detectedBricks: bricksWithCrops };
};
