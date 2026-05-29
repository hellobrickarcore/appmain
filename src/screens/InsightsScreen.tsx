import React, { useState } from 'react';
import { TrendingUp, Trophy, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react';
import { Screen } from '../types';

interface InsightsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'leaderboard'>('insights');

  // Dummy Leaderboard Data
  const leaderboard = [
    { rank: 1, name: 'BrickMaster99', value: 45200, growth: 12.4 },
    { rank: 2, name: 'LegoInvestor_X', value: 38450, growth: 8.2 },
    { rank: 3, name: 'CollectorDan', value: 32100, growth: 15.1 },
    { rank: 4, name: 'You', value: 18740, growth: 4.2 },
    { rank: 5, name: 'StudShooter', value: 15400, growth: 2.1 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans text-white pb-24 overflow-y-auto">
      <div className="pt-[max(env(safe-area-inset-top),3rem)] px-6 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Market Insights</h1>

        {/* Custom Tabs */}
        <div className="bg-[#1A1A1A] rounded-full p-1 flex mb-8 border border-white/5">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 rounded-full text-sm font-semibold transition-colors ${activeTab === 'insights' ? 'bg-[#2A2A2A] text-white shadow-md' : 'text-zinc-500'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 rounded-full text-sm font-semibold transition-colors ${activeTab === 'leaderboard' ? 'bg-[#2A2A2A] text-white shadow-md' : 'text-zinc-500'}`}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'insights' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Trend Card */}
            <div className="bg-[#1A1A1A] p-6 rounded-[24px] border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold">Portfolio Trend</h2>
              </div>
              <p className="text-3xl font-bold mb-1">+4.2%</p>
              <p className="text-sm text-zinc-400">Your collection is outperforming the market average by 1.2% this month.</p>
            </div>

            {/* Retiring Soon */}
            <div className="bg-[#1A1A1A] p-6 rounded-[24px] border border-white/5">
              <h2 className="text-lg font-semibold mb-4">Retiring Soon Alerts</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <p className="font-semibold">Bookshop #10270</p>
                    <p className="text-sm text-rose-400">Retiring Dec 2026</p>
                  </div>
                  <span className="text-emerald-400 font-medium">+15% Proj.</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Assembly Square #10255</p>
                    <p className="text-sm text-rose-400">Retiring Dec 2026</p>
                  </div>
                  <span className="text-emerald-400 font-medium">+22% Proj.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-semibold">Global Top Collectors</h2>
              <Trophy className="w-5 h-5 text-[#C9A84C]" />
            </div>

            {leaderboard.map((user, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${user.name === 'You' ? 'bg-[#2A2A2A] border-emerald-500/30' : 'bg-[#1A1A1A] border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx < 3 ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-white/5 text-zinc-400'}`}>
                    {idx === 0 ? <Crown className="w-4 h-4" /> : user.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-zinc-400">${user.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">{user.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
