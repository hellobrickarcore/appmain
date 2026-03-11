# Capture & Review Integrity Report

This report documents the fixes for data preservation and visual evidence during the brick capture flow.

## 1. Truthful Data Persistence
**Issue**: Previously, only part names were preserved, losing color and confidence data during the transition from "scanning" to "results".
**Solution**:
- The `handleCapture` function now snapshots the entire `liveBricksRef` array, including `colorName`, `brickFamily`, `dimensionsLabel`, and `geometryConfidence`.
- No Fabrication: Only bricks verified by the AI during the scan are shown.

## 2. Visual Evidence: Brick Crops
**Issue**: Reviewing cards without images felt disconnected from the physical world.
**Solution**:
- **Thumbnail Generation**: Upon capture, the app uses an offscreen canvas to crop the source frame at the exact coordinates of each detection.
- **Data Model Update**: Each `BrickProposal` now contains a `cropImage` (Base64/Blob) which is rendered in the review list and persisted to the collection.

## 3. High Fidelity (Phase 13/14)
- **1080p Source**: High-res input ensures crops are sharp enough to identify studs and colors correctly.
- **Truthful Confidence**: Actual `identityConfidence` values from the YOLO model are rounded and displayed as percentages.
