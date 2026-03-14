
import { Screen } from '../types';

/**
 * UTILITY: ROUTING REGRESSION PROTECTION
 * 
 * Tracks the navigation history in a short buffer to detect rapid loops.
 * If a loop is detected (e.g., A -> B -> A within 1s), it logs a critical
 * warning and can force a break to HOME.
 */

const HISTORY_LIMIT = 5;
const LOOP_THRESHOLD_MS = 1500;

interface NavEvent {
  screen: Screen;
  timestamp: number;
}

const navHistory: NavEvent[] = [];

export const trackNavigation = (screen: Screen): boolean => {
  const now = Date.now();
  navHistory.push({ screen, timestamp: now });

  if (navHistory.length > HISTORY_LIMIT) {
    navHistory.shift();
  }

  // Check for loops (identical route within short timeframe)
  if (navHistory.length >= 3) {
    const last = navHistory[navHistory.length - 1];
    const previous = navHistory[navHistory.length - 3];

    if (last.screen === previous.screen && (last.timestamp - previous.timestamp) < LOOP_THRESHOLD_MS) {
      console.error(`🚨 CRITICAL: Navigation loop detected for screen ${screen}! Breaking loop.`);
      return true; // Loop detected
    }
  }

  return false;
};
