import React, { useEffect, useState, useRef } from 'react';
import { Users, Handshake, Zap, ChevronLeft, Sparkles } from 'lucide-react';
import { Screen, GameModeId } from '../types';
import { multiplayerService, Lobby } from '../services/multiplayerService';
import { getCurrentUser } from '../services/supabaseService';

interface HeadToHeadMatchmakingScreenProps {
    onNavigate: (screen: Screen) => void;
    modeId: GameModeId;
}

export const HeadToHeadMatchmakingScreen: React.FC<HeadToHeadMatchmakingScreenProps> = ({ onNavigate, modeId }) => {
    const [status, setStatus] = useState<'SEARCHING' | 'CONNECTED'>('SEARCHING');
    const [opponent, setOpponent] = useState<any>(null);
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const userIdRef = useRef<string | null>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initMatchmaking = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    console.error('User not authenticated');
                    onNavigate(Screen.AUTH);
                    return;
                }
                userIdRef.current = user.id;

                const activeLobby = await multiplayerService.findOrJoinLobby(user.id, modeId);
                setLobby(activeLobby);

                if (activeLobby.opponent_id && activeLobby.status === 'matched') {
                    setStatus('CONNECTED');
                    setOpponent({
                        name: 'BrickMaster',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeLobby.host_id}`,
                        level: 12
                    });
                }

                unsubscribe = multiplayerService.subscribeToLobby(activeLobby.id, (updatedLobby) => {
                    setLobby(updatedLobby);

                    if (updatedLobby.status === 'matched' && updatedLobby.opponent_id) {
                        setStatus('CONNECTED');
                        const oppId = updatedLobby.host_id === userIdRef.current
                            ? updatedLobby.opponent_id
                            : updatedLobby.host_id;

                        setOpponent({
                            name: 'BrickHunter',
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${oppId}`,
                            level: 15
                        });
                    }

                    if (updatedLobby.status === 'started') {
                        onNavigate(Screen.H2H_BATTLE);
                    }

                    if (updatedLobby.status === 'cancelled') {
                        onNavigate(Screen.H2H_MODES);
                    }
                });
            } catch (error) {
                console.error('Matchmaking failed:', error);
            }
        };

        initMatchmaking();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [modeId]);

    const handleStart = async () => {
        if (lobby) {
            await multiplayerService.startMatch(lobby.id);
            onNavigate(Screen.H2H_BATTLE);
        }
    };

    const handleCancel = async () => {
        if (lobby && userIdRef.current) {
            await multiplayerService.leaveLobby(lobby.id, userIdRef.current);
        }
        onNavigate(Screen.H2H_MODES);
    };

    const getModeName = () => {
        switch (modeId) {
            case 'TARGET': return 'Target Hunt';
            case 'SPRINT': return 'Category Sprint';
            case 'MIRROR': return 'Mirror Match';
            default: return 'Battle';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-indigo-500/10 rounded-full animate-[ping_4s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-indigo-500/20 rounded-full animate-[ping_4s_linear_infinite_1.5s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-orange-500/10 rounded-full shadow-[0_0_100px_rgba(249,115,22,0.05)]" />
            </div>

            {/* Header */}
            <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
                <button 
                    onClick={handleCancel}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div className="flex flex-col items-center">
                   <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Connecting</h1>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-yellow-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{getModeName()}</span>
                   </div>
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
                {/* Status Indicator */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl mb-4">
                        {status === 'SEARCHING' ? (
                            <><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Checking lobbies...</span></>
                        ) : (
                            <><Handshake className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Friend connected</span></>
                        )}
                    </div>
                </div>

                {/* Players Display */}
                <div className="w-full flex items-center justify-center gap-4 mb-20">
                    {/* Me */}
                    <div className="flex flex-col items-center gap-4 group">
                        <div className="w-28 h-28 rounded-[40px] border-4 border-indigo-500/30 p-1.5 bg-gradient-to-br from-indigo-500/20 to-transparent shadow-2xl transition-transform group-hover:scale-105">
                            <div className="w-full h-full rounded-[32px] overflow-hidden bg-slate-900 border border-white/10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userIdRef.current || 'hero'}`} className="w-full h-full object-cover" alt="Me" />
                            </div>
                        </div>
                        <div className="text-center">
                           <span className="block text-xs font-black uppercase tracking-widest text-white">Hero</span>
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter">You</span>
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="relative">
                       <div className="w-16 h-16 bg-white text-slate-950 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] z-20 border-4 border-[#050A18]">
                           <span className="-rotate-45 font-black text-2xl italic tracking-tighter">VS</span>
                       </div>
                       <Sparkles className="absolute -top-8 -left-8 w-6 h-6 text-yellow-500/20 animate-pulse" />
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-4 group">
                        <div className={`w-28 h-28 rounded-[40px] p-1.5 shadow-2xl transition-all duration-500 ${status === 'SEARCHING' ? 'border-4 border-white/5 bg-white/5 grayscale opacity-40' : 'border-4 border-rose-500/50 bg-rose-500/10 scale-100 group-hover:scale-105'}`}>
                            <div className="w-full h-full rounded-[32px] overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                                {status === 'SEARCHING' ? (
                                    <Users className="w-10 h-10 text-slate-700 animate-pulse" />
                                ) : (
                                    <img src={opponent?.avatar} className="w-full h-full object-cover animate-in zoom-in-50 duration-500" alt="Opponent" />
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                           <span className={`block text-xs font-black uppercase tracking-widest ${status === 'SEARCHING' ? 'text-slate-800' : 'text-rose-500'}`}>
                             {status === 'SEARCHING' ? 'Searching...' : (opponent?.name || 'Friend')}
                           </span>
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter">Rank {opponent?.level || '??'}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xs space-y-4">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Competition Mode</p>
                        <p className="text-xl font-black text-white capitalize">{getModeName()}</p>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-8 bg-[#050A18]/80 backdrop-blur-xl border-t border-white/5 z-20 space-y-4">
                <button
                    onClick={handleStart}
                    disabled={status === 'SEARCHING'}
                    className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden ${status === 'SEARCHING'
                        ? 'bg-white/5 text-slate-700 border border-white/5 cursor-not-allowed'
                        : 'bg-white text-slate-950 shadow-2xl active:scale-95'
                        }`}
                >
                    {status === 'SEARCHING' ? 'Waiting for Match...' : 'Enter Arena'}
                    {status === 'CONNECTED' && <div className="absolute inset-0 bg-white/20 animate-shine" />}
                </button>

                <button
                    onClick={handleCancel}
                    className="w-full py-2 text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-colors"
                >
                    Exit Lobby
                </button>
            </div>
        </div>
    );
};
