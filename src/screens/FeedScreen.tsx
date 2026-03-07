// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, ChevronLeft, User, Lock, Globe } from 'lucide-react';
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

  // Mock feed data - in production, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts([
        {
          id: '1',
          userId: 'user1',
          userName: 'BrickMaster42',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BrickMaster',
          isPrivate: false,
          image: 'https://picsum.photos/seed/lego1/400/400',
          title: 'Epic Castle Build',
          description: 'Just finished this amazing castle! Used 2,500+ bricks. Took me 3 weeks but totally worth it! 🏰',
          bricksUsed: 2500,
          likes: 124,
          comments: 23,
          isLiked: false,
          timestamp: Date.now() - 3600000, // 1 hour ago
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'BrickLover99',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LEGOLover',
          isPrivate: false,
          image: 'https://picsum.photos/seed/lego2/400/400',
          title: 'Space Station MOC',
          description: 'My latest space station creation! Features working lights and rotating sections.',
          bricksUsed: 1800,
          likes: 89,
          comments: 15,
          isLiked: true,
          timestamp: Date.now() - 7200000, // 2 hours ago
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'BrickBuilder',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BrickBuilder',
          isPrivate: true,
          image: 'https://picsum.photos/seed/lego3/400/400',
          title: 'Secret Project',
          description: 'Working on something special...',
          bricksUsed: 500,
          likes: 45,
          comments: 8,
          isLiked: false,
          timestamp: Date.now() - 10800000, // 3 hours ago
        },
      ]);
      setLoading(false);
    }, 500);
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Feed</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Feed Posts */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading feed...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">No posts yet</h2>
            <p className="text-slate-500 text-center">Be the first to share your creation!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white border-b border-slate-200">
              {/* Post Header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.userAvatar} 
                    alt={post.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{post.userName}</span>
                      {post.isPrivate ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Globe className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Post Image */}
              <div className="relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full aspect-square object-cover"
                />
                {post.isPrivate && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                    <Lock className="w-3 h-3 text-white" />
                    <span className="text-xs font-bold text-white">Private</span>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-slate-700'}`}
                  >
                    <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="font-bold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-700">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-bold">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-700">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Post Info */}
                <div className="mb-2">
                  <h3 className="font-black text-slate-900 mb-1">{post.title}</h3>
                  <p className="text-sm text-slate-700 mb-2">{post.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>🧱 {post.bricksUsed.toLocaleString()} bricks</span>
                  </div>
                </div>

                {/* View Comments Button */}
                {post.comments > 0 && (
                  <button className="text-xs text-slate-500 hover:text-slate-700">
                    View all {post.comments} comments
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

