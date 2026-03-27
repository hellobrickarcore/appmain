import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Trophy, Medal, Star, ArrowUpRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOP_USERS = [
  { rank: 1, user: 'brick_king_99', score: '42,580', medal: 'gold', color: '#FFD600', avatar: 'BK' },
  { rank: 2, user: 'master_builder', score: '38,120', medal: 'silver', color: '#E2E8F0', avatar: 'MB' },
  { rank: 3, user: 'lego_pilot', score: '31,940', medal: 'bronze', color: '#F97316', avatar: 'LP' },
];

const LEADERBOARD_LIST = [
  { rank: 4, user: 'user_9281', score: '28,450', trend: '+12%', lastActive: '2m' },
  { rank: 5, user: 'user_4421', score: '26,120', trend: '+5%', lastActive: '15m' },
  { rank: 6, user: 'user_1102', score: '24,890', trend: '-2%', lastActive: '42m' },
  { rank: 7, user: 'user_8832', score: '22,100', trend: '+18%', lastActive: '1h' },
  { rank: 8, user: 'user_5512', score: '21,450', trend: '+1%', lastActive: '2h' },
  { rank: 9, user: 'user_3321', score: '19,800', trend: '+4%', lastActive: '3h' },
  { rank: 10, user: 'user_0092', score: '18,200', trend: '+12%', lastActive: '5h' },
];

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bricks' | 'scans' | 'ideas'>('bricks');

  return (
    <AdminLayout title="Global Leaderboard">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Tabs Control */}
        <div className="flex items-center justify-center">
          <div className="bg-[#111] border border-white/5 p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
            {[
              { id: 'bricks', label: 'Bricks Scanned' },
              { id: 'scans', label: 'Scans Completed' },
              { id: 'ideas', label: 'Ideas Generated' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[13px] font-black transition-all",
                  activeTab === tab.id 
                    ? "bg-white/10 text-brand-yellow border border-white/10 shadow-lg" 
                    : "text-brand-text-dim hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-12">
          {/* Silver - 2nd */}
          <div className="w-full md:w-64 bg-[#111] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center relative group hover:border-white/20 transition-all h-[320px]">
            <div className="absolute -top-8 w-16 h-16 rounded-2xl bg-slate-200/5 border border-slate-200/20 flex items-center justify-center shadow-xl group-hover:-translate-y-2 transition-transform">
              <span className="text-xl font-black text-slate-300">2</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-slate-200/10 border-4 border-slate-200/20 flex items-center justify-center mb-6 mt-4">
              <span className="text-2xl font-black text-slate-200">MB</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2 underline decoration-slate-200/30 decoration-4">master_builder</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white leading-none">38,120</span>
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Bricks</span>
            </div>
            <Medal className="absolute top-6 right-6 w-5 h-5 text-slate-300 opacity-30" />
          </div>

          {/* Gold - 1st (Taller) */}
          <div className="w-full md:w-72 bg-gradient-to-b from-brand-yellow/5 to-[#111] border-2 border-brand-yellow/30 rounded-[40px] p-10 flex flex-col items-center text-center relative group hover:border-brand-yellow/50 transition-all h-[400px] z-10 shadow-2xl shadow-brand-yellow/10">
            <div className="absolute -top-10 w-20 h-20 rounded-3xl bg-brand-yellow border-4 border-black flex items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform">
              <Trophy className="w-10 h-10 text-black" />
            </div>
            <div className="w-24 h-24 rounded-full bg-brand-yellow/20 border-4 border-brand-yellow/40 flex items-center justify-center mb-6 mt-4 shadow-xl">
              <span className="text-3xl font-black text-brand-yellow">BK</span>
            </div>
            <h4 className="text-2xl font-black text-white mb-3">brick_king_99</h4>
            <div className="px-4 py-2 bg-brand-yellow text-black rounded-full font-black text-sm mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              TOP CONTRBUTOR
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white leading-none">42,580</span>
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest leading-none">Bricks</span>
            </div>
          </div>

          {/* Bronze - 3rd */}
          <div className="w-full md:w-64 bg-[#111] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center relative group hover:border-white/20 transition-all h-[280px]">
            <div className="absolute -top-8 w-14 h-14 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 flex items-center justify-center shadow-xl group-hover:-translate-y-2 transition-transform">
              <span className="text-lg font-black text-brand-orange">3</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 border-4 border-brand-orange/20 flex items-center justify-center mb-6 mt-4">
              <span className="text-xl font-black text-brand-orange">LP</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2 underline decoration-brand-orange/30 decoration-4">lego_pilot</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white leading-none">31,940</span>
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Bricks</span>
            </div>
            <Medal className="absolute top-6 right-6 w-5 h-5 text-brand-orange opacity-30" />
          </div>
        </div>

        {/* List Section */}
        <div className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
              Live Rankings (4-500)
            </h3>
            <div className="flex gap-4">
              <div className="text-[11px] font-bold text-brand-text-dim px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg">Reset in 14 days</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['Rank', 'User', 'Score', 'Weekly Trend', 'Active'].map(h => (
                    <th key={h} className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {LEADERBOARD_LIST.map((entry) => (
                  <tr key={entry.rank} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-brand-text-dim group-hover:text-white transition-colors">#{entry.rank}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-brand-text-dim group-hover:bg-white/10 group-hover:text-white transition-all">
                          {entry.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-white group-hover:text-brand-yellow transition-colors">{entry.user}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[15px] font-black text-white">{entry.score}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "flex items-center gap-1.5 font-bold text-[13px]",
                        entry.trend.startsWith('+') ? "text-green-400" : "text-red-400"
                      )}>
                        {entry.trend}
                        <ArrowUpRight className={cn("w-3 h-3", entry.trend.startsWith('-') && "rotate-90")} />
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-brand-text-dim italic">{entry.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
