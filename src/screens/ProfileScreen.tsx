import React, { useState, useEffect, useRef } from 'react';
import { Settings, Zap, Star, ShieldCheck, ChevronRight, RefreshCw, LogOut, Bell, Sparkles, Share2, Download, Sliders, Camera, Upload, Check, Lock, Globe, Eye, EyeOff } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';

interface ProfileScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

const DEFAULT_AVATARS = [
    { id: 'boba', name: 'Boba Fett', url: 'https://img.bricklink.com/ItemImage/MN/0/sw0107.png' },
    { id: 'mrgold', name: 'Mr. Gold', url: 'https://img.bricklink.com/ItemImage/MN/0/col160.png' },
    { id: 'rex', name: 'Captain Rex', url: 'https://img.bricklink.com/ItemImage/MN/0/sw0450.png' },
    { id: 'shadow', name: 'Shadow Trooper', url: 'https://img.bricklink.com/ItemImage/MN/0/sw0603.png' },
    { id: 'cody', name: 'Commander Cody', url: 'https://img.bricklink.com/ItemImage/MN/0/sw0196.png' },
    { id: 'lotus', name: 'Black Lotus', url: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [isPro, setIsPro] = useState(false);
    const [email, setEmail] = useState('builder@hellobrick.app');
    const [collectionsCount, setCollectionsCount] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [isPortfolioPublic, setIsPortfolioPublic] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadProfileData = () => {
        const proStatus = localStorage.getItem('hellobrick_is_pro') === 'true';
        setIsPro(proStatus);

        const isPublic = localStorage.getItem('hellobrick_portfolio_public') === 'true';
        setIsPortfolioPublic(isPublic);

        const storedEmail = localStorage.getItem('hellobrick_userEmail') || localStorage.getItem('hellobrick_userId') || 'builder@hellobrick.app';
        setEmail(storedEmail);

        const storedAvatar = localStorage.getItem('hellobrick_profile_avatar');
        if (storedAvatar) {
            setAvatarUrl(storedAvatar);
        }

        const storedColl = localStorage.getItem('hellobrick_collection_sets');
        if (storedColl) {
            try {
                const parsed = JSON.parse(storedColl);
                setCollectionsCount(parsed.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0));
            } catch(e){}
        } else {
            setCollectionsCount(0);
        }
    };

    const handleTogglePortfolioPublic = () => {
        const nextVal = !isPortfolioPublic;
        setIsPortfolioPublic(nextVal);
        localStorage.setItem('hellobrick_portfolio_public', String(nextVal));
        window.dispatchEvent(new CustomEvent('hellobrick:privacy-updated', { detail: { isPublic: nextVal } }));
    };

    useEffect(() => {
        loadProfileData();

        const handleCollectionUpdate = () => {
            loadProfileData();
        };
        window.addEventListener('hellobrick:collection-updated', handleCollectionUpdate);
        return () => window.removeEventListener('hellobrick:collection-updated', handleCollectionUpdate);
    }, []);

    const handleSelectAvatar = (url: string) => {
        setAvatarUrl(url);
        localStorage.setItem('hellobrick_profile_avatar', url);
        setShowAvatarModal(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setAvatarUrl(result);
            localStorage.setItem('hellobrick_profile_avatar', result);
            setShowAvatarModal(false);
        };
        reader.readAsDataURL(file);
    };

    const handleExportCSV = () => {
        const storedColl = localStorage.getItem('hellobrick_collection_sets');
        if (!storedColl || JSON.parse(storedColl).length === 0) {
            alert('Your collection is empty! Add sets before exporting.');
            return;
        }
        try {
            const items = JSON.parse(storedColl);
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Set Number,Condition,Quantity,Purchase Price,Added Date\n';
            items.forEach((item: any) => {
                csvContent += `"${item.setNum}","${item.condition}","${item.quantity ?? 1}","${item.purchasePrice || ''}","${item.addedAt || ''}"\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `hellobrick_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(e){
            alert('Failed to generate export file.');
        }
    };

    const handleSharePortfolio = () => {
        const shareText = `Check out my collectible vault on HelloBrick! I track market valuations, retiring soon alerts, and collection statistics in real-time.`;
        if (navigator.share) {
            navigator.share({
                title: 'HelloBrick Collectible Tracker',
                text: shareText,
                url: window.location.origin
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.origin);
            alert('App link copied to clipboard! Share it with fellow collectors.');
        }
    };

    const handleSignOut = async () => {
        if (supabase) {
            await supabase.auth.signOut().catch(() => {});
        }
        localStorage.removeItem('hellobrick_userId');
        localStorage.removeItem('hellobrick_authenticated');
        localStorage.removeItem('hellobrick_is_pro');
        localStorage.removeItem('hellobrick_onboarding_finished');
        window.location.reload();
    };

    const profileName = localStorage.getItem('hellobrick_profile_name') || 'Collector';

    return (
        <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 relative overflow-hidden select-none">
            
            {/* Header */}
            <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),2.8rem)] pb-3 flex items-center justify-between border-b border-gray-200 bg-[#F5F5F7]/90 backdrop-blur-md sticky top-0">
                <Logo size="sm" light={false} />
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mr-1">Profile</span>
                    <button
                        onClick={() => onNavigate(Screen.PROFILE_SETTINGS)}
                        className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar overscroll-contain pb-[max(env(safe-area-inset-bottom),180px)]">
                
                {/* Profile Avatar & Metadata */}
                <div className="px-6 pt-8 pb-6 flex flex-col items-center">
                    <div 
                        onClick={() => setShowAvatarModal(true)}
                        className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1 shadow-xl relative cursor-pointer active:scale-95 transition-transform group"
                    >
                        <div className="w-full h-full bg-white rounded-[28px] flex items-center justify-center overflow-hidden border border-gray-100 relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="text-3xl font-black text-gray-900">{profileName.charAt(0).toUpperCase()}</span>
                            )}
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
                            <Camera className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <h2 className="mt-4 text-xl font-black text-gray-900">{profileName}</h2>
                    <p className="text-[12px] font-bold text-gray-500 mt-1">{email}</p>
                    <button 
                        onClick={() => setShowAvatarModal(true)}
                        className="text-[11px] font-bold text-emerald-600 mt-1 hover:underline"
                    >
                        Change Avatar
                    </button>
                </div>

                {/* MEMBERSHIP STATUS CARD */}
                <div className="px-6 mb-6">
                    {isPro ? (
                        <div className="p-6 bg-gradient-to-tr from-emerald-50 to-white border border-emerald-200 rounded-[28px] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        PRO MEMBER
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 mt-3.5">HelloBrick Pro Plan</h3>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Active with unlimited AI scans unlocked</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-white border border-gray-200/80 rounded-[28px] shadow-sm relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-amber-700 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        FREE TIER (LIMITED SCANS)
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 mt-3.5">Upgrade to HelloBrick Pro</h3>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Unlock unlimited AI scans & market pricing</p>
                                </div>
                                <Zap className="w-8 h-8 text-emerald-500" />
                            </div>
                            <button
                                onClick={() => onNavigate(Screen.SUBSCRIPTION)}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider mt-5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                                Upgrade to Pro
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Account Stats */}
                <div className="px-6 grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 bg-white border border-gray-200/80 rounded-3xl text-center shadow-xs">
                        <span className="text-2xl font-black text-gray-900">{collectionsCount}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">Assets Logged</span>
                    </div>
                    <div className="p-5 bg-white border border-gray-200/80 rounded-3xl text-center shadow-xs">
                        <span className={`text-2xl font-black ${isPro ? 'text-emerald-500' : 'text-gray-700'}`}>
                            {isPro ? 'Pro Active' : 'Free Tier'}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">Feature Access</span>
                    </div>
                </div>

                {/* Portfolio Privacy & Leaderboard Setting */}
                <div className="px-6 mb-6">
                    <div className="p-5 bg-white border border-gray-200/80 rounded-3xl shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                                    isPortfolioPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {isPortfolioPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900">Public Portfolio & Leaderboard</h4>
                                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                                        {isPortfolioPublic 
                                            ? 'Visible on community rankings' 
                                            : 'Private · 100% hidden from others'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Toggle Switch */}
                            <button
                                type="button"
                                onClick={handleTogglePortfolioPublic}
                                className={`w-13 h-7.5 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                                    isPortfolioPublic ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                                }`}
                                aria-label="Toggle Public Portfolio"
                            >
                                <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200" />
                            </button>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                                {isPortfolioPublic 
                                    ? 'Your total vault valuation is published to the HelloBrick community leaderboard. Your individual item notes remain strictly private.' 
                                    : 'Your vault, scan history, and total value are completely private and never shared with other users.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions List */}
                <div className="px-6 space-y-3">
                    <button
                        onClick={handleSharePortfolio}
                        className="w-full bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs active:scale-98 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-gray-900">Share Collection</h4>
                                <p className="text-[11px] text-gray-400">Export shareable link to friends</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="w-full bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs active:scale-98 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Download className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-gray-900">Export CSV Vault</h4>
                                <p className="text-[11px] text-gray-400">Download Excel / CSV spreadsheet</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full bg-white p-4 rounded-2xl border border-red-100 flex items-center justify-between shadow-xs active:scale-98 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-red-600">Sign Out</h4>
                                <p className="text-[11px] text-gray-400">End your current session</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Avatar Selector Modal Sheet */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Select Profile Avatar</h3>
                                <p className="text-xs text-gray-500 font-medium">Pick a collectible figurine or upload photo</p>
                            </div>
                            <button 
                                onClick={() => setShowAvatarModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Upload custom photo button */}
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 px-4 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-transform"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Photo from Device
                        </button>

                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                            Collectible Figurine Avatars
                        </div>

                        {/* Figurine grid */}
                        <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                            {DEFAULT_AVATARS.map((av) => (
                                <button
                                    key={av.id}
                                    onClick={() => handleSelectAvatar(av.url)}
                                    className={`p-2 bg-[#F5F5F7] rounded-2xl border flex flex-col items-center gap-1 active:scale-95 transition-all ${
                                        avatarUrl === av.url ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                                        <img src={av.url} alt={av.name} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-700 truncate w-full text-center">
                                        {av.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
