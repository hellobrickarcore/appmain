/**
 * Explicit Detector Lifecycle States
 */
export type DetectorState =
  | "idle"          // Camera off, uninitialized
  | "loading"       // Camera acquiring, model loading
  | "backend_unreachable" // Health check failed, cannot start
  | "ready"         // Detector ready for sequence
  | "warming"       // First inference to load GPU tensors
  | "warm_failed"   // Warmup failed permanently
  | "detecting"     // Detect loop running actively
  | "capture_ready" // Temporary state for capture override
  | "recovering"    // Timeout triggered, attempting restart
  | "failed"        // Fatal unrecoverable error
  | "stopped";      // Explicit teardown/unmount

export interface ScannerError {
  stage: "warmup" | "detect" | "capture" | "init";
  message: string;
  stack?: string;
  status?: number;
  responseText?: string;
  detectorReady: boolean;
  cameraReady: boolean;
  frameIndex?: number;
  ts: number;
  // Loader Diagnostics
  loaderType?: string;
  source?: string;
  expectedFormat?: string;
  actualFormat?: string;
}
