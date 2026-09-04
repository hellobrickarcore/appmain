import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, Plus, Layers, Box, Smile, Sparkles, Trophy, Flame, Check, Shield, Award, ScanLine } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { collectiblesDatabase, AnyCollectible } from '../lib/collectiblesDatabase';
import { detectBricks, DetectionStabilizer } from '../services/brickDetectionService';
import { extractTextWithCloudVision } from '../services/cloudVisionService';
import { liveCollectibleService, getSafeImageUrl } from '../services/liveCollectibleService';
import { subscriptionService } from '../services/subscriptionService';
import { FrameDetection, ScanFrameResponse } from '../types/detection';
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

interface DetectedItem {
  id: string;
  bbox: { xMin: number; yMin: number; xMax: number; yMax: number };
  label: string;
  confidence: number;
  matchedCollectible: AnyCollectible | null;
  price: number;
  frameW: number;
  frameH: number;
  detectedAt?: number;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stabilizerRef = useRef(new DetectionStabilizer());
  const scanLoopRef = useRef<number>(0);
  const frameIndexRef = useRef(0);
  const sessionIdRef = useRef(`session_${Math.random().toString(36).substring(2, 9)}`);
  const isOcrRunningRef = useRef(false);
  const isScanningRef = useRef(false);
  // Track quality of the currently displayed result (0=none, 1=name-only, 2=number-matched)
  const lockedQualityRef = useRef(0);

  const [torchOn, setTorchOn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ScanCategory>('all');
  const selectedCategoryRef = useRef<ScanCategory>(selectedCategory);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'error'>('idle');
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [scannedTray, setScannedTray] = useState<AnyCollectible[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [scanElapsed, setScanElapsed] = useState(0);
  const scanStartRef = useRef(Date.now());

  // Paywall Hardwall check on camera open
  useEffect(() => {
    const hw = subscriptionService.isHardwalled();
    if (hw.hardwalled) {
      onNavigate(Screen.SUBSCRIPTION);
    }
  }, [onNavigate]);

  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  // Scanning pulse animation + elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 360);
      if (scanStatus === 'scanning') {
        setScanElapsed(Math.floor((Date.now() - scanStartRef.current) / 1000));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [scanStatus]);

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
            isScanningRef.current = true;
            setScanStatus('scanning');
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
    const currentCat = selectedCategoryRef.current;
    
    const allItems = collectiblesDatabase.search('', currentCat === 'all' ? undefined : currentCat as any);
    let bestMatch: AnyCollectible | null = null;
    let bestScore = 0;
    
    for (const item of allItems) {
      const itemName = item.name.toLowerCase();
      const itemCode = item.code.toLowerCase();
      
      if (normalised === itemCode || normalised.includes(itemCode)) {
        return item;
      }
      
      if (itemName.includes(normalised) || normalised.includes(itemName)) {
        const score = Math.min(normalised.length, itemName.length) / Math.max(normalised.length, itemName.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }
      
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
  }, []);

  // ── Unified Real-Time Scanning Loop ──
  useEffect(() => {
    if (!cameraActive) return;
    isScanningRef.current = true;

    const captureAndDetect = async () => {
      if (!isScanningRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        if (isScanningRef.current) {
          setTimeout(captureAndDetect, 300);
        }
        return;
      }

      const activeCat = selectedCategoryRef.current;
      const isLegoOnly = activeCat === 'set' || activeCat === 'minifigure';

      // ── Branch A: LEGO Bricks / Sets Mode via DigitalOcean YOLO ──
      if (isLegoOnly) {
        let response: ScanFrameResponse | null = null;
        let stabilised: any[] = [];
        try {
          response = await detectBricks(videoRef.current, {
            sessionId: sessionIdRef.current,
            frameIndex: frameIndexRef.current++,
            mode: 'live_scanner',
            timeoutMs: 1500,
          });
          if (!isScanningRef.current || !response) return;
          stabilised = stabilizerRef.current.stabilize(response.detections);
        } catch (yoloErr) {
          // YOLO model fallback
        }

        if (stabilised.length > 0 && response) {
          setScanStatus('detected');
          const fw = response.frameWidth || videoRef.current.videoWidth || 640;
          const fh = response.frameHeight || videoRef.current.videoHeight || 480;

          const items: DetectedItem[] = stabilised.map((det: FrameDetection) => {
            const label = det.prediction?.brickName || det.compactLabel || 'LEGO Collectible';
            const matched = matchDetectionToCollectible(label);
            
            const fallbackCollectible: AnyCollectible = matched || ({
              id: `lego_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              code: label.toLowerCase().replace(/\s+/g, '-'),
              name: label,
              theme: 'LEGO',
              category: 'set',
              year: new Date().getFullYear(),
              retailPrice: 24.99,
              sealedPrice: 24.99,
              usedPrice: 18.00,
              growth1Y: 5.0,
              growth30D: 1.2,
              rarityScore: 6,
              demandScore: 7,
              rating: 'Buy',
              imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop',
              isRetired: false,
              description: `Scanned LEGO asset (${label})`,
              primaryMarketplace: 'HelloBrick Catalog'
            } as any);

            return {
              id: det.detectionId,
              bbox: {
                xMin: det.geometry.bbox.xMin,
                yMin: det.geometry.bbox.yMin,
                xMax: det.geometry.bbox.xMax,
                yMax: det.geometry.bbox.yMax,
              },
              label,
              confidence: det.prediction?.identityConfidence || det.prediction?.detectorConfidence || 0.9,
              matchedCollectible: fallbackCollectible,
              price: fallbackCollectible.sealedPrice || 24.99,
              frameW: fw,
              frameH: fh,
              detectedAt: Date.now()
            };
          });

          setDetectedItems(items);

          // Auto-add first detected item to tray (REPLACE, do not accumulate to prevent ghosts)
          if (items.length > 0 && items[0].matchedCollectible) {
            const first = items[0].matchedCollectible;
            setScannedTray([first]);
          }
        }
      } 
      
      // ── Branch B: TCG Cards / Universal Auto-Detect Mode via OCR & Live APIs ──
      else if (!isOcrRunningRef.current) {
        if (!videoRef.current || !videoRef.current.videoWidth || videoRef.current.videoWidth === 0) {
          if (isScanningRef.current) setTimeout(captureAndDetect, 500);
          return;
        }

        isOcrRunningRef.current = true;
        (async () => {
          try {
            const video = videoRef.current;
            if (!video || !isScanningRef.current) return;

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx && canvas.width > 0 && canvas.height > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
              if (!apiKey) return;

              const visionResult = await extractTextWithCloudVision(canvas, apiKey);
              if (!isScanningRef.current || !visionResult) return;

              const { fullText, entities, bestMatch, isJapanese } = visionResult;

              const queryText = (fullText && fullText.trim().length > 1)
                ? fullText
                : (bestMatch || (entities && entities[0]) || '');

              const categoryHint = isJapanese
                ? 'pokemon'
                : selectedCategoryRef.current;

              if (queryText && queryText.trim().length > 1) {
                const identified = await liveCollectibleService.identifyCollectible(
                  queryText,
                  categoryHint,
                  entities,
                  fullText
                );

                if (isScanningRef.current && identified) {
                  // ── Quality gating: avoid replacing a good card-number match with a name-only guess ──
                  // Quality 2 = matched by collector number (most reliable)
                  // Quality 1 = name-only match (fuzzy, may be wrong card)
                  // Quality 0 = no result yet
                  const hasCardNumber = /[A-Z0-9]+-\d+/i.test(identified.code) &&
                    identified.source !== 'other_tcg' &&
                    identified.marketPrice > 0;
                  const newQuality = hasCardNumber ? 2 : 1;

                  // Don't replace a high-quality result with a lower quality one
                  if (newQuality < lockedQualityRef.current) return;

                  const matchedItem: AnyCollectible = {
                    id: identified.id,
                    code: identified.code,
                    name: identified.name,
                    theme: identified.theme,
                    year: identified.year,
                    retailPrice: identified.marketPrice,
                    sealedPrice: identified.sealedPrice,
                    usedPrice: identified.usedPrice,
                    psa10Value: identified.psa10Value,
                    growth1Y: 8.5,
                    growth30D: 2.4,
                    rarityScore: 8,
                    demandScore: 8,
                    rating: 'Strong Buy',
                    imageUrl: identified.imageUrl,
                    category: identified.category as any,
                    isRetired: false,
                    type: identified.category,
                    description: `Identified via Live Market Feed (${identified.source}${isJapanese ? ' · Japanese' : ''})`,
                    primaryMarketplace: 'TCGPlayer / Cardmarket / Live Index',
                    cardNumber: identified.code,
                    setSeries: identified.theme
                  } as any;

                  const itemPrice = (matchedItem as any).retailPrice || (matchedItem as any).sealedPrice || (matchedItem as any).marketPrice || 0;
                  let itemRating = 'Speculative';
                  if (itemPrice >= 500) itemRating = 'Grail';
                  else if (itemPrice >= 150) itemRating = 'Blue Chip';
                  else if (itemPrice >= 40) itemRating = 'Strong Buy';
                  else if (itemPrice >= 15) itemRating = 'Hold';
                  (matchedItem as any).rating = itemRating;

                  const newItem: DetectedItem = {
                    id: 'ocr-' + (matchedItem.code || matchedItem.id),
                    bbox: {
                      xMin: canvas.width * 0.08,
                      yMin: canvas.height * 0.12,
                      xMax: canvas.width * 0.92,
                      yMax: canvas.height * 0.88
                    },
                    label: matchedItem.name,
                    confidence: 0.98,
                    matchedCollectible: matchedItem,
                    price: (matchedItem as any).retailPrice || (matchedItem as any).sealedPrice || 0,
                    frameW: canvas.width,
                    frameH: canvas.height,
                    detectedAt: Date.now()
                  };

                  lockedQualityRef.current = newQuality;
                  setDetectedItems([newItem]);
                  setScanStatus('detected');
                  scanStartRef.current = Date.now();
                  setScanElapsed(0);

                  // Auto-add to tray immediately (REPLACE, do not accumulate to prevent ghosts)
                  setScannedTray([matchedItem]);
                }
              }
            }
          } catch (e) {
            console.error('[Scanner] OCR cycle error:', e);
          } finally {
            isOcrRunningRef.current = false;
          }
        })();
      }

      // Expire old bounding boxes gracefully (4s TTL) without flickering
      setDetectedItems(prev => prev.filter(p => {
        if (!p.detectedAt) return true;
        return (Date.now() - p.detectedAt) < 4000;
      }));

      // Next frame
      if (isScanningRef.current) {
        setTimeout(captureAndDetect, 320);
      }
    };

    captureAndDetect();

    return () => {
      isScanningRef.current = false;
    };
  }, [cameraActive, matchDetectionToCollectible]);

  // ── Category Switch Effect (Does NOT wipe scanned tray) ──
  useEffect(() => {
    stabilizerRef.current.clear();
    setDetectedItems([]);
    setScanStatus('scanning');
  }, [selectedCategory]);

  // ── Torch Toggle ──
  const toggleTorch = async () => {
    const nextState = !torchOn;
    if (videoRef.current?.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
          setTorchOn(nextState);
        }
      } catch (e) {
        console.warn('[Scanner] Torch not supported on this device:', e);
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

  // ── Save tray (or detected items) to collection ──
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
          userId: localStorage.getItem('hellobrick_userId') || 'user-1',
          setNum: item.code || item.id,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: price,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: item.description || `Scanned with AR (${item.theme || item.type?.toUpperCase() || 'COLLECTIBLE'})`,
          imageUrl: getSafeImageUrl(img),
          name: item.name,
          theme: item.theme || 'TCG',
          currentPrice: price,
          retailPrice: (item as any).retailPrice || (price * 0.2),
          year: item.year || 2024,
          cardNumber: (item as any).cardNumber || item.code,
          setSeries: (item as any).setSeries || item.theme,
          category: (item as any).category || (item.type as any) || 'pokemon',
          rating: (item as any).rating || (price > 100 ? 'Blue Chip' : 'Strong Buy'),
          psa10Value: (item as any).psa10Value || Math.round(price * 2.8),
          psa9Value: (item as any).psa9Value || Math.round(price * 1.45),
          description: item.description || `Authenticated ${(item.type || 'card').toUpperCase()} asset.`,
          addedAt: new Date().toISOString(),
          itemType: item.type === 'minifigure' ? 'minifig' : (item.type === 'pokemon' || item.type === 'mtg' || item.type === 'yugioh' || item.category === 'pokemon' ? 'card' : 'set')
        });
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      
      const nextCount = subscriptionService.incrementScanCount();
      const isPro = localStorage.getItem('hellobrick_is_pro') === 'true';

      setShowSaveSuccess(true);
      
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#10B981', '#FF7A30', '#3B82F6', '#FFCE4A'],
          zIndex: 9999
        });
      }).catch(() => {});

      setTimeout(() => {
        if (!isPro && nextCount >= 3) {
          onNavigate(Screen.SUBSCRIPTION);
        } else {
          onNavigate(Screen.COLLECTION);
        }
      }, 1200);
    } catch {
      alert('Save failed');
    }
  };

  const itemsToSave = scannedTray.length > 0 ? scannedTray : detectedItems.map(d => d.matchedCollectible).filter(Boolean) as AnyCollectible[];
  const isReadyToSave = itemsToSave.length > 0;
  const totalValue = itemsToSave.reduce((acc, c) => acc + (c?.sealedPrice || (c as any)?.marketPrice || (c as any)?.retailPrice || 0), 0);

  // ── Compute bounding box positions ──
  const getBoxStyle = (item: DetectedItem) => {
    if (!videoRef.current || !item.frameW || !item.frameH) return {};

    const vidEl = videoRef.current;
    const vidW = vidEl.clientWidth;
    const vidH = vidEl.clientHeight;
    
    if (vidW === 0 || vidH === 0) return { display: 'none' };

    const videoAspect = item.frameW / item.frameH;
    const containerAspect = vidW / vidH;

    let scaleX: number, scaleY: number, offsetX = 0, offsetY = 0;

    if (containerAspect > videoAspect) {
      scaleX = vidW / item.frameW;
      scaleY = scaleX;
      offsetY = (vidH - item.frameH * scaleY) / 2;
    } else {
      scaleY = vidH / item.frameH;
      scaleX = scaleY;
      offsetX = (vidW - item.frameW * scaleX) / 2;
    }

    const left = item.bbox.xMin * scaleX + offsetX;
    const top = item.bbox.yMin * scaleY + offsetY;
    const width = (item.bbox.xMax - item.bbox.xMin) * scaleX;
    const height = (item.bbox.yMax - item.bbox.yMin) * scaleY;

    return {
      left: `${Math.max(0, left)}px`,
      top: `${Math.max(0, top)}px`,
      width: `${Math.min(vidW, width)}px`,
      height: `${Math.min(vidH, height)}px`,
    };
  };

  return (
    <div className="flex flex-col h-full bg-black font-sans text-white relative overflow-hidden select-none">
      
      {/* ─── Live Camera Feed ─── */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          className={`w-full h-full object-cover transition-opacity duration-700 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-300">Initializing Optical Camera...</p>
          </div>
        )}
      </div>

      {/* ─── Top Sticky Bar ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),3rem)] pb-3 z-30 absolute top-0 left-0 right-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Indicator */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              scanStatus === 'detected' ? 'bg-emerald-400 animate-ping' : 
              scanStatus === 'scanning' ? 'bg-amber-400 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-200">
              {scanStatus === 'detected' ? 'Item Locked' : scanStatus === 'scanning' ? 'Searching...' : 'Ready'}
            </span>
          </div>

          <button 
            onClick={toggleTorch}
            className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center active:scale-95 transition-all ${
              torchOn ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/60 text-white border-white/15'
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* Category Horizontal Scroll Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar -mx-5 px-5">
          {SCAN_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  isSelected ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-300 hover:text-white bg-black/40 backdrop-blur-md border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── AR Reticle / Viewfinder ─── */}
      {detectedItems.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="w-72 h-96 relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />

            <div 
              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{
                top: `${(Math.sin(pulsePhase * (Math.PI / 180)) + 1) * 48}%`,
                transition: 'top 50ms linear'
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15 text-center">
                <ScanLine className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 animate-pulse" />
                {scanElapsed < 3 && (
                  <>
                    <p className="text-xs font-bold text-white">Point camera at card or set box</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">AI-powered live market identification</p>
                  </>
                )}
                {scanElapsed >= 3 && scanElapsed < 8 && (
                  <>
                    <p className="text-xs font-bold text-white">Analysing...</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Hold steady – shouldn't take long</p>
                  </>
                )}
                {scanElapsed >= 8 && scanElapsed < 15 && (
                  <>
                    <p className="text-xs font-bold text-white">Almost there...</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Try moving the card closer or adjusting lighting</p>
                  </>
                )}
                {scanElapsed >= 15 && (
                  <>
                    <p className="text-xs font-bold text-amber-300">Having trouble detecting</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Ensure the card is well-lit and fully in frame</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Live Detection Overlays ─── */}
      {detectedItems.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {detectedItems.map((item) => {
            const style = getBoxStyle(item);
            const hasMatch = !!item.matchedCollectible;

            return (
              <div
                key={item.id}
                className="absolute transition-all duration-200 ease-out pointer-events-auto cursor-pointer"
                style={style}
                onClick={() => addToTray(item)}
              >
                {/* Bounding box */}
                <div className="absolute inset-0 border-2 rounded-xl border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                </div>

                {/* Floating price pill above box */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[13px] px-3 py-1 rounded-full shadow-[0_4px_16px_rgba(16,185,129,0.6)] border border-emerald-300 whitespace-nowrap z-10 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>${item.price.toLocaleString()}</span>
                </div>

                {/* Label pill below box — name + ARD card number */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <div className="bg-black/85 backdrop-blur-md text-emerald-300 font-bold text-[11px] px-3 py-1 rounded-xl shadow-lg border border-white/20 whitespace-nowrap max-w-[260px] truncate">
                    {hasMatch ? item.matchedCollectible!.name : item.label}
                  </div>
                  {hasMatch && (item.matchedCollectible as any).cardNumber && (
                    <div className="bg-indigo-900/90 backdrop-blur-md text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded-lg border border-indigo-500/40 whitespace-nowrap">
                      {(item.matchedCollectible as any).cardNumber}
                      {(item.matchedCollectible as any).setSeries ? ` · ${(item.matchedCollectible as any).setSeries}` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Bottom Action Bar & Scanned Tray ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),2rem)] bg-gradient-to-t from-black via-black/95 to-transparent pt-4">
        
        {scannedTray.length > 0 && (
          <div className="px-5 mb-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Added Items ({scannedTray.length})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">${totalValue.toLocaleString()} total</span>
                <button
                  onClick={() => {
                    lockedQualityRef.current = 0;
                    setScannedTray([]);
                    setDetectedItems([]);
                    setScanStatus('scanning');
                    scanStartRef.current = Date.now();
                    setScanElapsed(0);
                  }}
                  className="text-[10px] font-bold text-amber-400 border border-amber-400/40 rounded-full px-2 py-0.5 active:scale-95 transition-transform"
                >
                  Rescan All
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {scannedTray.map((item) => (
                <div 
                  key={item.id} 
                  className="relative flex flex-col items-center bg-white/10 backdrop-blur-xl border border-emerald-400/40 rounded-2xl p-1.5 min-w-[80px] shrink-0 shadow-lg"
                >
                  {/* Dismiss button — tap to remove this card and resume scanning */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setScannedTray(prev => prev.filter(t => t.id !== item.id));
                      setDetectedItems(prev => prev.filter(d => d.matchedCollectible?.id !== item.id));
                      if (scannedTray.length <= 1) {
                        lockedQualityRef.current = 0; // allow fresh scan
                        setScanStatus('scanning');
                        scanStartRef.current = Date.now();
                        setScanElapsed(0);
                      }
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border border-white text-white flex items-center justify-center shadow active:scale-90 transition-transform z-10"
                    title="Remove & rescan"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
