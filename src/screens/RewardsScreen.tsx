// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Gift, Lock, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Screen, RewardItem } from '../types';
import { getUserXP, getUserId } from '../services/xpService';

interface RewardsScreenProps {
  onNavigate: (screen: Screen) => void;
}

const MOCK_REWARDS: RewardItem[] = [
    { id: '1', title: 'Rare Trans-Red 2x4', cost: 5000, available: true, image: 'https://images.unsplash.com/photo-1585366447221-d552f9576f3d?auto=format&fit=crop&w=400&h=400' },
    { id: '2', title: 'Technic Gear Pack', cost: 2500, available: true, image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&w=400&h=400' },
    { id: '3', title: 'Custom Minifig Torso', cost: 1200, available: true, image: 'https://images.unsplash.com/photo-1594732832278-abd644401426?auto=format&fit=crop&w=400&h=400' },
    { id: '4', title: 'Golden Brick Keychain', cost: 10000, available: false, image: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?auto=format&fit=crop&w=400&h=400' },
];

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onNavigate }) => {
  const [userXP, setUserXP] = useState(0);
  const [rewards, setRewards] = useState<RewardItem[]>(MOCK_REWARDS);

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
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => onNavigate(Screen.QUESTS)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex flex-col items-center flex-1">
           <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">The Treasury</h1>
           <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-indigo-500">{userXP.toLocaleString()}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available XP</span>
           </div>
        </div>
        <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
           <Trophy className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-10 px-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-left">
            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3 italic">Vault Rewards</h2>
            <p className="text-slate-500 font-bold text-base leading-relaxed">Exchange your hard-earned experience for physical and digital assets.</p>
          </div>

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
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-10 h-10 text-white/50" />
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
                      className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${userXP >= reward.cost && reward.available
                          ? 'bg-white text-slate-950 shadow-xl active:scale-95 flex items-center justify-center gap-2'
                          : 'bg-white/5 text-slate-700 border border-white/5'
                        }`}
                    >
                      {reward.available ? (
                          <>Claim <ArrowRight className="w-3 h-3" /></>
                      ) : 'Empty'}
                    </button>
                  </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[32px] p-8 border border-white/5 text-center mt-6">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Inventory Restocked</p>
             <p className="text-sm font-bold text-slate-400 italic">"Patience is the foundation of high-level building."</p>
          </div>
        </div>
      </div>
    </div>
  );
};
