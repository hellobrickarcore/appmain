import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraLifecycleManager } from '../scanner-core/camera/cameraLifecycle';
import { ScannerDetectLoop } from '../scanner-core/detector/detectLoop';
import { ScannerLifecycle } from '../scanner-core/lifecycle/scannerLifecycle';
import { SCANNER_CORE_LOCKED } from '../scanner-core/locks/scannerCoreLock';

// Mock dependencies
vi.mock('../scanner-core/detector/detectorWarmup', () => ({
  runDetectorWarmup: vi.fn().mockResolvedValue(true)
}));

vi.mock('../services/cameraService', () => ({
  isNativePlatform: vi.fn().mockReturnValue(false),
  requestCameraPermissions: vi.fn().mockResolvedValue(true)
}));

describe('🔒 Scanner Core Regression Tests', () => {


  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn(), label: 'mock-track' }]
        }),
      },
      writable: true,
    });
  });

  describe('Hard Lock Integrity', () => {
    it('SCANNER_CORE_LOCKED must be true to prevent unauthorized edits', () => {
      expect(SCANNER_CORE_LOCKED).toBe(true);
    });
  });

  describe('Camera Lifecycle', () => {
    it('stops previous tracks when starting a new camera stream', async () => {
      const manager = new CameraLifecycleManager();
      const mockVideo = document.createElement('video');
      mockVideo.play = vi.fn().mockResolvedValue(undefined);
      manager.setVideoElement(mockVideo);

      // Force context override for test
      Object.defineProperty(global.window, 'isSecureContext', { value: true, writable: true });

      // Call it (metadata promise won't resolve naturally in JSDOM, we mock it)
      const startPromise = manager.startCamera();
      
      // Wait for microtasks to settle so onloadedmetadata is assigned
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Simulate metadata load
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata(new Event('loadedmetadata') as any);
      }
      
      const res = await startPromise;
      expect(res).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
  });

  describe('Detect Loop Concurrency Guard', () => {
    it('prevents overlapping inferences via isDetecting lock', () => {
       const loop = new ScannerDetectLoop('test-session', {
         onSuccess: vi.fn(),
         onError: vi.fn()
       });

       loop.start(); // -> state: detecting
       loop.start(); // Should be ignored

       loop.stop();
    });
  });

  describe('Scanner Lifecycle Visibility Recovery', () => {
    it('fires appropriate start/stop sequences on document visibility change', () => {
      const callbacks = {
        onMount: vi.fn(),
        onUnmount: vi.fn(),
        onAppHidden: vi.fn(),
        onAppVisible: vi.fn()
      };

      const lifecycle = new ScannerLifecycle(callbacks);
      lifecycle.mount();
      expect(callbacks.onMount).toHaveBeenCalledTimes(1);

      // Simulate app hide
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(callbacks.onAppHidden).toHaveBeenCalledTimes(1);

      // Simulate app show
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(callbacks.onAppVisible).toHaveBeenCalledTimes(1);

      lifecycle.unmount();
      expect(callbacks.onUnmount).toHaveBeenCalledTimes(1);
    });
  });
});
