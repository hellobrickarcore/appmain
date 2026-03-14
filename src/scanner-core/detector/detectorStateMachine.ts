import { DetectorState } from './detectorTypes';

export const DETECTOR_STATE_MACHINE_LOCKED = true;

/**
 * 🔒 DETECTOR STATE MACHINE
 * Single source of truth for the detector lifecycle.
 * Prevents UI components or background loops from illegally mutating 
 * readiness states and hiding silent failures.
 */
class DetectorStateMachine {
  private currentState: DetectorState = 'idle';
  private listeners: ((state: DetectorState) => void)[] = [];

  // Debug stats
  public stats = {
    warmupSucceeded: false,
    modelLoaded: false,
    recoverableFailureCount: 0,
    fatalFailureCount: 0,
    lastWarmupAt: 0,
    lastInferenceStartedAt: 0,
    lastInferenceCompletedAt: 0,
    lastInferenceAbortedAt: 0,
    captureBlockedReason: ''
  };

  public getState(): DetectorState {
    return this.currentState;
  }

  public subscribe(listener: (state: DetectorState) => void) {
    this.listeners.push(listener);
    listener(this.currentState); // Emit immediately
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private transitionTo(newState: DetectorState) {
    if (this.currentState === newState) return;
    this.currentState = newState;
    this.listeners.forEach(l => l(newState));
  }

  // --- ALLOWED TRANSITIONS ---

  public startLoading() {
    if (this.currentState === 'idle' || this.currentState === 'stopped' || this.currentState === 'failed') {
      this.transitionTo('loading');
    }
  }

  public startWarming() {
    if (this.currentState === 'loading' || this.currentState === 'recovering') {
      this.transitionTo('warming');
    }
  }

  public markWarmupSuccess() {
    this.stats.warmupSucceeded = true;
    this.stats.modelLoaded = true;
    this.stats.lastWarmupAt = Date.now();
    this.transitionTo('ready');
  }

  public markWarmupFailed() {
    this.stats.fatalFailureCount++;
    this.transitionTo('warm_failed');
  }

  public markBackendUnreachable() {
    this.transitionTo('backend_unreachable');
  }

  public startDetecting() {
    if (this.currentState === 'ready' || this.currentState === 'capture_ready') {
       this.transitionTo('detecting');
       this.stats.lastInferenceStartedAt = Date.now();
    }
  }

  public pauseDetecting() {
    if (this.currentState === 'detecting') {
       // Pausing detection correctly returns to 'ready', not 'idle'
       this.transitionTo('ready'); 
    }
  }

  public recordInferenceSuccess() {
    this.stats.lastInferenceCompletedAt = Date.now();
    this.stats.recoverableFailureCount = 0; // Heal
  }

  public recordInferenceAbort() {
    this.stats.lastInferenceAbortedAt = Date.now();
    this.stats.recoverableFailureCount++;
  }

  public startRecovering() {
    this.transitionTo('recovering');
  }

  public markFailed() {
    this.stats.fatalFailureCount++;
    this.transitionTo('failed');
  }

  public stop() {
    this.transitionTo('stopped');
  }

  /**
   * ONLY used for full app hard resets or backgrounds.
   * `stop()` is usually preferred.
   */
  public resetToIdle() {
    this.transitionTo('idle');
  }
}

export const detectorStateMachine = new DetectorStateMachine();
