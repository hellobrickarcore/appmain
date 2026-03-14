import { SCANNER_CORE_LOCKED } from '../locks/scannerCoreLock';
import * as cameraService from '../../services/cameraService';

export class CameraLifecycleManager {
  private activeStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isAcquiring: boolean = false;

  constructor() {
    if (!SCANNER_CORE_LOCKED) console.warn("SCANNER CORE UNLOCKED");
  }

  public setVideoElement(video: HTMLVideoElement | null) {
    this.videoElement = video;
  }

  public stopCamera() {
    console.log("[ScannerCore:Camera] Stopping camera tracks...");
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(t => {
        t.stop();
        console.log(`[ScannerCore:Camera] Stopped track: ${t.label}`);
      });
      this.activeStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isAcquiring = false;
  }

  public async startCamera(): Promise<boolean> {
    if (this.isAcquiring) return false;
    this.isAcquiring = true;

    try {
      console.log("[ScannerCore:Camera] Starting camera...");
      const isSecure = window.isSecureContext;
      const isNative = cameraService.isNativePlatform();
      
      if (!isSecure && !isNative) {
        throw new Error("Insecure Context: Browsers block camera on HTTP.");
      }

      const permissionGranted = await cameraService.requestCameraPermissions();
      if (!permissionGranted) {
        throw new Error("Permission Denied: Camera access is required.");
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not available");
      }

      this.stopCamera();

      this.activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (!this.videoElement) {
         throw new Error("Cannot attach stream: video ref is null");
      }

      this.videoElement.srcObject = this.activeStream;
      
      await new Promise<void>((resolve, reject) => {
         if (!this.videoElement) return reject(new Error("Video element lost"));
         this.videoElement.onloadedmetadata = () => {
           this.videoElement?.play()
            .then(() => resolve())
            .catch(reject);
         };
         // Timeout after 3s if metadata doesn't fire
         setTimeout(() => reject(new Error("Video metadata load timeout")), 3000);
      });
      
      console.log(`[ScannerCore:Camera] Playing at ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
      return true;

    } catch (err: any) {
      console.error("[ScannerCore:Camera] Initialization Error:", err.message);
      this.stopCamera();
      throw err; // Maintain native error structure
    } finally {
      this.isAcquiring = false;
    }
  }
}
