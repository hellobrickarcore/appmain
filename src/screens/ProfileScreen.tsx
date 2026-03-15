import React, { useState, useEffect } from 'react';
import { Zap, Star, Trophy, Check, Play, Users } from 'lucide-react';
import { Screen } from '../types';
import { getUserXP, getUserId } from '../services/xpService';

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
                
                // Calculate League based on XP
                let league = 'Bronze';
                if (xpData.xp_total > 50000) league = 'Diamond';
                else if (xpData.xp_total > 25000) league = 'Platinum';
                else if (xpData.xp_total > 10000) league = 'Gold';
                else if (xpData.xp_total > 5000) league = 'Silver';

                // Estimate Finishes (Combined metric for completions)
                const storedCollection = localStorage.getItem('hellobrick_collection');
                const bricksCount = storedCollection ? JSON.parse(storedCollection).bricks?.length || 0 : 0;
                
                setUserStats({
                    streak: xpData.streak_count || 1,
                    xp: xpData.xp_total || 0,
                    level: Math.floor((xpData.xp_total || 0) / 1000) + 1,
                    league: league,
                    finishes: Math.floor(bricksCount / 5) + (xpData.level || 0),
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
        { label: 'League', value: userStats.league, icon: <Trophy className="w-5 h-5 fill-current" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Finishes', value: userStats.finishes, icon: <Check className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#050A18] font-sans text-white relative overflow-y-auto no-scrollbar overscroll-contain">
            {/* Header / Avatar Section */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-8 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-32 h-32 bg-[#FFD600] rounded-[40px] flex items-center justify-center shadow-2xl relative">
                        <div className="flex gap-4">
                            <div className="w-3 h-3 bg-black rounded-full" />
                            <div className="w-3 h-3 bg-black rounded-full" />
                        </div>
                        {/* Smile (Subtle) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-8 h-4 border-b-2 border-black/20 rounded-full" />
                    </div>
                    {/* Level Badge Overlay */}
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
                {/* Overview Section */}
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

                {/* Next Up Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Next Up</h2>
                        <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">{Math.max(0, userStats.nextLevelXp - userStats.xp)} XP to Level {userStats.level + 1}</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (userStats.xp / userStats.nextLevelXp) * 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-3 px-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase">Level {userStats.level}</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase">Level {userStats.level + 1}</span>
                        </div>
                    </div>
                </section>

                {/* How to earn XP Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">How to earn XP</h2>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-sm font-bold">New Brick Scanned</span>
                            </div>
                            <span className="text-blue-400 font-black">+10 XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">Daily Puzzle</span>
                            </div>
                            <span className="text-orange-400 font-black">+50 XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                                    <Trophy className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-sm font-bold">Win Battle</span>
                            </div>
                            <span className="text-purple-400 font-black">+100 XP</span>
                        </div>
                    </div>
                </section>

                {/* Leaderboard Button */}
                <section>
                    <button
                        onClick={() => onNavigate(Screen.LEADERBOARD)}
                        className="w-full bg-white text-black h-16 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                    >
                        <Trophy className="w-5 h-5" />
                        View Leaderboard
                    </button>
                </section>

                {/* Friend Streaks Section */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Friend Streaks</h2>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-center gap-4 overflow-x-auto no-scrollbar">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#1A1F2C] bg-slate-700 flex items-center justify-center text-xs font-black">
                                    {i === 0 ? 'JD' : i === 1 ? 'AK' : i === 2 ? 'MS' : 'BR'}
                                </div>
                            ))}
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 mx-2" />
                        <div className="flex flex-col">
                            <p className="text-sm font-black text-white">4 Friends on fire</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Streak High: 45 Days</p>
                        </div>
                    </div>
                </section>

                {/* Multiplayer Promo Card */}
                <section className="pb-10">
                    <button
                        onClick={() => onNavigate(Screen.H2H_MATCHMAKING)}
                        className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 rounded-[40px] relative overflow-hidden group active:scale-[0.98] transition-all shadow-2xl"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-black/20 blur-[100px] rounded-full" />
                        
                        <div className="relative z-10 flex flex-col items-start text-left">
                            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10">
                                <span className="text-yellow-400">New</span> Feature
                            </div>
                            <h2 className="text-[32px] font-black leading-none mb-3 tracking-tight">MULTIPLAYER</h2>
                            <p className="text-white/80 font-bold text-base max-w-[200px] leading-snug mb-6">
                                Compete against other builders in real-time brick races.
                            </p>
                            <div className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all shadow-xl">
                                Play Now
                                <Play className="w-4 h-4 fill-current" />
                            </div>
                        </div>

                        {/* Floating Icons */}
                        <Users className="absolute top-8 right-8 w-24 h-24 text-white/5 -rotate-12" />
                    </button>
                </section>
            </main>
        </div>
    );
};
