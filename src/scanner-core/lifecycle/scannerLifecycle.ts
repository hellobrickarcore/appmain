import { SCANNER_CORE_LOCKED } from '../locks/scannerCoreLock';

export interface ScannerLifecycleCallbacks {
  onMount: () => void;
  onUnmount: () => void;
  onAppHidden: () => void;
  onAppVisible: () => void;
}

/**
 * 🔒 SCANNER LIFECYCLE 
 * Explicitly manages component mount/unmount and 
 * app visibility (background/foreground) events to prevent ghost camera tracks.
 */
export class ScannerLifecycle {
  private isMounted: boolean = false;
  private callbacks: ScannerLifecycleCallbacks;

  constructor(callbacks: ScannerLifecycleCallbacks) {
    if (!SCANNER_CORE_LOCKED) console.warn("SCANNER CORE UNLOCKED");
    this.callbacks = callbacks;
  }

  public mount() {
    if (this.isMounted) return;
    this.isMounted = true;
    console.log("[ScannerCore:Lifecycle] Component Mounted. Booting Scanner.");
    this.callbacks.onMount();

    // Attach visibility listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public unmount() {
    if (!this.isMounted) return;
    this.isMounted = false;
    console.log("[ScannerCore:Lifecycle] Component Unmounted. Tearing down Scanner.");
    this.callbacks.onUnmount();

    // Detach visibility listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("[ScannerCore:Lifecycle] App went to BACKGROUND.");
      this.callbacks.onAppHidden();
    } else {
      console.log("[ScannerCore:Lifecycle] App returned to FOREGROUND.");
      this.callbacks.onAppVisible();
    }
  };
}
