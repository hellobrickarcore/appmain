/**
 * ByteTrack Object Tracker
 * 
 * Lightweight JavaScript reimplementation of ByteTrack for multi-object tracking.
 * Assigns persistent IDs to detections across frames using IoU matching
 * and Kalman filter-like position prediction for smooth box movement.
 */

export interface TrackedObject {
    id: string;
    box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
    label: string;
    color?: string;
    partNumber?: string;
    confidence: number;
    age: number;        // Frames since first detection
    hits: number;       // Total successful matches
    misses: number;     // Consecutive missed frames
    velocity: [number, number, number, number]; // Box velocity for prediction
}

interface TrackState {
    tracks: TrackedObject[];
    nextId: number;
}

const MAX_MISS_COUNT = 5;  // Remove track after 5 consecutive misses
const IOU_THRESHOLD = 0.2; // Minimum IoU to match
const HIGH_CONF_THRESHOLD = 0.2;
const LOW_CONF_THRESHOLD = 0.05;
const VELOCITY_SMOOTHING = 0.7; // Exponential smoothing factor

/**
 * Calculate IoU between two boxes [ymin, xmin, ymax, xmax]
 */
function calculateIoU(boxA: number[], boxB: number[]): number {
    const [aymin, axmin, aymax, axmax] = boxA;
    const [bymin, bxmin, bymax, bxmax] = boxB;

    const interYmin = Math.max(aymin, bymin);
    const interXmin = Math.max(axmin, bxmin);
    const interYmax = Math.min(aymax, bymax);
    const interXmax = Math.min(axmax, bxmax);

    const interArea = Math.max(0, interXmax - interXmin) * Math.max(0, interYmax - interYmin);
    if (interArea === 0) return 0;

    const areaA = (axmax - axmin) * (aymax - aymin);
    const areaB = (bxmax - bxmin) * (bymax - bymin);

    return interArea / (areaA + areaB - interArea);
}

/**
 * Predict next box position using velocity
 */
function predictBox(box: [number, number, number, number], velocity: [number, number, number, number]): [number, number, number, number] {
    return [
        box[0] + velocity[0],
        box[1] + velocity[1],
        box[2] + velocity[2],
        box[3] + velocity[3],
    ];
}

/**
 * Hungarian-style greedy matching: match detections to tracks via IoU
 */
function greedyMatch(
    tracks: TrackedObject[],
    detections: { box: number[]; label: string; color?: string; partNumber?: string; confidence: number }[]
): { matched: [number, number][]; unmatchedTracks: number[]; unmatchedDetections: number[] } {
    const matched: [number, number][] = [];
    const usedTracks = new Set<number>();
    const usedDetections = new Set<number>();

    // Build IoU cost matrix
    const costs: { ti: number; di: number; iou: number }[] = [];
    for (let ti = 0; ti < tracks.length; ti++) {
        const predicted = predictBox(tracks[ti].box, tracks[ti].velocity);
        for (let di = 0; di < detections.length; di++) {
            const iou = calculateIoU(predicted, detections[di].box);
            if (iou >= IOU_THRESHOLD) {
                costs.push({ ti, di, iou });
            }
        }
    }

    // Sort by IoU descending (greedy best-first)
    costs.sort((a, b) => b.iou - a.iou);

    for (const { ti, di } of costs) {
        if (usedTracks.has(ti) || usedDetections.has(di)) continue;
        matched.push([ti, di]);
        usedTracks.add(ti);
        usedDetections.add(di);
    }

    const unmatchedTracks = tracks.map((_, i) => i).filter(i => !usedTracks.has(i));
    const unmatchedDetections = detections.map((_, i) => i).filter(i => !usedDetections.has(i));

    return { matched, unmatchedTracks, unmatchedDetections };
}

/**
 * ByteTrack Tracker
 * 
 * Call update() with each new frame's detections.
 * Returns stable, tracked objects with persistent IDs.
 */
export class ByteTracker {
    private state: TrackState = { tracks: [], nextId: 1 };

    /**
     * Update tracker with new detections from the current frame.
     * Returns tracked objects with stable IDs and smooth positions.
     */
    update(detections: { box: number[]; label: string; color?: string; partNumber?: string; confidence: number }[]): TrackedObject[] {
        // Split detections into high and low confidence
        const highConf = detections.filter(d => d.confidence >= HIGH_CONF_THRESHOLD);
        const lowConf = detections.filter(d => d.confidence >= LOW_CONF_THRESHOLD && d.confidence < HIGH_CONF_THRESHOLD);

        // Step 1: Match high-confidence detections to existing tracks
        const { matched: m1, unmatchedTracks: ut1, unmatchedDetections: ud1 } = greedyMatch(this.state.tracks, highConf);

        // Update matched tracks
        for (const [ti, di] of m1) {
            const track = this.state.tracks[ti];
            const det = highConf[di];
            const newBox = det.box as [number, number, number, number];

            // Update velocity with exponential smoothing
            track.velocity = [
                VELOCITY_SMOOTHING * track.velocity[0] + (1 - VELOCITY_SMOOTHING) * (newBox[0] - track.box[0]),
                VELOCITY_SMOOTHING * track.velocity[1] + (1 - VELOCITY_SMOOTHING) * (newBox[1] - track.box[1]),
                VELOCITY_SMOOTHING * track.velocity[2] + (1 - VELOCITY_SMOOTHING) * (newBox[2] - track.box[2]),
                VELOCITY_SMOOTHING * track.velocity[3] + (1 - VELOCITY_SMOOTHING) * (newBox[3] - track.box[3]),
            ];

            // Smooth box position (blend predicted + observed)
            track.box = [
                0.3 * predictBox(track.box, track.velocity)[0] + 0.7 * newBox[0],
                0.3 * predictBox(track.box, track.velocity)[1] + 0.7 * newBox[1],
                0.3 * predictBox(track.box, track.velocity)[2] + 0.7 * newBox[2],
                0.3 * predictBox(track.box, track.velocity)[3] + 0.7 * newBox[3],
            ];

            track.label = det.label;
            track.color = det.color || track.color;
            track.partNumber = det.partNumber || track.partNumber;
            track.confidence = det.confidence;
            track.age += 1;
            track.hits += 1;
            track.misses = 0;
        }

        // Step 2: Try to match remaining tracks with low-confidence detections
        const remainingTracks = ut1.map(i => this.state.tracks[i]);
        const { matched: m2, unmatchedTracks: ut2 } = greedyMatch(remainingTracks, lowConf);

        for (const [ti, di] of m2) {
            const track = remainingTracks[ti];
            const det = lowConf[di];
            const newBox = det.box as [number, number, number, number];

            track.velocity = [
                VELOCITY_SMOOTHING * track.velocity[0] + (1 - VELOCITY_SMOOTHING) * (newBox[0] - track.box[0]),
                VELOCITY_SMOOTHING * track.velocity[1] + (1 - VELOCITY_SMOOTHING) * (newBox[1] - track.box[1]),
                VELOCITY_SMOOTHING * track.velocity[2] + (1 - VELOCITY_SMOOTHING) * (newBox[2] - track.box[2]),
                VELOCITY_SMOOTHING * track.velocity[3] + (1 - VELOCITY_SMOOTHING) * (newBox[3] - track.box[3]),
            ];

            track.box = [
                0.5 * predictBox(track.box, track.velocity)[0] + 0.5 * newBox[0],
                0.5 * predictBox(track.box, track.velocity)[1] + 0.5 * newBox[1],
                0.5 * predictBox(track.box, track.velocity)[2] + 0.5 * newBox[2],
                0.5 * predictBox(track.box, track.velocity)[3] + 0.5 * newBox[3],
            ];

            track.confidence = det.confidence;
            track.age += 1;
            track.hits += 1;
            track.misses = 0;
        }

        // Step 3: Increment miss count for unmatched tracks
        const finalUnmatchedTrackIndices = ut2.map(i => ut1[i]);
        for (const ti of finalUnmatchedTrackIndices) {
            const track = this.state.tracks[ti];
            track.misses += 1;
            track.age += 1;
            // Predict position even without detection
            track.box = predictBox(track.box, track.velocity);
            // Decay velocity
            track.velocity = [
                track.velocity[0] * 0.5,
                track.velocity[1] * 0.5,
                track.velocity[2] * 0.5,
                track.velocity[3] * 0.5,
            ];
        }

        // Step 4: Create new tracks for unmatched high-confidence detections
        for (const di of ud1) {
            const det = highConf[di];
            this.state.tracks.push({
                id: `brick_${this.state.nextId++}`,
                box: det.box as [number, number, number, number],
                label: det.label,
                color: det.color,
                partNumber: det.partNumber,
                confidence: det.confidence,
                age: 0,
                hits: 1,
                misses: 0,
                velocity: [0, 0, 0, 0],
            });
        }

        // Step 5: Remove dead tracks
        this.state.tracks = this.state.tracks.filter(t => t.misses < MAX_MISS_COUNT);

        // Return only confirmed tracks (seen at least 2 times)
        return this.state.tracks.filter(t => t.hits >= 2 || t.confidence >= 0.7);
    }

    /**
     * Reset all tracks
     */
    reset(): void {
        this.state = { tracks: [], nextId: 1 };
    }

    /**
     * Get current track count
     */
    get trackCount(): number {
        return this.state.tracks.length;
    }
}
