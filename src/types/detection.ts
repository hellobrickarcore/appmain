/**
 * Canonical Detection Types for HelloBrick
 * 
 * GOLDEN RULES:
 * 1. All geometry is pixel-space, xyxy format.
 * 2. No 0–1000 normalization. No [ymin, xmin, ymax, xmax].
 * 3. Geometry, Identity, and Color have separate confidence channels.
 * 4. 🔒 LOCK: THIS LOGIC IS CANONICAL. DO NOT MODIFY COORDINATE MATH OR 
 *    GEOMETRY CONTRACTS WITHOUT FORMAL APPROVAL.
 */

export type GeometryType = 'bbox_xyxy' | 'polygon' | 'mask';
export type LabelDisplayStatus = 'hidden' | 'tentative' | 'confirmed' | 'needs_review';
export type ReviewStatus = 'unreviewed' | 'accepted' | 'corrected' | 'rejected' | 'ambiguous';

export interface Point {
    x: number;
    y: number;
}

export interface BoundingBoxXYXY {
    format: 'xyxy';
    space: 'pixel';
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

export interface DetectionGeometry {
    type: GeometryType;
    bbox: BoundingBoxXYXY;
    polygon?: Point[];
    segmentationRle?: unknown;
    geometryConfidence: number; // 0..1
}

export interface BrickPrediction {
    brickPartId?: string;
    brickPartNum?: string;
    brickName?: string;
    brickFamily?: string;
    dimensionsLabel?: string;

    brickColorId?: string;
    brickColorName?: string;

    identityConfidence: number; // 0..1
    colorConfidence: number; // 0..1
    dimensionConfidence: number; // 0..1
    brandConfidence: number; // 0..1
    detectorConfidence: number; // 0..1

    rawModelClass?: string;
    rawModelConfidence?: number;
}

export interface DetectionCandidate {
    rank: number;
    brickPartId?: string;
    brickPartNum?: string;
    brickName?: string;

    brickColorId?: string;
    brickColorName?: string;

    identityConfidence: number;
    colorConfidence?: number;
    reasonCodes?: string[];
}

export interface DetectionQualityMetrics {
    studCountEstimate?: number;
    studCountConfidence?: number;
    poseAngleDeg?: number;
    aspectRatio?: number;
    lightingScore?: number;
    blurScore?: number;
    occlusionScore?: number;
}

export interface FrameDetection {
    detectionId: string;
    detectionIndex: number;
    trackId?: string;

    geometry: DetectionGeometry;
    prediction: BrickPrediction;
    candidates: DetectionCandidate[];
    quality: DetectionQualityMetrics;

    brickFamily?: string;
    dimensionsLabel?: string;
    compactLabel?: string;

    reviewStatus: ReviewStatus;
    labelDisplayStatus: LabelDisplayStatus;
    countingBucket?: 'official_lego' | 'uncertain_lego_like' | 'rejected_non_lego';
}

export interface ScanFrameResponse {
    sessionId: string;
    frameId: string;
    frameIndex: number;
    frameWidth: number;
    frameHeight: number;
    modelVersion: string;
    detections: FrameDetection[];
    trackedObjects: TrackedObject[];
    inferenceMs?: number;
    rttMs?: number;
    targetDimension?: number;
    debug?: {
        raw: number;
        valid_geo: number;
        after_nms: number;
        final: number;
        color_estimates?: number;
        dim_estimates?: number;
        identity_estimates?: number;
    };
    summary?: {
        official_lego_count: number;
        uncertain_lego_like_count: number;
        non_lego_rejected_count: number;
        total_raw_candidates: number;
        removed_by_low_confidence: number;
        removed_by_duplicate_filter: number;
        removed_by_non_lego_filter: number;
        removed_by_geometry_filter: number;
        removed_by_sparse_sanity?: number;
        white_sensitivity_used?: boolean;
        sparse_fallback_triggered?: boolean;
    };
}

export interface TrackedObject {
    trackedObjectId: string;
    trackId: string;
    status: 'active' | 'stable' | 'ambiguous' | 'finalized' | 'dropped';
    totalFramesSeen: number;
    stableGeometry: DetectionGeometry;
    consensusPartId?: string;
    consensusPartNum?: string;
    consensusBrickName?: string;
    consensusColorId?: string;
    consensusColorName?: string;
    consensusBrickFamily?: string;
    consensusDimensionsLabel?: string;
    geometryConfidence: number;
    identityConfidence: number;
    colorConfidence: number;
    studCountConsensus?: number;
    studCountConfidence?: number;
    labelDisplayStatus: LabelDisplayStatus;
    promotedToCollection: boolean;
}

// ─── Thresholds ──────────────────────────────────────────────────

export const DETECTION_THRESHOLDS = {
    /** Min confidence to render ANY geometry (Stage 1) - Aggressive for 5ft distance */
    GEOMETRY_RENDER_MIN: 0.05,
    /** Min confidence to consider geometry "stable" (Stage 1/2) */
    GEOMETRY_STABLE_MIN: 0.15,
    /** Min identity confidence for 'confirmed' status (Stage 3) */
    IDENTITY_CONFIRMED_MIN: 0.35,
    /** Min color confidence for 'confirmed' status (Stage 3) */
    COLOR_CONFIRMED_MIN: 0.35,
    /** Min dimension confidence for 'confirmed' status (Stage 3) */
    DIMENSION_CONFIRMED_MIN: 0.35,
    COLLECTION_PROMOTION_MIN: 0.50,
    /** Lowered to 2 frames to make it "stick" faster */
    TRACK_STABLE_MIN_FRAMES: 2,
    TRACK_CONSENSUS_CONSECUTIVE_FRAMES: 1,
    CANDIDATE_MARGIN_MIN: 0.05,
} as const;

export interface DetectionOverlay {
    id: string;
    trackId?: string;
    geometryType: 'bbox' | 'polygon';
    box?: { xMin: number; yMin: number; xMax: number; yMax: number };
    polygon?: { x: number; y: number }[];
    geometryConfidence: number;
    identityConfidence: number;
    colorConfidence: number;
    dimensionConfidence: number;
    brickFamily?: string;
    dimensionsLabel?: string;
    isTracked: boolean;
    isStable: boolean;
    displayText?: string;
    compactLabel?: string;
    labelDisplayStatus: LabelDisplayStatus;
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
 */
export function bboxToRenderBox(
    bbox: BoundingBoxXYXY,
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
            displayH = containerHeight;
            displayW = containerHeight * arFrame;
            offsetX = (containerWidth - displayW) / 2;
        } else {
            displayW = containerWidth;
            displayH = containerWidth / arFrame;
            offsetY = (containerHeight - displayH) / 2;
        }
    } else {
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

    const top = ((bbox.yMin / frameHeight) * displayH + offsetY) / containerHeight * 100;
    const left = ((bbox.xMin / frameWidth) * displayW + offsetX) / containerWidth * 100;
    const width = ((bbox.xMax - bbox.xMin) / frameWidth) * displayW / containerWidth * 100;
    const height = ((bbox.yMax - bbox.yMin) / frameHeight) * displayH / containerHeight * 100;

    return { top, left, width, height };
}
