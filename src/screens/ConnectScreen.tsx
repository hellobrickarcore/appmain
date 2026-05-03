
import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, MessageCircle, MoreHorizontal, Plus, X, Send, Camera, Image } from 'lucide-react';
import { Screen } from '../types';
import { CONFIG } from '../services/configService';

interface ConnectScreenProps {
  onNavigate: (screen: Screen) => void;
  isPro?: boolean;
  setPendingPostImage?: (image: string | null) => void;
}

interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: number;
  liked: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  commentList?: Comment[];
  bricks?: any[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onNavigate, isPro = false, setPendingPostImage }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [postCaption, setPostCaption] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewPostOptions, setShowNewPostOptions] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [onlineCount, setOnlineCount] = useState(482);

  // Fluctuating online counter
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(450, prev + change);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load posts from backend or localStorage
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try to load from backend API first
        try {
          const response = await fetch(CONFIG.FEED_POSTS);
          if (response.ok) {
            const data = await response.json();
            // Only show approved posts
            setPosts(data.posts?.filter((p: FeedPost) => p.status === 'approved') || []);
            return;
          }
        } catch (apiError) {
          console.log('Backend not available, using localStorage');
        }

        // Fallback to localStorage
        const stored = localStorage.getItem('hellobrick_feed_posts');
        let allPosts = stored ? JSON.parse(stored) : [];
        
        // FAKE ACTIVITY GENERATOR
        if (allPosts.length < 15) {
          const fakeNames = ["BrickMaster99", "LegoMom_Sarah", "AFOL_Dave", "BuildItBetter", "CreativeBlocks", "CityBuilder"];
          const fakeCaptions = ["Just finished scanning my messy pile and built this!", "Can't believe the app found the exact pieces for this MOC.", "Weekend project complete 🔥", "My kids are obsessed with this scanner app.", "No sorting required, pure magic!"];
          const legoImages = [
            "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80",
            "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80",
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
            "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&q=80",
            "https://images.unsplash.com/photo-1611145100085-f5e27a6f2eb5?w=800&q=80",
            "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80",
            "https://images.unsplash.com/photo-1518331647614-7a1f04cd34ce?w=800&q=80",
            "https://images.unsplash.com/photo-1533022137081-3bd426c19f5e?w=800&q=80"
          ];
          
          for (let i = allPosts.length; i < 15; i++) {
            const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
            const randomCaption = fakeCaptions[Math.floor(Math.random() * fakeCaptions.length)];
            const randomImage = legoImages[Math.floor(Math.random() * legoImages.length)];
            const randomTime = Date.now() - (Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
            
            allPosts.push({
              id: `fake_post_${Date.now()}_${i}`,
              userId: `fake_user_${i}`,
              userName: randomName,
              userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`,
              image: randomImage,
              caption: randomCaption,
              likes: Math.floor(Math.random() * 150) + 12,
              comments: Math.floor(Math.random() * 30) + 2,
              timestamp: randomTime,
              liked: false,
              status: 'approved',
              commentList: []
            });
          }
          
          allPosts.sort((a: any, b: any) => b.timestamp - a.timestamp);
          localStorage.setItem('hellobrick_feed_posts', JSON.stringify(allPosts));
        }

        setPosts(allPosts.filter((p: FeedPost) => p.status === 'approved' || !p.status));
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts([]);
      }
    };
    loadPosts();
  }, []);

  // Calculate post of the week (most engaged)
  const getPostOfWeek = (): FeedPost | null => {
    if (posts.length === 0) return null;

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentPosts = posts.filter(p => p.timestamp > oneWeekAgo);

    if (recentPosts.length === 0) return null;

    // Sort by engagement (likes + comments)
    const sorted = [...recentPosts].sort((a, b) =>
      (b.likes + b.comments) - (a.likes + a.comments)
    );

    return sorted[0];
  };

  const postOfWeek = getPostOfWeek();

  // Filter posts by search
  const filteredPosts = posts.filter(post =>
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open camera
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      setShowCamera(true);

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err);
          });
        }
      }, 100);
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMsg = 'Failed to open camera. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg += 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera found on this device.';
      } else {
        errorMsg += error.message || 'Please check permissions.';
      }
      alert(errorMsg);
    }
  };

  // Handle photo library selection
  const handlePhotoLibrary = () => {
    setShowNewPostOptions(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      if (setPendingPostImage) {
        setPendingPostImage(imageData);
        onNavigate(Screen.CREATE_POST);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Toggle follow
  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Capture photo
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setShowCamera(false);
      setShowPostModal(true);

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Post to feed
  const handlePost = async () => {
    if (!capturedImage || !postCaption.trim()) return;

    try {
      const { getCurrentUser } = await import('../services/supabaseService');
      const { getUserId } = await import('../services/xpService');
      
      const user = await getCurrentUser();
      const userId = user?.id || getUserId();
      const userName = user?.email?.split('@')[0] || localStorage.getItem('hellobrick_profile_name') || 'Builder';

      const newPost: FeedPost = {
        id: `post_${Date.now()}`,
        userId: userId,
        userName: userName,
        userAvatar: user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        image: capturedImage,
        caption: postCaption,
        likes: 0,
        comments: 0,
        timestamp: Date.now(),
        liked: false,
        status: 'pending', // Requires admin approval
        commentList: []
      };

      // Try to send to backend first
      try {
        const response = await fetch(CONFIG.FEED_POSTS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost)
        });

        if (response.ok) {
          alert('Post submitted! It will appear in the feed after admin approval.');
        } else {
          throw new Error('Backend failed');
        }
      } catch (error) {
        // Fallback to localStorage
        console.log('Backend not available, saving to localStorage');
        const stored = localStorage.getItem('hellobrick_feed_posts') || '[]';
        const allPosts = JSON.parse(stored);
        allPosts.push(newPost);
        localStorage.setItem('hellobrick_feed_posts', JSON.stringify(allPosts));
        alert('Post saved! It will appear in the feed after admin approval.');
      }
    } catch (err) {
      console.error('Error during post:', err);
    }

    // Reset state
    setCapturedImage(null);
    setPostCaption('');
    setShowPostModal(false);
  };

  // Toggle like
  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));

    // Update localStorage
    const stored = localStorage.getItem('hellobrick_feed_posts') || '[]';
    const allPosts = JSON.parse(stored);
    const updated = allPosts.map((post: FeedPost) => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    localStorage.setItem('hellobrick_feed_posts', JSON.stringify(updated));
  };

  // Handle comment button click
  const handleCommentClick = (postId: string) => {
    if (!isPro) {
      alert('Upgrade to Pro to comment on posts!');
      onNavigate(Screen.SUBSCRIPTION);
      return;
    }
    setSelectedPostId(postId);
    setShowCommentModal(true);
  };

  // Submit comment
  const handleCommentSubmit = () => {
    if (!selectedPostId || !commentText.trim() || !isPro) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: 'current_user',
      userName: 'You',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      text: commentText,
      timestamp: Date.now()
    };

    setPosts(posts.map(post => {
      if (post.id === selectedPostId) {
        const updatedComments = [...(post.commentList || []), comment];
        return {
          ...post,
          comments: updatedComments.length,
          commentList: updatedComments
        };
      }
      return post;
    }));

    // Update localStorage
    const stored = localStorage.getItem('hellobrick_feed_posts') || '[]';
    const allPosts = JSON.parse(stored);
    const updated = allPosts.map((post: FeedPost) => {
      if (post.id === selectedPostId) {
        const updatedComments = [...(post.commentList || []), comment];
        return {
          ...post,
          comments: updatedComments.length,
          commentList: updatedComments
        };
      }
      return post;
    });
    localStorage.setItem('hellobrick_feed_posts', JSON.stringify(updated));

    setCommentText('');
    setShowCommentModal(false);
    setSelectedPostId(null);
  };

  // Format time ago
  const getTimeAgo = (timestamp: number): string => {
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
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      {/* Header - Sticky */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
             <h1 className="text-2xl font-black text-slate-900">Feed</h1>
             <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{onlineCount} Online Now</span>
             </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNewPostOptions(!showNewPostOptions)}
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Post Options Dropdown */}
        {showNewPostOptions && (
          <div className="absolute right-6 top-24 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <button
              onClick={() => { setShowNewPostOptions(false); handleOpenCamera(); }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 w-full text-left"
            >
              <Camera className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Take Photo</span>
            </button>
            <button
              onClick={handlePhotoLibrary}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 w-full text-left border-t border-slate-100"
            >
              <Image className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Choose from Library</span>
            </button>
          </div>
        )}

        {/* Hidden file input for photo library */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-6 pb-24">

        {/* WEEKLY WINNER HERO */}
        {postOfWeek && (
          <div className="relative mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <h2 className="text-lg font-black text-slate-900">Post of the Week</h2>
              </div>
              <span className="text-[10px] font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full shadow-md">
                Top Engagement
              </span>
            </div>

            <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden group shadow-xl cursor-pointer">
              <img src={postOfWeek.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

              {/* Winner Info */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10">
                <img src={postOfWeek.userAvatar} className="w-8 h-8 rounded-full border border-white" />
                <div>
                  <p className="text-xs font-bold text-white leading-none">@{postOfWeek.userName}</p>
                  <p className="text-[9px] font-medium text-yellow-400">
                    {postOfWeek.likes + postOfWeek.comments} engagements
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <p className="text-sm text-slate-200 line-clamp-2 mb-3">
                  {postOfWeek.caption}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold opacity-90">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    {postOfWeek.likes} Likes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {postOfWeek.comments} Comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEED */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">No posts yet</p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowNewPostOptions(true); }}
                className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold relative"
              >
                Create First Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.userAvatar} className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-100" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{post.userName}</h3>
                      <p className="text-xs text-slate-400 font-medium">{getTimeAgo(post.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.userId !== 'current_user' && (
                      <button
                        onClick={() => handleFollow(post.userId)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${followedUsers.has(post.userId)
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-blue-500 text-white'
                          }`}
                      >
                        {followedUsers.has(post.userId) ? 'Following' : 'Follow'}
                      </button>
                    )}
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="w-full bg-slate-50 relative">
                  <img src={post.image} className="w-full h-auto object-cover max-h-[400px]" />
                </div>

                {/* Actions */}
                <div className="p-4 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${post.liked ? 'text-red-500' : 'text-slate-700 hover:text-red-500'
                          }`}
                      >
                        <Heart className={`w-6 h-6 ${post.liked ? 'fill-red-500' : ''}`} />
                        <span className="text-sm font-bold">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleCommentClick(post.id)}
                        className="flex items-center gap-1.5 text-slate-700 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm font-bold">{post.comments}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed mb-3">
                    <span className="font-bold mr-2">{post.userName}</span>
                    {post.caption}
                  </p>

                  {post.bricks && post.bricks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.bricks.map((brick: any) => (
                        <span key={brick.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          🧱 {brick.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {post.commentList && post.commentList.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                      {post.commentList.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <img src={comment.userAvatar} className="w-6 h-6 rounded-full" />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-900">{comment.userName}</span>
                            <span className="text-xs text-slate-600 ml-2">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                      {post.commentList.length > 3 && (
                        <button
                          onClick={() => handleCommentClick(post.id)}
                          className="text-xs text-slate-500 font-bold"
                        >
                          View all {post.commentList.length} comments
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {
        showCommentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
            <div className="bg-white w-full rounded-t-[32px] p-6 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add Comment</h2>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentText('');
                    setSelectedPostId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 w-full p-4 border border-slate-200 rounded-2xl resize-none mb-4 min-h-[100px]"
                autoFocus
              />

              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || !isPro}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Post Comment
              </button>
            </div>
          </div>
        )
      }

      {/* Camera Modal */}
      {
        showCamera && (
          <div className="fixed inset-0 z-50 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(err => console.error('Video play error:', err));
                }
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => {
                    setShowCamera(false);
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach(track => track.stop());
                      streamRef.current = null;
                    }
                  }}
                  className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-2xl active:scale-95 transition-transform flex items-center justify-center"
                >
                  <Camera className="w-8 h-8 text-slate-900" />
                </button>
                <div className="w-14 h-14"></div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )
      }

      {/* Post Modal */}
      {
        showPostModal && capturedImage && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
            <div className="bg-white w-full rounded-t-[32px] p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create Post</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setCapturedImage(null);
                    setPostCaption('');
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img src={capturedImage} className="w-full rounded-2xl mb-4 max-h-[300px] object-cover" />

              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full p-4 border border-slate-200 rounded-2xl resize-none mb-4 min-h-[100px]"
              />

              <button
                onClick={handlePost}
                disabled={!capturedImage || !postCaption.trim()}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
};
