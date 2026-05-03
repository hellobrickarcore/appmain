import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, X, BarChart3, Users, MessageSquare, ShieldCheck } from 'lucide-react';
import { Screen } from '../types';
import { CONFIG } from '../services/configService';

interface AdminDashboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'moderation' | 'stats'>('moderation');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(CONFIG.ADMIN_STATS);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setLiveStats(statsData.stats);
      }

      // 2. Fetch Pending Posts
      const pendingRes = await fetch(CONFIG.FEED_PENDING);
      const pendingData = await pendingRes.json();
      if (pendingData.posts) {
        setPendingPosts(pendingData.posts);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (postId: string) => {
    try {
      const res = await fetch(typeof CONFIG.FEED_APPROVE === 'function' ? CONFIG.FEED_APPROVE(postId) : CONFIG.FEED_APPROVE, {
        method: 'POST'
      });
      if (res.ok) {
        setPendingPosts((prev: any[]) => prev.filter((p: any) => p.id !== postId));
      }
    } catch (err) {
      console.error('Failed to approve post:', err);
    }
  };

  const handleReject = async (postId: string) => {
    try {
      const res = await fetch(typeof CONFIG.FEED_REJECT === 'function' ? CONFIG.FEED_REJECT(postId) : CONFIG.FEED_REJECT, {
        method: 'POST'
      });
      if (res.ok) {
        setPendingPosts((prev: any[]) => prev.filter((p: any) => p.id !== postId));
      }
    } catch (err) {
      console.error('Failed to reject post:', err);
    }
  };

  const stats = liveStats.length > 0 ? liveStats.map((s: any) => ({
    ...s,
    icon: s.id === 'scans' ? <BarChart3 className="w-5 h-5" /> : 
          s.id === 'users' ? <Users className="w-5 h-5" /> : 
          <MessageSquare className="w-5 h-5" />
  })) : [
    { label: 'Daily Scans', value: '...', trend: '---', icon: <BarChart3 className="w-5 h-5" />, id: 'scans' },
    { label: 'Active Users', value: '...', trend: '---', icon: <Users className="w-5 h-5" />, id: 'users' },
    { label: 'New Posts', value: '...', trend: '---', icon: <MessageSquare className="w-5 h-5" />, id: 'posts' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#050A18] text-white">
      {/* Header */}
      <div className="bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/10 p-6 pt-[max(env(safe-area-inset-top),1.5rem)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate(Screen.PROFILE)}
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Admin Terminal</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Control {isLoading && ' (Syncing...)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-6 gap-4">
        <button 
          onClick={() => setActiveTab('moderation')}
          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
            activeTab === 'moderation' ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5'
          }`}
        >
          Moderation ({pendingPosts.length})
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
            activeTab === 'stats' ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5'
          }`}
        >
          Insights
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'stats' ? (
          <div className="grid gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {s.trend}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                <ShieldCheck className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold">No pending posts for review.</p>
              </div>
            ) : (
              pendingPosts.map((post) => (
                <div key={post.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <img src={post.userAvatar} className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-black text-white">@{post.userName}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">User ID: {post.userId.substring(0,8)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-square w-full relative">
                    <img src={post.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-sm font-bold text-slate-300 leading-relaxed italic">"{post.caption || 'No caption'}"</p>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                         <Check className="w-4 h-4" /> Approve
                       </button>
                       <button 
                        onClick={() => handleReject(post.id)}
                        className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                         <X className="w-4 h-4" /> Reject
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
