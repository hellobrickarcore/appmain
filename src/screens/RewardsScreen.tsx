// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Gift, Lock, Sparkles, Trophy, ArrowRight, Construction } from 'lucide-react';
import { Screen, RewardItem } from '../types';
import { getUserXP, getUserId } from '../services/xpService';

interface RewardsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onNavigate }) => {
  const [userXP, setUserXP] = useState(0);
  const [rewards, setRewards] = useState<RewardItem[]>([]); // Empty state for production-ready look

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = getUserId();
        const xpData = await getUserXP(userId);
        setUserXP(xpData.xp_total || 0);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#050A18] font-sans text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Header - Using h-full context and safe-area padding */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => onNavigate(Screen.QUESTS)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex flex-col items-center flex-1">
           <h1 className="text-sm font-black text-white">THE TREASURY</h1>
           <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-indigo-500">{userXP.toLocaleString()}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Available XP</span>
           </div>
        </div>
        <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
           <Trophy className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-10 pb-[max(env(safe-area-inset-bottom),120px)] overscroll-contain">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-left">
            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">Vault Rewards</h2>
            <p className="text-slate-500 font-bold text-base leading-relaxed mb-6">Exchange your hard-earned experience for physical and digital assets.</p>
            
            <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-[28px] flex items-start gap-4">
               <div className="bg-orange-500/20 p-2.5 rounded-xl text-orange-400">
                  <Star className="w-5 h-5 fill-current" />
               </div>
               <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Seasonal Payouts</h4>
                  <p className="text-xs text-orange-200/60 font-bold leading-relaxed">Only the **Top 3 builders** on the Global Leaderboard every 14 days receive guaranteed physical rewards. Keep scanning to climb!</p>
               </div>
            </div>
          </div>

          {rewards.length === 0 ? (
            /* Professional Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-8 bg-white/[0.02] border border-white/5 rounded-[48px] text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[28px] flex items-center justify-center mb-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                <Construction className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Restocking the Vault</h3>
              <p className="text-slate-500 font-bold text-base leading-snug max-w-[240px]">
                New exclusive items are landing soon. Keep building to grow your balance!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {rewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`relative group bg-white/5 border border-white/5 rounded-[40px] p-5 flex flex-col transition-all duration-500 overflow-hidden ${!reward.available ? 'opacity-40 grayscale' : 'hover:border-indigo-500/50 hover:bg-white/[0.08]'}`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
                    
                    <div className="aspect-square bg-[#0A0F1E] rounded-[32px] mb-5 overflow-hidden relative border border-white/5 shadow-inner">
                      <img src={reward.image} alt={reward.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {!reward.available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
                          <div className="bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-3">
                             <Lock className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">Locked</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-black text-base text-white leading-tight mb-2 px-1">{reward.title}</h3>
                    
                    <div className="mt-auto px-1 flex flex-col gap-4">
                      <div className="flex items-center gap-1.5">
                         <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                         <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{reward.cost.toLocaleString()} XP</span>
                      </div>
                      
                      <button
                        disabled={!reward.available || userXP < reward.cost}
                        className={`w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-wider transition-all ${userXP >= reward.cost && reward.available
                            ? 'bg-white text-slate-950 shadow-xl active:scale-95 flex items-center justify-center gap-2'
                            : 'bg-white/5 text-slate-700 border border-white/5'
                          }`}
                      >
                        {reward.available ? (
                            <>Claim <ArrowRight className="w-4 h-4" /></>
                        ) : 'Locked'}
                      </button>
                    </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[40px] p-10 border border-white/5 text-center">
             <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600">
                  <Gift className="w-6 h-6" />
                </div>
             </div>
             <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Inventory Restocked Weekly</p>
             <p className="text-sm font-bold text-slate-400 leading-relaxed italic-none">
               "Patience is the foundation of high-level building."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
