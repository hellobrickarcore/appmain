# Scanner Core Recovery & Lifecycle Design

## 1. Explicit Detector States (`DetectorState`)
The core problem in the previous implementation was an unmanaged state. The new `scanner-core` enforces a strict State Machine:

*   **`idle`**: Camera is off, detector is uninitialized.
*   **`loading`**: Component has mounted, camera permissions requested, models loading.
*   **`warming`**: Initial `detectBricks` call is executing on a dummy canvas to load tensors into GPU memory.
*   **`ready`**: Warmup succeeded. The system is armed for Live Inference.
*   **`detecting`**: Live inference loop is actively engaged.
*   **`warm_failed`**: Warmup rejected. The UI must present a recovery action (e.g., "Retry connection").
*   **`recovering`**: Watchdog detected a timeout and the system is attempting a controlled restart.
*   **`stopped`**: User navigated away or app went to background.

## 2. Detect-Loop Timeout Handling
To prevent "stuck loops", the `detectLoop` must implement:
1.  **Concurrency Lock**: Only one `fetch` to `/api/detect` at a time.
2.  **Explicit Timeout**: An `AbortController` will wrap the `fetch` with a 3000ms timeout for live frames.
3.  **Stale Discard**: If the returned frame index does not match the requested index chronologically, discard the payload to prevent "rubber-banding" overlays.

## 3. Scanner Lifecycle (Route & App Visibility)
*   **On Enter**: `idle` -> `loading` -> `warming` -> `ready`.
*   **On Leave**: `stopped`. The `AbortController` triggers to kill any inflight inferences. Camera tracks are actively stopped.
*   **On App Hidden**: Transitions immediately to `stopped`.
*   **On App Visible**: Re-runs the `On Enter` flow. Previous detector state is treated as invalid.

## 4. Overlay Cleanup Rules
Ghost boxes occur when stale state persists. Overlays must be wiped explicitly:
1.  When transitioning to `stopped` or `recovering`.
2.  When a capture finishes (to prepare for the result screen).
3.  When the camera resolution or aspect ratio changes unexpectedly. 
