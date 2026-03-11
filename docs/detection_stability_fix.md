# Detection Stability & Drift Fix Report

This report explains the technical failures in the HelloBrick detection overlay system and the implemented solutions.

## The "Drift to Bottom" Problem
**Cause**: Stale track data from the server was being rendered using obsolete coordinate mapping or large `yMin` values that accumulated when the server lost a track but kept it in the "trackedObjects" array without updating its status.
**Fix**: 
1. **Hard Expiry**: Any track not updated by the server within 2 frames is locally hidden or removed.
2. **Bounds Gating**: Overlays are strictly clamped to the current `previewLayout` viewport.

## Temporal Instability (Flickering)
**Cause**: Boxes were rendered frame-by-frame as raw rectangles from the inference server, which has slight jitter.
**Fix**:
1. **Exponential Moving Average (EMA)**: Smooths box coordinates over a 3-frame window.
2. **Grace Period**: If a track is lost, we continue rendering the last valid box for 1,000ms with a reduced opacity, effectively "holding" the lock while the AI reacquires.

## Technical Rules Implemented
- **Track ID Locking**: We prioritize `trackId` over raw detection indices.
- **Mapping Recalculation**: `PreviewLayout` is recalculated on every frame to ensure synchronization with the video element's actual rendering size.
