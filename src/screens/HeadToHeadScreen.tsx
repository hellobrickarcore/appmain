
import React, { useState, useEffect } from 'react';
import { ChevronLeft, QrCode, Scan, Swords, UserPlus, X } from 'lucide-react';
import { Screen } from '../types';

interface HeadToHeadScreenProps {
    onNavigate: (screen: Screen) => void;
    isPro?: boolean;
}

interface BattleRecord {
    id: string;
    opponent: string;
    result: 'win' | 'loss';
    xp: number;
    timestamp: number;
}

export const HeadToHeadScreen: React.FC<HeadToHeadScreenProps> = ({ onNavigate }) => {
    const [showIdInput, setShowIdInput] = useState(false);
    const [connectId, setConnectId] = useState('');
    const [recentBattles, setRecentBattles] = useState<BattleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load real battle history
    useEffect(() => {
        const loadBattles = async () => {
            try {
                const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';
                const response = await fetch(`/api/xp/battles?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecentBattles(data.battles || []);
                }
            } catch (error) {
                console.log('No battle history yet');
            } finally {
                setIsLoading(false);
            }
        };
        loadBattles();
    }, []);

    // Simulates connecting and moving to mode selection
    const handleConnect = () => {
        onNavigate(Screen.H2H_MODES);
    };

    // H2H is now open to all Master Builders

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-900 font-sans text-white relative">
            {/* Header */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-6 flex items-center gap-4">
                <button
                    onClick={() => onNavigate(Screen.QUESTS)}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Head to Head</h1>
            </div>

            <div className="flex-1 px-6 flex flex-col items-center">

                <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-2xl border border-indigo-500/30">
                    {/* Neon Glow Effects */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]" />
                    <Swords className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Ready to Battle?</h2>
                        <p className="text-indigo-200 text-sm mb-6 font-medium">Scan your opponent's code or show yours to start a 1v1 challenge.</p>

                        <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
                            <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                                {/* Fake QR Code Visual */}
                                <div className="absolute inset-2 border-4 border-white rounded-lg flex flex-wrap content-start p-2 gap-1 opacity-50">
                                    {[...Array(64)].map((_, i) => (
                                        <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                                        <QrCode className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-bold font-mono bg-black/40 px-3 py-1.5 rounded-lg text-indigo-200 tracking-widest uppercase">
                            ID: {localStorage.getItem('hellobrick_userId')?.substring(0, 8) || 'GUEST-' + Math.floor(Math.random() * 1000)}
                        </span>
                    </div>
                </div>

                <div className="w-full flex gap-3">
                    <button
                        onClick={handleConnect}
                        className="flex-1 bg-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border border-slate-700 hover:bg-slate-700"
                    >
                        <QrCode className="w-6 h-6 text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-300">My Code</span>
                    </button>
                    <button
                        onClick={handleConnect}
                        className="flex-1 bg-white text-slate-900 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-indigo-500/20"
                    >
                        <Scan className="w-6 h-6 text-indigo-600" />
                        <span className="text-[10px] font-bold">Scan Opponent</span>
                    </button>
                    <button
                        onClick={() => setShowIdInput(true)}
                        className="flex-1 bg-indigo-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-indigo-500/20"
                    >
                        <UserPlus className="w-6 h-6 text-white" />
                        <span className="text-[10px] font-bold">Enter ID</span>
                    </button>
                </div>

                <div className="mt-8 w-full">
                    <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Recent Battles</p>
                    {isLoading ? (
                        <p className="text-center text-slate-600 text-sm">Loading...</p>
                    ) : recentBattles.length === 0 ? (
                        <div className="text-center py-8">
                            <Swords className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm font-bold">No battles yet</p>
                            <p className="text-slate-600 text-xs mt-1">Challenge a friend to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 w-full">
                            {recentBattles.map((battle) => (
                                <div key={battle.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                                    <div className={`w-8 h-8 ${battle.result === 'win' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} rounded-full flex items-center justify-center text-xs font-black`}>
                                        {battle.result === 'win' ? 'W' : 'L'}
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">vs. {battle.opponent}</span>
                                    <span className={`ml-auto text-xs font-bold ${battle.result === 'win' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                        +{battle.xp} XP
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Enter ID Modal */}
            {showIdInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowIdInput(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900">Connect to Battle</h3>
                            <button onClick={() => setShowIdInput(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:text-slate-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-slate-500 text-sm mb-4">Enter your opponent's unique ID to start a direct match.</p>

                        <input
                            type="text"
                            placeholder="e.g. BRICK-123"
                            className="w-full bg-slate-100 rounded-xl px-4 py-4 text-slate-900 font-bold mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={connectId}
                            onChange={(e) => setConnectId(e.target.value)}
                        />

                        <button
                            onClick={handleConnect}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                        >
                            Start Match
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};




