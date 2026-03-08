import React, { useState } from 'react';
import { X, Lock, Star, Bell, Loader2 } from 'lucide-react';
import { Screen } from '../types';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const offerings = await subscriptionService.getOfferings();
      if (offerings && offerings.availablePackages.length > 0) {
        await subscriptionService.purchasePackage(offerings.availablePackages[0]);
      } else {
        // Fallback for demo/test mode
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      onNavigate(Screen.HOME);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A1229] text-white z-50 flex flex-col font-sans overflow-hidden">
      {/* Header with Yellow Radiation/Sun effect */}
      <div className="relative h-[30vh] flex flex-col items-center justify-end pb-8 overflow-hidden bg-[#0A1229]">
        {/* Yellow Sun background elements */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-[#FFED4B] opacity-40 blur-3xl" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-[#FFED4B] opacity-60" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60%] aspect-square rounded-full bg-[#FFD600] border-[20px] border-[#FFEC3D]" />

        {/* Simple Face from screenshot */}
        <div className="relative w-12 h-12 flex flex-col items-center justify-center gap-1.5 z-10">
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="absolute top-12 right-6 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center z-20"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-8 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-3xl font-black text-center mb-2 tracking-tight">How your trial works</h1>
        <p className="text-slate-500 font-medium mb-8">
          First 14 days free, then {billingCycle === 'annual' ? '$29.99/year' : '$3.99/month'}
        </p>

        {/* Billing Toggle (Annual/Monthly) */}
        <div className="bg-[#E2E8F0] p-1 rounded-full flex mb-12 w-full max-w-[280px]">
          <button
            onClick={() => setBillingCycle('annual')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'annual' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500'
              }`}
          >
            Annual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500'
              }`}
          >
            Monthly
          </button>
        </div>

        {/* Trial Timeline */}
        <div className="w-full space-y-8 max-w-[320px]">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-90">
              <Lock className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Today</h3>
              <p className="text-slate-500 text-sm leading-snug">Explore brick detection, quests, achievements, feed and more</p>
            </div>
          </div>

          <div className="flex gap-4 items-start relative">
            {/* Dotted line connecting icons */}
            <div className="absolute left-5 top-12 bottom-0 w-[2.5px] border-l-2 border-dashed border-slate-300 -mb-8" />
            <div className="w-10 h-10 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-90 z-10">
              <Bell className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <div className="z-10 bg-[#F4F7FA]/10">
              <h3 className="font-bold text-lg">In 12 days</h3>
              <p className="text-slate-500 text-sm leading-snug">We'll send you a reminder that your trial is ending soon.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-90">
              <Star className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-lg">In 14 days</h3>
              <p className="text-slate-500 text-sm leading-snug">You'll be charged {billingCycle === 'annual' ? '$29.99' : '$3.99'}, cancel anytime before.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-6 bg-gradient-to-t from-[#F4F7FA] via-[#F4F7FA] to-transparent flex flex-col items-center gap-4">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Try for $0.00'}
        </button>

        <button
          onClick={() => { }}
          className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          RESTORE PURCHASE
        </button>

        <p className="text-slate-400 text-[11px] font-medium">Cancel Anytime in the App Store</p>

        <div className="flex gap-6 mt-2">
          <button className="text-slate-400 text-[10px] font-bold uppercase tracking-wider underline">TERMS OF SERVICE</button>
          <button className="text-slate-400 text-[10px] font-bold uppercase tracking-wider underline">PRIVACY POLICY</button>
        </div>
      </div>
    </div>
  );
};
