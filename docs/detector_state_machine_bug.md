# The Detector State Machine Bug: False Idle

## Overview
A critical bug was discovered where the HelloBrick scanner would successfully connect to the YOLO backend, successfully run the dummy warmup inference, and officially arm the detector—only to immediately revert to `idle` upon the first natural timeout of the live inference stream.

## Root Cause
The issue stemmed from an incorrect semantic mapping within the `detectLoop.stop()` function. 
When the `detectLoop` was intentionally paused—either by a natural network timeout leading to a recovery tick, or when the user tapped the Capture button (which pauses the live stream to grab a high-res frame)—`detectLoop.stop()` was invoked.

Inside `detectLoop.stop()`, a direct call to `callbacks.onStateChange('idle')` was hardcoded. 
Because the `ScannerScreen.tsx` naively mapped this straight into its React hook with `setDetectorState(state)`, the entire app's awareness of the detector's readiness was destroyed.

When the Capture Pipeline subsequently tried to run, it immediately failed with:
`[ScannerCore] Blocked capture: Detector is not ready. Current state: idle`

## The Fix
1. **Removed UI State Coupling:** `ScannerScreen.tsx` no longer has a `setDetectorState` setter. It merely observes a centralized singleton.
2. **Created `detectorStateMachine.ts`:** We introduced a strict class that manages the `DetectorState` union type.
3. **Fixed `detectLoop.stop()`:** Halting the live inference loop now correctly transitions the physical loop state to dormant, while calling `detectorStateMachine.pauseDetecting()`. This explicitly returns the scanner to `ready`, **never** `idle`. 

`idle` is now strictly reserved for when the scanner is entirely unmounted or backgrounded by the OS.
