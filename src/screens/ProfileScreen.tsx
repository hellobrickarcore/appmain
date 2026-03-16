import React, { useState, useEffect } from 'react';
import { Zap, Star, Trophy, Check, Play, Users } from 'lucide-react';
import { Screen } from '../types';
import { getUserXP, getUserId } from '../services/xpService';
import { Logo } from '../components/Logo';

interface ProfileScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [userStats, setUserStats] = useState({ streak: 0, xp: 0, league: 'Bronze', finishes: 0, level: 1, nextLevelXp: 1000 });
    const [profileName, setProfileName] = useState('Builder');

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userId = getUserId();
                const xpData = await getUserXP(userId);
                
                let league = 'Bronze';
                if (xpData.xp_total > 50000) league = 'Diamond';
                else if (xpData.xp_total > 25000) league = 'Platinum';
                else if (xpData.xp_total > 10000) league = 'Gold';
                else if (xpData.xp_total > 5000) league = 'Silver';

                const storedCollection = localStorage.getItem('hellobrick_collection');
                const bricksCount = storedCollection ? JSON.parse(storedCollection).bricks?.length || 0 : 0;
                
                setUserStats({
                    streak: xpData.streak_count || 1,
                    xp: xpData.xp_total || 0,
                    level: Math.floor((xpData.xp_total || 0) / 1000) + 1,
                    league: league,
                    finishes: bricksCount, // Reusing this for "Total Bricks"
                    nextLevelXp: (Math.floor((xpData.xp_total || 0) / 1000) + 1) * 1000
                });

                const storedName = localStorage.getItem('hellobrick_profile_name');
                if (storedName) setProfileName(storedName);
            } catch (error) {
                console.error('Failed to load user data:', error);
            }
        };
        loadUserData();
    }, []);

    const overviewStats = [
        { label: 'Day Streak', value: userStats.streak, icon: <Zap className="w-5 h-5 fill-current" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Total XP', value: userStats.xp.toLocaleString(), icon: <Star className="w-5 h-5 fill-current" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Vault Val.', value: `$${(userStats.finishes * 0.15).toFixed(2)}`, icon: <Check className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'League', value: userStats.league, icon: <Trophy className="w-5 h-5 fill-current" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
            <div className="px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-8 flex flex-col items-center">
                <div className="relative mb-6">
                    <Logo size="xl" showText={false} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#EA580C] px-4 py-1.5 rounded-full border-4 border-[#050A18] text-xs font-black shadow-xl">
                        Lvl {userStats.level}
                    </div>
                </div>

                <h1 className="text-[32px] font-black tracking-tight mb-2">{profileName}</h1>
                <p className="text-slate-500 font-bold mb-6 text-sm">Joined in 2026</p>

                <button 
                    onClick={() => onNavigate(Screen.PROFILE_SETTINGS)}
                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-300 active:scale-95 transition-all"
                >
                    Edit Settings
                </button>
            </div>

            <main className="flex-1 px-6 space-y-10 pb-32">
                <section className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {overviewStats.map((stat, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex flex-col gap-4">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-black leading-none mb-1.5">{stat.value}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Recent Achievements</h2>
                    <div className="bg-white/5 rounded-[40px] border border-white/5 p-8 flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 shadow-inner">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Master Builder</h3>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">You've unlocked the rare Master Builder badge for scanning your 100th unique part!</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 pb-12">
                   <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Activity Recap</h2>
                   <div className="flex flex-col gap-3">
                       <button 
                            onClick={() => onNavigate(Screen.COLLECTION)}
                            className="bg-white/5 p-6 rounded-[28px] border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
                       >
                           <div className="flex items-center gap-5">
                               <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                   <Play className="w-5 h-5 fill-current" />
                               </div>
                               <div className="text-left">
                                   <p className="text-sm font-black text-white">Full Collection View</p>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Review your inventory</p>
                               </div>
                           </div>
                           <Users className="w-4 h-4 text-slate-700 group-hover:text-blue-400 transition-colors" />
                       </button>
                   </div>
                </section>
            </main>
            </div>
        </div>
    );
};
