import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Plus, Layers } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import confetti from 'canvas-confetti';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  mode?: string;
}

interface ScannedCard {
  id: string;
  setNum: string;
  name: string;
  theme: string;
  sealedPrice: number;
  usedPrice: number;
  imageUrl: string;
  confidence: number;
}

const SAMPLE_DETECTABLE_SETS: ScannedCard[] = [
  {
    id: 'sample-1',
    setNum: '75192-1',
    name: 'Millennium Falcon (UCS)',
    theme: 'Star Wars',
    sealedPrice: 849.99,
    usedPrice: 620.00,
    imageUrl: 'https://images.brickset.com/sets/images/75192-1.jpg',
    confidence: 0.98,
  },
  {
    id: 'sample-2',
    setNum: '10316-1',
    name: 'Rivendell (Icons)',
    theme: 'Icons',
    sealedPrice: 499.99,
    usedPrice: 380.00,
    imageUrl: 'https://images.brickset.com/sets/images/10316-1.jpg',
    confidence: 0.96,
  },
  {
    id: 'sample-3',
    setNum: '21325-1',
    name: 'Medieval Blacksmith',
    theme: 'Ideas',
    sealedPrice: 179.99,
    usedPrice: 130.00,
    imageUrl: 'https://images.brickset.com/sets/images/21325-1.jpg',
    confidence: 0.94,
  },
  {
    id: 'sample-4',
    setNum: '76178-1',
    name: 'Daily Bugle',
    theme: 'Marvel',
    sealedPrice: 349.99,
    usedPrice: 260.00,
    imageUrl: 'https://images.brickset.com/sets/images/76178-1.jpg',
    confidence: 0.95,
  },
];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [scannedTray, setScannedTray] = useState<ScannedCard[]>([SAMPLE_DETECTABLE_SETS[0]]);
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 });

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(err => {
        console.log('[Scanner] Camera simulator active:', err);
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Smooth floating hover effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverOffset({
        x: Math.sin(Date.now() / 1200) * 4,
        y: Math.cos(Date.now() / 1500) * 5,
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeCard = SAMPLE_DETECTABLE_SETS[hoveredIndex];

  // Switch or hover over another sample card
  const cycleCard = (idx: number) => {
    setHoveredIndex(idx);
    setIsLocked(false);

    setTimeout(() => {
      const card = SAMPLE_DETECTABLE_SETS[idx];
      setIsLocked(true);

      setScannedTray(prev => {
        if (prev.some(c => c.setNum === card.setNum)) return prev;
        return [...prev, card];
      });
    }, 300);
  };

  const removeFromTray = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScannedTray(prev => prev.filter(c => c.id !== id));
  };

  const totalValue = scannedTray.reduce((acc, c) => acc + c.sealedPrice, 0);

  const handleSaveToCollection = () => {
    if (scannedTray.length === 0) return;

    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const current: CollectionItem[] = stored ? JSON.parse(stored) : [];

      scannedTray.forEach(card => {
        current.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: 'user-1',
          setNum: card.setNum,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: card.sealedPrice,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: `Scanned with HelloBrick AR`,
          addedAt: new Date().toISOString(),
          itemType: 'set'
        });
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#FF7A30', '#3B82F6', '#FFCE4A']
      });

      setTimeout(() => {
        onNavigate(Screen.HOME);
      }, 500);
    } catch (e) {
      onNavigate(Screen.HOME);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black font-sans text-white relative overflow-hidden select-none">
      
      {/* ─── 1. Live Camera Viewport ─── */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* ─── 2. Top Header Bar ─── */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),2.5rem)] px-5 flex items-center justify-between z-50">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          aria-label="Close Scanner"
          className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {scannedTray.length > 0 ? (
          <div className="bg-emerald-500/90 backdrop-blur-md rounded-full px-4 py-1.5 shadow-[0_4px_15px_rgba(16,185,129,0.35)] border border-emerald-400/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-black text-sm text-white">${totalValue.toFixed(2)}</span>
            <span className="text-emerald-100 text-xs font-semibold">· {scannedTray.length} {scannedTray.length === 1 ? 'set' : 'sets'}</span>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1 border border-white/15 text-xs font-bold text-gray-200">
            AR Live Hover
          </div>
        )}

        <button 
          onClick={() => setTorchOn(!torchOn)}
          className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center active:scale-90 transition-all shadow-lg ${
            torchOn ? 'bg-amber-400 border-amber-300 text-black shadow-amber-400/30' : 'bg-black/50 border-white/15 text-white'
          }`}
        >
          <Zap className="w-5 h-5" fill={torchOn ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ─── 3. AR Live Hover HUD Layer ─── */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        
        <div 
          className="relative w-[82vw] max-w-[340px] aspect-[4/5] transition-all duration-300 ease-out"
          style={{
            transform: `translate(${hoverOffset.x}px, ${hoverOffset.y}px)`
          }}
        >
          {/* Animated Glowing Corner Brackets */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-all duration-300 ${
              isLocked ? 'border-emerald-400 shadow-[0_0_12px_#10B981]' : 'border-white/60'
            }`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-all duration-300 ${
              isLocked ? 'border-emerald-400 shadow-[0_0_12px_#10B981]' : 'border-white/60'
            }`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-all duration-300 ${
              isLocked ? 'border-emerald-400 shadow-[0_0_12px_#10B981]' : 'border-white/60'
            }`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-all duration-300 ${
              isLocked ? 'border-emerald-400 shadow-[0_0_12px_#10B981]' : 'border-white/60'
            }`} />
          </div>

          {/* Active Card HUD (Floats Directly Inside / Over The Card) */}
          {isLocked && activeCard && (
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-auto">
              
              <div className="flex justify-between items-center">
                <div className="bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-white flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>IDENTIFIED</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200 border border-white/10">
                  {Math.round(activeCard.confidence * 100)}% Match
                </div>
              </div>

              {/* Center Floating Price Tag (The Signature Brickify Hover Effect) */}
              <div className="flex flex-col items-center justify-center my-auto drop-shadow-2xl">
                
                <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-emerald-400 mb-3 flex items-center justify-center overflow-hidden">
                  <img 
                    src={activeCard.imageUrl} 
                    alt={activeCard.name}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                    }}
                  />
                </div>

                <div className="text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  ${activeCard.sealedPrice.toFixed(2)}
                </div>
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-0.5 drop-shadow">
                  CURRENT MARKET VALUE
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <div className="bg-black/75 backdrop-blur-md border border-emerald-500/40 rounded-full px-3 py-1 text-xs font-bold text-emerald-300 shadow-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Sealed: ${activeCard.sealedPrice.toFixed(2)}</span>
                  </div>
                  <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 text-xs font-bold text-gray-300 shadow-lg">
                    <span>Used: ${activeCard.usedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Title */}
              <div className="bg-black/70 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
                <p className="text-white font-black text-sm truncate">{activeCard.name}</p>
                <p className="text-gray-400 text-[11px] font-semibold">#{activeCard.setNum.split('-')[0]} · {activeCard.theme}</p>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
              <p className="text-white font-bold text-xs bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                Locking on card...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. Quick Sample Switcher (Hover Simulation) ─── */}
      <div className="absolute top-[13%] left-0 right-0 z-30 px-5 flex items-center justify-center pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-full p-1 flex items-center gap-1 shadow-2xl overflow-x-auto max-w-[92vw]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-2.5 pr-1 shrink-0">Hover Card:</span>
          {SAMPLE_DETECTABLE_SETS.map((sample, idx) => (
            <button
              key={sample.setNum}
              onClick={() => cycleCard(idx)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                hoveredIndex === idx && isLocked
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              #{sample.setNum.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. Bottom Scanned Items Tray & CTA ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),2rem)] bg-gradient-to-t from-black via-black/90 to-transparent pt-6">
        
        {scannedTray.length > 0 && (
          <div className="px-5 mb-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Scanned Items ({scannedTray.length})
              </span>
              <span className="text-xs font-bold text-emerald-400">${totalValue.toFixed(2)} total</span>
            </div>

            <div className="flex overflow-x-auto pb-1 gap-2.5 snap-x no-scrollbar">
              {scannedTray.map((card) => (
                <div 
                  key={card.id} 
                  className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 flex items-center gap-3 min-w-[240px] snap-center shrink-0 shadow-lg"
                >
                  <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs truncate leading-tight">{card.name}</h4>
                    <p className="text-[10px] text-gray-400">#{card.setNum.split('-')[0]}</p>
                    <p className="text-emerald-400 font-extrabold text-xs mt-0.5">${card.sealedPrice.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={(e) => removeFromTray(card.id, e)}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white shrink-0 active:scale-90 transition-transform cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5">
          <button 
            onClick={handleSaveToCollection}
            disabled={scannedTray.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              scannedTray.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98]' 
                : 'bg-zinc-800 text-zinc-500 opacity-60 pointer-events-none'
            }`}
          >
            {scannedTray.length > 0 ? (
              <>
                <Plus className="w-5 h-5" />
                <span>Add {scannedTray.length} {scannedTray.length === 1 ? 'Set' : 'Sets'} to Collection (${totalValue.toFixed(2)})</span>
              </>
            ) : (
              <span>Point Camera at LEGO Box or Card</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
