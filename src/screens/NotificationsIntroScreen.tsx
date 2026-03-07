import React from 'react';
import { Bell } from 'lucide-react';
import { Screen } from '../types';

interface NotificationsIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const NotificationsIntroScreen: React.FC<NotificationsIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="fixed inset-0 bg-[#0A1229] text-white z-50 flex flex-col font-sans overflow-hidden">
      {/* Top Graphic Area */}
      <div className="flex-[5] flex items-center justify-center pt-12">
        <div className="relative w-48 h-48 flex flex-col items-center justify-center">
          {/* Notification Character (Yellow Brick Face) */}
          <div className="w-32 h-32 bg-[#FFD600] rounded-[24px] relative flex flex-col items-center justify-center gap-2 shadow-2xl">
            {/* Simple Eyes & Mouth */}
            <div className="flex gap-4">
              <div className="w-2.5 h-2.5 bg-black rounded-full" />
              <div className="w-2.5 h-2.5 bg-black rounded-full" />
            </div>
            <div className="w-10 h-3 border-b-4 border-black rounded-full mt-1" />

            {/* Notification Bubble at the top */}
            <div className="absolute -top-8 left-1/2 -ml-16 w-32 h-14 bg-white rounded-2xl shadow-xl flex items-center px-3 border border-slate-200">
              <div className="relative">
                <div className="w-9 h-9 bg-[#F8FAFC] rounded-lg border border-slate-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-500" fill="currentColor" />
                </div>
                {/* Red dot */}
                <div className="absolute -top-1 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              </div>
              <div className="ml-3 space-y-1.5 flex-1">
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full" />
                <div className="w-[60%] h-2 bg-[#F1F5F9] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-[3] px-10 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black mb-4 tracking-tight">Stick to your new hobby</h1>
        <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-[280px]">
          Turn on notifications to get daily puzzle drops, streak reminders, and community challenges.
        </p>
      </div>

      {/* Buttons Area */}
      <div className="px-8 pb-12 flex flex-col gap-4">
        <button
          onClick={() => onNavigate(Screen.BUILDING_INTRO)}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-5 rounded-[24px] font-black text-lg shadow-lg active:scale-[0.98] transition-all"
        >
          Turn on notifications
        </button>
        <button
          onClick={() => onNavigate(Screen.BUILDING_INTRO)}
          className="w-full bg-[#1E293B] hover:bg-[#334155] text-slate-300 py-5 rounded-[24px] font-black text-lg active:scale-[0.98] transition-all"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
