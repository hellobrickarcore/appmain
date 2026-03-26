import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
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
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { FeatureIntroScreen } from './screens/FeatureIntroScreen';
import { BuildingIntroScreen } from './screens/BuildingIntroScreen';
import { BottomNav } from './components/BottomNav';
import { subscriptionService } from './services/subscriptionService';
import { onAuthStateChange, supabase } from './services/supabaseService';
import { usageService } from './services/usageService';

<<<<<<< HEAD
console.log('🚀 BUILD_VERSION: 1.4.0 - ADVANCED_CV_PIPELINE');
=======
console.log('🚀 BUILD_VERSION: 1.5.0 - GEMINI_IMAGE_ENGINE_V1');
console.log('--- APP v1.5.0 ACTIVE ---');

>>>>>>> stable-recovery-v1.4.0

const App: React.FC = () => {
  const getInitialScreen = (): Screen => {
    console.log('[App] Determining initial screen...');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Simulator Mode (Reviewer/Tester)
    if (urlParams.get('simulator') === 'true') {
      localStorage.setItem('hellobrick_simulator_mode', 'true');
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      localStorage.setItem('hellobrick_authenticated', 'true');
      return Screen.SUBSCRIPTION;
    }

    // Dev Bypass
    if (urlParams.get('dev') === 'true' || localStorage.getItem('hellobrick_dev_mode') === 'true') {
      localStorage.setItem('hellobrick_dev_mode', 'true');
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      localStorage.setItem('hellobrick_authenticated', 'true');
      return Screen.HOME;
    }

    const hasFinishedIntro = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
    if (!hasFinishedIntro) return Screen.FEATURE_INTRO;
    
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
    if (!isAuthenticated) return Screen.AUTH;

    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [screenParams, setScreenParams] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [showNav, setShowNav] = useState(true);

  // Early Splash Hide
  useEffect(() => {
    const splashReset = async () => {
      try {
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
        
        await SplashScreen.hide().catch(() => {});

        const initialUserId = localStorage.getItem('hellobrick_userId') || undefined;
        await subscriptionService.initialize(initialUserId).catch(err => {
          console.warn('[App] RevenueCat init warning:', err);
        });
        
        console.log('[App] ✅ Init Sequence Complete');
      } catch (err) {
        console.error('[App] 🛑 CRITICAL INIT ERROR:', err);
      }
    };

    init();

    // OAuth Deep Link Handler (closes Browser and handles tokens)
    const setupDeepLinks = async () => {
      CapacitorApp.addListener('appUrlOpen', async (data: any) => {
        console.log('[App] 🔗 Deep link opened:', data.url);
        
        // 1. Close Safari View Controller if it was open for OAuth
        if (data.url.includes('/auth/callback') || data.url.includes('hellobrick')) {
          await Browser.close().catch(console.error);
        }

        // 2. Handle Supabase Tokens
        if (data.url.includes('auth/callback')) {
          const url = new URL(data.url);
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment || url.search);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken && supabase) {
            console.log('[App] 🔑 tokens found, updating session...');
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (!error) {
              console.log('[App] ✅ Session updated successfully');
              handleNavigate(Screen.NOTIFICATIONS_INTRO);
            }
          }
        }
      });
    };

    setupDeepLinks();

    const unsubscribe = onAuthStateChange((event, session) => {
      console.log(`🔐 Auth State Change: ${event}`, session?.user?.id);
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

    const isPro = localStorage.getItem('hellobrick_is_pro') === 'true';
    const isReviewer = localStorage.getItem('hellobrick_simulator_mode') === 'true';
    
    const gatedScreens = [
      Screen.REWARDS, Screen.HEAD_TO_HEAD, Screen.H2H_MODES, Screen.H2H_MATCHMAKING,
      Screen.H2H_BATTLE, Screen.IDEAS, Screen.PUZZLES, Screen.TRAINING, 
      Screen.TRAINING_INTRO, Screen.LEADERBOARD, Screen.MY_CREATIONS
    ];
    
    if (gatedScreens.includes(screen)) {
      const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
      if (!isAuthenticated && !isReviewer) {
        setCurrentScreen(Screen.AUTH);
        return;
      }
      if (!isPro && !isReviewer) {
        setCurrentScreen(Screen.SUBSCRIPTION);
        return;
      }
    }

    if (screen === Screen.SCANNER && !isPro && !isReviewer) {
      if (usageService.isLimitReached()) {
        setCurrentScreen(Screen.SUBSCRIPTION);
        return;
      }
    }
    
    setShowNav(true);

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
    switch (currentScreen) {
      case Screen.FEATURE_INTRO:
        return <FeatureIntroScreen onNavigate={handleNavigate} />;
      case Screen.HOW_IT_WORKS:
        return <HowItWorksScreen onNavigate={() => handleNavigate(Screen.AUTH)} />;
      case Screen.NOTIFICATIONS_INTRO:
        return <NotificationsIntroScreen onNavigate={handleNavigate} />;
      case Screen.HOW_TO_SCAN:
        return <HowToScanScreen onNavigate={handleNavigate} />;
      case Screen.BUILDING_INTRO:
        return <BuildingIntroScreen onNavigate={handleNavigate} />;
      case Screen.CAMERA_PERMISSION:
        return <CameraPermissionScreen onNavigate={handleNavigate} />;
      case Screen.AUTH:
        return <AuthScreen onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} onNavigate={handleNavigate} />;
      case Screen.EMAIL_SIGNUP:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} mode="signup" />;
      case Screen.EMAIL_LOGIN:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.NOTIFICATIONS_INTRO)} mode="login" />;
      case Screen.SUBSCRIPTION:
        return <SubscriptionScreen onNavigate={(success?: boolean) => {
          localStorage.setItem('hellobrick_onboarding_finished', 'true');
          if (success) localStorage.setItem('hellobrick_is_pro', 'true'); 
          handleNavigate(Screen.HOME);
        }} />;
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
        return <IdeasGeneratorScreen onNavigate={handleNavigate} allBricks={screenParams?.allBricks} initialBrick={screenParams?.initialBrick} />;
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
      case Screen.CREATE_POST:
        return <CreatePostScreen onNavigate={handleNavigate} />;
      case Screen.HEAD_TO_HEAD:
        return <HeadToHeadScreen onNavigate={handleNavigate} />;
      case Screen.H2H_MODES:
        return <HeadToHeadModesScreen onNavigate={handleNavigate} onSelectMode={setSelectedMode} />;
      case Screen.H2H_MATCHMAKING:
        return <HeadToHeadMatchmakingScreen onNavigate={handleNavigate} modeId={selectedMode} />;
      case Screen.H2H_BATTLE:
        return <HeadToHeadBattleScreen onNavigate={handleNavigate} modeId={selectedMode} onBattleComplete={setBattleResult} isPro={true} />;
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
      {localStorage.getItem('hellobrick_dev_mode') === 'true' && (
        <div className="fixed bottom-24 left-4 z-[9999] pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                localStorage.removeItem('hellobrick_dev_mode');
                localStorage.removeItem('hellobrick_onboarding_finished');
                localStorage.removeItem('hellobrick_authenticated');
                window.location.reload();
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
      {[Screen.HOME, Screen.SCANNER, Screen.COLLECTION, Screen.PROFILE, Screen.FEED, Screen.PUZZLES, Screen.TRAINING, Screen.QUESTS, Screen.LEADERBOARD, Screen.MY_CREATIONS].includes(currentScreen) && showNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
