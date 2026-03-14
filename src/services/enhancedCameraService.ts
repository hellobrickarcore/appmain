/**
 * Enhanced Camera Service for HelloBrick
 * Supports 1080p high-resolution streams and advanced camera constraints (focus, exposure, WB)
 * Optimized for both web and Capacitor mobile platforms
 */

import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export interface CameraCapability {
  focusMode?: string[];
  exposureMode?: string[];
  whiteBalanceMode?: string[];
  zoom?: { min: number; max: number; step: number };
}

/**
 * Request camera permissions with fallback handling
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (isNativePlatform()) {
      const status = await Camera.checkPermissions();
      if (status.camera !== 'granted') {
        const result = await Camera.requestPermissions({ permissions: ['camera'] });
        return result.camera === 'granted';
      }
      return true;
    } else {
      // On web, permissions are handled by getUserMedia
      return true;
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Get high-performance camera stream (1080p)
 */
export const getEnhancedCameraStream = async (): Promise<MediaStream | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) throw new Error('Camera permission denied');

    // Enhanced constraints for 1080p scanning
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment', // Use back camera
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 24 }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Log capabilities for debugging
    const track = stream.getVideoTracks()[0];
    if (track) {
      console.log('📸 Camera track started:', track.getSettings());
      const capabilities = (track as any).getCapabilities?.() || {};
      console.log('🔍 Camera capabilities:', capabilities);
    }

    return stream;
  } catch (error) {
    console.error('Enhanced camera stream error:', error);
    // Fallback if 1080p fails
    try {
      console.log('🔄 Falling back to standard resolution');
      return await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
    } catch (fallbackError) {
      console.error('Final camera failure:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Apply focus point (Tap-to-focus)
 * @param stream The active media stream
 * @param x Normalized X coordinate (0-1)
 * @param y Normalized Y coordinate (0-1)
 */
export const setFocusPoint = async (stream: MediaStream, x: number, y: number): Promise<boolean> => {
  const track = stream.getVideoTracks()[0];
  if (!track) return false;

  const capabilities = (track as any).getCapabilities?.() || {};
  
  // Map our 0-1 coordinates to focus points if supported (varies by browser/hardware)
  // For most modern mobile browsers, applying constraints with coordinates triggers focus/exposure centering
  try {
    const constraints: any = {
      advanced: [
        {
          focusMode: capabilities.focusMode?.includes('manual') ? 'manual' : 'continuous',
          pointsOfInterest: [{ x, y }] // Note: support varies by browser
        }
      ]
    };

    await track.applyConstraints(constraints);
    return true;
  } catch (e) {
    console.warn('Could not apply advanced focus constraints:', e);
    // Fallback: just toggle continuous focus to trigger a refocus
    try {
      await track.applyConstraints({
        advanced: [{ focusMode: 'continuous' }]
      } as any);
      return true;
    } catch (innerE) {
      return false;
    }
  }
};

/**
 * Set zoom level
 */
export const setZoom = async (stream: MediaStream, zoomLevel: number): Promise<void> => {
  const track = stream.getVideoTracks()[0];
  if (!track) return;

  try {
    await track.applyConstraints({
      advanced: [{ zoom: zoomLevel }]
    } as any);
  } catch (e) {
    console.warn('Zoom not supported:', e);
  }
};

/**
 * Capture high-quality frame from video element
 */
export const captureEnhancedFrame = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  // Use natural video resolution for the highest quality possibly
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Apply subtle sharpen if needed (can be added here)
  ctx.drawImage(videoElement, 0, 0);
  
  // Return high-quality JPEG (0.95)
  return canvas.toDataURL('image/jpeg', 0.95);
};

export const stopCameraStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

export const enhancedCameraService = {
  isNativePlatform,
  requestCameraPermissions,
  getEnhancedCameraStream,
  setFocusPoint,
  setZoom,
  captureEnhancedFrame,
  stopCameraStream
};
