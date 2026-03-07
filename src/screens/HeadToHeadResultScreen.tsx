
import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Meh, Frown, ChevronDown, ChevronUp, Clock, Target, Lightbulb } from 'lucide-react';
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
          const duration = 3000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#F59E0B', '#EF4444', '#3B82F6']
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#F59E0B', '#EF4444', '#3B82F6']
            });
      
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
      }
  }, [result]);

  if (!result) return null;

  // Mock stats since we don't track them in the prototype
  const timeToFirst = Math.floor(Math.random() * 8) + 2; 

  return (
    <div className={`flex flex-col min-h-screen font-sans text-white relative overflow-hidden ${result.won ? 'bg-indigo-600' : 'bg-slate-900'}`}>
        
        {/* Background Patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[70%] bg-gradient-to-b from-white/10 to-transparent rounded-b-[50%]" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
            
            {/* Outcome Icon */}
            <div className="mb-6 animate-in zoom-in duration-500">
                {result.won ? (
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.5)] border-8 border-white/20">
                        <Trophy className="w-16 h-16 text-yellow-900" />
                    </div>
                ) : (
                    <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center shadow-lg border-8 border-slate-600">
                        {result.playerScore === result.opponentScore ? (
                             <Meh className="w-16 h-16 text-slate-400" />
                        ) : (
                             <Frown className="w-16 h-16 text-slate-400" />
                        )}
                    </div>
                )}
            </div>

            <h1 className="text-5xl font-black mb-2 tracking-tight text-center">
                {result.won ? 'VICTORY!' : result.playerScore === result.opponentScore ? 'DRAW' : 'DEFEAT'}
            </h1>
            <p className="text-white/70 font-bold uppercase tracking-widest mb-10">
                {result.won ? 'Outstanding Performance' : 'Better luck next time'}
            </p>

            {/* Score Card */}
            <div className="bg-black/20 backdrop-blur-md rounded-[32px] p-6 w-full max-w-xs flex items-center justify-between mb-8 border border-white/10">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-2 overflow-hidden">
                         <img src="https://picsum.photos/seed/me/100/100" />
                    </div>
                    <span className="block font-black text-2xl">{result.playerScore}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">You</span>
                </div>
                
                <div className="text-white/30 font-black text-2xl">VS</div>

                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-2 overflow-hidden">
                         <img src="https://picsum.photos/seed/u2/100/100" />
                    </div>
                    <span className="block font-black text-2xl">{result.opponentScore}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Opponent</span>
                </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full mb-8">
                <span className="font-bold text-sm">Reward:</span>
                <span className="font-black text-xl text-yellow-300">+{result.xp} XP</span>
            </div>

            {/* Toggle Summary */}
            <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm mb-6 transition-colors"
            >
                {showSummary ? 'Hide Match Details' : 'View Match Details'}
                {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Summary Section */}
            {showSummary && (
                <div className="w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 border border-white/10 animate-in slide-in-from-top-2 fade-in">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">Battle Statistics</h3>

                    <div className="space-y-4">
                        {/* Stat 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                                <Clock className="w-4 h-4 text-indigo-300" />
                                Time to First Find
                            </div>
                            <div className="font-mono font-bold">{timeToFirst}s</div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                                <Target className="w-4 h-4 text-rose-300" />
                                Total Detected
                            </div>
                            <div className="font-mono font-bold">
                                <span className="text-green-400">{result.playerScore}</span> / <span className="text-slate-400">{result.opponentScore}</span>
                            </div>
                        </div>

                        {/* Tip Box */}
                        <div className="bg-black/20 rounded-xl p-3 flex gap-3 mt-4">
                            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-yellow-400 uppercase mb-0.5">Skill Tip</p>
                                <p className="text-xs text-white/80 leading-snug">
                                    {result.won 
                                        ? "Keep moving your camera slowly to maintain high tracking accuracy." 
                                        : "Ensure good lighting to speed up detection times."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/20 backdrop-blur-md pb-8">
            <div className="flex gap-3">
                <button 
                    onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
                    className="flex-1 py-4 rounded-2xl bg-white/10 font-bold hover:bg-white/20 transition-colors"
                >
                    Leave
                </button>
                <button 
                    onClick={() => onNavigate(Screen.H2H_MATCHMAKING)}
                    className="flex-[2] py-4 rounded-2xl bg-white text-indigo-900 font-black shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Rematch
                </button>
            </div>
        </div>

    </div>
  );
};




