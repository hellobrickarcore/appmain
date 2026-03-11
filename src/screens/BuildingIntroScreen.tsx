import React from 'react';
import { Screen } from '../types';

interface BuildingIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const BuildingIntroScreen: React.FC<BuildingIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="fixed inset-0 bg-[#0A1229] text-white z-50 flex flex-col font-sans overflow-hidden min-h-[100dvh]">
      {/* Floating Bricks Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {[
          { top: '10%', left: '15%', rot: '15deg', scale: '0.8', color: 'bg-orange-500' },
          { top: '5%', left: '60%', rot: '-20deg', scale: '1.1', color: 'bg-blue-500' },
          { top: '15%', left: '85%', rot: '45deg', scale: '0.7', color: 'bg-red-500' },
          { top: '35%', left: '10%', rot: '-10deg', scale: '0.9', color: 'bg-yellow-500' },
          { top: '45%', left: '75%', rot: '25deg', scale: '1.2', color: 'bg-orange-600' },
          { top: '70%', left: '25%', rot: '30deg', scale: '1.0', color: 'bg-blue-600' },
          { top: '80%', left: '15%', rot: '-15deg', scale: '0.8', color: 'bg-red-600' },
          { top: '75%', left: '80%', rot: '40deg', scale: '0.9', color: 'bg-orange-400' },
        ].map((brick, i) => (
          <div
            key={i}
            className={`absolute w-12 h-12 ${brick.color} rounded-lg shadow-2xl opacity-20`}
            style={{
              top: brick.top,
              left: brick.left,
              transform: `rotate(${brick.rot}) scale(${brick.scale})`,
              transition: 'all 5s ease-in-out',
            }}
          >
            {/* Simple stud representations */}
            <div className="grid grid-cols-2 gap-2 p-2 h-full w-full">
              <div className="bg-black/10 rounded-full" />
              <div className="bg-black/10 rounded-full" />
              <div className="bg-black/10 rounded-full" />
              <div className="bg-black/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center relative z-10">
        <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-8">
          Let's build<br />
          awesome<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#FB923C]">
            models together.
          </span>
        </h1>

        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-[280px]">
          Your journey to becoming a master builder starts now.
        </p>
      </div>

      {/* Button Area */}
      <div className="px-8 pb-[max(env(safe-area-inset-bottom),48px)] relative z-10">
        <button
          onClick={() => onNavigate(Screen.SUBSCRIPTION)}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-6 rounded-[24px] font-black text-xl shadow-xl active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
