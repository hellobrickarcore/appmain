import React, { useState } from 'react';
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
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ConnectScreen } from './screens/ConnectScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { FeatureIntroScreen } from './screens/FeatureIntroScreen';
import { NotificationsIntroScreen } from './screens/NotificationsIntroScreen';
import { BuildingIntroScreen } from './screens/BuildingIntroScreen';
import { EmailAuthScreen } from './screens/EmailAuthScreen';
import { InstructionsScreen } from './screens/InstructionsScreen';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  // Determine initial screen based on onboarding/auth state
  const getInitialScreen = (): Screen => {
    const isAuthenticated = Boolean(localStorage.getItem('hellobrick_authenticated'));
    const hasFinishedIntro = Boolean(localStorage.getItem('hellobrick_onboarding_finished'));

    if (!isAuthenticated) return Screen.AUTH;
    if (!hasFinishedIntro) return Screen.FEATURE_INTRO;
    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [activeSet, setActiveSet] = useState<any>(null);

  const handleNavigate = (screen: Screen, params?: any) => {
    console.log(`🚀 Navigating to: ${screen}`, params);

    // Clear challenge if moving away from Scanner (unless it's results)
    if (currentScreen === Screen.SCANNER && screen !== Screen.SCANNER) {
      setActiveChallenge(null);
    }

    if (screen === Screen.SCANNER && params?.challenge) {
      console.log('🎯 Setting active challenge:', params.challenge);
      setActiveChallenge(params.challenge);
    }

    if (screen === Screen.H2H_RESULT && params) {
      setBattleResult(params);
    }

    if (screen === Screen.INSTRUCTIONS && params) {
      setActiveSet(params);
    }

    // Logic for completing authentication
    if (screen === Screen.HOME && currentScreen === Screen.AUTH) {
      localStorage.setItem('hellobrick_authenticated', 'true');

      const hasFinishedIntro = localStorage.getItem('hellobrick_onboarding_finished');
      if (!hasFinishedIntro) {
        setCurrentScreen(Screen.FEATURE_INTRO);
        return;
      }
    }

    // Logic for completing onboarding
    if (screen === Screen.HOME && (currentScreen === Screen.SUBSCRIPTION || currentScreen === Screen.BUILDING_INTRO)) {
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
    }

    // Phase 9: Ensure multiplayer doesn't redirect to onboarding for authenticated users
    // Auth route guarding
    const isAuthenticated = Boolean(localStorage.getItem('hellobrick_authenticated'));
    const hasFinishedIntro = Boolean(localStorage.getItem('hellobrick_onboarding_finished'));
    
    // Pages that require authentication
    const authRequiredScreens = [
      Screen.PROFILE, Screen.PROFILE_SETTINGS, Screen.LEADERBOARD, 
      Screen.HEAD_TO_HEAD, Screen.H2H_MODES, Screen.H2H_MATCHMAKING, Screen.H2H_BATTLE,
      Screen.CONNECT, Screen.COLLECTION, Screen.SCANNER
    ];

    const multiplayerScreens = [
      Screen.HEAD_TO_HEAD, Screen.H2H_MODES, Screen.H2H_MATCHMAKING, Screen.H2H_BATTLE, Screen.H2H_RESULT
    ];

    if (authRequiredScreens.includes(screen)) {
      if (!isAuthenticated) {
        console.log('🔒 Redirecting to auth: user not authenticated');
        setCurrentScreen(Screen.AUTH);
        return;
      } else if (!hasFinishedIntro && !multiplayerScreens.includes(screen)) {
         console.log('🔒 Redirecting to intro: user has not finished onboarding');
         setCurrentScreen(Screen.FEATURE_INTRO);
         return;
      }
    }

    // Final check for Auth Screen manual navigation
    if (currentScreen === Screen.AUTH && screen !== Screen.AUTH) {
      localStorage.setItem('hellobrick_authenticated', 'true');
      if (!hasFinishedIntro && screen === Screen.HOME) {
        setCurrentScreen(Screen.FEATURE_INTRO);
        return;
      }
    }

    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // --- Onboarding / Auth ---
      case Screen.FEATURE_INTRO:
        return <FeatureIntroScreen onNavigate={handleNavigate} />;
      case Screen.HOW_IT_WORKS:
        return <HowItWorksScreen onNavigate={handleNavigate} />;
      case Screen.NOTIFICATIONS_INTRO:
        return <NotificationsIntroScreen onNavigate={handleNavigate} />;
      case Screen.BUILDING_INTRO:
        return <BuildingIntroScreen onNavigate={handleNavigate} />;
      case Screen.AUTH:
        return <AuthScreen onAuthenticate={() => handleNavigate(Screen.HOME)} onNavigate={handleNavigate} />;
      case Screen.EMAIL_SIGNUP:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.HOME)} mode="signup" />;
      case Screen.EMAIL_LOGIN:
        return <EmailAuthScreen onNavigate={handleNavigate} onAuthenticate={() => handleNavigate(Screen.HOME)} mode="login" />;
      case Screen.SUBSCRIPTION:
        return <SubscriptionScreen onNavigate={handleNavigate} />;

      // --- Main App ---
      case Screen.HOME:
        return <HomeScreen onNavigate={handleNavigate} />;
      case Screen.SCANNER:
        return <ScannerScreen onNavigate={handleNavigate} challenge={activeChallenge} />;
      case Screen.COLLECTION:
        return <CollectionScreen onNavigate={handleNavigate} />;
      case Screen.INSTRUCTIONS:
        return <InstructionsScreen onNavigate={handleNavigate} setDetails={activeSet} />;
      case Screen.PROFILE:
        return <ProfileScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE_SETTINGS:
        return <ProfileSettingsScreen onNavigate={handleNavigate} />;
      case Screen.LEADERBOARD:
        return <LeaderboardScreen onNavigate={handleNavigate} />;
      case Screen.QUESTS:
        return <QuestsScreen onNavigate={handleNavigate} />;
      case Screen.PUZZLES:
        return <PuzzlesScreen onNavigate={handleNavigate} />;
      case Screen.FEED:
        return <FeedScreen onNavigate={handleNavigate} />;
      case Screen.CONNECT:
        return <ConnectScreen onNavigate={handleNavigate} />;

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
    <div className="dark bg-slate-950 min-h-[100dvh] text-slate-100 selection:bg-orange-500/30">
      {renderScreen()}

      {/* Navigation - Show on main 4 tabs plus Feed */}
      {[Screen.HOME, Screen.SCANNER, Screen.COLLECTION, Screen.PROFILE, Screen.FEED, Screen.CONNECT].includes(currentScreen) && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
