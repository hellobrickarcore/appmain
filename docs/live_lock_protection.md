# 🔒 Live Lock Protection

This document outlines the protection boundaries for the HelloBrick Live Scanner.

## Protected Modules
The following directories and files are considered **HARD-LOCKED** and should not be refactored, rewritten, or modified unless absolutely necessary for a critical runtime fix:

- `src/services/enhancedCameraService.ts` (Camera lifecycle & focus)
- `src/components/DetectionOverlayLayer.tsx` (Live AR rendering)
- `src/utils/coordinateMapping.ts` (Box anchoring)
- `ScannerScreen.tsx` (Live loop & warmup logic)

## Core Principle
- **Live Mode**: Fast, approximate, and marker-locked. It must remain stable for real-time guidance.
- **Capture Mode**: Deep, truthful, and high-accuracy. This is where dense analysis and LEGO-only filtering happen.

Any changes to detection accuracy, color sensitivity, or dimension inference must be implemented in the **Capture Pipeline** without altering the timing or stability of the Live Tracking loop.

## Global Flags
- `LIVE_SCANNER_LOCKED = true`
- `LIVE_TRACKING_LOCKED = true`
- `LIVE_OVERLAY_LOCKED = true`
