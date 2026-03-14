import { signOut as supabaseSignOut } from './supabaseService';

const AUTH_KEY = 'hellobrick_authenticated';
const USER_ID_KEY = 'hellobrick_userId';

/**
 * Centralized Service for Session and Auth States
 */
export const authService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  /**
   * Get stored User ID
   */
  getUserId: (): string | null => {
    return localStorage.getItem(USER_ID_KEY);
  },

  /**
   * Clear all local session data (Hard Logout)
   */
  clearSession: async () => {
    console.log('🧹 Clearing session data...');
    
    // 1. Sign out from Supabase if possible
    try {
      await supabaseSignOut();
    } catch (e) {
      console.warn('Supabase signout failed, continuing cleanup', e);
    }

    // 2. Clear all HelloBrick associated data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('hellobrick_') || key === 'activeInviteCode')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Session cleared.');
  },

  /**
   * Full Factory Reset (includes onboarding)
   */
  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
