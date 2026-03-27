import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { Search, Filter, Mail, Crown, MoreVertical, Trash2 } from 'lucide-react';

const MOCK_USERS = [
  { id: '1', email: 'user_9281@gmail.com', joined: 'Mar 24, 2026', scans: 142, ideas: 45, status: 'PRO', lastActive: '2 mins ago' },
  { id: '2', email: 'user_4421@yahoo.com', joined: 'Mar 22, 2026', scans: 12, ideas: 2, status: 'FREE', lastActive: '1 day ago' },
  { id: '3', email: 'user_1102@outlook.com', joined: 'Mar 15, 2026', scans: 890, ideas: 215, status: 'PRO', lastActive: '5 mins ago' },
  { id: '4', email: 'user_8832@gmail.com', joined: 'Feb 28, 2026', scans: 56, ideas: 12, status: 'FREE', lastActive: '3 hours ago' },
  { id: '5', email: 'user_5512@mac.com', joined: 'Feb 12, 2026', scans: 1240, ideas: 512, status: 'PRO', lastActive: 'Now' },
];

export const Users: React.FC = () => {
  return (
    <AdminLayout title="User Management">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="12,480" trend={{ value: 5, isPositive: true }} />
          <StatCard title="Pro Users" value="3,120" trend={{ value: 12, isPositive: true }} subtitle="25% conversion" />
          <StatCard title="Active Today" value="1,842" trend={{ value: 8, isPositive: true }} />
          <StatCard title="7D Retention" value="42%" trend={{ value: 2, isPositive: false }} />
        </div>

        {/* User Table */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-dim" />
                <input 
                  type="text" 
                  placeholder="Search by email or User ID..." 
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[13px] text-white focus:outline-none focus:border-brand-yellow/30 transition-all font-medium"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[12px] font-bold text-brand-text-dim hover:text-white transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[12px] font-bold text-white hover:bg-white/10 transition-all">
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black rounded-xl text-[12px] font-bold hover:scale-[1.02] transition-all">
                Invite User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['User', 'Status', 'Joined', 'Activity', 'Last Active', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black text-brand-text-dim uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-brand-text-dim group-hover:bg-brand-orange/20 group-hover:text-brand-orange transition-all">
                          {user.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white">{user.email}</span>
                          <span className="text-[10px] font-medium text-brand-text-dim">ID: {user.id}00x7FF</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.status === 'PRO' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-yellow/10 text-brand-yellow text-[10px] font-black border border-brand-yellow/20">
                            <Crown className="w-3 h-3" />
                            PRO
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-white/5 text-brand-text-dim text-[10px] font-black border border-white/10">
                            FREE
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-brand-text-dim">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-white leading-none">{user.scans} scans</span>
                        <span className="text-[10px] font-medium text-brand-text-dim uppercase tracking-wider">{user.ideas} ideas</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12px] font-bold text-white">{user.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-text-dim hover:text-white">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-400/10 rounded-lg transition-colors text-brand-text-dim hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-text-dim">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest">Page 1 of 640</span>
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
