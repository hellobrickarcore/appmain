# Detector Loader Lock

## Security and Diagnostics Boundary
The `src/scanner-core/detector/detectorLoader.ts` module is locked to prevent regressions in error handling.

`export const DETECTOR_LOADER_LOCKED = true;`

## Purpose
The YOLO backend or local inferencing engines are uniquely vulnerable to silent failures when running inside an iOS/Android Capacitor WebView. Because browsers swallow specific network failure causes to prevent cross-origin leaks, naive `fetch` usage results in useless `Load failed` or `TypeError: Failed to fetch` errors under the hood.

To guarantee that the HelloBrick scanner never swallows the true cause of a broken model, **all requests must pass through this single loader module.**

## Rules
1. **Never use `fetch` for detections outside this module.**
2. **Never swallow `response.ok === false`.** If a request fails, the exact HTTP status and `responseText` must be logged.
3. **Always populate `LoaderDiagnostic`.** It must contain the exact `source` URL being fetched and the `loaderType` (e.g. `remote_backend`, `onnx`, etc).
4. **Throw Detailed Errors.** The thrown object must contain both the original `Error` object (for stack traces) and the `diagnostic` payload.

## Modifying the Loader
If you need to add ONNX, TensorFlow.js, or local bundled `.pt` model loading in the future, you must implement them as new branches within `detectorLoader.ts`, populating the same diagnostic contract.
