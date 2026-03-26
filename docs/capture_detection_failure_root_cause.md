# Root Cause Analysis: Capture Failures

## Observations
- Clicking the capture button would log "Sending holistic scan request..." followed immediately by "Capture failed error".
- Review results were often empty or displayed untruthful counts.

## Root Causes
1. **Payload & Timeout Mismatch**: Holistic scans (1024px) take significantly longer than live scans (800px). The default `fetch` timeout (often 30s) was occasionally being hit, or the client was aborting early.
2. **Detection Density**: A single pass at 1024px often missed small bricks or bricks near the edges/occluded.
3. **State Poisoning**: The capture logic shared the same global state as the live scanner. When capture failed, it often left the live scanner in an inconsistent or "isProcessing" state, preventing retries.
4. **Poor Deduplication**: Merging multi-scale results without an Intersection-over-Union (IoU) filter resulted in duplicate "ghost" boxes for the same brick, leading to untruthful review counts.

## Resolved Architecture
- **Deep Scan Pipeline**: `mass_capture` now triggers a 3-pass pipeline:
  - Pass 1: Global 1024px context.
  - Pass 2: Tiled scan (2x2 tiles at 512px) for high-density coverage.
- **State Isolation**: Added `capture_detecting` state and a high `timeoutMs` (20s) specifically for capture.
- **Global NMS (Non-Maximum Suppression)**: All results from all passes are merged and then deduplicated using a 0.7 IoU threshold, ensuring truthful counts.
- **Fail-Safe Recovery**: If capture fails, the state machine explicitly resets to `ready`, allowing the user to immediately try again without refreshing.
