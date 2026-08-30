import { Screen } from '../types';
import { subscriptionService } from './subscriptionService';
import { usageService } from './usageService';

/**
 * ────────────────────────────────────────────────────
 * HELLOBRICK — DETERMINISTIC APP STATE MACHINE
 * ────────────────────────────────────────────────────
 * 
 * Boot: check auth → if invalid → AUTH screen
 * Navigation derived from state only.
 * PRO features gated behind paywall.
 * ────────────────────────────────────────────────────
 */

export type AppState =
  | 'booting'
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'scanner'
  | 'capture_processing'
  | 'review'
  | 'subscription'
  | 'error';

export interface AppStateSnapshot {
  state: AppState;
  screen: Screen;
  params?: any;
  userId: string | null;
  isAuthenticated: boolean;
  isPro: boolean;
  onboardingFinished: boolean;
}

// PRO-only screens
const PRO_SCREENS: Screen[] = [
  Screen.H2H_MATCHMAKING,
  Screen.H2H_BATTLE,
  Screen.QUESTS,
  Screen.PUZZLES,
  Screen.TRAINING,
  Screen.COLLECTION,
  Screen.IDEAS,
  Screen.FEED,
  Screen.PORTFOLIO_ANALYTICS,
  Screen.LEGO_MAP
];

type Listener = (snapshot: AppStateSnapshot) => void;

// ── STATE → SCREEN MAPPING ─────────────────────────
function getScreenForState(state: AppState, params?: any): Screen {
  switch (state) {
    case 'booting':            return Screen.HOME;
    case 'onboarding':         
      if (params?.screen) return params.screen;
      return Screen.ONBOARDING_QUESTIONNAIRE;
    case 'auth':               return Screen.AUTH;
    case 'home':               return params?.screen || Screen.HOME;
    case 'scanner':            return Screen.SCANNER;
    case 'capture_processing': return Screen.SCANNER;
    case 'review':             return Screen.SCANNER;
    case 'subscription':       return Screen.SUBSCRIPTION;
    case 'error':              return Screen.HOME;
    default:                   return Screen.HOME;
  }
}

class AppStateService {
  private state: AppState = 'booting';
  private currentScreen: Screen = Screen.HOME; // Default to HOME to match App.tsx initial state
  private currentParams: any = null;
  private listeners: Set<Listener> = new Set();
  private returnScreen: Screen | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 🚨 HARD VERSIONED PURGE: Force refresh community feed to remove old kids/fruit/generic data
      const currentVersion = '1.8.0'; // INCREMENTED to force a wipe of dummy data
      const storedVersion = localStorage.getItem('hellobrick_data_version');
      
      if (storedVersion !== currentVersion) {
         console.log(`[AppState] Version mismatch (${storedVersion} vs ${currentVersion}). PURGING LEGACY DUMMY DATA...`);
         localStorage.removeItem('hellobrick_feed_posts');
         localStorage.removeItem('hellobrick_community_last_drip');
         localStorage.removeItem('hellobrick_collection_sets'); // Nuke the injected dummy items
         localStorage.removeItem('hellobrick_onboarding_finished'); // Nuke onboarding state to force the flow
         localStorage.setItem('hellobrick_data_version', currentVersion);
      }
      
      this.boot();
    }
  }

  // ── BOOT ──────────────────────────────────────────
  private boot() {
    const preview = typeof window !== 'undefined' ? localStorage.getItem('hellobrick_preview_screen') : null;
    const onboardingFinished = typeof window !== 'undefined' ? localStorage.getItem('hellobrick_onboarding_finished') === 'true' : false;
    
    console.log('[AppState] Booting directly, preview =', preview, 'onboarding =', onboardingFinished);
    
    if (preview === 'scanner') {
      this.transition('scanner');
    } else if (preview === 'browse') {
      this.transition('home', { screen: Screen.BROWSE });
    } else if (preview === 'ideas') {
      this.transition('home', { screen: Screen.IDEAS });
    } else if (preview === 'collection') {
      this.transition('home', { screen: Screen.COLLECTION });
    } else if (!onboardingFinished) {
      this.transition('onboarding');
    } else {
      this.transition('home');
    }
  }

  // ── STATE TRANSITIONS ─────────────────────────────
  public transition(newState: AppState, params?: any) {
    const prev = this.state;
    this.state = newState;
    if (params !== undefined) this.currentParams = params;
    this.currentScreen = getScreenForState(newState, params);
    console.log(`[AppState] ${prev} → ${newState} | Screen: ${this.currentScreen}`);
    this.notify();
  }

  // ── NAVIGATION ────────────────────────────────────
  public navigate(screen: Screen, params?: any) {
    console.log(`[AppState] Navigating directly to ${screen}`, params);
    
    // Explicit state mappings
    if (screen === Screen.SCANNER) {
      this.transition('scanner', params);
    } else if (screen === Screen.SUBSCRIPTION) {
      this.transition('subscription', params);
    } else if (screen === Screen.AUTH || screen === Screen.EMAIL_LOGIN || screen === Screen.EMAIL_SIGNUP) {
      this.transition('auth', { screen, ...params });
    } else if (screen === Screen.ONBOARDING_QUESTIONNAIRE) {
      this.transition('onboarding', { screen, ...params });
    } else {
      this.transition('home', { screen, ...params });
    }
  }

  // ── ONBOARDING COMPLETE ───────────────────────────
  public finishOnboarding() {
    console.log('[AppState] Onboarding complete → HOME');
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    this.transition('home');
  }

  // ── AUTH COMPLETE ─────────────────────────────────
  public onAuthSuccess() {
    console.log('[AppState] Auth success → PAYWALL');
    localStorage.setItem('hellobrick_authenticated', 'true');
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    
    // Hard Paywall immediately after authentication
    this.navigate(Screen.SUBSCRIPTION);
    
    // Initialize subscriptions after auth
    const userId = localStorage.getItem('hellobrick_userId');
    if (userId) subscriptionService.initialize(userId).catch(console.error);
  }

  // ── SUBSCRIPTION COMPLETE ─────────────────────────
  public onSubscriptionComplete() {
    console.log('[AppState] Subscription complete');
    localStorage.setItem('hellobrick_is_pro', 'true');
    if (this.returnScreen) {
      const screen = this.returnScreen;
      this.returnScreen = null;
      this.navigate(screen);
    } else {
      this.transition('home');
    }
  }

  public onSubscriptionDismiss() {
    this.transition('home');
  }

  // ── REFRESH (for external auth callbacks) ─────────
  public refresh() {
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
    if (isAuthenticated && this.state === 'auth') {
      this.onAuthSuccess();
    }
  }

  // ── SUBSCRIPTIONS ─────────────────────────────────
  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(l => l(snapshot));
  }

  public getSnapshot(): AppStateSnapshot {
    return {
      state: this.state,
      screen: this.currentScreen,
      params: this.currentParams,
      userId: localStorage.getItem('hellobrick_userId'),
      isAuthenticated: localStorage.getItem('hellobrick_authenticated') === 'true',
      isPro: localStorage.getItem('hellobrick_is_pro') === 'true' || localStorage.getItem('hellobrick_dev_mode') === 'true',
      onboardingFinished: localStorage.getItem('hellobrick_onboarding_finished') === 'true'
    };
  }

  public getState(): AppState {
    return this.state;
  }
}

export const appStateService = new AppStateService();
