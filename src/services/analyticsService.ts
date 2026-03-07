/**
 * Analytics Service for HelloBrick
 * Tracks user behavior and app performance
 * Supports multiple analytics providers
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class AnalyticsService {
  private initialized = false;
  private userId: string | null = null;
  private provider: 'amplitude' | 'custom' | null = null;

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get or create user ID
      this.userId = this.getUserId();

      // Check if Amplitude is available (can be added later)
      // For now, use custom logging
      this.provider = 'custom';

      // Log initialization
      this.log('analytics_initialized', {
        provider: this.provider,
        timestamp: Date.now(),
      });

      this.initialized = true;
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  /**
   * Get or create user ID
   */
  private getUserId(): string {
    if (typeof window === 'undefined') return 'anonymous';

    let userId = localStorage.getItem('hellobrick_userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('hellobrick_userId', userId);
    }
    return userId;
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      this.initialize().then(() => this.track(eventName, properties));
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: Date.now(),
      },
      userId: this.userId || undefined,
    };

    this.log(eventName, event.properties);

    // Send to analytics provider
    this.sendToProvider(event);
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  /**
   * Track detection event
   */
  trackDetection(brickCount: number, properties?: Record<string, any>): void {
    this.track('brick_detection', {
      brick_count: brickCount,
      ...properties,
    });
  }

  /**
   * Track quest completion
   */
  trackQuestCompletion(questId: string, xpEarned: number): void {
    this.track('quest_completed', {
      quest_id: questId,
      xp_earned: xpEarned,
    });
  }

  /**
   * Track collection update
   */
  trackCollectionUpdate(brickCount: number, action: 'add' | 'remove' | 'update'): void {
    this.track('collection_updated', {
      brick_count: brickCount,
      action,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized) {
      this.initialize().then(() => this.setUserProperties(properties));
      return;
    }

    this.track('user_properties_updated', properties);
  }

  /**
   * Log to console (development)
   */
  private log(eventName: string, properties?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, properties);
    }
  }

  /**
   * Send event to analytics provider
   */
  private sendToProvider(event: AnalyticsEvent): void {
    switch (this.provider) {
      case 'amplitude':
        // TODO: Add Amplitude SDK integration
        // Amplitude.getInstance().logEvent(event.name, event.properties);
        break;
      case 'custom':
        // Send to custom analytics endpoint
        this.sendToCustomEndpoint(event);
        break;
      default:
        // Just log for now
        break;
    }
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, send to your analytics endpoint
      // For now, just store locally for debugging
      if (process.env.NODE_ENV === 'development') {
        const events = JSON.parse(localStorage.getItem('hellobrick_analytics') || '[]');
        events.push({
          ...event,
          timestamp: Date.now(),
        });
        // Keep only last 100 events
        const recentEvents = events.slice(-100);
        localStorage.setItem('hellobrick_analytics', JSON.stringify(recentEvents));
      }

      // In production, uncomment to send to server:
      /*
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      */
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Initialize on import
if (typeof window !== 'undefined') {
  analytics.initialize();
}

// Export convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackScreen = (screenName: string, properties?: Record<string, any>) => {
  analytics.trackScreen(screenName, properties);
};

export const trackAction = (action: string, properties?: Record<string, any>) => {
  analytics.trackAction(action, properties);
};
