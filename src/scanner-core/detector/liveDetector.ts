import { detectBricks } from './detectorManager';
import { ScanFrameResponse } from '../../types/detection';

export const VISION_PIPELINE_LOCKED = true;

/**
 * 🔒 LIVE DETECTOR (AR TRACKING)
 * Extreme Speed Pipeline.
 * 
 * Rules:
 * 1. Resolution is capped at 416px to guarantee high FPS on mid-tier mobile.
 * 2. `mode: 'live_scanner'` instructs the backend to SKIP attribute estimation 
 *    (no color sampling, no dimension heuristics, no OpenCV contour tightening).
 * 3. Confidence is natively fast-filtered at 0.35 by the backend.
 */
export const runLiveInference = async (
  video: HTMLVideoElement,
  options: {
    sessionId: string;
    frameIndex: number;
    signal?: AbortSignal;
  }
): Promise<ScanFrameResponse> => {
  return await detectBricks(video, {
    mode: 'live_scanner',
    imgsz: 416, // Fast AR
    sessionId: options.sessionId,
    frameIndex: options.frameIndex,
    signal: options.signal
  });
};
