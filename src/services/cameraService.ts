// Camera Service for HelloBrick
// Supports both web (getUserMedia) and mobile (Capacitor Camera)

import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Check if running on native mobile platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (isNativePlatform()) {
      // Use Capacitor Camera plugin for permissions
      const status = await Camera.checkPermissions();
      if (status.camera !== 'granted') {
        const result = await Camera.requestPermissions({ permissions: ['camera'] });
        return result.camera === 'granted';
      }
      return true;
    } else {
      // Web: getUserMedia will request permissions automatically
      return true;
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Get camera stream for video (works on both web and mobile)
 */
export const getCameraStream = async (): Promise<MediaStream | null> => {
  try {
    // Request permissions first
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    // Use getUserMedia (works in Capacitor WebView too)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }, // Back camera on mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // Advanced focus constraint on supported browsers (iOS Safari / WKWebView)
        advanced: [{ focusMode: "continuous" } as any]
      }
    });

    return stream;
  } catch (error) {
    console.error('Camera stream error:', error);
    throw error;
  }
};

/**
 * Capture photo using Capacitor Camera (better for mobile)
 */
export const capturePhoto = async (): Promise<string> => {
  try {
    if (isNativePlatform()) {
      // Use Capacitor Camera for better mobile support
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear // Back camera
      });

      return `data:image/jpeg;base64,${image.base64String}`;
    } else {
      // Web fallback: capture from video stream
      throw new Error('Use captureFromVideo for web');
    }
  } catch (error) {
    console.error('Photo capture error:', error);
    throw error;
  }
};

/**
 * Capture frame from video element (for web or when using video stream)
 */
export const captureFromVideo = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
};

/**
 * Stop camera stream
 */
export const stopCameraStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};
