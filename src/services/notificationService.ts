import { Capacitor } from '@capacitor/core';
import { CONFIG } from './configService';

// Push notifications plugin (optional - only on native platforms with Capacitor 7+)
let PushNotifications: any = null;
try {
  // Dynamic import to avoid build errors if plugin not installed
  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    // Only import on native platforms
    // PushNotifications = require('@capacitor/push-notifications');
  }
} catch (e) {
  console.log('📱 Push notifications plugin not available');
}

export interface NotificationSettings {
  enabled: boolean;
  questReminders: boolean;
  battleInvites: boolean;
  feedUpdates: boolean;
  trainingReminders: boolean;
}

class NotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;
  private settings: NotificationSettings = {
    enabled: false,
    questReminders: true,
    battleInvites: true,
    feedUpdates: true,
    trainingReminders: true
  };

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      const saved = localStorage.getItem('hellobrick_notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }

      // Only initialize on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('📱 Push notifications only available on native platforms');
        return;
      }

      // Check if PushNotifications is available
      if (!PushNotifications) {
        console.log('📱 Push notifications plugin not installed. Install @capacitor/push-notifications for Capacitor 7+');
        // Still allow settings to be saved, just won't register for notifications
        this.isInitialized = true;
        return;
      }

      try {
        // Request permissions
        const permissionStatus = await PushNotifications.requestPermissions();

        if (permissionStatus.receive === 'granted') {
          // Register for push notifications
          await PushNotifications.register();
          this.isInitialized = true;
          console.log('✅ Push notifications initialized');
        } else {
          console.warn('⚠️ Push notification permission denied');
          this.settings.enabled = false;
          this.saveSettings();
        }

        // Set up event listeners
        this.setupListeners();
      } catch (error) {
        console.warn('⚠️ Push notifications not available:', error);
        this.isInitialized = true; // Mark as initialized so settings still work
      }
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
    }
  }

  /**
   * Set up push notification event listeners
   */
  private setupListeners(): void {
    if (!PushNotifications) return;

    try {
      // Handle registration
      PushNotifications.addListener('registration', (token: any) => {
        console.log('📱 Push registration success, token:', token.value);
        this.fcmToken = token.value;

        // Send token to backend for storage
        this.sendTokenToBackend(token.value);
      });

      // Handle registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('❌ Push registration error:', error);
      });

      // Handle incoming notifications
      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('📬 Push notification received:', notification);
        // Handle notification display
      });

      // Handle notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('👆 Push notification action:', action);
        // Handle user interaction with notification
      });
    } catch (error) {
      console.warn('⚠️ Could not set up push notification listeners:', error);
    }
  }

  /**
   * Send FCM token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';

      // Try to send to backend
      await fetch(CONFIG.NOTIFICATIONS_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token,
          platform: Capacitor.getPlatform()
        })
      });
    } catch (error) {
      console.warn('⚠️ Could not send token to backend:', error);
      // Store locally as fallback
      localStorage.setItem('hellobrick_fcm_token', token);
    }
  }

  /**
   * Enable or disable notifications
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    this.saveSettings();

    if (enabled && !this.isInitialized) {
      await this.initialize();
    }

    // Update backend
    await this.updateBackendSettings();
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
    await this.updateBackendSettings();
  }

  /**
   * Get current notification settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('hellobrick_notification_settings', JSON.stringify(this.settings));
  }

  /**
   * Update settings on backend
   */
  private async updateBackendSettings(): Promise<void> {
    try {
      const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';

      await fetch(CONFIG.NOTIFICATIONS_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          settings: this.settings,
          token: this.fcmToken
        })
      });
    } catch (error) {
      console.warn('⚠️ Could not update backend settings:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled && this.isInitialized;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
