import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Crown, 
  Star, 
  TrendingUp, 
  Award, 
  Shield, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  User, 
  Check, 
  Flame,
  Search,
  Zap,
  Info
} from 'lucide-react';
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
}

const CATEGORIES = [
  { id: 'total_value', name: 'Total Value', icon: '💰' },
  { id: 'biggest_gainer', name: 'Biggest Gainers', icon: '📈' },
  { id: 'rarest_collection', name: 'Rarest Collections', icon: '💎' },
  { id: 'most_retired', name: 'Most Retired Sets', icon: '🧱' }
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('total_value');
  const [isPublic, setIsPublic] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  // Competitor data
  const competitors: LeaderboardUser[] = [
    { rank: 1, name: "BrickBaron87", avatarSeed: "BrickBaron", value: 18740, growth: 25.4, rarityScore: 98, retiredCount: 15, streak: 5 },
    { rank: 2, name: "ModularMaster42", avatarSeed: "ModularMaster", value: 12450, growth: 18.2, rarityScore: 94, retiredCount: 11, streak: 3 },
    { rank: 3, name: "MiniFigureFanatic", avatarSeed: "MiniFigure", value: 10230, growth: 12.8, rarityScore: 89, retiredCount: 9, streak: 8 },
    { rank: 4, name: "LEGO_Lord_Vader", avatarSeed: "LordVader", value: 9120, growth: 9.8, rarityScore: 86, retiredCount: 7, streak: 2 },
    { rank: 5, name: "BrickQueen99", avatarSeed: "BrickQueen", value: 8450, growth: 8.5, rarityScore: 82, retiredCount: 6, streak: 4 },
    { rank: 6, name: "BaseplateBoss", avatarSeed: "Baseplate", value: 7120, growth: 6.2, rarityScore: 78, retiredCount: 5, streak: 0 },
    { rank: 7, name: "StudShooter", avatarSeed: "StudShooter", value: 6890, growth: 5.4, rarityScore: 75, retiredCount: 4, streak: 1 },
    { rank: 8, name: "MOC_Master", avatarSeed: "MocMaster", value: 5400, growth: 4.8, rarityScore: 70, retiredCount: 3, streak: 3 },
  ];

  // Set default display name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('hellobrick_leaderboard_name') || 'LelloBrick';
    setDisplayName(savedName);
    const savedPublic = localStorage.getItem('hellobrick_leaderboard_public') !== 'false';
    setIsPublic(savedPublic);
  }, []);

  // Set Season Countdown
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay())); // next Sunday
      endOfWeek.setHours(23, 59, 59, 999);
      
      const diff = endOfWeek.getTime() - now.getTime();
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

  const handleSaveSettings = () => {
    localStorage.setItem('hellobrick_leaderboard_name', displayName);
    localStorage.setItem('hellobrick_leaderboard_public', String(isPublic));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Get current user entry
  const currentUserEntry: LeaderboardUser = {
    rank: 4, // Seeded rank
    name: isPublic ? displayName : "Secret Collector",
    avatarSeed: "LelloBrick",
    value: 9540,
    growth: 14.5,
    rarityScore: 88,
    retiredCount: 8,
    streak: 6,
    isCurrentUser: true
  };

  // Construct full list and sort based on active category
  const getSortedLeaderboard = (): LeaderboardUser[] => {
    const list = [...competitors];
    
    // Add current user to the list
    list.push(currentUserEntry);

    // Sort accordingly
    switch (activeCategory) {
      case 'total_value':
        list.sort((a, b) => b.value - a.value);
        break;
      case 'biggest_gainer':
        list.sort((a, b) => b.growth - a.growth);
        break;
      case 'rarest_collection':
        list.sort((a, b) => b.rarityScore - a.rarityScore);
        break;
      case 'most_retired':
        list.sort((a, b) => b.retiredCount - a.retiredCount);
        break;
    }

    // Re-rank
    return list.map((user, idx) => ({
      ...user,
      rank: idx + 1
    }));
  };

  const sortedList = getSortedLeaderboard();
  const topThree = sortedList.slice(0, 3);
  const remainingUsers = sortedList.slice(3);

  // Format Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const renderStat = (user: LeaderboardUser) => {
    switch (activeCategory) {
      case 'total_value':
        return (
          <div className="text-right">
            <span className="font-mono text-sm font-black text-[#C9A84C]">{formatCurrency(user.value)}</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">Value</span>
          </div>
        );
      case 'biggest_gainer':
        return (
          <div className="text-right">
            <span className="font-mono text-sm font-black text-emerald-400">+{user.growth.toFixed(1)}%</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">Appreciation</span>
          </div>
        );
      case 'rarest_collection':
        return (
          <div className="text-right">
            <span className="font-mono text-sm font-black text-blue-400">{user.rarityScore}/100</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">Rarity Index</span>
          </div>
        );
      case 'most_retired':
        return (
          <div className="text-right">
            <span className="font-mono text-sm font-black text-amber-500">{user.retiredCount} sets</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">Retired Owned</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* Background radial spotlight glows */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#C9A84C]/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-5 flex items-center justify-between bg-[#0D111A]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-[#C9A84C] tracking-widest uppercase flex items-center gap-1.5 justify-center">
            <Crown className="w-4 h-4 text-[#C9A84C]" />
            Value Kings
          </h1>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">Global Collector Standings</span>
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 opacity-0 pointer-events-none" />
      </div>

      {/* Main scrollable body viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain no-scrollbar pb-36">
          
          {/* Active Category Filter Tabs Carousel */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-r select-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CategoryId)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-black tracking-wide whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A] border-transparent shadow-lg shadow-[#C9A84C]/10 scale-102'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="px-6 pt-6 pb-8 flex items-end justify-center gap-4 relative">
            
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="flex flex-col items-center gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-800 border-2 border-slate-400/40 overflow-hidden shadow-2xl relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${topThree[1].avatarSeed}`} 
                      className="w-full h-full object-cover p-1.5" 
                      alt={topThree[1].name} 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-400 text-slate-950 font-mono font-black text-[10px] w-6 h-6 rounded-full border-2 border-[#0D111A] flex items-center justify-center shadow-lg">2</div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white truncate max-w-[80px]">@{topThree[1].name}</p>
                  <p className="font-mono text-[8px] font-black text-slate-500 tracking-wider uppercase mt-0.5">
                    {activeCategory === 'total_value' && formatCurrency(topThree[1].value)}
                    {activeCategory === 'biggest_gainer' && `+${topThree[1].growth}%`}
                    {activeCategory === 'rarest_collection' && `${topThree[1].rarityScore}/100`}
                    {activeCategory === 'most_retired' && `${topThree[1].retiredCount} Sets`}
                  </p>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold Crown) */}
            {topThree[0] && (
              <div className="flex flex-col items-center gap-4 relative animate-in fade-in zoom-in duration-500">
                <div className="absolute -inset-8 bg-[#C9A84C]/5 blur-[35px] rounded-full animate-pulse pointer-events-none" />
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <Crown className="w-8 h-8 text-[#C9A84C] fill-[#C9A84C] drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
                  </div>
                  <div className="w-24 h-24 rounded-[32px] bg-slate-800 border-4 border-[#C9A84C]/50 overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.15)] relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${topThree[0].avatarSeed}`} 
                      className="w-full h-full object-cover p-2.5" 
                      alt={topThree[0].name} 
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A] font-mono font-black text-xs w-8 h-8 rounded-full border-4 border-[#0D111A] flex items-center justify-center shadow-lg">1</div>
                </div>
                <div className="text-center pb-2">
                  <p className="text-xs font-black text-white flex items-center gap-1 justify-center">
                    @{topThree[0].name}
                    {topThree[0].streak > 4 && <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />}
                  </p>
                  <p className="font-mono text-[9px] font-black text-[#C9A84C] tracking-wider uppercase mt-1">
                    {activeCategory === 'total_value' && formatCurrency(topThree[0].value)}
                    {activeCategory === 'biggest_gainer' && `+${topThree[0].growth}%`}
                    {activeCategory === 'rarest_collection' && `${topThree[0].rarityScore}/100`}
                    {activeCategory === 'most_retired' && `${topThree[0].retiredCount} Sets`}
                  </p>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div className="flex flex-col items-center gap-3 mb-1.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <div className="w-14 h-14 rounded-[20px] bg-slate-800 border-2 border-amber-600/40 overflow-hidden shadow-2xl relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${topThree[2].avatarSeed}`} 
                      className="w-full h-full object-cover p-1.5" 
                      alt={topThree[2].name} 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white font-mono font-black text-[9px] w-5 h-5 rounded-full border-2 border-[#0D111A] flex items-center justify-center shadow-lg">3</div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white truncate max-w-[80px]">@{topThree[2].name}</p>
                  <p className="font-mono text-[8px] font-black text-slate-500 tracking-wider uppercase mt-0.5">
                    {activeCategory === 'total_value' && formatCurrency(topThree[2].value)}
                    {activeCategory === 'biggest_gainer' && `+${topThree[2].growth}%`}
                    {activeCategory === 'rarest_collection' && `${topThree[2].rarityScore}/100`}
                    {activeCategory === 'most_retired' && `${topThree[2].retiredCount} Sets`}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Active Season Countdown HUD */}
          <div className="px-6 mb-6">
            <div className="bg-[#161B26] border border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[#C9A84C]/10 rounded-2xl flex items-center justify-center text-[#C9A84C]">
                  <Clock className="w-5.5 h-5.5" />
                </div>
                <div className="text-left">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">ROTATION TIMEOUT</span>
                  <span className="text-base font-black text-white mt-0.5 block leading-none">
                    {countdown.days}d {countdown.hours}h {countdown.mins}m
                  </span>
                </div>
              </div>
              <div className="bg-[#C9A84C]/15 border border-[#C9A84C]/35 px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md">
                <Star className="w-3.5 h-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                <span className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">Active Season</span>
              </div>
            </div>
          </div>

          {/* Remaining Ranks List */}
          <div className="px-6 space-y-3">
            {remainingUsers.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-5 rounded-[28px] border transition-all ${
                  user.isCurrentUser 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                    : 'bg-[#161B26]/85 border-white/5'
                }`}
              >
                {/* Position Rank */}
                <div className={`w-8 font-mono font-black text-xs ${user.isCurrentUser ? 'text-blue-400' : 'text-slate-600'}`}>
                  #{user.rank}
                </div>

                {/* Avatar frame */}
                <div className={`w-12 h-12 rounded-[18px] overflow-hidden bg-slate-800 border ${user.isCurrentUser ? 'border-blue-500/40' : 'border-white/10'}`}>
                  <img 
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed}`} 
                    className="w-full h-full object-cover p-1" 
                    alt={user.name} 
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-black text-sm text-white capitalize flex items-center gap-1.5 truncate">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="text-[7px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">YOU</span>
                    )}
                    {user.streak > 4 && (
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">
                      Rarity Score: {user.rarityScore}
                    </span>
                  </div>
                </div>

                {/* Computed metric block */}
                {renderStat(user)}

              </div>
            ))}
          </div>

          {/* Privacy & Opt-in settings panel at the bottom */}
          <div className="px-6 mt-8">
            <div className="bg-[#161B26] border border-white/5 rounded-3xl p-5 shadow-xl text-left relative overflow-hidden">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9A84C]" />
                Leaderboard Standings Panel
              </h3>
              <p className="text-slate-400 font-semibold text-xs mt-1.5 leading-snug">
                Configure your public collector profile display details and opt-in settings below.
              </p>

              <div className="space-y-4 mt-5 pt-4 border-t border-white/5">
                {/* Privacy toggle */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200">Appear on public leaderboard</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Allows serious collectors to see your ranking position</span>
                  </div>
                  <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className="text-[#C9A84C] active:scale-90 transition-transform"
                  >
                    {isPublic ? (
                      <ToggleRight className="w-10 h-10 text-[#C9A84C]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Display Name Input */}
                <div>
                  <span className="text-xs font-bold text-slate-200 block mb-2">Display Name</span>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#0D111A] border border-white/5 rounded-2xl px-4 py-3.5 flex items-center gap-2.5 focus-within:border-[#C9A84C]/50 transition-colors">
                      <span className="text-slate-500 font-bold text-sm">@</span>
                      <input 
                        type="text" 
                        value={displayName} 
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setIsSaved(false);
                        }}
                        placeholder="Choose Brick Name" 
                        className="bg-transparent border-none outline-none text-white text-sm font-bold w-full"
                      />
                    </div>
                    <button 
                      onClick={handleSaveSettings}
                      className="px-5 bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A] font-black rounded-2xl text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 mt-2">
                  <Info className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-[9px] text-slate-400 font-semibold leading-normal">
                    Leaderboard settings are instantly synced with your local vault database collections. We anonymize your email and account key to maintain privacy.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
