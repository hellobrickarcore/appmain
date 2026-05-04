import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Screen, BattleResult, GameModeId } from './types';
import { OnboardingQuestionnaire } from './screens/OnboardingQuestionnaire';
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
import { IdeasGeneratorScreen } from './screens/IdeasGeneratorScreen';
import { BuildingIntroScreen } from './screens/BuildingIntroScreen';
import { FeatureIntroScreen } from './screens/FeatureIntroScreen';
import { EmailAuthScreen } from './screens/EmailAuthScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { BottomNav } from './components/BottomNav';
import { appStateService } from './services/appStateService';
import { subscriptionService } from './services/subscriptionService';
import { onAuthStateChange, supabase } from './services/supabaseService';

const App: React.FC = () => {
  const getInitialScreen = (): Screen => {
    console.log('[App] Determining initial screen...');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Dev Bypass
    if (urlParams.get('dev') === 'true' || localStorage.getItem('hellobrick_dev_mode') === 'true') {
      localStorage.setItem('hellobrick_dev_mode', 'true');
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      localStorage.setItem('hellobrick_authenticated', 'true');
      return Screen.HOME;
    }

    const hasFinishedOnboarding = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
    if (!hasFinishedOnboarding) return Screen.ONBOARDING_QUESTIONNAIRE;
    
    // PHASE 2: Allow direct navigation to SCANNER/HOME even for unauthenticated users
    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [screenParams, setScreenParams] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [showNav, setShowNav] = useState(true);

  // Sync with appStateService for unified navigation
  useEffect(() => {
    const unsubscribe = appStateService.subscribe((snapshot) => {
      if (snapshot.screen !== currentScreen) {
        setCurrentScreen(snapshot.screen);
        if (snapshot.params) setScreenParams(snapshot.params);
      }
    });
    return () => { unsubscribe(); };
  }, [currentScreen]);

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

        // CRITICAL: Refresh Pro Status on startup to fix desync
        await subscriptionService.getSubscriptionStatus().catch(() => {});
        
        console.log('[App] ✅ Init Sequence Complete');
      } catch (err) {
        console.error('[App] 🛑 CRITICAL INIT ERROR:', err);
      }
    };

    init();

    // Unified Deep Link Handler (Routing + OAuth)
    const setupDeepLinks = async () => {
      CapacitorApp.addListener('appUrlOpen', async (data: any) => {
        console.log('[App] 🔗 Deep link opened:', data.url);
        
        // 1. Close Safari if it was open for OAuth or initial landing
        if (data.url.includes('/auth/callback') || data.url.includes('hellobrick')) {
          await Browser.close().catch(console.error);
        }

        // 2. Custom Marketing Routes (TikTok/Google Ads)
        const url = new URL(data.url);
        const path = url.pathname || '';
        
        if (data.url.includes('//scan') || path.includes('scan')) {
          handleNavigate(Screen.SCANNER);
        } else if (data.url.includes('//pro') || path.includes('pro')) {
          handleNavigate(Screen.SUBSCRIPTION);
        } else if (data.url.includes('//ideas') || path.includes('ideas')) {
          handleNavigate(Screen.IDEAS);
        }

        // 3. Handle Supabase Tokens
        if (data.url.includes('auth/callback')) {
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
                handleNavigate(Screen.SUBSCRIPTION);
              }
          }
        }
      });
    };

    setupDeepLinks();

    const unsubscribeAuth = onAuthStateChange((event, session) => {
      console.log(`🔐 Auth State Change: ${event}`, session?.user?.id);
      if (session?.user) {
        localStorage.setItem('hellobrick_userId', session.user.id);
        localStorage.setItem('hellobrick_authenticated', 'true');
        subscriptionService.setUserId(session.user.id).catch(() => {});
        // Refresh app state
        appStateService.onAuthSuccess();
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('hellobrick_userId');
        localStorage.removeItem('hellobrick_authenticated');
        subscriptionService.logout().catch(() => {});
      }
    });

    // 💓 SESSION HEARTBEAT: Keep the Admin "Live Active" light green
    const recordHeartbeat = async () => {
      try {
        const userId = localStorage.getItem('hellobrick_userId') || 'anonymous_mobile';
        const DO_IP = '174.138.93.172';
        const heartbeatUrl = `http://${DO_IP}:3003/api/sessions/heartbeat`;
        
        await fetch(heartbeatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, platform: Capacitor.getPlatform() })
        });
        console.log('[Heartbeat] 💓 Ping Success');
      } catch (err) {
        // Silent fail for heartbeat
      }
    };

    // Initial and Recurring (5 mins)
    recordHeartbeat();
    const heartbeatInterval = setInterval(recordHeartbeat, 5 * 60 * 1000);

    return () => {
      unsubscribeAuth();
      clearInterval(heartbeatInterval);
    };
  }, []);

  const handleNavigate = (screen: Screen, params?: any) => {
    console.log(`🚀 Navigating to: ${screen}`, params);
    
    // Use the state machine for unified logic
    appStateService.navigate(screen, params);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.ONBOARDING_QUESTIONNAIRE:
        return <OnboardingQuestionnaire />;
      case Screen.FEATURE_INTRO:
        return <FeatureIntroScreen onNavigate={handleNavigate} />;
      case Screen.BUILDING_INTRO:
        return <BuildingIntroScreen onNavigate={handleNavigate} />;
      case Screen.HOW_IT_WORKS:
        return <HowItWorksScreen onNavigate={handleNavigate} />;
      case Screen.AUTH:
        return <AuthScreen onAuthenticate={() => handleNavigate(Screen.HOME)} onNavigate={handleNavigate} />;
      case Screen.EMAIL_SIGNUP:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.HOME)} mode="signup" />;
      case Screen.EMAIL_LOGIN:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.HOME)} mode="login" />;
      case Screen.SUBSCRIPTION:
        return <SubscriptionScreen onNavigate={(success) => {
          if (success) {
            console.log('[App] Subscription successful, forcing status lock');
            localStorage.setItem('hellobrick_is_pro', 'true');
            // Background refresh to confirm but the local state is now locked to true
            subscriptionService.getSubscriptionStatus().catch(() => {});
          }
          handleNavigate(Screen.HOME);
        }} />;
      case Screen.HOME:
        return <HomeScreen onNavigate={handleNavigate} />;
      case Screen.SCANNER:
        return <ScannerScreen onNavigate={handleNavigate} />;
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
    <div className="dark bg-slate-950 h-[100dvh] overflow-hidden text-slate-100 selection:bg-orange-500/30 flex flex-col">
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {renderScreen()}
      </div>
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
      {[Screen.HOME, Screen.SCANNER, Screen.COLLECTION, Screen.PROFILE, Screen.FEED, Screen.PUZZLES, Screen.TRAINING, Screen.QUESTS, Screen.LEADERBOARD, Screen.MY_CREATIONS, Screen.IDEAS].includes(currentScreen) && showNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
