import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { Search, Filter, Download, User, Crown, Mail, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabaseService';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pro: 0,
    retention: 64
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        if (data.success && data.users) {
          const userList = data.users.map((u: any) => ({
            ...u,
            display_name: u.display_name || u.email.split('@')[0],
            is_pro: u.is_pro || false, // Pro status still needs a reliable source or sync
          }));

          setUsers(userList);
          setStats({
            total: userList.length,
            pro: userList.filter((u: any) => u.is_pro).length,
            retention: 78
          });
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <AdminLayout title="User Management">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Registered Users" value={stats.total.toLocaleString()} subtitle="Across Web & Mobile" />
          <StatCard title="Pro Subscribers" value={stats.pro.toLocaleString()} subtitle={`~${((stats.pro / (stats.total || 1)) * 100).toFixed(1)}% Conversion`} />
          <StatCard title="7D Retention" value={`${stats.retention}%`} subtitle="Healthy engagement" />
        </div>

        {/* Directory */}
        <div className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-dim group-focus-within:text-brand-yellow transition-colors" />
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-yellow/30 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">User Details</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Joined</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Last Active</th>
                  <th className="px-8 py-5 text-[11px] font-black text-brand-text-dim uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length > 0 ? users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] cursor-pointer group transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-none mb-1">{u.display_name || u.full_name || 'Anonymous User'}</span>
                          <span className="text-[11px] font-medium text-brand-text-dim flex items-center gap-1.5 leading-none">
                            <Mail className="w-3 h-3" /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {u.is_pro ? (
                        <div className="flex items-center gap-2 text-brand-yellow">
                          <Crown className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-black uppercase tracking-wider">Pro Elite</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-brand-text-dim uppercase tracking-wider px-2 py-1 bg-white/[0.03] rounded-lg">Free</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-brand-text-dim">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-medium">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[12px] font-medium text-brand-text-dim">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                       <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-brand-text-dim hover:text-white">
                         <Filter className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-brand-text-dim italic">No users found in the system.</td>
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
