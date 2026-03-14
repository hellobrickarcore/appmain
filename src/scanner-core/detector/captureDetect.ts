import { ScannerError } from './detectorTypes';
import { runCaptureInference, CapturePipelineResult } from './captureDetector';

const CAPTURE_TIMEOUT_MS = 12000;

export { type CapturePipelineResult };

/**
 * 🔒 CAPTURE PIPELINE 
 * The capture trigger must route through the robust detectorManager 
 * and log errors specifically under `stage: 'capture'`.
 */
export const executeCapturePipeline = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  liveBricks: any[] = []
): Promise<CapturePipelineResult> => {

  console.log("[ScannerCore:Capture] Initializing dense mass_capture...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
       console.error(`[ScannerCore:Capture] Timeout exceeded (${CAPTURE_TIMEOUT_MS}ms). Aborting fetch.`);
       controller.abort();
    }, CAPTURE_TIMEOUT_MS);

    const result = await runCaptureInference(video, canvas, liveBricks, {
      sessionId: `capture_${Date.now()}`,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return result;

  } catch (error: any) {
    if (error.stage === 'capture') {
       throw error;
    }
    
    // Fallback if structured handling missed it
    const scannerErr: ScannerError = {
      stage: 'capture',
      message: error.message || 'Capture Pipeline Failure',
      stack: error.stack,
      detectorReady: false,
      cameraReady: true,
      ts: Date.now()
    };
    throw scannerErr;
  }
};
