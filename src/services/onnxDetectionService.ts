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
const MODEL_URL = '/models/best_lego_v1.onnx';
export const INPUT_SIZE = 640;
const CONFIDENCE_THRESHOLD = 0.40; // Balanced for best detection
const NMS_IOU_THRESHOLD = 0.45;

// The first 14 entries in the dataset are Roboflow metadata/augmentations
// Starting from Index 14 we have the actual Part IDs
const CLASS_NAMES = [
    'Metadata_0', 'Metadata_1', 'Metadata_2', 'Metadata_3', 'Metadata_4',
    'Metadata_5', 'Metadata_6', 'Metadata_7', 'Metadata_8', 'Metadata_9',
    'Metadata_10', 'Metadata_11', 'Metadata_12', 'Metadata_13',
    '10197',
    '10247',
    '10884',
    '10928',
    '11090',
    '11203',
    '11208',
    '11209',
    '11211',
    '11212',
    '11213',
    '11214',
    '11215',
    '11253',
    '11458',
    '11476',
    '11477',
    '11478',
    '11609',
    '11610',
    '11618',
    '11833',
    '11946',
    '11947',
    '13547',
    '13548',
    '13564',
    '13965',
    '13971',
    '14417',
    '14418',
    '14419',
    '14704',
    '14716',
    '14718',
    '14719',
    '14720',
    '14769',
    '15068',
    '15070',
    '15092',
    '15100',
    '15208',
    '15209',
    '15254',
    '15303',
    '15332',
    '15391',
    '15392',
    '15395',
    '15397',
    '15403',
    '15456',
    '15458',
    '15461',
    '15462',
    '15470',
    '15533',
    '15535',
    '15571',
    '15573',
    '15706',
    '15712',
    '16577',
    '17485',
    '18041',
    '18646',
    '18649',
    '18651',
    '18653',
    '18654',
    '18671',
    '18674',
    '18677',
    '18853',
    '18946',
    '18948',
    '18976',
    '18977',
    '18980',
    '19220',
    '20310',
    '20482',
    '21445',
    '22385',
    '22388',
    '22484',
    '22667',
    '22885',
    '22886',
    '22888',
    '22889',
    '22890',
    '22961',
    '2339',
    '2343',
    '23443',
    '2357',
    '23950',
    '23969',
    '24',
    '2412b',
    '2417',
    '2419',
    '2420',
    '24201',
    '2423',
    '24246',
    '24299',
    '2429c01',
    '24307',
    '24309',
    '2431',
    '24316',
    '2432',
    '2436',
    '24375',
    '2445',
    '2447',
    '2449',
    '2450',
    '2453',
    '2454',
    '2456',
    '2458',
    '2460',
    '2462',
    '2465',
    '2476',
    '24866',
    '2496',
    '25',
    '25214',
    '2540',
    '2569',
    '25893',
    '26',
    '26047',
    '26287',
    '2639',
    '2653',
    '2654',
    '2655',
    '26599',
    '26599',
    '26601',
    '26603',
    '26604',
    '27',
    '27261',
    '27263',
    '2730',
    '2736',
    '27507',
    '2780',
    '27925',
    '27940',
    '28',
    '2817',
    '2877',
    '29',
    '29119',
    '29120',
    '2921',
    '2958',
    '30000',
    '3001',
    '3002',
    '30028',
    '3003',
    '30031',
    '3004',
    '30044',
    '3005',
    '3006',
    '3007',
    '3008',
    '3009',
    '30099',
    '3010',
    '30136',
    '30137',
    '30145',
    '30153',
    '30157',
    '30162',
    '30165',
    '30176',
    '3020',
    '3021',
    '3022',
    '3023',
    '30236',
    '30237',
    '3024',
    '3029',
    '3030',
    '3031',
    '3032',
    '3033',
    '3034',
    '3035',
    '30350b',
    '30357',
    '3036',
    '30363',
    '3037',
    '30374',
    '3038',
    '30383',
    '3039',
    '3040',
    '30413',
    '30414',
    '3045',
    '30503',
    '30526',
    '30552',
    '30553',
    '30562',
    '30565',
    '30602',
    '3062b',
    '3065',
    '30663',
    '3068b',
    '3069b',
    '3070b',
    '3176',
    '32000',
    '32001',
    '32002',
    '32009',
    '32013',
    '32014',
    '32015',
    '32016',
    '32018',
    '32028',
    '32034',
    '32039',
    '32054',
    '32056',
    '32059',
    '32062',
    '32063',
    '32064',
    '32072',
    '32073',
    '32124',
    '32140',
    '32184',
    '32192',
    '32209',
    '32269',
    '32270',
    '32271',
    '32278',
    '32291',
    '32316',
    '32348',
    '32348',
    '32449',
    '3245c',
    '32474',
    '32523',
    '32524',
    '32525',
    '32526',
    '32530',
    '32556',
    '32606',
    '32607',
    '32803',
    '32828',
    '32952',
    '3297',
    '3298',
    '33078',
    '33183',
    '33243',
    '33291',
    '33299',
    '33909',
    '34103',
    '3460',
    '35044',
    '35464',
    '35480',
    '35787',
    '3622',
    '3623',
    '3633',
    '3648',
    '3659',
    '3660',
    '3665',
    '3666',
    '3673',
    '36752a',
    '3676',
    '3678b',
    '3679',
    '3680',
    '36840',
    '36841',
    '3684c',
    '3685',
    '3700',
    '3701',
    '3702',
    '3703',
    '3705',
    '3706',
    '3707',
    '3708',
    '3709b',
    '3710',
    '3711',
    '3713',
    '37352',
    '3737',
    '3738',
    '3743',
    '3747b',
    '3749',
    '3795',
    '3829c01',
    '3830',
    '3831',
    '3832',
    '3839b',
    '3873',
    '3894',
    '3895',
    '3899',
    '3937',
    '3938',
    '3941',
    '3942c',
    '3957',
    '3958',
    '3960',
    '39739',
    '4006',
    '4032',
    '40344',
    '40345',
    '40379',
    '40490',
    '4070',
    '4073',
    '4081b',
    '4085',
    '41239',
    '41539',
    '4162',
    '41677',
    '41678',
    '41682',
    '41740',
    '4175',
    '41769',
    '41770',
    '4185',
    '42003',
    '42022',
    '42023',
    '4216',
    '42610',
    '4265c',
    '4274',
    '4282',
    '4286',
    '4287',
    '43093',
    '4345',
    '4346',
    '4349',
    '43719',
    '43722',
    '43723',
    '43857',
    '43888',
    '43898',
    '44294',
    '44301',
    '44302',
    '44375',
    '44567',
    '4460b',
    '44728',
    '4477',
    '4488',
    '4490',
    '4510',
    '4519',
    '4532',
    '45590',
    '4589',
    '4590',
    '4592c02',
    '4599b',
    '4600',
    '46212',
    '4624',
    '4697b',
    '4733',
    '47397',
    '47398',
    '4740',
    '47455',
    '47456',
    '47457',
    '47458',
    '47905',
    '48092',
    '48183',
    '48336',
    '4865',
    '4871',
    '48729',
    '48989',
    '49307',
    '49668',
    '50254',
    '50304',
    '50305',
    '50745',
    '50950',
    '51739',
    '52031',
    '52107',
    '52501',
    '53451',
    '53585',
    '54200',
    '54383',
    '54384',
    '55013',
    '553',
    '55981',
    '55982',
    '56145',
    '57518',
    '57895',
    '57909',
    '58176',
    '58247',
    '59349',
    '59895',
    '6003',
    '60032',
    '6005',
    '60470',
    '60471',
    '60474',
    '60476',
    '60477',
    '60478',
    '60479',
    '60481',
    '60483',
    '60484',
    '60485',
    '60581',
    '60592',
    '60593',
    '60594',
    '60596',
    '6060',
    '60601',
    '60602',
    '60608',
    '6081',
    '60849',
    '6091',
    '6106',
    '6111',
    '6112',
    '61184',
    '61252',
    '6126b',
    '6134',
    '61409',
    '61482',
    '61485',
    '6157',
    '61678',
    '61780',
    '6179',
    '6180',
    '6182',
    '6191',
    '6215',
    '6231',
    '6232',
    '62462',
    '6259',
    '63864',
    '63868',
    '63869',
    '63965',
    '64179',
    '64225',
    '64644',
    '64647',
    '64648',
    '64782',
    '64799',
    '6536',
    '6541',
    '6553',
    '6558',
    '6587',
    '6589',
    '6628',
    '6629',
    '6632',
    '6636',
    '74967',
    '75937',
    '76766',
    '85080',
    '85861',
    '85943',
    '85970',
    '85975',
    '85984',
    '87079',
    '87081',
    '87082',
    '87083',
    '87087',
    '87414',
    '87544',
    '87552',
    '87580',
    '87609',
    '87620',
    '87697',
    '87747',
    '87994',
    '88292',
    '88293',
    '88646',
    '88930',
    '89522',
    '90195',
    '90540',
    '91988',
    '92013',
    '92099',
    '92280',
    '92582',
    '92690',
    '92738',
    '92907',
    '92946',
    '92947',
    '92950',
    '93095',
    '93160',
    '93273',
    '93274',
    '93606',
    '94925',
    '95344',
    '96874',
    '98100',
    '98138',
    '98282',
    '98283',
    '98585',
    '98834',
    '99008',
    '99021',
    '99206',
    '99207',
    '99773',
    '99780',
    '99781'
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
