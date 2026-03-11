# Scanner Return Reliability

## The Problem
Previously, the ScannerScreen camera would initialize correctly on the first launch but would consistently fail to re-initialize or become unresponsive when navigating away and returning to the scanner tab. This was caused by:
1. Improper tearing down of `MediaStream` tracks during component unmount
2. Failing to check `document.hidden` visibility state
3. Leaving the detector loop running in the background when the scanner wasn't active, leading to memory leaks and locking up the inference engine

## The Fix
1. **Explicit Track Management**: Implemented `stopCamera()` which explicitly calls `.stop()` on every active track in `streamRef.current` when the component unmounts or app is hidden.
2. **Visibility API**: Added a listener for the `visibilitychange` event. The camera now explicitly pauses when the app goes into the background and resumes on foreground.
3. **Inference Loop Cleanup**: Ensured `requestAnimationFrame` or `setInterval` for the detection loop is cleared, and `isDetectingRef` resets correctly so that consecutive renders don't double-initialize the loop.
4. **Lifecycle Instrumentation overlay**: Added a debug mode overlay that confirms route active state, camera stream status, detector state, and inference loop ms.

The scanner is now resilient to multi-tab navigation and app backgrounding.
