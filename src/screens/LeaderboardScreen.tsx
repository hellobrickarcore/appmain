
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Medal, Clock } from 'lucide-react';
import { Screen, LeaderboardEntry } from '../types';

import { CONFIG } from '../services/configService';

interface LeaderboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  // Calculate countdown to end of current 30-day period
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      // End of current month as the competition period
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({ days, hours, mins });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${CONFIG.XP_LEADERBOARD}?limit=20`);
        const data = await response.json();
        if (data.success) {
          const entries: LeaderboardEntry[] = data.leaderboard.map((item: any) => ({
            rank: item.rank,
            name: item.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`,
            xp: item.xp_total,
            isCurrentUser: false
          }));
          setLeaderboard(entries);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-12 rounded-b-[40px] shadow-xl relative z-10">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate(Screen.QUESTS)}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">🏆 Brick Cup</h1>
          <div className="w-10" />
        </div>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 mb-3 border-4 border-white/20">
            <Trophy className="w-10 h-10 text-yellow-900" />
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Ends in {countdown.days}d {countdown.hours}h {countdown.mins}m
            </p>
          </div>

          <h2 className="text-2xl font-black mb-2">Brick Cup</h2>

          <div className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full backdrop-blur-md">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">
              🎁 Top 3 weekly earn free gift cards based on XP!
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-6 -mt-6 pb-24 space-y-3 relative z-20">
        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">
            <p>Updating rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No builders on the board yet. Start training!</p>
          </div>
        ) : leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border ${user.isCurrentUser ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100'}`}
          >
            <div className="w-8 flex justify-center font-black text-slate-400 text-lg">
              {user.rank <= 3 ? (
                <Medal className={`w-6 h-6 ${user.rank === 1 ? 'text-yellow-400' :
                  user.rank === 2 ? 'text-slate-400' : 'text-orange-400'
                  }`} />
              ) : (
                user.rank
              )}
            </div>

            <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt={user.name} />

            <div className="flex-1">
              <h3 className={`font-bold text-sm ${user.isCurrentUser ? 'text-indigo-900' : 'text-slate-900'}`}>
                {user.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Level {Math.floor(user.xp / 1000)}</p>
            </div>

            <div className="text-right">
              <span className="font-black text-slate-700">{user.xp.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block font-bold">XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
