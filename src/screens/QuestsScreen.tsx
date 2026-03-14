import React, { useState, useEffect } from 'react';
import { Flame, ScanLine, Hammer, BrainCircuit, ChevronRight, Trophy, Gift, Search, Swords, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';
import { Screen, Quest } from '../types';
import { getUserXP, getUserId } from '../services/xpService';
import { getAvailableQuests } from '../services/gamificationService';

interface QuestsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({ onNavigate }) => {
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = getUserId();
        const xpData = await getUserXP(userId);
        setStreak(xpData.streak_count || 0);
        const availableQuests = getAvailableQuests();
        setQuests(availableQuests);
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-purple-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Quests</h1>
        <div className="flex items-center gap-2">
           <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-2xl flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black text-orange-500">{streak}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-8">
        {/* Quick Nav Hub */}
        <div className="px-6 flex gap-3 mb-10">
          <button
            onClick={() => onNavigate(Screen.LEADERBOARD)}
            className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
               <Trophy className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global</span>
          </button>
          <button
            onClick={() => onNavigate(Screen.REWARDS)}
            className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
               <Gift className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rewards</span>
          </button>
          <button
            onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
            className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
               <Swords className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Battle</span>
          </button>
        </div>

        <div className="px-6 space-y-6">
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-left">Active Challenges</h2>
           
           {loading ? (
             <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin" />
             </div>
           ) : (
             quests.map((quest, idx) => {
               const isWeekly = idx === 0;
               const isCompleted = quest.progress >= quest.total;
               
               return (
                 <div 
                   key={quest.id}
                   onClick={() => quest.actionScreen && onNavigate(quest.actionScreen)}
                   className={`relative rounded-[40px] border p-8 overflow-hidden transition-all ${isWeekly ? 'bg-gradient-to-br from-indigo-900 to-[#0A0F1E] border-indigo-500/30' : 'bg-white/5 border-white/5'} ${quest.actionScreen ? 'active:scale-[0.98] cursor-pointer' : ''}`}
                 >
                    {isWeekly && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />}
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isWeekly ? 'text-indigo-400' : 'text-slate-500'}`}>
                          {isWeekly ? 'Weekly League' : 'Daily Quest'}
                       </span>
                       <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                          <Sparkles className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-black text-white">{quest.reward || '50 XP'}</span>
                       </div>
                    </div>

                    <div className="flex gap-6 items-center relative z-10">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isWeekly ? 'bg-indigo-500/20 border-indigo-400/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                          {quest.id.includes('scan') ? <ScanLine className="w-7 h-7" /> : <BrainCircuit className="w-7 h-7" />}
                       </div>
                       <div className="flex-1 text-left">
                          <h3 className="text-xl font-black text-white leading-tight mb-1">{quest.title}</h3>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed">{quest.description}</p>
                       </div>
                    </div>

                    <div className="mt-8 relative z-10">
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{quest.progress} / {quest.total}</span>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{Math.round((quest.progress / quest.total) * 100)}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isWeekly ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/20'}`} 
                            style={{ width: `${Math.min(100, (quest.progress / quest.total) * 100)}%` }}
                          />
                       </div>
                    </div>

                    {isCompleted && (
                       <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
                             Claim Reward
                          </div>
                       </div>
                    )}
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
};
