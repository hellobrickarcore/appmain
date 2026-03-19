import React, { useState, useEffect } from 'react';
import { ChevronLeft, QrCode, Scan, Handshake, UserPlus, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Screen } from '../types';

interface HeadToHeadScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
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
    const [idError, setIdError] = useState('');
    const [recentBattles, setRecentBattles] = useState<BattleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                console.error('Failed to load battle history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBattles();
    }, []);

    const handleConnect = async () => {
        if (!connectId || connectId.trim().length < 3) {
            setIdError('Please enter a valid Arena ID');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/xp/search?query=${encodeURIComponent(connectId)}`);
            const data = await response.json();
            
            if (data.success && data.user) {
                setIdError('');
                setShowIdInput(false);
                onNavigate(Screen.H2H_MODES, { opponent: data.user });
            } else {
                setIdError(data.error || 'User not found, please try again');
            }
        } catch (error) {
            setIdError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={() => onNavigate(Screen.QUESTS)}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div className="flex flex-col items-center">
                   <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Arena</h1>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active League</span>
                   </div>
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-8">
                <div className="px-6 flex flex-col items-center">
                    {/* QR / Identity Card */}
                    <div className="w-full bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[48px] p-1 mb-10 shadow-2xl shadow-indigo-500/10 active:scale-[0.99] transition-all">
                        <div className="bg-[#050A18]/40 backdrop-blur-3xl rounded-[44px] p-8 relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />

                            <h2 className="text-2xl font-black mb-1 tracking-tight">Match Profile</h2>
                            <p className="text-indigo-200 text-[10px] mb-8 font-black uppercase tracking-widest opacity-60">Ready for Arena Match</p>

                            <div className="bg-white p-5 rounded-[40px] shadow-2xl mb-8 relative group">
                                <div className="absolute inset-0 bg-blue-600/20 rounded-[40px] animate-pulse pointer-events-none" />
                                <div className="w-48 h-48 bg-slate-900 rounded-3xl flex items-center justify-center relative overflow-hidden p-4">
                                    <div className="absolute inset-2 border-2 border-white/20 rounded-lg flex flex-wrap content-start p-1 gap-1 opacity-20">
                                        {[...Array(64)].map((_, i) => (
                                            <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                                        ))}
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl">
                                            <QrCode className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">ARENA ID:</p>
                               <span className="text-sm font-black text-white tracking-[0.1em]">
                                 {localStorage.getItem('hellobrick_profile_name')?.toUpperCase() || 'BUILDER-PRO'}
                               </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="w-full grid grid-cols-2 gap-4 mb-12">
                        <button
                            onClick={() => onNavigate(Screen.SCANNER, { mode: 'h2h' })}
                            className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                               <Scan className="w-6 h-6" />
                            </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">Scan Opponent</span>
                        </button>
                        <button
                            onClick={() => setShowIdInput(true)}
                            className="bg-white text-slate-950 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl"
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-950">
                               <UserPlus className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Manual Link</span>
                        </button>
                    </div>

                    {/* Battle History */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Recent Matches</h3>
                           <Sparkles className="w-4 h-4 text-orange-500/50" />
                        </div>
                        
                        {isLoading ? (
                            <div className="py-20 flex justify-center"><div className="w-6 h-6 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" /></div>
                        ) : recentBattles.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-[40px] border border-white/5">
                                <Handshake className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500 text-sm font-black uppercase tracking-widest">No Matches Logged</p>
                                <p className="text-[10px] text-slate-600 font-bold mt-2">Connect with a friend to start!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 w-full">
                                {recentBattles.map((battle) => (
                                    <div key={battle.id} className="flex items-center gap-4 p-5 rounded-[28px] bg-white/5 border border-white/5 group active:scale-[0.98] transition-all">
                                        <div className={`w-10 h-10 ${battle.result === 'win' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'} rounded-2xl flex items-center justify-center text-xs font-black`}>
                                            {battle.result === 'win' ? 'W' : 'L'}
                                        </div>
                                        <div className="flex-1 text-left">
                                           <span className="text-sm font-black text-white block">vs. {battle.opponent}</span>
                                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">{new Date(battle.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right">
                                           <span className={`text-base font-black ${battle.result === 'win' ? 'text-indigo-500' : 'text-slate-600'}`}>
                                               +{battle.xp}
                                           </span>
                                           <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest ml-1">XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enter ID Modal */}
            {showIdInput && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 pointer-events-none">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setShowIdInput(false)} />
                    <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-[48px] p-10 relative z-10 pointer-events-auto animate-in slide-in-from-bottom-10 shadow-3xl">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tight">Direct Match</h3>
                            <button onClick={() => setShowIdInput(false)} className="bg-white/5 p-3 rounded-full text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">Enter an opponent's Arena ID to request a friendly multiplayer match.</p>

                        <div className={`bg-black/40 border rounded-3xl p-1 mb-4 focus-within:border-indigo-500/50 transition-colors ${idError ? 'border-red-500/50' : 'border-white/10'}`}>
                           <input
                               type="text"
                               placeholder="e.g. BRICK-123"
                               className="w-full bg-transparent px-6 py-5 text-white font-black text-lg outline-none placeholder:text-slate-800"
                               value={connectId}
                               onChange={(e) => {
                                   setConnectId(e.target.value.toUpperCase());
                                   setIdError('');
                               }}
                           />
                        </div>

                        {idError && (
                            <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-6 px-4 animate-bounce">
                                {idError}
                            </p>
                        )}

                        <button
                            onClick={handleConnect}
                            className="w-full bg-white text-slate-950 font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                        >
                            Connect Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
