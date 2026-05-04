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
  baseLikes: number;
  isLiked: boolean;
  postedAt: number; // fixed epoch timestamp
}

interface FeedScreenProps {
  onNavigate: (screen: Screen) => void;
}

// ─── Seeded Random ───────────────────────────────────────────────
// Produces a deterministic daily fluctuation per post so likes feel alive
function seededRandom(seed: number): number {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function dailyLikeOffset(postId: string, baseLikes: number): number {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const seed = daysSinceEpoch * 31 + postId.charCodeAt(0) * 7 + postId.length;
  const fluctuation = Math.floor(seededRandom(seed) * 11) - 3; // -3 to +7
  return Math.max(0, baseLikes + fluctuation);
}

// ─── Anchored Launch Date ────────────────────────────────────────
// Posts are anchored relative to a fixed "launch week" so timestamps
// naturally age as real calendar time passes.
function getAnchoredTimestamp(daysAgo: number, hoursOffset = 0): number {
  const now = Date.now();
  const ONE_DAY = 86400000;
  const ONE_HOUR = 3600000;
  return now - (daysAgo * ONE_DAY) - (hoursOffset * ONE_HOUR);
}

// ─── Realistic Online Counter ────────────────────────────────────
function getRealisticOnlineCount(): number {
  const hour = new Date().getHours();
  // Higher during evening hours (18-23), lower overnight (0-6)
  if (hour >= 18 && hour <= 23) return 485 + Math.floor(Math.random() * 30); // 485-514
  if (hour >= 0 && hour <= 6) return 452 + Math.floor(Math.random() * 15);   // 452-466
  return 468 + Math.floor(Math.random() * 25);                                // 468-492
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(getRealisticOnlineCount);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadFeed = () => {
      const local = JSON.parse(localStorage.getItem('hellobrick_feed_posts') || '[]');

      // 8 seed posts with anchored timestamps that age naturally
      const seedPosts: FeedPost[] = [
        {
          id: 'seed_1',
          userId: 'user1',
          userName: 'TinyBuilder',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiny',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Sorted my whole collection',
          description: 'Finally went through all the bins. Took ages but at least now I know what I actually have 😅',
          bricksUsed: 42,
          baseLikes: 247,
          isLiked: false,
          postedAt: getAnchoredTimestamp(0, 3),
        },
        {
          id: 'seed_2',
          userId: 'user2',
          userName: 'NatureLover',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nature',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Colourful build',
          description: 'Grabbed whatever I could find in the box and this came out. Not bad for random pieces',
          bricksUsed: 18,
          baseLikes: 89,
          isLiked: true,
          postedAt: getAnchoredTimestamp(1, 5),
        },
        {
          id: 'seed_3',
          userId: 'user3',
          userName: 'レゴパパ',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=legopapa',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/2081166/pexels-photo-2081166.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: '息子と一緒に',
          description: '週末に息子と作りました。色がバラバラだけど楽しかった 🚗',
          bricksUsed: 25,
          baseLikes: 312,
          isLiked: false,
          postedAt: getAnchoredTimestamp(2, 1),
        },
        {
          id: 'seed_4',
          userId: 'user4',
          userName: 'BrickQueen',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/1660662/pexels-photo-1660662.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Mini city vibes',
          description: 'Trying to build a whole street from spare parts. Its slow going but getting there 🏢',
          bricksUsed: 56,
          baseLikes: 1243,
          isLiked: false,
          postedAt: getAnchoredTimestamp(3, 8),
        },
        {
          id: 'seed_5',
          userId: 'user5',
          userName: 'carlos_bricks',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Creación libre',
          description: 'Sin instrucciones, solo piezas sueltas y imaginación. A mi hija le encantó 🌴',
          bricksUsed: 14,
          baseLikes: 156,
          isLiked: false,
          postedAt: getAnchoredTimestamp(5, 1),
        },
        {
          id: 'seed_6',
          userId: 'user6',
          userName: 'DadBuilds',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dad',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/2252586/pexels-photo-2252586.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Mess before the build lol',
          description: 'This is what my table looks like every saturday. The kids just dump everything out and go for it',
          bricksUsed: 34,
          baseLikes: 78,
          isLiked: true,
          postedAt: getAnchoredTimestamp(7, 4),
        },
        {
          id: 'seed_7',
          userId: 'user7',
          userName: 'Bausteine_Max',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/3933881/pexels-photo-3933881.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Altes Set neu gebaut',
          description: 'Hatte noch Steine von vor 10 Jahren im Keller. Hab einfach was zusammengebaut ❤️',
          bricksUsed: 67,
          baseLikes: 534,
          isLiked: false,
          postedAt: getAnchoredTimestamp(10, 6),
        },
        {
          id: 'seed_8',
          userId: 'user8',
          userName: 'PixelArtPro',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel',
          isPrivate: false,
          image: 'https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg?auto=compress&cs=tinysrgb&w=800',
          title: 'Tiny garden scene',
          description: 'Made a little garden with whatever green and brown pieces I had lying around 🌿',
          bricksUsed: 22,
          baseLikes: 2891,
          isLiked: false,
          postedAt: getAnchoredTimestamp(12, 3),
        },
      ];

      // Apply daily fluctuating likes
      const postsWithLives = seedPosts.map(p => ({
        ...p,
        likes: dailyLikeOffset(p.id, p.baseLikes),
      }));

      // Merge local user posts on top, sort by timestamp descending
      const allPosts = [...local, ...postsWithLives];

      // ── DAILY DRIP: Add 2-3 fresh Unsplash posts per day ──
      const dailyNames = [
        "BrickNinja", "AFOLJenny", "TechnicFan_UK", "ModularMike", "SpaceBuilder_",
        "ClassicBricks", "BricksByJake", "PixelBricks", "MasterMOC", "LEGOdad_Mark",
        "PlasticArchitect", "MinifigCollector", "NinjaBricks", "BrickQueen2", "StudShooter",
        "建築好き", "lego_maria", "briques_jules", "mattoncini_it", "klodser_dk",
        "brick_addict_23", "xXBuildKingXx", "sarahh_builds", "jonnybricks99"
      ];
      const dailyCaptions = [
        "nice 🔥",
        "built this in like 15 min",
        "found bricks I forgot I had lol",
        "sunday afternoon vibes",
        "my kids did this one ❤️",
        "first time trying freebuilding",
        "messy pile → this. not bad",
        "took way longer than expected tbh",
        "200+ pieces and counting",
        "perfecto 🫶",
        "rainy day build",
        "genuinley cant believe this worked",
        "magnifique 🇫🇷",
        "子供と一緒に作った 🎉",
        "does this count as art??",
        "its not perfect but its mine",
        "wow",
        "finally used those random bricks in my drawer",
        "mein Sonntagsprojekt",
        "¡mi hijo lo diseñó solo!",
        "happy with how this turned out",
        "obsessed w this colour combo 😍"
      ];
      const dailyImages = [
        "https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2081166/pexels-photo-2081166.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1660662/pexels-photo-1660662.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2252586/pexels-photo-2252586.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3933881/pexels-photo-3933881.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1100946/pexels-photo-1100946.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3662843/pexels-photo-3662843.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3408745/pexels-photo-3408745.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2539462/pexels-photo-2539462.jpeg?auto=compress&cs=tinysrgb&w=800"
      ];

      const today = new Date().toISOString().split('T')[0];
      const lastDrip = localStorage.getItem('hellobrick_community_last_drip');

      if (lastDrip !== today) {
        const numNew = 2 + Math.floor(Math.random() * 2); // 2-3
        for (let j = 0; j < numNew; j++) {
          const name = dailyNames[Math.floor(Math.random() * dailyNames.length)];
          const hourOffset = Math.floor(Math.random() * 6) * 3600000;
          // Varied like counts: most 20-300, occasional viral post 500-3000
          const isViral = Math.random() < 0.15;
          const likes = isViral
            ? Math.floor(Math.random() * 2500) + 500
            : Math.floor(Math.random() * 280) + 3;
          allPosts.push({
            id: `daily_${today}_${j}_${Math.random().toString(36).slice(2,7)}`,
            userId: `user_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            userName: name,
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}${j}`,
            isPrivate: false,
            image: dailyImages[Math.floor(Math.random() * dailyImages.length)],
            title: dailyCaptions[Math.floor(Math.random() * dailyCaptions.length)].split('!')[0],
            description: dailyCaptions[Math.floor(Math.random() * dailyCaptions.length)],
            bricksUsed: Math.floor(Math.random() * 80) + 15,
            baseLikes: likes,
            isLiked: false,
            postedAt: Date.now() - hourOffset,
          } as any);
        }
        localStorage.setItem('hellobrick_community_last_drip', today);
        // Persist the daily posts
        const dailyOnly = allPosts.filter((p: any) => p.id?.startsWith('daily_'));
        const existingLocal = JSON.parse(localStorage.getItem('hellobrick_feed_posts') || '[]');
        localStorage.setItem('hellobrick_feed_posts', JSON.stringify([...existingLocal, ...dailyOnly]));
      }

      const sorted = allPosts
        .filter((p: any) => !p.isPending)
        .sort((a: any, b: any) => (b.postedAt || b.timestamp || 0) - (a.postedAt || a.timestamp || 0));
      setPosts(sorted as any);
      setLoading(false);
    };

    const timer = setTimeout(loadFeed, 600);

    // Realistic online counter: fluctuates ±1-3 every 8-15 seconds
    const counterInterval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const base = getRealisticOnlineCount();
        // Nudge towards the realistic base to prevent drift
        const nudged = prev + delta + Math.sign(base - prev);
        return Math.max(450, Math.min(520, nudged));
      });
    }, 8000 + Math.random() * 7000);

    // Live time ticker — refreshes "X ago" every 30 seconds
    const timeUpdater = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(counterInterval);
      clearInterval(timeUpdater);
    };
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: (post as any).isLiked ? (post as any).likes - 1 : ((post as any).likes || post.baseLikes) + 1 }
        : post
    ));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
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
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{formatTimeAgo(post.postedAt || (post as any).timestamp)}</span>
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
                         <img src={post.image} className="w-full h-full object-cover" alt={post.title} style={{ filter: `brightness(${0.92 + (post.id.charCodeAt(post.id.length - 1) % 7) * 0.03}) saturate(${0.9 + (post.id.charCodeAt(0) % 5) * 0.06}) hue-rotate(${(post.id.charCodeAt(2) || 0) % 8}deg)` }} />
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
                             <span className={`text-sm font-black ${post.isLiked ? 'text-white' : 'text-slate-500'}`}>{(post as any).likes || post.baseLikes}</span>
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
