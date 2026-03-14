/**
 * Brick Detection Service
 * 
 * THE SINGLE ADAPTER between the backend detection API and the frontend.
 * No other component should parse raw server coordinates.
 * 
 * All geometry is returned in canonical pixel-space xyxy format.
 */

import { FrameDetection, ScanFrameResponse, DETECTION_THRESHOLDS, DetectionOverlay, TrackedObject } from '../types/detection';
import { Capacitor } from '@capacitor/core';
import { CONFIG } from './configService';
import { subscriptionService } from './subscriptionService';

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
    timeoutMs = mode === 'mass_capture' ? 15000 : 5000
  } = options;

  const stage = mode === 'mass_capture' ? 'holistic_capture' : 'live_detection';
  const targetDimension = mode === 'mass_capture' ? 960 : 416;

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

    // 4. Execute Request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(CONFIG.DETECT_IMAGE, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    status = response.status;
    responseText = await response.text();

    if (!responseText.trim().startsWith('{')) {
      throw new Error(`Non-JSON response (starts with ${responseText.trim().slice(0, 10)})`);
    }

    const data = JSON.parse(responseText);
    
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
      inferenceMs: data.inferenceMs || 0
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
  // Check if it's a TrackedObject (has consensus fields)
  if ('consensusBrickName' in detection) {
    if (detection.consensusBrickName) return detection.consensusBrickName;
    const parts = [];
    if (detection.consensusColorName) parts.push(detection.consensusColorName);
    return parts.join(' ') || 'Generic Brick';
  }

  // Handle FrameDetection
  const p = (detection as FrameDetection).prediction;
  if (p.brickName) return p.brickName;

  const components = [];
  if (p.brickColorName) components.push(p.brickColorName);
  if (p.brickFamily) components.push(p.brickFamily);
  if (p.dimensionsLabel) components.push(p.dimensionsLabel);

  return components.length > 0 ? components.join(' ') : 'Generic Brick';
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
  const shouldRenderLabel = status !== 'hidden' && (geoConf > 0.4 || prediction.identityConfidence > 0.5);

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
