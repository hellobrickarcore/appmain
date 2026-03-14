
import { Screen } from '../types';

export const ONBOARDING_SEQUENCE: Screen[] = [
  Screen.FEATURE_INTRO,
  Screen.NOTIFICATIONS_INTRO,
  Screen.BUILDING_INTRO,
  Screen.SUBSCRIPTION
];

/**
 * Returns the next screen in the onboarding flow.
 * If at the end, returns Screen.HOME.
 */
export const getNextOnboardingScreen = (current: Screen): Screen => {
  const index = ONBOARDING_SEQUENCE.indexOf(current);
  if (index === -1 || index === ONBOARDING_SEQUENCE.length - 1) {
    return Screen.HOME;
  }
  return ONBOARDING_SEQUENCE[index + 1];
};

/**
 * Determines if a screen is part of the onboarding sequence.
 */
export const isOnboardingScreen = (screen: Screen): boolean => {
  return ONBOARDING_SEQUENCE.includes(screen);
};

/**
 * Checks if a destination requires the user to have finished onboarding.
 */
export const requiresFinishedOnboarding = (screen: Screen): boolean => {
  const exempt = [
    Screen.AUTH,
    Screen.EMAIL_LOGIN,
    Screen.EMAIL_SIGNUP,
    Screen.HOME,
    ...ONBOARDING_SEQUENCE
  ];
  
  // Also exempt multiplayer screens (System 3 requirement)
  const multiplayer = [
    Screen.HEAD_TO_HEAD,
    Screen.H2H_MODES,
    Screen.H2H_MATCHMAKING,
    Screen.H2H_BATTLE,
    Screen.H2H_RESULT
  ];

  return !exempt.includes(screen) && !multiplayer.includes(screen);
};
