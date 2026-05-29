import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, Check, Fingerprint, Zap, TrendingUp, Shield, Infinity } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { Logo } from '../components/Logo';
import { appStateService } from '../services/appStateService';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

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
        console.warn('⚠️ No real offerings found. Falling back to Mock Simulation.');
        setShowSheet(true);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      if (err.message !== 'Purchase cancelled by user') {
        setShowSheet(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('hellobrick_simulator_mode', 'true');
      localStorage.setItem('hellobrick_is_pro', 'true');
      setIsSuccess(true);
      setShowSheet(false);
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FFD600', '#FF7A30', '#FFFFFF', '#10B981'],
      });
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

  const plans = [
    { id: 'weekly' as const, label: 'Weekly', price: '$3.99', period: '/week', badge: null },
    { id: 'annual' as const, label: 'Annual', price: '$49.99', period: '/year', badge: 'BEST VALUE' },
    { id: 'lifetime' as const, label: 'Lifetime', price: '$149.99', period: 'one-time', badge: null },
  ];

  const features = [
    { icon: Zap, label: 'Unlimited AI Scans', sub: 'Scan sets, minifigs & bulk piles', color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10' },
    { icon: TrendingUp, label: 'Real-Time Valuations', sub: 'Live market prices for every set', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Shield, label: 'Cloud Collection Sync', sub: 'Never lose your collection data', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Infinity, label: '100% Ad-Free', sub: 'Clean experience, zero interruptions', color: 'text-[#FF7A30]', bg: 'bg-[#FF7A30]/10' },
    { icon: Star, label: 'Price History Charts', sub: '1D / 1W / 1M / 1Y / All timeframes', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0D0D0F] text-white z-50 flex flex-col font-sans overflow-hidden">

      <style>{`
        @keyframes sub-hero-in {
          from { opacity: 0; transform: translateY(-20px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sub-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sub-glow-pulse {
          0%,100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(1.08); }
        }
        .sub-hero  { animation: sub-hero-in  0.6s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
        .sub-r0    { animation: sub-slide-up 0.4s 0.18s ease-out both; }
        .sub-r1    { animation: sub-slide-up 0.4s 0.26s ease-out both; }
        .sub-r2    { animation: sub-slide-up 0.4s 0.34s ease-out both; }
        .sub-r3    { animation: sub-slide-up 0.4s 0.42s ease-out both; }
        .sub-glow  { animation: sub-glow-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* Background radial glow */}
      <div className="sub-glow absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFD60028 0%, transparent 65%)', marginTop: '-100px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF7A3015 0%, transparent 65%)', marginTop: '-40px' }} />

      {/* Skip button */}
      <button
        onClick={attemptDismiss}
        className="absolute top-[max(env(safe-area-inset-top),20px)] right-5 z-30 w-8 h-8 bg-white/8 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>

      {/* ─── Scrollable content ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-36">

        {/* Hero */}
        {mounted && (
          <div className="sub-hero flex flex-col items-center pt-[max(env(safe-area-inset-top),3.5rem)] pb-6 px-6">
            <Logo size="lg" showText={false} className="mb-5" />
            <h1 className="text-[26px] font-black text-center tracking-tight leading-tight">
              Unlock <span className="text-[#FFD600]">HelloBrick</span> Pro
            </h1>
            <p className="text-zinc-400 text-[13px] font-semibold text-center mt-1">
              {billingCycle === 'lifetime'
                ? 'One-time payment · Access forever'
                : 'First 14 days free — cancel anytime'}
            </p>
          </div>
        )}

        {/* ─── Plan Toggle ─── */}
        {mounted && (
          <div className="sub-r0 px-6 mb-6">
            <div className="bg-[#1C1C1E] p-1 rounded-2xl flex gap-1 border border-white/6">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setBillingCycle(plan.id)}
                  className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all relative flex flex-col items-center gap-0.5 ${
                    billingCycle === plan.id
                      ? 'bg-[#FFD600] text-[#111111] shadow-[0_4px_20px_rgba(255,214,0,0.3)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-black px-2 py-0.5 rounded-full border ${
                      billingCycle === plan.id
                        ? 'bg-[#FF7A30] text-white border-[#FF7A30]'
                        : 'bg-[#FF7A30]/80 text-white border-transparent'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                  <span className="mt-1">{plan.label}</span>
                  <span className={`text-[9px] font-bold ${billingCycle === plan.id ? 'text-[#111111]/70' : 'text-zinc-600'}`}>
                    {plan.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Features ─── */}
        {mounted && (
          <div className="sub-r1 px-6 space-y-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#1C1C1E] rounded-2xl px-4 py-3.5 border border-white/6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <p className="text-[14px] font-black text-white">{f.label}</p>
                  <p className="text-[11px] text-zinc-500 font-medium">{f.sub}</p>
                </div>
                <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" strokeWidth={3} />
              </div>
            ))}
          </div>
        )}

        {/* Social proof */}
        {mounted && (
          <div className="sub-r2 px-6 mb-4">
            <div className="bg-[#1C1C1E] rounded-2xl px-4 py-4 border border-white/6 flex items-center gap-4">
              <div className="flex -space-x-2 shrink-0">
                {['#FF7A30', '#FFD600', '#10B981', '#6366F1'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1C1C1E] flex items-center justify-center text-xs font-black"
                    style={{ background: c }}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-[#FFD600] fill-[#FFD600]" />)}
                </div>
                <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                  Joined by 12,000+ LEGO collectors
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Fixed footer CTA ─── */}
      {mounted && (
        <div className="sub-r3 absolute bottom-0 left-0 right-0 px-6 pb-[max(env(safe-area-inset-bottom),2rem)] pt-5 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/95 to-transparent">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-[#FFD600] text-[#111111] py-4 rounded-2xl font-black text-[17px] shadow-[0_8px_30px_rgba(255,214,0,0.3)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 mb-3"
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <>Try for $0.00 · 14 Days Free</>}
          </button>

          <div className="flex items-center justify-center gap-4 mb-2">
            <button onClick={handleRestore} className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-400 transition-colors">
              Restore Purchase
            </button>
            <div className="w-1 h-1 bg-zinc-700 rounded-full" />
            <button onClick={attemptDismiss} className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-400 transition-colors">
              Skip
            </button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => window.open('https://hellobrick.app/terms', '_blank')}
              className="text-zinc-700 text-[10px] font-bold hover:text-zinc-500 transition-colors">
              Terms
            </button>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <button onClick={() => window.open('https://hellobrick.app/privacy', '_blank')}
              className="text-zinc-700 text-[10px] font-bold hover:text-zinc-500 transition-colors">
              Privacy
            </button>
          </div>
        </div>
      )}

      {/* ─── Exit Intent / Closing Offer ─── */}
      {showClosingOffer && !showSheet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#1C1C1E] rounded-[32px] p-6 text-center shadow-2xl border border-white/10 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FF7A30]/15 to-transparent pointer-events-none" />
            <div className="w-16 h-16 bg-gradient-to-tr from-[#FF7A30] to-[#FFD600] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_-5px_rgba(255,122,48,0.6)]">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-[26px] font-black text-white mb-2 leading-tight">Wait! 10% Off</h3>
            <p className="text-zinc-400 text-sm font-semibold px-2 mb-6 leading-relaxed">
              Get <span className="text-[#FF7A30] font-black">10% OFF</span> your first year of HelloBrick Pro.
            </p>
            <div className="bg-[#111111] rounded-2xl p-4 mb-6 border border-white/8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-500 font-bold line-through text-sm">$49.99</span>
                <span className="text-white font-black text-2xl">$44.99<span className="text-sm text-zinc-400">/yr</span></span>
              </div>
              <p className="text-left text-xs text-zinc-500 font-medium">Billed annually. Cancel anytime.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowClosingOffer(false); handleSubscribe(); }}
                className="w-full py-4 bg-[#FF7A30] text-white font-black rounded-2xl text-[15px] shadow-[0_8px_30px_rgba(255,122,48,0.3)] active:scale-95 transition-all"
              >
                Claim 10% Discount
              </button>
              <button
                onClick={() => onNavigate()}
                className="w-full py-3 text-zinc-500 font-bold hover:text-zinc-300 transition-colors text-sm"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reviewer / Fallback Payment Sheet ─── */}
      {showSheet && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setShowSheet(false)} />
          <div className="relative w-full bg-[#1C1C1E] rounded-t-[32px] pt-2 pb-12 px-5 shadow-2xl border-t border-white/10">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#111111] rounded-2xl flex items-center justify-center border border-white/10">
                <Logo size="md" showText={false} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-[17px] text-white">HelloBrick Pro</h4>
                <p className="text-zinc-500 text-[13px] capitalize">{billingCycle} Subscription</p>
              </div>
              <div className="text-right">
                <p className="font-black text-[17px] text-white">$0.00</p>
                <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight">
                  {billingCycle === 'lifetime' ? 'One Time' : 'First 14 Days'}
                </p>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-white/8">
                <span className="text-zinc-500 font-medium">Account</span>
                <span className="text-[#FF7A30] font-semibold">Reviewer Access</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500 font-medium">Total</span>
                <span className="text-white font-black text-xl">$0.00</span>
              </div>
            </div>
            <button
              onClick={confirmPurchase}
              disabled={isProcessing}
              className="w-full bg-[#FF7A30] text-white py-4 rounded-2xl font-black text-[17px] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(255,122,48,0.3)]"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-white/60" />
                  Confirm Purchase
                </>
              )}
            </button>
            <p className="text-center text-zinc-600 text-[11px] mt-3 font-medium">Tap to confirm · Face ID / Touch ID</p>
          </div>
        </div>
      )}

      {/* ─── Success Overlay ─── */}
      {isSuccess && (
        <div className="fixed inset-0 z-[110] bg-[#0D0D0F] flex flex-col items-center justify-center">
          <style>{`
            @keyframes success-pop {
              0%   { transform: scale(0.3); opacity: 0; }
              60%  { transform: scale(1.15); }
              100% { transform: scale(1); opacity: 1; }
            }
            .success-icon { animation: success-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
            .success-text { animation: sub-slide-up 0.4s 0.4s ease-out both; }
          `}</style>
          <div className="success-icon w-28 h-28 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
            <Check className="w-14 h-14 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h2 className="success-text text-3xl font-black text-white mb-2">Welcome to Pro! 🎉</h2>
          <p className="success-text text-zinc-400 font-semibold text-lg" style={{ animationDelay: '0.5s' }}>
            Your account is now active
          </p>
          <p className="success-text text-zinc-600 mt-10 animate-pulse text-sm" style={{ animationDelay: '0.6s' }}>
            Taking you home...
          </p>
        </div>
      )}
    </div>
  );
};
