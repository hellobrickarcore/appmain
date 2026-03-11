# HelloBrick: iOS 13+ Technical Audit

## 1. Compatibility & Layout
- **Target**: iOS 13.0+ (SwiftUI/WebKit parity)
- **Safe Area**: Implemented using `env(safe-area-inset-*)` and `min-h-[100dvh]` across all core screens.
- **Backwards Compatibility**: Uses standard CSS Flexbox/Grid; no modern-only features (e.g., container queries) that would break older Safari versions.

## 2. Scanning Pipeline (Phase 1-9)
- **Viewport**: 100% cover with dynamic aspect-ratio mapping.
- **Post-Processing**: Weighted fusion model for `finalConfidence` calculation.
- **Holistic Mode**: Multi-frame accumulation (NMS-lite) with 20px spatial deduplication.

## 3. Storage & Data
- **Local Persistence**: `localStorage` used for sub-second UI updates.
- **Cloud Sync**: Supabase integration for background data preservation.
- **Image Crops**: Base64 encoded JPEG thumbnails (high-compression) for minimal memory footprint.

## 4. Performance Benchmarks
- **Inference Latency**: ~250-400ms (Frame Size dependant).
- **FPS**: Stabilized at 10-15 FPS on iPhone 12+.
- **Memory**: Optimized canvas reuse to prevent WebGL context loss.

## 5. Known Constraints
- **Lighting**: Direct top-down shadows can affect depth estimation (geometry confidence).
- **Stacking**: Partially occluded bricks will have lower confidence scores.
