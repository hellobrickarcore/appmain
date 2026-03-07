
import React, { useEffect, useState, useRef } from 'react';
import { Wifi, Users, ShieldCheck, Zap } from 'lucide-react';
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

                // 1. Find or create lobby
                const activeLobby = await multiplayerService.findOrJoinLobby(user.id, modeId);
                setLobby(activeLobby);

                // 2. If already matched (joined as opponent)
                if (activeLobby.opponent_id && activeLobby.status === 'matched') {
                    setStatus('CONNECTED');
                    setOpponent({
                        name: 'LegoMaster',
                        avatar: `https://picsum.photos/seed/${activeLobby.host_id}/100/100`,
                        level: 12
                    });
                }

                // 3. Subscribe to real-time updates
                unsubscribe = multiplayerService.subscribeToLobby(activeLobby.id, (updatedLobby) => {
                    setLobby(updatedLobby);

                    if (updatedLobby.status === 'matched' && updatedLobby.opponent_id) {
                        setStatus('CONNECTED');
                        const oppId = updatedLobby.host_id === userIdRef.current
                            ? updatedLobby.opponent_id
                            : updatedLobby.host_id;

                        setOpponent({
                            name: 'BrickHunter',
                            avatar: `https://picsum.photos/seed/${oppId}/100/100`,
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
            // Don't leave here, only on explicit cancel or match start
        };
    }, [modeId]);

    const handleStart = async () => {
        if (lobby) {
            await multiplayerService.startBattle(lobby.id);
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
        <div className="flex flex-col min-h-screen bg-slate-900 font-sans text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-indigo-500/30 rounded-full animate-[ping_3s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-indigo-500/50 rounded-full animate-[ping_3s_linear_infinite_1s]" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

                {/* Status Text */}
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-black mb-2 transition-all duration-300">
                        {status === 'SEARCHING' ? 'Searching for opponent...' : 'Connected'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                        {status === 'SEARCHING' ? (
                            <><Wifi className="w-4 h-4 animate-pulse" /> Scanning Lobby</>
                        ) : (
                            <><ShieldCheck className="w-4 h-4 text-green-500" /> Match Ready</>
                        )}
                    </p>
                </div>

                {/* Avatars */}
                <div className="flex items-center gap-4 mb-12">
                    {/* Player */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <img src={`https://picsum.photos/seed/${userIdRef.current || 'me'}/200/200`} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold">You</span>
                    </div>

                    {/* VS Badge */}
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl rotate-45 flex items-center justify-center shadow-lg z-20">
                        <span className="-rotate-45 font-black text-xl italic">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-2">
                        {status === 'SEARCHING' ? (
                            <div className="w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center animate-pulse">
                                <Users className="w-8 h-8 text-slate-600" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-rose-500 overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-in zoom-in-50 duration-300">
                                <img src={opponent.avatar} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <span className="font-bold text-slate-300">{opponent ? opponent.name : '...'}</span>
                    </div>
                </div>

                {/* Game Mode Pill */}
                <div className="bg-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 border border-slate-700 mb-8">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div className="text-left">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Game Mode</span>
                        <span className="block font-bold text-sm">{getModeName()}</span>
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <div className="p-6 pb-8 relative z-10 flex flex-col gap-3">
                <button
                    onClick={handleStart}
                    disabled={status === 'SEARCHING'}
                    className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all ${status === 'SEARCHING'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-400 active:scale-95'
                        }`}
                >
                    {status === 'SEARCHING' ? 'Waiting...' : 'Start Battle'}
                </button>

                <button
                    onClick={handleCancel}
                    className="w-full py-3 text-slate-500 hover:text-white font-bold text-sm transition-colors uppercase tracking-widest"
                >
                    Cancel Matchmaking
                </button>
            </div>
        </div>
    );
};




