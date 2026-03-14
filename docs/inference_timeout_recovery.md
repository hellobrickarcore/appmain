# Inference Timeout & Recovery Architecture

## Problem
In mobile environments, scanning physical objects dynamically means occasionally dropping network packets or suffering from iOS Wi-Fi latency spikes. Previously, if `fetch` timed out, it was treated as a catastrophic failure that tore down the entire scanner state, rendering the app unusable.

## The New Architecture
The Scanner Core now explicitly differentiates between "Natural Dropouts" and "Fatal Disconnects".

### Explicit Timers
Timers are now enforced at the `fetch` execution layer via `AbortController`, preventing the app from waiting indefinitely for a lost HTTP response while frames back up.
- **Warmup Timeout (`WARMUP_TIMEOUT_MS = 15s`)**: The longest timeout. Cold starts of the YOLO backend require loading PyTorch models into VRAM, which takes 5-10 seconds.
- **Capture Timeout (`CAPTURE_TIMEOUT_MS = 10s`)**: Medium duration. Taking a 1024px high-res snapshot is network-heavy and takes roughly 2-3 seconds round trip over ngrok.
- **Live Inference Timeout (`LIVE_INFERENCE_TIMEOUT_MS = 5s`)**: Shortest duration. We expect live frames at 30fps. If we wait longer than 5 seconds for a bounding box, the frame is useless. We aggressively drop it and ask for the next one.

### Recoverable vs Fatal
When a `LIVE_INFERENCE_TIMEOUT_MS` triggers, the `AbortController` fires. The fetch loop catches the `AbortError` and:
1. Emits a warning: `[ScannerCore] Inference aborted/timed out naturally. Detector remaining in ready state.`
2. Increments `recoverableFailureCount` in the `detectorStateMachine`.
3. **Crucially, it does NOT set the detector state to `idle`.** The detector remains `ready`.

Only if `recoverableFailureCount` exceeds `MAX_CONSECUTIVE_FAILURES` (5) will the loop halt and throw the state machine into `recovering` or `failed`.
