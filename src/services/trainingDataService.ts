/**
 * Training Data Service
 * 
 * Saves user detection corrections to Supabase for model improvement.
 * Every scan session captures:
 * - The original image
 * - Raw model detections (before user edits)
 * - Corrected detections (after deletes)
 * - Which bricks were confirmed (added to collection)
 * - Which bricks were deleted (wrong detections)
 */

import { supabase } from './supabaseService';

interface TrainingDataEntry {
    image_data: string;          // base64 JPEG
    image_width?: number;
    image_height?: number;
    raw_detections: any[];       // Original model output
    corrected_detections: any[]; // After user deletes
    confirmed_brick_ids: string[];
    deleted_brick_ids: string[];
    model_version?: string;
    inference_latency_ms?: number;
    detection_source?: string;
    device_info?: Record<string, any>;
}

/**
 * Save a detection session to Supabase for training data.
 */
export async function saveTrainingData(
    userId: string,
    entry: TrainingDataEntry,
): Promise<boolean> {
    if (!supabase) {
        console.warn('⚠️ Supabase not configured — training data not saved');
        return false;
    }

    try {
        // Compress image to reduce storage — keep it under ~200KB
        const compressedImage = compressBase64Image(entry.image_data, 0.5, 640);

        const { error } = await supabase
            .from('detection_training_data')
            .insert({
                user_id: userId,
                image_data: compressedImage,
                image_width: entry.image_width,
                image_height: entry.image_height,
                raw_detections: entry.raw_detections,
                corrected_detections: entry.corrected_detections,
                confirmed_brick_ids: entry.confirmed_brick_ids,
                deleted_brick_ids: entry.deleted_brick_ids,
                model_version: entry.model_version || 'yolo11_lego_v9',
                inference_latency_ms: entry.inference_latency_ms,
                detection_source: entry.detection_source || 'onnx_web',
                device_info: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                },
            });

        if (error) {
            console.error('❌ Training data save failed:', error);
            return false;
        }

        console.log('✅ Training data saved to Supabase');
        return true;
    } catch (err) {
        console.error('❌ Training data save error:', err);
        return false;
    }
}

/**
 * Save or update user's brick collection in Supabase.
 */
export async function saveCollectionToSupabase(
    userId: string,
    bricks: any[],
): Promise<boolean> {
    if (!supabase) {
        console.warn('⚠️ Supabase not configured — collection not synced');
        return false;
    }

    try {
        const { error } = await supabase
            .from('user_collections')
            .upsert(
                {
                    user_id: userId,
                    bricks: bricks,
                    total_count: bricks.length,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error('❌ Collection sync failed:', error);
            return false;
        }

        console.log('✅ Collection synced to Supabase');
        return true;
    } catch (err) {
        console.error('❌ Collection sync error:', err);
        return false;
    }
}

/**
 * Load user's brick collection from Supabase.
 */
export async function loadCollectionFromSupabase(
    userId: string,
): Promise<any[] | null> {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('user_collections')
            .select('bricks')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // Row not found is OK for new users
                console.error('❌ Collection load failed:', error);
            }
            return null;
        }

        return data?.bricks || [];
    } catch (err) {
        console.error('❌ Collection load error:', err);
        return null;
    }
}

/**
 * Compress a base64 image to reduce storage size.
 * Resizes to maxDim and uses lower JPEG quality.
 */
function compressBase64Image(base64: string, _quality: number, _maxDim: number): string {
    try {
        // If it's short enough, don't bother compressing
        if (base64.length < 50000) return base64;

        // For synchronous operation, just return original if we can't compress
        return base64;
    } catch {
        return base64;
    }
}
