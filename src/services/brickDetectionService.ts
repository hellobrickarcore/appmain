/**
 * Brick Detection Service
 * 
 * THE SINGLE ADAPTER between the backend detection API and the frontend.
 * No other component should parse raw server coordinates.
 * 
 * All geometry is returned in canonical pixel-space xyxy format.
 */

import { FrameDetection, ScanFrameResponse, DETECTION_THRESHOLDS, DetectionOverlay, TrackedObject } from '../types/detection';

// Detection API URL
const getDetectionAPIUrl = (): string => {
  return import.meta.env.VITE_DETECTION_API || '/api';
};

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
  } = {}
): Promise<ScanFrameResponse> => {
  const { sessionId = 'session_manual', frameIndex = 0, mode = 'live_scanner', imgsz, debugMode = false } = options;
  try {
    let canvas: HTMLCanvasElement;

    if (image instanceof HTMLCanvasElement) {
      canvas = image;
    } else if (image instanceof HTMLImageElement) {
      canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(image, 0, 0);
    } else if (image instanceof HTMLVideoElement) {
      canvas = document.createElement('canvas');
      canvas.width = image.videoWidth;
      canvas.height = image.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(image, 0, 0);
    } else if (typeof image === 'string') {
      const img = await loadImageFromUrl(image);
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);
    } else if (image instanceof File) {
      const img = await loadImageFromFile(image);
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);
    } else {
      throw new Error('Invalid image type');
    }

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // Resize logic
    // Mass capture allows higher resolution
    const MAX_DIM = mode === 'mass_capture' ? 1024 : 800;
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
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, processedCanvas.width, processedCanvas.height);
      }
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      processedCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      }, 'image/jpeg', 0.85);
    });

    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');
    formData.append('sessionId', sessionId);
    formData.append('frameIndex', frameIndex.toString());
    formData.append('mode', mode);
    if (imgsz) formData.append('imgsz', imgsz.toString());

    const apiUrl = getDetectionAPIUrl();
    const response = await fetch(`${apiUrl}/detect`, {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Detection failed with status ${response.status}`);
    }

    const data = await response.json();

    // ─── CANONICAL ADAPTER ───────────────────────────────────────
    // Map server response to our strict types
    const detections: FrameDetection[] = (data.detections || []).map((det: any, idx: number) => {
      const geo = det.geometry || {};
      const bbox = geo.bbox || {};
      const pred = det.prediction || {};

      return {
        detectionId: det.detectionId || `det_${idx}_${Date.now()}`,
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
          polygon: geo.polygon?.map((p: any) => ({
            x: (p.x ?? 0) * scaleX,
            y: (p.y ?? 0) * scaleY
          })),
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
        labelDisplayStatus: to.labelDisplayStatus || 'confirmed',
        promotedToCollection: to.promotedToCollection ?? false
      };
    });

    return {
      sessionId: data.sessionId,
      frameId: data.frameId,
      frameIndex: data.frameIndex,
      frameWidth: originalWidth,
      frameHeight: originalHeight,
      modelVersion: data.modelVersion,
      detections,
      trackedObjects
    };
  } catch (error) {
    console.error('Brick detection error:', error);
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

  // Gating for overlays - Stage 1 (0.10 floor)
  if (geoConf < 0.10) return null;

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
    labelDisplayStatus: status,
    x: geometry.bbox.xMin,
    y: geometry.bbox.yMin
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
