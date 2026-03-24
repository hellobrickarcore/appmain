import React from 'react';
<<<<<<< HEAD
=======
import { Trophy, ChevronRight, Bell } from 'lucide-react';
>>>>>>> 7ac4433 (feat: hellobrick v1.4.0 - CV pipeline upgrade & SEO expansion)
import { Screen } from '../types';
import { Logo } from '../components/Logo';

interface NotificationsIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const NotificationsIntroScreen: React.FC<NotificationsIntroScreenProps> = ({ onNavigate }) => {
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
      onNavigate(Screen.SUBSCRIPTION);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050A18] text-white font-sans overflow-hidden">
      {/* Top Header Section */}
      <div className="h-4 bg-[#FF7A30] w-full relative z-30" />
      
      <div className="flex-1 flex flex-col px-8 overflow-y-auto no-scrollbar overscroll-contain">
        {/* Central Mascot Area */}
        <div className="flex-1 flex flex-col items-center justify-center pt-20">
          <div className="relative mb-20 animate-in fade-in zoom-in duration-700">
             {/* Notification Badge on Mascot */}
             <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center z-20 border border-slate-100 rotate-[-10deg]">
                <div className="w-6 h-1.5 bg-slate-200 rounded-full mb-1" />
                <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-600 rounded-full border-2 border-white" />
             </div>

             <div className="scale-[1.8]">
                <Logo size="xl" showText={false} />
             </div>
          </div>

          <div className="text-center max-w-[300px]">
            <h1 className="text-[32px] font-black mb-6 tracking-tight leading-none text-white">
              Stick to your <br />
              new hobby
            </h1>

            <p className="text-slate-400 text-lg font-bold leading-snug">
              Turn on notifications to get daily puzzle drops, streak reminders, and community challenges.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pb-[max(env(safe-area-inset-bottom),40px)] pt-10 flex flex-col gap-4">
          <button
            onClick={handleTurnOnNotifications}
            className="w-full bg-[#2563EB] text-white py-6 rounded-[32px] font-black text-2xl shadow-[0_12px_40px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Turn on Notifications
          </button>
          <button
            onClick={() => onNavigate(Screen.SUBSCRIPTION)}
            className="w-full bg-white/5 text-slate-500 py-4 rounded-[24px] font-bold text-lg active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
