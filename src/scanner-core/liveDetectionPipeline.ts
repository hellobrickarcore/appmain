import { ALLOW_SCANNER_CORE_MODIFICATION } from './lockState';
import { ScanFrameResponse, DetectionOverlay } from '../types/detection';
import { toDetectionOverlay } from '../services/brickDetectionService';

/**
 * RESTORED WORKING PIPELINE 
 * Takes a ScanFrameResponse from the detection service and securely processes it to return stable bounding boxes.
 * Bypasses recent unstable NMS and custom smoothing layers that broke visibility. 
 */
export const processLiveFrameDetections = (response: ScanFrameResponse): DetectionOverlay[] => {
  if (ALLOW_SCANNER_CORE_MODIFICATION) {
    console.warn("SCANNER CORE IS UNLOCKED. PROCEED WITH CAUTION.");
  }

  const trackedOverlays = (response.trackedObjects || [])
    .map(toDetectionOverlay)
    .filter((o): o is DetectionOverlay => o !== null);

  const rawOverlays = response.detections
    .map(toDetectionOverlay)
    .filter((o): o is DetectionOverlay => o !== null);

  // Merge: Show all tracked, plus detections that aren't already tracked
  const mergedOverlays = [...trackedOverlays];
  rawOverlays.forEach(ro => {
    if (!mergedOverlays.some(mo => mo.id === ro.id)) {
      mergedOverlays.push(ro);
    }
  });

  return mergedOverlays;
};
