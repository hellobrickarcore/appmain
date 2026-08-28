import React, { useState } from 'react';
import { Screen } from '../types';
import { ArrowLeft, Trophy, Medal, User, Eye, EyeOff, X, Sparkles, ShieldCheck, ChevronRight, Heart, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onNavigate: (screen: Screen, params?: any) => void;
}

type TabType = 'value' | 'xp' | 'weekly';

interface LeaderboardUser {
  id: string;
  name: string;
  avatarBg: string;
  value: number;
  xp: number;
  level: number;
  weeklyXp: number;
  setsCount: number;
  minifigsCount: number;
  cardsCount: number;
  grails: string[];
  bio: string;
  isCurrentUser?: boolean;
}

const MOCK_USERS: LeaderboardUser[] = [
  {
    id: '1',
    name: 'BrickMaster99',
    avatarBg: 'bg-amber-100 text-amber-800 border-amber-300',
    value: 15420,
    xp: 8500,
    level: 42,
    weeklyXp: 1200,
    setsCount: 52,
    minifigsCount: 38,
    cardsCount: 14,
    grails: ['Millennium Falcon UCS #75192-1', 'Mr. Gold #col160', '1st Edition Shadowless Charizard'],
    bio: 'UCS Star Wars & Vintage Minifigure collector since 2012. Building modular cities on weekends.'
  },
  {
    id: '2',
    name: 'LegoLegend',
    avatarBg: 'bg-slate-100 text-slate-800 border-slate-300',
    value: 12100,
    xp: 9200,
    level: 45,
    weeklyXp: 1500,
    setsCount: 44,
    minifigsCount: 29,
    cardsCount: 8,
    grails: ['Rivendell #10316-1', 'Cloud City Boba Fett #sw0107', 'Lion Knights Castle #10305-1'],
    bio: 'Middle-earth and Medieval Castle archivist. Passionate about MOC architectural techniques.'
  },
  {
    id: '3',
    name: 'StudShooter',
    avatarBg: 'bg-orange-100 text-orange-800 border-orange-300',
    value: 11050,
    xp: 7100,
    level: 38,
    weeklyXp: 950,
    setsCount: 39,
    minifigsCount: 22,
    cardsCount: 19,
    grails: ['Moonbreon Umbreon VMAX Alt Art', 'Imperial Star Destroyer #75252-1', 'Darth Revan #sw0547'],
    bio: 'TCG sealed investment vault & Star Wars Imperial armada curator.'
  },
  {
    id: '4',
    name: 'BlockBuilder',
    avatarBg: 'bg-blue-100 text-blue-800 border-blue-200',
    value: 9800,
    xp: 6400,
    level: 35,
    weeklyXp: 800,
    setsCount: 31,
    minifigsCount: 18,
    cardsCount: 5,
    grails: ['Daily Bugle #76178-1', 'Titanic #10294-1'],
    bio: 'Marvel superhero collector and modular skyscraper builder.'
  },
  {
    id: 'me',
    name: 'Akeem (YOU)',
    avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    value: 8750,
    xp: 5200,
    level: 29,
    weeklyXp: 600,
    setsCount: 24,
    minifigsCount: 12,
    cardsCount: 9,
    grails: ['Millennium Falcon UCS #75192-1', '1986 Fleer Michael Jordan #57', 'Gengar VMAX Alt Art'],
    bio: 'Collector, builder, and investor track record on HelloBrick.',
    isCurrentUser: true
  },
  {
    id: '6',
    name: 'NinjaGo_Fan',
    avatarBg: 'bg-red-100 text-red-800 border-red-200',
    value: 7500,
    xp: 4800,
    level: 27,
    weeklyXp: 550,
    setsCount: 28,
    minifigsCount: 34,
    cardsCount: 2,
    grails: ['Lloyd DX Dragon Suit #njo0108', 'Ninjago City Gardens #71741'],
    bio: 'Dedicated Spinjitzu master. Collecting every Ninjago ninja variant ever molded.'
  },
  {
    id: '7',
    name: 'TechnicTitan',
    avatarBg: 'bg-amber-100 text-amber-800 border-amber-200',
    value: 7100,
    xp: 5900,
    level: 32,
    weeklyXp: 400,
    setsCount: 16,
    minifigsCount: 4,
    cardsCount: 0,
    grails: ['Lamborghini Sián FKP 37 #42115', 'Ferrari Daytona SP3 #42143'],
    bio: '1:8 scale supercar mechanics & pneumatic engineering specialist.'
  },
  {
    id: '8',
    name: 'MinifigManiac',
    avatarBg: 'bg-purple-100 text-purple-800 border-purple-200',
    value: 6800,
    xp: 4100,
    level: 24,
    weeklyXp: 350,
    setsCount: 11,
    minifigsCount: 65,
    cardsCount: 12,
    grails: ['SDCC Spider-Man PS4 #sh530', 'Ahsoka Tano Rebels #sw0759'],
    bio: 'Specialist in rare Comic-Con exclusives & blind bag CMF series 1-26.'
  },
  {
    id: '9',
    name: 'CastleKing',
    avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    value: 6200,
    xp: 3800,
    level: 22,
    weeklyXp: 300,
    setsCount: 19,
    minifigsCount: 42,
    cardsCount: 1,
    grails: ['Medieval Blacksmith #21325', 'Black Falcon Outpost MOC'],
    bio: 'Black Falcons & Forestmen army builder. Keeping classic 80s castle alive.'
  },
  {
    id: '10',
    name: 'SpaceExplorer',
    avatarBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    value: 5400,
    xp: 3500,
    level: 20,
    weeklyXp: 250,
    setsCount: 15,
    minifigsCount: 20,
    cardsCount: 4,
    grails: ['Galaxy Explorer #10497', 'Classic Yellow Astronaut #sp007'],
    bio: 'Classic Space enthusiast. Benny is my hero.'
  }
];

export const LeaderboardScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('value');
  const [optedIn, setOptedIn] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  // Sort logic based on tab
  const sortedUsers = [...MOCK_USERS].sort((a, b) => {
    if (activeTab === 'value') return b.value - (a.value || 0);
    if (activeTab === 'xp') return b.xp - (a.xp || 0);
    return b.weeklyXp - (a.weeklyXp || 0);
  });

  const top3 = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  const formatValue = (user: LeaderboardUser) => {
    if (activeTab === 'value') return `$${user.value.toLocaleString()}`;
    if (activeTab === 'xp') return `${user.xp.toLocaleString()} XP`;
    return `${user.weeklyXp.toLocaleString()} XP`;
  };

  const handleFollowToggle = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFollowedMap(prev => {
      const nextState = !prev[userId];
      if (nextState) {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
      }
      return { ...prev, [userId]: nextState };
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 select-none overflow-hidden">
      
      {/* ─── Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 bg-white border-b border-gray-200/80 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(Screen.HOME)} 
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" /> 
                Leaderboard
              </h1>
              <p className="text-xs font-semibold text-gray-500">Global Collector Vault Rankings</p>
            </div>
          </div>

          <button 
            onClick={() => setOptedIn(!optedIn)}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              optedIn 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                : 'border-gray-300 bg-gray-100 text-gray-500'
            }`}
          >
            {optedIn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{optedIn ? 'Public' : 'Hidden'}</span>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mt-3.5 bg-gray-100 p-1 rounded-2xl flex items-center gap-1">
          {(['value', 'xp', 'weekly'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all capitalize cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'value' ? '💰 By Value' : tab === 'xp' ? '⭐ Total XP' : '🔥 Weekly'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      {!optedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-gray-500">
            <EyeOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You are currently hidden</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">Opt in to the global leaderboard to showcase your portfolio value and compare grails with other collectors.</p>
          <button 
            onClick={() => setOptedIn(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Join Global Leaderboard
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          
          {/* ─── Top 3 Podium (Apple Clean Glass Style) ─── */}
          <div className="px-5 pt-6 pb-2">
            <div className="bg-white rounded-[32px] p-5 border border-gray-200/80 shadow-sm">
              <div className="flex items-end justify-center gap-3">
                
                {/* 🥈 Silver (#2) */}
                <div 
                  onClick={() => setSelectedUser(top3[1])}
                  className="flex-1 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-slate-700 shadow-sm text-base">
                      {top3[1]?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-[10px] font-black px-2 py-0.2 rounded-full border border-white shadow-xs">
                      #2
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[80px] text-center mt-1">
                    {top3[1]?.name}
                  </p>
                  <p className="text-[11px] font-black text-emerald-600 mb-2">
                    {top3[1] && formatValue(top3[1])}
                  </p>
                  <div className="w-full h-20 bg-gradient-to-b from-slate-100 to-slate-200/80 rounded-t-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                    <span className="text-xl font-black text-slate-600">2</span>
                  </div>
                </div>

                {/* 🥇 Gold (#1) */}
                <div 
                  onClick={() => setSelectedUser(top3[0])}
                  className="flex-1 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform -mt-4 z-10"
                >
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full bg-amber-50 border-3 border-amber-400 flex items-center justify-center font-black text-amber-700 shadow-md text-lg">
                      {top3[0]?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -top-3 -right-1 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md">
                      <Medal className="w-4 h-4 fill-white" />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.2 rounded-full border border-white shadow-sm">
                      #1
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900 truncate max-w-[95px] text-center mt-1">
                    {top3[0]?.name}
                  </p>
                  <p className="text-xs font-black text-emerald-600 mb-2">
                    {top3[0] && formatValue(top3[0])}
                  </p>
                  <div className="w-full h-28 bg-gradient-to-b from-amber-100 to-amber-200/90 rounded-t-2xl border-2 border-amber-300 flex items-center justify-center shadow-inner">
                    <span className="text-2xl font-black text-amber-800">1</span>
                  </div>
                </div>

                {/* 🥉 Bronze (#3) */}
                <div 
                  onClick={() => setSelectedUser(top3[2])}
                  className="flex-1 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center font-black text-orange-800 shadow-sm text-base">
                      {top3[2]?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-950 text-[10px] font-black px-2 py-0.2 rounded-full border border-white shadow-xs">
                      #3
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[80px] text-center mt-1">
                    {top3[2]?.name}
                  </p>
                  <p className="text-[11px] font-black text-emerald-600 mb-2">
                    {top3[2] && formatValue(top3[2])}
                  </p>
                  <div className="w-full h-16 bg-gradient-to-b from-orange-100 to-orange-200/80 rounded-t-2xl border border-orange-200 flex items-center justify-center shadow-inner">
                    <span className="text-lg font-black text-orange-700">3</span>
                  </div>
                </div>

              </div>
              <p className="text-[11px] font-bold text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <span>Tap any collector to inspect their vault</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </p>
            </div>
          </div>

          {/* ─── Rest of the Leaderboard List (#4+) ─── */}
          <div className="px-5 space-y-2.5 mt-3">
            {rest.map((user, idx) => {
              const rank = idx + 4;
              const isUser = user.isCurrentUser;

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer hover:shadow-md active:scale-[0.99] ${
                    isUser
                      ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-sm'
                      : 'bg-white border-gray-200/80 shadow-xs'
                  }`}
                >
                  {/* Rank */}
                  <span className={`w-6 text-center font-black text-sm ${isUser ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {rank}
                  </span>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${user.avatarBg}`}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black text-sm truncate ${isUser ? 'text-emerald-900' : 'text-gray-900'}`}>
                        {user.name}
                      </span>
                      {isUser && (
                        <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                      Level {user.level} · {user.setsCount} Sets · {user.minifigsCount} Minifigs
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">{formatValue(user)}</p>
                    <p className="text-[10px] font-bold text-emerald-600">Top {(rank * 1.5).toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ─── Collector Profile Review Modal / Bottom Sheet ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-[36px] p-6 shadow-2xl border-t border-gray-100 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 ${selectedUser.avatarBg}`}>
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">{selectedUser.name}</h3>
                    {selectedUser.isCurrentUser && (
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Level {selectedUser.level} Collector · Authenticated Vault</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio */}
            <p className="text-xs font-medium text-gray-600 my-4 leading-relaxed bg-[#F5F5F7] p-3 rounded-2xl">
              "{selectedUser.bio}"
            </p>

            {/* Collector Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-[#F5F5F7] rounded-2xl p-3 text-center border border-gray-100">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Vault Value</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">${selectedUser.value.toLocaleString()}</p>
              </div>
              <div className="bg-[#F5F5F7] rounded-2xl p-3 text-center border border-gray-100">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Total Sets</p>
                <p className="text-base font-black text-gray-900 mt-0.5">{selectedUser.setsCount}</p>
              </div>
              <div className="bg-[#F5F5F7] rounded-2xl p-3 text-center border border-gray-100">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Minifigures</p>
                <p className="text-base font-black text-gray-900 mt-0.5">{selectedUser.minifigsCount}</p>
              </div>
            </div>

            {/* Featured Grails in Vault */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured Vault Grails
              </h4>
              <div className="space-y-2">
                {selectedUser.grails.map((grail, gIdx) => (
                  <div key={gIdx} className="bg-[#F5F5F7] rounded-xl p-2.5 flex items-center justify-between border border-gray-200/60">
                    <span className="text-xs font-bold text-gray-800 truncate mr-2">{grail}</span>
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                      Grail
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={(e) => handleFollowToggle(selectedUser.id, e)}
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  followedMap[selectedUser.id]
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                <Heart className="w-4 h-4" fill={followedMap[selectedUser.id] ? 'currentColor' : 'none'} />
                <span>{followedMap[selectedUser.id] ? 'Following Collector' : 'Follow Collector'}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  onNavigate(Screen.BROWSE);
                }}
                className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
