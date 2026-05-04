import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Trophy, Zap, Shield, Sparkles } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';
import { RetentionOfferModal } from '../components/RetentionOfferModal';
import { Browser } from '@capacitor/browser';
import { PurchasesPackage, PurchasesOffering } from '@revenuecat/purchases-capacitor';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

// Feature list for the paywall
const PRO_FEATURES = [
  { icon: Zap, label: 'Unlimited Brick Scans', desc: 'No daily limits' },
  { icon: Sparkles, label: 'AI Build Ideas', desc: 'Powered by your inventory' },
  { icon: Shield, label: 'Full Collection Manager', desc: 'Organize everything' },
  { icon: Trophy, label: 'Challenges & Leaderboards', desc: 'Compete globally' },
];

type PlanType = 'annual' | 'monthly';

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [showRetention, setShowRetention] = useState(false);
  const [hasSeenRetention, setHasSeenRetention] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  // Load RevenueCat offerings on mount
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const currentOffering = await subscriptionService.getOfferings();
        if (currentOffering) {
          setOffering(currentOffering);
          console.log('[Paywall] Loaded offerings:', currentOffering.identifier);
          console.log('[Paywall] Available packages:', currentOffering.availablePackages?.map((p: any) => p.identifier));
        }
      } catch (err) {
        console.warn('[Paywall] Could not load offerings:', err);
      }
    };
    loadOfferings();
  }, []);

  // Find packages from offerings — MONTHLY not weekly
  const annualPackage: PurchasesPackage | null = offering?.annual ?? null;
  const monthlyPackage: PurchasesPackage | null = offering?.monthly ?? null;

  // Pricing display (dynamic from RC, with correct fallbacks matching App Store)
  const annualPrice = annualPackage?.product?.priceString ?? '£29.99';
  const monthlyPrice = monthlyPackage?.product?.priceString ?? '£2.99';

  // Calculate per-month for annual
  const annualCost = annualPackage?.product?.price ?? 29.99;
  const monthlyCost = monthlyPackage?.product?.price ?? 2.99;
  const annualPerMonth = (annualCost / 12).toFixed(2);
  const monthlyAnnualCost = monthlyCost * 12;
  const savingsPercent = monthlyAnnualCost > 0
    ? Math.round(((monthlyAnnualCost - annualCost) / monthlyAnnualCost) * 100)
    : 17;

  // Handle dismiss → show retention offer first time
  const handleDismiss = useCallback(() => {
    if (!hasSeenRetention) {
      setShowRetention(true);
      setHasSeenRetention(true);
    } else {
      appStateService.onSubscriptionDismiss();
      onNavigate();
    }
  }, [hasSeenRetention, onNavigate]);

  // Handle retention modal dismiss
  const handleRetentionDismiss = useCallback(() => {
    setShowRetention(false);
    appStateService.onSubscriptionDismiss();
    onNavigate();
  }, [onNavigate]);

  // Handle purchase
  const handlePurchase = async (pkg?: PurchasesPackage | null) => {
    const packageToPurchase = pkg ?? (selectedPlan === 'annual' ? annualPackage : monthlyPackage);
    if (!packageToPurchase) {
      console.warn('[Paywall] No package available for purchase');
      // Fallback: just complete the subscription flow
      appStateService.onSubscriptionComplete();
      onNavigate(true);
      return;
    }

    setPurchasing(true);
    try {
      await subscriptionService.purchasePackage(packageToPurchase);
      appStateService.onSubscriptionComplete();
      onNavigate(true);
    } catch (err: any) {
      console.error('[Paywall] Purchase error:', err);
      if (err.message !== 'Purchase cancelled by user') {
        alert('Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Handle retention offer accept (purchases annual at regular price)
  const handleRetentionAccept = async () => {
    setShowRetention(false);
    await handlePurchase(annualPackage);
  };

  // Handle restore
  const handleRestore = async () => {
    setLoading(true);
    try {
      await subscriptionService.restorePurchases();
      const status = await subscriptionService.getSubscriptionStatus();
      if (status.isPro) {
        appStateService.onSubscriptionComplete();
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
    <div className="fixed inset-0 bg-[#050A18] text-white z-50 flex flex-col font-sans overflow-hidden">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-[max(env(safe-area-inset-top),2.5rem)] right-5 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center z-20 active:scale-90 transition-transform"
      >
        <X className="w-5 h-5 text-slate-400" />
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-[40px] rounded-full" />
            <Logo size="lg" showText={false} className="relative" />
          </div>
          <h1 className="text-[28px] font-black tracking-tight leading-tight mb-2 text-center">
            Unlock <span className="text-orange-500">HelloBrick</span> Pro
          </h1>
          <p className="text-slate-400 text-[15px] font-medium leading-relaxed text-center max-w-[300px]">
            Get unlimited scans, AI build ideas, and the full experience.
          </p>
        </div>

        {/* Pro Features */}
        <div className="space-y-3 mb-8">
          {PRO_FEATURES.map((feature) => (
            <div key={feature.label} className="flex items-center gap-4 bg-white/[0.04] rounded-2xl px-4 py-3.5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-white text-[14px] font-bold">{feature.label}</p>
                <p className="text-slate-500 text-[12px] font-medium">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="space-y-3 mb-6">
          {/* Annual Plan — highlighted */}
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all relative ${
              selectedPlan === 'annual'
                ? 'border-2 border-orange-500 bg-orange-500/10'
                : 'border-2 border-white/10 bg-white/[0.03]'
            }`}
          >
            {/* Save badge */}
            <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              SAVE {savingsPercent}%
            </span>
            <div className="flex flex-col items-start">
              <span className="text-white font-bold text-[15px]">Annual</span>
              <span className="text-slate-500 text-[11px] font-medium">
                Just {annualPackage?.product?.currencyCode === 'GBP' ? '£' : '$'}{annualPerMonth}/mo
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-black text-[17px]">{annualPrice}</span>
              <span className="text-slate-500 text-[11px] font-medium">/year</span>
            </div>
          </button>

          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
              selectedPlan === 'monthly'
                ? 'border-2 border-orange-500 bg-orange-500/10'
                : 'border-2 border-white/10 bg-white/[0.03]'
            }`}
          >
            <span className="text-white font-bold text-[15px]">Monthly</span>
            <div className="flex flex-col items-end">
              <span className="text-white font-black text-[17px]">{monthlyPrice}</span>
              <span className="text-slate-500 text-[11px] font-medium">/month</span>
            </div>
          </button>
        </div>

        {/* Social Proof */}
        <div className="bg-white/[0.04] rounded-2xl p-5 mb-4 border border-white/5">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-[14px] font-bold leading-snug mb-1">
                "The brick scanner is incredible"
              </p>
              <p className="text-slate-400 text-[13px] font-medium leading-snug">
                Seeing my builds come to life through AI scanning is mind-blowing. I found pieces I thought were lost forever!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 bg-gradient-to-t from-[#050A18] via-[#050A18] to-transparent shrink-0">
        {/* Continue Button */}
        <button
          onClick={() => handlePurchase()}
          disabled={purchasing}
          className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all disabled:opacity-50 mb-3"
        >
          {purchasing ? 'Processing...' : `Continue with ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'}`}
        </button>

        {/* 3-day free trial note if applicable */}
        <p className="text-center text-slate-500 text-[11px] font-medium mb-3">
          Cancel anytime. No commitment.
        </p>

        {/* Legal Footer */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => openLegal('https://hellobrick.app/terms')}
            className="text-slate-500 text-[11px] font-medium"
          >
            Terms
          </button>
          <span className="text-slate-600 text-[11px]">·</span>
          <button
            onClick={() => openLegal('https://hellobrick.app/privacy')}
            className="text-slate-500 text-[11px] font-medium"
          >
            Privacy
          </button>
          <span className="text-slate-600 text-[11px]">·</span>
          <button
            onClick={handleRestore}
            disabled={loading}
            className="text-slate-500 text-[11px] font-medium"
          >
            {loading ? 'Restoring...' : 'Restore Purchases'}
          </button>
        </div>
      </div>

      {/* Retention Offer Modal */}
      <RetentionOfferModal
        visible={showRetention}
        yearlyPackage={annualPackage}
        onAccept={handleRetentionAccept}
        onDismiss={handleRetentionDismiss}
      />
    </div>
  );
};
