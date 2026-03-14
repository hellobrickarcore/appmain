# Detector Load Failure Root Cause

## The Problem
The HelloBrick scanner was failing silently during initialization with the generic error:
`[ScannerCore Error] warmup: Load failed`

Crucially, the iOS device logs showed that `detectorReady: true` was being assigned to the error object even though the inference completely failed. This false-ready state then allowed both the live `detectLoop` and the user-triggered `executeCapturePipeline` to send continuous failed network requests to the backend, resulting in a spam loop.

## The Inner Cause
The generic "Load failed" message originated from inside Capacitor/iOS WebKit when `fetch` encountered a strict network policy violation.
- Browsers inherently swallow the specific socket-level reasons inside cross-origin/local fetch errors for security reasons.
- The iOS App securely blocks outbound `http://192.168...` LAN requests from inside the webview as "Insecure App Transport".

## The Fix
1. **Network Proxy**: We initialized an `ngrok` backend proxy so the iOS device can securely talk to the model server over `https://`.
2. **Detector Loader Isolation**: We encapsulated all backend `fetch` logic into a single file: `src/scanner-core/detector/detectorLoader.ts`.
3. **Diagnostic Extraction**: The new loader heavily parses `TypeError: Failed to fetch` and explicitly captures the `response.status`, `responseText`, and `loaderType` ('remote_backend') to surface *exact* diagnosis, rather than the browser's generic string.
4. **State Machine Correction**: The new loader ensures `detectorReady` is marked `false` upon any network rejection or JSON parse failure. 
5. **Gating**: `detectLoop` and `executeCapturePipeline` (via `ScannerScreen`) now physically block execution paths if `detectorState !== 'ready'`, preventing blind UI spam.
