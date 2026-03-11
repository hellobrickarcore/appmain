import React, { useState } from 'react';
import { ChevronLeft, Gem, Lock, Star, Play, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface PuzzlesScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

const LEVELS = [
    { id: 1, name: 'Shape Fit', type: 'Easy', stars: 0, locked: false, gradient: 'from-emerald-400 to-green-500', emoji: '🟩' },
    { id: 2, name: 'Color Match', type: 'Easy', stars: 0, locked: false, gradient: 'from-cyan-400 to-blue-500', emoji: '🎨' },
    { id: 3, name: 'Balance Tower', type: 'Medium', stars: 0, locked: true, gradient: 'from-amber-400 to-orange-500', emoji: '🏗️' },
    { id: 4, name: 'Bridge Builder', type: 'Medium', stars: 0, locked: true, gradient: 'from-orange-400 to-red-500', emoji: '🌉' },
    { id: 5, name: 'Gear Logic', type: 'Hard', stars: 0, locked: true, gradient: 'from-red-400 to-rose-600', emoji: '⚙️' },
    { id: 6, name: 'Master Architect', type: 'Expert', stars: 0, locked: true, gradient: 'from-purple-400 to-violet-600', emoji: '👑' },
];

export const PuzzlesScreen: React.FC<PuzzlesScreenProps> = ({ onNavigate }) => {
    const [tappedLevel, setTappedLevel] = useState<number | null>(null);
    const gems = LEVELS.filter(l => !l.locked).length * 100;

    const handlePlay = (level: typeof LEVELS[0]) => {
        if (level.locked) return;
        setTappedLevel(level.id);

        // Define challenge based on level
        const challenge = {
            id: level.id,
            name: level.name,
            type: level.name === 'Shape Fit' ? 'SHAPE' : 'COLOR',
            target: level.name === 'Shape Fit' ? 'Brick 2x4' : 'Red',
            reward: 100
        };

        // Navigate to scanner to play puzzle
        setTimeout(() => {
            setTappedLevel(null);
            onNavigate(Screen.SCANNER, { challenge });
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#0B1736] font-sans text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFC905]/8 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-20 left-0 w-64 h-64 bg-blue-500/8 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />

            {/* Floating decorative bricks */}
            <div className="absolute top-24 right-6 w-4 h-4 bg-[#FFC905] rounded-sm rotate-12 opacity-20 animate-[float_6s_ease-in-out_infinite]" />
            <div className="absolute top-60 left-4 w-3 h-3 bg-blue-400 rounded-sm -rotate-12 opacity-15 animate-[float_8s_ease-in-out_infinite_1s]" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-2 flex items-center justify-between">
                <button
                    onClick={() => onNavigate(Screen.HOME)}
                    className="w-10 h-10 bg-white/8 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 transition-all border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 opacity-0 pointer-events-none">
                    <Gem className="w-4 h-4 text-[#FFC905] fill-[#FFC905]" />
                    <span className="font-black text-sm">{gems}</span>
                </div>
            </div>

            {/* Hero */}
            <div className="relative z-10 px-6 pt-4 pb-6">
                <h1 className="text-3xl font-black tracking-tight mb-1">Puzzles</h1>
                <p className="text-blue-200/50 font-medium text-sm">Solve building challenges to earn gems</p>
            </div>

            {/* Level map */}
            <div className="flex-1 relative z-10 px-5 pb-28 overflow-y-auto no-scrollbar">
                <div className="relative">
                    {/* Vertical connecting track */}
                    <div className="absolute left-[46px] top-8 bottom-8 w-[3px] bg-gradient-to-b from-emerald-500/30 via-amber-500/20 to-purple-500/10 rounded-full" />

                    <div className="flex flex-col gap-5">
                        {LEVELS.map((level) => (
                            <div
                                key={level.id}
                                className={`relative flex items-center gap-4 transition-all duration-300 ${level.locked ? 'opacity-40' : ''
                                    }`}
                            >
                                {/* Level number / lock badge */}
                                <div className={`
                  relative z-10 w-[68px] h-[68px] rounded-2xl flex items-center justify-center flex-shrink-0
                  shadow-lg transition-all duration-300
                  ${level.locked
                                        ? 'bg-white/5 border border-white/10'
                                        : `bg-gradient-to-br ${level.gradient} shadow-lg`
                                    }
                  ${tappedLevel === level.id ? 'scale-110 ring-4 ring-white/20' : ''}
                `}>
                                    {level.locked ? (
                                        <Lock className="w-6 h-6 text-white/30" />
                                    ) : (
                                        <>
                                            <span className="text-2xl font-black text-white drop-shadow-sm">{level.id}</span>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl pointer-events-none" />
                                        </>
                                    )}
                                </div>

                                {/* Card content */}
                                <div
                                    onClick={() => handlePlay(level)}
                                    className={`
                    flex-1 rounded-2xl p-4 pr-3 flex items-center justify-between
                    transition-all duration-200
                    ${level.locked
                                            ? 'bg-white/[0.02] border border-white/5'
                                            : 'bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] cursor-pointer active:scale-[0.98]'
                                        }
                  `}
                                >
                                    <div>
                                        <h3 className={`font-bold text-base leading-tight mb-1 ${level.locked ? 'text-white/40' : 'text-white'}`}>
                                            {level.name}
                                        </h3>
                                        {level.locked ? (
                                            <span className="text-[11px] font-bold text-white/20 uppercase tracking-wider">
                                                Complete Level {level.id - 1} to unlock
                                            </span>
                                        ) : (
                                            <div className="flex gap-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < level.stars
                                                            ? 'text-[#FFC905] fill-[#FFC905]'
                                                            : 'text-white/15'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {!level.locked && (
                                        <div className={`w-11 h-11 rounded-xl bg-[#FFC905] flex items-center justify-center shadow-lg shadow-yellow-500/20 transition-all duration-200 ${tappedLevel === level.id ? 'scale-90' : 'hover:scale-105'
                                            }`}>
                                            <Play className="w-5 h-5 text-[#0B1736] fill-[#0B1736] ml-0.5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon footer */}
                <div className="mt-10 mb-4 text-center flex flex-col items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFC905]/40" />
                    <p className="text-xs font-bold text-blue-200/30 uppercase tracking-widest">
                        More puzzles coming soon
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate, 0deg)); }
        }
      `}</style>
        </div>
    );
};
