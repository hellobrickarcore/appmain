/**
 * Session Service
 * 
 * Manages the lifecycle of a Scan Session.
 * Ensures data integrity between live detections and the saved collection.
 */

export interface ScanSession {
    id: string;
    userId: string;
    startTime: string;
    endTime?: string;
    captureImage?: string;
    totalBricks: number;
    status: 'active' | 'completed' | 'cancelled';
}

export interface BrickProposal {
    id: string;
    selected: boolean;
    brickName?: string;
    colorName?: string;
}

import { supabase } from './supabaseService';

class SessionService {
    private currentSession: ScanSession | null = null;

    /**
     * Start a new scan session
     */
    startSession(userId: string): ScanSession {
        const session: ScanSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId,
            startTime: new Date().toISOString(),
            totalBricks: 0,
            status: 'active'
        };
        this.currentSession = session;
        console.log(`[Session] Started: ${session.id}`);
        return session;
    }

    /**
     * Get the active session
     */
    getActiveSession(): ScanSession | null {
        return this.currentSession;
    }

    /**
     * Complete a session and persist it
     */
    async completeSession(
        captureImage: string,
        proposals: BrickProposal[]
    ): Promise<boolean> {
        if (!this.currentSession) return false;

        this.currentSession.endTime = new Date().toISOString();
        this.currentSession.captureImage = captureImage;
        this.currentSession.totalBricks = proposals.filter(p => p.selected).length;
        this.currentSession.status = 'completed';

        console.log(`[Session] Completing: ${this.currentSession.id} with ${this.currentSession.totalBricks} bricks`);

        // In a real app, we would push to Supabase here
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('scan_sessions')
                    .insert({
                        id: this.currentSession.id,
                        user_id: this.currentSession.userId,
                        start_time: this.currentSession.startTime,
                        end_time: this.currentSession.endTime,
                        total_bricks: this.currentSession.totalBricks,
                        status: this.currentSession.status
                    });

                if (error) throw error;
            } catch (err) {
                console.error('[Session] Persistence failed:', err);
                // We still return true if local state is updated, 
                // but sync might be delayed.
            }
        }

        return true;
    }

    /**
     * Cancel the active session
     */
    /**
     * Clear all HelloBrick associated data from local storage
     * Used for hard logouts and session resets.
     */
    clearGlobalSession() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('hellobrick_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('[Session] Global session cleared');
    }
}

export const sessionService = new SessionService();
