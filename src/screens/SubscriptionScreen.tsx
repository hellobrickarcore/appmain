import React, { useState } from 'react';
import { X, Lock, Star, Bell } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from '../components/Logo';
import { Browser } from '@capacitor/browser';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {


  const handleRestore = async () => {
    setLoading(true);
    try {
      await subscriptionService.restorePurchases();
      const status = await subscriptionService.getSubscriptionStatus();
      if (status.isPro) {
        onNavigate(true);
      } else {
        alert('No previous purchases found.');
      }
    } catch (err: any) {
      console.error('Restore failed:', err);
      alert('Restore failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openLegal = async (url: string) => {
    await Browser.open({ url, presentationStyle: 'popover' });
  };

  return (
    <div className="fixed inset-0 bg-white text-[#1A1A1A] z-50 flex flex-col font-sans overflow-hidden">
      {/* Header with Radiation Effect */}
      <div className="relative h-[28vh] flex flex-col items-center justify-center overflow-hidden bg-white shrink-0">
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[220%] aspect-square rounded-full bg-gradient-to-b from-[#FFED4B] to-transparent opacity-30 blur-3xl" />
        <div className="absolute top-[-35%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-white/50 opacity-50" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-[#FFF9C4]" />
        
        {/* Mascot */}
        <Logo size="lg" showText={false} className="mt-8 relative z-10" />

        <button onClick={() => onNavigate()} className="absolute top-[max(env(safe-area-inset-top),2.5rem)] right-6 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center z-20 active:scale-90 transition-transform">
          <X className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-4 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-[20px] font-black text-center mb-1 leading-tight tracking-tight text-[#0F172A]">Welcome to the Community</h1>
        <p className="text-slate-500 font-bold mb-6 text-center text-[13px] max-w-[280px]">
          HelloBrick is now 100% free for all builders. Connect your collection and start creating today.
        </p>



        {/* Timeline */}
        <div className="w-full space-y-10 max-w-[340px]">
          <div className="flex gap-5 items-start">
            <div className="w-10 h-10 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Lock className="w-5 h-5 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[16px] mb-0.5 text-[#0F172A]">Today</h3>
              <p className="text-slate-500 text-[13px] font-bold leading-snug">Explore brick detection, quests, and infinite ideas</p>
            </div>
          </div>

          <div className="flex gap-5 items-start">
            <div className="w-10 h-10 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Bell className="w-5 h-5 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[16px] mb-0.5 text-[#0F172A]">In 12 days</h3>
              <p className="text-slate-500 text-[13px] font-bold leading-snug">We'll send you a reminder that your trial is ending soon.</p>
            </div>
          </div>

          <div className="flex gap-5 items-start">
            <div className="w-10 h-10 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Star className="w-5 h-5 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[16px] mb-0.5 text-[#0F172A]">Future</h3>
              <p className="text-slate-500 text-[13px] font-bold leading-snug">Continuous updates and new build challenges for everyone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-10 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-6 flex flex-col items-center gap-4 bg-white/95 backdrop-blur-md shrink-0">
        <button
          onClick={() => onNavigate()}
          className="w-full bg-[#1A1F2C] text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-all flex flex-col items-center justify-center leading-none"
        >
          <span>Get Started</span>
          <span className="text-[10px] uppercase tracking-widest mt-1 opacity-60 font-medium">Free Lifetime Access Unlocked</span>
        </button>

        <button
          onClick={handleRestore}
          className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          RESTORE PURCHASE
        </button>

        <p className="text-slate-400 text-[11px] font-medium text-center">Cancel Anytime in the App Store</p>

        <div className="flex gap-6 mt-2">
          <button 
            onClick={() => openLegal('https://hellobrick.app/terms')}
            className="text-slate-400 text-[10px] font-bold uppercase tracking-wider underline text-center"
          >
            TERMS OF USE (EULA)
          </button>
          <button 
            onClick={() => openLegal('https://hellobrick.app/privacy')}
            className="text-slate-400 text-[10px] font-bold uppercase tracking-wider underline text-center"
          >
            PRIVACY POLICY
          </button>
        </div>
      </div>
    </div>
  );
};
