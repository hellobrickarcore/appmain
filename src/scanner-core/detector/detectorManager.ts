import { FrameDetection, ScanFrameResponse, TrackedObject } from '../../types/detection';
import { calculateIOU } from '../../utils/coordinateMapping';
import { ScannerError } from './detectorTypes';
import { fetchDetectorBackend, LoaderDiagnostic } from './detectorLoader';

/**
 * Helper to build the strict ScannerError object
 */
const createScannerError = (
  stage: ScannerError['stage'],
  originalError: any,
  context: Partial<ScannerError> = {},
  diagnostic?: LoaderDiagnostic
): ScannerError => {
  const message = originalError instanceof Error ? originalError.message : String(originalError);
  const stack = originalError instanceof Error ? originalError.stack : undefined;
  
  return {
    stage,
    message: message === '[object Object]' ? 'Unknown Error (dict)' : message,
    stack,
    status: context.status,
    responseText: context.responseText,
    detectorReady: context.detectorReady ?? true,
    cameraReady: context.cameraReady ?? true,
    frameIndex: context.frameIndex,
    ts: Date.now(),
    loaderType: diagnostic?.loaderType,
    source: diagnostic?.source,
    expectedFormat: diagnostic?.expectedFormat,
    actualFormat: diagnostic?.actualFormat
  };
};

/**
 * 🔒 DETECTOR MANAGER API
 * The only approved way to communicate with the YOLO backend inside the scanner-core.
 * Guarantees structured error returns.
 */
export const detectBricks = async (
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | File | string,
  options: {
    sessionId?: string;
    frameIndex?: number;
    mode?: 'mass_capture' | 'live_scanner';
    imgsz?: number;
    debugMode?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<ScanFrameResponse> => {
  const { sessionId = 'session_manual', frameIndex = 0, mode = 'live_scanner', imgsz, signal } = options;
  const stage = mode === 'live_scanner' ? (frameIndex === 0 && sessionId === 'warmup' ? 'warmup' : 'detect') : 'capture';

  try {
    let canvas: HTMLCanvasElement;
    if (image instanceof HTMLCanvasElement) {
      canvas = image;
    } else if (image instanceof HTMLVideoElement) {
      if (image.readyState < 2 || image.videoWidth === 0) {
        throw new Error(`Video not ready (readyState: ${image.readyState}, dimensions: ${image.videoWidth}x${image.videoHeight})`);
      }
      const videoCanvas = document.createElement('canvas');
      console.log(`[ScannerCore:Detector] Drawing video frame: ${image.videoWidth}x${image.videoHeight}`);
      videoCanvas.width = image.videoWidth;
      videoCanvas.height = image.videoHeight;
      const ctx = videoCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(image, 0, 0);
      canvas = videoCanvas;
    } else {
      console.warn(`[ScannerCore:Detector] Unexpected image type: ${typeof image}`);
      throw new Error('Unsupported image type in scanner-core detectBricks');
    }

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    const MAX_DIM = 1600; // Unify to high-res for better accuracy even in live mode
    let processedCanvas = canvas;
    let scaleX = 1;
    let scaleY = 1;

    if (canvas.width > MAX_DIM || canvas.height > MAX_DIM) {
      const scale = Math.min(MAX_DIM / canvas.width, MAX_DIM / canvas.height);
      processedCanvas = document.createElement('canvas');
      processedCanvas.width = Math.floor(canvas.width * scale);
      processedCanvas.height = Math.floor(canvas.height * scale);
      scaleX = canvas.width / processedCanvas.width;
      scaleY = canvas.height / processedCanvas.height;
      const ctx = processedCanvas.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0, processedCanvas.width, processedCanvas.height);
    }

    console.log(`[ScannerCore:Detector] Converting ${processedCanvas.width}x${processedCanvas.height} canvas to blob...`);
    const blob = await new Promise<Blob>((resolve, reject) => {
      processedCanvas.toBlob((b) => {
        if (b) {
          console.log(`[ScannerCore:Detector] Blob created: ${b.size} bytes`);
          resolve(b);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/jpeg', 0.85);
    });

    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');
    formData.append('sessionId', sessionId);
    formData.append('frameIndex', frameIndex.toString());
    formData.append('mode', mode);
    if (imgsz) formData.append('imgsz', imgsz.toString());

    let data;
    try {
      const result = await fetchDetectorBackend(formData, signal);
      data = result.data;
      console.log(`[ScannerCore:Detector] Raw Backend detections: ${data.detections?.length || 0}, tracked: ${data.trackedObjects?.length || 0}`);
    } catch (loaderException: any) {
      // Natural abort check
      if (loaderException.name === 'AbortError' || loaderException.error?.name === 'AbortError' || loaderException.message?.includes('The user aborted')) {
        throw loaderException.error || loaderException;
      }
      
      const diag: LoaderDiagnostic = loaderException.diagnostic || {};
      const err = loaderException.error || new Error('Unknown Loader Exception');
      
      throw createScannerError(stage, err, {
        frameIndex,
        status: diag.status,
        responseText: diag.responseText,
        detectorReady: false // VERY IMPORTANT: Load failed means detector is NOT ready.
      }, diag);
    }

    // ─── CANONICAL ADAPTER ───────────────────────────────────────
    const detections: FrameDetection[] = (data.detections || [])
      .filter((det: any) => {
        // LEGO Geometry Filter: Reject obvious non-LEGO macro-blocks
        const geo = det.geometry || {};
        const bbox = geo.bbox || {};
        const w = bbox.xMax - bbox.xMin;
        const h = bbox.yMax - bbox.yMin;
        if (w <= 0 || h <= 0) return false;
        
        const aspect = w / h;
        // Rules: 
        // 1. No extremely thin slivers (prob background texture)
        // 2. No massive non-standard macro-blocks (prob household objects)
        if (aspect < 0.1 || aspect > 10) return false;
        
        // Size Check (based on expected imgsz)
        const size = Math.max(w, h);
        if (size < 4) return false; // Too small to be a brick

        return true;
      })
      .map((det: any, idx: number) => {
        const geo = det.geometry || {};
        const bbox = geo.bbox || {};
        const pred = det.prediction || {};
        return {
          detectionId: det.detectionId || `det_${idx}`,
          detectionIndex: det.detectionIndex ?? idx,
          trackId: det.trackId || '',
          geometry: {
            type: geo.type || 'bbox_xyxy',
            bbox: {
              format: 'xyxy',
              space: 'pixel',
              xMin: (bbox.xMin ?? 0) * scaleX,
              yMin: (bbox.yMin ?? 0) * scaleY,
              xMax: (bbox.xMax ?? 0) * scaleX,
              yMax: (bbox.yMax ?? 0) * scaleY
            },
            polygon: geo.polygon?.map((p: any) => ({ x: (p.x ?? 0) * scaleX, y: (p.y ?? 0) * scaleY })),
            geometryConfidence: geo.geometryConfidence ?? 0
          },
          prediction: {
            brickPartId: pred.brickPartId,
            brickPartNum: pred.brickPartNum,
            brickName: pred.brickName,
            brickFamily: pred.brickFamily,
            dimensionsLabel: pred.dimensionsLabel,
            brickColorId: pred.brickColorId,
            brickColorName: pred.brickColorName,
            identityConfidence: pred.identityConfidence ?? 0,
            colorConfidence: pred.colorConfidence ?? 0,
            dimensionConfidence: pred.dimensionConfidence ?? 0,
            brandConfidence: pred.brandConfidence ?? 0,
            detectorConfidence: pred.detectorConfidence ?? (pred.rawModelConfidence ?? 0),
            rawModelClass: pred.rawModelClass,
            rawModelConfidence: pred.rawModelConfidence ?? 0
          },
          compactLabel: det.compactLabel,
          candidates: det.candidates || [],
          quality: det.quality || {},
          reviewStatus: det.reviewStatus || 'unreviewed',
          labelDisplayStatus: det.labelDisplayStatus || 'tentative'
        } satisfies FrameDetection;
      });

    // ─── NON-MAXIMUM SUPPRESSION (NMS) ───────────────────────────
    // Essential for physical devices where the backend might return overlapping detections
    const nmsDetections: FrameDetection[] = [];
    const sorted = [...detections].sort((a, b) => (b.prediction.rawModelConfidence ?? 0) - (a.prediction.rawModelConfidence ?? 0));

    for (const det of sorted) {
      let keep = true;
      for (const kept of nmsDetections) {
        const iou = calculateIOU(det.geometry.bbox, kept.geometry.bbox);
        if (iou > 0.30) { // Tightened from 0.45 to 0.30 for aggressive suppression
          keep = false;
          break;
        }
      }
      if (keep) nmsDetections.push(det);
    }

    const trackedObjects: TrackedObject[] = (data.trackedObjects || []).map((to: any) => {
      const geo = to.stableGeometry || {};
      const bbox = geo.bbox || {};
      return {
        trackedObjectId: to.trackedObjectId || `track_${to.trackId}`,
        trackId: to.trackId,
        status: to.status || 'active',
        totalFramesSeen: to.totalFramesSeen ?? 1,
        stableGeometry: {
          type: geo.type || 'bbox_xyxy',
          bbox: {
            format: 'xyxy',
            space: 'pixel',
            xMin: (bbox.xMin ?? 0) * scaleX,
            yMin: (bbox.yMin ?? 0) * scaleY,
            xMax: (bbox.xMax ?? 0) * scaleX,
            yMax: (bbox.yMax ?? 0) * scaleY
          },
          polygon: geo.polygon?.map((p: any) => ({ x: (p.x ?? 0) * scaleX, y: (p.y ?? 0) * scaleY })),
          geometryConfidence: geo.geometryConfidence ?? 0
        },
        consensusBrickName: to.consensusBrickName,
        consensusColorName: to.consensusColorName,
        consensusBrickFamily: to.consensusBrickFamily,
        consensusDimensionsLabel: to.consensusDimensionsLabel,
        geometryConfidence: to.geometryConfidence ?? 0,
        identityConfidence: to.identityConfidence ?? 0,
        colorConfidence: to.colorConfidence ?? 0,
        labelDisplayStatus: to.labelDisplayStatus || 'confirmed',
        promotedToCollection: to.promotedToCollection ?? false
      };
    });

    console.log(`[ScannerCore:Detector] Mapped detections: ${detections.length}, tracked: ${trackedObjects.length}`);

    return {
      sessionId: data.sessionId,
      frameId: data.frameId,
      frameIndex: data.frameIndex,
      frameWidth: originalWidth,
      frameHeight: originalHeight,
      modelVersion: data.modelVersion,
      detections: nmsDetections,
      trackedObjects
    };
    
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    
    // If it's already a formatted ScannerError, rethrow it
    if (error.stage && error.ts) {
      console.error(`[ScannerCore Error] ${error.stage}: ${error.message}`, error);
      throw error;
    }
    
    // Fallback catch-all
    const finalError = createScannerError(stage, error, { frameIndex });
    console.error(`[ScannerCore Error] ${finalError.stage}: ${finalError.message}`, finalError);
    throw finalError;
  }
};
