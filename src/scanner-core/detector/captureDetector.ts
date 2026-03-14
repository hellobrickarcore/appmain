import { detectBricks } from './detectorManager';
import { colorService } from '../../services/colorService';
import { calculateIOU } from '../../utils/coordinateMapping';

export interface CapturePipelineResult {
  capturedImage: string;
  detectedBricks: any[];
}

export const VISION_PIPELINE_LOCKED = true;

/**
 * 🔒 CAPTURE DETECTOR (DENSE ATTRIBUTE ESTIMATION)
 * High Accuracy Pipeline.
 * 
 * Rules:
 * 1. Resolution is set to 1024px+ for maximum detail on small bricks.
 * 2. `mode: 'mass_capture'` instructs the backend to run tiled inference (SAHI style)
 *    and execute heavy OpenCV contouring and LAB color sampling per brick.
 * 3. High confidence threshold required to pass to review phase.
 */
export const runCaptureInference = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  liveBricks: any[],
  options: {
    sessionId: string;
    signal?: AbortSignal;
  }
): Promise<CapturePipelineResult> => {
  
  // 1. DENSE BACKEND INFERENCE
  const response = await detectBricks(video, {
    mode: 'mass_capture',
    imgsz: 768,
    sessionId: options.sessionId,
    signal: options.signal
  });

  // 2. CAPTURE HIGH RES FRAME
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(video, 0, 0);
  
  const capturedImage = canvas.toDataURL('image/jpeg', 0.9);

  console.log(`[ScannerCore:Capture] Backend returned ${response.detections?.length || 0} raw detections.`);

  // 3. FILTER RESULTS (High Threshold)
  const rawDetections = response.detections
    .filter((d: any) => d.prediction.identityConfidence > 0.15) // Lowered from 0.25 to improve yield
    .map((d: any) => ({
      id: d.detectionId,
      name: d.prediction.brickName,
      color: d.prediction.brickColorName,
      family: d.prediction.brickFamily,
      dimensions: d.prediction.dimensionsLabel,
      confidence: d.prediction.identityConfidence,
      selected: d.labelDisplayStatus === 'confirmed' || d.prediction.identityConfidence > 0.4,
      box: d.geometry.bbox,
      displayText: d.compactLabel || 'Unknown Brick',
      sourceRes: { width: response.frameWidth, height: response.frameHeight }
    }));

  // 4. MERGE WITH LIVE TRACKS (LIVE-SEEDED ARCHITECTURE)
  // seededTracks = live tracks that are locked and stable
  const bricksMap = new Map<string, any>();
  
  // Rule: Live tracks are the primary anchor.
  liveBricks.forEach(lb => {
    if ((lb.confidence || 0) > 0.15) {
      bricksMap.set(lb.id, { 
        ...lb, 
        seed: true, 
        matchFound: false,
        source: 'live'
      });
    }
  });

  rawDetections.forEach((rd: any) => {
    let matchId: string | null = null;
    let bestIou = 0;

    for (const [id, seed] of bricksMap.entries()) {
      if (!seed.box || !rd.box) continue;
      
      const iou = calculateIOU(seed.box, rd.box);
      // Precision matching: 0.45 threshold
      if (iou > 0.45 && iou > bestIou) {
        bestIou = iou;
        matchId = id;
      }
    }

    if (matchId) {
      const existing = bricksMap.get(matchId);
      // Seed Verification: Update existing seed with high-res attributes
      // Rule: Lane 2 (Deep Capture) identity is usually more accurate due to higher resolution
      bricksMap.set(matchId, {
        ...existing,
        ...rd,
        id: matchId, 
        matchFound: true,
        source: 'merged',
        // Boost confidence if both agree, but favor Lane 2's prediction if high-res
        confidence: Math.max(existing.confidence, rd.confidence) * 1.15
      });
    } else if (rd.confidence > 0.55) {
      // Rule: New detection only allowed if reasonably high confidence
      console.log(`[Narrator:Capture] Discovery: High-confidence brick ${rd.name} found in capture that live scan missed.`);
      bricksMap.set(rd.id, {
        ...rd,
        source: 'discovery'
      });
    }
  });

  // 5. SIMPLE SCENE SAFETY RULES (Priority 9)
  const isSimpleScene = liveBricks.length <= 4;
  
  const mergedBricks = Array.from(bricksMap.values()).filter(b => {
    // Rule: Always keep merged tracks (live verified by capture)
    if (b.source === 'merged') return true;
    
    // Rule: Live tracks that didn't match are kept if confidence is sufficient
    if (b.source === 'live') return b.confidence > 0.5;

    // Rule: Discoveries (capture-only) are heavily restricted in simple scenes
    if (b.source === 'discovery') {
      if (isSimpleScene) {
        // Only allow 1 extra if super high confidence
        const discoveries = Array.from(bricksMap.values()).filter(x => x.source === 'discovery');
        const sortedDiscoveries = discoveries.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        return b.id === sortedDiscoveries[0]?.id && b.confidence > 0.85;
      }
      return b.confidence > 0.55; // Standard discovery threshold for complex scenes
    }
    
    return false;
  });

  console.log(`[ScannerCore:Capture] Unified ${mergedBricks.length} bricks (Scene: ${isSimpleScene ? 'Simple' : 'Complex'})`);

  // 5. CLIENT SIDE CROPS & FALLBACKS
  const bricksWithCrops = await Promise.all(mergedBricks.map(async (brick: any, idx) => {
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

    // Exposure-aware sampling: sample closer to the center of the brick to avoid edge highlights/background
    const corePaddingW = sw * 0.2;
    const corePaddingH = sh * 0.2;
    const coreSx = sx + corePaddingW;
    const coreSy = sy + corePaddingH;
    const coreSw = Math.max(1, sw - corePaddingW * 2);
    const coreSh = Math.max(1, sh - corePaddingH * 2);

    // Client-side color as a backup if backend returned Unknown
    if (ctx && brick.color === 'Unknown') {
      const colorResult = colorService.estimateColor(ctx, coreSx, coreSy, coreSw, coreSh);
      return {
        ...brick,
        thumbnail: cropCanvas.toDataURL('image/jpeg', 0.8),
        color: colorResult.name,
        color_hex: colorResult.hex,
        displayText: `${colorResult.name} ${brick.name || 'Brick'}`
      };
    }
    
    // Attributes are already merged into 'brick' from 'rd' during merge phase
    const isConfirmed = brick.labelDisplayStatus === 'confirmed' || (brick.confidence || 0) > 0.4;
    
    return {
       ...brick,
       id: brick.id || `brick_${idx}_${Date.now()}`,
       selected: isConfirmed,
       labelDisplayStatus: isConfirmed ? 'confirmed' : 'tentative',
       thumbnail: cropCanvas.toDataURL('image/jpeg', 0.8)
    };
  }));

  return { capturedImage, detectedBricks: bricksWithCrops };
};
