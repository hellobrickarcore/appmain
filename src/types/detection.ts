/**
 * Canonical Detection Types for HelloBrick
 * 
 * GOLDEN RULES:
 * 1. All geometry is pixel-space, xyxy format.
 * 2. No 0–1000 normalization. No [ymin, xmin, ymax, xmax].
 * 3. Only brickDetectionService.ts converts raw backend responses into these types.
 * 5. 🔒 LOCK: THIS LOGIC IS CANONICAL. DO NOT MODIFY COORDINATE MATH OR 
 *    GEOMETRY CONTRACTS WITHOUT FORMAL APPROVAL.
 */

// ─── Geometry ────────────────────────────────────────────────────

/** Canonical bounding box: pixel-space, xyxy */
export interface BBox {
    /** Left edge (pixels) */
    x_min: number;
    /** Top edge (pixels) */
    y_min: number;
    /** Right edge (pixels) */
    x_max: number;
    /** Bottom edge (pixels) */
    y_max: number;
}

/** Polygon point in pixel-space */
export interface PolygonPoint {
    x: number;
    y: number;
}

/** Full geometry payload */
export interface DetectionGeometry {
    format: 'xyxy';
    space: 'pixel';
    bbox: BBox;
    polygon?: PolygonPoint[];
}

// ─── Prediction ──────────────────────────────────────────────────

/** A single prediction candidate */
export interface PredictionCandidate {
    brick_part_num: string;
    label: string;
    confidence: number;
}

/** The model's prediction for a detected object */
export interface DetectionPrediction {
    brick_part_num: string;
    brick_name: string;
    color_name: string;
    part_confidence: number;
    color_confidence: number;
}

// ─── Frame-Level Types ───────────────────────────────────────────

/** A single detection in a single frame */
export interface FrameDetection {
    /** Unique ID for this detection within the frame */
    detection_id: string;
    /** Persistent object ID across frames (empty until tracking is enabled) */
    track_id: string;
    /** Overall confidence */
    confidence: number;
    /** Canonical pixel-space geometry */
    geometry: DetectionGeometry;
    /** Best prediction */
    prediction: DetectionPrediction;
    /** Top-N candidates for ambiguous parts */
    candidates: PredictionCandidate[];
    /** Estimated stud count */
    stud_count_estimate?: number;
    /** Rotation angle of the brick */
    pose_angle_deg?: number;
    /** Whether this detection needs human review */
    review_required: boolean;
}

/** The full response from a single detection request */
export interface DetectionResponse {
    /** Frame dimensions */
    frame_width: number;
    frame_height: number;
    /** Model version string */
    model_version: string;
    /** Time taken for inference (ms) */
    inference_time_ms: number;
    /** All detections in this frame */
    detections: FrameDetection[];
    /** Total count */
    total_count: number;
}

// ─── Render Helpers ──────────────────────────────────────────────

/** Percentage-based coordinates for CSS rendering */
export interface RenderBox {
    top: number;    // % from top
    left: number;   // % from left
    width: number;  // % width
    height: number; // % height
}

/**
 * Convert a pixel-space BBox to percentage-based RenderBox
 * relative to the displayed container dimensions.
 * 
 * Handles object-cover / object-contain scaling.
 */
export function bboxToRenderBox(
    bbox: BBox,
    frameWidth: number,
    frameHeight: number,
    containerWidth: number,
    containerHeight: number,
    objectFit: 'cover' | 'contain' = 'cover'
): RenderBox {
    const arFrame = frameWidth / frameHeight;
    const arContainer = containerWidth / containerHeight;

    let displayW: number, displayH: number, offsetX = 0, offsetY = 0;

    if (objectFit === 'cover') {
        if (arFrame > arContainer) {
            // Frame wider than container → cropped horizontally
            displayH = containerHeight;
            displayW = containerHeight * arFrame;
            offsetX = (containerWidth - displayW) / 2;
        } else {
            // Frame taller → cropped vertically
            displayW = containerWidth;
            displayH = containerWidth / arFrame;
            offsetY = (containerHeight - displayH) / 2;
        }
    } else {
        // contain
        if (arFrame > arContainer) {
            displayW = containerWidth;
            displayH = containerWidth / arFrame;
            offsetY = (containerHeight - displayH) / 2;
        } else {
            displayH = containerHeight;
            displayW = containerHeight * arFrame;
            offsetX = (containerWidth - displayW) / 2;
        }
    }

    // Map pixel coords → display coords → percentage
    const top = ((bbox.y_min / frameHeight) * displayH + offsetY) / containerHeight * 100;
    const left = ((bbox.x_min / frameWidth) * displayW + offsetX) / containerWidth * 100;
    const width = ((bbox.x_max - bbox.x_min) / frameWidth) * displayW / containerWidth * 100;
    const height = ((bbox.y_max - bbox.y_min) / frameHeight) * displayH / containerHeight * 100;

    return { top, left, width, height };
}
