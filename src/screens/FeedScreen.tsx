import React, { useState } from 'react';
import { Screen } from '../types';
import { Heart, MessageCircle, Share2, Plus, RefreshCw, MoreVertical, Search, Zap } from 'lucide-react';

interface Props {
  onNavigate: (screen: Screen, params?: any) => void;
}

const MOCK_POSTS = [
  {
    id: 1,
    user: 'BrickMaster99',
    avatar: 'https://i.pravatar.cc/150?u=1',
    timeAgo: '2h',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&q=80',
    caption: 'Just finished the Rivendell set! Took me 3 days but absolutely worth it. The details on the elven architecture are insane. 🧝‍♂️🏰 #LegoLordOfTheRings',
    tags: ['10316 Rivendell', 'LOTR'],
    likes: 1205,
    comments: 48,
    isLiked: false,
  },
  {
    id: 2,
    user: 'LegoBuilder_Sara',
    avatar: 'https://i.pravatar.cc/150?u=2',
    timeAgo: '5h',
    image: 'https://images.unsplash.com/photo-1599427303058-f0eca32dd107?w=500&q=80',
    caption: 'Reorganized my Star Wars collection today. Running out of shelf space! Anyone else have this problem? 😅',
    tags: ['Star Wars', 'Collection'],
    likes: 342,
    comments: 89,
    isLiked: true,
  },
  {
    id: 3,
    user: 'TechnicFanatic',
    avatar: 'https://i.pravatar.cc/150?u=3',
    timeAgo: '1d',
    image: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=500&q=80',
    caption: 'The new Bugatti Bolide is a surprisingly complex build for its size. Love the yellow and black color scheme.',
    tags: ['42151 Bugatti', 'Technic'],
    likes: 89,
    comments: 5,
    isLiked: false,
  },
  {
    id: 4,
    user: 'ClassicSpace',
    avatar: 'https://i.pravatar.cc/150?u=4',
    timeAgo: '1d',
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500&q=80',
    caption: 'SPACESHIP! Nostalgia hits hard with this one.',
    tags: ['10497 Galaxy Explorer', 'Vintage'],
    likes: 567,
    comments: 23,
    isLiked: false,
  },
  {
    id: 5,
    user: 'CityMayor',
    avatar: 'https://i.pravatar.cc/150?u=5',
    timeAgo: '2d',
    image: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=500&q=80',
    caption: 'Expanding the downtown area. The new jazz club adds so much character to the street! 🎷🍕',
    tags: ['10312 Jazz Club', 'Modular'],
    likes: 421,
    comments: 31,
    isLiked: false,
  },
  {
    id: 6,
    user: 'MinifigHunter',
    avatar: 'https://i.pravatar.cc/150?u=6',
    timeAgo: '3d',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&q=80',
    caption: 'Finally completed my series 24 minifigures! The falconer is definitely my favorite.',
    tags: ['Minifigures', 'Series 24'],
    likes: 215,
    comments: 12,
    isLiked: false,
  }
];

const FEATURED_COLLECTIONS = [
  { id: 1, title: 'Star Wars Day', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&q=80' },
  { id: 2, title: 'Modular Marvels', image: 'https://images.unsplash.com/photo-1520638575031-628d7a1ee922?w=200&q=80' },
  { id: 3, title: 'Technic Beasts', image: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=200&q=80' },
  { id: 4, title: 'Botanical', image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=200&q=80' },
];

export const FeedScreen: React.FC<Props> = ({ onNavigate }) => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 flex flex-col w-full overflow-hidden">
      {/* Header */}
      <div className="pt-[max(env(safe-area-inset-top),2.5rem)] px-4 pb-3 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Community
        </h1>
        <div className="flex gap-4">
          <button className="p-2 rounded-full bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[max(env(safe-area-inset-bottom),6rem)]">
        {/* Pull to refresh hint */}
        <div className={`flex items-center justify-center py-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-100' : 'opacity-0 h-0 py-0'}`}>
          <RefreshCw className="animate-spin text-emerald-500" size={24} />
        </div>
        
        {/* Featured Collections */}
        <div className="py-4 border-b border-gray-200">
          <div className="flex items-center px-4 mb-3">
            <Zap className="text-[#FFD600] mr-2" size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Featured Collections</h2>
          </div>
          <div className="flex overflow-x-auto px-4 pb-2 gap-3 no-scrollbar snap-x">
            {FEATURED_COLLECTIONS.map(collection => (
              <div key={collection.id} className="relative w-28 h-36 rounded-xl overflow-hidden flex-shrink-0 snap-start shadow-lg shadow-black/40">
                <img src={collection.image} alt={collection.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-xs font-medium text-gray-900 leading-tight drop-shadow-md line-clamp-2">{collection.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-6 py-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white border-y border-gray-200 sm:border-x sm:rounded-2xl sm:mx-4 overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full border border-gray-300" />
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{post.user}</h3>
                    <span className="text-xs text-gray-500">{post.timeAgo}</span>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-800 p-1">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square w-full bg-gray-50">
                <img src={post.image} alt="Post content" className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-3">
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleLike(post.id)} 
                    className="flex items-center gap-1.5 transition-transform active:scale-75"
                  >
                    <Heart 
                      size={24} 
                      className={`transition-colors duration-300 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
                    />
                    <span className={`text-sm font-medium ${post.isLiked ? 'text-red-500' : 'text-gray-700'}`}>
                      {post.likes}
                    </span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors">
                    <MessageCircle size={24} />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>

              {/* Caption & Tags */}
              <div className="px-3 pb-4">
                <p className="text-sm text-gray-800 mb-3">
                  <span className="font-bold mr-2 text-gray-900">{post.user}</span>
                  {' '}
                  {post.caption}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-50 text-blue-300 text-xs font-medium rounded-full border border-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate(Screen.CreatePost)}
        className="absolute bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-slate-950 transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
};
