import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Download, ExternalLink, Camera } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_SCANS = [
  { id: '1', user: 'user_9281', bricks: 24, confidence: 0.92, time: '2 mins ago', types: '3001, 3023, 3003' },
  { id: '2', user: 'user_4421', bricks: 8, confidence: 0.78, time: '15 mins ago', types: '4211, 2412' },
  { id: '3', user: 'user_1102', bricks: 45, confidence: 0.85, time: '42 mins ago', types: '3001 x12, 3005 x5' },
  { id: '4', user: 'user_8832', bricks: 12, confidence: 0.94, time: '1 hour ago', types: '3020, 3710' },
  { id: '5', user: 'user_5512', bricks: 3, confidence: 0.99, time: '2 hours ago', types: '3001' },
];

const HISTOGRAM_DATA = [
  { range: '1-5', count: 420 },
  { range: '6-10', count: 310 },
  { range: '11-20', count: 215 },
  { range: '21-50', count: 85 },
  { range: '50+', count: 12 },
];

export const Scans: React.FC = () => {
  return (
    <AdminLayout title="Scan Intelligence">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Scans" value="24,582" trend={{ value: 12, isPositive: true }} />
          <StatCard title="Avg Bricks / Scan" value="18.4" trend={{ value: 5, isPositive: true }} />
          <StatCard title="Avg Confidence" value="88.2%" trend={{ value: 1.2, isPositive: true }} />
        </div>

        {/* Intelligence Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold text-white mb-8 tracking-tight">Bricks Per Scan Distribution</h3>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={HISTOGRAM_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis 
                    dataKey="range" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="#FFD600" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-brand-orange" />
            </div>
            <h4 className="text-white font-bold">White Brick Sensitivity</h4>
            <p className="text-brand-text-dim text-[12px] max-w-[280px] leading-relaxed">
              Detection accuracy for white bricks on white backgrounds has improved by <span className="text-brand-yellow font-black">14%</span> since the V1.5 pipeline update.
            </p>
          </div>
        </div>

        {/* Live Scan Table */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-dim" />
                <input 
                  type="text" 
                  placeholder="Search by User ID or brick type..." 
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[13px] text-white focus:outline-none focus:border-brand-yellow/30 transition-all font-medium"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[12px] font-bold text-brand-text-dim hover:text-white transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[12px] font-bold text-white hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['Timestamp', 'User ID', 'Bricks', 'Confidence', 'Types Preview', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black text-brand-text-dim uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_SCANS.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-white">{scan.time}</span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-brand-text-dim">{scan.user}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-yellow/10 text-brand-yellow text-[11px] font-bold border border-brand-yellow/20">
                        {scan.bricks} bricks
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              scan.confidence > 0.9 ? "bg-green-500" : scan.confidence > 0.8 ? "bg-brand-yellow" : "bg-brand-orange"
                            )}
                            style={{ width: `${scan.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-white">{(scan.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] font-medium text-brand-text-dim italic truncate max-w-[200px] block">
                        {scan.types}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-4 h-4 text-brand-text-dim" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest">Showing 5 of 24,582 results</span>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold text-brand-text-dim hover:text-white disabled:opacity-30" disabled>Previous</button>
              <button className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold text-brand-text-dim hover:text-white">Next</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
