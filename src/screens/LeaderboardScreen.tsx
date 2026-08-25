import React, { useState } from 'react';
import { Screen } from '../types';
import { ArrowLeft, Trophy, Medal, User, Eye, EyeOff } from 'lucide-react';

interface Props {
  onNavigate: (screen: Screen, params?: any) => void;
}

type TabType = 'value' | 'xp' | 'weekly';

const MOCK_USERS = [
  { id: '1', name: 'BrickMaster99', value: 15420, xp: 8500, level: 42, weeklyXp: 1200 },
  { id: '2', name: 'LegoLegend', value: 12100, xp: 9200, level: 45, weeklyXp: 1500 },
  { id: '3', name: 'StudShooter', value: 11050, xp: 7100, level: 38, weeklyXp: 950 },
  { id: '4', name: 'BlockBuilder', value: 9800, xp: 6400, level: 35, weeklyXp: 800 },
  { id: 'me', name: 'Akeem (YOU)', value: 8750, xp: 5200, level: 29, weeklyXp: 600, isCurrentUser: true },
  { id: '6', name: 'NinjaGo_Fan', value: 7500, xp: 4800, level: 27, weeklyXp: 550 },
  { id: '7', name: 'TechnicTitan', value: 7100, xp: 5900, level: 32, weeklyXp: 400 },
  { id: '8', name: 'MinifigManiac', value: 6800, xp: 4100, level: 24, weeklyXp: 350 },
  { id: '9', name: 'CastleKing', value: 6200, xp: 3800, level: 22, weeklyXp: 300 },
  { id: '10', name: 'SpaceExplorer', value: 5400, xp: 3500, level: 20, weeklyXp: 250 },
  { id: '11', name: 'PirateCaptain', value: 4900, xp: 2900, level: 18, weeklyXp: 200 },
  { id: '12', name: 'CityMayor', value: 4100, xp: 2500, level: 15, weeklyXp: 150 },
  { id: '13', name: 'CreatorPro', value: 3500, xp: 2100, level: 12, weeklyXp: 100 },
  { id: '14', name: 'BionicleBro', value: 2800, xp: 1800, level: 10, weeklyXp: 80 },
  { id: '15', name: 'NerdBricks', value: 1500, xp: 900, level: 5, weeklyXp: 50 },
];

export const LeaderboardScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('value');
  const [optedIn, setOptedIn] = useState(true);

  // Sort logic based on tab
  const sortedUsers = [...MOCK_USERS].sort((a, b) => {
    if (activeTab === 'value') return b.value - (a.value || 0);
    if (activeTab === 'xp') return b.xp - (a.xp || 0);
    return b.weeklyXp - (a.weeklyXp || 0);
  });

  const top3 = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  const formatValue = (user: any) => {
    if (activeTab === 'value') return `$${user.value.toLocaleString()}`;
    if (activeTab === 'xp') return `${user.xp.toLocaleString()} XP`;
    return `${user.weeklyXp.toLocaleString()} XP`;
  };

  const getPodiumColor = (index: number) => {
    if (index === 0) return 'from-[#FFD700] to-[#DAA520] text-yellow-900 border-[#FFD700] shadow-[#FFD700]/20';
    if (index === 1) return 'from-[#E0E0E0] to-[#B0C4DE] text-slate-800 border-[#E0E0E0] shadow-[#E0E0E0]/20';
    return 'from-[#CD7F32] to-[#A0522D] text-orange-950 border-[#CD7F32] shadow-[#CD7F32]/20';
  };

  const getPodiumHeight = (index: number) => {
    if (index === 0) return 'h-32';
    if (index === 1) return 'h-24';
    return 'h-20';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),6rem)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(Screen.Home)} className="p-2 -ml-2 rounded-full hover:bg-gray-50/50">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD600]" /> Leaderboard
          </h1>
        </div>
        <button 
          onClick={() => setOptedIn(!optedIn)}
          className={`p-2 rounded-full border transition-colors ${optedIn ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-gray-300 text-gray-400 bg-gray-50'}`}
          title="Privacy Toggle"
        >
          {optedIn ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {!optedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <EyeOff className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">You are opted out</h2>
          <p className="text-gray-500 mb-6">Opt in to the leaderboard to compare your collection and progress with other builders.</p>
          <button 
            onClick={() => setOptedIn(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-blue-600 text-gray-900 rounded-xl font-semibold transition-colors"
          >
            Join Leaderboard
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="px-4 py-4">
            <div className="flex bg-white rounded-xl p-1 border border-gray-200">
              {(['value', 'xp', 'weekly'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-gray-50 text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'value' ? 'By Value' : tab === 'xp' ? 'Total XP' : 'Weekly'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            {/* Podium */}
            <div className="flex items-end justify-center gap-2 px-4 py-8 mb-4">
              {/* Silver (Rank 2) */}
              <div className="flex flex-col items-center flex-1 max-w-[100px]">
                <div className="w-12 h-12 bg-gray-50 rounded-full border-2 border-[#E0E0E0] mb-2 flex items-center justify-center relative overflow-hidden">
                   <User className="w-6 h-6 text-gray-500" />
                   <div className="absolute -bottom-1 w-full bg-[#E0E0E0] text-center text-[10px] font-bold text-slate-900">#2</div>
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1 truncate w-full text-center">{top3[1]?.name}</div>
                <div className="text-xs font-bold text-emerald-400 mb-2">{top3[1] && formatValue(top3[1])}</div>
                <div className={`w-full rounded-t-lg bg-gradient-to-b ${getPodiumColor(1)} ${getPodiumHeight(1)} flex justify-center pt-2 shadow-lg`}>
                   <span className="font-bold text-lg">2</span>
                </div>
              </div>

              {/* Gold (Rank 1) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px] -mt-8 z-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full border-2 border-[#FFD700] mb-2 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                   <User className="w-8 h-8 text-gray-500" />
                   <div className="absolute -bottom-1 w-full bg-[#FFD700] text-center text-xs font-bold text-yellow-900">#1</div>
                   <Medal className="absolute -top-3 -right-3 w-8 h-8 text-[#FFD700]" />
                </div>
                <div className="text-sm font-bold text-[#FFD600] mb-1 truncate w-full text-center">{top3[0]?.name}</div>
                <div className="text-xs font-bold text-emerald-400 mb-2">{top3[0] && formatValue(top3[0])}</div>
                <div className={`w-full rounded-t-lg bg-gradient-to-b ${getPodiumColor(0)} ${getPodiumHeight(0)} flex justify-center pt-2 shadow-lg`}>
                   <span className="font-bold text-2xl">1</span>
                </div>
              </div>

              {/* Bronze (Rank 3) */}
              <div className="flex flex-col items-center flex-1 max-w-[100px]">
                <div className="w-12 h-12 bg-gray-50 rounded-full border-2 border-[#CD7F32] mb-2 flex items-center justify-center relative overflow-hidden">
                   <User className="w-6 h-6 text-gray-500" />
                   <div className="absolute -bottom-1 w-full bg-[#CD7F32] text-center text-[10px] font-bold text-orange-950">#3</div>
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1 truncate w-full text-center">{top3[2]?.name}</div>
                <div className="text-xs font-bold text-emerald-400 mb-2">{top3[2] && formatValue(top3[2])}</div>
                <div className={`w-full rounded-t-lg bg-gradient-to-b ${getPodiumColor(2)} ${getPodiumHeight(2)} flex justify-center pt-2 shadow-lg`}>
                   <span className="font-bold text-lg">3</span>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="px-4 space-y-2">
              {rest.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${user.isCurrentUser ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-gray-500 border-gray-200/50'}`}
                >
                  <div className="w-6 text-center font-bold text-gray-400">
                    {index + 4}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold truncate ${user.isCurrentUser ? 'text-emerald-500' : 'text-gray-800'}`}>
                        {user.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-300 whitespace-nowrap">
                        Lvl {user.level}
                      </span>
                    </div>
                  </div>
                  <div className={`font-bold text-right ${activeTab === 'value' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {formatValue(user)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
