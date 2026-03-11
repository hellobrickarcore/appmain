# HelloBrick Technical Architecture & Fixes

## Detection Stability System
The core improvement was the integration of a temporal smoothing layer on top of the raw YOLO detections.

### coordinate_transformer.ts (Logic applied in ScannerScreen.tsx)
- **Input**: Raw `[ymin, xmin, ymax, xmax]` normalized to 0..1000.
- **Smoothing**: `smoothed = (prev * 0.7) + (current * 0.3)`.
- **Stabilization**: Tracks are stored in `smoothedOverlays.current` and only removed after `lastSeen < now - 1000ms`.

## Capture & Review Workflow
We shifted from a "Snap then Scan" model to a "Live Snap" model.
1. **Live Scanning**: Detections are continuous.
2. **Snapshot**: On capture, we freeze the *current* frame and its *current* bounding boxes.
3. **Crop Extraction**: We use a hidden `<canvas>` to extract sub-images of each brick based on the bounding box.
4. **Data Injection**: The extracted DataURLs are injected into the `DetectionOverlay` objects, which are then passed to the review list.

## Layout System
The app uses a strict Tailwind CSS configuration for viewport management.
- **dvh units**: Essential for Safari on iOS 13+ to avoid the "shifting address bar" bug.
- **safe-area-env**: Used in combination with standard padding to handle the dynamic notch size across different iPhone models (Pro Max vs. mini).

## Component Map
- `App.tsx`: Navigation Router and Root Viewport Management.
- `BottomNav.tsx`: Persistent Tab Navigation.
- `ScannerScreen.tsx`: Core AR/Computer Vision loop.
- `CollectionScreen.tsx`: Persisted data view.
- `H2H`: Multiplayer socket/proto logic wrapper.
