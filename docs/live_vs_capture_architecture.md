# HelloBrick Scanner Architecture (Live vs Capture)

The scanner now operates as a Two-Phase Vision Pipeline to balance speed during guidance and accuracy during results.

## Phase 1: Live Guidance (Live Scanner)
- **Goal**: High FPS (3-5 fps), stable boxes, low latency.
- **Resolution**: 800px max dimension.
- **Logic**: 
  - Single detection pass per frame.
  - **Temporal Tracking**: Uses a tracker to maintain box persistence for up to 10 frames (3 seconds) even if individual detections drop.
  - **State Machine**: Monitors health; if the request fails consistently, it enters `recovering` backoff.

## Phase 2: Holistic Capture (Mass Capture)
- **Goal**: Maximum recall, truthful counts, exhaustive detection.
- **Resolution**: 1024px multi-scale + 512px tiled.
- **Logic**:
  - **Multi-Pass Inference**: Run one global detection and 4 tiled detections (2x2 grid).
  - **Coordinate Remapping**: Detections from tiles are remapped back to the coordinate space of the original high-resolution frame.
  - **NMS Deduplication**: All detections are merged and filtered via IoU to remove duplicates.
  - **State Isolation**: The live detection loop is paused while `capture_detecting` is active to maximize resources.

## Diagnostics
The **Diagnostic Panel** (Bug icon) provides real-time visibility into:
- **State**: Current position in the state machine.
- **Stage B-D Drop**: Identifies where detections are filtered (Raw -> Geometry Check -> NMS).
- **Inference Latency**: Server round-trip time.
