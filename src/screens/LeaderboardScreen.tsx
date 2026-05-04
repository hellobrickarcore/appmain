import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Crown, Star, Flame, Trophy, Award, Shield } from 'lucide-react';
import { Screen, LeaderboardEntry } from '../types';
import { CONFIG } from '../services/configService';
import { getUserId, getUserXP } from '../services/xpService';

interface LeaderboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

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
        const userId = getUserId();
        const profileName = localStorage.getItem('hellobrick_profile_name') || 'Builder';
        
        let entries: LeaderboardEntry[] = [];
        
        try {
          const response = await fetch(`${CONFIG.XP_LEADERBOARD}?limit=50`);
          const data = await response.json();
          
          if (data.success && data.leaderboard?.length > 0) {
            entries = data.leaderboard.map((item: any) => ({
              rank: item.rank,
              name: item.name,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`,
              xp: item.xp_total,
              isCurrentUser: item.user_id === userId,
              streak: item.streak_count || 0
            }));
          }
        } catch (apiErr) {
          console.warn('[Leaderboard] API fetch failed, using local data:', apiErr);
        }

        // --- FAKE COMPETITOR SEEDING ---
        if (entries.length < 20) {
          const fakeNames = ["MasterBuilder", "BrickNinja", "AFOL_Dave", "LegoMom", "CreativeBlocks", "CityBuilder", "TechnicFan", "PieceFinder", "MOC_Master", "BlockHead", "StudShooter", "PlasticArchitect", "BrickWhisperer", "MinifigKing", "BaseplateBoss"];
          const numToAdd = 20 - entries.length;
          
          for (let i = 0; i < numToAdd; i++) {
            const randomName = fakeNames[i % fakeNames.length] + Math.floor(Math.random() * 99);
            // Bias XP towards 500-15000 range
            const randomXP = Math.floor(Math.pow(Math.random(), 2) * 14500) + 500; 
            
            entries.push({
              rank: 0,
              name: randomName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`,
              xp: randomXP,
              isCurrentUser: false,
              streak: Math.floor(Math.random() * 10)
            });
          }
        }
        // -------------------------------

        // Always ensure the current user appears on the leaderboard
        const myXp = await getUserXP(userId).catch(() => ({ xp_total: 0, streak_count: 0 }));
        const meInList = entries.find(e => e.isCurrentUser);

        if (!meInList) {
          const myEntry: LeaderboardEntry = {
            rank: entries.length + 1,
            name: profileName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            xp: (myXp as any).xp_total || 0,
            isCurrentUser: true,
            streak: (myXp as any).streak_count || 0
          };
          entries.push(myEntry);
          // Re-sort and re-rank by XP
          entries.sort((a, b) => b.xp - a.xp);
          entries.forEach((e, i) => e.rank = i + 1);
        }

        setLeaderboard(entries);
        setCurrentUserRank(entries.find(e => e.isCurrentUser) || null);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getLeague = (xp: number) => {
    if (xp >= 10000) return { name: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' };
    if (xp >= 5000) return { name: 'Platinum', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
    if (xp >= 2000) return { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (xp >= 500) return { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20' };
    return { name: 'Bronze', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  };

  // Progressive level calc (same formula as ProfileScreen)
  const getLevel = (xp: number) => {
    const thresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 15000, 20000, 30000, 50000];
    let lvl = 1;
    for (let i = 1; i < thresholds.length; i++) {
      if (xp >= thresholds[i]) lvl = i + 1;
    }
    return lvl;
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // Group by League for visual separators
  const renderedItems: any[] = [];
  let currentLeagueName = '';

  remaining.forEach((user) => {
    const league = getLeague(user.xp);
    if (league.name !== currentLeagueName) {
      renderedItems.push({ type: 'separator', league: league });
      currentLeagueName = league.name;
    }
    renderedItems.push({ type: 'user', ...user });
  });

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
        <h1 className="text-sm font-black text-white tracking-widest uppercase">Global Ranks</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-48">
        {/* Top 3 Podium Area */}
        <div className="px-6 pt-10 pb-12 flex items-end justify-center gap-4 relative">
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
             <div className="flex flex-col items-center gap-4 relative">
                <div className="absolute -inset-8 bg-blue-500/10 blur-[40px] rounded-full animate-pulse pointer-events-none" />
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

        {/* Full Ranks with League Separators */}
        <div className="px-6 space-y-4">
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
            renderedItems.map((item, i) => {
              if (item.type === 'separator') {
                return (
                  <div key={`sep-${i}`} className="pt-4 pb-2 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/5" />
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${item.league.color} ${item.league.bg} ${item.league.border} shadow-lg shadow-black/20 animate-in fade-in zoom-in duration-500`}>
                      {item.league.name === 'Diamond' && <Crown className="w-3.5 h-3.5 fill-current" />}
                      {item.league.name === 'Platinum' && <Trophy className="w-3.5 h-3.5 fill-current" />}
                      {item.league.name === 'Gold' && <Award className="w-3.5 h-3.5" />}
                      {item.league.name === 'Silver' && <Shield className="w-3.5 h-3.5" />}
                      {item.league.name === 'Bronze' && <Star className="w-3.5 h-3.5 fill-current" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {item.league.name} League
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                );
              }
              
              const user = item as LeaderboardEntry & { streak?: number };
              return (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-5 rounded-[28px] border transition-all ${user.isCurrentUser ? 'bg-blue-600/15 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5'}`}
                >
                  <div className="w-8 font-black text-slate-600 text-xs">
                     #{user.rank}
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/10 overflow-hidden">
                     <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-black text-sm text-white capitalize flex items-center gap-2">
                      {user.name}
                      {user.streak && user.streak > 2 && (
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lvl {getLevel(user.xp)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-white text-base leading-none">{user.xp.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">XP</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STICKY CURRENT USER FOOTER */}
      {currentUserRank && !leaderboard.slice(0, 50).some(e => e.isCurrentUser) && (
        <div className="absolute bottom-24 left-0 right-0 px-6 pb-4">
          <div className="bg-blue-600/20 backdrop-blur-2xl border border-blue-500/40 p-5 rounded-[32px] flex items-center gap-4 shadow-2xl">
             <div className="w-8 font-black text-blue-400 text-xs whitespace-nowrap">
               #{currentUserRank.rank || '??'}
             </div>
             <div className="w-12 h-12 rounded-2xl bg-blue-900/50 border border-blue-400/30 overflow-hidden">
                <img src={currentUserRank.avatar} className="w-full h-full object-cover" alt={currentUserRank.name} />
             </div>
             <div className="flex-1 text-left">
               <h3 className="font-black text-sm text-white">You</h3>
               <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Keep scanning to rank up!</p>
             </div>
             <div className="text-right">
               <p className="font-black text-white text-base leading-none">{currentUserRank.xp.toLocaleString()}</p>
               <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-1">XP</p>
             </div>
          </div>
        </div>
      )}
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
