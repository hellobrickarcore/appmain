import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Crown, TrendingUp, Flame } from 'lucide-react';
import { Screen } from '../types';

interface LeaderboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

type CategoryId = 'total_value' | 'biggest_gainer' | 'rarest_collection' | 'most_retired';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarSeed: string;
  value: number;
  growth: number;
  rarityScore: number;
  retiredCount: number;
  streak: number;
  isCurrentUser?: boolean;
  badge?: string;
  legoIcon?: boolean;
}

const CATEGORIES = [
  { id: 'total_value', name: 'Total Value' },
  { id: 'biggest_gainer', name: 'Biggest Gainers' },
  { id: 'rarest_collection', name: 'Rarest' },
  { id: 'most_retired', name: 'Most Retired' },
];

const competitors: LeaderboardUser[] = [
  { rank: 1, name: 'BrickBaron87',     avatarSeed: 'BrickBaron87_1',   value: 18740, growth: 25.4, rarityScore: 98, retiredCount: 15, streak: 5, legoIcon: true },
  { rank: 2, name: 'Anonymous',        avatarSeed: 'Anonymous_2',      value: 12450, growth: 18.2, rarityScore: 94, retiredCount: 11, streak: 3, legoIcon: true },
  { rank: 3, name: 'Anonymous',        avatarSeed: 'Anonymous_3',      value: 10230, growth: 12.8, rarityScore: 89, retiredCount: 9,  streak: 8 },
  { rank: 4, name: 'Anonymous',        avatarSeed: 'Anonymous_4',      value: 9120,  growth: 9.8,  rarityScore: 86, retiredCount: 7,  streak: 2, badge: 'Biggest Gainer' },
  { rank: 5, name: 'BrickBaron87',     avatarSeed: 'BrickBaron87_5',   value: 8450,  growth: 12.0, rarityScore: 82, retiredCount: 6,  streak: 4 },
  { rank: 6, name: 'BaseplateBoss',    avatarSeed: 'BaseplateBoss_6',  value: 7120,  growth: 6.2,  rarityScore: 78, retiredCount: 5,  streak: 0 },
  { rank: 7, name: 'StudShooter',      avatarSeed: 'StudShooter_7',    value: 6890,  growth: 5.4,  rarityScore: 75, retiredCount: 4,  streak: 1 },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('total_value');
  const [displayName, setDisplayName] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('hellobrick_leaderboard_name') || '';
    setDisplayName(saved);
  }, []);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + (7 - now.getDay()));
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStat = (user: LeaderboardUser) => {
    switch (activeCategory) {
      case 'total_value':     return `$${user.value.toLocaleString()}`;
      case 'biggest_gainer':  return `+${user.growth.toFixed(1)}%`;
      case 'rarest_collection': return `${user.rarityScore}/100`;
      case 'most_retired':    return `${user.retiredCount} sets`;
    }
  };

  const sorted = [...competitors].sort((a, b) => {
    switch (activeCategory) {
      case 'total_value':       return b.value - a.value;
      case 'biggest_gainer':    return b.growth - a.growth;
      case 'rarest_collection': return b.rarityScore - a.rarityScore;
      case 'most_retired':      return b.retiredCount - a.retiredCount;
    }
  }).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div
      className="flex flex-col min-h-screen bg-[#131313] font-sans text-white relative overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="relative z-50 px-5 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-white tracking-tight">LEGO Value Kings</h1>
        <button className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition-transform">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="px-5 pb-4 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as CategoryId)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-black'
                  : 'bg-[#222] text-slate-400 border border-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-36 px-5 space-y-2.5">

          {sorted.map((user, idx) => (
            <div
              key={user.avatarSeed}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                user.isCurrentUser
                  ? 'bg-blue-600/10 border-blue-500/30'
                  : 'bg-[#1C1C1C] border-white/5'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.avatarSeed}`}
                  className="w-11 h-11 rounded-full object-cover bg-slate-700"
                  alt={user.name}
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Rank badge */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#131313] flex items-center justify-center text-[9px] font-black ${
                  user.rank === 1 ? 'bg-yellow-400 text-black' :
                  user.rank === 2 ? 'bg-slate-400 text-black' :
                  user.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-[#333] text-white'
                }`}>
                  {user.rank}
                </div>
              </div>

              {/* Name + sub */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm leading-none">{user.name}</span>
                  {user.streak > 4 && <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />}
                  {user.isCurrentUser && (
                    <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase">YOU</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {user.legoIcon && (
                    <div className="bg-red-600 rounded-md px-1.5 py-0.5">
                      <span className="text-white text-[8px] font-black tracking-wide">LEGO</span>
                    </div>
                  )}
                  {user.badge && (
                    <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-full px-2.5 py-0.5">
                      <span className="text-emerald-400 font-black text-[10px]">{user.badge}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stat */}
              <div className="text-right shrink-0">
                <span className={`font-mono font-black text-sm ${
                  activeCategory === 'biggest_gainer' ? 'text-emerald-400' :
                  activeCategory === 'total_value' ? 'text-white' :
                  'text-slate-300'
                }`}>
                  {getStat(user)}
                </span>
              </div>
            </div>
          ))}

          {/* Bottom tagline */}
          <div className="pt-4 pb-2 text-center">
            <p className="text-slate-400 text-sm font-medium">
              See how you rank among serious collectors.
            </p>
          </div>

          {/* Season countdown */}
          <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest">Season resets in</p>
              <p className="text-white font-black text-lg mt-0.5">
                {countdown.days}d {countdown.hours}h {countdown.mins}m
              </p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>

        </div>
      </div>
    </div>
  );
};
