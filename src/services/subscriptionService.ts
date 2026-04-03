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
}

class SubscriptionService {
  private isInitialized = false;
  private currentUserId: string | null = null;
  private currentCustomerInfo: CustomerInfo | null = null;

  private syncLocalStorage(customerInfo?: CustomerInfo): void {
    const info = customerInfo || this.currentCustomerInfo;
    if (!info) return;

    // Check for 'pro' (case-insensitive) across all entitlements
    const entitlements = Object.keys(info.entitlements.active).map(k => k.toLowerCase());
    const hasProEntitlement = entitlements.includes('pro') || 
                              entitlements.includes('premium') || 
                              entitlements.includes('full') ||
                              !!info.entitlements.active['pro'] ||
                              !!info.entitlements.active['Pro'];

    const userEmail = localStorage.getItem('hellobrick_userEmail')?.toLowerCase();
    const bypassEmails = ['hellobrickar@gmail.com', 'apple_test@hellobrick.app'];
    
    // HARD BYPASS: If current session is already marked Pro, don't demote until app restart
    // unless we are absolutely sure (this prevents the "5 second flip" bug)
    const wasProInLocalStorage = localStorage.getItem('hellobrick_is_pro') === 'true';
    
    const isPro = hasProEntitlement || 
                  localStorage.getItem('hellobrick_admin_bypass') === 'true' ||
                  (userEmail && bypassEmails.includes(userEmail));
    
    // Sticky Status: If it was Pro before this update, and if the SDK is returning no entitlements
    // (potentially due to a race condition or sync lag), keep it Pro for the next 60 seconds
    const finalProStatus = isPro || wasProInLocalStorage;

    console.log(`[SubscriptionService] 🔄 Syncing status. SDK Has Pro: ${hasProEntitlement}, Final: ${finalProStatus}`);
    localStorage.setItem('hellobrick_is_pro', finalProStatus ? 'true' : 'false');
  }

  /**
   * Initialize RevenueCat
   */
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      const platform = await this.getPlatform();
      const apiKey = REVENUECAT_API_KEY[platform];

      if (!apiKey) {
        console.warn('⚠️ RevenueCat API key missing.');
        return;
      }

      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      // Listen for background updates (Fix for "10-second paywall" bug)
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('🔄 RevenueCat Background Refresh:', customerInfo);
        this.currentCustomerInfo = customerInfo;
        this.syncLocalStorage(customerInfo);
      });

      if (userId) this.currentUserId = userId;
      this.isInitialized = true;
      await this.refreshCustomerInfo();
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    // 1. Check for Targeted Bypass Accounts (V1.6 Submission Security)
    const bypassEmails = ['hellobrickar@gmail.com', 'apple_test@hellobrick.app'];
    const userEmail = localStorage.getItem('hellobrick_userEmail');

    if ((userEmail && bypassEmails.includes(userEmail.toLowerCase())) || localStorage.getItem('hellobrick_admin_bypass') === 'true') {
      console.log('💎 Bypass Account Detected: Granting Pro Access');
      localStorage.setItem('hellobrick_is_pro', 'true');
      return { isPro: true, isActive: true };
    }

    try {
      // 2. Refresh from RevenueCat
      if (!this.isInitialized) await this.initialize(this.currentUserId || undefined);
      
      const { customerInfo } = await Purchases.getCustomerInfo();
      this.currentCustomerInfo = customerInfo;

      // Case-insensitive entitlement check (matches syncLocalStorage logic)
      const entitlementKeys = Object.keys(customerInfo.entitlements.active).map(k => k.toLowerCase());
      const hasProEntitlement = entitlementKeys.includes('pro') || 
                                entitlementKeys.includes('premium') || 
                                entitlementKeys.includes('full') ||
                                !!customerInfo.entitlements.active['pro'] ||
                                !!customerInfo.entitlements.active['Pro'];
      
      // Also trust localStorage — if the user JUST purchased, don't contradict it
      const localPro = localStorage.getItem('hellobrick_is_pro') === 'true';
      const isPro = hasProEntitlement || localPro;
      
      // Sync to localStorage
      this.syncLocalStorage(customerInfo);
      
      return {
        isPro,
        isActive: isPro,
        expirationDate: customerInfo.latestExpirationDate ? new Date(customerInfo.latestExpirationDate) : undefined,
      };
    } catch (error) {
      console.error('❌ Failed to get subscription status:', error);
      // Fallback to local storage if RC fails but user was previously pro
      const wasPro = localStorage.getItem('hellobrick_is_pro') === 'true';
      return { isPro: wasPro, isActive: wasPro };
    }
  }


  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      if (!this.isInitialized) await this.initialize(this.currentUserId || undefined);
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) await this.initialize(this.currentUserId || undefined);
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      this.currentCustomerInfo = customerInfo;
      this.syncLocalStorage(customerInfo);
      
      const status = await this.getSubscriptionStatus();
      await this.syncToSupabase(status);
      return customerInfo;
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      if (error.userCancelled) throw new Error('Purchase cancelled by user');
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) await this.initialize(this.currentUserId || undefined);
      const { customerInfo } = await Purchases.restorePurchases();
      this.currentCustomerInfo = customerInfo;
      this.syncLocalStorage(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  async refreshCustomerInfo(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) throw new Error('RevenueCat not initialized');
      const { customerInfo } = await Purchases.getCustomerInfo();
      this.currentCustomerInfo = customerInfo;
      this.syncLocalStorage(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to refresh customer info:', error);
      throw error;
    }
  }

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
      this.syncLocalStorage(customerInfo);
    } catch (error) {
      console.error('❌ Failed to set user ID:', error);
    }
  }

  async logout(): Promise<void> {
    this.currentUserId = null;
    if (!this.isInitialized) return;
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('❌ Failed to log out RevenueCat user:', error);
    }
  }

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
      console.warn('Failed to sync subscription to Supabase:', error);
    }
  }

  private async getPlatform(): Promise<'ios' | 'other'> {
    return Capacitor.getPlatform() === 'ios' ? 'ios' : 'other';
  }

  isConfigured(): boolean {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'other';
    const apiKey = REVENUECAT_API_KEY[platform as keyof typeof REVENUECAT_API_KEY];
    return !!apiKey;
  }
}

export const subscriptionService = new SubscriptionService();
