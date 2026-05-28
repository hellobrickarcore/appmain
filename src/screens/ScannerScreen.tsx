import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Scan, Camera, Sparkles, ChevronRight, Check, Trash2, Trash, User, Layers, Box, Bell, QrCode } from 'lucide-react';
import { Screen, CollectionItem, WishlistItem } from '../types';
import { mockSets, mockValuations, mockMinifigs, generatePriceHistory } from '../lib/mock-data';
import confetti from 'canvas-confetti';
import { CameraLifecycleManager } from '../scanner-core/camera/cameraLifecycle';
import { ScannerDetectLoop } from '../scanner-core/detector/detectLoop';
import { toDetectionOverlay } from '../services/brickDetectionService';
import { DetectionOverlay } from '../types/detection';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  focusSearch?: boolean;
  mode?: 'minifig' | 'set' | 'bulk_minifig' | 'cmf_qr';
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, focusSearch = false, mode = 'set' }) => {
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedResult, setDetectedResult] = useState<any | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Real Camera & Detection State
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraManager = useRef<CameraLifecycleManager | null>(null);
  const detectLoop = useRef<ScannerDetectLoop | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<DetectionOverlay[]>([]);
  const [lockOnTarget, setLockOnTarget] = useState<any | null>(null);
  const [lockOnProgress, setLockOnProgress] = useState(0);
  const lockTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusSearch]);

  // Clean up camera and loop on unmount
  useEffect(() => {
    return () => {
      stopCameraAndLoop();
    };
  }, []);

  const stopCameraAndLoop = () => {
    if (detectLoop.current) {
      detectLoop.current.stop();
      detectLoop.current = null;
    }
    if (cameraManager.current) {
      cameraManager.current.stopCamera();
      cameraManager.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    setOverlays([]);
    if (lockTimerRef.current) {
      clearInterval(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  };

  // Handle Scan Simulation or Real Camera Start
  const handleStartScan = async () => {
    setCameraError(null);
    setDetectedResult(null);
    setOverlays([]);
    setLockOnTarget(null);
    setLockOnProgress(0);

    setIsScanning(true);
    setScanProgress(0);

    try {
      console.log('[ScannerScreen] Starting real camera manager...');
      cameraManager.current = new CameraLifecycleManager();
      cameraManager.current.setVideoElement(videoRef.current);
      
      const success = await cameraManager.current.startCamera();
      if (success) {
        setIsCameraActive(true);
        console.log('[ScannerScreen] Camera started successfully. Initializing detect loop...');
        
        detectLoop.current = new ScannerDetectLoop(`session_${Date.now()}`, {
          onSuccess: (res) => {
            const currentOverlays = (res.detections || [])
              .map(toDetectionOverlay)
              .filter((o): o is DetectionOverlay => o !== null);
            setOverlays(currentOverlays);
            
            // Auto lock-on matching algorithm for mock showcase
            if (currentOverlays.length > 0 && !lockTimerRef.current) {
              const bestMatch = currentOverlays.find(o => o.identityConfidence > 0.15);
              if (bestMatch) {
                triggerLockOnSequence(bestMatch);
              }
            }
          },
          onError: (err) => {
            console.error('[ScannerScreen] Detection Loop Error:', err);
          }
        });
        
        detectLoop.current.setVideoElement(videoRef.current);
        detectLoop.current.start();
      } else {
        throw new Error('Camera initialization failed.');
      }
    } catch (err: any) {
      console.error('[ScannerScreen] Camera Start Error:', err);
      setCameraError(err.message || 'Could not acquire camera access. Please check permissions.');
      setIsScanning(false);
      
      // FALLBACK: If camera fails or permissions denied, run simulation loop so the user is never stuck!
      runSimulationFallback();
    }
  };

  const triggerLockOnSequence = (target: DetectionOverlay) => {
    setLockOnTarget(target);
    let progress = 0;
    
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    
    lockTimerRef.current = window.setInterval(() => {
      progress += 10;
      setLockOnProgress(progress);
      setScanProgress(progress);
      
      if (progress >= 100) {
        if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        lockTimerRef.current = null;
        
        // Finalize match and trigger modal
        setTimeout(() => {
          stopCameraAndLoop();
          
          if (mode === 'minifig') {
            const minifig = mockMinifigs.find(m => m.figNum === 'njo0108'); // Lloyd DX
            if (minifig) {
              setDetectedResult({
                type: 'minifig',
                item: minifig,
                valuation: {
                  sealedValue: minifig.resaleValue,
                  usedValue: minifig.resaleValue,
                  resaleAvg: minifig.resaleValue,
                  sealedChange30d: 7.9,
                  usedChange30d: 7.9,
                  rarityScore: minifig.rarityScore,
                  demandScore: minifig.rarityScore,
                  priceHistory: generatePriceHistory(minifig.resaleValue * 0.9, 12, 'up'),
                  lastUpdated: new Date().toISOString()
                }
              });
            }
          } else if (mode === 'bulk_minifig') {
            const minifig1 = mockMinifigs.find(m => m.figNum === 'njo0108'); // Lloyd DX
            const minifig2 = mockMinifigs.find(m => m.figNum === 'sp124');   // Shuttle Astronaut
            const minifig3 = mockMinifigs.find(m => m.figNum === 'njo0186'); // Kai Dragon
            
            setDetectedResult({
              type: 'bulk',
              items: [
                { minifig: minifig1, confidence: 99 },
                { minifig: minifig2, confidence: 97 },
                { minifig: minifig3, confidence: 94 }
              ]
            });
          } else if (mode === 'cmf_qr') {
            const minifig = mockMinifigs.find(m => m.figNum === 'njo0186'); // Kai Dragon
            if (minifig) {
              setDetectedResult({
                type: 'minifig',
                item: minifig,
                valuation: {
                  sealedValue: minifig.resaleValue,
                  usedValue: minifig.resaleValue,
                  resaleAvg: minifig.resaleValue,
                  sealedChange30d: 9.2,
                  usedChange30d: 9.2,
                  rarityScore: minifig.rarityScore,
                  demandScore: minifig.rarityScore,
                  priceHistory: generatePriceHistory(minifig.resaleValue * 0.95, 12, 'up'),
                  lastUpdated: new Date().toISOString()
                }
              });
            }
          } else {
            const set = mockSets.find(s => s.setNum === '10270-1');
            const val = mockValuations.get('10270-1');
            if (set && val) {
              setDetectedResult({
                type: 'set',
                item: set,
                valuation: val
              });
            }
          }
          
          confetti({ 
            particleCount: 120, 
            spread: 70, 
            origin: { y: 0.8 }, 
            colors: ['#C9A84C', '#FFFFFF', '#3B82F6'] 
          });
        }, 300);
      }
    }, 150);
  };

  const runSimulationFallback = () => {
    console.warn('[ScannerScreen] Running simulation fallback...');
    setIsScanning(true);
    setScanProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          
          if (mode === 'minifig') {
            const minifig = mockMinifigs.find(m => m.figNum === 'njo0108'); // Lloyd DX
            if (minifig) {
              setDetectedResult({
                type: 'minifig',
                item: minifig,
                valuation: {
                  sealedValue: minifig.resaleValue,
                  usedValue: minifig.resaleValue,
                  resaleAvg: minifig.resaleValue,
                  sealedChange30d: 7.9,
                  usedChange30d: 7.9,
                  rarityScore: minifig.rarityScore,
                  demandScore: minifig.rarityScore,
                  priceHistory: generatePriceHistory(minifig.resaleValue * 0.9, 12, 'up'),
                  lastUpdated: new Date().toISOString()
                }
              });
            }
          } else if (mode === 'bulk_minifig') {
            const minifig1 = mockMinifigs.find(m => m.figNum === 'njo0108'); // Lloyd DX
            const minifig2 = mockMinifigs.find(m => m.figNum === 'sp124');   // Shuttle Astronaut
            const minifig3 = mockMinifigs.find(m => m.figNum === 'njo0186'); // Kai Dragon
            
            setDetectedResult({
              type: 'bulk',
              items: [
                { minifig: minifig1, confidence: 99 },
                { minifig: minifig2, confidence: 97 },
                { minifig: minifig3, confidence: 94 }
              ]
            });
          } else if (mode === 'cmf_qr') {
            const minifig = mockMinifigs.find(m => m.figNum === 'njo0186'); // Kai Dragon
            if (minifig) {
              setDetectedResult({
                type: 'minifig',
                item: minifig,
                valuation: {
                  sealedValue: minifig.resaleValue,
                  usedValue: minifig.resaleValue,
                  resaleAvg: minifig.resaleValue,
                  sealedChange30d: 9.2,
                  usedChange30d: 9.2,
                  rarityScore: minifig.rarityScore,
                  demandScore: minifig.rarityScore,
                  priceHistory: generatePriceHistory(minifig.resaleValue * 0.95, 12, 'up'),
                  lastUpdated: new Date().toISOString()
                }
              });
            }
          } else {
            const set = mockSets.find(s => s.setNum === '10270-1');
            const val = mockValuations.get('10270-1');
            if (set && val) {
              setDetectedResult({
                type: 'set',
                item: set,
                valuation: val
              });
            }
          }
          
          confetti({ 
            particleCount: 120, 
            spread: 70, 
            origin: { y: 0.8 }, 
            colors: ['#C9A84C', '#FFFFFF', '#3B82F6'] 
          });
        }, 400);
      }
    }, 85);
  };

  // Get matching scanner labels depending on mode
  const getScannerLabels = () => {
    switch (mode) {
      case 'minifig':
        return {
          title: 'Minifig Scanner',
          instruction: 'Align a single Minifigure inside the capsule reticle',
          actionText: 'Start Minifig Lens',
          progressText: 'ANALYZING PRINT PATTERNS...',
          reticleStyle: 'capsule'
        };
      case 'bulk_minifig':
        return {
          title: 'Bulk Minifig Scanner',
          instruction: 'Spread out multiple characters to detect in parallel',
          actionText: 'Start Bulk Lens',
          progressText: 'DETECTING MULTIPLE ENTITIES...',
          reticleStyle: 'bulk'
        };
      case 'cmf_qr':
        return {
          title: 'CMF QR Code Decoder',
          instruction: 'Position collectible box bottom QR directly in frame',
          actionText: 'Start QR Decoder',
          progressText: 'DECODING MATRIX CODE...',
          reticleStyle: 'qr'
        };
      case 'set':
      default:
        return {
          title: 'Box Art Scanner',
          instruction: 'Point camera lens at the front box face to identify',
          actionText: 'Start Box Lens',
          progressText: 'MATCHING CATALOG INDEX...',
          reticleStyle: 'wide'
        };
    }
  };

  const labels = getScannerLabels();

  // Unified Catalog Debounced search
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const setsFiltered = mockSets.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.setNum.toLowerCase().includes(search.toLowerCase())
    );
    const figsFiltered = mockMinifigs.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.figNum.toLowerCase().includes(search.toLowerCase())
    );

    return [
      ...setsFiltered.map(s => ({ ...s, itemType: 'set' })),
      ...figsFiltered.map(f => ({ ...f, itemType: 'minifig', setNum: f.figNum }))
    ].slice(0, 5);
  }, [search]);

  // Bulk Save all detected characters to collection
  const handleBulkSave = () => {
    if (!detectedResult || detectedResult.type !== 'bulk') return;
    const stored = localStorage.getItem('hellobrick_collection_sets');
    let currentColl = [];
    if (stored) {
      try { currentColl = JSON.parse(stored); } catch(e){}
    }

    const newItems = detectedResult.items.map((entry: any, index: number) => {
      const m = entry.minifig;
      return {
        id: `scan_add_bulk_${Date.now()}_${index}`,
        userId: localStorage.getItem('hellobrick_userId') || 'anonymous',
        setNum: m.figNum,
        condition: 'used',
        purchasePrice: m.resaleValue * 0.8,
        purchaseDate: new Date().toISOString().split('T')[0],
        addedAt: new Date().toISOString(),
        notes: 'Sourced via bulk camera scan',
        itemType: 'minifig',
        quantity: 1
      };
    });

    const updated = [...newItems, ...currentColl];
    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
    setDetectedResult(null);
    window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#A855F7', '#FFFFFF'] });
  };

  // Sparkline generator
  const getSparklinePoints = (history: any[] | undefined, width: number, height: number, condition: string) => {
    if (!history || history.length === 0) return '';
    const values = history.map(h => condition === 'sealed' ? h.sealed : h.used);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = history.map((h, i) => {
      const val = condition === 'sealed' ? h.sealed : h.used;
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0D111A] font-sans text-white overflow-hidden relative select-none">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <div className="pt-[max(1.5rem,env(safe-area-inset-top))] px-6 pb-4 flex items-center justify-between border-b border-[#2A3144]/40 bg-[#0D111A]/95 backdrop-blur-md z-40 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="w-10 h-10 bg-[#161A2B] border border-[#2A3144] rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-white">{labels.title}</span>
        </div>
        <span className="text-[9px] font-black text-[#C9A84C] border border-[#C9A84C]/35 bg-[#C9A84C]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
          LIVE LENS
        </span>
      </div>

      <div className="flex-1 relative flex flex-col justify-between p-6 z-10 overflow-y-auto no-scrollbar">
        
        {/* A. SEARCH BAR INPUT AT TOP */}
        <div className="relative z-50 mb-4">
          <div className="bg-[#161A2B] rounded-2xl p-1.5 flex items-center border border-[#2A3144] focus-within:border-[#C9A84C] transition-colors shadow-2xl">
            <div className="flex-1 flex items-center px-3 gap-3">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search set number, minifig theme..."
                className="bg-transparent border-none outline-none text-white font-semibold text-xs py-3 w-full placeholder:text-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1 hover:text-white text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Debounced Search Dropdown */}
          {search && (
            <div className="absolute top-16 left-0 right-0 bg-[#161A2B] border border-[#2A3144] rounded-3xl p-3.5 shadow-3xl space-y-2 mt-1 animate-in fade-in duration-200">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">
                UNIFIED INDEX ({searchResults.length})
              </p>
              {searchResults.map(entry => {
                const entryAny = entry as any;
                const val = entry.itemType === 'minifig' 
                  ? {
                      sealedValue: entryAny.resaleValue,
                      usedValue: entryAny.resaleValue,
                      resaleAvg: entryAny.resaleValue,
                      sealedChange30d: 7.9,
                      usedChange30d: 7.9,
                      rarityScore: entryAny.rarityScore,
                      demandScore: entryAny.rarityScore,
                      priceHistory: generatePriceHistory(entryAny.resaleValue * 0.9, 12, 'up'),
                      lastUpdated: new Date().toISOString()
                    }
                  : mockValuations.get(entry.setNum);

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedAsset({ set: entry, val });
                      setSearch('');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1E233B] cursor-pointer group active:bg-[#1E233B]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0D111A] rounded-lg flex items-center justify-center border border-[#2A3144] overflow-hidden">
                        <img src={entry.imageUrl} alt={entry.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-white text-xs truncate max-w-[150px]">{entry.name}</h4>
                        <span className="text-[9px] font-mono text-slate-500">
                          #{entry.setNum.split('-')[0]} · {entry.theme} ({entry.itemType})
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
              {searchResults.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4 font-bold">No catalog item matched this query.</p>
              )}
            </div>
          )}
        </div>

        {/* B. CAMERA VIEWPORT & OVERLAY BOUNDARIES */}
        {(isCameraActive || isScanning) && !detectedResult && (
          <div className="flex-1 flex flex-col items-center justify-center my-4 relative">
            
            {/* Viewport Container */}
            <div className="relative overflow-hidden w-full h-[55dvh] rounded-[36px] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-3xl">
              
              {/* Actual Video Viewfinder */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-90' : 'opacity-0'}`} 
              />

              {/* Bouncing Scanning HUD Line */}
              {isCameraActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent animate-[scan_2.5s_ease-in-out_infinite] pointer-events-none z-20" />
              )}

              {/* Camera Loading Overlay */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161A2B]/40 z-30">
                  <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin flex items-center justify-center border-[#C9A84C]">
                    <Camera className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                    ACQUIRING LENS STREAM...
                  </span>
                </div>
              )}

              {/* Camera Error / Permission Denied Screen */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D111A]/95 p-8 text-center z-30 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mb-4">
                    <X className="w-6 h-6 text-rose-500" />
                  </div>
                  <h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">Camera Access Restricted</h4>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-[240px] mb-6">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => {
                      setCameraError(null);
                      runSimulationFallback();
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Bypass to Standard Lens Mode
                  </button>
                </div>
              )}

              {/* Dynamic Bounding Box Overlay Layer */}
              {isCameraActive && overlays.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {overlays.map((ov, index) => {
                    if (!ov.box) return null;
                    
                    // Coordinates are normalized relative to 1024 target dimension
                    const widthPct = ((ov.box.xMax - ov.box.xMin) / 1024) * 100;
                    const heightPct = ((ov.box.yMax - ov.box.yMin) / 1024) * 100;
                    const leftPct = (ov.box.xMin / 1024) * 100;
                    const topPct = (ov.box.yMin / 1024) * 100;

                    const isLocked = lockOnTarget && lockOnTarget.id === ov.id;

                    return (
                      <div
                        key={ov.id || index}
                        className={`absolute border-2 rounded-xl flex flex-col justify-between p-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all ${
                          isLocked
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'border-[#C9A84C] bg-[#C9A84C]/5'
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                        }}
                      >
                        <div className={`text-[9px] font-mono font-black tracking-tight ${isLocked ? 'text-emerald-400' : 'text-[#C9A84C]'}`}>
                          {ov.compactLabel || 'LEGO Item'}
                        </div>
                        <div className={`self-end text-[9px] font-mono font-black ${isLocked ? 'text-emerald-400' : 'text-[#C9A84C]'}`}>
                          {Math.round(ov.identityConfidence * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lock-On HUD HUD Overlay */}
              {isCameraActive && lockOnTarget && (
                <div className="absolute bottom-6 left-6 right-6 bg-[#0D111A]/90 border border-white/10 rounded-2xl p-4 flex items-center gap-4 z-20 animate-in slide-in-from-bottom-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <h5 className="font-black text-white text-xs uppercase tracking-wider truncate">Locking onto Brick Pattern</h5>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${lockOnProgress}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black text-emerald-400 shrink-0">{lockOnProgress}%</span>
                </div>
              )}
            </div>

            {/* Viewport Stop Action */}
            <button
              onClick={stopCameraAndLoop}
              className="mt-6 px-6 py-3.5 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-full font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-rose-950/5 flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Teardown Lens Session
            </button>
          </div>
        )}

        {/* B2. INITIAL PRE-VIEW CAMERA VIEWPORT CONTROLS */}
        {!isScanning && !detectedResult && !isCameraActive && (
          <div className="flex-1 flex flex-col items-center justify-center my-4 relative">
            
            {/* HOLOGRAPHIC CAMERA TARGETING GRID BASED ON SELECTOR MODE */}
            {labels.reticleStyle === 'capsule' && (
              /* MINIFIG: Vertical capsule target */
              <div className="w-48 h-72 border-2 border-dashed border-[#C9A84C]/35 rounded-[48px] flex items-center justify-center relative bg-gradient-to-tr from-[#C9A84C]/5 to-transparent shadow-3xl overflow-hidden group">
                <div className="absolute top-6 left-6 w-6 h-6 border-t-4 border-l-4 border-[#C9A84C]/65 rounded-tl-lg" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-4 border-r-4 border-[#C9A84C]/65 rounded-tr-lg" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-4 border-l-4 border-[#C9A84C]/65 rounded-bl-lg" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-4 border-r-4 border-[#C9A84C]/65 rounded-br-lg" />
                <Camera className="w-12 h-12 text-[#C9A84C]/45 animate-pulse" />
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/70 to-transparent animate-bounce top-1/2" />
              </div>
            )}

            {labels.reticleStyle === 'wide' && (
              /* SET: Wide horizontal box target */
              <div className="w-72 h-52 border-2 border-dashed border-blue-500/35 rounded-[32px] flex items-center justify-center relative bg-gradient-to-tr from-blue-500/5 to-transparent shadow-3xl overflow-hidden group">
                <div className="absolute top-5 left-5 w-6 h-6 border-t-4 border-l-4 border-blue-500/65 rounded-tl-lg" />
                <div className="absolute top-5 right-5 w-6 h-6 border-t-4 border-r-4 border-blue-500/65 rounded-tr-lg" />
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-4 border-l-4 border-blue-500/65 rounded-bl-lg" />
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-4 border-r-4 border-blue-500/65 rounded-br-lg" />
                <Camera className="w-12 h-12 text-blue-500/45 animate-pulse" />
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent animate-bounce top-1/2" />
              </div>
            )}

            {labels.reticleStyle === 'bulk' && (
              /* BULK: Multiple coordinate tracer bounding boxes */
              <div className="w-68 h-68 border border-white/5 rounded-3xl flex items-center justify-center relative bg-[#161A2B]/20 shadow-2xl overflow-hidden">
                {/* 3 mock active tracking grids bouncing in reticle */}
                <div className="absolute top-8 left-8 w-20 h-20 border border-purple-500/50 bg-purple-500/5 rounded-2xl flex flex-col justify-between p-1.5 animate-pulse">
                  <div className="text-[7px] font-mono text-purple-400 font-bold">LENS A: DETECTING</div>
                  <div className="self-end text-[8px] font-mono text-purple-400 font-black">98%</div>
                </div>
                <div className="absolute bottom-10 right-6 w-24 h-24 border border-purple-500/50 bg-purple-500/5 rounded-2xl flex flex-col justify-between p-1.5 animate-pulse" style={{ animationDelay: '300ms' }}>
                  <div className="text-[7px] font-mono text-purple-400 font-bold">LENS B: DETECTING</div>
                  <div className="self-end text-[8px] font-mono text-purple-400 font-black">94%</div>
                </div>
                <div className="absolute top-20 right-8 w-16 h-16 border border-purple-500/30 bg-purple-500/5 rounded-xl flex flex-col justify-between p-1.5 animate-pulse" style={{ animationDelay: '600ms' }}>
                  <div className="text-[7px] font-mono text-purple-400 font-bold">LENS C</div>
                  <div className="self-end text-[8px] font-mono text-purple-400 font-black">91%</div>
                </div>
                <Camera className="w-12 h-12 text-purple-500/30" />
              </div>
            )}

            {labels.reticleStyle === 'qr' && (
              /* QR SCAN: Centered precision square targeting */
              <div className="w-56 h-56 border-2 border-dashed border-orange-500/35 rounded-2xl flex items-center justify-center relative bg-gradient-to-tr from-orange-500/5 to-transparent shadow-3xl overflow-hidden">
                <div className="absolute top-4 left-4 w-5 h-5 border-t-4 border-l-4 border-orange-500/65" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-4 border-r-4 border-orange-500/65" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-4 border-l-4 border-orange-500/65" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-4 border-r-4 border-orange-500/65" />
                
                <QrCode className="w-16 h-16 text-orange-500/30" />
                <div className="absolute left-4 right-4 h-0.5 bg-orange-500/60 animate-bounce top-1/2" />
              </div>
            )}

            <div className="text-center max-w-[250px] mt-6">
              <h3 className="font-black text-white text-xs uppercase tracking-widest">{labels.title}</h3>
              <p className="text-xs text-slate-500 mt-2 font-bold leading-normal">
                {labels.instruction}
              </p>
            </div>

            <button
              onClick={handleStartScan}
              className={`mt-6 font-black w-52 py-4 rounded-full text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 ${
                mode === 'minifig' 
                  ? 'bg-[#C9A84C] text-[#0D111A] shadow-[#C9A84C]/5' 
                  : mode === 'bulk_minifig'
                    ? 'bg-purple-600 text-white shadow-purple-600/5'
                    : mode === 'cmf_qr'
                      ? 'bg-orange-600 text-white shadow-orange-600/5'
                      : 'bg-blue-600 text-white shadow-blue-600/5'
              }`}
            >
              <Scan className="w-4 h-4" strokeWidth={2.5} />
              {labels.actionText}
            </button>
          </div>
        )}

        {/* C. SCANNING PROGRESS VIEW */}
        {isScanning && (
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <div className={`w-64 h-64 border-2 rounded-[36px] flex flex-col items-center justify-center relative bg-[#161A2B]/40 shadow-inner overflow-hidden ${
              mode === 'minifig' ? 'border-[#C9A84C]' : mode === 'bulk_minifig' ? 'border-purple-500' : mode === 'cmf_qr' ? 'border-orange-500' : 'border-blue-500'
            }`}>
              <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
              
              <div className="w-20 h-20 border-4 border-t-transparent rounded-full animate-spin flex items-center justify-center" style={{ 
                borderColor: mode === 'minifig' ? '#C9A84C' : mode === 'bulk_minifig' ? '#A855F7' : mode === 'cmf_qr' ? '#F97316' : '#3B82F6',
                borderTopColor: 'transparent'
              }}>
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="font-mono text-base font-black text-white mt-6">{scanProgress}%</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                {labels.progressText}
              </span>
            </div>
          </div>
        )}

        {/* D. SINGLE DETECTED SPEC VIEW */}
        {detectedResult && (detectedResult.type === 'set' || detectedResult.type === 'minifig') && (
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <div className="bg-[#161A2B] border border-[#2A3144] rounded-[36px] p-6 text-center max-w-[280px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#C9A84C]/5 blur-xl rounded-full" />
              <div className="w-28 h-28 bg-[#0D111A] rounded-2xl flex items-center justify-center mx-auto border border-[#2A3144]/65 overflow-hidden mb-4 p-2">
                <img src={detectedResult.item.imageUrl} className="w-20 h-20 object-contain" alt="thumbnail" />
              </div>
              
              <span className="text-[8px] font-black text-[#C9A84C] border border-[#C9A84C]/35 bg-[#C9A84C]/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MATCH FOUND (99%)
              </span>
              <h4 className="font-black text-white text-sm mt-3.5 leading-tight">{detectedResult.item.name}</h4>
              <p className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                #{detectedResult.item.setNum || detectedResult.item.figNum}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2A3144]/40">
                <div className="text-left font-mono">
                  <span className="text-[8px] font-black font-sans text-slate-500 uppercase block">Sealed Val</span>
                  <span className="text-xs font-black text-emerald-400 block mt-0.5">${detectedResult.valuation.sealedValue}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[8px] font-black font-sans text-slate-500 uppercase block">Used Val</span>
                  <span className="text-xs font-black text-slate-300 block mt-0.5">${detectedResult.valuation.usedValue}</span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => {
                    setSelectedAsset({ set: detectedResult.item, val: detectedResult.valuation });
                    setDetectedResult(null);
                  }}
                  className="flex-1 bg-[#C9A84C] text-[#0D111A] font-black py-3 rounded-xl text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-md"
                >
                  Valuate Asset
                </button>
                <button
                  onClick={() => setDetectedResult(null)}
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-wider active:scale-95"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* E. BULK DETECTED CHARACTERS INDEX */}
        {detectedResult && detectedResult.type === 'bulk' && (
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <div className="bg-[#161A2B] border border-[#2A3144] rounded-[36px] p-5 w-full max-w-sm shadow-2xl relative overflow-hidden text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-purple-400 border border-purple-500/35 bg-purple-500/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  BULK DETECTED ({detectedResult.items.length})
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">Real-time scan</span>
              </div>

              <div className="space-y-2.5 mb-5 max-h-56 overflow-y-auto no-scrollbar">
                {detectedResult.items.map((entry: any, index: number) => {
                  const m = entry.minifig;
                  return (
                    <div key={index} className="bg-[#0D111A]/90 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/[0.01] rounded-lg flex items-center justify-center border border-white/5 p-1 overflow-hidden shrink-0">
                          <img src={m.imageUrl} className="w-8 h-8 object-contain" alt="" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-white truncate max-w-[130px]">{m.name}</h4>
                          <span className="text-[9px] font-mono text-slate-500">#{m.figNum} · {m.theme}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-black text-emerald-400 block">${m.resaleValue}</span>
                        <span className="text-[7px] font-bold text-slate-500 block font-sans">Conf. {entry.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBulkSave}
                  className="flex-1 bg-purple-600 text-white font-black py-4.5 rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Secure All to Vault
                </button>
                <button
                  onClick={() => setDetectedResult(null)}
                  className="px-4 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-wider active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* F. BOTTOM SLIDE DRAWER DETAILS POPUP */}
      {selectedAsset && selectedAsset.set && selectedAsset.val && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedAsset(null)} />
          <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-[42px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-3xl overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 blur-3xl rounded-full" />
            <button onClick={() => setSelectedAsset(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-5">
              <div className="w-40 h-40 bg-white/[0.02] rounded-[32px] flex items-center justify-center mb-4 relative border border-white/5 p-3">
                <img
                  src={selectedAsset.set.imageUrl}
                  className="w-28 h-28 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
                  alt=""
                />
                {selectedAsset.set.year && selectedAsset.set.year < 2022 && (
                  <span className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                    Retired
                  </span>
                )}
              </div>
              <div className="w-full text-center px-2">
                <h3 className="text-xl font-black text-white leading-tight tracking-tight">{selectedAsset.set.name}</h3>
                <p className="text-[11px] font-mono text-slate-500 mt-1 font-bold">
                  #{selectedAsset.set.setNum || selectedAsset.set.figNum} · {selectedAsset.set.theme} · {selectedAsset.set.year}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-[#161A2B] border border-[#2A3144] rounded-2xl p-3 text-center">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Sealed</span>
                <span className="text-xs font-mono font-black text-white mt-1 block">${selectedAsset.val.sealedValue}</span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">+{selectedAsset.val.sealedChange30d}%</span>
              </div>
              <div className="bg-[#161A2B] border border-[#2A3144] rounded-2xl p-3 text-center">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Used</span>
                <span className="text-xs font-mono font-black text-white mt-1 block">${selectedAsset.val.usedValue}</span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">+{selectedAsset.val.usedChange30d}%</span>
              </div>
              <div className="bg-[#161A2B] border border-[#2A3144] rounded-2xl p-3 text-center text-slate-300">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Avg Resale</span>
                <span className="text-xs font-mono font-black text-[#C9A84C] mt-1 block">${selectedAsset.val.resaleAvg}</span>
                <span className="text-[8px] text-slate-500 font-bold block mt-0.5">ESTIMATED</span>
              </div>
            </div>

            {/* Quick adding / monitoring actions */}
            <div className="space-y-3.5">
              <button
                onClick={() => {
                  const stored = localStorage.getItem('hellobrick_collection_sets');
                  let currentCollection = [];
                  if (stored) {
                    try { currentCollection = JSON.parse(stored); } catch(e){}
                  }
                  
                  const isMinifig = selectedAsset.set.figNum ? true : (selectedAsset.set.itemType === 'minifig');

                  const newItem: CollectionItem = {
                    id: `scan_add_${Date.now()}`,
                    userId: localStorage.getItem('hellobrick_userId') || 'anonymous',
                    setNum: selectedAsset.set.setNum || selectedAsset.set.figNum,
                    condition: 'used',
                    purchasePrice: selectedAsset.val.usedValue * 0.9,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    addedAt: new Date().toISOString(),
                    notes: 'Identified via camera scan',
                    itemType: isMinifig ? 'minifig' : 'set',
                    quantity: 1
                  };
                  const updated = [newItem, ...currentCollection];
                  localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
                  setSelectedAsset(null);
                  window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
                  confetti({ particleCount: 120, spread: 75, origin: { y: 0.8 }, colors: ['#C9A84C', '#FFFFFF'] });
                }}
                className="w-full bg-[#C9A84C] text-[#0D111A] font-black py-4.5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl shadow-[#C9A84C]/10"
              >
                Secure to Vault
              </button>

              <button
                onClick={() => {
                  const stored = localStorage.getItem('hellobrick_wishlist_sets');
                  let currentWishlist = [];
                  if (stored) {
                    try { currentWishlist = JSON.parse(stored); } catch(e){}
                  }
                  
                  const isMinifig = selectedAsset.set.figNum ? true : (selectedAsset.set.itemType === 'minifig');

                  const newItem: WishlistItem = {
                    id: `scan_wish_${Date.now()}`,
                    userId: localStorage.getItem('hellobrick_userId') || 'anonymous',
                    setNum: selectedAsset.set.setNum || selectedAsset.set.figNum,
                    targetPrice: selectedAsset.val.sealedValue * 0.85,
                    addedAt: new Date().toISOString(),
                    itemType: isMinifig ? 'minifig' : 'set',
                    alertEnabled: true
                  };
                  const updated = [newItem, ...currentWishlist];
                  localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(updated));
                  setSelectedAsset(null);
                  confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 }, colors: ['#3B5998', '#FFFFFF'] });
                }}
                className="w-full bg-[#161A2B] border border-[#2A3144] hover:bg-[#1E233B] text-[#C9A84C] font-black py-4.5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Deploy Price Monitor
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Global CSS scan keyframe animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
