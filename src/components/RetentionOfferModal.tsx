import React, { useEffect, useState } from 'react';
import { X, Gift, Check } from 'lucide-react';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Browser } from '@capacitor/browser';

interface RetentionOfferModalProps {
  visible: boolean;
  yearlyPackage: PurchasesPackage | null;
  onAccept: () => void;
  onDismiss: () => void;
}

export const RetentionOfferModal: React.FC<RetentionOfferModalProps> = ({
  visible,
  yearlyPackage,
  onAccept,
  onDismiss,
}) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
    }
  }, [visible]);

  if (!visible) return null;

  // Calculate discounted price from the yearly package
  const originalPrice = yearlyPackage?.product?.price ?? 59.99;
  const currencySymbol = yearlyPackage?.product?.currencyCode === 'GBP' ? '£' : 
                          yearlyPackage?.product?.currencyCode === 'EUR' ? '€' : '$';
  const discountedPrice = (originalPrice * 0.2).toFixed(2); // 80% off

  const openLegal = async (url: string) => {
    await Browser.open({ url, presentationStyle: 'popover' });
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-end justify-center transition-all duration-500 ${animateIn ? 'bg-black/70 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className={`w-full max-w-md bg-[#0F0F1A] rounded-t-[32px] transition-all duration-500 ease-out ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        {/* Close Button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onDismiss}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center">
          {/* Header */}
          <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
            Exclusive Offer
          </h2>
          <p className="text-slate-400 text-sm text-center font-medium mb-6">
            Don't miss out on unlimited scanning and personalized insights.
          </p>

          {/* Gift Icon with glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/30 blur-[40px] rounded-full" />
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Gift className="w-12 h-12 text-purple-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Discount Amount */}
          <div className="text-5xl font-black text-white mb-1 tracking-tighter">
            80% <span className="text-purple-400">OFF</span>
          </div>
          <p className="text-slate-500 text-xs font-medium mb-8">
            You will not see this offer again.
          </p>

          {/* Plan Card */}
          <div className="w-full border-2 border-purple-500/60 rounded-2xl p-4 flex items-center justify-between mb-4 bg-purple-500/5 relative">
            {/* Badge */}
            <span className="absolute -top-2.5 right-3 bg-purple-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              80% OFF
            </span>
            <span className="text-white font-bold text-base">Yearly</span>
            <span className="text-white font-black text-lg">{currencySymbol}{discountedPrice}</span>
          </div>

          {/* Cancel Anytime */}
          <div className="flex items-center gap-2 mb-6">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-sm font-medium">Cancel anytime</span>
          </div>

          {/* CTA Button */}
          <button
            onClick={onAccept}
            className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-transform"
          >
            Accept Offer
          </button>

          {/* Legal Links */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={() => openLegal('https://hellobrick.app/terms')}
              className="text-slate-500 text-[10px] font-medium"
            >
              Terms
            </button>
            <span className="text-slate-600 text-[10px]">·</span>
            <button
              onClick={() => openLegal('https://hellobrick.app/privacy')}
              className="text-slate-500 text-[10px] font-medium"
            >
              Privacy
            </button>
            <span className="text-slate-600 text-[10px]">·</span>
            <button
              onClick={onDismiss}
              className="text-slate-500 text-[10px] font-medium"
            >
              Restore Purchases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
