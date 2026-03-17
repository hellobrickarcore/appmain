/**
 * Supabase Service for Authentication & Subscription Data
 * Handles Google OAuth, auth state management, and subscription persistence
 */

import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

// Get Supabase URL and Anon Key from environment variables
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
  }

  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client (only if credentials are available)
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get the Supabase client instance
 */
export const getSupabaseClient = () => supabase;

// ─── Auth Functions ──────────────────────────────────────────────

/**
 * Helper to get the correct redirect URL based on environment
 */
const getAuthRedirectUrl = () => {
  const platform = Capacitor.getPlatform();
  const isApp = Capacitor.isNativePlatform();
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  console.log('[Supabase] 🛡️ Redirect Detection:', { platform, isApp, protocol, hostname });

  // If we are on iOS or Android, we definitely want the custom scheme
  if (platform === 'ios' || platform === 'android' || isApp) {
    console.log('[Supabase] 📱 Native platform detected, using deep link scheme');
    return 'com.hellobrick.app://auth/callback';
  }

  // If protocol is capacitor:, we are definitely in an app
  if (protocol === 'capacitor:') {
    console.log('[Supabase] ⚡ capacitor: protocol detected, using deep link scheme');
    return 'com.hellobrick.app://auth/callback';
  }

  // Fallback for web
  const baseUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
  const finalUrl = `${baseUrl}/auth/callback`;
  
  console.log('[Supabase] 🌐 Web platform detected, using:', finalUrl);
  return finalUrl;
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ user: any; error: any }> => {
  if (!supabase) {
    return {
      user: null,
      error: new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
    };
  }

  try {
    const redirectUrl = getAuthRedirectUrl();
    console.log('[Supabase] 🚀 Initiating Google Sign-In with redirect:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error };
    }

    return { user: data, error: null };
  } catch (error: any) {
    console.error('Google sign-in exception:', error);
    return { user: null, error };
  }
};

/**
 * Sign in with Apple OAuth
 */
export const signInWithApple = async (): Promise<{ user: any; error: any }> => {
  if (!supabase) {
    return {
      user: null,
      error: new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      console.error('Apple sign-in error:', error);
      return { user: null, error };
    }

    return { user: data, error: null };
  } catch (error: any) {
    console.error('Apple sign-in exception:', error);
    return { user: null, error };
  }
};

/**
 * Sign up with Email and Password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<{ user: any; error: any }> => {
  if (!supabase) return { user: null, error: new Error('Supabase not configured') };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl()
      }
    });
    return { user: data.user, error };
  } catch (error: any) {
    return { user: null, error };
  }
};

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email: string, password: string): Promise<{ user: any; error: any }> => {
  if (!supabase) return { user: null, error: new Error('Supabase not configured') };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  } catch (error: any) {
    return { user: null, error };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<{ error: any }> => {
  if (!supabase) return { error: new Error('Supabase not configured') };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    return { error };
  } catch (error: any) {
    return { error };
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<{ error: any }> => {
  if (!supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    return { error };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Listen for auth state changes (login, logout, token refresh)
 * Returns an unsubscribe function.
 */
export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
): (() => void) => {
  if (!supabase) {
    return () => { }; // no-op unsubscribe
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

// ─── Subscription Data Persistence ──────────────────────────────

export interface SubscriptionRecord {
  is_pro: boolean;
  is_active: boolean;
  product_id: string | null;
  expiration_date: string | null;
  revenuecat_user_id: string | null;
  updated_at: string;
}

/**
 * Upsert (insert or update) subscription state for a user.
 * Creates the row if it doesn't exist, updates it if it does.
 */
export const upsertSubscription = async (
  userId: string,
  data: SubscriptionRecord
): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured — skipping subscription sync');
    return;
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        { user_id: userId, ...data },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Failed to upsert subscription:', error);
    } else {
      console.log('✅ Subscription synced to Supabase');
    }
  } catch (error) {
    console.error('Error upserting subscription:', error);
  }
};

/**
 * Get subscription state for a user
 */
export const getSubscription = async (
  userId: string
): Promise<SubscriptionRecord | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = row not found, which is fine for new users
      if (error.code !== 'PGRST116') {
        console.error('Failed to get subscription:', error);
      }
      return null;
    }

    return data as SubscriptionRecord;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};
