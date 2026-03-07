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
import { ConnectScreen } from './screens/ConnectScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { HowItWorksScreen } from './screens/HowItWorksScreen';
import { FeatureIntroScreen } from './screens/FeatureIntroScreen';
import { NotificationsIntroScreen } from './screens/NotificationsIntroScreen';
import { BuildingIntroScreen } from './screens/BuildingIntroScreen';
import { EmailAuthScreen } from './screens/EmailAuthScreen';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  // Determine initial screen based on onboarding/auth state
  const getInitialScreen = (): Screen => {
    const hasFinishedIntro = localStorage.getItem('hellobrick_onboarding_finished');
    const isAuthenticated = localStorage.getItem('hellobrick_authenticated');

    if (!hasFinishedIntro) return Screen.FEATURE_INTRO;
    if (!isAuthenticated) return Screen.AUTH;
    return Screen.HOME;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('TARGET');

  const handleNavigate = (screen: Screen, params?: any) => {
    if (screen === Screen.H2H_RESULT && params) {
      setBattleResult(params);
    }

    // Logic for completing onboarding
    if (screen === Screen.HOME && currentScreen === Screen.AUTH) {
      localStorage.setItem('hellobrick_authenticated', 'true');
    }
    if (screen === Screen.AUTH && currentScreen === Screen.BUILDING_INTRO) {
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
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
    <div className="dark bg-slate-950 min-h-screen text-slate-100 selection:bg-orange-500/30">
      {renderScreen()}

      {/* Navigation - Only show on main tabs */}
      {[Screen.HOME, Screen.SCANNER, Screen.COLLECTION, Screen.PROFILE, Screen.FEED].includes(currentScreen) && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
