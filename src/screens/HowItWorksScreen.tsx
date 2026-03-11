
import React from 'react';
import { ChevronLeft, Camera, Lightbulb, BrainCircuit, Scan, ArrowRight, Trophy, Gift } from 'lucide-react';
import { Screen } from '../types';

interface HowItWorksScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-900 font-sans text-white relative">

            {/* Header */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate(Screen.HOME)}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-200">Guide</h1>
                </div>

                <button
                    onClick={() => onNavigate(Screen.HOME)}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10"
                >
                    Skip
                </button>
            </div>

            <div className="px-6 mb-8">
                <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    How it works
                </h1>
                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xs">
                    Turn your chaotic pile of bricks into new creations in simple steps.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-6 no-scrollbar">

                {/* Step 1 */}
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
                    {/* Number Watermark */}
                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-slate-800/50 leading-none select-none pointer-events-none group-hover:text-slate-800/80 transition-colors">
                        1
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4 text-orange-500 ring-1 ring-orange-500/50 shadow-lg shadow-orange-500/10">
                            <Camera className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Spread & Scan</h3>
                        <p className="text-slate-400 leading-relaxed mb-4 text-sm font-medium">
                            Lay your bricks out flat on a table. Ensure good lighting and take a photo using the Scanner.
                        </p>

                        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 flex gap-3 backdrop-blur-sm">
                            <Scan className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <div>
                                <span className="text-xs font-black text-yellow-400 uppercase tracking-wide block mb-0.5">Pro Tip</span>
                                <p className="text-xs text-slate-300 font-medium">
                                    Don't stack bricks! The AI needs to see the studs to identify them.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-slate-800/50 leading-none select-none pointer-events-none group-hover:text-slate-800/80 transition-colors">
                        2
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10">
                            <Lightbulb className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Discover Ideas</h3>
                        <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            The app matches your inventory against thousands of instructions. Filter by what you can build <span className="text-white font-bold">right now</span>.
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-slate-800/50 leading-none select-none pointer-events-none group-hover:text-slate-800/80 transition-colors">
                        3
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10">
                            <BrainCircuit className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Train the Data</h3>
                        <p className="text-slate-400 leading-relaxed mb-4 text-sm font-medium">
                            Help the community by verifying predictions. The more you train, the smarter the app gets.
                        </p>

                        <button
                            onClick={() => onNavigate(Screen.TRAINING_INTRO)}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition-colors border border-slate-700 w-full justify-center group/btn"
                        >
                            Learn about Data Training <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Step 4: Compete & Earn */}
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-slate-800/50 leading-none select-none pointer-events-none group-hover:text-slate-800/80 transition-colors">
                        4
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-400 ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/10">
                            <Trophy className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Compete & Earn</h3>
                        <p className="text-slate-400 leading-relaxed mb-4 text-sm font-medium">
                            Battle other builders in head-to-head challenges. Earn XP and trade it in for real life rewards.
                        </p>

                        <button
                            onClick={() => onNavigate(Screen.REWARDS)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 px-4 py-3 rounded-xl transition-colors shadow-lg shadow-white/10 w-full justify-center group/btn2"
                        >
                            <Gift className="w-3.5 h-3.5 text-pink-500" />
                            View Rewards Store <ArrowRight className="w-3.5 h-3.5 group-hover/btn2:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer Button */}
            <div className="p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 fixed bottom-0 left-0 right-0 z-20 max-w-[400px] mx-auto">
                <button
                    onClick={() => onNavigate(Screen.NOTIFICATIONS_INTRO)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 hover:brightness-110"
                >
                    <ArrowRight className="w-5 h-5" />
                    Continue
                </button>
            </div>
        </div>
    );
};




