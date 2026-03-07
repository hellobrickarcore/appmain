
import { Brick, Quest, UserStats, Creation, LeaderboardEntry, RewardItem, LegoSet, Achievement, BadgeType, Screen } from './types';

export const MOCK_USER: UserStats = {
  scannedCount: 12403,
  setsCompleted: 42,
  level: 12,
  streak: 12,
  xp: 9733
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: '1',
        title: 'Early Riser',
        description: 'Complete 50 scans before 9:00 am',
        level: 50,
        maxLevel: 50,
        image: 'https://picsum.photos/seed/bear/200/200',
        isNew: true,
        dateEarned: 'DEC 20, 2024',
        color: 'bg-amber-400'
    },
    {
        id: '2',
        title: 'Technic Titan',
        description: 'Find 100 Technic pins',
        level: 100,
        maxLevel: 100,
        image: 'https://picsum.photos/seed/tech/200/200',
        isNew: true,
        color: 'bg-purple-500'
    },
    {
        id: '3',
        title: 'Set Hunter',
        description: 'Complete 100 sets',
        level: 100,
        maxLevel: 150,
        image: 'https://picsum.photos/seed/hunter/200/200',
        isNew: true,
        color: 'bg-orange-500'
    },
    {
        id: '4',
        title: 'Flame Keeper',
        description: 'Reach a 150 day streak',
        level: 150,
        maxLevel: 200,
        image: 'https://picsum.photos/seed/fire/200/200',
        isNew: true,
        color: 'bg-red-500'
    }
];

export const MOCK_BADGES: BadgeType[] = [
    { 
      id: '1', 
      name: 'Lumberjack', 
      description: 'Collect 50 brown log bricks.',
      image: 'https://picsum.photos/seed/badge1/100/100', 
      color: 'bg-orange-600', 
      completed: true,
      dateEarned: 'JAN 15, 2025'
    },
    { 
      id: '2', 
      name: 'Cyclist', 
      description: 'Find 20 bicycle wheels.',
      image: 'https://picsum.photos/seed/badge2/100/100', 
      color: 'bg-emerald-500', 
      completed: true,
      dateEarned: 'FEB 02, 2025'
    },
    { 
      id: '3', 
      name: 'Sneakerhead', 
      description: 'Identify 5 unique minifigure shoe pieces.',
      image: 'https://picsum.photos/seed/badge3/100/100', 
      color: 'bg-indigo-500', 
      completed: true,
      dateEarned: 'MAR 10, 2025'
    },
    { 
      id: '4', 
      name: 'Singer', 
      description: 'Complete the Rock Band set.',
      image: 'https://picsum.photos/seed/badge4/100/100', 
      color: 'bg-slate-400', 
      completed: false 
    },
];

export const MOCK_QUESTS: Quest[] = [
  {
    id: '1',
    title: 'Master Builder',
    description: 'Scan 500 unique parts this week.',
    progress: 375,
    total: 500,
    timeLeft: '2d left',
    bgGradient: 'bg-[#1a1b41]', 
    textColor: 'text-white'
  },
  {
    id: '2',
    title: 'First Discovery',
    description: 'Find a rare Technic part',
    progress: 0,
    total: 1,
    reward: 'Claim',
    bgGradient: 'bg-white',
    textColor: 'text-slate-900'
  },
  {
    id: '3',
    title: 'Train the AI',
    description: 'Verify 5 predictions to help accuracy',
    progress: 2,
    total: 5,
    reward: '50 XP',
    bgGradient: 'bg-indigo-600',
    textColor: 'text-white',
    actionScreen: Screen.TRAINING
  }
];

export const MOCK_COLLECTION: Brick[] = [
  { id: '1', name: '2x4 Brick', image: 'https://picsum.photos/seed/brick1/100/100', count: 4, category: 'Bricks' },
  { id: '2', name: '2x4 Plate Red', image: 'https://picsum.photos/seed/plate1/100/100', count: 12, category: 'Plates', color: 'red' },
  { id: '3', name: 'Classic Spaceman', image: 'https://picsum.photos/seed/mini1/100/100', count: 2, category: 'Minifigs' },
  { id: '4', name: '1x1 Cone', image: 'https://picsum.photos/seed/cone/100/100', count: 8, category: 'Technic', color: 'grey' },
  { id: '5', name: 'Wheel 18mm', image: 'https://picsum.photos/seed/wheel/100/100', count: 4, category: 'Technic', color: 'black' },
  { id: '6', name: '2x2 Tile', image: 'https://picsum.photos/seed/tile/100/100', count: 20, category: 'Plates', color: 'white' },
  { id: '7', name: '1x2 Grill', image: 'https://picsum.photos/seed/grill/100/100', count: 15, category: 'Plates', color: 'grey' },
  { id: '8', name: 'Slope 45', image: 'https://picsum.photos/seed/slope/100/100', count: 3, category: 'Bricks', color: 'red' },
];

export const MOCK_SETS: LegoSet[] = [
    {
        id: '101',
        name: 'Space Explorer',
        setNumber: '60430',
        image: 'https://picsum.photos/seed/set1/300/300',
        partCount: 240,
        ownedParts: 240,
        bricks: [
             { id: '1', name: '2x4 Brick', image: 'https://picsum.photos/seed/brick1/100/100', count: 4, category: 'Bricks' },
             { id: '3', name: 'Classic Spaceman', image: 'https://picsum.photos/seed/mini1/100/100', count: 2, category: 'Minifigs' },
        ]
    },
    {
        id: '102',
        name: 'Forest Cabin',
        setNumber: '31139',
        image: 'https://picsum.photos/seed/set2/300/300',
        partCount: 150,
        ownedParts: 85,
        bricks: [
             { id: '8', name: 'Slope 45', image: 'https://picsum.photos/seed/slope/100/100', count: 3, category: 'Bricks' },
             { id: '2', name: '2x4 Plate Red', image: 'https://picsum.photos/seed/plate1/100/100', count: 12, category: 'Plates', color: 'red' }
        ]
    },
    {
        id: '103',
        name: 'Race Car',
        setNumber: '42151',
        image: 'https://picsum.photos/seed/set3/300/300',
        partCount: 89,
        ownedParts: 12,
        bricks: [
             { id: '5', name: 'Wheel 18mm', image: 'https://picsum.photos/seed/wheel/100/100', count: 4, category: 'Technic' },
             { id: '4', name: '1x1 Cone', image: 'https://picsum.photos/seed/cone/100/100', count: 8, category: 'Technic' }
        ]
    }
];

export const MOCK_CREATIONS: Creation[] = [
  { id: '1', title: 'Mini Rocket', image: 'https://picsum.photos/seed/rocket/300/300', date: '2 days ago', partsUsed: 45, liked: true },
  { id: '2', title: 'Forest Cabin', image: 'https://picsum.photos/seed/cabin/300/300', date: '1 week ago', partsUsed: 120, liked: false },
  { id: '3', title: 'Cyber Truck', image: 'https://picsum.photos/seed/truck/300/300', date: '2 weeks ago', partsUsed: 89, liked: true },
  { id: '4', title: 'Duck', image: 'https://picsum.photos/seed/duck/300/300', date: '1 month ago', partsUsed: 12, liked: true },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'BrickMaster99', xp: 45000, avatar: 'https://picsum.photos/seed/u1/100/100' },
    { rank: 2, name: 'LegoLucy', xp: 42300, avatar: 'https://picsum.photos/seed/u2/100/100' },
    { rank: 3, name: 'TechnicTom', xp: 38900, avatar: 'https://picsum.photos/seed/u3/100/100' },
    { rank: 4, name: 'BlockBuilder', xp: 31000, avatar: 'https://picsum.photos/seed/u4/100/100' },
    { rank: 12, name: 'Alex Builder (You)', xp: 14500, avatar: 'https://picsum.photos/seed/me/100/100', isCurrentUser: true },
];

export const MOCK_REWARDS: RewardItem[] = [
    { id: '1', title: '£10 Building Brick Voucher', cost: 25000, image: 'https://picsum.photos/seed/voucher/200/200', type: 'PHYSICAL', available: true },
    { id: '2', title: '2x Cinema Tickets', cost: 15000, image: 'https://picsum.photos/seed/cinema/200/200', type: 'PHYSICAL', available: true },
    { id: '3', title: 'Pro Theme Pack', cost: 5000, image: 'https://picsum.photos/seed/theme/200/200', type: 'DIGITAL', available: true },
    { id: '4', title: 'Master Badge', cost: 50000, image: 'https://picsum.photos/seed/badge/200/200', type: 'DIGITAL', available: false },
];

export const CATEGORIES = ['All', 'Sets', 'Minifigs', 'Technic', 'Plates', 'Tiles'];

export const PLACEHOLDER_AVATAR = "https://picsum.photos/seed/avatar1/200/200";
