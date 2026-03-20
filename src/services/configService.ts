import { Capacitor } from '@capacitor/core';

/**
 * Granular API configuration for HelloBrick
 */

const PROD_API_BASE = 'https://hellobrick.netlify.app';

/**
 * Resolves a central API URL based on platform.
 * Dev on web uses relative paths (Vite proxy).
 * Mobile/Native uses absolute paths to the production server or configured backend.
 */
export const getApiUrl = (path: string): string => {
  // Always use absolute URL for native platforms or in explicit production mode
  if (Capacitor.isNativePlatform() || import.meta.env.PROD) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // Remove /api from base if it exists to avoid duplication
    const baseUrl = PROD_API_BASE.endsWith('/api') ? PROD_API_BASE.slice(0, -4) : PROD_API_BASE;
    return `${baseUrl}${cleanPath}`;
  }
  
  // Local web dev uses relative paths (handled by vite.config.ts proxy)
  return path.startsWith('/') ? path : `/${path}`;
};

export const CONFIG = {
    // Auth
    AUTH_SIGNUP: getApiUrl('/api/auth/signup'),
    AUTH_LOGIN: getApiUrl('/api/auth/login'),
    AUTH_RESET_PASSWORD: getApiUrl('/api/auth/reset-password'),
    AUTH_VERIFY_TOKEN: getApiUrl('/api/auth/verify-reset-token'),
    AUTH_UPDATE_PASSWORD: getApiUrl('/api/auth/update-password'),

    // User
    USER_DELETE: getApiUrl('/api/user/delete'),
    USER_SETTINGS: getApiUrl('/api/user/settings'),

    // Notifications
    NOTIFICATIONS_REGISTER: getApiUrl('/api/notifications/register'),
    NOTIFICATIONS_SETTINGS: getApiUrl('/api/notifications/settings'),

    // Feed/Connect
    FEED_POSTS: getApiUrl('/api/feed/posts'),

    // XP / Leaderboard
    XP_LEADERBOARD: getApiUrl('/api/xp/leaderboard'),
    XP_EVENTS: getApiUrl('/api/xp/events'),
    XP_ME: getApiUrl('/api/xp/me'),
    XP_DAILY_STATS: getApiUrl('/api/xp/daily-stats'),
    XP_LEDGER: getApiUrl('/api/xp/ledger'),

    // Dataset / Collection
    DATASET_UPLOAD: getApiUrl('/api/dataset/upload'),
    DATASET_NEXT: getApiUrl('/api/dataset/training/next'),
    DATASET_VOTE: getApiUrl('/api/dataset/verify'),
    COLLECTION_GET: getApiUrl('/api/dataset/collection/get'),
    COLLECTION_SAVE: getApiUrl('/api/dataset/collection/save'),

    // Detection
    DETECT_IMAGE: getApiUrl('/api/detect'),

    // Webhooks
    SUBSCRIPTION_WEBHOOK: getApiUrl('/api/webhooks/revenuecat'),
};
