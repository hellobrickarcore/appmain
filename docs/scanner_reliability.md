# Scanner Reliability & Lifecycle Fixes

## Problem
The scanner would often fail after the user navigated away and returned, or if the app was minimized/backgrounded.

## Solution
1. **Explicit Start/Stop**: Added `active` guard to `useEffect` to prevent race conditions during rapid navigation.
2. **Track Management**: Explicitly stopping all MediaStream tracks and nulling `srcObject` on unmount.
3. **Visibility Listeners**:
   ```typescript
   document.addEventListener("visibilitychange", () => {
     if (document.hidden) stopCamera(); else startCamera();
   });
   ```
4. **Watchdog**: A 10s watchdog monitors the `lastInferenceRef`. If no frames are processed, a Reset overlay is displayed.
