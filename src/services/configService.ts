

/**
 * Granular API configuration for HelloBrick
 * 
 * ALL API calls go through https://hellobrick.app → Netlify proxy → Digital Ocean.
 * No localhost fallback. No local server. Digital Ocean only.
 */

const PROD_API_BASE = 'https://hellobrick.app';

/**
 * Always returns an absolute production URL.
 * Detection calls use the DO server via Netlify proxy (/api/* → 174.138.93.172:3003).
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${PROD_API_BASE}${cleanPath}`;
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
