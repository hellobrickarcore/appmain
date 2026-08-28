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
import { WishlistScreen } from './screens/WishlistScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { NotificationsIntroScreen } from './screens/NotificationsIntroScreen';
import { EmailAuthScreen } from './screens/EmailAuthScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SetDetailScreen } from './screens/SetDetailScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { BrowseScreen } from './screens/BrowseScreen';
import { IdeasScreen } from './screens/IdeasScreen';
import { QuestsScreen } from './screens/QuestsScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { FeedScreen } from './screens/FeedScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { BottomNav } from './components/BottomNav';
import { BootingScreen } from './components/BootingScreen';
import { appStateService } from './services/appStateService';
import { subscriptionService } from './services/subscriptionService';
import { onAuthStateChange, supabase } from './services/supabaseService';

const App: React.FC = () => {
  const getInitialScreen = (): Screen => {
    const preview = localStorage.getItem('hellobrick_preview_screen');
    if (preview === 'ideas') return Screen.IDEAS;
    if (preview === 'collection') return Screen.COLLECTION;
    if (preview === 'scanner') return Screen.SCANNER;
    if (preview === 'browse') return Screen.BROWSE;
    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [screenParams, setScreenParams] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [showNav, setShowNav] = useState(true);
  const [isBooting, setIsBooting] = useState(false);

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

  const handleNavigate = (screen: Screen, params?: any) => {
    console.log(`🚀 Navigating to: ${screen}`, params);
    
    // Use the state machine for unified logic
    appStateService.navigate(screen, params);
  };

  // Expose navigation to window for Playwright screenshot scripts
  useEffect(() => {
    (window as any).__navigate = handleNavigate;
  }, [handleNavigate]);

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
        const snapshot = appStateService.getSnapshot();
        if (snapshot.userId) {
          await subscriptionService.getSubscriptionStatus().catch(() => {});
        }

        // Community Cleanup: Purge if old non-lego data exists
        const feed = localStorage.getItem('hellobrick_feed_posts');
        if (feed && (feed.includes('hijo') || feed.includes('apple') || feed.includes('kids'))) {
           console.log('[App] Purging dirty community feed data...');
           localStorage.removeItem('hellobrick_feed_posts');
           localStorage.removeItem('hellobrick_community_last_drip');
        }

        setTimeout(() => setIsBooting(false), 1200);
        
        console.log('[App] ✅ Init Sequence Complete');
      } catch (err) {
        console.error('[App] 🛑 CRITICAL INIT ERROR:', err);
        setIsBooting(false);
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
        
        if (data.url.includes('//scan') || path.includes('/scan')) {
          handleNavigate(Screen.SCANNER);
        } else if (data.url.includes('//pro') || path.includes('/pro')) {
          handleNavigate(Screen.SUBSCRIPTION);
        } else if (data.url.includes('//ideas') || path.includes('/ideas')) {
          handleNavigate(Screen.IDEAS);
        } else if (data.url.includes('//browse') || path.includes('/browse')) {
          handleNavigate(Screen.BROWSE);
        } else if (data.url.includes('//collection') || path.includes('/collection')) {
          handleNavigate(Screen.COLLECTION);
        } else if (data.url.includes('//alerts') || path.includes('/alerts')) {
          handleNavigate(Screen.ALERTS);
        } else if (data.url.includes('//quests') || path.includes('/quests')) {
          handleNavigate(Screen.QUESTS);
        } else if (data.url.includes('//leaderboard') || path.includes('/leaderboard')) {
          handleNavigate(Screen.LEADERBOARD);
        } else if (data.url.includes('//wishlist') || path.includes('/wishlist')) {
          handleNavigate(Screen.WISHLIST);
        } else if (data.url.includes('//profile') || path.includes('/profile')) {
          handleNavigate(Screen.PROFILE);
        }

        // 3. Handle Supabase Tokens
        if (data.url.includes('auth/callback')) {
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment || url.search);
          
          const code = params.get('code');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (code && supabase) {
            console.log('[App] 🔑 PKCE code found, exchanging for session...');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
              console.log('[App] ✅ Session exchanged successfully via code');
              // onAuthStateChange will automatically handle the routing to NOTIFICATIONS_INTRO
            } else {
              console.error('[App] Code exchange failed:', error);
            }
          } else if (accessToken && refreshToken && supabase) {
            console.log('[App] 🔑 tokens found, updating session...');
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (!error) {
              console.log('[App] ✅ Session updated successfully via tokens');
              // onAuthStateChange will automatically handle the routing to NOTIFICATIONS_INTRO
            } else {
              console.error('[App] Token session set failed:', error);
            }
          } else {
            console.warn('[App] ⚠️ Deep link auth/callback received but no code or tokens found:', data.url);
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
        localStorage.removeItem('hellobrick_onboarding_finished');
        subscriptionService.logout().catch(() => {});
        appStateService.transition('onboarding');
      }
    });

    // 💓 SESSION HEARTBEAT: Keep the Admin "Live Active" light green
    const recordHeartbeat = async () => {
      try {
        const userId = localStorage.getItem('hellobrick_userId') || 'anonymous_mobile';
        const DO_IP = '67.205.172.107';
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



  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.ONBOARDING_QUESTIONNAIRE:
        return <OnboardingQuestionnaire onNavigate={handleNavigate} />;
      case Screen.NOTIFICATIONS_INTRO:
        return <NotificationsIntroScreen onNavigate={handleNavigate} />;
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
            subscriptionService.getSubscriptionStatus().catch(() => {});
            // After paywall: if onboarding not done → NotificationsIntro; else → Home
            const onboardingFinished = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
            if (!onboardingFinished) {
              handleNavigate(Screen.NOTIFICATIONS_INTRO);
            } else {
              handleNavigate(Screen.HOME);
            }
          } else {
            // Dismissed — if not authenticated yet send back to onboarding; else go home
            const isAuthenticated = localStorage.getItem('hellobrick_authenticated') === 'true';
            if (!isAuthenticated) {
              handleNavigate(Screen.ONBOARDING_QUESTIONNAIRE);
            } else {
              handleNavigate(Screen.HOME);
            }
          }
        }} />;
      case Screen.HOME:
        return <HomeScreen onNavigate={handleNavigate} />;
      case Screen.SCANNER:
        return <ScannerScreen onNavigate={handleNavigate} />;
      case Screen.COLLECTION:
        return <CollectionScreen onNavigate={handleNavigate} />;
      case Screen.INSIGHTS:
        return <InsightsScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE:
        return <ProfileScreen onNavigate={handleNavigate} />;
      case Screen.WISHLIST:
        return <WishlistScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE_SETTINGS:
        return <ProfileSettingsScreen onNavigate={handleNavigate} />;
      case Screen.SET_DETAIL:
        return <SetDetailScreen setNum={screenParams?.setNum} onNavigate={handleNavigate} />;
      case Screen.BROWSE:
        return <BrowseScreen onNavigate={handleNavigate} />;
      case Screen.IDEAS:
        return <IdeasScreen onNavigate={handleNavigate} />;
      case Screen.QUESTS:
        return <QuestsScreen onNavigate={handleNavigate} />;
      case Screen.LEADERBOARD:
        return <LeaderboardScreen onNavigate={handleNavigate} />;
      case Screen.FEED:
        return <FeedScreen onNavigate={handleNavigate} />;
      case Screen.CREATE_POST:
        return <CreatePostScreen onNavigate={handleNavigate} />;
      case Screen.ALERTS:
        return <AlertsScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-[#F5F5F7] h-[100dvh] overflow-hidden text-gray-900 selection:bg-orange-500/30 flex flex-col">
      {isBooting && <BootingScreen />}
      <div className="flex-1 relative min-h-0 overflow-hidden flex flex-col">
        {renderScreen()}
      </div>
      {/* Dev Mode Nav Hidden for Screenshots
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
              className="px-3 py-1 bg-red-500/80 backdrop-blur-md text-[10px] font-bold rounded-full text-gray-900 border border-red-400/50"
            >
              EXIT DEV
            </button>
            <select 
              value={currentScreen}
              onChange={(e) => handleNavigate(e.target.value as Screen)}
              className="bg-gray-50/90 backdrop-blur-md text-[10px] font-bold p-1 rounded-md border border-gray-300 text-gray-900"
            >
              {Object.values(Screen).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}
      */}
      {![Screen.ONBOARDING_QUESTIONNAIRE, Screen.AUTH, Screen.EMAIL_SIGNUP, Screen.EMAIL_LOGIN, Screen.SUBSCRIPTION, Screen.NOTIFICATIONS_INTRO, Screen.SCANNER].includes(currentScreen) && showNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
