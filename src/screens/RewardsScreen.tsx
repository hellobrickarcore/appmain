// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Gift, Lock } from 'lucide-react';
import { Screen, RewardItem } from '../types';
import { getUserXP, getUserId } from '../services/xpService';

interface RewardsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onNavigate }) => {
  const [userXP, setUserXP] = useState(0);
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = getUserId();
        const xpData = await getUserXP(userId);
        setUserXP(xpData.xp_total || 0);
        // TODO: Load rewards from backend API
        setRewards([]);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      }
    };
    loadData();
  }, []);
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#faf9f6] font-sans safe-area-inset">
      <div className="px-4 sm:px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 sm:pb-6 flex items-center justify-between bg-white border-b border-slate-100 safe-area-top">
        <button
          onClick={() => onNavigate(Screen.QUESTS)}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 active:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex flex-col items-end min-w-0 flex-1 ml-4">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase truncate">Available Balance</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 truncate">{userXP.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 pb-24 sm:pb-28">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          <div className="col-span-2 mb-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Redeem Rewards</h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">Real world perks for your hard work.</p>
          </div>

          {rewards.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-500">
              <p>No rewards available yet. Check back soon!</p>
            </div>
          ) : rewards.map(reward => (
            <div key={reward.id} className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col ${!reward.available ? 'opacity-60' : ''}`}>
              <div className="aspect-square bg-slate-50 rounded-xl mb-3 overflow-hidden relative">
                <img src={reward.image} alt={reward.title} className="w-full h-full object-cover mix-blend-multiply" />
                {!reward.available && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white opacity-80" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">{reward.title}</h3>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600">{reward.cost.toLocaleString()} XP</span>
                <button
                  disabled={!reward.available || userXP < reward.cost}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${userXP >= reward.cost && reward.available
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {reward.available ? 'Claim' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
