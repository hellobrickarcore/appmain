# SCANNER CORE HARD LOCK

## Warning
The `src/scanner-core/` directory contains critical, brittle detection logic. It has been **HARD LOCKED** to prevent regressions.

### Why was it locked?
In earlier versions, UI refactoring heavily disrupted the scanner. The react `useEffect` lifecycle loops became infinite, errors from the YOLO detection backend were swallowed as generic `{}` objects, and the system failed silently while displaying black screens or empty overlays. The system required a strict isolation of "Camera/Detector Management" vs "UI Presentation".

### What is locked?
The entire `src/scanner-core/` module is protected. 
This includes:
*   `camera/`
*   `detector/`
*   `lifecycle/`
*   `overlays/`
*   `debug/`
*   `locks/`

**Code inside this directory MUST NOT be modified during routine UI changes.**

### How regressions are prevented
1.  **`SCANNER_CORE_LOCKED = true`**: Explicit declaration within `src/scanner-core/locks/scannerCoreLock.ts`.
2.  **Strict State Machine**: The detector relies on an immutable `DetectorState` union type.
3.  **Automated Regression Tests**: Core behavior is validated by `src/tests/scannerCore.test.ts` (Validating warmup, inference timeouts, active recovery, and proper state teardown).

---

### Approval Process for Future Changes
If an API signature needs to change, or a new ML model requires different preprocessing logic, you MUST explicitly state in the PR / Agent Plan:
> *"I am intentionally unlocking the scanner-core to implement X. I have read `docs/scanner_core_recovery_design.md`."*
