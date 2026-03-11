// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Flame, ScanLine, Hammer, BrainCircuit, ChevronRight, Trophy, Gift, Search, Swords, CheckCircle2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Screen, Quest } from '../types';
import { getUserXP, getUserId } from '../services/xpService';
import { getAvailableQuests } from '../services/gamificationService';
import { LegoBackground } from '../components/LegoBackground';

interface QuestsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({ onNavigate }) => {
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = getUserId();
        const xpData = await getUserXP(userId);
        setStreak(xpData.streak_count || 0);
        const availableQuests = getAvailableQuests(); // Not async
        setQuests(availableQuests);
      } catch (error) {
        console.error('Failed to load quests:', error);
        setQuests([]);
      }
    };
    loadData();
  }, []);
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#faf9f6] relative">
      <LegoBackground />

      {/* Header with Search and Streak */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 safe-area-top">
        <div className="px-4 sm:px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />

          <div className="flex-1 min-w-0 bg-slate-50 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 truncate"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="bg-orange-100 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-orange-700 truncate max-w-[80px] sm:max-w-none">{streak} Day{streak !== 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={() => onNavigate(Screen.PROFILE)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 mt-4 sm:mt-6 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 sm:mb-4 truncate">Quests</h1>

        {/* Hub Buttons */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => onNavigate(Screen.LEADERBOARD)}
            className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xs font-bold text-slate-700">Leaderboard</span>
          </button>
          <button
            onClick={() => onNavigate(Screen.REWARDS)}
            className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <Gift className="w-6 h-6 text-pink-500" />
            <span className="text-xs font-bold text-slate-700">Rewards</span>
          </button>
          <button
            onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
            className="flex-1 bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl shadow-lg flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <Swords className="w-6 h-6 text-white" />
            <span className="text-xs font-bold text-white">Head 2 Head</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 pb-24 sm:pb-28 space-y-4 sm:space-y-5 overflow-y-auto no-scrollbar">
        {/* Weekly Challenge - First Card */}
        {quests.length > 0 && quests[0] && (
          <div
            className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-[32px] p-6 shadow-lg relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">
                WEEKLY CHALLENGE
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm font-bold">
                2d left
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Master Builder</h3>
            <p className="text-purple-100 text-sm mb-4 relative z-10">
              Scan 500 unique parts this week.
            </p>

            <div className="mb-3 relative z-10">
              <div className="h-3 w-full bg-purple-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  style={{ width: `${Math.min(100, (375 / 500) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-purple-200 mt-2 font-bold">
                <span>375/500</span>
                <span>75%</span>
              </div>
            </div>
          </div>
        )}

        {/* Individual Quest Cards */}
        {quests.slice(1).map((quest, index) => {
          const isCompleted = quest.progress >= quest.total;
          const isFirstDiscovery = quest.id === 'find_brick' || (index === 0 && quest.id !== 'train_data');
          const isTrainData = quest.id === 'train_data' || quest.title.toLowerCase().includes('train the data');

          return (
            <div
              key={quest.id}
              onClick={() => quest.actionScreen && onNavigate(quest.actionScreen)}
              className={`rounded-[32px] p-6 shadow-sm relative overflow-hidden ${isTrainData
                ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                : 'bg-white'
                } ${quest.actionScreen ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
            >
              <div className="flex justify-between items-start mb-1 relative z-10">
                <span className={`text-[10px] uppercase tracking-wider font-bold ${isTrainData ? 'text-purple-200' : 'text-slate-500'
                  }`}>
                  QUEST
                </span>
                {quest.reward && (
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${isTrainData
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-700'
                    }`}>
                    {quest.reward}
                  </span>
                )}
              </div>

              <h3 className={`text-xl font-bold mb-1 relative z-10 ${isTrainData ? 'text-white' : 'text-slate-900'
                }`}>
                {quest.title}
              </h3>
              <p className={`text-sm mb-4 relative z-10 ${isTrainData ? 'text-purple-100' : 'text-slate-600'
                }`}>
                {quest.description}
              </p>

              {isFirstDiscovery && isCompleted && (
                <div className="absolute top-6 right-6">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    Claim
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFirstDiscovery
                  ? 'bg-orange-50 text-orange-500'
                  : isTrainData
                    ? 'bg-white/10 text-white'
                    : 'bg-purple-50 text-purple-500'
                  }`}>
                  {isFirstDiscovery ? (
                    <ScanLine className="w-6 h-6" />
                  ) : (
                    <BrainCircuit className="w-6 h-6" />
                  )}
                </div>
                {quest.total > 1 && (
                  <div className={`ml-auto w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isTrainData
                    ? 'border-white/20 text-white'
                    : 'border-purple-200 text-purple-700 bg-purple-50'
                    }`}>
                    {quest.progress}/{quest.total}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No quests available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};
