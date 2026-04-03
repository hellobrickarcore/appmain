import React, { useState, useEffect } from 'react';
import { Settings, Zap, Star, Trophy, Check, Activity } from 'lucide-react';
import { Screen } from '../types';
import { getUserXP, getUserId, getXPLedger, formatXPEvent, getDailyStats } from '../services/xpService';
import { Logo } from '../components/Logo';

interface ProfileScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [userStats, setUserStats] = useState({ 
      streak: 0, 
      xp: 0, 
      todayXp: 0, 
      setsCompleted: 0, 
      level: 1,
      league: 'Bronze',
      xpInLevel: 0,
      nextLevelXp: 1000
    });
    const [ledger, setLedger] = useState<any[]>([]);
    
    // We only access these values for rendering now
    const profileName = localStorage.getItem('hellobrick_profile_name') || 'Builder';
    const profileImage = localStorage.getItem('hellobrick_profile_image') || '';

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userId = getUserId();
                const xpData = await getUserXP(userId);
                const stats = await getDailyStats(userId);
                
                // Progressive level thresholds — attainable early on
                const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 15000, 20000, 30000, 50000];
                const xp = xpData.xp_total || 0;
                let level = 1;
                let xpForCurrentLevel = 0;
                let xpForNextLevel = 50;
                for (let i = 1; i < levelThresholds.length; i++) {
                  if (xp >= levelThresholds[i]) {
                    level = i + 1;
                    xpForCurrentLevel = levelThresholds[i];
                    xpForNextLevel = (i + 1 < levelThresholds.length) ? levelThresholds[i + 1] : levelThresholds[i] + 10000;
                  }
                }
                const xpInLevel = xp - xpForCurrentLevel;
                const xpNeeded = xpForNextLevel - xpForCurrentLevel;

                let league = 'Bronze';
                if (xp >= 10000) league = 'Diamond';
                else if (xp >= 5000) league = 'Platinum';
                else if (xp >= 2000) league = 'Gold';
                else if (xp >= 500) league = 'Silver';

                setUserStats({
                    streak: stats.streak || 0,
                    xp: xp,
                    todayXp: xpData.today_xp || 0,
                    setsCompleted: stats.setsCompleted || 0,
                    level: level,
                    league: league,
                    xpInLevel: xpInLevel,
                    nextLevelXp: xpNeeded
                });

                const ledgerData = await getXPLedger(userId);
                setLedger(ledgerData.slice(0, 5));
            } catch (err) {
                console.error('Failed to load profile data:', err);
            }
        };

        loadUserData();
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#050A18] font-sans text-white relative overflow-hidden">
            <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600/5 via-blue-500/0 to-transparent pointer-events-none z-0" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#050A18]/80 sticky top-0">
                <div className="flex items-center gap-3">
                    <Logo size="sm" showText={false} className="w-8 h-8" />
                    <h1 className="text-sm font-black text-white uppercase tracking-widest">Profile</h1>
                </div>
                <button
                    onClick={() => onNavigate(Screen.PROFILE_SETTINGS)}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <Settings className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar overscroll-contain pb-[max(env(safe-area-inset-bottom),180px)] touch-pan-y">
                {/* Profile Hero */}
                <div className="px-6 pt-10 pb-8 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-orange-500 to-orange-600 p-1 shadow-2xl shadow-orange-500/20 relative group">
                        <div className="w-full h-full bg-[#050A18] rounded-[28px] flex items-center justify-center overflow-hidden border border-white/10">
                            {profileImage ? (
                                <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-3xl font-black text-white">{profileName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#FFD600] text-[#050A18] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-[#050A18]">
                            Lvl {userStats.level}
                        </div>
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-white">{profileName}</h2>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userStats.league} League</span>
                        </div>
                        <div className="px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{userStats.xp} XP</span>
                        </div>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="px-6 mb-10">
                    <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Level {userStats.level}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-medium">{userStats.xpInLevel} / {userStats.nextLevelXp} to Level {userStats.level + 1}</p>
                            </div>
                            <Trophy className="w-6 h-6 text-[#FFD600] opacity-50" />
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000"
                                style={{ width: `${Math.min(100, (userStats.xpInLevel / userStats.nextLevelXp) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="px-6 grid grid-cols-2 gap-4 mb-10">
                    <div className="p-5 bg-white/5 rounded-[32px] border border-white/10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-3">
                            <Star className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="text-xl font-black text-white">{userStats.streak}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Day Streak</span>
                    </div>
                    <div className="p-5 bg-white/5 rounded-[32px] border border-white/10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3">
                            <Check className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xl font-black text-white">{userStats.setsCompleted}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Sets Built</span>
                    </div>
                </div>

                {/* Quick Actions — Train AI & Leaderboard */}
                <div className="px-6 mb-10 space-y-3">
                    <button 
                      onClick={() => onNavigate(Screen.TRAINING)}
                      className="w-full p-5 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-white/10"
                    >
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-black text-white uppercase tracking-widest">Train Your AI</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Help improve brick detection</p>
                        </div>
                        <Activity className="w-5 h-5 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => onNavigate(Screen.LEADERBOARD)}
                      className="w-full p-5 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-white/10"
                    >
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-sm font-black text-white uppercase tracking-widest">Leaderboard</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">See where you rank globally</p>
                        </div>
                        <Star className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="px-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Activity</h3>
                        <Activity className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="space-y-3">
                        {ledger.map((event, i) => (
                            <div key={i} className="group p-4 bg-white/5 hover:bg-white/10 transition-all rounded-[24px] border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-colors">
                                        {event.type === 'SCAN' ? <Zap className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">{formatXPEvent(event.type)}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-orange-500">+{event.amount} XP</p>
                                </div>
                            </div>
                        ))}
                        {ledger.length === 0 && (
                            <div className="text-center py-8 text-slate-600">
                                <p className="text-[10px] font-black uppercase tracking-widest">No activity yet</p>
                                <p className="text-[10px] font-bold mt-1">Start scanning bricks to earn XP!</p>
                            </div>
                        )}
                    </div>
                    <button 
                      onClick={() => onNavigate(Screen.REWARDS)}
                      className="w-full mt-6 py-4 rounded-3xl bg-white/5 border border-white/10 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                      View All Activity
                    </button>
                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">HelloBrick v1.6.1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
