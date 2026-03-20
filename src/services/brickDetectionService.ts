/**
 * Brick Detection Service
 * 
 * THE SINGLE ADAPTER between the backend detection API and the frontend.
 * No other component should parse raw server coordinates.
 * 
 * All geometry is returned in canonical pixel-space xyxy format.
 */

import { FrameDetection, ScanFrameResponse, DETECTION_THRESHOLDS, DetectionOverlay, TrackedObject } from '../types/detection';
import { CONFIG } from './configService';
import { apiFormRequest } from './apiService';

export class DetectionStabilizer {
  private prevDetections: any[] = [];
  private persistenceWindowMs: number;
  private smoothingFactor: number;
  private lockThreshold: number; 

  constructor(persistenceWindowMs = 6500, smoothingFactor = 0.06, lockThreshold = 75) {
    this.persistenceWindowMs = persistenceWindowMs;
    this.smoothingFactor = smoothingFactor;
    this.lockThreshold = lockThreshold;
  }

  public stabilize(newDetections: FrameDetection[]): FrameDetection[] {
    const now = Date.now();
    
    // 0. NMS Deduplication (Kill multi-boxes around 1 brick)
    const sorted = [...newDetections].sort((a, b) => 
      b.prediction.identityConfidence - a.prediction.identityConfidence
    );
    const nmsFiltered: FrameDetection[] = [];
    
    sorted.forEach(curr => {
      const isDuplicate = nmsFiltered.some(target => {
        const b1 = curr.geometry.bbox;
        const b2 = target.geometry.bbox;
        
        const xIn1 = Math.max(b1.xMin, b2.xMin);
        const yIn1 = Math.max(b1.yMin, b2.yMin);
        const xIn2 = Math.min(b1.xMax, b2.xMax);
        const yIn2 = Math.min(b1.yMax, b2.yMax);
        
        if (xIn2 <= xIn1 || yIn2 <= yIn1) return false;
        
        const intersection = (xIn2 - xIn1) * (yIn2 - yIn1);
        const area1 = (b1.xMax - b1.xMin) * (b1.yMax - b1.yMin);
        const area2 = (b2.xMax - b2.xMin) * (b2.yMax - b2.yMin);
        const union = area1 + area2 - intersection;
        const iou = intersection / union;
        
        const containment1 = intersection / area1;
        const containment2 = intersection / area2;
        
        return iou > 0.35 || containment1 > 0.75 || containment2 > 0.75;
      });
      
      if (!isDuplicate) {
        nmsFiltered.push(curr);
      }
    });

    const result: FrameDetection[] = [];

    // 1. Process NMS-filtered detections and merge with previous for smoothing
    nmsFiltered.forEach(curr => {
      const prev = this.prevDetections.find(p => {
        const pBox = p.geometry.bbox;
        const cBox = curr.geometry.bbox;
        const centerX1 = (pBox.xMin + pBox.xMax) / 2;
        const centerY1 = (pBox.yMin + pBox.yMax) / 2;
        const centerX2 = (cBox.xMin + cBox.xMax) / 2;
        const centerY2 = (cBox.yMin + cBox.yMax) / 2;
        const distance = Math.sqrt(Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2));
        return distance < 120; 
      });

      if (prev) {
        const pBox = prev.geometry.bbox;
        const cBox = curr.geometry.bbox;
        
        // Calculate center movement
        const centerX1 = (pBox.xMin + pBox.xMax) / 2;
        const centerY1 = (pBox.yMin + pBox.yMax) / 2;
        const centerX2 = (cBox.xMin + cBox.xMax) / 2;
        const centerY2 = (cBox.yMin + cBox.yMax) / 2;
        const distance = Math.sqrt(Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2));

        let smoothBox;
        
        // HYSTERESIS / MAGNET-LOCK: If movement is tiny, FREEZE the box.
        if (distance < this.lockThreshold) {
          smoothBox = { ...pBox };
        } else {
          // HEAVY DAMPING: Only move 20% towards new position to kill jitter
          smoothBox = {
            ...curr.geometry.bbox,
            xMin: pBox.xMin + (cBox.xMin - pBox.xMin) * this.smoothingFactor,
            yMin: pBox.yMin + (cBox.yMin - pBox.yMin) * this.smoothingFactor,
            xMax: pBox.xMax + (cBox.xMax - pBox.xMax) * this.smoothingFactor,
            yMax: pBox.yMax + (cBox.yMax - pBox.yMax) * this.smoothingFactor,
          };
        }
        
        const smoothed = {
          ...curr,
          geometry: { ...curr.geometry, bbox: smoothBox },
          _timestamp: now,
          _lastSeen: now
        } as any;
        result.push(smoothed);
      } else {
        (curr as any)._timestamp = now;
        (curr as any)._lastSeen = now;
        result.push(curr);
      }
    });

    // 2. Persistence: Keep missed valid detections
    this.prevDetections.forEach(prev => {
      const alreadyInResult = result.some(r => r.detectionId === prev.detectionId);
      if (!alreadyInResult) {
        const age = now - ((prev as any)._lastSeen || now);
        // Phase 40: "HARD LOCK" MAGNETISM.
        // Once a brick is confirmed (Stage 3), it gets a massive 15s persistence window.
        // It will NOT be removed unless the view changes drastically or it's dead-lost for 15s.
        const isConfirmed = (prev.labelDisplayStatus === 'confirmed');
        const isStable = (prev.prediction.identityConfidence || 0) >= 0.15;
        
        const limit = isConfirmed ? 15000 : (isStable ? 5000 : 1800);

        if (age < limit) {
          result.push(prev);
        }
      }
    });

    // 3. Final NMS Pass (CROSS-DEDUPLICATION)
    const finalFiltered: FrameDetection[] = [];
    const finalSorted = [...result].sort((a, b) => 
      (b.prediction.identityConfidence || 0) - (a.prediction.identityConfidence || 0)
    );

    finalSorted.forEach(curr => {
      const isDuplicate = finalFiltered.some(target => {
        const b1 = curr.geometry.bbox;
        const b2 = target.geometry.bbox;
        
        const xIn1 = Math.max(b1.xMin, b2.xMin);
        const yIn1 = Math.max(b1.yMin, b2.yMin);
        const xIn2 = Math.min(b1.xMax, b2.xMax);
        const yIn2 = Math.min(b1.yMax, b2.yMax);
        
        if (xIn2 <= xIn1 || yIn2 <= yIn1) return false;
        
        const intersection = (xIn2 - xIn1) * (yIn2 - yIn1);
        const area1 = (b1.xMax - b1.xMin) * (b1.yMax - b1.yMin);
        const area2 = (b2.xMax - b2.xMin) * (b2.yMax - b2.yMin);
        const union = area1 + area2 - intersection;
        const iou = intersection / union;
        const containment1 = intersection / area1;
        const containment2 = intersection / area2;
        
        return iou > 0.3 || containment1 > 0.7 || containment2 > 0.7;
      });
      
      if (!isDuplicate) {
        finalFiltered.push(curr);
      }
    });

    this.prevDetections = finalFiltered;
    return finalFiltered;
  }

  public clear() {
    this.prevDetections = [];
  }
}

/**
 * Send a frame to the detection server and return canonical ScanFrameResponse.
 */
export const detectBricks = async (
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | File | string,
  options: {
    sessionId?: string;
    frameIndex?: number;
    mode?: 'mass_capture' | 'live_scanner';
    imgsz?: number;
    debugMode?: boolean;
    detectorState?: string;
    captureInProgress?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<ScanFrameResponse> => {
  const { 
    sessionId = 'session_manual', 
    frameIndex = 0, 
    mode = 'live_scanner', 
    imgsz, 
    debugMode = false,
    detectorState = 'unknown',
    captureInProgress = false
  } = options;

  const stage = mode === 'mass_capture' ? 'holistic_capture' : 'live_detection';
  
  // Adaptive Performance Tracking
  const startTime = Date.now();
  // Phase 30: Use higher resolution (1024) by default to support distant scanning (5ft).
  // 640 is too low for small bricks from a distance.
  const targetDimension = 1024; 
  
  // Performance adjustments moved to backend for simplicity

  let responseText = '';
  let status = 0;
  let aborted = false;

  try {
    // 1. Prepare Source Canvas
    let source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap;
    let originalWidth = 0;
    let originalHeight = 0;

    if (image instanceof HTMLCanvasElement) {
      source = image;
      originalWidth = image.width;
      originalHeight = image.height;
    } else if (image instanceof HTMLVideoElement) {
      source = image;
      originalWidth = image.videoWidth;
      originalHeight = image.videoHeight;
    } else if (image instanceof HTMLImageElement) {
      source = image;
      originalWidth = image.width;
      originalHeight = image.height;
    } else if (typeof image === 'string') {
      source = await loadImageFromUrl(image);
      originalWidth = source.width;
      originalHeight = source.height;
    } else if (image instanceof File) {
      source = await loadImageFromFile(image);
      originalWidth = source.width;
      originalHeight = source.height;
    } else {
      throw new Error('Unsupported image type');
    }

    // 2. Resize maintaining aspect ratio
    const scale = Math.min(targetDimension / originalWidth, targetDimension / originalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(originalWidth * scale);
    canvas.height = Math.floor(originalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    
    // Phase 26 Sharpening: Enhanced contrast and saturation for 5ft distance
    ctx.filter = 'contrast(1.25) brightness(1.1) saturate(1.2)';
    ctx.drawImage(source, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);

    const scaleX = originalWidth / canvas.width;
    const scaleY = originalHeight / canvas.height;

    // 3. Prepare Form Data
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject('Blob creation failed'), 'image/jpeg', 0.85);
    });

    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');
    formData.append('sessionId', sessionId);
    formData.append('frameIndex', frameIndex.toString());
    formData.append('mode', mode);
    formData.append('imgsz', (imgsz || targetDimension).toString());
    formData.append('debugMode', debugMode.toString());

    // 4. Execute Native-Safe Request using apiFormRequest
    const data = await apiFormRequest(CONFIG.DETECT_IMAGE, formData);
    
    // Simulate some metadata for the canonical adapter
    status = 200;
    responseText = JSON.stringify(data);

    if (!responseText.trim().startsWith('{')) {
      throw new Error(`Non-JSON response (starts with ${responseText.trim().slice(0, 10)})`);
    }

    // No need to redeclare data, we already have it from apiFormRequest
    
    // 5. Canonical Adapter
    const detections: FrameDetection[] = (data.detections || []).map((det: any, idx: number) => {
      const geo = det.geometry || {};
      const bbox = geo.bbox || {};
      const pred = det.prediction || {};

        return {
          detectionId: det.detectionId || `det_${idx}_${Date.now()}`,
          detectionIndex: idx,
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
            polygon: geo.polygon?.map((p: any) => ({
              x: (p.x ?? 0) * scaleX,
              y: (p.y ?? 0) * scaleY
            })),
            geometryConfidence: geo.geometryConfidence ?? 0
          },
          prediction: {
            brickName: pred.brickName,
            brickFamily: pred.brickFamily,
            dimensionsLabel: pred.dimensionsLabel,
            brickColorName: pred.brickColorName,
            identityConfidence: pred.identityConfidence ?? 0,
            colorConfidence: pred.colorConfidence ?? 0,
            dimensionConfidence: pred.dimensionConfidence ?? 0,
            brandConfidence: pred.brandConfidence ?? 0,
            detectorConfidence: pred.detectorConfidence ?? 0,
          },
          compactLabel: det.compactLabel,
          labelDisplayStatus: det.labelDisplayStatus || 'tentative',
          countingBucket: det.countingBucket
        };
      });

    const trackedObjects: TrackedObject[] = (data.trackedObjects || []).map((to: any) => {
      const geo = to.stableGeometry || {};
      const bbox = geo.bbox || {};
      return {
        trackedObjectId: to.trackedObjectId || `track_${to.trackId}`,
        trackId: to.trackId,
        status: (to.status || 'active') as any,
        totalFramesSeen: to.totalFramesSeen ?? 1,
        stableGeometry: {
          type: (geo.type || 'bbox_xyxy') as any,
          bbox: {
            format: 'xyxy',
            space: 'pixel',
            xMin: (bbox.xMin ?? 0) * scaleX,
            yMin: (bbox.yMin ?? 0) * scaleY,
            xMax: (bbox.xMax ?? 0) * scaleX,
            yMax: (bbox.yMax ?? 0) * scaleY
          },
          polygon: geo.polygon?.map((p: any) => ({
            x: (p.x ?? 0) * scaleX,
            y: (p.y ?? 0) * scaleY
          })),
          geometryConfidence: geo.geometryConfidence ?? 0
        },
        consensusBrickName: to.consensusBrickName,
        consensusColorName: to.consensusColorName,
        consensusBrickFamily: to.consensusBrickFamily,
        consensusDimensionsLabel: to.consensusDimensionsLabel,
        geometryConfidence: to.geometryConfidence ?? 0,
        identityConfidence: to.identityConfidence ?? 0,
        colorConfidence: to.colorConfidence ?? 0,
        labelDisplayStatus: (to.labelDisplayStatus || 'confirmed') as any,
        promotedToCollection: to.promotedToCollection ?? false
      };
    });

    return {
      sessionId: data.sessionId || sessionId,
      frameId: data.frameId || `f_${Date.now()}`,
      frameIndex: data.frameIndex ?? frameIndex,
      frameWidth: originalWidth,
      frameHeight: originalHeight,
      modelVersion: data.modelVersion || 'v8_fastapi_v1',
      detections,
      trackedObjects,
      debug: data.debug,
      summary: {
        ...data.summary,
        total_raw_candidates: data.summary?.total_candidates_analyzed || 0
      },
      inferenceMs: data.inferenceMs || 0,
      rttMs: Date.now() - startTime,
      targetDimension
    };

  } catch (error: any) {
    if (error.name === 'AbortError') aborted = true;
    
    console.error('🔍 SCANNER ERROR DIAGNOSTICS:', {
      stage,
      requestUrl: CONFIG.DETECT_IMAGE,
      status,
      responseText: responseText.slice(0, 100), 
      aborted,
      detectorState,
      message: error.message
    });
    throw error;
  }
};


/**
 * 🔒 OVERLAY ADAPTER
 * Implements the strict fallback chain for overlays:
 * tracked polygon -> tracked bbox -> raw polygon -> raw bbox
 */
export function toDetectionOverlay(
  detection: FrameDetection | TrackedObject
): DetectionOverlay | null {
  const isTracked = 'trackedObjectId' in detection;
  const geometry = isTracked
    ? (detection as TrackedObject).stableGeometry
    : (detection as FrameDetection).geometry;
  const prediction = (detection as any).prediction;

  if (!geometry?.bbox || !prediction) return null;

  const geoConf = isTracked
    ? (detection as any).geometryConfidence
    : (detection as FrameDetection).geometry?.geometryConfidence ?? 0;

  // Gating for overlays - Stage 1 (Allow all if debug)
  const isDebug = (detection as any).labelDisplayStatus === 'hidden' || (detection as any).debugMode;
  if (!isDebug && geoConf < DETECTION_THRESHOLDS.GEOMETRY_RENDER_MIN) return null;

  const status = (detection as any).labelDisplayStatus || 'tentative';

  return {
    id: isTracked ? (detection as TrackedObject).trackedObjectId : (detection as FrameDetection).detectionId,
    trackId: detection.trackId,
    box: geometry.bbox,
    polygon: geometry.polygon,
    geometryType: geometry.type === 'polygon' ? 'polygon' : 'bbox',

    // Confidence scores
    geometryConfidence: geoConf,
    identityConfidence: prediction.identityConfidence ?? 0,
    colorConfidence: prediction.colorConfidence ?? 0,
    dimensionConfidence: prediction.dimensionConfidence ?? 0,

    // Phase 7/8 Attributes
    brickFamily: prediction.brickFamily,
    dimensionsLabel: prediction.dimensionsLabel,
    compactLabel: (detection as any).compactLabel || generationFallbackLabel(detection as any),

    // Status
    isTracked,
    isStable: geoConf >= DETECTION_THRESHOLDS.GEOMETRY_STABLE_MIN,
    labelDisplayStatus: status
  };
}

export const generationFallbackLabel = (detection: FrameDetection | TrackedObject): string => {
  const isTracked = 'consensusBrickName' in detection;
  
  const p = isTracked 
    ? {
        brickColorName: (detection as TrackedObject).consensusColorName,
        brickFamily: (detection as TrackedObject).consensusBrickFamily,
        dimensionsLabel: (detection as TrackedObject).consensusDimensionsLabel,
        brickName: (detection as TrackedObject).consensusBrickName
      }
    : (detection as FrameDetection).prediction;

  // Standardization Order: Dimension -> Color -> 'Brick'
  const components = [];
  
  // 1. Dimensions (e.g. 2x2)
  if (p.dimensionsLabel && p.dimensionsLabel !== 'Unknown') {
    components.push(p.dimensionsLabel);
  } else if (p.brickName && /^\d+x\d+/.test(p.brickName)) {
    // Fallback: extract dimension from name if missing from label
    const dim = p.brickName.match(/^\d+x\d+/)?.[0];
    if (dim) components.push(dim);
  }
  
  // 2. Color (e.g. Yellow)
  if (p.brickColorName && p.brickColorName !== 'Unknown') {
    components.push(p.brickColorName);
  } else if (p.brickName && p.brickName.includes('_')) {
    // Fallback: extract color from name like "2x4_blue"
    const parts = p.brickName.split('_');
    const color = parts[parts.length - 1];
    if (color && !/^\d+/.test(color)) {
      // Capitalize color
      components.push(color.charAt(0).toUpperCase() + color.slice(1));
    }
  }
  
  // 3. Constant suffix
  components.push('Brick');

  return components.join(' ');
};

/**
 * 🔒 RENDER ADAPTER
 * Converts a FrameDetection into a UI-safe renderable object.
 */
export interface RenderableDetection {
  id: string;
  box: { xMin: number; yMin: number; xMax: number; yMax: number };
  shouldRenderGeometry: boolean;
  shouldRenderLabel: boolean;
  displayText: string;
  labelDisplayStatus: string;
  color?: string;
  brickFamily?: string;
  dimensionsLabel?: string;
}

export function toRenderableDetection(detection: FrameDetection): RenderableDetection {
  const geoConf = detection.geometry?.geometryConfidence ?? 0;
  const prediction = detection.prediction || {};
  const status = detection.labelDisplayStatus || 'tentative';

  const shouldRenderGeometry = geoConf >= DETECTION_THRESHOLDS.GEOMETRY_RENDER_MIN;

  // Show label if identity or dimensions are somewhat resolved
  // Low threshold (0.12) to catch bricks from 5ft height
  const shouldRenderLabel = status !== 'hidden' && (geoConf > 0.12 || prediction.identityConfidence > 0.12);

  const displayText = detection.compactLabel || generationFallbackLabel(detection);

  return {
    id: detection.detectionId,
    box: detection.geometry.bbox,
    shouldRenderGeometry,
    shouldRenderLabel,
    displayText,
    labelDisplayStatus: status,
    color: prediction.brickColorName,
    brickFamily: prediction.brickFamily,
    dimensionsLabel: prediction.dimensionsLabel
  };
}

// ─── Image Loaders ───────────────────────────────────────────────

const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Placeholder exports to satisfy existing imports
export const segmentBrick = async () => [];
export const validateBrickMatch = () => true;
export const initializeYOLO = async () => { };
export const initializeSAM3 = async () => { };

export const brickDetectionService = {
  scanFrame: detectBricks,
  detectBricks,
  toDetectionOverlay,
  toRenderableDetection,
  generationFallbackLabel
};
