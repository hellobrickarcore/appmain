/**
 * XP Service - Client-side integration for server-authoritative XP system
 * All XP calculations happen on the server. Client only emits events and displays results.
 */

import { CONFIG } from './configService';
import { apiRequest } from './apiService';

export interface XPEvent {
  event_id: string;
  type: string;
  user_id: string;
  timestamp: number;
  payload: Record<string, any>;
}

export interface XPResponse {
  success: boolean;
  xp_awarded: number;
  breakdown: Array<{ source: string; amount: number }>;
  new_xp_total: number;
  new_level: number;
  streak_count: number;
  caps?: Record<string, number>;
}

export interface UserXP {
  xp_total: number;
  level: number;
  streak_count: number;
  streak_last_date: string | null;
}


/**
 * Emit an XP event to the server
 * Returns XP awarded and updated user stats
 */
export const emitXPEvent = async (event: XPEvent): Promise<XPResponse> => {
  try {
    const data = await apiRequest(CONFIG.XP_EVENTS, {
      method: 'POST',
      body: JSON.stringify(event),
    });
    return data;
  } catch (error) {
    console.error('❌ Exception in emitXPEvent:', error);
    // Ensure we don't log just {}
    if (typeof error === 'object' && error !== null) {
      console.log('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    throw error;
  }
};

/**
 * Get user XP summary
 */
export const getUserXP = async (userId: string): Promise<UserXP & { today_xp?: number }> => {
  try {
    return await apiRequest(`${CONFIG.XP_ME}?user_id=${userId}`);
  } catch (error) {
    console.error('❌ Error getting user XP:', error);
    if (typeof error === 'object' && error !== null) {
      console.log('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    throw error;
  }
};

/**
 * Get user daily stats
 */
export const getDailyStats = async (userId: string): Promise<Record<string, any>> => {
  try {
    const response = await fetch(`${CONFIG.XP_DAILY_STATS}?user_id=${userId}`);

    if (!response.ok) {
      return { daily_xp: 0, goal_met: false };
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting daily stats:', error);
    throw error;
  }
};

/**
 * Get XP ledger (history)
 */
export const getXPLedger = async (userId: string, limit: number = 50): Promise<any[]> => {
  try {
    const response = await fetch(`${CONFIG.XP_LEDGER}?user_id=${userId}&limit=${limit}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('❌ Error getting XP ledger:', error);
    throw error;
  }
};

/**
 * Get XP leaderboard
 */
export const getXPLeaderboard = async (limit: number = 20): Promise<any[]> => {
  try {
    const response = await fetch(`${CONFIG.XP_LEADERBOARD}?limit=${limit}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('❌ Error getting XP leaderboard:', error);
    throw error;
  }
};

/**
 * Helper: Generate unique event ID
 */
export const generateEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper: Get or create user ID
 */
export const getUserId = (): string => {
  let userId = localStorage.getItem('hellobrick_userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('hellobrick_userId', userId);
  }
  return userId;
};

// Event type helpers
export const EventTypes = {
  SCAN_SESSION_STARTED: 'SCAN_SESSION_STARTED',
  SCAN_DETECTION_CONFIRMED: 'SCAN_DETECTION_CONFIRMED',
  SORT_SESSION_COMPLETED: 'SORT_SESSION_COMPLETED',
  BUILD_COMPLETED: 'BUILD_COMPLETED',
  CHALLENGE_COMPLETED: 'CHALLENGE_COMPLETED',
  ANNOTATION_SUBMITTED: 'ANNOTATION_SUBMITTED',
  ANNOTATION_VERIFIED: 'ANNOTATION_VERIFIED',
  BATTLE_COMPLETED: 'BATTLE_COMPLETED',
};

/**
 * Format raw event type into human-friendly string
 */
export const PROD_API_BASE = 'https://hellobrick.netlify.app/api';
export const formatXPEvent = (type: string, payload: any = {}): string => {
  switch (type) {
    case EventTypes.SCAN_DETECTION_CONFIRMED:
      return `Scanned ${payload.detection_count || 1} brick${(payload.detection_count || 1) !== 1 ? 's' : ''}`;
    case EventTypes.SCAN_SESSION_STARTED:
      return 'Started a scan session';
    case EventTypes.CHALLENGE_COMPLETED:
      return `Completed ${payload.difficulty || ''} Challenge`;
    case EventTypes.BUILD_COMPLETED:
      return `Built a model with ${payload.part_count || 0} pieces`;
    case EventTypes.BATTLE_COMPLETED:
      return `Finished a Brick Battle (${payload.result || 'Draw'})`;
    case EventTypes.ANNOTATION_SUBMITTED:
      return `Verified ${payload.item_count || 1} brick details`;
    default:
      return 'Earned XP';
  }
};

/**
 * Convenience functions for common events
 */
export const xpHelpers = {
  /**
   * Scan detection confirmed
   */
  scanDetection: async (detectionCount: number, uniqueCount: number = 0) => {
    const userId = getUserId();
    return emitXPEvent({
      event_id: generateEventId(),
      type: EventTypes.SCAN_DETECTION_CONFIRMED,
      user_id: userId,
      timestamp: Date.now(),
      payload: {
        detection_count: detectionCount,
        unique_count: uniqueCount,
      },
    });
  },

  /**
   * Annotation submitted
   */
  annotationSubmitted: async (itemCount: number) => {
    const userId = getUserId();
    return emitXPEvent({
      event_id: generateEventId(),
      type: EventTypes.ANNOTATION_SUBMITTED,
      user_id: userId,
      timestamp: Date.now(),
      payload: {
        item_count: itemCount,
      },
    });
  },

  /**
   * Battle completed
   */
  battleCompleted: async (mode: string, result: string, scoreA: number, scoreB: number, activity: Record<string, number> = {}) => {
    const userId = getUserId();
    return emitXPEvent({
      event_id: generateEventId(),
      type: EventTypes.BATTLE_COMPLETED,
      user_id: userId,
      timestamp: Date.now(),
      payload: {
        mode,
        result,
        score_a: scoreA,
        score_b: scoreB,
        ...activity,
      },
    });
  },

  /**
   * Challenge completed
   */
  challengeCompleted: async (challengeId: string, difficulty: string = 'medium') => {
    const userId = getUserId();
    return emitXPEvent({
      event_id: generateEventId(),
      type: EventTypes.CHALLENGE_COMPLETED,
      user_id: userId,
      timestamp: Date.now(),
      payload: {
        challenge_id: challengeId,
        difficulty,
        xp: 30, // Base XP, server will apply multipliers
      },
    });
  },

  /**
   * Build completed
   */
  buildCompleted: async (partCount: number, complexity: string = 'medium') => {
    const userId = getUserId();
    return emitXPEvent({
      event_id: generateEventId(),
      type: EventTypes.BUILD_COMPLETED,
      user_id: userId,
      timestamp: Date.now(),
      payload: {
        part_count: partCount,
        complexity,
        xp: 50, // Base XP
      },
    });
  },
};




