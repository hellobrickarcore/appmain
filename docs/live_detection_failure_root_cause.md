# Root Cause Analysis: Live Detection Failures

## Observations
- Camera would start and warmup would complete.
- "Detection loop error" and "Brick detection error" were logged repeatedly with empty objects `{}`.

## Root Causes
1. **Network Instability & Timeouts**: The live detection loop was using a strict `setInterval` without an abort controller. Transient network delays caused overlapping requests, eventually exhausting the browser's connection pool or causing backend backpressure.
2. **Missing State Management**: There was no explicit state machine. If one detection call failed, the loop would just try again immediately without context, often hitting the same error (e.g., a 429 Rate Limit or a 504 Timeout) without any recovery period.
3. **Implicit Error Swallowing**: React's `console.error` often renders Error objects as `{}` if they aren't properly serialized. This hid the true nature of the failures (Network issues vs JSON parsing issues).
4. **Coordinate Drifting**: Detections were directly mapped to overlays every frame without any temporal filtering, leading to flickering boxes that "disappeared" on minor dropped frames.

## Resolved Architecture
- **Abortable Requests**: Every detection request now has a 5s timeout and an associated `AbortController`.
- **Recursive Timeouts**: Replaced `setInterval` with a state-aware recursive `setTimeout`. This ensures that a new request only starts after the previous one finishes (plus a buffer).
- **State Machine**: Added states: `warming`, `ready`, `detecting`, `recovering`, `failed`.
- **Automatic Recovery**: If 5 consecutive frames fail, the scanner enters a `recovering` state with a longer backoff, allowing the network/auth to stabilize.
