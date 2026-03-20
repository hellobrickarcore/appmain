import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Screen, BattleResult, GameModeId } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { ScannerScreen } from './screens/ScannerScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { QuestsScreen } from './screens/QuestsScreen';
import { PuzzlesScreen } from './screens/PuzzlesScreen';
import { FeedScreen } from './screens/FeedScreen';
import { HeadToHeadScreen } from './screens/HeadToHeadScreen';
import { HeadToHeadModesScreen } from './screens/HeadToHeadModesScreen';
import { HeadToHeadMatchmakingScreen } from './screens/HeadToHeadMatchmakingScreen';
import { HeadToHeadBattleScreen } from './screens/HeadToHeadBattleScreen';
import { HeadToHeadResultScreen } from './screens/HeadToHeadResultScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { TrainingIntroScreen } from './screens/TrainingIntroScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { MyCreationsScreen } from './screens/MyCreationsScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { HowToScanScreen } from './screens/HowToScanScreen';
import { IdeasGeneratorScreen } from './screens/IdeasGeneratorScreen';
import { NotificationsIntroScreen } from './screens/NotificationsIntroScreen';
import { CameraPermissionScreen } from './screens/CameraPermissionScreen';
import { EmailAuthScreen } from './screens/EmailAuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen'; // New import for OnboardingScreen
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { BottomNav } from './components/BottomNav';
import { subscriptionService } from './services/subscriptionService';
import { onAuthStateChange, supabase } from './services/supabaseService';
import { usageService } from './services/usageService';

console.log('🚀 BUILD_VERSION: 1.3.0 - GEMINI_IMAGE_ENGINE_V1');
console.log('--- APP v1.3.0 ACTIVE ---');


const App: React.FC = () => {

  // Determine initial screen based on onboarding/auth state
  const getInitialScreen = (): Screen => {
    console.log('[App] Determining initial screen...');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('simulator') === 'true') {
      console.log('[App] Simulator mode detected');
      localStorage.setItem('hellobrick_simulator_mode', 'true');
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      localStorage.setItem('hellobrick_authenticated', 'true');
      return Screen.SUBSCRIPTION;
    }

    const hasFinishedIntro = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
    console.log('[App] Onboarding finished:', hasFinishedIntro);
    if (!hasFinishedIntro) return Screen.FEATURE_INTRO;
    
    // If onboarding finished but not authenticated, go to AUTH
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
    console.log('[App] Authenticated:', isAuthenticated);
    if (!isAuthenticated) return Screen.AUTH;

    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [screenParams, setScreenParams] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [showNav, setShowNav] = useState(true);

  // Phase 17: Emergency Early Splash Hide
  useEffect(() => {
    const splashReset = async () => {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
        console.log('[App] ⚡ Early Splash Hide Triggered');
      } catch (e) {}
    };
    splashReset();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] 🚀 Initializing Native Bridge...');
        
        // 1. Hide splash screen
        await SplashScreen.hide().catch(() => {});
        console.log('[App] ✅ Splash screen hidden');

        // 2. Initialize RevenueCat
        const initialUserId = localStorage.getItem('hellobrick_userId') || undefined;
        await subscriptionService.initialize(initialUserId).catch(err => {
          console.warn('[App] RevenueCat init warning:', err);
        });
        
        // Final screen logic
        console.log('[App] ✅ Init Sequence Complete');
      } catch (err) {
        console.error('[App] 🛑 CRITICAL INIT ERROR:', err);
      }
    };

    init();

    // ─── Deep Link Handling for Supabase Auth ──────────────────
    const setupDeepLinks = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('appUrlOpen', async (data: any) => {
          console.log('[App] 🔗 Deep link opened:', data.url);
          
          if (data.url.includes('auth/callback')) {
            const url = new URL(data.url);
            // Supabase returns tokens in the hash (#) for implicit flow (sign_in)
            // or in search params for code flow. Supabase JS client handles both
            // if we provide the URL or fragment.
            const fragment = url.hash.substring(1);
            const params = new URLSearchParams(fragment || url.search);
            
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken && supabase) {
              console.log('[App] 🔑 Found tokens in deep link, updating session...');
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) {
                console.error('[App] ❌ Error setting session from deep link:', error);
              } else {
                console.log('[App] ✅ Session updated successfully');
                handleNavigate(Screen.NOTIFICATIONS_INTRO);
              }
            } else if (data.url.includes('error_description') && data.url.includes('error=access_denied')) {
               console.warn('[App] ⚠️ Auth denied or cancelled by user');
            }
          }
        });
      } catch (err) {
        console.error('[App] Failed to setup deep links:', err);
      }
    };

    setupDeepLinks();

    const unsubscribe = onAuthStateChange((event, session) => {
      if (session?.user) {
        localStorage.setItem('hellobrick_userId', session.user.id);
        subscriptionService.setUserId(session.user.id).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hellobrick_userId');
        subscriptionService.logout().catch(() => {});
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNavigate = (screen: Screen, params?: any) => {
    console.log(`🚀 Navigating to: ${screen}`, params);

    // Check Pro Subscription for gated features
    const isPro = localStorage.getItem('hellobrick_is_pro') === 'true';
    const isReviewer = localStorage.getItem('hellobrick_is_reviewer') === 'true';
    
    console.log(`🔐 Gating Check for ${screen}: isPro=${isPro}, isReviewer=${isReviewer}`);

    const gatedScreens = [
      Screen.REWARDS, 
      Screen.HEAD_TO_HEAD, 
      Screen.H2H_MODES,
      Screen.H2H_MATCHMAKING,
      Screen.H2H_BATTLE,
      Screen.IDEAS, 
      Screen.PUZZLES, 
      Screen.TRAINING, 
      Screen.TRAINING_INTRO, 
      Screen.LEADERBOARD,
      Screen.MY_CREATIONS
    ];
    
    // 1. Check screen gating
    if (gatedScreens.includes(screen)) {
      console.log(`🔒 Gated screen ${screen} requested. isPro: ${isPro}, isReviewer: ${isReviewer}`);
      
      // If not authenticated, go to AUTH first
      const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
      if (!isAuthenticated && !isReviewer) {
        console.log('🔒 Gated feature: Not authenticated, redirecting to Auth');
        setCurrentScreen(Screen.AUTH);
        return;
      }

      // If authenticated but not Pro, go to Paywall
      if (!isPro && !isReviewer) {
        console.log('🔒 Gated feature: authenticated but not Pro, redirecting to Paywall');
        setCurrentScreen(Screen.SUBSCRIPTION);
        return;
      }
    }

    // 2. Check Daily Scan Limit (Non-Pro only)
    if (screen === Screen.SCANNER && !isPro && !isReviewer) {
      if (usageService.isLimitReached()) {
        console.log('🔒 Daily Scan Limit Reached: Redirecting to Paywall');
        setCurrentScreen(Screen.SUBSCRIPTION);
        return;
      }
    }
    
    // Reset navigation bar visibility on every navigation unless specifically hidden
    setShowNav(true);

    // Save onboarding completion when reaching home or specific steps
    if (screen === Screen.HOME || screen === Screen.NOTIFICATIONS_INTRO) {
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
    }

    if (screen === Screen.HOME) {
      localStorage.setItem('hellobrick_authenticated', 'true');
    }

    if (screen === Screen.HOW_TO_SCAN_PERMISSION) {
       setCurrentScreen(Screen.CAMERA_PERMISSION);
       return;
    }

    if (screen === Screen.SCANNER && params?.challenge) {
      setActiveChallenge(params.challenge);
    } else if (screen === Screen.SCANNER) {
      setActiveChallenge(null);
    }

    if (screen === Screen.H2H_RESULT && params) {
      setBattleResult(params);
    }

    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  const handlePhaseChange = (phase: string) => {
    setShowNav(phase !== 'results');
  };

  const renderScreen = () => {
    console.log('[App] Rendering screen:', currentScreen);
    switch (currentScreen) {
      // --- Onboarding ---
      case Screen.FEATURE_INTRO:
        return <OnboardingScreen onNavigate={() => handleNavigate(Screen.HOW_IT_WORKS)} />;
      case Screen.HOW_IT_WORKS:
        return <HowItWorksScreen onNavigate={() => handleNavigate(Screen.AUTH)} />;
      case Screen.NOTIFICATIONS_INTRO:
        return <NotificationsIntroScreen onNavigate={() => handleNavigate(Screen.SUBSCRIPTION)} />;
      case Screen.CAMERA_PERMISSION:
        return <CameraPermissionScreen onNavigate={handleNavigate} />;
      
      // --- Auth ---
      case Screen.AUTH:
        return <AuthScreen onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} onNavigate={handleNavigate} />;
      case Screen.EMAIL_SIGNUP:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} mode="signup" />;
      case Screen.EMAIL_LOGIN:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} mode="login" />;
      case Screen.SUBSCRIPTION:
        return <SubscriptionScreen onNavigate={(success?: boolean) => {
          localStorage.setItem('hellobrick_onboarding_finished', 'true');
          if (success) {
            localStorage.setItem('hellobrick_is_pro', 'true'); 
          }
          handleNavigate(Screen.HOME);
        }} />;

      // --- Main App ---
      case Screen.HOME:
        return <HomeScreen onNavigate={handleNavigate} />;
      case Screen.SCANNER:
        return <ScannerScreen onNavigate={handleNavigate} challenge={activeChallenge} onPhaseChange={handlePhaseChange} mode={screenParams?.mode} />;
      case Screen.COLLECTION:
        return <CollectionScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE:
        return <ProfileScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE_SETTINGS:
        return <ProfileSettingsScreen onNavigate={handleNavigate} />;
      case Screen.QUESTS:
        return <QuestsScreen onNavigate={handleNavigate} />;
      case Screen.PUZZLES:
        return <PuzzlesScreen onNavigate={handleNavigate} />;
      case Screen.IDEAS:
        return <IdeasGeneratorScreen 
          onNavigate={handleNavigate} 
          allBricks={screenParams?.allBricks}
          initialBrick={screenParams?.initialBrick}
        />;
      case Screen.FEED:
        return <FeedScreen onNavigate={handleNavigate} />;
      case Screen.TRAINING:
        return <TrainingScreen onNavigate={handleNavigate} />;
      case Screen.TRAINING_INTRO:
        return <TrainingIntroScreen onNavigate={handleNavigate} />;
      case Screen.LEADERBOARD:
        return <LeaderboardScreen onNavigate={handleNavigate} />;
      case Screen.REWARDS:
        return <RewardsScreen onNavigate={handleNavigate} />;
      case Screen.MY_CREATIONS:
        return <MyCreationsScreen onNavigate={handleNavigate} />;
      case Screen.HOW_TO_SCAN:
        return <HowToScanScreen onNavigate={handleNavigate} />;
      case Screen.CREATE_POST:
        return <CreatePostScreen onNavigate={handleNavigate} />;

      // --- Multiplayer / Games ---
      case Screen.HEAD_TO_HEAD:
        return <HeadToHeadScreen onNavigate={handleNavigate} />;
      case Screen.H2H_MODES:
        return <HeadToHeadModesScreen onNavigate={handleNavigate} onSelectMode={setSelectedMode} />;
      case Screen.H2H_MATCHMAKING:
        return <HeadToHeadMatchmakingScreen onNavigate={handleNavigate} modeId={selectedMode} />;
      case Screen.H2H_BATTLE:
        return (
          <HeadToHeadBattleScreen
            onNavigate={handleNavigate}
            modeId={selectedMode}
            onBattleComplete={(res: BattleResult) => setBattleResult(res)}
            isPro={true}
          />
        );
      case Screen.H2H_RESULT:
        return <HeadToHeadResultScreen onNavigate={handleNavigate} result={battleResult} />;
      case Screen.ADMIN:
        return <AdminDashboardScreen onNavigate={handleNavigate} />;

      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dark bg-slate-950 h-[100dvh] overflow-hidden text-slate-100 selection:bg-orange-500/30">
      {renderScreen()}

      {/* Navigation - Sticky Bottom Menu */}
      {[
        Screen.HOME, 
        Screen.SCANNER, 
        Screen.COLLECTION, 
        Screen.PROFILE,
        Screen.FEED,
        Screen.PUZZLES,
        Screen.TRAINING,
        Screen.QUESTS,
        Screen.LEADERBOARD,
        Screen.MY_CREATIONS
      ].includes(currentScreen) && showNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
