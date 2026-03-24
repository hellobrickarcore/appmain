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

  constructor(persistenceWindowMs = 8500, smoothingFactor = 0.04, lockThreshold = 100) {
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

        const stabilized = {
          ...curr,
          lastSeen: now,
          geometry: {
            ...curr.geometry,
            bbox: smoothBox
          }
        };
        result.push(stabilized);
      } else {
        result.push({ ...curr, lastSeen: now });
      }
    });

    // 2. Persistence: Allow objects to stay visible for a few frames even if missed
    this.prevDetections.forEach(prev => {
      const existsInCurrent = result.some(r => r.detectionId === prev.detectionId);
      if (!existsInCurrent && (now - prev.lastSeen < this.persistenceWindowMs)) {
        // Only keep if it was somewhat confident to avoid ghosting junk
        if (prev.prediction.identityConfidence > 0.25) {
           result.push(prev);
        }
      }
    });

    this.prevDetections = result;
    return result;
  }
}

/**
 * Main Detection Hook
 */
export const detectBricks = async (
  video: HTMLVideoElement,
  frameIndex: number = 0,
  sessionId: string = 'native'
): Promise<ScanFrameResponse> => {
  const startTime = Date.now();
  let status = 0;
  let responseText = '';
  let aborted = false;
  let stage = 'init';
  let detectorState = 'idle';

  try {
    const originalWidth = video.videoWidth;
    const originalHeight = video.videoHeight;
    
    if (originalWidth === 0) throw new Error('Video not ready');

    // 1. Capture & Prepare Frame
    stage = 'capture';
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas failure');
    ctx.drawImage(video, 0, 0);
    
    stage = 'compress';
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) throw new Error('Blob failure');

    // 2. Remote Detection Call
    stage = 'network';
    detectorState = 'detecting';
    
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    const data = await apiFormRequest(CONFIG.DETECT_IMAGE, formData);
    detectorState = 'parsing';

    // 3. Coordinate Normalization & Mapping
    const detections: FrameDetection[] = (data.detections || []).map((det: any, index: number) => {
      return {
        detectionId: `d_${index}_${Date.now()}`,
        trackId: det.track_id,
        geometry: {
          type: det.mask ? 'polygon' : 'bbox',
          bbox: {
            xMin: det.box.x_min,
            yMin: det.box.y_min,
            xMax: det.box.x_max,
            yMax: det.box.y_max
          },
          polygon: det.mask,
          geometryConfidence: det.confidence || 0
        },
        prediction: {
          brickName: det.brick_name || 'Unknown',
          brickPartNum: det.brick_part_num || '0',
          brickColorName: det.color_name || 'Unknown',
          identityConfidence: det.confidence || 0,
          colorConfidence: det.color_confidence || 0,
          brickFamily: det.brick_family,
          dimensionsLabel: det.dimensions_label
        },
        lastSeen: Date.now()
      };
    });

    // 4. Tracked Object Migration (Phase 7 support)
    const trackedObjects: TrackedObject[] = (data.tracked_objects || []).map((to: any) => {
      return {
        trackedObjectId: to.tracked_id,
        trackId: to.track_id,
        stableGeometry: {
          type: 'bbox',
          bbox: {
            xMin: to.box.x_min,
            yMin: to.box.y_min,
            xMax: to.box.x_max,
            yMax: to.box.y_max
          }
        },
        lastSeen: Date.now(),
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

    // Detect if we need to show scale guidance (Phase 7)
    const targetDimension = data.target_dimension;

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

export const brickDetectionService = {
  scanFrame: detectBricks,
  detectBricks,
  toDetectionOverlay,
  toRenderableDetection,
  generationFallbackLabel
};
