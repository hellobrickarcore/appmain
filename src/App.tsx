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
import { BottomNav } from './components/BottomNav';
import { subscriptionService } from './services/subscriptionService';
import { onAuthStateChange } from './services/supabaseService';
import { usageService } from './services/usageService';

const App: React.FC = () => {
  useEffect(() => {
    // Hide splash screen when app is ready
    SplashScreen.hide().catch(() => {});
  }, []);

  // Determine initial screen based on onboarding/auth state
  const getInitialScreen = (): Screen => {
    // DEV BYPASS: Check for dev URL param or existing localStorage flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true' || localStorage.getItem('hellobrick_dev_mode') === 'true') {
      console.log('🛠️ DEV BYPASS ACTIVE');
      localStorage.setItem('hellobrick_dev_mode', 'true');
      
      // Auto-jump to scanner if scanner=true is provided
      if (urlParams.get('scanner') === 'true') {
        return Screen.SCANNER;
      }
      return Screen.HOME;
    }

    const hasFinishedIntro = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
    if (!hasFinishedIntro) return Screen.FEATURE_INTRO;
    
    // If onboarding finished but not authenticated, go to AUTH
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
    if (!isAuthenticated) return Screen.AUTH;

    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    // 1. Hide splash screen
    SplashScreen.hide().catch(err => {
      console.warn('Splash screen hide failed (likely already hidden or non-native):', err);
    });

    // 2. Initialize RevenueCat for anonymous or returning users
    const initialUserId = localStorage.getItem('hellobrick_userId') || undefined;
    subscriptionService.initialize(initialUserId).then(() => {
      // Sync subscription status immediately after init
      return subscriptionService.getSubscriptionStatus();
    }).catch(err => {
      console.error('RevenueCat initialization failed:', err);
    });

    // 3. Global Auth State Listener — Ensure Supabase UUID matches RevenueCat appUserID
    const unsubscribe = onAuthStateChange((event, session) => {
      console.log(`🔐 Auth State Change: ${event}`, session?.user?.id);
      
      if (session?.user) {
        const userId = session.user.id;
        localStorage.setItem('hellobrick_userId', userId);
        subscriptionService.setUserId(userId).catch(console.error);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hellobrick_userId');
        subscriptionService.logout().catch(console.error);
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
    const isDev = localStorage.getItem('hellobrick_dev_mode') === 'true';
    
    console.log(`🔐 Gating Check for ${screen}: isPro=${isPro}, isDev=${isDev}`);

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
      Screen.COLLECTION,
      Screen.MY_CREATIONS
    ];
    
    // 1. Check screen gating
    if (gatedScreens.includes(screen)) {
      console.log(`🔒 Gated screen ${screen} requested. isPro: ${isPro}, isDev: ${isDev}`);
      
      // If not authenticated, go to AUTH first
      const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
      if (!isAuthenticated && !isDev) {
        console.log('🔒 Gated feature: Not authenticated, redirecting to Auth');
        setCurrentScreen(Screen.AUTH);
        return;
      }

      // If authenticated but not Pro, go to Paywall
      if (!isPro && !isDev) {
        console.log('🔒 Gated feature: authenticated but not Pro, redirecting to Paywall');
        setCurrentScreen(Screen.SUBSCRIPTION);
        return;
      }
    }

    // 2. Check Daily Scan Limit (Non-Pro only)
    if (screen === Screen.SCANNER && !isPro && !isDev) {
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
        return <ScannerScreen onNavigate={handleNavigate} challenge={activeChallenge} onPhaseChange={handlePhaseChange} />;
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
        return <IdeasGeneratorScreen onNavigate={handleNavigate} />;
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

      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dark bg-slate-950 h-[100dvh] overflow-hidden text-slate-100 selection:bg-orange-500/30">
      {renderScreen()}

      {/* Dev Bypass Menu - Only visible in Dev Mode */}
      {localStorage.getItem('hellobrick_dev_mode') === 'true' && (
        <div className="fixed bottom-24 left-4 z-[9999] pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                localStorage.removeItem('hellobrick_dev_mode');
                localStorage.removeItem('hellobrick_onboarding_finished');
                localStorage.removeItem('hellobrick_authenticated');
                window.location.href = '/';
              }}
              className="px-3 py-1 bg-red-500/80 backdrop-blur-md text-[10px] font-bold rounded-full text-white border border-red-400/50"
            >
              EXIT DEV
            </button>
            <select 
              value={currentScreen}
              onChange={(e) => handleNavigate(e.target.value as Screen)}
              className="bg-slate-800/90 backdrop-blur-md text-[10px] font-bold p-1 rounded-md border border-white/20 text-white"
            >
              {Object.values(Screen).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

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
