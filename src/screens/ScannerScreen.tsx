import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, Plus, Layers, Box, Smile, Sparkles, Trophy, Flame, Check, Shield, Award, ScanLine } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { collectiblesDatabase, AnyCollectible } from '../lib/collectiblesDatabase';
import { detectBricks, DetectionStabilizer } from '../services/brickDetectionService';
import { extractTextWithCloudVision } from '../services/cloudVisionService';
import { liveCollectibleService } from '../services/liveCollectibleService';
import { FrameDetection } from '../types/detection';
import confetti from 'canvas-confetti';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  mode?: string;
}

type ScanCategory = 'all' | 'pokemon' | 'mtg' | 'yugioh' | 'one_piece' | 'lorcana' | 'sports' | 'set' | 'minifigure' | 'moc';

const SCAN_CATEGORIES: { id: ScanCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'Auto Detect', icon: ScanLine },
  { id: 'pokemon', label: 'Pokémon TCG', icon: Zap },
  { id: 'set', label: 'LEGO Sets', icon: Box },
  { id: 'minifigure', label: 'Minifigs', icon: Smile },
  { id: 'mtg', label: 'Magic MTG', icon: Flame },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: Award },
  { id: 'sports', label: 'Sports Cards', icon: Trophy },
  { id: 'one_piece', label: 'One Piece', icon: Shield },
  { id: 'lorcana', label: 'Lorcana', icon: Sparkles },
];

// Detected item with bounding box and matched collectible info
interface DetectedItem {
  id: string;
  bbox: { xMin: number; yMin: number; xMax: number; yMax: number };
  label: string;
  confidence: number;
  matchedCollectible: AnyCollectible | null;
  price: number;
  frameW: number;
  frameH: number;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stabilizerRef = useRef(new DetectionStabilizer());
  const scanLoopRef = useRef<number>(0);
  const frameIndexRef = useRef(0);
  const sessionIdRef = useRef(`session_${Math.random().toString(36).substring(2, 9)}`);
  const isOcrRunningRef = useRef(false);
  const isScanningRef = useRef(false);

  const [torchOn, setTorchOn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ScanCategory>('all');
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'error'>('idle');
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [scannedTray, setScannedTray] = useState<AnyCollectible[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Scanning pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // ── Camera Setup ──
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } catch { return; }
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.play()
          .then(() => {
            setCameraActive(true);
            // Start scanning automatically after camera is ready
            setTimeout(() => startScanLoop(), 500);
          })
          .catch(() => {});
      }
    };

    startCamera();

    return () => {
      isScanningRef.current = false;
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Match detection label to collectibles database ──
  const matchDetectionToCollectible = useCallback((label: string): AnyCollectible | null => {
    if (!label) return null;
    const normalised = label.toLowerCase().trim();
    
    // Try exact code match first
    const allItems = collectiblesDatabase.search('', selectedCategory === 'all' ? undefined : selectedCategory as any);
    
    // Try matching by name similarity
    let bestMatch: AnyCollectible | null = null;
    let bestScore = 0;
    
    for (const item of allItems) {
      const itemName = item.name.toLowerCase();
      const itemCode = item.code.toLowerCase();
      
      // Exact code match
      if (normalised === itemCode || normalised.includes(itemCode)) {
        return item;
      }
      
      // Name contains match
      if (itemName.includes(normalised) || normalised.includes(itemName)) {
        const score = Math.min(normalised.length, itemName.length) / Math.max(normalised.length, itemName.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }
      
      // Word overlap match
      const labelWords = normalised.split(/[\s\-_]+/).filter(w => w.length > 2);
      const nameWords = itemName.split(/[\s\-_]+/).filter(w => w.length > 2);
      const overlap = labelWords.filter(w => nameWords.some(nw => nw.includes(w) || w.includes(nw))).length;
      if (overlap > 0) {
        const score = overlap / Math.max(labelWords.length, nameWords.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }
    }
    
    return bestScore > 0.3 ? bestMatch : null;
  }, [selectedCategory]);

  // ── Real Detection Loop ──
  const startScanLoop = useCallback(() => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    setIsScanning(true);
    setScanStatus('scanning');

    const captureAndDetect = async () => {
      if (!isScanningRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        if (isScanningRef.current) {
          scanLoopRef.current = requestAnimationFrame(() => setTimeout(captureAndDetect, 300));
        }
        return;
      }

      try {
        frameIndexRef.current++;
        
        let stabilised: any[] = [];
        try {
          const response = await detectBricks(videoRef.current, {
            sessionId: sessionIdRef.current,
            frameIndex: frameIndexRef.current,
            mode: 'live_scanner',
            timeoutMs: 4000,
          });
          if (!isScanningRef.current) return;
          stabilised = stabilizerRef.current.stabilize(response.detections);
        } catch (yoloErr) {
          console.warn('[Scanner] YOLO detection skipped or failed:', yoloErr);
        }

        if (stabilised.length > 0) {
          setScanStatus('detected');

          const items: DetectedItem[] = stabilised.map((det: FrameDetection) => {
            const label = det.prediction?.brickName || det.compactLabel || 'Unknown';
            const matched = matchDetectionToCollectible(label);
            
            return {
              id: det.detectionId,
              bbox: {
                xMin: det.geometry.bbox.xMin,
                yMin: det.geometry.bbox.yMin,
                xMax: det.geometry.bbox.xMax,
                yMax: det.geometry.bbox.yMax,
              },
              label,
              confidence: det.prediction?.identityConfidence || det.prediction?.detectorConfidence || 0,
              matchedCollectible: matched,
              price: matched ? ((matched.psa10Value || matched.sealedPrice) || 0) : 0,
              frameW: response.frameWidth,
              frameH: response.frameHeight,
            };
          });

          setDetectedItems(items);
        } else {
          // If YOLO detects nothing, try OCR fallback for TCG cards
          const isTcg = ['pokemon', 'mtg', 'yugioh', 'sports', 'one_piece', 'lorcana', 'all'].includes(selectedCategory);
          
          if (isTcg && !isOcrRunningRef.current && videoRef.current) {
            isOcrRunningRef.current = true;
            (async () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current!.videoWidth || 640;
                canvas.height = videoRef.current!.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                if (ctx && canvas.width > 0) {
                  ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
                  
                  // Tell user we are analyzing text so they know it's not frozen
                  setScanStatus('scanning');
                  
                  // Call Cloud Vision
                  const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
                  if (!apiKey) {
                    console.error('[Scanner] Missing VITE_GOOGLE_VISION_API_KEY in .env.local');
                    setScanStatus('scanning');
                    isOcrRunningRef.current = false;
                    return;
                  }

                  const visionResult = await extractTextWithCloudVision(canvas, apiKey);
                  if (!visionResult) {
                    isOcrRunningRef.current = false;
                    return;
                  }

                  const { fullText, entities, bestMatch } = visionResult;
                  
                  // Query Live Collectible Service for 100% accurate card name, real live market price & matching image
                  const queryText = (fullText && fullText.length > 2) ? fullText : bestMatch;
                  const identified = await liveCollectibleService.identifyCollectible(
                    queryText,
                    selectedCategory,
                    entities
                  );

                  let matchedItem: AnyCollectible | null = null;

                  if (identified) {
                    matchedItem = {
                      id: identified.id,
                      code: identified.code,
                      name: identified.name,
                      theme: identified.theme,
                      year: identified.year,
                      retailPrice: identified.marketPrice,
                      sealedPrice: identified.sealedPrice,
                      usedPrice: identified.usedPrice,
                      psa10Value: identified.psa10Value,
                      imageUrl: identified.imageUrl,
                      category: identified.category as any,
                      isRetired: false,
                      type: identified.category
                    } as any;
                  } else {
                    // Fallback to local DB check
                    const allCards = collectiblesDatabase.getAll();
                    const combinedSearchString = `${fullText} ${entities.join(' ')}`.toLowerCase();
                    for (const item of allCards) {
                      const searchName = item.name.toLowerCase().split(' - ')[0];
                      if (searchName.length > 3 && combinedSearchString.includes(searchName)) {
                        matchedItem = item as AnyCollectible;
                        break;
                      }
                    }
                  }
                  
                  if (matchedItem) {
                     const newItem: DetectedItem = {
                       id: 'ocr-' + (matchedItem.code || matchedItem.id),
                       bbox: { 
                         xMin: canvas.width * 0.12, 
                         yMin: canvas.height * 0.18, 
                         xMax: canvas.width * 0.88, 
                         yMax: canvas.height * 0.82 
                       },
                       label: matchedItem.name,
                       confidence: 0.98,
                       matchedCollectible: matchedItem,
                       price: matchedItem.sealedPrice || (matchedItem as any).retailPrice || 0,
                       frameW: canvas.width,
                       frameH: canvas.height
                     };

                     setDetectedItems([newItem]);
                     setScanStatus('detected');

                     // Auto-add to tray immediately as soon as item is in view
                     setScannedTray(prev => {
                       const matchId = matchedItem!.code || matchedItem!.id;
                       if (prev.some(c => (c.code || c.id) === matchId)) return prev;
                       return [...prev, matchedItem!];
                     });
                  } else {
                     setScanStatus('scanning');
                     setDetectedItems(prev => prev.filter(p => !p.id.startsWith('ocr-')));
                  }
                }
              } catch (e) {
                console.error('OCR fallback failed:', e);
                setScanStatus('scanning');
              } finally {
                setTimeout(() => { isOcrRunningRef.current = false; }, 2000); // 2s cooldown
              }
            })();
          } else if (!isOcrRunningRef.current) {
            setScanStatus('scanning');
            setDetectedItems(prev => prev.filter(p => !p.id.startsWith('ocr-')));
          }
        }
      } catch (err) {
        console.log('[Scanner] Detection cycle error:', err);
        // Don't stop scanning on error — just retry
        if (!isScanningRef.current) return;
      }

      // Next frame — throttle to ~2-3 fps for detection
      if (isScanningRef.current) {
        setTimeout(captureAndDetect, 400);
      }
    };

    captureAndDetect();
  }, [matchDetectionToCollectible]);

  // ── Restart scan loop when category changes ──
  useEffect(() => {
    stabilizerRef.current.clear();
    setDetectedItems([]);
    setScannedTray([]);
    setScanStatus('scanning');
  }, [selectedCategory]);

  // ── Torch Toggle ──
  const toggleTorch = async () => {
    const nextState = !torchOn;
    setTorchOn(nextState);
    if (videoRef.current?.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
        }
      } catch (e) {
        console.log('[Scanner] Torch toggle:', e);
      }
    }
  };

  // ── Add detected item to tray ──
  const addToTray = (item: DetectedItem) => {
    if (!item.matchedCollectible) return;
    setScannedTray(prev => {
      const matchId = item.matchedCollectible!.code || item.matchedCollectible!.id;
      if (prev.some(c => (c.code || c.id) === matchId)) return prev;
      return [...prev, item.matchedCollectible!];
    });
  };

  // ── Save tray to collection ──
  const handleSaveToCollection = () => {
    const itemsToSave = scannedTray.length > 0 ? scannedTray : detectedItems.map(d => d.matchedCollectible).filter(Boolean) as AnyCollectible[];
    if (itemsToSave.length === 0) return;

    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const current: CollectionItem[] = stored ? JSON.parse(stored) : [];

      itemsToSave.forEach(item => {
        if (!item) return;
        const price = item.sealedPrice || (item as any).marketPrice || item.retailPrice || 0;
        const img = item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop';

        current.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: 'user-1',
          setNum: item.code || item.id,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: price,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: `Scanned with AR (${item.theme || item.type?.toUpperCase() || 'COLLECTIBLE'})`,
          imageUrl: img,
          name: item.name,
          theme: item.theme || 'TCG',
          currentPrice: price,
          year: item.year || 2024,
          addedAt: new Date().toISOString(),
          itemType: item.type === 'minifigure' ? 'minifig' : (item.type === 'pokemon' || item.type === 'mtg' || item.type === 'yugioh' ? 'card' : 'set')
        });
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      
      setShowSaveSuccess(true);
      
      // Async dynamic import for confetti to ensure it fires safely
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#10B981', '#FF7A30', '#3B82F6', '#FFCE4A'],
          zIndex: 9999
        });
      }).catch(e => console.error("Confetti load error", e));

      setTimeout(() => onNavigate(Screen.COLLECTION), 1200);
    } catch {
      alert('Save failed');
    }
  };

  const itemsToSave = scannedTray.length > 0 ? scannedTray : detectedItems.map(d => d.matchedCollectible).filter(Boolean) as AnyCollectible[];
  const isReadyToSave = itemsToSave.length > 0;
  const totalValue = itemsToSave.reduce((acc, c) => acc + (c?.psa10Value || c?.sealedPrice || (c as any)?.marketPrice || (c as any)?.retailPrice || 0), 0);

  // ── Compute bounding box positions as percentages of viewport ──
  const getBoxStyle = (item: DetectedItem) => {
    if (!videoRef.current || !item.frameW || !item.frameH) return {};

    const vidEl = videoRef.current;
    const vidW = vidEl.clientWidth;
    const vidH = vidEl.clientHeight;
    
    // Video is object-cover, so we need to calculate the visible area
    const videoAspect = item.frameW / item.frameH;
    const containerAspect = vidW / vidH;

    let scaleX: number, scaleY: number, offsetX = 0, offsetY = 0;

    if (containerAspect > videoAspect) {
      // Container is wider — video is cropped top/bottom
      scaleX = vidW / item.frameW;
      scaleY = scaleX;
      offsetY = (vidH - item.frameH * scaleY) / 2;
    } else {
      // Container is taller — video is cropped left/right
      scaleY = vidH / item.frameH;
      scaleX = scaleY;
      offsetX = (vidW - item.frameW * scaleX) / 2;
    }

    return {
      left: `${offsetX + item.bbox.xMin * scaleX}px`,
      top: `${offsetY + item.bbox.yMin * scaleY}px`,
      width: `${(item.bbox.xMax - item.bbox.xMin) * scaleX}px`,
      height: `${(item.bbox.yMax - item.bbox.yMin) * scaleY}px`,
    };
  };

  const scanPulse = Math.sin(pulsePhase * Math.PI / 180) * 0.5 + 0.5;

  return (
    <div className="flex flex-col h-full bg-black font-sans text-white relative overflow-hidden select-none">
      
      {/* ─── Live Camera Feed ─── */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        {/* Subtle gradient for top/bottom readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── Top Bar ─── */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),2.5rem)] px-5 flex items-center justify-between z-50">
        <button 
          onClick={() => {
            isScanningRef.current = false;
            onNavigate(Screen.HOME);
          }}
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Status Badge */}
        {scannedTray.length > 0 ? (
          <div className="bg-emerald-500/95 backdrop-blur-md rounded-full px-4 py-1.5 shadow-[0_4px_15px_rgba(16,185,129,0.35)] border border-emerald-400/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-black text-sm text-white">${totalValue.toLocaleString()}</span>
            <span className="text-emerald-100 text-xs font-semibold">· {scannedTray.length} item{scannedTray.length !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/15 flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: scanStatus === 'detected' ? '#10B981' : scanStatus === 'scanning' ? '#FBBF24' : '#6B7280' }}
            />
            <span className="text-xs font-bold text-gray-200">
              {scanStatus === 'detected' ? 'Item Detected' : scanStatus === 'scanning' ? 'Scanning...' : 'Point at collectible'}
            </span>
          </div>
        )}

        <button 
          onClick={toggleTorch}
          className={`w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center active:scale-90 transition-all shadow-lg ${
            torchOn ? 'bg-amber-400 border-amber-300 text-black shadow-amber-400/30' : 'bg-black/50 border-white/15 text-white'
          }`}
        >
          <Zap className="w-5 h-5" fill={torchOn ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ─── Category Switcher ─── */}
      <div className="absolute top-[11.5%] left-0 right-0 z-30 px-3 flex items-center justify-center">
        <div className="bg-black/65 backdrop-blur-2xl border border-white/15 rounded-full p-1 flex items-center gap-1 shadow-2xl max-w-[95vw] overflow-x-auto no-scrollbar">
          {SCAN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
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

      {/* ─── Scanning Viewfinder Reticle (shown when NO detections) ─── */}
      {detectedItems.length === 0 && cameraActive && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="relative w-[75vw] max-w-[320px] aspect-[3/4]">
            {/* Corner brackets with scanning pulse */}
            <div 
              className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] rounded-tl-xl transition-all"
              style={{ borderColor: `rgba(16, 185, 129, ${0.4 + scanPulse * 0.6})` }}
            />
            <div 
              className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] rounded-tr-xl transition-all"
              style={{ borderColor: `rgba(16, 185, 129, ${0.4 + scanPulse * 0.6})` }}
            />
            <div 
              className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] rounded-bl-xl transition-all"
              style={{ borderColor: `rgba(16, 185, 129, ${0.4 + scanPulse * 0.6})` }}
            />
            <div 
              className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] rounded-br-xl transition-all"
              style={{ borderColor: `rgba(16, 185, 129, ${0.4 + scanPulse * 0.6})` }}
            />

            {/* Horizontal scanning line */}
            <div 
              className="absolute left-2 right-2 h-[2px] rounded-full"
              style={{ 
                top: `${25 + scanPulse * 50}%`,
                background: `linear-gradient(90deg, transparent, rgba(16, 185, 129, ${0.3 + scanPulse * 0.4}), transparent)`,
              }}
            />

            {/* Center instruction */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-center">
                <ScanLine className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 animate-pulse" />
                <p className="text-xs font-bold text-white">Point camera at a collectible</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Card, minifig, or set box</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Live Detection Overlays (shown ONLY on real detections) ─── */}
      {detectedItems.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {detectedItems.map((item) => {
            const style = getBoxStyle(item);
            const hasMatch = !!item.matchedCollectible;

            return (
              <div
                key={item.id}
                className="absolute transition-all duration-200 ease-out pointer-events-auto"
                style={style}
                onClick={() => addToTray(item)}
              >
                {/* Bounding box */}
                <div className={`absolute inset-0 border-2 rounded-lg ${
                  hasMatch ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-amber-400/70'
                }`}>
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-white/70" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-white/70" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-white/70" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-white/70" />
                </div>

                {/* Floating price pill above box */}
                {hasMatch && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500/95 text-white font-black text-[12px] px-2.5 py-0.5 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.5)] border border-emerald-300/60 whitespace-nowrap z-10">
                    ${item.price.toLocaleString()}
                  </div>
                )}

                {/* Label below box */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    hasMatch ? 'bg-black/80 text-emerald-300' : 'bg-black/60 text-amber-300'
                  }`}>
                    {hasMatch ? item.matchedCollectible!.name.substring(0, 20) : item.label.substring(0, 20)}
                    {item.confidence > 0.5 && ` · ${Math.round(item.confidence * 100)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Bottom Tray & Action ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),2rem)] bg-gradient-to-t from-black via-black/95 to-transparent pt-4">
        
        {scannedTray.length > 0 && (
          <div className="px-5 mb-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Added Items ({scannedTray.length})
              </span>
              <span className="text-xs font-bold text-emerald-400">${totalValue.toLocaleString()} total</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {scannedTray.map((item) => (
                <div 
                  key={item.id} 
                  className="relative flex flex-col items-center bg-white/10 backdrop-blur-xl border border-emerald-400/40 rounded-2xl p-1.5 min-w-[70px] shrink-0 shadow-lg"
                >
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="w-14 h-14 bg-white/90 rounded-xl p-1 flex items-center justify-center overflow-hidden mb-1">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white text-center leading-tight line-clamp-2 w-full max-w-[80px] mb-0.5">{item.name}</span>
                  <span className="text-[11px] font-black text-emerald-400">
                    ${((item.psa10Value || item.sealedPrice) || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5">
          <button 
            onClick={handleSaveToCollection}
            disabled={!isReadyToSave}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isReadyToSave 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98]' 
                : 'bg-zinc-800 text-zinc-500 opacity-60 pointer-events-none'
            }`}
          >
            {isReadyToSave ? (
              <>
                <Plus className="w-5 h-5" />
                <span>Add {itemsToSave.length} {itemsToSave.length === 1 ? 'Item' : 'Items'} to Collection (${totalValue.toLocaleString()})</span>
              </>
            ) : (
              <span>Point Camera at Collectibles</span>
            )}
          </button>
        </div>
      </div>

      {showSaveSuccess && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white">Added to Vault!</h2>
          <p className="text-emerald-400 font-medium mt-2">Redirecting to your collection...</p>
        </div>
      )}

    </div>
  );
};
