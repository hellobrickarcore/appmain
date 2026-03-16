/**
 * Coordinate Mapping Utility
 * 
 * Maps source-frame (pixel) coordinates to preview (view) coordinates
 * based on the aspect-fill (object-cover) logic of the camera preview.
 */

export interface PreviewLayout {
    sourceWidth: number;
    sourceHeight: number;
    previewX: number;
    previewY: number;
    previewWidth: number;
    previewHeight: number;
}

/**
 * Maps a pixel-space box to absolute screen coordinates for the preview.
 */
export function mapBoxToPreview(
    box: { xMin: number; yMin: number; xMax: number; yMax: number },
    layout: PreviewLayout
) {
    const scale = Math.max(
        layout.previewWidth / layout.sourceWidth,
        layout.previewHeight / layout.sourceHeight
    );

    const scaledWidth = layout.sourceWidth * scale;
    const scaledHeight = layout.sourceHeight * scale;

    const cropX = (scaledWidth - layout.previewWidth) / 2;
    const cropY = (scaledHeight - layout.previewHeight) / 2;

    // Final coordinates relative to the preview container
    return {
        left: (box.xMin * scale - cropX),
        top: (box.yMin * scale - cropY),
        width: (box.xMax - box.xMin) * scale,
        height: (box.yMax - box.yMin) * scale,
    };
}

/**
 * Helper to convert a bounding box (px) to CSS percentage values for a container.
 */
export const bboxToRenderBox = (
    box: { xMin: number; yMin: number; xMax: number; yMax: number }, // Assuming BoundingBoxXYXY is this type
    sourceW: number,
    sourceH: number
) => {
    // Simple fallback for now
    const width = ((box.xMax - box.xMin) / sourceW) * 100;
    const height = ((box.yMax - box.yMin) / sourceH) * 100;
    const left = (box.xMin / sourceW) * 100;
    const top = (box.yMin / sourceH) * 100;
    return { left, top, width, height };
};

/**
 * Maps pixel-space polygon points to absolute screen coordinates.
 */
export function mapPolygonToPreview(
    polygon: { x: number; y: number }[],
    layout: PreviewLayout
) {
    const scale = Math.max(
        layout.previewWidth / layout.sourceWidth,
        layout.previewHeight / layout.sourceHeight
    );

    const scaledWidth = layout.sourceWidth * scale;
    const scaledHeight = layout.sourceHeight * scale;

    const cropX = (scaledWidth - layout.previewWidth) / 2;
    const cropY = (scaledHeight - layout.previewHeight) / 2;

    return polygon.map(p => ({
        x: (p.x * scale - cropX),
        y: (p.y * scale - cropY)
    }));
}
export function calculateIOU(
    boxA: { xMin: number; yMin: number; xMax: number; yMax: number },
    boxB: { xMin: number; yMin: number; xMax: number; yMax: number }
): number {
    const xA = Math.max(boxA.xMin, boxB.xMin);
    const yA = Math.max(boxA.yMin, boxB.yMin);
    const xB = Math.min(boxA.xMax, boxB.xMax);
    const yB = Math.min(boxA.yMax, boxB.yMax);

    const interWidth = Math.max(0, xB - xA);
    const interHeight = Math.max(0, yB - yA);
    const interArea = interWidth * interHeight;

    const boxAArea = (boxA.xMax - boxA.xMin) * (boxA.yMax - boxA.yMin);
    const boxBArea = (boxB.xMax - boxB.xMin) * (boxB.yMax - boxB.yMin);

    if (boxAArea + boxBArea - interArea === 0) return 0;

    const iou = interArea / (boxAArea + boxBArea - interArea);
    return iou;
}
