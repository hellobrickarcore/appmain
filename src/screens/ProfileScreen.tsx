import React, { useState, useEffect } from 'react';
import { Settings, Zap, Star, ShieldCheck, ChevronRight, RefreshCw, LogOut, Bell, Sparkles } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';

interface ProfileScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [isPro, setIsPro] = useState(false);
    const [email, setEmail] = useState('builder@hellobrick.app');
    const [collectionsCount, setCollectionsCount] = useState(0);

    const loadProfileData = () => {
        // Hydrate Pro subscription lock status
        const proStatus = localStorage.getItem('hellobrick_is_pro') === 'true';
        setIsPro(proStatus);

        // Hydrate stored user email
        const storedEmail = localStorage.getItem('hellobrick_userEmail') || localStorage.getItem('hellobrick_userId') || 'builder@hellobrick.app';
        setEmail(storedEmail);

        // Count catalog items
        const storedColl = localStorage.getItem('hellobrick_collection_sets');
        if (storedColl) {
            try {
                const parsed = JSON.parse(storedColl);
                setCollectionsCount(parsed.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0));
            } catch(e){}
        } else {
            setCollectionsCount(2);
        }
    };

    useEffect(() => {
        loadProfileData();

        // Listen for collection updates
        const handleCollectionUpdate = () => {
            loadProfileData();
        };
        window.addEventListener('hellobrick:collection-updated', handleCollectionUpdate);
        return () => window.removeEventListener('hellobrick:collection-updated', handleCollectionUpdate);
    }, []);

    const handleClearCache = () => {
        if (window.confirm('Are you sure you want to purge your collection and wishlist? This will restore clean mock data.')) {
            localStorage.removeItem('hellobrick_collection_sets');
            localStorage.removeItem('hellobrick_wishlist_sets');
            window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
            loadProfileData();
            alert('Vault cache cleared successfully!');
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

    const profileName = localStorage.getItem('hellobrick_profile_name') || 'Builder';

    return (
        <div className="flex flex-col h-full bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#C9A84C]/5 via-transparent to-transparent pointer-events-none z-0" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-4 flex items-center justify-between border-b border-[#2A3144]/40 bg-[#0D111A]/90 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <Logo size="sm" showText={false} className="w-8 h-8" />
                    <span className="font-bold text-base text-white">Account Profile</span>
                </div>
                <button
                    onClick={() => onNavigate(Screen.PROFILE_SETTINGS)}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <Settings className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar overscroll-contain pb-[max(env(safe-area-inset-bottom),180px)]">
                
                {/* Profile Avatar & Metadata */}
                <div className="px-6 pt-8 pb-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#C9A84C] to-[#C9A84C]/60 p-0.5 shadow-2xl relative">
                        <div className="w-full h-full bg-[#0D111A] rounded-[26px] flex items-center justify-center overflow-hidden border border-white/10">
                            <span className="text-2xl font-black text-white">{profileName.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>

                    <h2 className="mt-4 text-xl font-black text-white">{profileName}</h2>
                    <p className="text-[11px] font-mono text-slate-500 mt-1 font-bold">{email}</p>
                </div>

                {/* PRO MEMBERSHIP STATUS CARD */}
                <div className="px-6 mb-6">
                    {isPro ? (
                        <div className="p-6 bg-gradient-to-tr from-[#C9A84C]/25 to-transparent border border-[#C9A84C]/40 rounded-[28px] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-[#C9A84C]/10 blur-2xl rounded-full" />
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-[#C9A84C] border border-[#C9A84C]/50 bg-[#C9A84C]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        PRO MEMBER
                                    </span>
                                    <h3 className="text-lg font-black text-white mt-3.5">HelloBrick Pro Plan</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Active with premium scans unlocked</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-[#C9A84C]" />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-[#161A2B] border border-[#2A3144] rounded-[28px] shadow-xl relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 border border-slate-700 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        BASIC MEMBER
                                    </span>
                                    <h3 className="text-lg font-black text-white mt-3.5">Unlock HelloBrick Pro</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Track unlimited minifigs & real prices</p>
                                </div>
                                <Zap className="w-8 h-8 text-slate-600" />
                            </div>
                            <button
                                onClick={() => onNavigate(Screen.SUBSCRIPTION)}
                                className="w-full bg-[#C9A84C] text-[#0D111A] py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider mt-5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#C9A84C]/10"
                            >
                                Upgrade Now ($4.99/mo)
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Account Portfolio Stats */}
                <div className="px-6 grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 bg-[#161A2B] border border-[#2A3144]/60 rounded-3xl text-center">
                        <span className="text-2xl font-mono font-black text-white">{collectionsCount}</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 block">Assets Logged</span>
                    </div>
                    <div className="p-5 bg-[#161A2B] border border-[#2A3144]/60 rounded-3xl text-center">
                        <span className="text-2xl font-mono font-black text-emerald-400">Pro</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 block">Feature Access</span>
                    </div>
                </div>

                {/* UTILITIES MENU */}
                <div className="px-6 space-y-3">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1 block">Account Settings</div>
                    
                    {/* Price Monitors Wishlist link */}
                    <button 
                      onClick={() => onNavigate(Screen.WISHLIST)}
                      className="w-full p-5 bg-[#161A2B] rounded-[24px] border border-[#2A3144]/60 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-[#1E233B]"
                    >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xs font-black text-white uppercase tracking-wider">Active Price Monitors</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Track buy targets for retired sets</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Restart Onboarding */}
                    <button 
                      onClick={() => {
                          localStorage.removeItem('hellobrick_onboarding_finished');
                          localStorage.removeItem('hellobrick_authenticated');
                          localStorage.removeItem('hellobrick_userId');
                          localStorage.removeItem('hellobrick_is_pro');
                          window.location.reload();
                      }}
                      className="w-full p-5 bg-[#161A2B] rounded-[24px] border border-[#2A3144]/60 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-[#1E233B]"
                    >
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xs font-black text-white uppercase tracking-wider">Restart Onboarding Flow</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Experience the new 4-question profiling</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Reset Cache */}
                    <button 
                      onClick={handleClearCache}
                      className="w-full p-5 bg-[#161A2B] rounded-[24px] border border-[#2A3144]/60 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-[#1E233B]"
                    >
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xs font-black text-white uppercase tracking-wider">Reset Local Vault</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Purge collections & reload mocks</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Log Out / Exit */}
                    <button 
                      onClick={handleSignOut}
                      className="w-full p-5 bg-[#161A2B] rounded-[24px] border border-[#2A3144]/60 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-[#1E233B] text-rose-400"
                    >
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Sign Out Profile</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Reset auth state to onboarding</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">HelloBrick v1.7.5</p>
                </div>
            </div>
        </div>
    );
};
