# Weighted Confidence Model (Phase 12)

## Problem
Single-value confidence scores were untrustworthy and didn't reflect the complexity of brick detection.

## Solution
Implemented a 4-channel weighted fusion model:
1. **Geometry (20%)**: YOLO frame proposal confidence.
2. **Identity (40%)**: Specific part number / feature matching.
3. **Color (25%)**: Perceptual LAB distance from canonical LEGO palette.
4. **Dimensions (15%)**: Bounding box aspect-ratio matching.

## Calculation
`finalConfidence = (geo * 0.20) + (id * 0.40) + (color * 0.25) + (dim * 0.15)`

## UI Result
The Review page now renders these sub-components as progress bars, making the final "Match %" transparent and trustable.
