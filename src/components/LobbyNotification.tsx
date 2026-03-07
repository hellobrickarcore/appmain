import React, { useEffect, useState } from 'react';
import { Users, Zap, X } from 'lucide-react';
import { multiplayerService, Lobby } from '../services/multiplayerService';
import { getCurrentUser } from '../services/supabaseService';
import { GameModeId } from '../types';

interface LobbyNotificationProps {
    onJoin: (modeId: GameModeId) => void;
}

export const LobbyNotification: React.FC<LobbyNotificationProps> = ({ onJoin }) => {
    const [waitingLobbies, setWaitingLobbies] = useState<Lobby[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchLobbies = async () => {
            const user = await getCurrentUser();
            if (!user) return;

            const lobbies = await multiplayerService.getWaitingLobbies();
            // Filter out own lobbies
            setWaitingLobbies(lobbies.filter(l => l.host_id !== user.id));
        };

        fetchLobbies();

        // Real-time subscription for ANY waiting lobby
        // Note: For a production app, we'd use a more targeted subscription or a 'presence' system
        const channel = multiplayerService.subscribeToAllLobbies((payload) => {
            if (payload.new && payload.new.status === 'waiting') {
                fetchLobbies();
            } else if (payload.old && (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE')) {
                fetchLobbies();
            }
        });

        return () => {
            multiplayerService.unsubscribe(channel);
        };
    }, []);

    if (waitingLobbies.length === 0 || !isVisible) return null;

    const lobby = waitingLobbies[0];
    const modeName = lobby.mode_id === 'TARGET' ? 'Target Hunt' :
        lobby.mode_id === 'SPRINT' ? 'Category Sprint' : 'Mirror Match';

    return (
        <div className="fixed bottom-24 left-6 right-6 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 rounded-3xl shadow-[0_15px_30px_rgba(79,70,229,0.4)] border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white relative">
                        <Users className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-600 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-black text-white text-sm uppercase tracking-tight">Game Waiting!</h4>
                        <p className="text-indigo-100 text-xs font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {modeName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onJoin(lobby.mode_id as GameModeId)}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-black text-xs uppercase shadow-sm hover:bg-indigo-50 active:scale-95 transition-all"
                    >
                        Join Now
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-indigo-200 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
