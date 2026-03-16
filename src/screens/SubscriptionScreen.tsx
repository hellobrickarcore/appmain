import React, { useState } from 'react';
import { X, Lock, Star, Bell, Loader2 } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from '../components/Logo';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const offerings = await subscriptionService.getOfferings();
      const isSimulator = localStorage.getItem('hellobrick_simulator_mode') === 'true';

      if (offerings && offerings.availablePackages.length > 0) {
        const pkg = billingCycle === 'annual' 
          ? offerings.availablePackages.find(p => p.packageType === 'ANNUAL') || offerings.availablePackages[0]
          : offerings.availablePackages.find(p => p.packageType === 'MONTHLY') || offerings.availablePackages[0];
        await subscriptionService.purchasePackage(pkg);
        onNavigate(true);
      } else if (isSimulator) {
        // Controlled mock for simulator verification
        console.log('🧪 SIMULATOR MODE: Mock purchase successful');
        localStorage.setItem('hellobrick_is_pro', 'true');
        onNavigate(true);
      } else {
        alert('Subscription packages are currently unavailable. Please try again later.');
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


  const handleRestore = async () => {
    setLoading(true);
    try {
      await subscriptionService.restorePurchases();
      // If restore success, it will update isPro in localStorage, so we navigate home
      if (localStorage.getItem('hellobrick_is_pro') === 'true') {
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



  return (
    <div className="fixed inset-0 bg-white text-[#1A1A1A] z-50 flex flex-col font-sans overflow-hidden">
      {/* Header with Radiation Effect */}
      <div className="relative h-[28vh] flex flex-col items-center justify-center overflow-hidden bg-white shrink-0">
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[220%] aspect-square rounded-full bg-gradient-to-b from-[#FFED4B] to-transparent opacity-30 blur-3xl" />
        <div className="absolute top-[-35%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-white/50 opacity-50" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full bg-gradient-to-b from-[#FFD600] to-[#FFF9C4]" />
        
        {/* Mascot - Standardised */}
        <Logo size="lg" showText={false} className="mt-8 relative z-10" />

        <button onClick={() => onNavigate()} className="absolute top-[max(env(safe-area-inset-top),2.5rem)] right-6 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center z-20 active:scale-90 transition-transform">
          <X className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-6 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-[34px] font-black text-center mb-1.5 leading-none tracking-tight text-[#0F172A]">How your trial works</h1>
        <p className="text-slate-500 font-bold mb-10 text-[17px]">
          First 14 days free, then {billingCycle === 'annual' ? '$29.99/year' : '$3.99/month'}
        </p>

        {/* Toggle - Pill style matched to screenshot */}
        <div className="bg-[#E2E8F0]/50 p-1 rounded-full flex mb-14 w-full max-w-[280px]">
          <button
            onClick={() => setBillingCycle('annual')}
            className={"flex-1 py-1 px-3 rounded-full text-[14px] font-black transition-all " + (billingCycle === 'annual' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B]')}
          >
            Annual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={"flex-1 py-1 px-3 rounded-full text-[14px] font-black transition-all " + (billingCycle === 'monthly' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B]')}
          >
            Monthly
          </button>
        </div>

        {/* Timeline - Styled like screenshot with gold icons */}
        <div className="w-full space-y-10 max-w-[340px]">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Lock className="w-6 h-6 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[19px] mb-0.5 text-[#0F172A]">Today</h3>
              <p className="text-slate-500 text-[15px] font-bold leading-snug">Explore brick detection, quests, achievements, feed and more</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Bell className="w-6 h-6 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[19px] mb-0.5 text-[#0F172A]">In 12 days</h3>
              <p className="text-slate-500 text-[15px] font-bold leading-snug">We'll send you a reminder that your trial is ending soon.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#FFD600] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10">
              <Star className="w-6 h-6 text-[#78350F]" fill="currentColor" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-[19px] mb-0.5 text-[#0F172A]">In 14 days</h3>
              <p className="text-slate-500 text-[15px] font-bold leading-snug">You'll be charged {billingCycle === 'annual' ? '$29.99' : '$3.99'}, cancel anytime before.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Massive Paywall CTA */}
      <div className="px-10 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-6 flex flex-col items-center gap-4 bg-white/95 backdrop-blur-md shrink-0">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-[#2563EB] text-white py-6 rounded-[32px] font-black text-2xl shadow-[0_12px_40px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Try for $0.00'}
        </button>

        <div className="flex flex-col items-center gap-3">
            <button 
              onClick={handleRestore}
              className="text-slate-400 font-extrabold text-[12px] tracking-widest uppercase hover:text-slate-600 transition-colors"
            >
              RESTORE PURCHASE
            </button>
            <p className="text-slate-400 text-[14px] font-bold">Cancel Anytime in the App Store</p>

            <div className="flex gap-6 mt-1">
              <button 
                onClick={() => window.open('https://hellobrick.app/terms', '_blank')}
                className="text-slate-400/60 text-[11px] font-black tracking-tight border-b border-slate-200 uppercase"
              >
                Terms of Use
              </button>
              <button 
                onClick={() => window.open('https://hellobrick.app/privacy', '_blank')}
                className="text-slate-400/60 text-[11px] font-black tracking-tight border-b border-slate-200 uppercase"
              >
                Privacy Policy
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
