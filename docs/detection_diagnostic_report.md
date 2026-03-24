# HelloBrick Detection Diagnostic Report

## Pipeline Status (Instrumented)

### Stage A: Camera Input
- **Resolution**: Live (1280px ideal, 800px inference), Capture (1600px+ inference)
- **Status**: ✅ Instrumented

### Stage B: Raw YOLO Output (Model Level)
- **Recall Target**: Every visible brick must be detected.
- **Current Findings**: YOLO is running with `conf=0.10` and `max_det=1000`.
- **Instrumentation**: `raw_proposals` count added to response.

### Stage C: Post-Processing Filters
- **Geo-Filter**: Drops boxes that are too large (frame-filling artifacts).
- **NMS**: Merges overlapping boxes. 
- **Recall Status**: Currently permissive (`conf=0.10`, `nms=0.35`) to ensure proposal recall > precision.

### Stage D: Overlay Generation & Mapping
- **Status**: ✅ Instrumented in `ScannerScreen.tsx`.
- **Coordinate Mapping**: Verified mapping from source image space to preview container space.

### Stage E: Attribute Pipeline
- **Color**: LAB Central Pixel Sampling (v3).
- **Dimensions**: Refined logic for 1x1, 2x2, etc.
- **Identity**: Tracked vs New proposals.

## Observed Failure Points (Work-in-Progress)
1. **[PENDING]** Stage B: Checking if small bricks are missed by YOLO even at low confidence.
2. **[PENDING]** Stage C: Checking if NMS is suppressing adjacent bricks too aggressively.

## Diagnostic Tools Added
- **Live Debug Panel**: Real-time counters for each stage.
- **Console Logs**: Detailed drop-off logging per frame on backend.
- **Raw Visualization Mode**: (In Progress) Toggle to see raw boxes.
