import React, { useState, useEffect } from 'react';
import { Settings, Zap, Diamond, Trophy, Medal, ChevronRight, Smile, Plus, X } from 'lucide-react';
import { Screen, BadgeType, Achievement } from '../types';
import { getUserXP, getUserId } from '../services/xpService';

interface ProfileScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
    const [userStats, setUserStats] = useState({ streak: 0, xp: 0, setsCompleted: 0, level: 1 });
    const [badges, setBadges] = useState<BadgeType[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userId = getUserId();
                const xpData = await getUserXP(userId);

                // Calculate sets completed from collection (fetch from server)
                let setsCount = 0;
                try {
                    const response = await fetch(`/api/dataset/collection/get?userId=${userId}`);
                    if (response.ok) {
                        const colData = await response.json();
                        // Use bricks count or specific sets count if available
                        setsCount = colData.uniqueCount || colData.bricks?.length || 0;
                    }
                } catch (e) {
                    console.error('Error fetching collection from server:', e);
                    // Fallback to local storage if server fails (to be robust)
                    const storedCollection = localStorage.getItem('hellobrick_collection');
                    if (storedCollection) {
                        try {
                            const parsed = JSON.parse(storedCollection);
                            setsCount = parsed.bricks?.length || parsed.sets?.length || 0;
                        } catch (err) { }
                    }
                }

                setUserStats({
                    streak: xpData.streak_count || 0,
                    xp: xpData.xp_total || 0,
                    setsCompleted: setsCount,
                    level: xpData.level || 1
                });

                // Load badges and achievements
                setBadges([
                    {
                        id: 'streak_7',
                        name: 'Week Warrior',
                        description: 'Maintain a 7-day streak',
                        image: '🔥',
                        color: 'bg-gradient-to-br from-orange-500 to-red-600',
                        completed: (xpData.streak_count || 0) >= 7,
                        dateEarned: (xpData.streak_count || 0) >= 7 ? new Date().toLocaleDateString() : undefined
                    },
                    {
                        id: 'level_10',
                        name: 'Rising Star',
                        description: 'Reach level 10',
                        image: '⭐',
                        color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
                        completed: (xpData.level || 1) >= 10,
                        dateEarned: (xpData.level || 1) >= 10 ? new Date().toLocaleDateString() : undefined
                    }
                ]);

                setAchievements([
                    {
                        id: 'first_scan',
                        title: 'First Scan',
                        description: 'Complete your first brick scan',
                        image: '📸',
                        color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
                        level: 1,
                        maxLevel: 1,
                        dateEarned: xpData.xp_total > 0 ? new Date().toLocaleDateString() : undefined
                    },
                    {
                        id: 'collector',
                        title: 'Collector',
                        description: 'Build your collection',
                        image: '📦',
                        color: 'bg-gradient-to-br from-green-500 to-emerald-500',
                        level: Math.min(5, Math.floor((xpData.xp_total || 0) / 500)),
                        maxLevel: 5,
                        dateEarned: (xpData.xp_total || 0) > 0 ? new Date().toLocaleDateString() : undefined
                    }
                ]);
            } catch (error) {
                console.error('Failed to load user data:', error);
            }
        };
        loadUserData();
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-900 font-sans text-white overflow-hidden safe-area-inset">
            {/* 1. HEADER */}
            <div className="flex justify-between items-start p-4 sm:p-6 pt-[max(env(safe-area-inset-top),2rem)] border-b border-slate-800 safe-area-top">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#ffc0cb] flex items-center justify-center border-2 border-slate-700 overflow-hidden">
                            <div className="w-12 h-12 bg-[#ffc800] rounded-[16px] rotate-12 flex items-center justify-center shadow-sm">
                                <Smile className="w-8 h-8 text-[#b45309]" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                            <span className="text-xs">🇬🇧</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">{localStorage.getItem('hellobrick_userName') || 'Brick Master'}</h1>
                        <p className="text-slate-400 text-xs font-bold mt-1">Joined in {new Date().getFullYear()}</p>
                    </div>
                </div>

                <button
                    onClick={() => onNavigate(Screen.PROFILE_SETTINGS)}
                    className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-colors"
                >
                    Edit Settings
                    <Settings className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <div className="flex-1 px-5 space-y-6 pb-6 pt-4 overflow-y-auto no-scrollbar safe-area-bottom">
                {/* 2. OVERVIEW */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-white">Overview</h2>
                    <div className="bg-[#1e293b] rounded-2xl p-4 grid grid-cols-2 gap-4 border border-slate-800">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
                            <div>
                                <span className="block font-bold text-lg leading-none">{userStats.streak}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Day Streak</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Diamond className="w-6 h-6 text-blue-400 fill-blue-400" />
                            <div>
                                <span className="block font-bold text-lg leading-none">{userStats.xp.toLocaleString()}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Total XP</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <div>
                                <span className="block font-bold text-lg leading-none">Bronze</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Current League</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Medal className="w-6 h-6 text-purple-500 fill-purple-500" />
                            <div>
                                <span className="block font-bold text-lg leading-none">{userStats.setsCompleted}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Top Finishes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. NEXT UP */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-white">Next Up</h2>
                    {(() => {
                        const sortingSession = localStorage.getItem('hellobrick_sorting_session');
                        if (!sortingSession) return null;

                        try {
                            const session = JSON.parse(sortingSession);
                            const progress = session.progress || 0;
                            const setName = session.setName || 'Current Set';

                            return (
                                <div
                                    onClick={() => onNavigate(Screen.SCANNER)}
                                    className="bg-[#1e293b] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between cursor-pointer border-2 border-b-4 border-slate-700 active:border-b-2 active:translate-y-[2px] transition-all"
                                >
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg text-white mb-1">Resume Sorting</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{setName} • {Math.round(progress)}% Done</p>
                                    </div>
                                    <ChevronRight className="text-slate-500 w-6 h-6" />
                                </div>
                            );
                        } catch (e) {
                            return null;
                        }
                    })()}
                </div>

                {/* 4. FRIEND STREAKS */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-white">Friend Streaks</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar">
                        {[...Array(5)].map((_, i) => (
                            <button key={i} className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 hover:border-slate-500 hover:text-slate-400 transition-colors">
                                <Plus className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. MULTIPLAYER (PRO) */}
                <div>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 flex flex-col items-start relative overflow-hidden border-b-4 border-indigo-800">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-black text-lg text-white uppercase tracking-wide">Multiplayer</h3>
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
                            </div>
                            <p className="text-indigo-100 text-sm mb-4 font-medium max-w-[80%]">Sort piles together with friends in real-time AR mode.</p>
                            <button
                                onClick={() => onNavigate(Screen.H2H_MODES)}
                                className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                            >
                                Try for Free
                            </button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                            <Smile className="w-32 h-32" />
                        </div>
                    </div>
                </div>

                {/* HELP TRAIN AI */}
                <div>
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 flex flex-col items-start relative overflow-hidden border-b-4 border-green-800">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-black text-lg text-white uppercase tracking-wide">Train the AI</h3>
                            </div>
                            <p className="text-green-100 text-sm mb-4 font-medium max-w-[80%]">Help make HelloBrick smarter and earn XP.</p>
                            <button
                                onClick={() => onNavigate(Screen.TRAINING)}
                                className="bg-white text-green-600 px-6 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                            >
                                Start Training
                            </button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                            <Zap className="w-32 h-32" />
                        </div>
                    </div>
                </div>

                {/* 6. MONTHLY BADGES */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Monthly Badges</h2>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {badges.map((badge) => (
                            <button
                                key={badge.id}
                                onClick={() => setSelectedBadge(badge)}
                                className="flex flex-col items-center gap-2 flex-shrink-0 w-24 group transition-transform active:scale-95"
                            >
                                <div className={`w-20 h-20 rounded-full ${badge.color} border-4 border-b-8 border-black/20 flex items-center justify-center relative overflow-hidden shadow-lg ${!badge.completed ? 'grayscale opacity-50' : ''}`}>
                                    <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                                    <span className="text-4xl z-10">{badge.image}</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent z-20 pointer-events-none" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 7. ACHIEVEMENTS */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Achievements</h2>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="space-y-3">
                        {achievements.map((ach) => (
                            <div
                                key={ach.id}
                                onClick={() => setSelectedAchievement(ach)}
                                className="bg-[#1e293b] rounded-2xl p-1 flex items-center gap-4 pr-6 cursor-pointer border border-slate-800 hover:bg-[#253248] transition-colors"
                            >
                                <div className="w-20 h-24 relative flex items-center justify-center">
                                    <div className={`absolute top-2 bottom-2 left-2 right-0 ${ach.color} rounded-b-[30px] rounded-t-lg border-b-4 border-black/20`} />
                                    <span className="relative z-10 text-3xl">{ach.image}</span>
                                </div>
                                <div className="flex-1 py-3">
                                    <h3 className="font-bold text-white text-base mb-1">{ach.title}</h3>
                                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${(ach.level / ach.maxLevel) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold mt-1 text-right">{ach.level}/{ach.maxLevel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ACHIEVEMENT MODAL */}
            {selectedAchievement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)} />
                    <div className="bg-[#1e293b] w-full max-w-sm rounded-[32px] p-8 relative z-10 flex flex-col items-center text-center border-2 border-slate-700">
                        <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                        <div className={`w-32 h-32 ${selectedAchievement.color} rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-[#1e293b] ring-4 ring-offset-4 ring-offset-[#1e293b] ring-white/10`}>
                            <span className="text-6xl">{selectedAchievement.image}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{selectedAchievement.title}</h2>
                        {selectedAchievement.dateEarned && (
                            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg mb-4 uppercase tracking-wider">Unlocked {selectedAchievement.dateEarned}</span>
                        )}
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">{selectedAchievement.description}</p>
                        <button className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Share Achievement</button>
                    </div>
                </div>
            )}

            {/* BADGE MODAL */}
            {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBadge(null)} />
                    <div className="bg-[#1e293b] w-full max-w-sm rounded-[32px] p-8 relative z-10 flex flex-col items-center text-center border-2 border-slate-700">
                        <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                        <div className={`w-36 h-36 rounded-full ${selectedBadge.color} border-4 border-b-8 border-black/20 flex items-center justify-center relative overflow-hidden shadow-2xl mb-8 ${!selectedBadge.completed ? 'grayscale opacity-70' : ''}`}>
                            <div className="absolute inset-3 rounded-full border-2 border-white/20" />
                            <span className="text-7xl z-10">{selectedBadge.image}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent z-20 pointer-events-none" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{selectedBadge.name}</h2>
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">{selectedBadge.description}</p>
                        <button className={`w-full py-4 font-black rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-transform ${selectedBadge.completed ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-slate-700 text-slate-400'}`} disabled={!selectedBadge.completed}>
                            {selectedBadge.completed ? 'Show Off' : 'Locked'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
