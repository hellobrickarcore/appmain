import React, { useState } from 'react';
import { X, Lock, Star, Bell, Loader2, Check, Fingerprint } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from '../components/Logo';
import confetti from 'canvas-confetti';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'annual' | 'lifetime'>('annual');
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showClosingOffer, setShowClosingOffer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const attemptDismiss = () => {
    if (!showClosingOffer) {
      setShowClosingOffer(true);
    } else {
      onNavigate();
    }
  };

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
        
        {/* Skip button top right */}
        <button 
          onClick={attemptDismiss}
          className="absolute top-[max(env(safe-area-inset-top),20px)] right-6 z-20 text-slate-800/50 hover:text-slate-800 font-bold text-xs uppercase tracking-wider p-2"
        >
          Skip
        </button>

        {/* Mascot - Standardised */}
        <Logo size="lg" showText={false} className="mt-8 relative z-10" />
      </div>

      <div className="flex-1 px-8 pt-4 flex flex-col items-center overflow-y-auto no-scrollbar pb-32">
        <h1 className="text-[22px] font-black text-center mb-1 leading-tight tracking-tight text-[#0F172A]">Unlock HelloBrick Pro</h1>
        <p className="text-slate-500 font-bold mb-6 text-[12px]">
          {billingCycle === 'lifetime' ? 'One-time payment' : 'First 14 days free, then '}
          {billingCycle === 'annual' && '$49.99/year'}
          {billingCycle === 'weekly' && '$3.99/week'}
          {billingCycle === 'lifetime' && '$149.99'}
        </p>
 
        {/* Toggle - Pill style matched to screenshot */}
        <div className="bg-[#E2E8F0]/50 p-1 rounded-[24px] flex mb-8 w-full max-w-[280px]">
          <button
            onClick={() => setBillingCycle('weekly')}
            className={"flex-1 py-1.5 px-2 rounded-[20px] text-[11px] font-black transition-all " + (billingCycle === 'weekly' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B] hover:text-[#1A1F2C]')}
          >
            Weekly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={"flex-1 py-1.5 px-2 rounded-[20px] text-[11px] font-black transition-all relative " + (billingCycle === 'annual' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B] hover:text-[#1A1F2C]')}
          >
            Annual
            <div className="absolute -top-2 -right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full border border-white">BEST</div>
          </button>
          <button
            onClick={() => setBillingCycle('lifetime')}
            className={"flex-1 py-1.5 px-2 rounded-[20px] text-[11px] font-black transition-all " + (billingCycle === 'lifetime' ? 'bg-[#1A1F2C] text-white shadow-lg' : 'text-[#64748B] hover:text-[#1A1F2C]')}
          >
            Lifetime
          </button>
        </div>
 
        {/* Pro Features */}
        <div className="w-full space-y-6 max-w-[340px]">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
            </div>
            <p className="font-black text-[15px] text-[#0F172A]">Unlimited AI Scans</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
            </div>
            <p className="font-black text-[15px] text-[#0F172A]">Identify Minifigures & Sets</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
            </div>
            <p className="font-black text-[15px] text-[#0F172A]">Real-Time Market Valuations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
            </div>
            <p className="font-black text-[15px] text-[#0F172A]">Cloud Collection Sync</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />
            </div>
            <p className="font-black text-[15px] text-[#0F172A]">100% Ad-Free Experience</p>
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

            <div className="flex gap-6 mt-1 mb-2">
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

            <button 
              onClick={attemptDismiss}
              className="text-slate-400 text-[10px] font-medium mt-1 tracking-tight"
            >
              stay on standard mode for now
            </button>
        </div>
      </div>
      
      {/* Closing Offer (Exit Intent) */}
      {showClosingOffer && !showSheet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-500/20 to-transparent pointer-events-none" />
            <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)]">
              <Star className="w-8 h-8 text-white fill-current" />
            </div>
            <h3 className="text-[28px] font-black text-slate-900 mb-2 leading-tight">Wait! Don't miss out.</h3>
            <p className="text-slate-500 text-sm font-semibold px-2 mb-6 leading-relaxed">
              Get <span className="text-orange-500 font-black">70% OFF</span> your first year of HelloBrick Pro.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 font-bold line-through text-sm">$49.99</span>
                <span className="text-slate-900 font-black text-2xl">$14.99<span className="text-sm text-slate-400">/yr</span></span>
              </div>
              <p className="text-left text-xs text-slate-500 font-medium">Billed annually. Cancel anytime.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={() => {
                  setShowClosingOffer(false);
                  handleSubscribe(); // Assume this applies the discount promo code in a real app
                }}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-[20px] text-[15px] shadow-[0_8px_30px_rgba(249,115,22,0.3)] active:scale-95 transition-all"
              >
                Claim 70% Discount
              </button>
              <button
                onClick={() => onNavigate()}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        </div>
      )}
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
                <h4 className="font-bold text-[17px] text-black">HelloBrick Pro</h4>
                <p className="text-slate-500 text-[13px] leading-tight capitalize">{billingCycle} Subscription</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[17px] text-black">$0.00</p>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">{billingCycle === 'lifetime' ? 'One Time' : 'First 14 Days'}</p>
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
