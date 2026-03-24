# White Brick Detection Fix

White LEGO bricks are often missed due to overexposure or lack of contrast against light backgrounds. This recovery path ensures they are detected reliably.

## Technical Approach

### 1. Preprocessing
Before detection, captured frames undergo:
- **Auto-Exposure Normalization**: Preventing highlight clipping that erases stud detail.
- **Local Contrast Enhancement (CLAHE)**: Bringing out edges on low-saturation white surfaces.

### 2. LAB Color Analysis
We use the **LAB color space** for verification because it separates luminance (L) from color channels (A, B).
- White bricks have high L and near-zero A/B.
- This allows us to detect "lightness" patterns (studs/edges) even when chroma is absent.

### 3. Edge & Geometry Priority
For white candidates, we reduce reliance on color-saturation confidence and increase the weight of:
- **Geometry Confidence**: Aspect ratios and straight edges.
- **Stud Pattern**: Presence of circular blobs on the top surface.

## Summary
By using `white_brick_recovery_used: true`, the system relaxes color-threshold strictness in favor of geometric truth for light-colored objects.
