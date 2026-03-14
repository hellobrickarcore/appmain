/**
 * 🔒 SCANNER CORE HARD LOCK
 * 
 * This file explicitly locks the scanner core against arbitrary UI refactoring.
 * Ensure any changes are thoroughly tested and conform to the core state machine.
 * See `docs/scanner_core_lock.md` for the overarching rule set.
 */
export const SCANNER_CORE_LOCKED = true;
