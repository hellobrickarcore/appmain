import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Download, ExternalLink, Camera } from 'lucide-react';
import { supabase } from '../../services/supabaseService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Scans: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgConfidence: 0,
    activeSensors: 8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/scans');
        const data = await response.json();

        if (data.success && data.scans) {
          setScans(data.scans);
          
          // Calculate high-level stats from the returned telemetry
          const totalScans = data.scans.length;
          const avgConf = Math.round(
            data.scans.reduce((acc: number, s: any) => acc + (s.confidence_avg || 0), 0) / (totalScans || 1) * 100
          );

          setStats({
            total: data.total_count || totalScans,
            avgConfidence: avgConf,
            activeSensors: 12
          });
        }
      } catch (err) {
        console.error('Error fetching admin scans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  return (
    <AdminLayout title="Scan Intelligence">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Scans (Global)" value={stats.total.toLocaleString()} subtitle="Across all devices" />
          <StatCard title="Avg Detection Accuracy" value={`${stats.avgConfidence}%`} subtitle="AI Confidence Score" />
          <StatCard title="Active Scanners" value={stats.activeSensors.toString()} subtitle="Real-time ping" />
        </div>

        {/* Filters & Table */}
        <div className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-dim group-focus-within:text-brand-yellow transition-colors" />
              <input 
                type="text" 
                placeholder="Search scans, users, or parts..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-yellow/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button className="bg-brand-yellow hover:bg-white text-black px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Scanner ID</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Bricks</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Confidence</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.length > 0 ? scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/[0.02] cursor-pointer group transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-yellow">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white font-mono uppercase">#{scan.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-brand-text-dim">{scan.user_email}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[11px] font-black text-white">{scan.bricks_detected_count || 0} pcs</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                        <span className="text-sm font-bold text-white">{(scan.confidence_avg * 100).toFixed(0)}%</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[12px] font-medium text-brand-text-dim">{new Date(scan.created_at).toLocaleString()}</span>
                    </td>
                  </tr>
                )) : (
                   <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-brand-text-dim italic">No scans detected yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
