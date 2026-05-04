import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Trophy } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';
import { RetentionOfferModal } from '../components/RetentionOfferModal';
import { Browser } from '@capacitor/browser';
import { PurchasesPackage, PurchasesOffering } from '@revenuecat/purchases-capacitor';

interface SubscriptionScreenProps {
  onNavigate: (success?: boolean) => void;
}

// Feature comparison data
const FEATURES = [
  { label: 'Scan & Identify Bricks', free: true, pro: true },
  { label: 'Unlimited Scans', free: false, pro: true },
  { label: 'Build Ideas & Instructions', free: false, pro: true },
  { label: 'Multiplayer Challenges', free: false, pro: true },
  { label: 'Leaderboards & Stats', free: false, pro: true },
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
        }
      } catch (err) {
        console.warn('[Paywall] Could not load offerings:', err);
      }
    };
    loadOfferings();
  }, []);

  // Find packages from offerings
  const yearlyPackage: PurchasesPackage | null = offering?.annual ?? null;
  const monthlyPackage: PurchasesPackage | null = offering?.monthly ?? null;

  // Pricing display (dynamic from RC, with fallbacks)
  const yearlyPrice = yearlyPackage?.product?.priceString ?? '£29.99';
  const monthlyPrice = monthlyPackage?.product?.priceString ?? '£2.99';

  // Calculate savings percentage
  const yearlyCost = yearlyPackage?.product?.price ?? 29.99;
  const monthlyCost = monthlyPackage?.product?.price ?? 2.99;
  const monthlyAnnualCost = monthlyCost * 12;
  const savingsPercent = monthlyAnnualCost > 0
    ? Math.round(((monthlyAnnualCost - yearlyCost) / monthlyAnnualCost) * 100)
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
    const packageToPurchase = pkg ?? (selectedPlan === 'annual' ? yearlyPackage : monthlyPackage);
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

  // Handle retention offer accept (purchases yearly at regular price for now)
  const handleRetentionAccept = async () => {
    setShowRetention(false);
    await handlePurchase(yearlyPackage);
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
    <div className="fixed inset-0 bg-[#0A0A14] text-white z-50 flex flex-col font-sans overflow-hidden">
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
        <div className="mb-6 mt-4">
          <Logo size="sm" showText={false} className="mb-4" />
          <h1 className="text-[28px] font-black tracking-tight leading-tight mb-2">
            Unlock Unlimited Ideas
          </h1>
          <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-[320px]">
            Want more builds like this? Unlock unlimited ideas, scans, and the full HelloBrick experience.
          </p>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-8">
          {/* Table Header */}
          <div className="flex items-center justify-end gap-0 mb-4 pr-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider w-14 text-center">Free</span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider w-14 text-center">Pro</span>
          </div>

          {/* Feature Rows */}
          <div className="space-y-0">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className={`flex items-center justify-between py-3.5 ${i < FEATURES.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <span className={`text-[14px] font-semibold ${feature.free ? 'text-white' : 'text-slate-300'}`}>
                  {feature.label}
                </span>
                <div className="flex items-center gap-0">
                  <div className="w-14 flex justify-center">
                    {feature.free ? (
                      <Check className="w-5 h-5 text-slate-500" />
                    ) : (
                      <X className="w-5 h-5 text-slate-700" />
                    )}
                  </div>
                  <div className="w-14 flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-3 mb-6">
          {/* Yearly Plan — highlighted */}
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all relative ${
              selectedPlan === 'annual'
                ? 'border-2 border-purple-500 bg-purple-500/10'
                : 'border-2 border-white/10 bg-white/[0.03]'
            }`}
          >
            {/* Save badge */}
            <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              SAVE {savingsPercent}%
            </span>
            <span className="text-white font-bold text-[15px]">Annual</span>
            <span className="text-white font-black text-[17px]">{yearlyPrice}</span>
          </button>

          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
              selectedPlan === 'monthly'
                ? 'border-2 border-purple-500 bg-purple-500/10'
                : 'border-2 border-white/10 bg-white/[0.03]'
            }`}
          >
            <span className="text-white font-bold text-[15px]">Monthly</span>
            <span className="text-white font-black text-[17px]">{monthlyPrice}</span>
          </button>
        </div>

        {/* Social Proof Testimonial */}
        <div className="bg-white/[0.04] rounded-2xl p-5 mb-6 border border-white/5">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-[14px] font-bold leading-snug mb-1.5">
                The brick scanner is incredible
              </p>
              <p className="text-slate-400 text-[13px] font-medium leading-snug">
                Seeing my builds come to life through AI scanning is mind-blowing. I found pieces I thought were lost forever!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 bg-gradient-to-t from-[#0A0A14] via-[#0A0A14] to-transparent shrink-0">
        {/* Continue Button */}
        <button
          onClick={() => handlePurchase()}
          disabled={purchasing}
          className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all disabled:opacity-50 mb-3"
        >
          {purchasing ? 'Processing...' : 'Continue'}
        </button>

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
        yearlyPackage={yearlyPackage}
        onAccept={handleRetentionAccept}
        onDismiss={handleRetentionDismiss}
      />
    </div>
  );
};
