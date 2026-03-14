import { SCANNER_CORE_LOCKED } from '../locks/scannerCoreLock';
import { runLiveInference } from './liveDetector';
import { ScannerError } from './detectorTypes';
import { ScanFrameResponse } from '../../types/detection';
import { detectorStateMachine } from './detectorStateMachine';

/**
 * Configuration for the detect loop strict guards.
 */
const LIVE_INFERENCE_TIMEOUT_MS = 2000;
const MAX_CONSECUTIVE_FAILURES = 5;

export interface DetectLoopCallbacks {
  onSuccess: (response: ScanFrameResponse) => void;
  onError: (error: ScannerError) => void;
}

/**
 * 🔒 DETECT LOOP
 * Guarded, single-concurrency inference loop.
 * Prevents overlapping fetch requests, handles timeouts via AbortController,
 * and tracks consecutive failures for controlled recovery.
 */
export class ScannerDetectLoop {
  private isRunning: boolean = false;
  private isDetecting: boolean = false;
  private sessionId: string;
  private videoElement: HTMLVideoElement | null = null;
  private frameIndex: number = 0;
  private consecutiveFailures: number = 0;
  private currentAbortController: AbortController | null = null;
  private callbacks: DetectLoopCallbacks;

  constructor(sessionId: string, callbacks: DetectLoopCallbacks) {
    if (!SCANNER_CORE_LOCKED) console.warn("SCANNER CORE UNLOCKED");
    this.sessionId = sessionId;
    this.callbacks = callbacks;
  }

  public setVideoElement(video: HTMLVideoElement | null) {
    this.videoElement = video;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.consecutiveFailures = 0;
    detectorStateMachine.startDetecting();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    this.isDetecting = false;
    this.cancelCurrentInference();
    // CRITICAL: We only PAUSE detecting. State becomes `ready`. It does NOT become `idle`.
    detectorStateMachine.pauseDetecting();
  }

  private cancelCurrentInference() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  private async loop() {
    if (!this.isRunning) return;

    if (this.isDetecting) {
      // Loop will re-trigger naturally when current inference is done
      return; 
    }

    if (!this.videoElement || this.videoElement.readyState < 2 || this.videoElement.videoWidth === 0) {
      // Wait for video to be ready before firing
      requestAnimationFrame(() => this.loop());
      return;
    }

    this.isDetecting = true;
    
    // Create new abort controller per inference
    const controller = new AbortController();
    this.currentAbortController = controller;
    
    // Safety timeout wrapper
    const timeoutId = setTimeout(() => {
      if (this.currentAbortController === controller) {
         console.warn(`[ScannerCore] Live inference timeout triggered (${LIVE_INFERENCE_TIMEOUT_MS}ms). Aborting fetch.`);
         controller.abort();
      }
    }, LIVE_INFERENCE_TIMEOUT_MS);

    try {
      this.frameIndex++;
      const currentFrameIndex = this.frameIndex;

      const response = await runLiveInference(this.videoElement, {
        sessionId: this.sessionId,
        frameIndex: currentFrameIndex,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!this.isRunning) return; // Discard if stopped while awaiting
      
      // Stale discard logic: if a massive rubber-band occurs, drop the old frame
      if (response.frameIndex < this.frameIndex - 2) {
         console.warn(`[ScannerCore] Discarding stale frame ${response.frameIndex} (Current: ${this.frameIndex})`);
      } else {
         this.consecutiveFailures = 0; // Reset
         detectorStateMachine.recordInferenceSuccess();
         this.callbacks.onSuccess(response);
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Ignore active cancellations 
      if (error.name === 'AbortError' || error.message?.includes('The user aborted a request')) {
        console.log('[ScannerCore] Inference aborted/timed out naturally. Detector remaining in ready state.');
        detectorStateMachine.recordInferenceAbort();
      } else {
        this.consecutiveFailures++;
        detectorStateMachine.recordInferenceAbort();
        this.callbacks.onError(error as ScannerError);

        if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          console.error(`[ScannerCore] Max consecutive failures reached (${MAX_CONSECUTIVE_FAILURES}). Halting loop for recovery.`);
          this.isRunning = false;
          detectorStateMachine.startRecovering();
          return; // Kill loop
        }
      }
    } finally {
      if (this.currentAbortController === controller) {
        this.currentAbortController = null;
      }
      this.isDetecting = false;
      
      if (this.isRunning) {
        requestAnimationFrame(() => this.loop());
      }
    }
  }
}
