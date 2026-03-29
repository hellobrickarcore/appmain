import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { Trophy, Medal, User, Crown, Flame, Star } from 'lucide-react';
import { supabase } from '../../services/supabaseService';

export const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!supabase) return;
      
      try {
        setLoading(true);
        // 1. Fetch profiles
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email, created_at, is_pro');

        if (profileError) {
          // If profiles table is still missing, we'll use unique user_ids from collections as a fallback
          console.warn('Profiles table missing, using collections fallback');
        }

        // 2. Fetch aggregate collection totals (the real data)
        const { data: collections, error: collError } = await supabase
          .from('user_collections')
          .select('user_id, total_count, updated_at');

        if (collError) throw collError;

        // Map collection counts to user IDs
        const collectionMap = (collections || []).reduce((acc: any, item: any) => {
          acc[item.user_id] = (acc[item.user_id] || 0) + (item.total_count || 0);
          return acc;
        }, {});

        // 3. Merge data and Sort
        // Handle anonymous user IDs (strings) vs Auth IDs (UUIDs)
        const collectionUserIds = Array.from(new Set((collections || []).map(c => c.user_id)));
        
        const userList = (profiles && profiles.length > 0)
          ? profiles
            : collectionUserIds.map(id => ({ 
              id, 
              email: `${id}@anon`, 
              display_name: id.startsWith('user_') ? 'Guest Builder' : 'Builder', 
              created_at: new Date().toISOString(),
              is_pro: false
            }));

        // Add any users from collections that aren't in profiles (for hybrid mode)
        if (profiles && profiles.length > 0) {
          const profileIds = new Set(profiles.map(p => p.id));
          collectionUserIds.forEach(id => {
            if (!profileIds.has(id)) {
              userList.push({
                id,
                email: `${id}@anon`,
                display_name: id.startsWith('user_') ? 'Guest Builder' : 'Builder',
                created_at: new Date().toISOString(),
                is_pro: false
              });
            }
          });
        }

        const ranked = userList.map((user: any) => {
          const totalBricks = collectionMap[user.id] || 0;
          return {
            ...user,
            scans: totalBricks,
            level: Math.max(1, Math.floor(totalBricks / 50) + 1), // Standard level progression
            rank: 0
          };
        }).sort((a: any, b: any) => b.scans - a.scans);

        // Add ranks
        const finalized = ranked.map((u, i) => ({ ...u, rank: i + 1 }));

        setTopUsers(finalized);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const podium = topUsers.slice(0, 3);
  const others = topUsers.slice(3);

  return (
    <AdminLayout title="Global Leaderboard">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Podium Section */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mt-12 px-4">
          {/* Rank 2 */}
          {podium[1] && (
            <div className="flex-1 max-w-[280px] group">
              <div className="relative mb-6 flex justify-center">
                 <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <User className="w-10 h-10 text-brand-text-dim" />
                    <div className="absolute top-0 right-0 p-1 bg-zinc-500 rounded-bl-lg">
                      <Medal className="w-3 h-3 text-white" />
                    </div>
                 </div>
              </div>
              <div className="bg-[#111] border border-white/5 rounded-t-3xl p-6 text-center h-48 flex flex-col justify-center relative shadow-2xl">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">2nd Place</div>
                 <h3 className="text-white font-black tracking-tight truncate">{podium[1].display_name || podium[1].email.split('@')[0]}</h3>
                 <p className="text-brand-text-dim text-[11px] font-bold uppercase tracking-widest mt-1">{podium[1].scans} Bricks</p>
                 <div className="mt-4 flex items-center justify-center gap-1.5 text-brand-yellow">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[11px] font-black uppercase">Level {podium[1].level}</span>
                 </div>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {podium[0] && (
            <div className="flex-1 max-w-[320px] group z-10">
              <div className="relative mb-8 flex justify-center">
                 <div className="w-28 h-28 rounded-[32px] bg-brand-yellow/5 border border-brand-yellow/20 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-brand-yellow/10">
                    <Crown className="w-14 h-14 text-brand-yellow animate-pulse" />
                    <div className="absolute top-0 right-0 p-1.5 bg-brand-yellow rounded-bl-xl">
                      <Trophy className="w-4 h-4 text-black" />
                    </div>
                 </div>
              </div>
              <div className="bg-[#111] border border-brand-yellow/20 rounded-t-[40px] p-8 text-center h-64 flex flex-col justify-center relative shadow-2xl scale-110">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-yellow text-black text-[12px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">Grand Champion</div>
                 <h3 className="text-2xl text-white font-black tracking-tighter truncate">{podium[0].display_name || podium[0].full_name || podium[0].email.split('@')[0]}</h3>
                 <p className="text-brand-yellow text-[13px] font-black uppercase tracking-widest mt-2">{podium[0].scans} Bricks</p>
                 <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="px-4 py-1.5 bg-brand-yellow/10 rounded-xl border border-brand-yellow/10">
                      <span className="text-[11px] font-black text-brand-yellow uppercase">Level {podium[0].level}</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {podium[2] && (
            <div className="flex-1 max-w-[280px] group">
              <div className="relative mb-6 flex justify-center">
                 <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <User className="w-10 h-10 text-brand-text-dim" />
                    <div className="absolute top-0 right-0 p-1 bg-amber-700 rounded-bl-lg">
                      <Medal className="w-3 h-3 text-white" />
                    </div>
                 </div>
              </div>
              <div className="bg-[#111] border border-white/5 rounded-t-3xl p-6 text-center h-40 flex flex-col justify-center relative shadow-2xl">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">3rd Place</div>
                 <h3 className="text-white font-black tracking-tight truncate">{podium[2].display_name || podium[2].full_name || podium[2].email.split('@')[0]}</h3>
                 <p className="text-brand-text-dim text-[11px] font-bold uppercase tracking-widest mt-1">{podium[2].scans} Bricks</p>
              </div>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="bg-[#111] border border-white/5 rounded-[40px] overflow-hidden max-w-5xl mx-auto shadow-2xl">
           <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tighter uppercase">Master Builders</h3>
              <div className="flex items-center gap-2 text-[11px] font-black text-brand-text-dim uppercase tracking-[.2em]">
                Live Community Rankings <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
              </div>
           </div>
           <div className="divide-y divide-white/5">
              {others.map((user, i) => (
                <div key={user.id} className="px-10 py-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                   <div className="flex items-center gap-8">
                      <span className="text-2xl font-black text-white/10 group-hover:text-brand-yellow/20 transition-colors tabular-nums w-8">{i + 4}</span>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-text-dim border border-white/5 group-hover:scale-105 transition-transform">
                            <User className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-md font-black text-white leading-none mb-1.5 flex items-center gap-2">
                              {user.display_name || user.email.split('@')[0]}
                              {user.is_pro && <Crown className="w-3.5 h-3.5 text-brand-yellow" />}
                            </span>
                            <span className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="text-right">
                         <div className="text-lg font-black text-white leading-none mb-1">{user.scans.toLocaleString()}</div>
                         <div className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest leading-none">Bricks Detected</div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center text-[13px] font-black text-white bg-white/[0.02]">
                         {user.level}
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <div className="p-8 bg-white/[0.02] text-center">
              <button className="text-[11px] font-black text-brand-text-dim hover:text-white uppercase tracking-[.3em] transition-colors">Show All Master Builders</button>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};
