// Gamification Service for HelloBrick
// Handles XP, levels, streaks, badges, and quests
// Now uses server-authoritative XP system with localStorage fallback

import { UserProgress, DailyGoal, Quest, GameSession, Screen } from '../types';
import { getUserXP, emitXPEvent, generateEventId, getUserId } from './xpService';

const STORAGE_KEY = 'hellobrick_progress';
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;
let serverAvailable = true; // Track if server is available

/**
 * Get user progress - tries server first, falls back to localStorage
 */
export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    // Try server first
    if (serverAvailable) {
      try {
        const userId = getUserId();
        const serverXP = await getUserXP(userId);
        
        // Convert server data to UserProgress format
        const progress: UserProgress = {
          xp: serverXP.xp_total,
          level: serverXP.level,
          dailyStreak: serverXP.streak_count,
          challengesCompleted: 0, 
          brickTypesFound: new Set(),
          badges: [],
          dailyGoals: getDefaultDailyGoals()
        };
        
        // Cache in localStorage
        saveUserProgress(progress);
        return progress;
      } catch (error) {
        console.warn('Server XP unavailable, using localStorage:', error);
        serverAvailable = false;
      }
    }
  } catch (error) {
    console.error('Error loading user progress:', error);
  }
  
  // Fallback to localStorage
  try {
    if (typeof localStorage === 'undefined') {
      return getDefaultProgress();
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.brickTypesFound && Array.isArray(parsed.brickTypesFound)) {
        parsed.brickTypesFound = new Set(parsed.brickTypesFound);
      } else {
        parsed.brickTypesFound = new Set();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  return getDefaultProgress();
};

/**
 * Get user progress synchronously (for immediate UI updates)
 * Returns cached version or default
 */
export const getUserProgressSync = (): UserProgress => {
  try {
    if (typeof localStorage === 'undefined') {
      return getDefaultProgress();
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.brickTypesFound && Array.isArray(parsed.brickTypesFound)) {
        parsed.brickTypesFound = new Set(parsed.brickTypesFound);
      } else {
        parsed.brickTypesFound = new Set();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading user progress:', error);
  }
  
  return getDefaultProgress();
};

/**
 * Get default progress object
 */
function getDefaultProgress(): UserProgress {
  return {
    xp: 0,
    level: 1,
    dailyStreak: 0,
    challengesCompleted: 0,
    brickTypesFound: new Set(),
    badges: [],
    dailyGoals: getDefaultDailyGoals()
  };
}

/**
 * Save user progress to localStorage
 */
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage not available, cannot save progress');
      return;
    }
    
    const toStore = {
      ...progress,
      brickTypesFound: Array.from(progress.brickTypesFound)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

/**
 * Add XP - now uses server-authoritative system
 * This is a legacy function - new code should use emitXPEvent directly
 */
export const addXP = async (amount: number, progress: UserProgress, source: string = 'manual'): Promise<UserProgress> => {
  // Try server first
  if (serverAvailable) {
    try {
      const userId = getUserId();
      const response = await emitXPEvent({
        event_id: generateEventId(),
        type: source.toUpperCase(),
        user_id: userId,
        timestamp: Date.now(),
        payload: { xp: amount },
      });
      
      // Update progress from server response
      const updated = {
        ...progress,
        xp: response.new_xp_total,
        level: response.new_level,
      };
      
      // Check for level up
      if (response.new_level > progress.level) {
        updated.badges = [...updated.badges, `Level ${response.new_level}`];
      }
      
      saveUserProgress(updated);
      return updated;
    } catch (error) {
      console.warn('Server XP unavailable, using local:', error);
      serverAvailable = false;
    }
  }
  
  // Fallback to local calculation
  const newXP = progress.xp + amount;
  const newLevel = Math.min(
    Math.floor(newXP / XP_PER_LEVEL) + 1,
    MAX_LEVEL
  );
  
  const updated = {
    ...progress,
    xp: newXP,
    level: newLevel
  };
  
  // Check for level up
  if (newLevel > progress.level) {
    updated.badges = [...updated.badges, `Level ${newLevel}`];
  }
  
  saveUserProgress(updated);
  return updated;
};

/**
 * Update daily streak
 */
export const updateStreak = (progress: UserProgress): UserProgress => {
  const lastPlayed = localStorage.getItem('hellobrick_last_played');
  const today = new Date().toDateString();
  
  let newStreak = progress.dailyStreak;
  
  if (lastPlayed !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPlayed === yesterday.toDateString()) {
      // Consecutive day
      newStreak += 1;
    } else if (lastPlayed && lastPlayed !== today) {
      // Streak broken - check if it's been more than 1 day
      const lastPlayedDate = new Date(lastPlayed);
      const daysDiff = Math.floor((new Date().getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Still consecutive
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      // First time playing
      newStreak = 1;
    }
    
    localStorage.setItem('hellobrick_last_played', today);
  }
  
  const updated = {
    ...progress,
    dailyStreak: newStreak
  };
  
  // Streak badges
  if (newStreak === 7 && !updated.badges.includes('Week Warrior')) {
    updated.badges = [...updated.badges, 'Week Warrior'];
  } else if (newStreak === 30 && !updated.badges.includes('Monthly Master')) {
    updated.badges = [...updated.badges, 'Monthly Master'];
  } else if (newStreak === 100 && !updated.badges.includes('Century Club')) {
    updated.badges = [...updated.badges, 'Century Club'];
  }
  
  saveUserProgress(updated);
  return updated;
};

/**
 * Complete a challenge
 * Note: This is synchronous for immediate UI updates, but XP is saved asynchronously
 */
export const completeChallenge = (
  _questId: string,
  xpEarned: number,
  bricksFound: string[],
  progress: UserProgress
): UserProgress => {
  let updated = { ...progress };
  
  // Add XP synchronously for immediate UI feedback
  const newXP = updated.xp + xpEarned;
  const newLevel = Math.min(
    Math.floor(newXP / XP_PER_LEVEL) + 1,
    MAX_LEVEL
  );
  updated.xp = newXP;
  updated.level = newLevel;
  
  // Check for level up
  if (newLevel > progress.level) {
    updated.badges = [...updated.badges, `Level ${newLevel}`];
  }
  
  // Update challenges completed
  updated.challengesCompleted += 1;
  
  // Add brick types found
  bricksFound.forEach(type => updated.brickTypesFound.add(type));
  
  // Update daily goals
  let goalXP = 0;
  updated.dailyGoals = updated.dailyGoals.map(goal => {
    if (!goal.completed) {
      const newCurrent = goal.progress + 1;
      if (newCurrent >= goal.target) {
        // Complete goal and accumulate XP
        goalXP += goal.xpReward;
        return { ...goal, current: goal.target, completed: true };
      }
      return { ...goal, current: newCurrent };
    }
    return goal;
  });
  
  // Add goal XP if any goals completed
  if (goalXP > 0) {
    updated.xp += goalXP;
    const goalLevel = Math.min(
      Math.floor(updated.xp / XP_PER_LEVEL) + 1,
      MAX_LEVEL
    );
    if (goalLevel > updated.level) {
      updated.level = goalLevel;
      updated.badges = [...updated.badges, `Level ${goalLevel}`];
    }
  }
  
  // Check for badges
  if (updated.challengesCompleted === 10 && !updated.badges.includes('Quest Starter')) {
    updated.badges = [...updated.badges, 'Quest Starter'];
  } else if (updated.challengesCompleted === 50 && !updated.badges.includes('Quest Master')) {
    updated.badges = [...updated.badges, 'Quest Master'];
  }
  
  if (updated.brickTypesFound.size >= 10 && !updated.badges.includes('Brick Collector')) {
    updated.badges = [...updated.badges, 'Brick Collector'];
  }
  
  // Save progress immediately
  saveUserProgress(updated);
  
  // Also emit XP event to server asynchronously (non-blocking)
  if (serverAvailable) {
    addXP(xpEarned + goalXP, updated, 'quest_completion').catch(err => {
      console.warn('Failed to sync XP to server:', err);
    });
  }
  
  return updated;
};

/**
 * Get default daily goals
 */
export const getDefaultDailyGoals = (): DailyGoal[] => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`hellobrick_goals_${today}`);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fall through to default
    }
  }
  
  const goals: DailyGoal[] = [
    {
      id: 'daily_scan',
      title: 'Scan a Bin',
      description: 'Scan one bin of bricks',
      target: 1,
      progress: 0,
      xpReward: 25,
      completed: false
    },
    {
      id: 'daily_quest',
      title: 'Complete a Quest',
      description: 'Finish any brick quest',
      target: 1,
      progress: 0,
      xpReward: 50,
      completed: false
    },
    {
      id: 'daily_bricks',
      title: 'Find 20 Bricks',
      description: 'Detect 20 bricks total',
      target: 20,
      progress: 0,
      xpReward: 75,
      completed: false
    }
  ];
  
  localStorage.setItem(`hellobrick_goals_${today}`, JSON.stringify(goals));
  return goals;
};

/**
 * Reset daily goals (call at midnight)
 */
export const resetDailyGoals = (): void => {
  const today = new Date().toDateString();
  localStorage.removeItem(`hellobrick_goals_${today}`);
};

/**
 * Get available quests
 */
export const getAvailableQuests = (): Quest[] => {
  const today = new Date().toDateString();
  const dailyQuestKey = `hellobrick_daily_quest_${today}`;
  const storedDaily = localStorage.getItem(dailyQuestKey);
  
  // Generate daily quest if not exists
  let dailyQuest: Quest;
  if (storedDaily) {
    const parsed = JSON.parse(storedDaily);
    // Convert old format to new format if needed
    if (parsed.type || parsed.xpReward) {
      dailyQuest = {
        id: parsed.id || 'daily_color_hunt',
        title: parsed.title || 'Daily Quest',
        description: parsed.description || 'Complete today\'s quest',
        progress: 0,
        total: parsed.targetCount || 10,
        reward: `${parsed.xpReward || 50} XP`,
        bgGradient: 'bg-gradient-to-br from-orange-500 to-rose-600',
        textColor: 'text-white',
        actionScreen: Screen.SCANNER
      };
    } else {
      dailyQuest = parsed;
    }
  } else {
    const colors = ['Red', 'Blue', 'Yellow', 'Green', 'White', 'Black', 'Orange', 'Pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomCount = Math.floor(Math.random() * 5) + 5; // 5-10 bricks
    
    dailyQuest = {
      id: 'daily_color_hunt',
      title: `Daily Quest - Find All ${randomColor} Bricks`,
      description: `Find ${randomCount} ${randomColor.toLowerCase()} bricks to complete today's quest`,
      progress: 0,
      total: randomCount,
      reward: '50 XP',
      bgGradient: 'bg-gradient-to-br from-orange-500 to-rose-600',
      textColor: 'text-white',
      actionScreen: Screen.SCANNER
    };
    localStorage.setItem(dailyQuestKey, JSON.stringify(dailyQuest));
  }
  
  return [
    dailyQuest,
    {
      id: 'find_brick',
      title: 'First Discovery',
      description: 'Find a rare Technic part',
      progress: 0,
      total: 1,
      reward: '25 XP',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      textColor: 'text-white',
      actionScreen: Screen.SCANNER
    },
    {
      id: 'train_data',
      title: 'Train the Data',
      description: 'Help verify data and get boosted XP',
      progress: 2,
      total: 5,
      reward: '50 XP',
      bgGradient: 'bg-gradient-to-br from-purple-600 to-purple-700',
      textColor: 'text-white',
      actionScreen: Screen.TRAINING
    },
    {
      id: 'color_hunt_red',
      title: 'Find All Red Bricks',
      description: 'Find all red bricks in your collection',
      progress: 0,
      total: 10,
      reward: '30 XP',
      bgGradient: 'bg-gradient-to-br from-red-500 to-rose-600',
      textColor: 'text-white',
      actionScreen: Screen.SCANNER
    },
    {
      id: 'color_hunt_blue',
      title: 'Find All Blue Bricks',
      description: 'Find all blue bricks in your collection',
      progress: 0,
      total: 10,
      reward: '30 XP',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      textColor: 'text-white',
      actionScreen: Screen.SCANNER
    },
    {
      id: 'color_hunt_yellow',
      title: 'Find All Yellow Bricks',
      description: 'Find all yellow bricks in your collection',
      progress: 0,
      total: 10,
      reward: '30 XP',
      bgGradient: 'bg-gradient-to-br from-yellow-500 to-amber-600',
      textColor: 'text-white',
      actionScreen: Screen.SCANNER
    }
  ];
};

/**
 * Create a new game session
 */
export const createGameSession = (questId: string): GameSession => {
  return {
    id: `session_${Date.now()}`,
    questId,
    startTime: Date.now(),
    score: 0,
    xpEarned: 0,
    bricksFound: [],
    completed: false
  };
};

/**
 * Save game session
 */
export const saveGameSession = (session: GameSession): void => {
  const sessions = getGameSessions();
  sessions.push(session);
  localStorage.setItem('hellobrick_sessions', JSON.stringify(sessions));
};

/**
 * Get game sessions history
 */
export const getGameSessions = (): GameSession[] => {
  try {
    const stored = localStorage.getItem('hellobrick_sessions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Calculate XP for quest completion
 */
export const calculateQuestXP = (
  quest: Quest,
  score: number,
  timeBonus: boolean = false
): number => {
  // Extract XP from reward string or default to 50
  const rewardMatch = quest.reward?.match(/(\d+)\s*XP/i);
  let baseXP = rewardMatch ? parseInt(rewardMatch[1], 10) : 50;
  
  // Score multiplier
  const scoreMultiplier = Math.min(1 + (score / 100), 2);
  baseXP = Math.floor(baseXP * scoreMultiplier);
  
  // Time bonus
  if (timeBonus) {
    baseXP = Math.floor(baseXP * 1.2);
  }
  
  // Default difficulty multiplier (since Quest interface doesn't have difficulty)
  const difficultyMultiplier = 1.2;
  baseXP = Math.floor(baseXP * difficultyMultiplier);
  
  return baseXP;
};

