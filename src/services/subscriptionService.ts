import { Capacitor } from '@capacitor/core';
import { Purchases, CustomerInfo, PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';

import { upsertSubscription } from './supabaseService';

// RevenueCat API Keys from environment variables
const REVENUECAT_API_KEY = {
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY || '',
  other: import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || '',
};

export interface SubscriptionStatus {
  isPro: boolean;
  isActive: boolean;
  expirationDate?: Date;
  productId?: string;
  isTestMode?: boolean;
}

class SubscriptionService {
  private isInitialized = false;
  private currentCustomerInfo: CustomerInfo | null = null;
  private testMode = !Capacitor.isNativePlatform(); // Default test mode for web/local
  private currentUserId: string | null = null;

  /**
   * Initialize RevenueCat with your API key
   * Call this once when your app starts
   */
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Determine platform and get appropriate API key
      const platform = await this.getPlatform();
      const apiKey = REVENUECAT_API_KEY[platform];

      if (!apiKey) {
        console.warn('⚠️ RevenueCat API key not configured. Set VITE_REVENUECAT_IOS_KEY in .env.local');
        // In development, we'll allow the app to continue without RevenueCat
        return;
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId, // Optional: set user ID if you have one
      });

      if (userId) {
        this.currentUserId = userId;
      }

      this.isInitialized = true;


      // Load customer info
      await this.refreshCustomerInfo();
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      this.isInitialized = false;
      throw error;
    }

  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const testPro = localStorage.getItem('hellobrick_test_pro') === 'true';
    const userId = localStorage.getItem('hellobrick_userId');
    const isReviewer = userId === 'reviewer-session';

    if (testPro || isReviewer || (this.testMode && !this.isInitialized)) {
      return { isPro: true, isActive: true, isTestMode: !isReviewer };
    }

    try {
      if (!this.isInitialized) {
        return { isPro: false, isActive: false };
      }

      const { customerInfo } = await Purchases.getCustomerInfo();
      this.currentCustomerInfo = customerInfo;

      const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      localStorage.setItem('hellobrick_is_pro', isPro.toString());
      
      const proEntitlement = customerInfo.entitlements.active['pro'];

      const status: SubscriptionStatus = {
        isPro,
        isActive: isPro,
        expirationDate: proEntitlement?.expirationDate ? new Date(proEntitlement.expirationDate) : undefined,
        productId: proEntitlement?.productIdentifier,
      };

      // Sync subscription state to Supabase
      await this.syncToSupabase(status);

      return status;
    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      return { isPro: false, isActive: false };
    }
  }

  /**
   * Get available subscription offerings (products)
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      if (!this.isInitialized) {
        console.warn('RevenueCat not initialized before calling getOfferings. Attempting to initialize now...');
        await this.initialize(this.currentUserId || undefined);
      }

      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        console.warn('⚠️ No current offering found in RevenueCat dashboard.');
      } else {
        // console.log('✅ Offerings fetched successfully:', offerings.current.availablePackages.length, 'packages found');
      }
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return null;
    }

  }

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        console.warn('RevenueCat not initialized before calling purchasePackage. Attempting to initialize now...');
        await this.initialize(this.currentUserId || undefined);
        if (!this.isInitialized) {
          throw new Error('RevenueCat not initialized. Please configure your API key.');
        }
      }

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      this.currentCustomerInfo = customerInfo;

      // console.log('✅ Purchase successful');

      // Sync the new subscription state to Supabase
      const status = await this.getSubscriptionStatus();
      await this.syncToSupabase(status);

      return customerInfo;
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);

      if (error.userCancelled) {
        throw new Error('Purchase cancelled by user');
      }

      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        console.warn('RevenueCat not initialized before calling restorePurchases. Attempting to initialize now...');
        await this.initialize(this.currentUserId || undefined);
        if (!this.isInitialized) {
          throw new Error('RevenueCat not initialized. Please configure your API key.');
        }
      }

      const { customerInfo } = await Purchases.restorePurchases();
      this.currentCustomerInfo = customerInfo;


      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Refresh customer info from RevenueCat servers
   */
  async refreshCustomerInfo(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        throw new Error('RevenueCat not initialized');
      }

      const { customerInfo } = await Purchases.getCustomerInfo();
      this.currentCustomerInfo = customerInfo;
      // console.log('Customer info refreshed. Active entitlements:', Object.keys(customerInfo.entitlements.active));
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to refresh customer info:', error);
      throw error;
    }
  }

  /**
   * Set user ID — links RevenueCat identity with your auth system (e.g. Supabase)
   */
  async setUserId(userId: string): Promise<void> {
    this.currentUserId = userId;

    try {
      if (!this.isInitialized) {
        await this.initialize(userId);
        return;
      }

      await Purchases.logIn({ appUserID: userId });
      const { customerInfo } = await Purchases.getCustomerInfo();
      this.currentCustomerInfo = customerInfo;
      console.log('User ID set and customer info updated:', this.currentCustomerInfo.originalAppUserId);
    } catch (error) {
      console.error('❌ Failed to set user ID:', error);
      throw error;
    }
  }

  /**
   * Log out RevenueCat user (resets to anonymous)
   */
  async logout(): Promise<void> {
    this.currentUserId = null;
    if (!this.isInitialized) return;

    try {
      await Purchases.logOut();

    } catch (error) {
      console.error('❌ Failed to log out RevenueCat user:', error);
    }
  }

  /**
   * Sync subscription status to Supabase for server-side access
   */
  private async syncToSupabase(status: SubscriptionStatus): Promise<void> {
    if (!this.currentUserId) return;

    try {
      await upsertSubscription(this.currentUserId, {
        is_pro: status.isPro,
        is_active: status.isActive,
        product_id: status.productId || null,
        expiration_date: status.expirationDate?.toISOString() || null,
        revenuecat_user_id: this.currentCustomerInfo?.originalAppUserId || null,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      // Non-critical — don't block the user flow
      console.warn('Failed to sync subscription to Supabase:', error);
    }
  }

  /**
   * Get platform (ios or other)
   */
  private async getPlatform(): Promise<'ios' | 'other'> {
    return Capacitor.getPlatform() === 'ios' ? 'ios' : 'other';
  }

  /**
   * Check if RevenueCat is properly configured
   */
  isConfigured(): boolean {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'other';
    const apiKey = REVENUECAT_API_KEY[platform as keyof typeof REVENUECAT_API_KEY];
    return !!apiKey;
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
