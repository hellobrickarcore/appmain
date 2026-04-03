import { Capacitor } from '@capacitor/core';

/**
 * Granular API configuration for HelloBrick
 * 
 * General API calls go through https://hellobrick.app → Netlify proxy → Digital Ocean.
 * 
 * Digital Ocean Production Ports:
 * - Port 3003: Detection Engine, XP, Health
 * - Port 3007: Auth, User Management, Notifications
 */

const PROD_API_BASE = 'https://hellobrick.app';
const DO_IP = '174.138.93.172';
const DO_DETECTION = `http://${DO_IP}:3003`;
const DO_AUTH = `http://${DO_IP}:3007`;

/**
 * Resolves a central API URL based on platform and service.
 * Native/iOS hits Digital Ocean DIRECTLY (using ATS exceptions).
 * Web/Landing uses the Netlify Proxy for SSL compliance.
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${PROD_API_BASE}${cleanPath}`;
  
  // NATIVE MOBILE: Hit Digital Ocean DIRECTLY (Bypass Netlify Proxy)
  if (Capacitor.isNativePlatform()) {
    // Port 3007 for Auth/User services
    if (cleanPath.includes('/auth') || cleanPath.includes('/user') || cleanPath.includes('/notifications')) {
        url = `${DO_AUTH}${cleanPath}`;
    } else if (cleanPath.includes('/xp/')) {
        // Port 3003 for XP services
        url = `http://${DO_IP}:3003${cleanPath}`;
    } else {
        // Port 3003 for Detection and everything else
        url = `${DO_DETECTION}${cleanPath}`;
    }
  }
  
  // CRITICAL: Diagnostic logging for Xcode verification
  if (Capacitor.isNativePlatform()) {
    console.log(`[Config] 📱 ROUTING: ${cleanPath} -> ${url} (Platform: ${Capacitor.getPlatform()})`);
  }
  
  return url;
};

export const CONFIG = {
    // Auth (Port 3007)
    AUTH_SIGNUP: getApiUrl('/api/auth/signup'),
    AUTH_LOGIN: getApiUrl('/api/auth/login'),
    AUTH_RESET_PASSWORD: getApiUrl('/api/auth/reset-password'),
    AUTH_VERIFY_TOKEN: getApiUrl('/api/auth/verify-reset-token'),
    AUTH_UPDATE_PASSWORD: getApiUrl('/api/auth/update-password'),

    // User (Port 3007)
    USER_DELETE: getApiUrl('/api/user/delete'),
    USER_SETTINGS: getApiUrl('/api/user/settings'),

    // Notifications (Port 3007)
    NOTIFICATIONS_REGISTER: getApiUrl('/api/notifications/register'),
    NOTIFICATIONS_SETTINGS: getApiUrl('/api/notifications/settings'),

    // Feed/Connect (Port 3003)
    FEED_POSTS: getApiUrl('/api/feed/posts'),

    // XP / Leaderboard (Port 3003)
    XP_LEADERBOARD: getApiUrl('/api/xp/leaderboard'),
    XP_EVENTS: getApiUrl('/api/xp/events'),
    XP_ME: getApiUrl('/api/xp/me'),
    XP_DAILY_STATS: getApiUrl('/api/xp/daily-stats'),
    XP_LEDGER: getApiUrl('/api/xp/ledger'),

    // Dataset / Collection (Port 3003)
    DATASET_UPLOAD: getApiUrl('/api/dataset/upload'),
    DATASET_NEXT: getApiUrl('/api/dataset/training/next'),
    DATASET_VOTE: getApiUrl('/api/dataset/verify'),
    COLLECTION_GET: getApiUrl('/api/dataset/collection/get'),
    COLLECTION_SAVE: getApiUrl('/api/dataset/collection/save'),

    // Detection (Port 3003)
    DETECT_IMAGE: getApiUrl('/api/detect'),
    SCAN_RECORD: getApiUrl('/api/scan/record'),

    // Ideas (Port 3003)
    IDEAS_RECORD: getApiUrl('/api/ideas/record'),

    // Sessions (Port 3003)
    SESSION_HEARTBEAT: getApiUrl('/api/sessions/heartbeat'),

    // Webhooks
    SUBSCRIPTION_WEBHOOK: getApiUrl('/api/webhooks/revenuecat'),
};
