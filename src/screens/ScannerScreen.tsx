import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Plus, Layers, Box, Smile, Sparkles, Trophy, Flame, ChevronRight, Check, Shield, Award } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { collectiblesDatabase, AnyCollectible, CollectibleCategory } from '../lib/collectiblesDatabase';
import confetti from 'canvas-confetti';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  mode?: string;
}

const SCAN_CATEGORIES: { id: CollectibleCategory | 'all_tcg'; label: string; icon: any }[] = [
  { id: 'set', label: 'LEGO Sets', icon: Box },
  { id: 'minifigure', label: 'Minifigs', icon: Smile },
  { id: 'pokemon', label: 'Pokémon', icon: Zap },
  { id: 'mtg', label: 'Magic MTG', icon: Flame },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: Award },
  { id: 'one_piece', label: 'One Piece', icon: Shield },
  { id: 'lorcana', label: 'Lorcana', icon: Sparkles },
  { id: 'sports', label: 'Sports Cards', icon: Trophy },
  { id: 'moc', label: 'MOC Builds', icon: Sparkles },
];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CollectibleCategory | 'all_tcg'>('set');
  const [activeItems, setActiveItems] = useState<AnyCollectible[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [scannedTray, setScannedTray] = useState<AnyCollectible[]>([]);
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 });
  const [cameraActive, setCameraActive] = useState(false);

  // Native & WebRTC Live Camera Setup with robust multi-tier fallback
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('[Scanner] MediaDevices not supported in current environment');
        return;
      }

      try {
        // Tier 1: 1080p environment camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err1) {
        try {
          // Tier 2: standard environment camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (err2) {
          try {
            // Tier 3: any available camera
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          } catch (err3) {
            console.log('[Scanner] Camera fallback initialized for testing simulator:', err3);
          }
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.play().then(() => {
          setCameraActive(true);
        }).catch(() => {});
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update detectable items based on category
  useEffect(() => {
    let items: AnyCollectible[] = [];
    if (selectedCategory === 'set') {
      items = collectiblesDatabase.getSets();
    } else if (selectedCategory === 'minifigure') {
      items = collectiblesDatabase.getMinifigs();
    } else if (selectedCategory === 'pokemon') {
      items = collectiblesDatabase.getPokemon();
    } else if (selectedCategory === 'mtg') {
      items = collectiblesDatabase.getMtg();
    } else if (selectedCategory === 'yugioh') {
      items = collectiblesDatabase.getYugioh();
    } else if (selectedCategory === 'one_piece') {
      items = collectiblesDatabase.getOnePiece();
    } else if (selectedCategory === 'lorcana') {
      items = collectiblesDatabase.getLorcana();
    } else if (selectedCategory === 'sports') {
      items = collectiblesDatabase.getSports();
    } else if (selectedCategory === 'all_tcg') {
      items = collectiblesDatabase.getAllTcg();
    } else {
      items = collectiblesDatabase.getMocs();
    }

    setActiveItems(items);
    setHoveredIndex(0);
    setIsLocked(true);

    if (items.length > 0 && scannedTray.length === 0) {
      setScannedTray([items[0]]);
    }
  }, [selectedCategory]);

  // Smooth floating hover effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverOffset({
        x: Math.sin(Date.now() / 1200) * 3,
        y: Math.cos(Date.now() / 1500) * 4,
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeItem = activeItems[hoveredIndex] || activeItems[0];

  const cycleCard = (idx: number) => {
    setHoveredIndex(idx);
    setIsLocked(false);

    setTimeout(() => {
      const item = activeItems[idx];
      setIsLocked(true);

      setScannedTray(prev => {
        if (prev.some(c => c.code === item.code)) return prev;
        return [...prev, item];
      });
    }, 280);
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

      scannedTray.forEach(item => {
        current.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: 'user-1',
          setNum: item.code,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: item.sealedPrice,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: `Scanned with HelloBrick Universal AR (${item.category.toUpperCase()})`,
          addedAt: new Date().toISOString(),
          itemType: item.category === 'minifigure' ? 'minifig' : (item.category === 'set' ? 'set' : 'brick')
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

  const isCard = activeItem && (
    activeItem.category === 'pokemon' || 
    activeItem.category === 'mtg' || 
    activeItem.category === 'yugioh' || 
    activeItem.category === 'one_piece' || 
    activeItem.category === 'lorcana' || 
    activeItem.category === 'sports'
  );

  return (
    <div className="flex flex-col h-full bg-black font-sans text-white relative overflow-hidden select-none">
      
      {/* ─── 1. Live Camera Viewport (iOS Native Ready) ─── */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* ─── 2. Top Header Bar ─── */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),2.5rem)] px-5 flex items-center justify-between z-50">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          aria-label="Close Scanner"
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {scannedTray.length > 0 ? (
          <div className="bg-emerald-500/95 backdrop-blur-md rounded-full px-4 py-1.5 shadow-[0_4px_15px_rgba(16,185,129,0.35)] border border-emerald-400/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-black text-sm text-white">${totalValue.toLocaleString()}</span>
            <span className="text-emerald-100 text-xs font-semibold">· {scannedTray.length} {scannedTray.length === 1 ? 'item' : 'items'}</span>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1 border border-white/15 text-xs font-bold text-gray-200">
            Universal AR Collectibles Scanner
          </div>
        )}

        <button 
          onClick={() => setTorchOn(!torchOn)}
          className={`w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center active:scale-90 transition-all shadow-lg ${
            torchOn ? 'bg-amber-400 border-amber-300 text-black shadow-amber-400/30' : 'bg-black/50 border-white/15 text-white'
          }`}
        >
          <Zap className="w-5 h-5" fill={torchOn ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ─── 3. Universal Category Switcher ─── */}
      <div className="absolute top-[12%] left-0 right-0 z-30 px-3 flex items-center justify-center pointer-events-auto">
        <div className="bg-black/65 backdrop-blur-2xl border border-white/15 rounded-full p-1 flex items-center gap-1 shadow-2xl max-w-[95vw] overflow-x-auto no-scrollbar">
          {SCAN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1 shrink-0 ${
                  isSelected ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. Quick Sample Card Selector ─── */}
      <div className="absolute top-[18.5%] left-0 right-0 z-30 px-5 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[92vw] no-scrollbar py-1">
          {activeItems.map((item, idx) => (
            <button
              key={item.code}
              onClick={() => cycleCard(idx)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                hoveredIndex === idx && isLocked
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-black/50 border-white/15 text-gray-300 hover:bg-black/70'
              }`}
            >
              {item.name.split(' ')[0]} #{item.code.replace('-1', '')}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. AR Live Hover HUD Layer ─── */}
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

          {/* Active Floating Item Card */}
          {isLocked && activeItem && (
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-auto">
              
              {/* Header Status */}
              <div className="flex justify-between items-center">
                <div className="bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-white flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>IDENTIFIED {activeItem.category.toUpperCase().replace('_', ' ')}</span>
                </div>
                <div className="bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  +{activeItem.growth1Y}% 1Y
                </div>
              </div>

              {/* Center Floating Price Tag */}
              <div className="flex flex-col items-center justify-center my-auto drop-shadow-2xl">
                
                <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-emerald-400 mb-2.5 flex items-center justify-center overflow-hidden">
                  <img 
                    src={activeItem.imageUrl} 
                    alt={activeItem.name}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                    }}
                  />
                </div>

                {/* Primary Price */}
                <div className="text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  ${(activeItem.psa10Value ? activeItem.psa10Value : activeItem.sealedPrice).toLocaleString()}
                </div>
                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-0.5 drop-shadow">
                  {isCard ? 'PSA 10 GEM MINT VALUE' : 'CURRENT MARKET VALUE'}
                </p>

                {/* Condition Breakdown */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {isCard ? (
                    <>
                      <div className="bg-black/75 backdrop-blur-md border border-emerald-500/40 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shadow-lg">
                        PSA 9: ${(activeItem.psa9Value || activeItem.sealedPrice * 1.5).toLocaleString()}
                      </div>
                      <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-gray-300 shadow-lg">
                        Raw: ${activeItem.sealedPrice.toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-black/75 backdrop-blur-md border border-emerald-500/40 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shadow-lg flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Sealed: ${activeItem.sealedPrice.toFixed(2)}</span>
                      </div>
                      <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-gray-300 shadow-lg">
                        <span>Used: ${activeItem.usedPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Card Title & Rating */}
              <div 
                onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: activeItem.code })}
                className="bg-black/75 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
              >
                <div className="min-w-0 flex-1 mr-2 text-left">
                  <p className="text-white font-black text-sm truncate">{activeItem.name}</p>
                  <p className="text-gray-400 text-[11px] font-semibold">#{activeItem.code} · {activeItem.theme}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                  {activeItem.rating}
                </span>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
              <p className="text-white font-bold text-xs bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                Tracking collectible...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── 6. Bottom Scanned Items Tray & CTA ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),2rem)] bg-gradient-to-t from-black via-black/90 to-transparent pt-6">
        
        {scannedTray.length > 0 && (
          <div className="px-5 mb-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Scanned Vault Items ({scannedTray.length})
              </span>
              <span className="text-xs font-bold text-emerald-400">${totalValue.toLocaleString()} total</span>
            </div>

            <div className="flex overflow-x-auto pb-1 gap-2.5 snap-x no-scrollbar">
              {scannedTray.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 flex items-center gap-3 min-w-[240px] snap-center shrink-0 shadow-lg"
                >
                  <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs truncate leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-gray-400">#{item.code.replace('-1', '')} · {item.category}</p>
                    <p className="text-emerald-400 font-extrabold text-xs mt-0.5">${item.sealedPrice.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={(e) => removeFromTray(item.id, e)}
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
                <span>Add {scannedTray.length} {scannedTray.length === 1 ? 'Item' : 'Items'} to Collection (${totalValue.toLocaleString()})</span>
              </>
            ) : (
              <span>Point Camera at Any TCG Card or Collectible</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
