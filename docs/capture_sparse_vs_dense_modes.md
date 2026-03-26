# Capture Modes: Sparse vs Dense

HelloBrick adapts its detection pipeline based on scene complexity to prevent both overcounting (hallucinations) and undercounting (missing single bricks).

## Dense Mode (Mass Scan)
- **Use Case**: Piles of 20–100+ bricks.
- **Logic**: Multi-scale (640px, 1024px) + 2x2 Tiled detection.
- **Filtering**: Strict NMS and duplicate suppression to prevent overcounting.

## Sparse Mode (Fallback)
- **Use Case**: 1–5 bricks, often centered.
- **Trigger**: Activated if standard capture returns 0 bricks but raw candidates have high geometric scores.
- **Logic**:
    - Relaxed confidence thresholds for the single dominant candidate.
    - Enhanced LEGO-only verification (Geometry + Studs).
    - Prevents "Zero Result" frustration when one clear brick is in shot.

## Truthful Reporting
The `ScanFrameResponse` includes a `summary` object that details exactly which mode was used and how many candidates were rejected, providing transparency into the AI's decision-making.
