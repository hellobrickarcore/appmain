
/**
 * CRITICAL SYSTEM LOCK: ONBOARDING FLOW
 * 
 * This flag prevents accidental modification of the onboarding sequence
 * and skip logic. Do not change without explicit authorization.
 */
export const ONBOARDING_FLOW_LOCKED = true;

/**
 * When true, allows developers to bypass the hard lock for rapid iteration.
 * MUST be false in production.
 */
export const ALLOW_ONBOARDING_MODIFICATION = false;
