import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Medal, Clock, Crown, Star } from 'lucide-react';
import { Screen, LeaderboardEntry } from '../types';
import { CONFIG } from '../services/configService';

interface LeaderboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  // Competition period (Monthly)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({ days, hours, mins });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${CONFIG.XP_LEADERBOARD}?limit=20`);
        const data = await response.json();
        if (data.success) {
          const entries: LeaderboardEntry[] = data.leaderboard.map((item: any) => ({
            rank: item.rank,
            name: item.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`,
            xp: item.xp_total,
            isCurrentUser: false // In a real app, compare with current user ID
          }));
          setLeaderboard(entries);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-8 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-sm font-black text-white">LEADERBOARD</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Top 3 Podium Area */}
        <div className="px-6 pt-10 pb-12 flex items-end justify-center gap-4">
           {/* Rank 2 */}
           {topThree[1] && (
             <div className="flex flex-col items-center gap-3 mb-4">
                <div className="relative">
                   <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-400/30 overflow-hidden shadow-2xl">
                      <img src={topThree[1].avatar} className="w-full h-full object-cover" alt={topThree[1].name} />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-slate-400 text-slate-950 font-black text-[10px] w-6 h-6 rounded-full border-2 border-[#050A18] flex items-center justify-center">2</div>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-white truncate max-w-[80px]">@{topThree[1].name.split(' ')[0]}</p>
                   <p className="text-[9px] font-black text-slate-500 uppercase">{topThree[1].xp.toLocaleString()} XP</p>
                </div>
             </div>
           )}

           {/* Rank 1 */}
           {topThree[0] && (
             <div className="flex flex-col items-center gap-4">
                <div className="relative">
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                      <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                   </div>
                   <div className="w-24 h-24 rounded-3xl bg-slate-800 border-4 border-yellow-400/50 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                      <img src={topThree[0].avatar} className="w-full h-full object-cover" alt={topThree[0].name} />
                   </div>
                   <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-yellow-950 font-black text-xs w-8 h-8 rounded-full border-4 border-[#050A18] flex items-center justify-center">1</div>
                </div>
                <div className="text-center pb-2">
                   <p className="text-sm font-black text-white">@{topThree[0].name.split(' ')[0]}</p>
                   <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{topThree[0].xp.toLocaleString()} XP</p>
                </div>
             </div>
           )}

           {/* Rank 3 */}
           {topThree[2] && (
             <div className="flex flex-col items-center gap-3 mb-2">
                <div className="relative">
                   <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-orange-400/30 overflow-hidden shadow-2xl">
                      <img src={topThree[2].avatar} className="w-full h-full object-cover" alt={topThree[2].name} />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-orange-400 text-orange-950 font-black text-[10px] w-5 h-5 rounded-full border-2 border-[#050A18] flex items-center justify-center">3</div>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-white truncate max-w-[80px]">@{topThree[2].name.split(' ')[0]}</p>
                   <p className="text-[9px] font-black text-slate-500 uppercase">{topThree[2].xp.toLocaleString()} XP</p>
                </div>
             </div>
           )}
        </div>

        {/* Competition Countdown Hud */}
        <div className="px-6 mb-8">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Clock className="w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Season Ends In</p>
                    <p className="text-lg font-black text-white">{countdown.days}d {countdown.hours}h {countdown.mins}m</p>
                 </div>
              </div>
              <div className="bg-orange-500/10 px-4 py-2 rounded-2xl border border-orange-500/20">
                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Cup</span>
              </div>
           </div>
        </div>

        {/* Full Ranks */}
        <div className="px-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing Global Scores...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20">
               <p className="text-slate-500 font-bold">No competitors yet. Be the first!</p>
            </div>
          ) : (
            remaining.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-5 rounded-[28px] border transition-all ${user.isCurrentUser ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-80'}`}
              >
                <div className="w-8 font-black text-slate-600 text-xs">
                   #{user.rank}
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/10 overflow-hidden">
                   <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                </div>

                <div className="flex-1 text-left">
                  <h3 className="font-black text-sm text-white capitalize">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lvl {Math.floor(user.xp / 1000) || 1}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-white text-base leading-none">{user.xp.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">XP</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const RefreshCw: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
