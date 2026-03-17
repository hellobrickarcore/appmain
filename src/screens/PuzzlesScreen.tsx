import React from 'react';
import { ChevronLeft, Lock, Play, Trophy, Sparkles, Star } from 'lucide-react';
import { Screen } from '../types';

interface PuzzlesScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

const LEVELS = [
    { id: 1, name: 'Find a 2x4 Brick', target: '2x4 brick', type: 'Easy', stars: 0, locked: false, emoji: '🧱', xp: 100 },
    { id: 2, name: 'Red Only Challenge', target: 'red', type: 'Easy', stars: 0, locked: false, emoji: '🎨', xp: 150 },
    { id: 3, name: 'Technic Discovery', target: 'technic', type: 'Medium', stars: 0, locked: true, emoji: '⚙️', xp: 300 },
    { id: 4, name: 'Mini-fig Hunter', target: 'minifigure', type: 'Medium', stars: 0, locked: true, emoji: '🌉', xp: 500 },
];

export const PuzzlesScreen: React.FC<PuzzlesScreenProps> = ({ onNavigate }) => {
    const handlePlay = (level: typeof LEVELS[0]) => {
        if (level.locked) return;

        const challenge = {
            id: level.id,
            type: level.name,
            target: level.target,
            difficulty: level.id,
            isNew: true
        };

        onNavigate(Screen.SCANNER, { challenge });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none z-0" />

            <main className="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar pb-32">
                {/* Header */}
                <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
                    <button
                        onClick={() => onNavigate(Screen.HOME)}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <div className="flex flex-col items-center">
                       <h1 className="text-sm font-black text-white">CHALLENGES</h1>
                       <div className="flex items-center gap-1 mt-0.5">
                          <Trophy className="w-2.5 h-2.5 text-orange-500" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">3,400 XP Total</span>
                       </div>
                    </div>
                    <div className="w-10" />
                </div>

                <div className="px-6 pt-10 mb-10 text-left">
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Missions</h2>
                    <p className="text-slate-500 font-bold text-sm mt-2">Scan specific parts to unlock rewards and XP</p>
                </div>

                <div className="px-6 space-y-4">
                    {LEVELS.map((level) => (
                        <div
                            key={level.id}
                            onClick={() => handlePlay(level)}
                            className={`
                                relative p-8 rounded-[40px] border transition-all duration-300 group overflow-hidden
                                ${level.locked 
                                    ? 'bg-white/[0.02] border-white/5 opacity-50' 
                                    : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-white/[0.08] cursor-pointer active:scale-[0.97] shadow-xl'
                                }
                            `}
                        >
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`
                                    w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl shadow-2xl border
                                    ${level.locked ? 'bg-slate-900 border-white/5 grayscale' : `bg-white/5 border-white/10 opacity-100`}
                                `}>
                                    {level.locked ? <Lock className="w-6 h-6 text-slate-700" /> : level.emoji}
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="font-black text-xl text-white leading-tight">{level.name}</h3>
                                        {level.locked && <Lock className="w-4 h-4 text-slate-700" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${level.locked ? 'border-slate-800 text-slate-700' : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'}`}>
                                            {level.type}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                +{level.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!level.locked && (
                                    <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Progres indicators if needed */}
                            {!level.locked && (
                               <div className="mt-6 flex gap-1 items-center justify-start opacity-30">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <Star className="w-3 h-3 text-slate-500" />
                                  <Star className="w-3 h-3 text-slate-500" />
                               </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 px-10 text-center pb-20">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-6">New Missions in 2d 14h</p>
                    <div className="flex justify-center gap-4">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-slate-800" />
                           </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
