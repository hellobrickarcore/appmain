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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:17', 'message': 'Requesting camera permissions', 'data': { isNative: isNativePlatform() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-check', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    if (isNativePlatform()) {
      // Use Capacitor Camera plugin for permissions
      const status = await Camera.checkPermissions();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:22', 'message': 'Camera permission status checked', 'data': { status: status.camera }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-check', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      if (status.camera !== 'granted') {
        const result = await Camera.requestPermissions({ permissions: ['camera'] });
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:29', 'message': 'Camera permission requested', 'data': { result: result.camera }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-check', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        return result.camera === 'granted';
      }
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:35', 'message': 'Camera permission already granted', 'data': { status: status.camera }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-check', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      return true;
    } else {
      // Web: getUserMedia will request permissions automatically
      return true;
    }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:33', 'message': 'Permission request error', 'data': { error: error instanceof Error ? error.message : String(error) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-check', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Get camera stream for video (works on both web and mobile)
 */
export const getCameraStream = async (): Promise<MediaStream | null> => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:40', 'message': 'Getting camera stream - start', 'data': {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-stream', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    // Request permissions first
    const hasPermission = await requestCameraPermissions();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:44', 'message': 'Permission check result', 'data': { hasPermission }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-stream', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    // Use getUserMedia (works in Capacitor WebView too)
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:49', 'message': 'Calling getUserMedia', 'data': { hasMediaDevices: !!navigator.mediaDevices }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-stream', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:57', 'message': 'getUserMedia success', 'data': { streamId: stream.id, active: stream.active, tracks: stream.getTracks().length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-stream', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    return stream;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'cameraService.ts:61', 'message': 'Camera stream error', 'data': { error: error instanceof Error ? error.message : String(error), name: error instanceof Error ? error.name : 'unknown' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'camera-stream', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
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

