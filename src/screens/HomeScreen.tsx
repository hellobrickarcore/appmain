import * as React from 'react';
import { ScanLine, Lightbulb, Users, Puzzle, ArrowRight, Box, ChevronRight, Brain } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Screen, GameModeId } from '../types';
import { LobbyNotification } from '../components/LobbyNotification';

interface HomeScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
    isPro?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
    const [totalBricks, setTotalBricks] = React.useState(0);
    React.useEffect(() => {
        const stored = localStorage.getItem('hellobrick_collection');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setTotalBricks(parsed.bricks?.length || 0);
            } catch (e) { }
        }
    }, []);

    const handleJoinGame = (modeId: GameModeId) => {
        onNavigate(Screen.H2H_MATCHMAKING, { modeId });
    };

    return (
        <div className="flex flex-col h-full bg-[#050A18] font-sans overflow-hidden">
            <TopBar currentScreen={Screen.HOME} onNavigate={onNavigate} />
            
            {localStorage.getItem('hellobrick_is_pro') === 'true' && (
                <div className="flex justify-center -mt-2 mb-4 relative z-50">
                    <div className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-white">
                            Hello<span className="text-[#FF7A30]">Brick</span> <span className="text-amber-500">Pro</span>
                        </span>
                    </div>
                </div>
            )}

            <div className="relative z-40">
                <LobbyNotification onJoin={handleJoinGame} />
            </div>

            <main className="flex-1 min-h-0 px-6 relative pb-[max(env(safe-area-inset-bottom),120px)] overflow-y-auto no-scrollbar overscroll-contain">
                <div className="mt-10 text-center space-y-3 mb-12">
                    <h1 className="text-4xl font-black text-white tracking-tight">Let's sort your bricks</h1>
                    <p className="text-slate-400 max-w-[280px] mx-auto leading-tight font-medium text-base">
                        Find new life in your pile. Scan to discover builds.
                    </p>
                </div>

                {/* Scanner CTA */}
                <div className="mb-14 flex justify-center relative">
                    <div className="absolute inset-0 bg-orange-600/20 rounded-full blur-[60px] scale-125 -z-10" />

                    <button
                        onClick={() => onNavigate(Screen.SCANNER)}
                        className="relative w-52 h-52 rounded-full bg-gradient-to-b from-[#F97316] to-[#EA580C] flex flex-col items-center justify-center text-white transition-all active:scale-95 shadow-2xl z-10 border-4 border-white/10"
                    >
                        <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/40" />
                        <ScanLine className="w-16 h-16 mb-2 relative z-10" strokeWidth={2.5} />
                        <span className="text-sm font-black tracking-widest relative z-10">TAP TO SCAN</span>
                    </button>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                    <button
                        onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
                        className="col-span-2 bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 p-6 rounded-[28px] border border-indigo-500/20 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white text-lg leading-none">Multiplayer</h3>
                                <p className="text-xs text-indigo-500/60 mt-1.5 font-bold">Compete against other builders</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-400" />
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.IDEAS)}
                        className="col-span-1 bg-[#0F172A]/80 p-6 rounded-[28px] border border-white/5 flex flex-col items-start gap-5 active:scale-95 transition-all"
                    >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white text-lg leading-none">Ideas</h3>
                            <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider">1000+ Builds</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.PUZZLES)}
                        className="col-span-1 bg-[#0F172A]/80 p-6 rounded-[28px] border border-white/5 flex flex-col items-start gap-5 active:scale-95 transition-all"
                    >
                        <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                            <Puzzle className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white text-lg leading-none">Puzzles</h3>
                            <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Daily Games</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.COLLECTION)}
                        className="col-span-2 bg-[#0F172A]/80 p-6 rounded-[28px] border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
                                <Box className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white text-lg leading-none">My Collection</h3>
                                <p className="text-xs text-slate-500 mt-1.5 font-bold">{totalBricks} Bricks Scanned</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>

                    {/* How to Scan Section */}
                    <button
                        onClick={() => onNavigate(Screen.HOW_TO_SCAN)}
                        className="col-span-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-6 rounded-[28px] border border-emerald-500/20 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                <ScanLine className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white text-lg leading-none">Pro Tips</h3>
                                <p className="text-xs text-emerald-500/60 mt-1.5 font-bold">Master the art of the perfect scan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400">
                            <span className="text-[10px] font-black uppercase tracking-wider">Start</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Train the AI Section */}
                    <button
                        onClick={() => onNavigate(Screen.TRAINING_INTRO)}
                        className="col-span-2 bg-gradient-to-r from-orange-500/10 to-amber-500/5 p-6 rounded-[28px] border border-orange-500/20 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                            <h3 className="font-bold text-white text-lg leading-none">Rewards Hub</h3>
                            <p className="text-xs text-orange-500/60 mt-1.5 font-bold">Earn prizes every 2 weeks for building</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-orange-400">
                            <span className="text-[10px] font-black uppercase tracking-wider">Help</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                {/* Feed Row */}
                <div className="mt-2">
                    <button
                        onClick={() => onNavigate(Screen.FEED)}
                        className="w-full bg-[#0F172A]/80 p-6 rounded-[28px] border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-indigo-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white text-lg leading-none">Feed</h3>
                                <p className="text-xs text-slate-500 mt-1.5 font-bold">See what others are building</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};
