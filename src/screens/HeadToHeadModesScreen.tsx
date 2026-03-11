
import React from 'react';
import { ChevronLeft, Target, Timer, Copy, Zap, Brain, Scale, ArrowRight } from 'lucide-react';
import { Screen, GameModeId } from '../types';

interface HeadToHeadModesScreenProps {
    onNavigate: (screen: Screen) => void;
    onSelectMode: (mode: GameModeId) => void;
}

export const HeadToHeadModesScreen: React.FC<HeadToHeadModesScreenProps> = ({ onNavigate, onSelectMode }) => {

    const handleModeSelect = (mode: GameModeId) => {
        onSelectMode(mode);
        onNavigate(Screen.H2H_MATCHMAKING);
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-900 font-sans text-white">
            {/* Header */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-6 flex items-center justify-between z-10">
                <button
                    onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Select Mode</h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 px-6 pb-8 overflow-y-auto no-scrollbar space-y-6">

                {/* Target Hunt */}
                <button
                    onClick={() => handleModeSelect('TARGET')}
                    className="w-full bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 rounded-[40px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-2xl shadow-rose-900/30"
                >
                    <div className="bg-slate-900/10 backdrop-blur-[2px] rounded-[36px] p-6 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <span className="bg-white/20 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm">
                                Fast Paced
                            </span>
                        </div>

                        <h2 className="text-3xl font-black mb-2 leading-tight">Sudden Target Hunt</h2>
                        <p className="text-rose-100 font-medium text-base mb-8 max-w-[90%] opacity-90 leading-relaxed">
                            Race to find a single specific brick before your opponent does.
                        </p>

                        <div className="mt-auto flex items-center gap-3">
                            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="text-xs font-bold text-white/90">Speed</span>
                            </div>
                            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                <Target className="w-3.5 h-3.5 text-rose-300" />
                                <span className="text-xs font-bold text-white/90">Precision</span>
                            </div>
                            <ArrowRight className="ml-auto w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    {/* Decorative blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[60px] pointer-events-none" />
                </button>

                {/* Blind Category Sprint */}
                <button
                    onClick={() => handleModeSelect('SPRINT')}
                    className="w-full bg-gradient-to-br from-violet-500 via-indigo-600 to-indigo-800 rounded-[40px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-2xl shadow-indigo-900/30"
                >
                    <div className="bg-slate-900/10 backdrop-blur-[2px] rounded-[36px] p-6 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Timer className="w-8 h-8 text-white" />
                            </div>
                            <span className="bg-white/20 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm">
                                Skill Based
                            </span>
                        </div>

                        <h2 className="text-3xl font-black mb-2 leading-tight">Category Sprint</h2>
                        <p className="text-indigo-100 font-medium text-base mb-8 max-w-[90%] opacity-90 leading-relaxed">
                            Collect 3 distinct bricks from a random category (e.g. Technic, Plates) ASAP.
                        </p>

                        <div className="mt-auto flex items-center gap-3">
                            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                <Brain className="w-3.5 h-3.5 text-violet-300" />
                                <span className="text-xs font-bold text-white/90">Tactical</span>
                            </div>
                            <ArrowRight className="ml-auto w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
                </button>

                {/* Mirror Match */}
                <button
                    onClick={() => handleModeSelect('MIRROR')}
                    className="w-full bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-800 rounded-[40px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-2xl shadow-blue-900/30"
                >
                    <div className="bg-slate-900/10 backdrop-blur-[2px] rounded-[36px] p-6 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Copy className="w-8 h-8 text-white" />
                            </div>
                            <span className="bg-white/20 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm">
                                Score Attack
                            </span>
                        </div>

                        <h2 className="text-3xl font-black mb-2 leading-tight">Mirror Match</h2>
                        <p className="text-cyan-100 font-medium text-base mb-8 max-w-[90%] opacity-90 leading-relaxed">
                            Find as many of the target item as possible in 60 seconds. High score wins.
                        </p>

                        <div className="mt-auto flex items-center gap-3">
                            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                <Scale className="w-3.5 h-3.5 text-cyan-300" />
                                <span className="text-xs font-bold text-white/90">Fair Play</span>
                            </div>
                            <ArrowRight className="ml-auto w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-[50px] pointer-events-none" />
                </button>

            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 z-20 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
                <button
                    onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
                    className="w-full py-4 text-slate-500 hover:text-white font-bold text-sm transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};




