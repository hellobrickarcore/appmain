import React, { useState } from 'react';
import { TrendingUp, Trophy, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';

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
      <div className="pt-[max(env(safe-area-inset-top),2rem)] px-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
            <Logo size="sm" showText={false} className="w-8 h-8" />
            <span className="font-bold text-xl text-white">Market Insights</span>
        </div>

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
            {/* Global Set Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search any LEGO set or minifig..."
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Browse by Theme */}
            <div className="bg-[#1A1A1A] p-5 rounded-[24px] border border-white/5">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Browse by Theme</h2>
              <div className="space-y-2">
                {[
                  { name: 'Star Wars', icon: '⚔️', sets: 1046, minifigs: 1588 },
                  { name: 'City', icon: '🏙️', sets: 1617, minifigs: 3781 },
                  { name: 'Technic', icon: '⚙️', sets: 892, minifigs: 120 },
                  { name: 'Creator Expert', icon: '🏛️', sets: 245, minifigs: 410 },
                  { name: 'Harry Potter', icon: '⚡', sets: 312, minifigs: 580 },
                ].map((theme, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{theme.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{theme.name}</p>
                        <p className="text-[10px] text-zinc-500">{theme.sets} sets · {theme.minifigs} minifigs</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* What Can I Build */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-[24px] border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧩</span>
                <h2 className="text-lg font-semibold">What Can I Build?</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Scan your loose bricks and discover what amazing creations you can make with them.</p>
              <button
                onClick={() => onNavigate(Screen.SCANNER)}
                className="w-full py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                Start Scanning Pieces →
              </button>
            </div>

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
