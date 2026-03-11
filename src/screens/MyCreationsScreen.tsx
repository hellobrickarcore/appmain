// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Facebook, Twitter, Instagram, Download, Plus } from 'lucide-react';
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
        const text = `Check out my build: ${selectedCreation?.title} on BrickSort AI!`;
        const url = window.location.href;

        if (platform === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: 'BrickSort AI Creation',
                    text: text,
                    url: url,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Mock sharing for other platforms
            const intentUrls: Record<string, string> = {
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                instagram: `https://www.instagram.com/` // No direct web share api for insta usually
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
        <div className="flex flex-col min-h-[100dvh] bg-[#faf9f6]">
            {/* Header */}
            <div className="bg-white px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
                <button
                    onClick={() => onNavigate(Screen.PROFILE)}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">My Creations</h1>
                <button className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-2 gap-4 pb-24">
                {creations.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-500">
                        <p>No creations yet. Start building!</p>
                    </div>
                ) : creations.map((creation) => (
                    <div
                        key={creation.id}
                        onClick={() => setSelectedCreation(creation)}
                        className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 break-inside-avoid relative group cursor-pointer"
                    >
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                            <img src={creation.image} alt={creation.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <div className="px-1">
                            <h3 className="font-bold text-slate-800 text-sm">{creation.title}</h3>
                            <p className="text-xs text-slate-400">{creation.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedCreation && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={() => setSelectedCreation(null)} />

                    <div className="bg-white w-full max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 relative z-10 animate-[scan_0.3s_ease-out_reverse] pointer-events-auto m-4">
                        <button
                            onClick={() => setSelectedCreation(null)}
                            className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
                        >
                            <ChevronLeft className="w-5 h-5 rotate-270" />
                        </button>

                        <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
                            <img src={selectedCreation.image} alt={selectedCreation.title} className="w-full h-64 object-cover" />
                        </div>

                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{selectedCreation.title}</h2>
                                <p className="text-slate-500">Built {selectedCreation.date}</p>
                            </div>
                            <div className="bg-orange-50 px-3 py-1 rounded-full">
                                <span className="text-sm font-bold text-orange-600">{selectedCreation.partsUsed} Parts</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 transition-transform"
                        >
                            <Share2 className="w-5 h-5" />
                            Share Build
                        </button>
                    </div>
                </div>
            )}

            {/* Share Sheet */}
            {showShareModal && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/20" onClick={() => setShowShareModal(false)} />
                    <div className="bg-white w-full max-w-[400px] rounded-t-[32px] p-8 relative animate-[scan_0.3s_ease-out_reverse]">
                        <h3 className="text-lg font-bold text-center mb-6">Share to...</h3>
                        <div className="flex justify-between items-center px-4">
                            <button onClick={() => handleShare('instagram')} className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                                    <Instagram className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">Stories</span>
                            </button>
                            <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                                    <Twitter className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">Twitter</span>
                            </button>
                            <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                    <Facebook className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">Facebook</span>
                            </button>
                            <button onClick={() => handleShare('native')} className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                                    <Share2 className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-medium text-slate-600">More</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-8 py-3 bg-slate-100 rounded-xl font-bold text-slate-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
