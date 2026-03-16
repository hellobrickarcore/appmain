// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Facebook, Twitter, Instagram, Download, Plus, Sparkles, Star } from 'lucide-react';
import { Screen, Creation } from '../types';

interface MyCreationsScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const MyCreationsScreen: React.FC<MyCreationsScreenProps> = ({ onNavigate }) => {
    const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [creations, setCreations] = useState<Creation[]>([]);

    useEffect(() => {
        // TODO: Load creations from backend API
        setCreations([]);
    }, []);

    const handleShare = async (platform: string) => {
        const text = `Check out my build: ${selectedCreation?.title} on HelloBrick!`;
        const url = window.location.href;

        if (platform === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: 'HelloBrick Creation',
                    text: text,
                    url: url,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            const intentUrls: Record<string, string> = {
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                instagram: `https://www.instagram.com/`
            };

            if (intentUrls[platform]) {
                window.open(intentUrls[platform], '_blank');
            } else {
                alert(`Shared to ${platform}!`);
            }
        }
        setShowShareModal(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -ml-48 -mb-48" />

            {/* Header */}
            <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#050A18]/80 sticky top-0">
                <button
                    onClick={() => onNavigate(Screen.PROFILE)}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Archives</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Built Manifests</span>
                    </div>
                </div>
                <button 
                   onClick={() => onNavigate(Screen.CREATE_POST)}
                   className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6 grid grid-cols-2 gap-6 pb-32">
                {creations.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                           <Star className="w-8 h-8 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Vault Empty</h3>
                        <p className="text-slate-500 text-sm font-bold max-w-[200px]">Start building and archive your manifests here.</p>
                    </div>
                ) : creations.map((creation) => (
                    <div
                        key={creation.id}
                        onClick={() => setSelectedCreation(creation)}
                        className="bg-white/5 rounded-[32px] p-2 border border-white/5 active:scale-95 transition-all group cursor-pointer shadow-2xl"
                    >
                        <div className="aspect-square rounded-[26px] overflow-hidden mb-3 relative border border-white/5 shadow-inner">
                            <img src={creation.image} alt={creation.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        </div>
                        <div className="px-3 pb-3">
                            <h3 className="font-black text-white text-sm uppercase tracking-tight line-clamp-1">{creation.title}</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mt-1">{creation.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedCreation && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedCreation(null)} />
                    <div className="bg-[#050A18] border border-white/10 w-full max-w-md rounded-[48px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                        <div className="rounded-[36px] overflow-hidden mb-8 shadow-3xl border border-white/10 aspect-square">
                            <img src={selectedCreation.image} alt={selectedCreation.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">{selectedCreation.title}</h2>
                                <p className="text-slate-500 font-black text-xs uppercase tracking-widest">{selectedCreation.date}</p>
                            </div>
                            <div className="bg-orange-500/10 px-4 py-2 rounded-2xl border border-orange-500/20 whitespace-nowrap">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{selectedCreation.partsUsed} Parts</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-full bg-white text-slate-950 font-black py-6 rounded-[32px] flex items-center justify-center gap-3 shadow-3xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                        >
                            <Share2 className="w-5 h-5" />
                            Broadcast Build
                        </button>
                    </div>
                </div>
            )}

            {/* Share Sheet */}
            {showShareModal && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-8">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
                    <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-[48px] p-10 relative z-10 animate-in slide-in-from-bottom-5">
                        <h3 className="text-sm font-black text-center mb-8 uppercase tracking-[0.3em] text-slate-500">Select Protocol</h3>
                        <div className="flex justify-between items-center px-2">
                            <button onClick={() => handleShare('instagram')} className="flex flex-col items-center gap-3 group">
                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-3xl group-active:scale-90 transition-transform">
                                    <Instagram className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stories</span>
                            </button>
                            <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-3 group">
                                <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-black shadow-3xl group-active:scale-90 transition-transform">
                                    <Twitter className="w-8 h-8 fill-current" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">X-Intel</span>
                            </button>
                            <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-3 group">
                                <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-3xl group-active:scale-90 transition-transform">
                                    <Facebook className="w-8 h-8 fill-current" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global</span>
                            </button>
                            <button onClick={() => handleShare('native')} className="flex flex-col items-center gap-3 group">
                                <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shadow-3xl group-active:scale-90 transition-transform">
                                    <Share2 className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">More</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-10 py-5 bg-white/5 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-xs border border-white/5"
                        >
                            Abort
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
