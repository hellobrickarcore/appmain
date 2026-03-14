# Scanner Core Failure Analysis

## Symptoms Observed
1. **Warmup Failure**: The initial `warmup()` call in `ScannerScreen.tsx` failed immediately, but the UI continued trying to scan.
2. **Infinite Detect Loop Spam**: The `detectLoop` continued to fire requests against an uninitialized or broken detector backend.
3. **Swallowed Errors**: Network errors, CORS errors, and model loading errors were all logged simply as `{}` to the console, making debugging impossible.
4. **Watchdog Firing Endless Warnings**: A `setTimeout` watchdog correctly identified a "stuck inference loop", but had no mechanism to recover the scanner other than logging a warning.
5. **Ghost Boxes / Silence**: No bounding boxes rendered because no valid detections were generated.

## Root Cause Analysis
### 1. Lack of Explicit Detector State Gates
The previous `ScannerScreen` used a generic string `phase` (`warmup`, `preview`, `scanning`). The detect loop checked `phase === 'scanning'`, but it *never checked if the detector was actually ready*. 
When the `warmup` promise rejected, the app eventually advanced the phase to `scanning` anyway, causing the detection loop to request inferences from a broken detector.

### 2. Poor Error Handling in `brickDetectionService.ts`
The backend caller (`detectBricks`) caught errors but failed to structure them. When the backend returned a 500 error or a network timeout occurred, the error object was stringified or thrown. In the UI, `catch (err: any)` would log `console.error("Camera error:", err);`. If `err` was an empty throw or a non-standard Error object, it logged as `{}`.

### 3. Lack of Inference Cancellation
The `detectLoop` fired asynchronously. If a frame took 5 seconds to process (due to network latency or a bogged-down server), the frontend might fire another 20 frames during that time. This caused cascading timeouts and memory pressure on the browser pipeline.

### 4. Brittle Lifecycle Management
Navigating away from the scanner component (e.g., to the Profile tab) didn't always stop the camera tracks or cancel pending inferences. Returning to the scanner attempted to re-acquire the camera while the old tracks were still "live" but unattached to a video element, leading to blank screens.

## Conclusion
The scanner core cannot be an unstructured collection of React `useEffect` hooks. It must be a managed state machine with strict gates (Loading -> Warmup -> Ready -> Detecting -> Error -> Recovery).
