
export enum Screen {
  AUTH = 'AUTH',
  SUBSCRIPTION = 'SUBSCRIPTION',
  HOME = 'HOME',
  SCANNER = 'SCANNER',
  COLLECTION = 'COLLECTION',
  QUESTS = 'QUESTS',
  PROFILE = 'PROFILE',
  MY_CREATIONS = 'MY_CREATIONS',
  TRAINING = 'TRAINING',
  TRAINING_INTRO = 'TRAINING_INTRO',
  LEADERBOARD = 'LEADERBOARD',
  REWARDS = 'REWARDS',
  FEED = 'FEED',
  PROFILE_SETTINGS = 'PROFILE_SETTINGS',
  CONNECT = 'CONNECT',
  IDEAS = 'IDEAS',
  PUZZLES = 'PUZZLES',
  HEAD_TO_HEAD = 'HEAD_TO_HEAD',
  H2H_MODES = 'H2H_MODES',
  H2H_MATCHMAKING = 'H2H_MATCHMAKING',
  H2H_BATTLE = 'H2H_BATTLE',
  H2H_RESULT = 'H2H_RESULT',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  FEATURE_INTRO = 'FEATURE_INTRO',
  NOTIFICATIONS_INTRO = 'NOTIFICATIONS_INTRO',
  BUILDING_INTRO = 'BUILDING_INTRO',
  EMAIL_SIGNUP = 'EMAIL_SIGNUP',
  EMAIL_LOGIN = 'EMAIL_LOGIN',
  CREATE_POST = 'CREATE_POST',
  HOW_TO_SCAN = 'HOW_TO_SCAN',
  CAMERA_PERMISSION = 'CAMERA_PERMISSION',
  HOW_TO_SCAN_PERMISSION = 'HOW_TO_SCAN_PERMISSION'
}

export type GameModeId = 'TARGET' | 'SPRINT' | 'MIRROR';

export interface GameMode {
  id: GameModeId;
  title: string;
  subtitle: string;
  badges: { icon: string; text: string }[];
  color: string;
}

export interface BattleResult {
  won: boolean;
  xp: number;
  playerScore: number;
  opponentScore: number;
  modeId: GameModeId;
}

export interface Brick {
  id: string;
  name: string;
  image: string;
  count: number;
  category: string;
  color?: string;
  dimensions?: string;
  isUncertain?: boolean;
  labelDisplayStatus?: 'hidden' | 'tentative' | 'confirmed';
}

export interface LegoSet {
  id: string;
  name: string;
  setNumber: string;
  image: string;
  partCount: number;
  ownedParts: number;
  bricks: Brick[]; // The bricks contained in this set
}

export interface CustomPart {
  id: string;
  name: string;
  image: string; // base64
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  level: number;
  maxLevel: number;
  image: string;
  isNew?: boolean;
  dateEarned?: string;
  color: string;
}

export interface BadgeType {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  completed: boolean;
  dateEarned?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  current?: number;
  total: number;
  timeLeft?: string;
  reward?: string;
  xpReward?: number;
  bgGradient?: string;
  textColor?: string;
  actionScreen?: Screen;
  enabled?: boolean;
  type?: string;
  targetCount?: number;
  targetColor?: string;
  icon?: any;
  difficulty?: string;
}

export interface UserStats {
  scannedCount: number;
  setsCompleted: number;
  level: number;
  streak: number;
  xp: number;
}

export interface Creation {
  id: string;
  title: string;
  image: string;
  date: string;
  partsUsed: number;
  liked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  image: string;
  type: 'DIGITAL' | 'PHYSICAL';
  available: boolean;
}

export interface DetectedBrick {
  id?: string;
  type?: string;
  targetCount?: number;
  label: string;
  confidence: number;
  box: [number, number, number, number];
  bbox?: { x: number, y: number, width: number, height: number };
  color?: string;
}

export interface BrickDetectionResult {
  bricks: DetectedBrick[];
  timeTaken: number;
  totalCount?: number;
  colors?: any;
  categories?: any;
}

export interface DailyGoal {
  id: string;
  title: string;
  description?: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

export interface UserProgress {
  level: number;
  xp: number;
  dailyStreak: number;
  challengesCompleted: number;
  recentScans?: number;
  badges: string[];
  dailyGoals: DailyGoal[];
  brickTypesFound: Set<string>;
}

export interface GameSession {
  id: string;
  mode?: GameModeId;
  questId?: string;
  score: number;
  startTime: number;
  endTime?: number;
  bricksFound?: DetectedBrick[];
  completed?: boolean;
  xpEarned?: number;
}
