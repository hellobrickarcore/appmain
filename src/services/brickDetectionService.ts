/**
 * Brick Detection Service
 * 
 * THE SINGLE ADAPTER between the backend detection API and the frontend.
 * No other component should parse raw server coordinates.
 * 
 * All geometry is returned in canonical pixel-space xyxy format.
 */

import { DetectionResponse, FrameDetection } from '../types/detection';

// Detection API URL
const getDetectionAPIUrl = (): string => {
  return import.meta.env.VITE_DETECTION_API || '/api';
};

/**
 * Send a frame to the detection server and return canonical DetectionResponse.
 */
export const detectBricks = async (
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | File | string
): Promise<DetectionResponse> => {
  const emptyResponse: DetectionResponse = {
    frame_width: 0,
    frame_height: 0,
    model_version: 'unknown',
    inference_time_ms: 0,
    detections: [],
    total_count: 0,
  };

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

    // Resize for YOLO (640px standard)
    const MAX_WIDTH = 640;
    const MAX_HEIGHT = 480;
    let processedCanvas = canvas;
    let scaleX = 1;
    let scaleY = 1;

    if (canvas.width > MAX_WIDTH || canvas.height > MAX_HEIGHT) {
      const scale = Math.min(MAX_WIDTH / canvas.width, MAX_HEIGHT / canvas.height);
      processedCanvas = document.createElement('canvas');
      processedCanvas.width = Math.floor(canvas.width * scale);
      processedCanvas.height = Math.floor(canvas.height * scale);
      scaleX = canvas.width / processedCanvas.width;
      scaleY = canvas.height / processedCanvas.height;
      const ctx = processedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, processedCanvas.width, processedCanvas.height);
      } else {
        processedCanvas = canvas;
        scaleX = 1;
        scaleY = 1;
      }
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      processedCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      }, 'image/jpeg', 0.8);
    });

    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');

    const apiUrl = getDetectionAPIUrl();
    const response = await fetch(`${apiUrl}/detect`, {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    if (!response.ok) {
      return { ...emptyResponse, frame_width: originalWidth, frame_height: originalHeight };
    }

    const data = await response.json();

    // ─── CANONICAL ADAPTER ───────────────────────────────────────
    // This is the ONLY place where raw server data is converted
    // into the canonical DetectionResponse format.

    const detections: FrameDetection[] = (data.detections || []).map((det: any) => {
      // Extract xyxy from new canonical format
      const xyxy = det.geometry?.bbox_xyxy;
      let x_min = 0, y_min = 0, x_max = 0, y_max = 0;

      if (xyxy && xyxy.length === 4) {
        // New canonical format: [x_min, y_min, x_max, y_max] in pixel-space
        // Scale back to original image size (server received the resized version)
        x_min = xyxy[0] * scaleX;
        y_min = xyxy[1] * scaleY;
        x_max = xyxy[2] * scaleX;
        y_max = xyxy[3] * scaleY;
      } else if (det.box && det.box.length === 4) {
        // Legacy format: [ymin, xmin, ymax, xmax]
        y_min = det.box[0] * scaleY;
        x_min = det.box[1] * scaleX;
        y_max = det.box[2] * scaleY;
        x_max = det.box[3] * scaleX;
      } else if (det.bbox) {
        // Legacy dict format: {x, y, width, height}
        x_min = det.bbox.x * scaleX;
        y_min = det.bbox.y * scaleY;
        x_max = (det.bbox.x + det.bbox.width) * scaleX;
        y_max = (det.bbox.y + det.bbox.height) * scaleY;
      }

      // Scale polygon if present
      let polygon = det.geometry?.polygon;
      if (polygon && Array.isArray(polygon)) {
        polygon = polygon.map((p: any) => ({
          x: (p.x || 0) * scaleX,
          y: (p.y || 0) * scaleY,
        }));
      }

      const prediction = det.prediction || {};
      const label = prediction.brick_name || det.type || det.label || 'Brick';
      const color = prediction.color_name || det.color || 'Unknown';
      const confidence = det.confidence || 0;

      return {
        detection_id: det.detection_id || det.id || `det_${Math.random().toString(36).slice(2, 9)}`,
        track_id: det.track_id || '',
        confidence,
        geometry: {
          format: 'xyxy' as const,
          space: 'pixel' as const,
          bbox: { x_min, y_min, x_max, y_max },
          polygon: polygon || undefined,
        },
        prediction: {
          brick_part_num: prediction.brick_part_num || String(det.class_id || ''),
          brick_name: label,
          color_name: color,
          part_confidence: prediction.part_confidence || confidence,
          color_confidence: prediction.color_confidence || 0.5,
        },
        candidates: det.candidates || [{ brick_part_num: '', label, confidence }],
        stud_count_estimate: det.stud_count_estimate,
        pose_angle_deg: det.pose_angle_deg,
        review_required: det.review_required || confidence < 0.6,
      } satisfies FrameDetection;
    });

    return {
      frame_width: originalWidth,
      frame_height: originalHeight,
      model_version: data.model_version || 'unknown',
      inference_time_ms: data.inference_time_ms || 0,
      detections,
      total_count: detections.length,
    };
  } catch (error) {
    console.error('Brick detection error:', error);
    return emptyResponse;
  }
};

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
