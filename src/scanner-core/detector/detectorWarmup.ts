import { detectBricks } from './detectorManager';
import { ScannerError } from './detectorTypes';

import { getDetectionAPIUrl } from './detectorLoader';

/**
 * 🔒 DETECTOR WARMUP
 * Sends an initial tiny dummy canvas to the detection service.
 * Forces the GPU to load the tensor models before the high-res live stream begins.
 * Essential to prevent the first frame from causing a 5000ms stutter.
 */
const WARMUP_TIMEOUT_MS = 15000;
const HEALTH_TIMEOUT_MS = 5000;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const apiUrl = getDetectionAPIUrl();
    const endpoint = apiUrl.endsWith('/api') ? `${apiUrl}/health` : `${apiUrl}/api/health`;
    console.log(`[ScannerCore:Health] Pinging API URL: ${apiUrl} -> Endpoint: ${endpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    
    const res = await fetch(endpoint, { 
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    console.log(`[ScannerCore:Health] Response status: ${res.status} ok: ${res.ok}`);
    return res.ok;
  } catch (err: any) {
    console.error(`[ScannerCore:Health] Backend unreachable:`, err.message || err);
    return false;
  }
};

export const runDetectorWarmup = async (): Promise<boolean> => {
  console.log("[ScannerCore:Warmup] Checking backend health before warmup...");
  
  const isHealthy = await checkBackendHealth();
  if (!isHealthy) {
     console.error("[ScannerCore:Warmup] Backend health check failed. Aborting warmup.");
     const err: ScannerError = {
        stage: 'warmup',
        message: 'Backend API is completely unreachable. Is the server running?',
        detectorReady: false,
        cameraReady: true,
        ts: Date.now()
     };
     throw err;
  }
  
  console.log("[ScannerCore:Warmup] Initiating detector warmup...");
  
  try {
    const dummyCanvas = document.createElement('canvas');
    dummyCanvas.width = 64; 
    dummyCanvas.height = 64;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[ScannerCore:Warmup] Timeout exceeded (${WARMUP_TIMEOUT_MS}ms). Aborting fetch.`);
      controller.abort();
    }, WARMUP_TIMEOUT_MS);
    
    // We expect this to execute and hit detectorManager, wrapping errors cleanly
    await detectBricks(dummyCanvas, { 
      sessionId: 'warmup',
      mode: 'live_scanner',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("[ScannerCore:Warmup] Success. Detector armed.");
    return true;
  } catch (error: any) {
    if (error.stage === 'warmup') {
      // Already structured by detectorManager
      throw error;
    }
    
    // Fallback if something outside the manager failed
    const structuredErr: ScannerError = {
      stage: 'warmup',
      message: error.message || 'Unknown warmup failure',
      stack: error.stack,
      detectorReady: false,
      cameraReady: true,
      ts: Date.now()
    };
    
    throw structuredErr;
  }
};
