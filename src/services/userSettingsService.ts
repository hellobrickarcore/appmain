/**
 * User Settings Service
 * Handles user preferences like privacy settings
 */

import { CONFIG } from './configService';

export interface UserSettings {
  isPrivate: boolean;
  notificationsEnabled: boolean;
  email?: string;
  userId: string;
}

class UserSettingsService {
  /**
   * Get user settings
   */
  getSettings(userId: string): UserSettings {
    const stored = localStorage.getItem(`hellobrick_user_settings_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      isPrivate: false,
      notificationsEnabled: true,
      userId
    };
  }

  /**
   * Save user settings
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    // Save to localStorage
    localStorage.setItem(`hellobrick_user_settings_${settings.userId}`, JSON.stringify(settings));

    // Try to save to backend
    try {
      await fetch(CONFIG.USER_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (error) {
      console.warn('⚠️ Could not save settings to backend:', error);
    }
  }

  /**
   * Update privacy setting
   */
  async setPrivacy(userId: string, isPrivate: boolean): Promise<void> {
    const settings = this.getSettings(userId);
    settings.isPrivate = isPrivate;
    await this.saveSettings(settings);
  }

  /**
   * Update notification setting
   */
  async setNotifications(userId: string, enabled: boolean): Promise<void> {
    const settings = this.getSettings(userId);
    settings.notificationsEnabled = enabled;
    await this.saveSettings(settings);
  }
}

export const userSettingsService = new UserSettingsService();
