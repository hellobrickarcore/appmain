import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, ChevronLeft, Lock, Globe, Plus, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isPrivate: boolean;
  image: string;
  title: string;
  description: string;
  bricksUsed: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: number;
}

interface FeedScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API Fetch
    setTimeout(() => {
      setPosts([
        {
          id: '1',
          userId: 'user1',
          userName: 'MasterBuilder',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master',
          isPrivate: false,
          image: 'https://images.unsplash.com/photo-1563811771046-ba984ff30900?auto=format&fit=crop&q=80&w=800',
          title: 'Cyberpunk Skyline',
          description: 'Used almost 4,000 Technic parts for this neon-lit modular build. 🧱',
          bricksUsed: 3950,
          likes: 412,
          comments: 45,
          isLiked: false,
          timestamp: Date.now() - 3600000,
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'BrickHuntress',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huntress',
          isPrivate: false,
          image: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?auto=format&fit=crop&q=80&w=800',
          title: 'Forest Retreat',
          description: 'Simple 1x2 and 2x4 build focusing on organic shapes and textures.',
          bricksUsed: 800,
          likes: 215,
          comments: 12,
          isLiked: true,
          timestamp: Date.now() - 7200000,
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Community</h1>
           <div className="flex items-center gap-1 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">342 Online</span>
           </div>
        </div>
        <button
          onClick={() => onNavigate(Screen.CREATE_POST)}
          className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-white/5 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fetching Latest Builds...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-6">
            {posts.map((post) => (
              <div key={post.id} className="relative group px-4">
                 <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl pb-4">
                    {/* Post Header */}
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden p-0.5">
                          <img src={post.userAvatar} className="w-full h-full rounded-xl" alt={post.userName} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                             <span className="font-black text-white text-sm">@{post.userName}</span>
                             {post.isPrivate ? <Lock className="w-3 h-3 text-slate-600" /> : <Globe className="w-3 h-3 text-slate-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{formatTimeAgo(post.timestamp)}</span>
                        </div>
                      </div>
                      <MoreVertical className="w-5 h-5 text-slate-700" />
                    </div>

                    {/* Image Area */}
                    <div className="px-4">
                       <div className="relative rounded-[32px] overflow-hidden aspect-square border border-white/5">
                         <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                         <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                           <Sparkles className="w-3 h-3 text-yellow-400" />
                           <span className="text-[9px] font-black text-white uppercase tracking-widest">Featured</span>
                         </div>
                       </div>
                    </div>

                    {/* Actions & Info */}
                    <div className="px-6 py-5">
                       <div className="flex items-center gap-6 mb-5">
                          <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 group">
                             <Heart className={`w-6 h-6 transition-all ${post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-500 group-active:scale-95'}`} />
                             <span className={`text-sm font-black ${post.isLiked ? 'text-white' : 'text-slate-500'}`}>{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-2">
                             <MessageCircle className="w-6 h-6 text-slate-500" />
                             <span className="text-sm font-black text-slate-500">{post.comments}</span>
                          </button>
                          <button className="ml-auto w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                             <Share2 className="w-4 h-4 text-slate-500" />
                          </button>
                       </div>

                       <div className="text-left">
                         <h3 className="font-black text-lg text-white mb-2 leading-tight">{post.title}</h3>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{post.description}</p>
                         <div className="inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/10">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{post.bricksUsed.toLocaleString()} Bricks</span>
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
