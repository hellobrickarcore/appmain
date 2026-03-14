import { supabase } from './supabaseService';
import { emitXPEvent, generateEventId } from './xpService';

export interface TrainingFeedback {
    itemId: string;
    confirmed: boolean;
    userId: string;
    originalLabel: string;
    correctedLabel?: string;
    timestamp: number;
}

/**
 * Handle submission of a verification vote
 */
export const submitTrainingFeedback = async (feedback: TrainingFeedback): Promise<void> => {
    if (!supabase) {
        console.warn('Supabase not configured — skipping feedback persistence');
        return;
    }

    try {
        // 1. Persist feedback to Supabase
        const { error } = await supabase
            .from('training_feedback')
            .insert([{
                source_detection_id: feedback.itemId,
                original_prediction: feedback.originalLabel,
                corrected_prediction: feedback.confirmed ? null : feedback.correctedLabel,
                feedback_type: feedback.confirmed ? 'confirm' : 'correct',
                user_id: feedback.userId,
                created_at: new Date(feedback.timestamp).toISOString()
            }]);

        if (error) {
            console.error('❌ Failed to persist training feedback:', error);
        }

        // 2. Award XP
        try {
            await emitXPEvent({
                event_id: generateEventId(),
                type: 'ANNOTATION_VERIFIED',
                user_id: feedback.userId,
                timestamp: feedback.timestamp,
                payload: {
                    item_id: feedback.itemId,
                    confirmed: feedback.confirmed
                }
            });
            console.log('✅ XP awarded for verification');
        } catch (xpError) {
            console.error('❌ Failed to award XP for verification:', xpError);
        }

    } catch (err) {
        console.error('❌ Error in submitTrainingFeedback:', err);
    }
};
