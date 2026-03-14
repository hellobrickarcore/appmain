# Detector State Machine Lockdown

## Purpose
The detector's readiness state (`idle`, `warming`, `ready`, etc.) dictates whether the camera streams frames, whether inference fires, and whether the multi-capture button functions. 

Historically, this state was stored as a naive generic string inside `ScannerScreen.tsx`'s React `useState`, meaning any nested component or stray `useEffect` could clobber the exact lifecycle state and hide underlying bugs.

## The Lock
`src/scanner-core/detector/detectorStateMachine.ts` is now locked.
```javascript
export const DETECTOR_STATE_MACHINE_LOCKED = true;
```

## Architectural Rules
1. **Single Source of Truth:** `detectorStateMachine` is an explicit, singleton class instance. 
2. **No Direct Setters:** The internal `currentState` is private. It can only be mutated by explicit semantic methods (e.g. `startWarming()`, `markWarmupSuccess()`, `pauseDetecting()`).
3. **React Agnostic:** The machine is pure TypeScript. React components invoke `.subscribe((state) => ...)` inside a `useEffect` to defensively mirror the state for UI rendering only. They are forbidden from mutating it directly.
4. **Transition Guards:** The methods themselves guard illegal transitions. For instance, `markReady()` is programmed to completely ignore calls if transitioning from `stopped` or `failed`.

By centralizing and locking this logic, we guarantee that the UI cannot falsely declare the AI "offline" unless an explicit, logged `catch` block instructed the machine to transition into `failed`.
