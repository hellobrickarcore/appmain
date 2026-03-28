

/**
 * Granular API configuration for HelloBrick
 * 
 * General API calls go through https://hellobrick.app → Netlify proxy → Digital Ocean.
 * Detection calls hit Digital Ocean DIRECTLY over HTTP (ATS exception in Info.plist).
 * This removes the Netlify proxy dependency for the camera scanner.
 */

const PROD_API_BASE = 'https://hellobrick.app';
const DO_DIRECT = 'http://174.138.93.172:3003';

/**
 * Always returns an absolute production URL.
 * Detection uses the DO server directly - all other calls go via Netlify proxy.
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

    // Detection — calls Digital Ocean DIRECTLY (bypasses Netlify proxy entirely)
    DETECT_IMAGE: `${DO_DIRECT}/api/detect`,

    // Webhooks
    SUBSCRIPTION_WEBHOOK: getApiUrl('/api/webhooks/revenuecat'),
};
