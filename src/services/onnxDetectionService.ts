/**
 * ONNX Detection Service
 * 
 * Runs YOLO11 LEGO brick detection model directly in the browser
 * via ONNX Runtime Web. Zero API calls, zero latency.
 * 
 * Port of flutter_app/lib/services/yolo_detection_service.dart
 */

import * as ort from 'onnxruntime-web';

// ─── Constants ───────────────────────────────────────────────────
const MODEL_URL = '/models/yolo11_lego_v9.onnx';
export const INPUT_SIZE = 640;
const CONFIDENCE_THRESHOLD = 0.40; // Balanced for best detection
const NMS_IOU_THRESHOLD = 0.45;

// The first 14 entries in the dataset are Roboflow metadata/augmentations
// Starting from Index 14 we have the actual Part IDs
const CLASS_NAMES = [
    '1x1_black', '1x1_blue', '1x1_brown', '1x1_green', '1x1_pink', '1x1_red', '1x1_yellow',
    '2x1_blue', '2x1_green', '2x1_pink', '2x1_red', '2x1_yellow',
    '2x2_blue', '2x2_green', '2x2_pink', '2x2_red', '2x2_yellow',
    '2x3_blue', '2x3_green', '2x3_pink', '2x3_red', '2x3_yellow',
    '2x4_blue', '2x4_green', '2x4_pink', '2x4_red', '2x4_yellow'
];

// ─── Types ───────────────────────────────────────────────────────
export interface OnnxDetection {
    id: string;
    label: string;
    confidence: number;
    // box_2d in 0-1000 scale: [ymin, xmin, ymax, xmax]
    box_2d: [number, number, number, number];
}

// ─── Session Management ──────────────────────────────────────────
let session: ort.InferenceSession | null = null;
let isLoading = false;
let loadError: string | null = null;

/**
 * Initialize the ONNX model session. Downloads model on first call,
 * then caches it for subsequent inferences.
 */
export async function initModel(): Promise<boolean> {
    if (session) return true;
    if (isLoading) return false;

    isLoading = true;
    loadError = null;

    try {
        // Configure ONNX Runtime for browser
        // Set numThreads to 1 to avoid worker module import issues on some mobile devices
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;
        ort.env.wasm.proxy = false;

        // Use absolute path for the directory containing WASM/MJS files
        ort.env.wasm.wasmPaths = window.location.origin + '/';

        console.log('🧊 Loading YOLO11 ONNX model from', MODEL_URL);
        try {
            // Increased timeout for mobile loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            session = await ort.InferenceSession.create(MODEL_URL, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all',
            });

            clearTimeout(timeoutId);
            console.log('✅ Inference session created successfully');
            console.log('   Inputs:', session.inputNames);
            console.log('   Outputs:', session.outputNames);
            isLoading = false;
            return true;
        } catch (sessionError: any) {
            console.error('❌ Failed to create ONNX session:', sessionError);
            // Log specific properties if they exist
            if (sessionError.message) console.error('Error message:', sessionError.message);
            if (sessionError.stack) console.error('Error stack:', sessionError.stack);
            loadError = sessionError.message || 'Failed to create ONNX session';
            isLoading = false;
            return false;
        }
    } catch (error: any) {
        console.error('❌ Failed to initialize ONNX Runtime:', error);
        loadError = error.message || 'Failed to initialize ONNX Runtime';
        isLoading = false;
        return false;
    }
}

/**
 * Check if the model is loaded and ready
 */
export function isModelReady(): boolean {
    return session !== null;
}

export function getLoadError(): string | null {
    return loadError;
}

export function isModelLoading(): boolean {
    return isLoading;
}

// ─── Preprocessing ───────────────────────────────────────────────

/**
 * Preprocess a video/canvas frame for YOLO11 input using LETTERBOX resizing.
 * Maintains aspect ratio by padding, preventing coordinate distortion.
 */
function preprocessFrame(source: HTMLVideoElement | HTMLCanvasElement): { float32: Float32Array; padInfo: { padW: number; padH: number; scale: number } } {
    const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

    // Calculate scaling and padding
    const ratio = Math.min(INPUT_SIZE / sw, INPUT_SIZE / sh);
    const newW = Math.round(sw * ratio);
    const newH = Math.round(sh * ratio);
    const padW = (INPUT_SIZE - newW) / 2;
    const padH = (INPUT_SIZE - newH) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Fill with letterbox color (usually [114, 114, 114] for YOLO)
    ctx.fillStyle = '#727272';
    ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);

    // Draw source centered
    if (source instanceof HTMLVideoElement) {
        ctx.drawImage(source, 0, 0, sw, sh, padW, padH, newW, newH);
    } else {
        ctx.drawImage(source, 0, 0, sw, sh, padW, padH, newW, newH);
    }

    const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const pixels = imageData.data;
    const totalPixels = INPUT_SIZE * INPUT_SIZE;
    const float32 = new Float32Array(3 * totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        const rgbaIdx = i * 4;
        float32[i] = pixels[rgbaIdx] / 255.0;
        float32[totalPixels + i] = pixels[rgbaIdx + 1] / 255.0;
        float32[2 * totalPixels + i] = pixels[rgbaIdx + 2] / 255.0;
    }

    return {
        float32,
        padInfo: { padW: padW / INPUT_SIZE, padH: padH / INPUT_SIZE, scale: ratio * (INPUT_SIZE / Math.max(sw, sh)) }
    };
}

// ─── Postprocessing ──────────────────────────────────────────────

/**
 * Parse YOLO11 output tensor into detections.
 * Handles the transposed output format [1, num_features, num_detections].
 */
function postprocess(
    outputData: Float32Array | number[],
    outputShape: readonly number[],
    padInfo: { padW: number; padH: number; scale: number }
): OnnxDetection[] {
    const detections: OnnxDetection[] = [];

    // YOLO11 output shape is typically [1, num_features, num_detections]
    // where num_features = 4 (box) + num_classes
    // For this model: likely [1, 31, N] or [1, 20, N] depending on classes

    let numFeatures: number;
    let numDetections: number;

    if (outputShape.length === 3) {
        // [batch, features, detections] — transposed format (YOLO11 default)
        numFeatures = outputShape[1];
        numDetections = outputShape[2];
    } else if (outputShape.length === 2) {
        // [detections, features] — standard format
        numDetections = outputShape[0];
        numFeatures = outputShape[1];
    } else {
        console.warn('Unexpected output shape:', outputShape);
        return [];
    }

    const numClasses = numFeatures - 4; // 4 box coords + N classes

    for (let d = 0; d < numDetections; d++) {
        // For transposed format [1, features, detections]:
        // Each feature for detection d is at outputData[f * numDetections + d]
        const getVal = (f: number) => {
            if (outputShape.length === 3) {
                return outputData[f * numDetections + d]; // transposed
            }
            return outputData[d * numFeatures + f]; // standard
        };

        // Box coordinates (YOLOv8/v11: cx, cy, w, h)
        const xCenter = getVal(0);
        const yCenter = getVal(1);
        const w = getVal(2);
        const h = getVal(3);

        // Class scores — find best class
        let maxClassScore = 0;
        let maxClassIdx = 0;
        for (let c = 0; c < numClasses; c++) {
            const score = getVal(4 + c);
            if (score > maxClassScore) {
                maxClassScore = score;
                maxClassIdx = c;
            }
        }

        if (maxClassScore < CONFIDENCE_THRESHOLD) continue;

        // Reverse letterbox transformation to get back to original image aspect ratio
        // We use relative coordinates (0-1) to preserve precision
        const xminRel = (xCenter - w / 2) / INPUT_SIZE;
        const yminRel = (yCenter - h / 2) / INPUT_SIZE;
        const xmaxRel = (xCenter + w / 2) / INPUT_SIZE;
        const ymaxRel = (yCenter + h / 2) / INPUT_SIZE;

        // padRatio is padding size relative to 640px input
        const padWRatio = padInfo.padW / INPUT_SIZE;
        const padHRatio = padInfo.padH / INPUT_SIZE;

        // frameScale is the multiplier needed to expand the non-padded area back to 1.0 relative
        const frameScaleX = 1.0 / (1.0 - 2 * padWRatio);
        const frameScaleY = 1.0 / (1.0 - 2 * padHRatio);

        // Corrected relative coordinates (0-1) in the ORIGINAL frame
        const xminOrig = (xminRel - padWRatio) * frameScaleX;
        const yminOrig = (yminRel - padHRatio) * frameScaleY;
        const xmaxOrig = (xmaxRel - padWRatio) * frameScaleX;
        const ymaxOrig = (ymaxRel - padHRatio) * frameScaleY;

        // Scale to 0-1000 for agnostic rendering in ScannerScreen
        const xmin = xminOrig * 1000;
        const ymin = yminOrig * 1000;
        const xmax = xmaxOrig * 1000;
        const ymax = ymaxOrig * 1000;

        // Validate box
        if (xmax - xmin < 10 || ymax - ymin < 10) continue;

        const className = maxClassIdx < CLASS_NAMES.length ? CLASS_NAMES[maxClassIdx] : `Brick_${maxClassIdx}`;

        detections.push({
            id: `yolo_${d}_${Date.now()}`,
            label: className.replace('_', ' '),
            confidence: maxClassScore,
            box_2d: [
                Math.max(0, Math.round(ymin)),
                Math.max(0, Math.round(xmin)),
                Math.min(1000, Math.round(ymax)),
                Math.min(1000, Math.round(xmax)),
            ],
        });
    }

    // Apply NMS
    return applyNMS(detections, NMS_IOU_THRESHOLD);
}

// ─── NMS ─────────────────────────────────────────────────────────

function calculateIoU(a: [number, number, number, number], b: [number, number, number, number]): number {
    const [aymin, axmin, aymax, axmax] = a;
    const [bymin, bxmin, bymax, bxmax] = b;

    const x1 = Math.max(axmin, bxmin);
    const y1 = Math.max(aymin, bymin);
    const x2 = Math.min(axmax, bxmax);
    const y2 = Math.min(aymax, bymax);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const areaA = (axmax - axmin) * (aymax - aymin);
    const areaB = (bxmax - bxmin) * (bymax - bymin);

    return intersection / (areaA + areaB - intersection);
}

function applyNMS(detections: OnnxDetection[], iouThreshold: number): OnnxDetection[] {
    // Sort by confidence descending
    detections.sort((a, b) => b.confidence - a.confidence);

    const selected: OnnxDetection[] = [];
    const suppressed = new Set<number>();

    for (let i = 0; i < detections.length; i++) {
        if (suppressed.has(i)) continue;
        selected.push(detections[i]);

        for (let j = i + 1; j < detections.length; j++) {
            if (suppressed.has(j)) continue;
            if (calculateIoU(detections[i].box_2d, detections[j].box_2d) > iouThreshold) {
                suppressed.add(j);
            }
        }
    }

    return selected;
}

// ─── Main API ────────────────────────────────────────────────────

/**
 * Run detection on a video/canvas frame.
 * Returns detected objects with bounding boxes in 0-1000 scale.
 */
export async function detectFrame(
    source: HTMLVideoElement | HTMLCanvasElement,
): Promise<{ objects: OnnxDetection[]; latencyMs: number }> {
    if (!session) {
        const loaded = await initModel();
        if (!loaded) return { objects: [], latencyMs: 0 };
    }

    const start = performance.now();

    // Preprocess
    const { float32, padInfo } = preprocessFrame(source);
    const inputTensor = new ort.Tensor('float32', float32, [1, 3, INPUT_SIZE, INPUT_SIZE]);

    const feeds: Record<string, ort.Tensor> = {};
    feeds[session!.inputNames[0]] = inputTensor;

    const outputs = await session!.run(feeds);
    const output = outputs[session!.outputNames[0]];

    const objects = postprocess(output.data as Float32Array, output.dims, padInfo);
    const latencyMs = performance.now() - start;

    return { objects, latencyMs };
}
