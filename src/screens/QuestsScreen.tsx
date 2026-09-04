import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../types';
import { ArrowLeft, Flame, CheckCircle, Circle, Trophy, Star, Shield, Medal, Award, Crown, Zap, Sparkles, ChevronRight, Gift, Lock } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import confetti from 'canvas-confetti';

interface QuestsScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

interface Quest {
  id: string;
  title: string;
  category: string;
  current: number;
  target: number;
  xp: number;
  claimed: boolean;
  actionScreen?: Screen;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: string;
  isUnlocked: boolean;
  progressText?: string;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({ onNavigate }) => {
  const [userXp, setUserXp] = useState<number>(140);
  const [streakDays, setStreakDays] = useState<number>(5);
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [collectionItems, setCollectionItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [scanCount, setScanCount] = useState<number>(0);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Load real state
  useEffect(() => {
    const storedXp = localStorage.getItem('hellobrick_user_xp');
    if (storedXp) setUserXp(parseInt(storedXp, 10));

    const storedStreak = localStorage.getItem('hellobrick_user_streak');
    if (storedStreak) setStreakDays(parseInt(storedStreak, 10));

    const storedClaimed = localStorage.getItem('hellobrick_claimed_quests');
    if (storedClaimed) {
      try { setClaimedQuests(JSON.parse(storedClaimed)); } catch {}
    }

    const storedColl = localStorage.getItem('hellobrick_collection_sets');
    if (storedColl) {
      try { setCollectionItems(JSON.parse(storedColl)); } catch {}
    }

    const storedWish = localStorage.getItem('hellobrick_wishlist');
    if (storedWish) {
      try { setWishlistItems(JSON.parse(storedWish)); } catch {}
    }

    setScanCount(subscriptionService.getScanCount());
  }, []);

  // Calculate Level based on XP
  const levelInfo = useMemo(() => {
    const level = Math.floor(userXp / 100) + 1;
    const currentLevelXp = userXp % 100;
    const nextLevelXp = 100;
    const titles = ['Novice Collector', 'Apprentice Builder', 'Vault Specialist', 'Master Curator', 'Grail Lord'];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    return { level, currentLevelXp, nextLevelXp, title };
  }, [userXp]);

  // Total portfolio value
  const totalValue = useMemo(() => {
    return collectionItems.reduce((sum, item) => {
      const price = (item as any).currentPrice || item.purchasePrice || item.sealedPrice || 0;
      const qty = item.quantity ?? 1;
      return sum + (price * qty);
    }, 0);
  }, [collectionItems]);

  // Dynamic live quests based on actual usage
  const dailyQuests: Quest[] = useMemo(() => {
    return [
      {
        id: 'q1',
        title: 'Perform an AI Collectible Scan',
        category: 'Daily',
        current: Math.min(scanCount, 1),
        target: 1,
        xp: 40,
        claimed: !!claimedQuests['q1'],
        actionScreen: Screen.SCANNER
      },
      {
        id: 'q2',
        title: 'Add an item to your Wishlist',
        category: 'Daily',
        current: Math.min(wishlistItems.length, 1),
        target: 1,
        xp: 30,
        claimed: !!claimedQuests['q2'],
        actionScreen: Screen.BROWSE
      },
      {
        id: 'q3',
        title: 'Check your Dashboard Vault',
        category: 'Daily',
        current: 1,
        target: 1,
        xp: 20,
        claimed: !!claimedQuests['q3'],
        actionScreen: Screen.HOME
      },
      {
        id: 'q4',
        title: 'Have at least 3 items in your collection',
        category: 'Milestone',
        current: Math.min(collectionItems.length, 3),
        target: 3,
        xp: 60,
        claimed: !!claimedQuests['q4'],
        actionScreen: Screen.BROWSE
      },
      {
        id: 'q5',
        title: 'Log $100+ of collectible assets',
        category: 'Milestone',
        current: Math.min(Math.round(totalValue), 100),
        target: 100,
        xp: 80,
        claimed: !!claimedQuests['q5'],
        actionScreen: Screen.COLLECTION
      }
    ];
  }, [scanCount, wishlistItems, collectionItems, totalValue, claimedQuests]);

  // Claim XP handler
  const handleClaimQuest = (quest: Quest) => {
    if (quest.claimed || quest.current < quest.target) return;

    const newXp = userXp + quest.xp;
    const newClaimed = { ...claimedQuests, [quest.id]: true };

    setUserXp(newXp);
    setClaimedQuests(newClaimed);

    localStorage.setItem('hellobrick_user_xp', newXp.toString());
    localStorage.setItem('hellobrick_claimed_quests', JSON.stringify(newClaimed));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#FFD600', '#FF7A30']
    });

    const oldLevel = Math.floor(userXp / 100) + 1;
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel > oldLevel) {
      setLevelUpMessage(`Level Up! You reached Level ${newLevel} 🎉`);
      setTimeout(() => setLevelUpMessage(null), 3500);
    }
  };

  // Dynamic Badges & Achievements
  const achievements: Achievement[] = useMemo(() => {
    return [
      {
        id: 'a1',
        name: 'First Discovery',
        description: 'Scan your first card or LEGO set',
        tier: 'bronze',
        icon: '🔍',
        isUnlocked: scanCount >= 1,
        progressText: `${Math.min(scanCount, 1)}/1`
      },
      {
        id: 'a2',
        name: 'Curator Initiate',
        description: 'Have 5 collectibles in your vault',
        tier: 'silver',
        icon: '📦',
        isUnlocked: collectionItems.length >= 5,
        progressText: `${Math.min(collectionItems.length, 5)}/5 items`
      },
      {
        id: 'a3',
        name: 'Vault Milestone $1K',
        description: 'Achieve a $1,000 portfolio value',
        tier: 'gold',
        icon: '💰',
        isUnlocked: totalValue >= 1000,
        progressText: `$${Math.round(totalValue).toLocaleString()}/$1,000`
      },
      {
        id: 'a4',
        name: 'Wishlist Hunter',
        description: 'Add 3 grails to your wishlist',
        tier: 'bronze',
        icon: '✨',
        isUnlocked: wishlistItems.length >= 3,
        progressText: `${Math.min(wishlistItems.length, 3)}/3 items`
      },
      {
        id: 'a5',
        name: '5-Day Streak Master',
        description: 'Maintain an active daily tracking streak',
        tier: 'silver',
        icon: '🔥',
        isUnlocked: streakDays >= 5,
        progressText: `${streakDays}/5 days`
      },
      {
        id: 'a6',
        name: 'Grail Collector Club',
        description: 'Reach $5,000 total vault valuation',
        tier: 'diamond',
        icon: '👑',
        isUnlocked: totalValue >= 5000,
        progressText: `$${Math.round(totalValue).toLocaleString()}/$5,000`
      }
    ];
  }, [scanCount, collectionItems, totalValue, wishlistItems, streakDays]);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-20 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => onNavigate(Screen.HOME)} 
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                COLLECTOR QUESTS
              </span>
              <h1 className="text-xl font-black text-gray-900 leading-tight">Quests & Badges</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-full border border-orange-500/20 text-xs font-black shadow-xs">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streakDays}d Streak</span>
          </div>
        </div>
      </div>

      {/* Level Up Notification Pill */}
      {levelUpMessage && (
        <div className="mx-5 mt-3 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg text-center font-black text-xs animate-bounce">
          {levelUpMessage}
        </div>
      )}

      <div className="px-5 space-y-5 mt-4">

        {/* ─── Level & XP Hero Banner ─── */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  LEVEL {levelInfo.level}
                </span>
                <span className="text-xs font-black text-gray-200">{levelInfo.title}</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                {userXp} Total XP
              </span>
            </div>

            {/* Progress bar to next level */}
            <div className="space-y-1.5 mb-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Progress to Level {levelInfo.level + 1}</span>
                <span>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${(levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 font-medium pt-1">
              Complete daily quests & add grails to earn XP and level up your collector rank.
            </p>
          </div>
        </div>

        {/* ─── Active Quests ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Active Daily Quests
            </h3>
            <span className="text-[10px] font-bold text-gray-400">
              {dailyQuests.filter(q => q.claimed).length}/{dailyQuests.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyQuests.map((quest) => {
              const isReadyToClaim = quest.current >= quest.target && !quest.claimed;
              const isDone = quest.claimed;

              return (
                <div 
                  key={quest.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    isDone 
                      ? 'border-gray-200/60 bg-gray-50/60 opacity-80' 
                      : isReadyToClaim
                        ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/20 shadow-sm'
                        : 'border-gray-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : isReadyToClaim ? (
                          <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          quest.category === 'Daily' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {quest.category}
                        </span>
                        <h4 className={`text-xs font-black mt-1 leading-snug ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {quest.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isReadyToClaim ? (
                        <button
                          onClick={() => handleClaimQuest(quest)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-transform flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          Claim +{quest.xp} XP
                        </button>
                      ) : isDone ? (
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-xl">
                          Claimed
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-xl">
                          +{quest.xp} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar inside quest */}
                  {!isDone && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400">
                        <span>Progress</span>
                        <span>{quest.current} / {quest.target}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional Action CTA if incomplete */}
                  {!isDone && !isReadyToClaim && quest.actionScreen && (
                    <button
                      onClick={() => onNavigate(quest.actionScreen!)}
                      className="mt-2.5 w-full py-1.5 bg-[#F5F5F7] hover:bg-gray-100 rounded-xl text-[10px] font-bold text-gray-600 flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Complete Task</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Badges & Milestones Showcase ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Collector Badges ({achievements.filter(a => a.isUnlocked).length}/{achievements.length})
              </h3>
              <p className="text-[11px] text-gray-400">Earn trophies as your collection grows</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div 
                key={ach.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col items-center text-center relative overflow-hidden ${
                  ach.isUnlocked 
                    ? 'bg-white border-gray-200/90 shadow-sm' 
                    : 'bg-gray-100/70 border-gray-200/60 opacity-60'
                }`}
              >
                {!ach.isUnlocked && (
                  <div className="absolute top-2.5 right-2.5">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2.5 shadow-xs ${
                  ach.isUnlocked ? 'bg-amber-50 border border-amber-200/80' : 'bg-gray-200 text-gray-400'
                }`}>
                  {ach.icon}
                </div>

                <h4 className="text-xs font-black text-gray-900 mb-0.5">{ach.name}</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-tight mb-2 px-1">
                  {ach.description}
                </p>

                {ach.progressText && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-auto ${
                    ach.isUnlocked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {ach.progressText}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
