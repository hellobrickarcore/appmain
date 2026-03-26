# Capture Mass Scan & Reporting

HelloBrick capture mode is designed for truthfully counting large collections (50–100+ bricks) in a single image.

## Multi-Stage Capture Pipeline

1. **Frozen Input**: The video stream is frozen to prevent motion blur during high-res processing.
2. **Multi-Scale Passes**:
   - **640px**: Fast detection of large background elements.
   - **1024px**: High-resolution detection for dense clusters.
3. **2x2 Tiled Detection**: The 1024px image is split into 4 tiles to improve recall of small bricks in high-density scenes.
4. **Global Fusion**: All proposals from different scales and tiles are merged into a single coordinate space.
5. **Truthful Filtering**: Strict NMS and brand-verification ensure duplicates and non-LEGO items are removed.

## Truthful Reporting

The scan report separates detections into three buckets:
1. **Official LEGO**: Confirmed brand geometry (Counts toward total).
2. **Uncertain Clones**: Visually identical but brand-unclear (Excluded from total).
3. **Rejected Non-LEGO**: Known clone systems or geometry noise (Excluded from total).

## Sparse Scene Protection
When only a few bricks are present, the system enters **Conservative Recount Mode** to prevent hallucinations or overcounting caused by multi-scale merging.
