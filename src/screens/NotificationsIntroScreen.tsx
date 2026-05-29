import React, { useEffect, useState } from 'react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { appStateService } from '../services/appStateService';
import { Bell } from 'lucide-react';

interface NotificationsIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const NotificationsIntroScreen: React.FC<NotificationsIntroScreenProps> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleTurnOnNotifications = async () => {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const permission = await PushNotifications.requestPermissions();
      console.log('Notification permission status:', permission.receive);
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (err) {
      console.error('Error requesting notifications:', err);
    } finally {
      appStateService.finishOnboarding();
    }
  };

  const perks = [
    { emoji: '🔥', label: 'Daily price alerts for your wishlist' },
    { emoji: '📉', label: "Retirement warnings before it's too late" },
    { emoji: '💰', label: 'Flash sales and best-deal moments' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans overflow-hidden relative">

      <style>{`
        @keyframes notif-logo-in {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes notif-bell-ring {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(18deg); }
          30%      { transform: rotate(-16deg); }
          45%      { transform: rotate(12deg); }
          60%      { transform: rotate(-8deg); }
          75%      { transform: rotate(4deg); }
        }
        @keyframes notif-badge-pop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes notif-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes notif-pulse-ring {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .notif-logo   { animation: notif-logo-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .notif-bell   { animation: notif-bell-ring 2.2s ease-in-out 0.9s infinite; transform-origin: top center; display: inline-block; }
        .notif-badge  { animation: notif-badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.1s both; }
        .notif-row-0  { animation: notif-slide-up 0.4s 0.35s ease-out both; }
        .notif-row-1  { animation: notif-slide-up 0.4s 0.50s ease-out both; }
        .notif-row-2  { animation: notif-slide-up 0.4s 0.65s ease-out both; }
        .notif-row-3  { animation: notif-slide-up 0.4s 0.80s ease-out both; }
        .notif-pulse  { animation: notif-pulse-ring 1.8s ease-out infinite; }
      `}</style>

      {/* Top accent bar */}
      <div className="h-1 bg-[#FF7A30] w-full shrink-0 z-20" />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF7A3015 0%, transparent 70%)', marginTop: '-60px' }} />

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar overscroll-contain px-7">

        {/* ─── Hero ─── */}
        <div className="flex-1 flex flex-col items-center justify-center pt-[max(env(safe-area-inset-top),3rem)] pb-8">
          {mounted && (
            <div className="notif-logo relative mb-10">
              {/* Concentric pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="notif-pulse w-24 h-24 rounded-full border-2 border-[#FF7A30]/40" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ animationDelay: '0.6s' }}>
                <div className="notif-pulse w-24 h-24 rounded-full border-2 border-[#FF7A30]/20" style={{ animationDelay: '0.6s' }} />
              </div>

              {/* Logo + bell icon overlay */}
              <div className="relative">
                <div className="scale-[1.7]">
                  <Logo size="lg" showText={false} />
                </div>

                {/* Notification badge */}
                <div className="notif-badge absolute -top-3 -right-3 w-10 h-10 bg-[#FF7A30] rounded-2xl flex items-center justify-center border-4 border-[#111111] shadow-lg z-10">
                  <Bell className="w-5 h-5 text-white" fill="white" />
                </div>

                {/* Floating notification preview */}
                <div className="notif-badge absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-white/10 shadow-2xl z-20 flex items-center gap-3"
                  style={{ animationDelay: '1.3s' }}>
                  <div className="w-8 h-8 bg-[#FFD600] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    <div className="w-[80%] h-[80%] bg-[#FF7A30] rounded-[30%]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-white truncate">Price Alert! 🔥</p>
                    <p className="text-[9px] text-zinc-500 font-medium truncate">Millennium Falcon +12%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mounted && (
            <div className="notif-row-0 text-center mt-12 mb-6 max-w-[300px]">
              <h1 className="text-[32px] font-black text-white leading-tight tracking-tight mb-3">
                Never Miss a<br />
                <span className="text-[#FF7A30]">Price Move</span>
              </h1>
              <p className="text-zinc-400 text-[16px] font-medium leading-relaxed">
                Get real-time alerts so your collection always grows in value.
              </p>
            </div>
          )}

          {/* Perks list */}
          {mounted && (
            <div className="notif-row-1 w-full space-y-3 mt-4 max-w-[320px]">
              {perks.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-white/6">
                  <span className="text-xl">{p.emoji}</span>
                  <p className="text-[13px] font-semibold text-zinc-300">{p.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── CTAs ─── */}
        {mounted && (
          <div className="notif-row-2 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-4 flex flex-col gap-3">
            <button
              onClick={handleTurnOnNotifications}
              className="w-full py-5 bg-[#FF7A30] text-white rounded-[22px] font-black text-[17px] shadow-[0_8px_30px_rgba(255,122,48,0.35)] active:scale-[0.97] transition-transform"
            >
              Turn on Notifications 🔔
            </button>
            <button
              onClick={() => appStateService.finishOnboarding()}
              className="w-full py-4 bg-white/5 text-zinc-500 rounded-2xl font-bold text-[15px] border border-white/6 active:scale-[0.97] transition-transform"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
