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
    sourceH: number,
    containerW: number,
    containerH: number,
    fit: 'cover' | 'contain' = 'cover'
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
