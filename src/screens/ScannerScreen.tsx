import React, { useState, useEffect, useRef } from 'react';
import { X, Zap } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { Logo } from '../components/Logo';

// Deep computer vision system imports
import { ScannerDetectLoop } from '../scanner-core/detector/detectLoop';
import { overlayMapper } from '../scanner-core/overlays/overlayMapper';
import { bboxToRenderBox, DetectionOverlay } from '../types/detection';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

// Mock prices based on string hash for deterministic UI demo
const getMockPrice = (str: string, type: 'new' | 'used' = 'new') => {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (hash % 150) + 20;
  return type === 'new' ? base + 0.99 : (base * 0.6) + 0.99;
};

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  // Real-time Bounding Box Overlays
  const [overlays, setOverlays] = useState<DetectionOverlay[]>([]);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detectLoopRef = useRef<ScannerDetectLoop | null>(null);

  // ResizeObserver to dynamically match absolute overlay coordinates to video dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Initialize and run the real-time AI Bounding Box detection loop
  useEffect(() => {
    const loop = new ScannerDetectLoop(`session_${Date.now()}`, {
      onSuccess: (response) => {
        setFrameWidth(response.frameWidth);
        setFrameHeight(response.frameHeight);
        const mapped = overlayMapper(response);
        setOverlays(mapped);
      },
      onError: (err) => {
        console.warn('[ScannerScreen] Detection Loop Error:', err);
      }
    });
    
    detectLoopRef.current = loop;
    
    return () => {
      loop.stop();
    };
  }, []);

  // Bind camera stream to videoRef and start loop once video plays
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Camera error:', err));
    }
  }, []);

  // Start detect loop once video elements are ready and active
  useEffect(() => {
    const video = videoRef.current;
    const loop = detectLoopRef.current;
    if (!video || !loop) return;

    loop.setVideoElement(video);
    
    const handlePlay = () => {
      console.log('[ScannerScreen] Video active. Resuming AI vision loop.');
      loop.start();
    };
    
    video.addEventListener('playing', handlePlay);
    if (!video.paused) {
      handlePlay();
    }

    return () => {
      video.removeEventListener('playing', handlePlay);
      loop.stop();
    };
  }, [videoRef.current]);

  const saveToCollection = () => {
    const stored = localStorage.getItem('hellobrick_collection_sets');
    let current: CollectionItem[] = [];
    try {
      current = stored ? JSON.parse(stored) : [];
    } catch (e) {
      current = [];
    }

    overlays.forEach(ov => {
      const newItem: CollectionItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: 'user-1',
        setNum: ov.displayText?.replace(/\s+/g, '-').toLowerCase() || 'scanned-item',
        condition: 'sealed',
        quantity: 1,
        purchasePrice: getMockPrice(ov.id || 'mock', 'new'),
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: `AI Scanned: ${ov.displayText || 'Item'}`,
        addedAt: new Date().toISOString(),
        itemType: 'set'
      };
      current.push(newItem);
    });

    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
    
    import('canvas-confetti').then((conf) => {
      conf.default({
        particleCount: 50,
        spread: 45,
        colors: ['#10B981', '#3B82F6', '#F59E0B'],
        origin: { y: 0.8 }
      });
    });

    onNavigate(Screen.HOME);
  };

  const totalValue = overlays.reduce((sum, ov) => sum + getMockPrice(ov.id || 'mock', 'new'), 0);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-100 relative overflow-hidden select-none">
      
      {/* Live Camera Viewport */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for top and bottom readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Top Bar Navigation & Info */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),2.5rem)] px-4 flex items-center justify-between z-40">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {overlays.length > 0 && (
          <div className="bg-emerald-500 rounded-full px-4 py-2 shadow-lg shadow-emerald-500/20 border border-emerald-400 font-bold text-sm text-white">
            ${totalValue.toFixed(2)} &middot; {overlays.length} {overlays.length === 1 ? 'item' : 'items'}
          </div>
        )}

        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
          <Zap className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Real-time Bounding Box Canvas Overlay Layer */}
      <div ref={containerRef} className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {overlays.map((overlay) => {
          if (!overlay.box || frameWidth === 0 || frameHeight === 0 || containerSize.width === 0 || containerSize.height === 0) return null;
          
          const renderBox = bboxToRenderBox(
            {
              format: 'xyxy',
              space: 'pixel',
              xMin: overlay.box.xMin,
              yMin: overlay.box.yMin,
              xMax: overlay.box.xMax,
              yMax: overlay.box.yMax,
            },
            frameWidth,
            frameHeight,
            containerSize.width,
            containerSize.height,
            'cover'
          );

          const newPrice = getMockPrice(overlay.id || 'mock', 'new');
          const usedPrice = getMockPrice(overlay.id || 'mock', 'used');

          return (
            <div
              key={overlay.id}
              className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-auto shadow-[0_0_15px_rgba(52,211,153,0.4)] flex flex-col items-center justify-center"
              style={{
                top: `${renderBox.top}%`,
                left: `${renderBox.left}%`,
                width: `${renderBox.width}%`,
                height: `${renderBox.height}%`,
              }}
            >
              {/* Floating Price Direct Overlay */}
              <div className="flex flex-col items-center justify-center drop-shadow-2xl">
                <span className="text-3xl font-black text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  ${newPrice.toFixed(2)}
                </span>
                
                {/* Condition Pills */}
                <div className="flex gap-2 mt-2">
                  <div className="bg-black/70 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20 text-[10px] font-bold text-white shadow-lg">
                    Sealed: ${newPrice.toFixed(2)}
                  </div>
                  <div className="bg-black/70 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20 text-[10px] font-bold text-zinc-300 shadow-lg">
                    Used: ${usedPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Tray & CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),2rem)]">
        
        {/* Horizontal scroll of detected item cards */}
        {overlays.length > 0 && (
          <div className="flex overflow-x-auto px-4 pb-4 gap-3 snap-x no-scrollbar">
            {overlays.map((ov, idx) => (
              <div key={idx} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex gap-3 min-w-[260px] snap-center shrink-0 items-center">
                <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🧱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{ov.displayText || 'LEGO Set'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">Sealed</span>
                    <span className="text-white font-bold text-xs">${getMockPrice(ov.id || 'mock', 'new').toFixed(2)}</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Big Green CTA */}
        <div className="px-4">
          <button 
            onClick={saveToCollection}
            disabled={overlays.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center transition-all ${
              overlays.length > 0 
                ? 'bg-emerald-500 text-white active:scale-95' 
                : 'bg-zinc-800 text-zinc-500 opacity-80'
            }`}
          >
            {overlays.length > 0 ? `Add ${overlays.length} to Collection` : 'Searching for LEGO...'}
          </button>
        </div>
      </div>
    </div>
  );
};
