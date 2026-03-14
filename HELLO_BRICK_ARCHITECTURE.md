# HelloBrick: Technical Architecture Overview

This document summarizes the "Screen Structure" and "Camera Tech" as implemented in the current build.

## 1. Screen Structure (Scanner Workflow)

The scanning experience is built as a **Three-Phase State Machine** in `ScannerScreen.tsx`:

### Phase A: Live Scanning (`phase === 'scan'`)
- **Real-time Overlays**: Canvas-based 2D overlays that track bricks at ~3fps (300ms interval).
- **Sticky Interaction**: Using a **Stability Controller** (`liveBricksRef`) to ensure bounding boxes don't flicker. Objects are only dropped if they aren't seen for multiple consecutive frames.
- **Visual Feedback**: Pulse animations and "locking" indicators when a brick achieves `isStable` status.

### Phase B: High-Res Capture (`phase === 'capturing'`)
- **1024px Snapshot**: When you tap, we switch from a 480p/720p stream to a high-resolution 1024px buffer.
- **Tiled Inference**: The backend processes this high-res image using a **30% overlap tiling strategy**, specifically optimized for dense brick piles where bricks overlap.
- **Inference Masking**: Detections are filtered through a Non-Maximum Suppression (NMS) layer on the backend and further refined on the frontend.

### Phase C: Results & Validation (`phase === 'results'`)
- **Fuzzy Merging**: We merge the bricks seen in **Live Scanning** with the ones found in the **High-Res Capture**. 
- **Terminology**: Labeled definitively as "**Bricks Found**" to match UX goals.
- **Persistence**: Bricks are staged for saving to the user's permanent collection (`saveBricks`).

## 2. Camera Technology (Stability & Recall)

### Stability Controller (`LiveBricks` Sync)
We solved the "temperamental" bounding box problem by implementing a **Geometric Lock**:
- The app maintains a reference to every brick seen with >50% confidence.
- Even if a single frame fails to detect a brick (due to angle or motion blur), the stability logic "holds" the box for a grace period, providing a much smoother user experience.

### Unified Confidence Thresholds
- **Frontend Floor**: `0.15` (GEOMETRY_RENDER_MIN).
- **Backend Floor**: `0.15` (conf_floor).
- Bynifying these, we ensured that anything the camera sees can be processed by the backend, maximizing recall for small or angled bricks.

### Centroid Merging
To prevent duplicate "Proposed" bricks, we use a **Centroid Intersection** algorithm. It compares the center-point of live-tracked bricks vs. newly captured bricks. If they are within a 5% coordinate margin, they are treated as the same unique object.

---
*Build state: Optimized for Mobile Access via Ngrok/Cloudflare.*
