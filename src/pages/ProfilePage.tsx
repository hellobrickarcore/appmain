// @ts-nocheck
import React, { useState } from 'react';
import { 
  ArrowLeft, Settings, User, Bell, Shield, HelpCircle, 
  LogOut, Crown, Flame, Award, BarChart3, Calendar,
  Mail, Globe, Moon, Sun, Volume2, VolumeX, Star, Trophy
} from 'lucide-react';
import { getUserProgress } from '../services/gamificationService';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const progress = getUserProgress();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stats = [
    { label: 'Level', value: progress.level, icon: Award, color: 'text-orange-500' },
    { label: 'XP', value: progress.xp, icon: Star, color: 'text-yellow-500' },
    { label: 'Streak', value: `${progress.dailyStreak} days`, icon: Flame, color: 'text-red-500' },
    { label: 'Quests', value: progress.challengesCompleted, icon: Trophy, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-orange-50 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center text-3xl">
              🧱
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">Brick Builder</h2>
              <p className="text-slate-600">@brickbuilder{progress.level}</p>
              <button className="mt-2 text-sm text-orange-600 font-medium">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} className={stat.color} />
                    <span className="text-sm text-slate-600">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={24} className="text-orange-500" />
              <h3 className="text-xl font-bold text-slate-900">Daily Streak</h3>
            </div>
            <span className="text-2xl font-bold text-orange-500">{progress.dailyStreak} 🔥</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center ${
                  i < progress.dailyStreak
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-400 border-orange-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {i < progress.dailyStreak && <Flame size={20} className="text-white" />}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Keep your streak going! Come back tomorrow to continue.
          </p>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings size={20} className="text-orange-500" />
              Settings
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Notifications</p>
                  <p className="text-sm text-slate-600">Get notified about daily quests</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Sound */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 size={20} className="text-slate-600" />
                ) : (
                  <VolumeX size={20} className="text-slate-600" />
                )}
                <div>
                  <p className="font-medium text-slate-900">Sound Effects</p>
                  <p className="text-sm text-slate-600">Enable sound feedback</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon size={20} className="text-slate-600" />
                ) : (
                  <Sun size={20} className="text-slate-600" />
                )}
                <div>
                  <p className="font-medium text-slate-900">Dark Mode</p>
                  <p className="text-sm text-slate-600">Switch to dark theme</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Other Options */}
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            <button className="w-full p-4 flex items-center gap-3 hover:bg-orange-50 transition-colors">
              <HelpCircle size={20} className="text-slate-600" />
              <span className="font-medium text-slate-900">Help & Support</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-orange-50 transition-colors">
              <Shield size={20} className="text-slate-600" />
              <span className="font-medium text-slate-900">Privacy Policy</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-orange-50 transition-colors">
              <Mail size={20} className="text-slate-600" />
              <span className="font-medium text-slate-900">Contact Us</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-orange-50 transition-colors text-red-600">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Pro Badge (if applicable) */}
        {progress.level >= 10 && (
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <Crown size={24} />
              <h3 className="text-xl font-bold">HelloBrick Pro</h3>
            </div>
            <p className="text-orange-50 mb-4">
              Unlock unlimited scans, advanced quests, and exclusive features!
            </p>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold">
              Upgrade to Pro
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;

