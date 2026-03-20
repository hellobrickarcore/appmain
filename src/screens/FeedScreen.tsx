import React, { useState, useEffect } from 'react';
import { Heart, Share2, MoreVertical, ChevronLeft, Lock, Globe, Plus, Sparkles } from 'lucide-react';
import houseImg from '../assets/community/house_simple.png';
import treeImg from '../assets/community/tree_simple.png';
import carImg from '../assets/community/car_simple.png';
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
  isLiked: boolean;
  timestamp: number;
}

interface FeedScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(342);

  useEffect(() => {
    // Simulated API Fetch + Local Storage Merge
    const loadFeed = () => {
      const local = JSON.parse(localStorage.getItem('hellobrick_feed_posts') || '[]');
      const remote = [
        {
          id: '1',
          userId: 'user1',
          userName: 'TinyBuilder',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiny',
          isPrivate: false,
          image: houseImg,
          title: 'My First LEGO House',
          description: 'Used some leftover 2x4 bricks to make this little cottage. 🏠',
          bricksUsed: 42,
          likes: 31,
          isLiked: false,
          timestamp: Date.now() - 3600000,
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'NatureLover',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nature',
          isPrivate: false,
          image: treeImg,
          title: 'Simple Desktop Tree',
          description: 'Just a few brown and green bricks, but it makes my desk look great!',
          bricksUsed: 18,
          likes: 24,
          isLiked: true,
          timestamp: Date.now() - 7200000,
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'QuickRacer',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Racer',
          isPrivate: false,
          image: carImg,
          title: '5-Minute Race Car',
          description: 'Built this with my son in a few minutes. Simple but fast!',
          bricksUsed: 25,
          likes: 12,
          isLiked: false,
          timestamp: Date.now() - 14400000,
        }
      ];

      // Merge and sort
      const allPosts = [...local, ...remote]
        .filter((p: any) => !p.isPending)
        .sort((a, b) => b.timestamp - a.timestamp);
      setPosts(allPosts);
      setLoading(false);
    };

    const timer = setTimeout(loadFeed, 800);
    
    // Online counter fluctuation
    const counterInterval = setInterval(() => {
       setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(counterInterval);
    };
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
    <div className="flex flex-col h-screen bg-[#050A18] text-white font-sans overflow-hidden">
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
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {onlineCount} Online
             </span>
           </div>
        </div>
        <button
          onClick={() => onNavigate(Screen.CREATE_POST)}
          className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain pb-[max(env(safe-area-inset-bottom),120px)]">
        {loading ? (
          <div className="space-y-6 pt-6 px-4">
             {[1,2].map(i => (
               <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-[40px] h-[500px] overflow-hidden">
                  <div className="h-16 w-full bg-white/5 mb-4" />
                  <div className="mx-4 h-[350px] bg-white/10 rounded-[32px] mb-4" />
                  <div className="px-6 space-y-3">
                     <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                     <div className="h-3 w-2/3 bg-white/10 rounded-full" />
                  </div>
               </div>
             ))}
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
                    <button 
                      onClick={() => {
                        const action = window.confirm('Report this post or block this user?');
                        if (action) alert('Post reported. Thank you for keeping the community safe.');
                      }}
                      className="p-2 hover:bg-white/5 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-700" />
                    </button>
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
