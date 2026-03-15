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
        const pkg = billingCycle === 'annual' 
          ? offerings.availablePackages.find(p => p.packageType === 'ANNUAL') || offerings.availablePackages[0]
          : offerings.availablePackages.find(p => p.packageType === 'MONTHLY') || offerings.availablePackages[0];
        await subscriptionService.purchasePackage(pkg);
        onNavigate(Screen.HOME);
      } else {
        alert('No subscription packages found. If you are on a simulator, check your internet connection and RevenueCat configuration.');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      if (err.message !== 'Purchase cancelled by user') {
        alert(`Subscription failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-white text-[#1A1A1A] z-50 flex flex-col font-sans overflow-hidden">
      {/* Header with Radiation Effect */}
      <div className="relative h-[32vh] flex flex-col items-center justify-center overflow-hidden bg-white">
        <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[180%] aspect-square rounded-full bg-gradient-to-b from-[#FFED4B] to-transparent opacity-20 blur-3xl" />
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-white opacity-40" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-white" />
        
        {/* Mascot */}
        <div className="relative z-10 w-24 h-24 bg-[#FF7A30] rounded-[24px] flex items-center justify-center shadow-2xl mt-4">
           <div className="flex gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              <div className="w-2 h-2 bg-black rounded-full" />
           </div>
        </div>

        <button onClick={() => onNavigate(Screen.HOME)} className="absolute top-12 right-6 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center z-20">
          <X className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-6 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-[28px] font-black text-center mb-1 leading-tight tracking-tight">How your trial works</h1>
        <p className="text-slate-500 font-bold mb-8 text-[15px]">
          First 14 days free, then {billingCycle === 'annual' ? '$29.99/year' : '$3.99/month'}
        </p>

        {/* Toggle */}
        <div className="bg-[#F1F5F9] p-1 rounded-full flex mb-12 w-full max-w-[280px]">
          <button
            onClick={() => setBillingCycle('annual')}
            className={"flex-1 py-3 rounded-full text-[15px] font-black transition-all " + (billingCycle === 'annual' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-slate-400')}
          >
            Annual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={"flex-1 py-3 rounded-full text-[15px] font-black transition-all " + (billingCycle === 'monthly' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-slate-400')}
          >
            Monthly
          </button>
        </div>

        {/* Timeline */}
        <div className="w-full space-y-10 max-w-[320px]">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Lock className="w-6 h-6 text-black" fill="black" />
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">Today</h3>
              <p className="text-slate-400 text-[14px] font-bold leading-snug">Explore brick detection, quests, achievements, feed and more</p>
            </div>
          </div>

          <div className="flex gap-6 items-start relative">
             <div className="absolute left-6 -top-8 bottom-[-8px] w-0.5 border-l-2 border-dashed border-slate-100" />
            <div className="w-12 h-12 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10 z-10">
              <Bell className="w-6 h-6 text-black" fill="black" />
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">In 12 days</h3>
              <p className="text-slate-400 text-[14px] font-bold leading-snug">We'll send you a reminder that your trial is ending soon.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
             <div className="absolute left-6 -top-8 bottom-0 w-0.5 border-l-2 border-dashed border-slate-100" />
            <div className="w-12 h-12 bg-[#FFD600] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10 z-10">
              <Star className="w-6 h-6 text-black" fill="black" />
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">In 14 days</h3>
              <p className="text-slate-400 text-[14px] font-bold leading-snug">You'll be charged {billingCycle === 'annual' ? '$29.99' : '$3.99'}, cancel anytime before.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-10 pt-6 flex flex-col items-center gap-4 bg-white/80 backdrop-blur-md">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-[#2563EB] text-white py-6 rounded-[32px] font-black text-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Try for $0.00'}
        </button>

        <button className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">RESTORE PURCHASE</button>
        <p className="text-slate-400 text-[13px] font-medium">Cancel Anytime in the App Store</p>

        <div className="flex gap-6 mt-1">
          <span className="text-slate-400 text-[11px] font-bold tracking-tight border-b border-slate-200">TERMS OF SERVICE</span>
          <span className="text-slate-400 text-[11px] font-bold tracking-tight border-b border-slate-200">PRIVACY POLICY</span>
        </div>
      </div>
    </div>
  );
};
