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
  Screen.FEED
];

type Listener = (snapshot: AppStateSnapshot) => void;

// ── STATE → SCREEN MAPPING ─────────────────────────
function getScreenForState(state: AppState, params?: any): Screen {
  switch (state) {
    case 'booting':            return Screen.AUTH;
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
      const currentVersion = '1.6.2'; // Increment this to force a wipe
      const storedVersion = localStorage.getItem('hellobrick_data_version');
      
      if (storedVersion !== currentVersion) {
         console.log(`[AppState] Version mismatch (${storedVersion} vs ${currentVersion}). Purging community data...`);
         localStorage.removeItem('hellobrick_feed_posts');
         localStorage.removeItem('hellobrick_community_last_drip');
         localStorage.setItem('hellobrick_data_version', currentVersion);
      }
      
      this.boot();
    }
  }

  // ── BOOT ──────────────────────────────────────────
  private boot() {
    console.log('[AppState] Booting...');

    const onboardingFinished = localStorage.getItem('hellobrick_onboarding_finished') === 'true';

    // Phase 1 Rules:
    // 1. If onboarding not done -> ONBOARDING
    // 2. If onboarding done but not auth -> AUTH
    // 3. If both done -> HOME

    if (!onboardingFinished) {
      console.log('[AppState] Step 1: ONBOARDING required');
      this.transition('onboarding');
    } else {
      // PHASE 2: Allow direct navigation to SCANNER/HOME even for unauthenticated users
      console.log('[AppState] Step 2: Proceeding to HOME/SCANNER');
      this.transition('home');
      
      const userId = localStorage.getItem('hellobrick_userId');
      const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
      if (userId && isAuthenticated) subscriptionService.initialize(userId).catch(console.error);
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
    const onboardingFinished = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';

    // ── RULE 1: Onboarding must be complete ──
    const onboardingScreens = [
      Screen.ONBOARDING_QUESTIONNAIRE,
      Screen.SUBSCRIPTION, // Allow paywall nudge at the end
      Screen.FEATURE_INTRO, 
      Screen.NOTIFICATIONS_INTRO, 
      Screen.BUILDING_INTRO,
      Screen.HOW_IT_WORKS
    ];

    if (!onboardingFinished && !onboardingScreens.includes(screen)) {
      console.log('[AppState] Onboarding lock active');
      this.transition('onboarding');
      return;
    }

    if (onboardingScreens.includes(screen)) {
      this.transition('onboarding', { screen });
      return;
    }

    // ── RULE 2: Authentication gating ──
    const publicScreens = [
      Screen.SCANNER, 
      Screen.HOME, 
      Screen.AUTH, 
      Screen.EMAIL_SIGNUP, 
      Screen.EMAIL_LOGIN,
      Screen.QUESTS,
      Screen.PROFILE,
      Screen.LEADERBOARD,
      Screen.MY_CREATIONS
    ];
    if (!isAuthenticated && !publicScreens.includes(screen)) {
      console.log(`[AppState] Auth lock active for ${screen}`);
      this.returnScreen = screen;
      this.transition('auth');
      return;
    }

    // ── RULE 3: PRO features require subscription ──
    if (PRO_SCREENS.includes(screen) || (screen === Screen.SCANNER && usageService.isLimitReached())) {
      const isPro = localStorage.getItem('hellobrick_is_pro') === 'true' || 
                    localStorage.getItem('hellobrick_dev_mode') === 'true';

      if (!isPro) {
        console.log(`[AppState] PRO required for ${screen}. Opening paywall.`);
        this.returnScreen = screen;
        this.transition('subscription');
        return;
      }
    }

    // Normal navigation within authenticated area
    this.currentScreen = screen;
    if (params !== undefined) this.currentParams = params;
    this.state = 'home';
    this.notify();
  }

  // ── ONBOARDING COMPLETE ───────────────────────────
  public finishOnboarding() {
    console.log('[AppState] Onboarding complete → HOME');
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    this.transition('home');
  }

  // ── AUTH COMPLETE ─────────────────────────────────
  public onAuthSuccess() {
    console.log('[AppState] Auth success → NOTIFICATIONS_INTRO');
    localStorage.setItem('hellobrick_authenticated', 'true');
    
    // After auth, show notifications opt-in (which leads to paywall)
    this.navigate(Screen.NOTIFICATIONS_INTRO);
    
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
