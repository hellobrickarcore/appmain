/**
 * Granular API configuration for HelloBrick
 * All paths are relative and prefixed with /api
 */

export const CONFIG = {
    // Auth
    AUTH_SIGNUP: '/api/auth/signup',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',
    AUTH_VERIFY_TOKEN: '/api/auth/verify-reset-token',
    AUTH_UPDATE_PASSWORD: '/api/auth/update-password',

    // User
    USER_DELETE: '/api/user/delete',
    USER_SETTINGS: '/api/user/settings',

    // Notifications
    NOTIFICATIONS_REGISTER: '/api/notifications/register',
    NOTIFICATIONS_SETTINGS: '/api/notifications/settings',

    // Feed/Connect
    FEED_POSTS: '/api/feed/posts',

    // XP / Leaderboard
    XP_LEADERBOARD: '/api/xp/leaderboard',
    XP_EVENTS: '/api/xp/events',
    XP_ME: '/api/xp/me',
    XP_DAILY_STATS: '/api/xp/daily-stats',
    XP_LEDGER: '/api/xp/ledger',

    // Dataset / Collection
    DATASET_NEXT: '/api/dataset/training/next',
    DATASET_VOTE: '/api/dataset/training/vote',
    COLLECTION_GET: '/api/dataset/collection/get',
    COLLECTION_SAVE: '/api/dataset/collection/save',

    // Detection
    DETECT_IMAGE: '/api/detect/image',

    // Webhooks
    SUBSCRIPTION_WEBHOOK: '/api/webhooks/revenuecat',
};
