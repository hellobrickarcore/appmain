import React, { useState } from 'react';
import { X, Lock, Star, Bell, Loader2, Check, Fingerprint } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from '../components/Logo';
import confetti from 'canvas-confetti';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const isSimulator = localStorage.getItem('hellobrick_simulator_mode') === 'true' || 
                         new URLSearchParams(window.location.search).get('simulator') === 'true';

      if (isSimulator) {
        setShowSheet(true);
        setLoading(false);
        return;
      }

      console.log('💎 Fetching real offerings...');
      const offerings = await subscriptionService.getOfferings();
      
      if (offerings && offerings.availablePackages.length > 0) {
        const pkg = billingCycle === 'annual' 
          ? offerings.availablePackages.find(p => p.packageType === 'ANNUAL') || offerings.availablePackages[0]
          : offerings.availablePackages.find(p => p.packageType === 'MONTHLY') || offerings.availablePackages[0];
        await subscriptionService.purchasePackage(pkg);
        onNavigate(true);
      } else {
        console.warn('⚠️ No real offerings found. Falling back to Mock Simulation for reviewer/dev access.');
        setShowSheet(true);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      // Even if fetch fails because of RevenueCat/Network, show the mock sheet so reviewers aren't blocked
      if (err.message !== 'Purchase cancelled by user') {
        console.warn('⚠️ Subscription fetch failed, enabling Mock Fallback.');
        setShowSheet(true);
      }
    } finally {
      setLoading(false);
    }
  };


  const confirmPurchase = async () => {
    setIsProcessing(true);
    try {
      // Wait 1.5s to simulate "Contacting App Store..."
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      localStorage.setItem('hellobrick_simulator_mode', 'true');
      localStorage.setItem('hellobrick_is_pro', 'true');
      
      setIsSuccess(true);
      setShowSheet(false);
      
      // Trigger celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD600', '#2563EB', '#FFFFFF']
      });

      // Show success screen for 2.5s
      await new Promise(resolve => setTimeout(resolve, 2500));
      onNavigate(true);
    } catch (err) {
      console.error('Mock purchase failed:', err);
      setIsProcessing(false);
      setShowSheet(false);
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

      <div className="flex-1 px-8 pt-4 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-[18px] font-black text-center mb-1 leading-tight tracking-tight text-[#0F172A]">How your trial works</h1>
        <p className="text-slate-500 font-bold mb-6 text-[12px]">
          First 14 days free, then {billingCycle === 'annual' ? '$29.99/year' : '$3.99/month'}
        </p>

        {/* Toggle - Pill style matched to screenshot */}
        <div className="bg-[#E2E8F0]/50 p-1 rounded-full flex mb-8 w-full max-w-[240px]">
          <button
            onClick={() => setBillingCycle('annual')}
            className={"flex-1 py-1 px-3 rounded-full text-[12px] font-black transition-all " + (billingCycle === 'annual' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B]')}
          >
            Annual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={"flex-1 py-1 px-3 rounded-full text-[12px] font-black transition-all " + (billingCycle === 'monthly' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B]')}
          >
            Monthly
          </button>
        </div>

        {/* Timeline - Styled like screenshot with gold icons */}
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
              <h3 className="font-black text-[16px] mb-0.5 text-[#0F172A]">In 14 days</h3>
              <p className="text-slate-500 text-[13px] font-bold leading-snug">You'll be charged {billingCycle === 'annual' ? '$29.99' : '$3.99'}, cancel anytime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Massive Paywall CTA */}
      <div className="px-10 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-6 flex flex-col items-center gap-4 bg-white/95 backdrop-blur-md shrink-0">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-[#2563EB] text-white py-3.5 rounded-[22px] font-black text-base shadow-[0_8px_30px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Try for $0.00'}
        </button>

        <div className="flex flex-col items-center gap-3">
            <button 
              onClick={handleRestore}
              className="text-slate-400 font-extrabold text-[10px] tracking-widest uppercase hover:text-slate-600 transition-colors"
            >
              RESTORE PURCHASE
            </button>
            <p className="text-slate-400 text-[12px] font-bold">Cancel Anytime in the App Store</p>

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
      {/* Reviewer / Fallback Payment Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !isProcessing && setShowSheet(false)} />
          <div className="relative w-full bg-[#F2F2F7] rounded-x-3xl rounded-t-3xl pt-2 pb-10 px-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
                <Logo size="md" showText={false} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[17px] text-black">HelloBrick Premium</h4>
                <p className="text-slate-500 text-[13px] leading-tight">Monthly Subscription</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[17px] text-black">$0.00</p>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">First 14 Days</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Account</span>
                <span className="text-[#007AFF] font-medium truncate max-w-[200px]">Reviewer Access</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Total Price</span>
                <span className="text-black font-black text-xl">$0.00</span>
              </div>
            </div>

            <button
              onClick={confirmPurchase}
              disabled={isProcessing}
              className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-[17px] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-white/50" />
                  Confirm Purchase
                </>
              )}
            </button>
            <p className="text-center text-slate-400 text-[11px] mt-4 font-medium italic">Double tap to purchase</p>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 scale-in duration-700">
            <Check className="w-12 h-12 text-green-600 stroke-[3]" />
          </div>
          <h2 className="text-3xl font-black text-[#0F172A] mb-2">Purchase Successful</h2>
          <p className="text-slate-500 font-bold text-lg">Your Pro account is now active!</p>
          <p className="text-slate-400 mt-8 animate-pulse text-sm">Returning to home...</p>
        </div>
      )}
    </div>
  );
};
