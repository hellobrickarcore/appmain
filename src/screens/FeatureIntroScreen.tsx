import React from 'react';
import { Camera, Trophy, Brain, Gift, Swords, Share2 } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';

interface FeatureIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

const features = [
  {
    title: 'Scan & Sort',
    description: 'Point your camera at any brick — instantly identified',
    icon: Camera,
    color: 'bg-blue-600',
  },
  {
    title: 'Level Up',
    description: 'Complete daily quests, earn XP, unlock rewards',
    icon: Trophy,
    color: 'bg-orange-600',
  },
  {
    title: 'Train the AI',
    description: 'Help improve detection accuracy and earn bonus XP',
    icon: Brain,
    color: 'bg-purple-600',
  },
  {
    title: 'Win Prizes',
    description: 'Top builders earn gift cards and vouchers',
    icon: Gift,
    color: 'bg-pink-600',
  },
  {
    title: 'Multiplayer',
    description: 'Battle friends and climb the leaderboard',
    icon: Swords,
    color: 'bg-red-600',
  },
  {
    title: 'Share Builds',
    description: 'Post creations on the HelloBrick feed',
    icon: Share2,
    color: 'bg-emerald-600',
  },
];

export const FeatureIntroScreen: React.FC<FeatureIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-[#050A18] text-white font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-16">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Here's what you can do</h1>
          <p className="text-slate-400 text-sm font-medium">
            Everything you need to master your collection
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-[#0F172A]/80 border border-white/5 rounded-[24px] p-5 flex flex-col gap-4 active:scale-95 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold leading-tight">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-8 pb-12">
        <button
          onClick={() => onNavigate(Screen.NOTIFICATIONS_INTRO)}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-6 rounded-[24px] font-black text-xl shadow-xl active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
