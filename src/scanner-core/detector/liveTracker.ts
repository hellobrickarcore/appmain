import { FrameDetection, TrackedObject } from '../../types/detection';
import { calculateIOU } from '../../utils/coordinateMapping';

/**
 * 🔒 MAGNET-LOCK TRACKER
 * 
 * Implements track persistence and magnetic lock behavior.
 * 
 * Rules:
 * 1. Initial detection threshold: 0.35
 * 2. Lock threshold: 3 consistent hits
 * 3. Persistence window: 15 frames after detector miss
 * 4. IoU Association: 0.35
 * 5. Coordinate Smoothing: EMA (Exponential Moving Average)
 */

interface TrackState {
    id: string;
    label: string;
    bbox: { xMin: number; yMin: number; xMax: number; yMax: number };
    lockStrength: number;
    age: number; // Frames since last seen by detector
    totalFramesSeen: number;
    lastSeenDetections?: FrameDetection;
    velocity: { x: number; y: number };
}

export class LiveTracker {
    private tracks: Map<string, TrackState> = new Map();
    private nextTrackId = 1;
    private readonly LOCK_THRESHOLD = 3;
    private readonly MAX_AGE = 45; // Persistent through ~2 sec of frames at 25fps
    private readonly IOU_THRESHOLD = 0.35; 
    private readonly SMOOTHING = 0.20; // More stable/heavy boxes

    update(detections: FrameDetection[]): TrackedObject[] {
        const hits = new Set<string>();

        // 1. Associate detections with tracks
        detections.forEach(det => {
            let bestIou = 0;
            let matchId: string | null = null;

            for (const [id, track] of this.tracks.entries()) {
                const iou = calculateIOU(det.geometry.bbox, track.bbox);
                if (iou > this.IOU_THRESHOLD && iou > bestIou) {
                    bestIou = iou;
                    matchId = id;
                }
            }

            if (matchId) {
                const track = this.tracks.get(matchId)!;
                // Update track (Magnetic Lock)
                track.lockStrength = Math.min(track.lockStrength + 1, 10);
                track.age = 0;
                track.totalFramesSeen++;
                track.lastSeenDetections = det;
                
                // Calculate Velocity for prediction
                const dx = (det.geometry.bbox.xMin - track.bbox.xMin);
                const dy = (det.geometry.bbox.yMin - track.bbox.yMin);
                track.velocity = { 
                    x: track.velocity.x * 0.7 + dx * 0.3, 
                    y: track.velocity.y * 0.7 + dy * 0.3 
                };

                // EMA Smoothing
                track.bbox = {
                    xMin: track.bbox.xMin * (1 - this.SMOOTHING) + det.geometry.bbox.xMin * this.SMOOTHING,
                    yMin: track.bbox.yMin * (1 - this.SMOOTHING) + det.geometry.bbox.yMin * this.SMOOTHING,
                    xMax: track.bbox.xMax * (1 - this.SMOOTHING) + det.geometry.bbox.xMax * this.SMOOTHING,
                    yMax: track.bbox.yMax * (1 - this.SMOOTHING) + det.geometry.bbox.yMax * this.SMOOTHING,
                };
                
                hits.add(matchId);
            } else {
                // New candidate
                const newId = `track_${this.nextTrackId++}`;
                this.tracks.set(newId, {
                    id: newId,
                    label: det.compactLabel || det.prediction.brickName || 'Unknown',
                    bbox: { ...det.geometry.bbox },
                    lockStrength: 1,
                    age: 0,
                    totalFramesSeen: 1,
                    lastSeenDetections: det,
                    velocity: { x: 0, y: 0 }
                });
                hits.add(newId);
            }
        });

        // 2. Handle misses (Persistence + Velocity Prediction)
        for (const [id, track] of this.tracks.entries()) {
            if (!hits.has(id)) {
                track.age++;
                
                // Prediction: project box based on last known velocity
                if (track.age > 0 && track.age < 10) {
                    track.bbox.xMin += track.velocity.x;
                    track.bbox.xMax += track.velocity.x;
                    track.bbox.yMin += track.velocity.y;
                    track.bbox.yMax += track.velocity.y;
                }

                if (track.age > this.MAX_AGE) {
                    this.tracks.delete(id);
                }
            }
        }

        // 3. Return locked tracks for rendering
        return Array.from(this.tracks.values())
            .filter(t => t.lockStrength >= this.LOCK_THRESHOLD || t.totalFramesSeen > 5)
            .map(t => {
                const conf = t.lastSeenDetections?.geometry.geometryConfidence || 0;
                const identityConf = t.lastSeenDetections?.prediction.identityConfidence || 0;
                const colorConf = t.lastSeenDetections?.prediction.colorConfidence || 0;
                
                return {
                    trackedObjectId: t.id,
                    trackId: t.id,
                    status: (t.age > 0 ? 'stable' : 'active') as 'active' | 'stable' | 'ambiguous' | 'finalized' | 'dropped',
                    totalFramesSeen: t.totalFramesSeen,
                    stableGeometry: {
                        type: 'bbox_xyxy',
                        bbox: { ...t.bbox, format: 'xyxy', space: 'pixel' },
                        geometryConfidence: conf
                    },
                    consensusBrickName: t.label,
                    geometryConfidence: conf,
                    identityConfidence: identityConf,
                    colorConfidence: colorConf,
                    labelDisplayStatus: (t.lockStrength >= this.LOCK_THRESHOLD ? 'confirmed' : 'tentative') as 'confirmed' | 'tentative',
                    promotedToCollection: false
                } satisfies TrackedObject;
            });
    }

    reset() {
        this.tracks.clear();
        this.nextTrackId = 1;
    }
}

export const liveTracker = new LiveTracker();
