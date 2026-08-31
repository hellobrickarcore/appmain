import React from 'react';
import { Screen } from '../types';
import { ArrowLeft, Flame, CheckCircle, Circle, Trophy, Star, Shield, Medal, Award, Crown } from 'lucide-react';

interface Props {
  onNavigate: (screen: Screen, params?: any) => void;
}

const DAILY_QUESTS = [
  { id: '1', title: 'Scan 3 sets today', current: 1, target: 3, xp: 50, completed: false },
  { id: '2', title: 'Add 2 items to your wishlist', current: 0, target: 2, xp: 30, completed: false },
  { id: '3', title: 'Check your portfolio value', current: 1, target: 1, xp: 20, completed: true },
];

const WEEKLY_CHALLENGES = [
  { id: '1', title: 'Log in 5 days in a row', current: 3, target: 5, xp: 150, completed: false },
  { id: '2', title: 'Add $500 of sets to collection', current: 200, target: 500, xp: 200, completed: false },
];

const ACHIEVEMENTS = [
  { id: 'a1', name: 'First Scan', description: 'Scan your first LEGO set', unlocked: true, icon: Trophy },
  { id: 'a2', name: '10 Sets Club', description: 'Have 10 sets in your collection', unlocked: true, icon: Star },
  { id: 'a3', name: '50 Sets Club', description: 'Have 50 sets in your collection', unlocked: false, icon: Shield },
  { id: 'a4', name: '100 Sets Club', description: 'Have 100 sets in your collection', unlocked: false, icon: Crown },
  { id: 'a5', name: 'Portfolio $1K', description: 'Reach $1,000 portfolio value', unlocked: true, icon: Medal },
  { id: 'a6', name: 'Portfolio $5K', description: 'Reach $5,000 portfolio value', unlocked: false, icon: Award },
];

export const QuestsScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="h-full bg-[#F5F5F7] text-gray-900 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),6rem)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(Screen.Home)} className="p-2 -ml-2 rounded-full hover:bg-gray-50/50">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">Quests</h1>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-orange-500">5 Day Streak!</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-8">
        {/* Daily Quests */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FFD600]" /> Daily Quests
          </h2>
          <div className="space-y-3">
            {DAILY_QUESTS.map((quest) => (
              <div key={quest.id} className={`p-4 rounded-xl border ${quest.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {quest.completed ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={`font-medium ${quest.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{quest.title}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+{quest.xp} XP</span>
                </div>
                {!quest.completed && (
                  <div className="pl-9">
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(quest.current / quest.target) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-right">
                      {quest.current} / {quest.target}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Challenges */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-400" /> Weekly Challenges
          </h2>
          <div className="space-y-3">
            {WEEKLY_CHALLENGES.map((challenge) => (
              <div key={challenge.id} className="p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-gray-900">{challenge.title}</span>
                  <span className="text-sm font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">+{challenge.xp} XP</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-[#FFD600] rounded-full transition-all duration-500"
                    style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2 text-right">
                  {challenge.current} / {challenge.target}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Badges & Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-gray-300' 
                    : 'bg-gray-500 border-gray-200/50 opacity-60 grayscale'
                }`}
              >
                <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-[#FFD600]/20 text-[#FFD600]' : 'bg-gray-50 text-gray-400'}`}>
                  <achievement.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800">{achievement.name}</h3>
                <p className="text-xs text-gray-500 leading-tight">{achievement.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
