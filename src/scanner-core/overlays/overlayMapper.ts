import { ScanFrameResponse, DetectionOverlay } from '../../types/detection';
import { toDetectionOverlay } from '../../services/brickDetectionService';

/**
 * 🔒 OVERLAY MAPPER
 * Takes the raw canonical response and generates stable bounding boxes.
 */
export const overlayMapper = (response: ScanFrameResponse): DetectionOverlay[] => {
  const trackedOverlays = (response.trackedObjects || [])
    .map(toDetectionOverlay)
    .filter((o: any): o is DetectionOverlay => o !== null);

  const rawOverlays = response.detections
    .map(toDetectionOverlay)
    .filter((o: any): o is DetectionOverlay => o !== null);

  const mergedOverlays = [...trackedOverlays];
  rawOverlays.forEach((ro: any) => {
    // Only add raw detections if they don't overlap significantly with a tracked object
    const exists = mergedOverlays.some(mo => {
       if (!mo.box || !ro.box) return mo.id === ro.id;
       
       // Identity check
       if (mo.id === ro.id) return true;
       
       // Proximity check (deduplication) using xMin, xMax, etc.
       const moX = (mo.box.xMin + mo.box.xMax) / 2;
       const moY = (mo.box.yMin + mo.box.yMax) / 2;
       const roX = (ro.box.xMin + ro.box.xMax) / 2;
       const roY = (ro.box.yMin + ro.box.yMax) / 2;
       const dist = Math.sqrt(Math.pow(moX - roX, 2) + Math.pow(moY - roY, 2));
       return dist < 0.05; // 5% frame distance threshold for deduplication
    });

    if (!exists) {
      mergedOverlays.push(ro);
    }
  });

  return mergedOverlays;
};
