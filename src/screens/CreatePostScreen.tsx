// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, X, Plus, Tag, Smile, Camera, Zap, Sparkles, Shield } from 'lucide-react';
import { Screen, DetectedBrick } from '../types';
import { detectFrame } from '../services/onnxDetectionService';

interface CreatePostScreenProps {
    onNavigate: (screen: Screen) => void;
    initialImage?: string | null;
    onClearImage?: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onNavigate, initialImage, onClearImage }) => {
    const [image, setImage] = useState(initialImage || null);
    const [caption, setCaption] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedBricks, setDetectedBricks] = useState<DetectedBrick[]>([]);
    const [showLabels, setShowLabels] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (initialImage) {
            runDetection(initialImage);
        }
    }, [initialImage]);

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

    const runDetection = async (imageData: string) => {
        setIsDetecting(true);
        try {
            const img = new Image();
            img.src = imageData;
            await new Promise((resolve) => { img.onload = resolve; });
            const { objects } = await detectFrame(img);
            const bricks: DetectedBrick[] = objects.map(obj => ({
                id: obj.id,
                label: obj.label,
                confidence: obj.confidence,
                box: obj.box_2d
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
        const stored = localStorage.getItem('hellobrick_feed_posts') || '[]';
        const allPosts = JSON.parse(stored);
        allPosts.unshift(newPost);
        localStorage.setItem('hellobrick_feed_posts', JSON.stringify(allPosts));
        if (onClearImage) onClearImage();
        onNavigate(Screen.FEED);
    };

    const removeBrick = (id: string) => {
        setDetectedBricks(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -ml-48 -mb-48" />

            {/* Header */}
            <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#050A18]/80 sticky top-0">
                <button
                    onClick={() => onNavigate(Screen.FEED)}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-black text-white">BROADCAST</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Shield className="w-2.5 h-2.5 text-indigo-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Public Feed</span>
                    </div>
                </div>
                <button
                    onClick={handlePost}
                    disabled={!image || !caption.trim()}
                    className="px-5 py-2.5 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 active:scale-95 transition-all shadow-lg"
                >
                    Publish
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32 relative z-10">
                {/* Image Section */}
                <div className="max-w-md mx-auto">
                    {!image ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[48px] flex flex-col items-center justify-center group hover:bg-white/10 transition-all shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-[#0A0F1E] rounded-[28px] flex items-center justify-center mb-6 border border-white/5 shadow-3xl group-active:scale-90 transition-transform">
                                <Plus className="w-10 h-10 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-black text-white">Upload Specimen</h3>
                            <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">Digitalize Physical Build</p>
                        </button>
                    ) : (
                        <div className="relative group">
                            <div className="aspect-square rounded-[48px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#0A0F1E] border border-white/10 relative">
                                <img
                                    ref={imageRef}
                                    src={image}
                                    className="w-full h-full object-contain"
                                    alt="Preview"
                                />

                                {showLabels && detectedBricks.map((brick) => {
                                    const [ymin, xmin, ymax, xmax] = brick.box;
                                    return (
                                        <div
                                            key={brick.id}
                                            className="absolute border-2 border-orange-500/50 rounded-xl"
                                            style={{
                                                top: `${ymin / 10}%`,
                                                left: `${xmin / 10}%`,
                                                width: `${(xmax - xmin) / 10}%`,
                                                height: `${(ymax - ymin) / 10}%`,
                                            }}
                                        >
                                            <div className="absolute -top-7 left-0 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-500/30 flex items-center gap-2">
                                                {brick.label}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeBrick(brick.id); }}
                                                    className="p-1 hover:text-red-500"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => { setImage(null); setDetectedBricks([]); onClearImage?.(); }}
                                className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => setShowLabels(!showLabels)}
                                className="absolute bottom-6 right-6 px-5 py-3 bg-black/60 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 border border-white/10 active:scale-95 transition-all"
                            >
                                <Tag className="w-4 h-4 text-orange-500" />
                                {showLabels ? 'Hide Intel' : 'Show Intel'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Auto Caption</h3>
                        </div>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Describe your manifestation..."
                            className="w-full min-h-[140px] bg-[#0A0F1E] border border-white/5 rounded-[24px] p-6 text-base font-bold text-white placeholder-slate-700 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner"
                        />
                    </div>

                    {detectedBricks.length > 0 && (
                        <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                             <div className="flex items-center gap-4 mb-6 px-2">
                                <Zap className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Verified Specimens ({detectedBricks.length})</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {detectedBricks.map(brick => (
                                    <div key={brick.id} className="bg-[#0A0F1E] px-4 py-2.5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 shadow-xl">
                                        {brick.label}
                                        <button onClick={() => removeBrick(brick.id)}>
                                            <X className="w-3.5 h-3.5 text-slate-700 hover:text-red-500 transition-colors" />
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
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-10 text-center">
                    <div className="bg-[#0A0F1E] border border-white/10 p-12 rounded-[56px] flex flex-col items-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-8" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Scanner Synthesis</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Extracting Specimen IDs via ONNX</p>
                    </div>
                </div>
            )}
        </div>
    );
};
