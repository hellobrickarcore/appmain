import { DetectionOverlay } from '../types/detection';
import { emitXPEvent, generateEventId } from './xpService';

export type PuzzleType = 'Shape Fit' | 'Color Match' | 'Balance Tower';

export interface PuzzleState {
    type: PuzzleType;
    difficulty: number;
    targetLabel: string;
    targetColor?: string;
    targetDimensions?: string;
    startTime: number;
    isCompleted: boolean;
    score: number;
    round: number;
}

/**
 * Generate a new target for a puzzle round
 */
export const generatePuzzleTarget = (type: PuzzleType, difficulty: number): Partial<PuzzleState> => {
    const families = ['Brick', 'Plate', 'Tile', 'Slope'];
    const colors = ['Red', 'Blue', 'Yellow', 'White', 'Black', 'Green'];
    const dims = ['2x4', '2x2', '1x2', '1x1'];

    if (type === 'Shape Fit') {
        const family = families[Math.floor(Math.random() * families.length)];
        const dim = dims[Math.floor(Math.random() * Math.min(dims.length, difficulty + 1))];
        return {
            targetLabel: `${dim} ${family}`,
            targetDimensions: dim
        };
    }

    if (type === 'Color Match') {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const family = families[Math.floor(Math.random() * families.length)];
        return {
            targetLabel: `${color} ${family}`,
            targetColor: color
        };
    }

    return { targetLabel: 'Any Brick' };
};

/**
 * Check if a detection matches the target
 */
export const checkPuzzleMatch = (
    state: PuzzleState,
    detections: DetectionOverlay[]
): boolean => {
    if (state.isCompleted) return false;

    return detections.some(det => {
        // High confidence required for puzzle matches
        if (det.identityConfidence < 0.6) return false;

        if (state.type === 'Shape Fit') {
            return det.dimensionsLabel === state.targetDimensions;
        }

        if (state.type === 'Color Match') {
            // Need a way to extract color from label or consensus
            return det.compactLabel?.toLowerCase().includes(state.targetColor?.toLowerCase() || '') || false;
        }

        return false;
    });
};

/**
 * Award XP for puzzle completion
 */
export const awardPuzzleXP = async (userId: string, state: PuzzleState): Promise<void> => {
    const elapsed = (Date.now() - state.startTime) / 1000;
    const speedBonus = Math.max(0, 50 - Math.floor(elapsed));
    const totalXP = 10 + (state.difficulty * 5) + speedBonus;

    try {
        await emitXPEvent({
            event_id: generateEventId(),
            type: 'QUEST_COMPLETED',
            user_id: userId,
            timestamp: Date.now(),
            payload: {
                puzzle_type: state.type,
                difficulty: state.difficulty,
                time_seconds: elapsed,
                score: state.score,
                xp_awarded: totalXP
            }
        });
        console.log(`✅ Puzzle XP awarded: ${totalXP}`);
    } catch (err) {
        console.error('❌ Failed to award puzzle XP:', err);
    }
};
