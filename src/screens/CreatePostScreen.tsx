// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, X, Plus, Tag, Smile } from 'lucide-react';
import { Screen, DetectedBrick } from '../types';
import { detectFrame } from '../services/onnxDetectionService';

interface CreatePostScreenProps {
    onNavigate: (screen: Screen) => void;
    initialImage?: string | null;
    onClearImage?: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onNavigate, initialImage, onClearImage }) => {
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [caption, setCaption] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedBricks, setDetectedBricks] = useState<DetectedBrick[]>([]);
    const [showLabels, setShowLabels] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Run detection on initial image if provided
    useEffect(() => {
        if (initialImage) {
            runDetection(initialImage);
        }
    }, [initialImage]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setImage(imageData);
            runDetection(imageData);
        };
        reader.readAsDataURL(file);
    };

    // Run ONNX detection on the uploaded image
    const runDetection = async (imageData: string) => {
        setIsDetecting(true);
        try {
            // Create a temporary image element to run detection
            const img = new Image();
            img.src = imageData;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const { objects } = await detectFrame(img);

            // Convert OnnxDetection to DetectedBrick
            const bricks: DetectedBrick[] = objects.map(obj => ({
                id: obj.id,
                label: obj.label,
                confidence: obj.confidence,
                box: obj.box_2d // [ymin, xmin, ymax, xmax] in 0-1000 scale
            }));

            setDetectedBricks(bricks);
        } catch (error) {
            console.error('Detection failed:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    const handlePost = () => {
        if (!image || !caption.trim()) return;

        const newPost = {
            id: `post_${Date.now()}`,
            userId: 'current_user',
            userName: 'You',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
            image: image,
            caption: caption,
            likes: 0,
            comments: 0,
            timestamp: Date.now(),
            liked: false,
            bricks: detectedBricks
        };

        // Save to localStorage (fallback for now)
        const stored = localStorage.getItem('hellobrick_feed_posts') || '[]';
        const allPosts = JSON.parse(stored);
        allPosts.unshift(newPost);
        localStorage.setItem('hellobrick_feed_posts', JSON.stringify(allPosts));

        alert('Post created successfully!');
        if (onClearImage) onClearImage();
        onNavigate(Screen.CONNECT);
    };

    const removeBrick = (id: string) => {
        setDetectedBricks(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 z-30">
                <button
                    onClick={() => onNavigate(Screen.CONNECT)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-lg font-black text-slate-900">Create Post</h1>
                <button
                    onClick={handlePost}
                    disabled={!image || !caption.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-sm disabled:opacity-50"
                >
                    Share
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Image Upload Area */}
                {!image ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-bold text-slate-900">Upload Image</p>
                        <p className="text-xs text-slate-500 mt-1">Select a photo of your creation</p>
                    </div>
                ) : (
                    <div className="relative group">
                        <div className="aspect-square rounded-[32px] overflow-hidden shadow-xl bg-black">
                            <img
                                ref={imageRef}
                                src={image}
                                className="w-full h-full object-contain"
                                alt="Upload preview"
                            />

                            {/* Overlay Labels */}
                            {showLabels && detectedBricks.map((brick) => {
                                const [ymin, xmin, ymax, xmax] = brick.box;
                                return (
                                    <div
                                        key={brick.id}
                                        className="absolute border-2 border-orange-500 rounded-lg group/brick"
                                        style={{
                                            top: `${ymin / 10}%`,
                                            left: `${xmin / 10}%`,
                                            width: `${(xmax - xmin) / 10}%`,
                                            height: `${(ymax - ymin) / 10}%`,
                                        }}
                                    >
                                        <div className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border border-orange-500 flex items-center gap-1">
                                            {brick.label}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeBrick(brick.id); }}
                                                className="p-0.5 hover:text-red-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => { setImage(null); setDetectedBricks([]); onClearImage?.(); }}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setShowLabels(!showLabels)}
                            className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2"
                        >
                            <Tag className="w-4 h-4" />
                            {showLabels ? 'Hide Labels' : 'Show Labels'}
                        </button>
                    </div>
                )}

                {/* Post Info */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Smile className="w-5 h-5 text-slate-400" />
                            <p className="text-sm font-bold text-slate-900">Add a caption</p>
                        </div>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="What are you building today?"
                            className="w-full min-h-[120px] bg-slate-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                        />
                    </div>

                    {detectedBricks.length > 0 && (
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                            <p className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-orange-500" />
                                Detected Bricks ({detectedBricks.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {detectedBricks.map(brick => (
                                    <div key={brick.id} className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        {brick.label}
                                        <button onClick={() => removeBrick(brick.id)}>
                                            <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            {isDetecting && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-8 rounded-[40px] flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold text-slate-900">Analyzing Photo...</p>
                        <p className="text-xs text-slate-500 mt-1">Identifying bricks with ONNX</p>
                    </div>
                </div>
            )}
        </div>
    );
};
