import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Meh, Frown, ChevronDown, ChevronUp, Clock, Target, Lightbulb, Sparkles, Handshake, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen, BattleResult } from '../types';

interface HeadToHeadResultScreenProps {
  onNavigate: (screen: Screen) => void;
  result: BattleResult | null;
}

export const HeadToHeadResultScreen: React.FC<HeadToHeadResultScreenProps> = ({ onNavigate, result }) => {
  const [showSummary, setShowSummary] = useState(false);
  
  useEffect(() => {
      if (result?.won) {
          const duration = 4000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 60,
              origin: { x: 0, y: 0.6 },
              colors: ['#6366F1', '#F59E0B', '#10B981']
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 60,
              origin: { x: 1, y: 0.6 },
              colors: ['#6366F1', '#F59E0B', '#10B981']
            });
      
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
      }
  }, [result]);

  if (!result) return null;

  const timeToFirst = Math.floor(Math.random() * 8) + 2; 

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
        
        {/* Background Visuals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b opacity-20 ${result.won ? 'from-emerald-600/20' : 'from-rose-600/20'} via-transparent to-transparent`} />
            {result.won && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" />
            )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 pt-20">
            
            {/* Outcome Visual */}
            <div className="relative mb-12 group">
                <div className={`absolute inset-0 rounded-full blur-[40px] opacity-50 ${result.won ? 'bg-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.5)]' : 'bg-rose-500/30'}`} />
                <div className={`w-40 h-40 rounded-[60px] flex items-center justify-center border-4 relative z-10 transition-transform group-hover:scale-110 duration-500 shadow-3xl ${result.won ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-900 border-white/5'}`}>
                    {result.won ? (
                        <Trophy className="w-16 h-16 text-slate-950" />
                    ) : (
                        <div className="relative">
                           <Handshake className="w-16 h-16 text-slate-700" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              {result.playerScore === result.opponentScore ? <Meh className="w-10 h-10" /> : <Frown className="w-10 h-10" />}
                           </div>
                        </div>
                    )}
                </div>
                {result.won && (
                   <div className="absolute -top-4 -right-4 bg-orange-500 p-3 rounded-2xl shadow-2xl rotate-12 animate-bounce">
                      <Sparkles className="w-5 h-5 text-white" />
                   </div>
                )}
            </div>

            <h1 className="text-5xl font-black mb-3 tracking-tighter text-center uppercase">
                {result.won ? 'Victory' : result.playerScore === result.opponentScore ? 'Stalemate' : 'Defeat'}
            </h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">
                {result.won ? 'Great job in the Arena!' : 'Good effort! Ready for another?'}
            </p>

            {/* Match Stats Table */}
            <div className="w-full max-w-sm bg-white/5 border border-white/5 rounded-[48px] p-10 mb-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="flex items-center justify-between mb-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 p-1">
                             <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=hero`} className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <div className="text-center">
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">You</span>
                           <span className="block font-black text-3xl text-white">{result.playerScore}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">VS</span>
                       <div className="h-12 w-[1px] bg-gradient-to-b from-white/5 via-white/20 to-white/5" />
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl border-2 border-white/5 p-1 opacity-60">
                             <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`} className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <div className="text-center">
                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Opponent</span>
                           <span className="block font-black text-3xl text-slate-400">{result.opponentScore}</span>
                        </div>
                    </div>
                </div>

                <div className={`p-5 rounded-3xl border flex items-center justify-center gap-4 ${result.won ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Earnings:</span>
                   <div className="flex items-center gap-2">
                       <Sparkles className={`w-3.5 h-3.5 ${result.won ? 'text-yellow-500' : 'text-slate-500'}`} />
                       <span className={`text-xl font-black ${result.won ? 'text-white' : 'text-slate-400'}`}>+{result.xp} XP</span>
                   </div>
                </div>
            </div>

            {/* Toggle Summary */}
            <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2.5 bg-white/5 px-6 py-2.5 rounded-full text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest mb-10 transition-all active:scale-95 border border-white/5"
            >
                {showSummary ? 'Condense Data' : 'Deep Analytics'}
                {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Summary Section */}
            {showSummary && (
                <div className="w-full max-w-sm bg-[#0A0F1E] rounded-[40px] p-8 mb-10 border border-white/10 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3" />
                       Match Analytics
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                   <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-300">Target Reaction</span>
                            </div>
                            <div className="font-black text-white text-lg">{timeToFirst}s</div>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                                   <Target className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-300">Scanner Lock</span>
                            </div>
                            <div className="font-black text-white text-lg">
                                <span className="text-emerald-500">{result.playerScore}</span>
                                <span className="text-slate-700 mx-2">/</span>
                                <span className="text-slate-500">{result.opponentScore}</span>
                            </div>
                        </div>

                        <div className="bg-[#050A18] rounded-3xl p-5 flex gap-4 mt-8 border border-white/5">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                               <Lightbulb className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1">Battle Tip</p>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                    {result.won 
                                        ? "Perfect focus maintained. Your detection latency is in the 98th percentile." 
                                        : "Enhance environment luminance to prioritize faster object confirmation."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>

        {/* Action Hub */}
        <div className="p-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] bg-[#050A18]/80 backdrop-blur-3xl border-t border-white/5 relative z-50">
            <div className="flex gap-4">
                <button 
                    onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
                    className="flex-1 py-5 rounded-[32px] bg-white/5 border border-white/10 text-slate-300 font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                >
                    Leave Arena
                </button>
                <button 
                    onClick={() => onNavigate(Screen.H2H_MATCHMAKING)}
                    className="flex-[1.5] py-5 rounded-[32px] bg-white text-slate-950 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    New Match
                </button>
            </div>
        </div>

    </div>
  );
};
