import { detectBricks, DetectionStabilizer, brickDetectionService } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle2, Trash2, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { FrameDetection, ScanFrameResponse, bboxToRenderBox } from '../types/detection';
import { saveCollectionToSupabase } from '../services/trainingDataService';
import { usageService } from '../services/usageService';
import { analytics } from '../services/analyticsService';


interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  challenge?: any;
  onPhaseChange?: (phase: 'preview' | 'scanning' | 'results') => void;
  mode?: 'scan' | 'h2h';
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8']; // Blue-focused palette

const cropBrickImage = (sourceBase64: string, bbox: { xMin: number; yMin: number; xMax: number; yMax: number }): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = sourceBase64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const x = Math.max(0, bbox.xMin);
      const y = Math.max(0, bbox.yMin);
      const width = Math.min(img.width - x, bbox.xMax - bbox.xMin);
      const height = Math.min(img.height - y, bbox.yMax - bbox.yMin);

      canvas.width = Math.max(100, width);
      canvas.height = Math.max(100, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceBase64);
        return;
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, x, y, width, height, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(sourceBase64);
  });
};

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, challenge, onPhaseChange, mode = 'scan' }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef(false);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const deletedBrickIdsRef = useRef<string[]>([]);
  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<FrameDetection[]>([]);
  const [lastResponse, setLastResponse] = useState<ScanFrameResponse | null>(null);
  const [selectedBricks, setSelectedBricks] = useState<Set<string>>(new Set());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qualityAdvice, setQualityAdvice] = useState<string | null>(mode === 'h2h' ? 'Position opponent QR code' : null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'scanning' | 'results'>('preview');

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // ─── Camera Setup ───────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const isSecureContext = window.isSecureContext || location.protocol === 'https:';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile && !isSecureContext) {
          setHasPermission(false);
          setQualityAdvice('Camera requires HTTPS on mobile.');
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setHasPermission(false);
          setQualityAdvice('Camera API not supported in this browser.');
          return;
        }

        // Use standard camera service for consistent behavior across web/mobile
        try {
          const { getCameraStream } = await import('../services/cameraService');
          stream = await getCameraStream();
        } catch {
          // Final fallback
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }

      } catch (err: any) {
        console.error("Camera error:", err);
        setHasPermission(false);
        if (err.name === 'NotAllowedError') {
          setQualityAdvice('Camera permission denied. Check browser settings.');
        } else if (err.name === 'NotFoundError') {
          setQualityAdvice('No camera found on this device.');
        } else {
          setQualityAdvice(`Camera error: ${err.message || 'Unknown'}`);
        }
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Ensure camera stream is attached on every render when scanning
  useEffect(() => {
    if (streamRef.current && videoRef.current && (phase === 'scanning' || phase === 'preview')) {
      if (videoRef.current.srcObject !== streamRef.current) {
        console.log('[Scanner] Re-attaching stream to video element');
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('[Scanner] Play error:', e));
      }
    }
  }, [phase, hasPermission]);

  // Auto-start scanning as soon as camera is ready
  useEffect(() => {
    if (hasPermission && phase === 'preview') {
      setPhase('scanning');
      analytics.track('scan_started');
    }
  }, [hasPermission]);

  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(2000, 0.18, 15));


  // ─── API Detection Loop ────────────────
  useEffect(() => {
    if (phase !== 'scanning' || !hasPermission) return;

    let timeoutId: any;
    let isActive = true;

    const detectLoop = async () => {
      if (!isActive || phase !== 'scanning' || !videoRef.current || isDetectingRef.current) {
        if (isActive) timeoutId = setTimeout(detectLoop, 200);
        return;
      }

      const video = videoRef.current;
      if (video.readyState < 2) {
        timeoutId = setTimeout(detectLoop, 200);
        return;
      }

      try {
        isDetectingRef.current = true;
        const response: ScanFrameResponse = await detectBricks(video);

        if (phase === 'scanning' && !isProcessing && isActive) {
          // Apply magnetic smoothing via unified stabilizer
          const stabilizedDetections = stabilizerRef.current.stabilize(response.detections);
          
          setDetectedObjects(stabilizedDetections);
          setLastResponse(response);
          setQualityAdvice(null);

          if (challenge) {
            const target = challenge.target?.toLowerCase() || '';
            const goalMet = response.detections.some(obj => {
              const name = obj.prediction.brickName?.toLowerCase() || '';
              const color = obj.prediction.brickColorName?.toLowerCase() || '';
              const confidence = obj.prediction.identityConfidence || 0;
              const isConfident = confidence >= 0.7;
              if (!isConfident) return false;
              return name === target || name.includes(target) || color === target || color.includes(target);
            });

            if (goalMet && !saveSuccess) {
               console.log('🎯 CHALLENGE GOAL MET!');
               confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#F97316', '#FB923C', '#FFFFFF'] });
               setSaveSuccess(true);
               import('../services/xpService').then(({ xpHelpers }) => { xpHelpers.challengeCompleted(challenge.id, 'daily'); });
               setTimeout(() => setPhase('results'), 2000);
            }
          }
        }

        // Adaptive Interval: RTT + 50ms buffer, min 150ms, max 1000ms
        const nextDelay = Math.max(150, Math.min(1000, (response.rttMs || 150) + 50));
        if (isActive) timeoutId = setTimeout(detectLoop, nextDelay);

      } catch (err) {
        console.error('Detection error:', err);
        if (isActive) timeoutId = setTimeout(detectLoop, 500); // Backoff on error
      } finally {
        isDetectingRef.current = false;
      }
    };

    detectLoop();

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, hasPermission]);

  // ─── Capture Frame ─────────────────────────────────────────────
  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const handleCapture = useCallback(async () => {
    setIsProcessing(true);
    isDetectingRef.current = true; 

    const image = captureImage();
    if (image) {
      setCapturedImage(image);
    }

    try {
      const threshold = 0.3;
      const capturedBricks = detectedObjects.filter(b => (b.prediction.identityConfidence || 0) >= threshold);
      
      const enrichedBricks = await Promise.all(capturedBricks.map(async b => {
         let snippet;
         if (image) {
            try { snippet = await cropBrickImage(image, b.geometry.bbox); } catch (e) {}
         }
         return { ...b, snippet };
      }));
      setDetectedObjects(enrichedBricks);
      
      const initialSelection = new Set<string>();
      capturedBricks.forEach(b => {
        initialSelection.add(b.detectionId);
      });
      setSelectedBricks(initialSelection);

      setPhase('results');
      analytics.track('scan_captured', { brick_count: capturedBricks.length });
    } catch (err) {
      console.error("Capture detection failed:", err);
      setPhase('scanning');
    } finally {
      setIsProcessing(false);
    }
  }, [captureImage, detectedObjects]);

  const handleSaveSelected = async () => {
    const bricksToSave = detectedObjects.filter(obj => selectedBricks.has(obj.detectionId));
    if (bricksToSave.length === 0) return;

    setIsProcessing(true);
    const userId = localStorage.getItem('hellobrick_userId') || `user_${Date.now()}`;
    localStorage.setItem('hellobrick_userId', userId);

    try {
      const bricksWithMetaData = await Promise.all(bricksToSave.map(async (obj) => {
        const pred = obj.prediction;
        const bbox = obj.geometry.bbox;
        const partId = pred.brickPartNum;
        
        let brickImage = `https://cdn.rebrickable.com/media/parts/elements/${partId}.jpg`;
        if (capturedImage) {
          try {
            brickImage = await cropBrickImage(capturedImage, bbox);
          } catch (e) {
            console.warn('Crop failed:', e);
          }
        }

        return {
          id: obj.detectionId,
          name: pred.brickName,
          type: 'Part',
          category: 'Bricks',
          color: pred.brickColorName,
          partNumber: partId,
          confidence: pred.identityConfidence,
          count: 1,
          image: brickImage,
          addedAt: Date.now(),
          bbox: {
            x: bbox.xMin,
            y: bbox.yMin,
            width: bbox.xMax - bbox.xMin,
            height: bbox.yMax - bbox.yMin,
          }
        };
      }));

      const stored = localStorage.getItem('hellobrick_collection');
      let existingBricks: any[] = [];
      if (stored) {
        try {
          existingBricks = JSON.parse(stored).bricks || [];
        } catch { }
      }

      const brickMap = new Map<string, any>();
      existingBricks.forEach(b => {
        const key = `${b.name || b.type}-${b.color}-${b.partNumber}`;
        brickMap.set(key, { ...b });
      });
      bricksWithMetaData.forEach(b => {
        const key = `${b.name}-${b.color}-${b.partNumber}`;
        if (brickMap.has(key)) {
          brickMap.get(key).count = (brickMap.get(key).count || 1) + 1;
        } else {
          brickMap.set(key, { ...b });
        }
      });

      localStorage.setItem('hellobrick_collection', JSON.stringify({
        bricks: Array.from(brickMap.values()),
        lastUpdated: Date.now()
      }));

      usageService.incrementScanCount();
      import('../services/xpService').then(({ xpHelpers }) => {
        xpHelpers.scanDetection(bricksToSave.length, bricksToSave.length);
      });

      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      saveCollectionToSupabase(userId, bricksWithMetaData).catch(() => { });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#EF4444', '#3B82F6', '#10B981']
      });

      setSaveSuccess(true);
      setTimeout(() => onNavigate(Screen.COLLECTION), 2000);
    } catch (error) {
      console.warn('Failed to save:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onNavigate(Screen.HOME);
  };

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-[max(env(safe-area-inset-top),16px)] left-0 right-0 px-6 flex justify-between items-center z-50">
        <div className="flex gap-4">
          <button onClick={handleClose} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-95 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg active:scale-95 transition-all">
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* ─── SCANNING PHASE ─── */}
      {(phase === 'preview' || phase === 'scanning') && (
        <>
          <div className="relative flex-1 bg-black overflow-hidden" ref={overlayContainerRef}>
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-6 z-50">
                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-sm">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">Camera Access Required</h3>
                  <button onClick={() => window.location.reload()} className="mt-2 w-full bg-orange-500 text-white font-bold py-3 rounded-lg">Retry</button>
                </div>
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />
            
            <div className="absolute top-0 left-0 right-0 p-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex items-center justify-center z-50 pointer-events-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[14px] font-black text-white/90 uppercase tracking-[0.2em]">LIVE SCANNER</span>
                  </div>
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {detectedObjects.map((obj, i) => {
                const container = overlayContainerRef.current;
                const video = videoRef.current;
                if (!container || !video) return null;
                const renderBox = bboxToRenderBox(obj.geometry.bbox, video.videoWidth || 640, video.videoHeight || 480, container.clientWidth, container.clientHeight, 'cover');
                return (
                  <div key={obj.detectionId || i} className="absolute" style={{ top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`, border: '1.5px solid #3B82F6', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                    {obj.prediction.identityConfidence > 0.3 && (
                      <div className="absolute -top-7 left-0 bg-[#3B82F6]/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black text-white uppercase truncate">
                        {brickDetectionService.generationFallbackLabel(obj)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center z-50">
              <button onClick={handleCapture} disabled={isProcessing} className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center group active:scale-95 transition-all shadow-2xl">
                <div className="w-[70px] h-[70px] rounded-full bg-white group-active:bg-slate-100 transition-colors shadow-inner" />
              </button>
          </div>
        </>
      )}

      {/* ─── RESULTS PHASE ─── */}
      {phase === 'results' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="relative flex-[3] bg-black overflow-hidden" id="results-container">
            {capturedImage && <img src={capturedImage} className="absolute inset-0 w-full h-full object-contain" alt="Captured" id="captured-result-image" />}
            <div className="absolute inset-0 pointer-events-none">
              {detectedObjects.map((obj, i) => {
                const img = document.getElementById('captured-result-image') as HTMLImageElement;
                if (!img || !img.parentElement) return null;
                const renderBox = bboxToRenderBox(obj.geometry.bbox, lastResponse?.frameWidth || img.naturalWidth || 640, lastResponse?.frameHeight || img.naturalHeight || 480, img.parentElement.clientWidth, img.parentElement.clientHeight, 'contain');
                const isSelected = selectedBricks.has(obj.detectionId);
                return (
                  <div key={obj.detectionId || i} className="absolute border-2 rounded-md" style={{ top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`, borderColor: isSelected ? COLORS[i % COLORS.length] : `${COLORS[i % COLORS.length]}50`, opacity: isSelected ? 1 : 0.4 }} />
                );
              })}
            </div>
          </div>
          <div className="flex-[4] bg-slate-900 border-t border-white/10 rounded-t-[24px] -mt-4 p-5 flex flex-col overflow-hidden">
            <h2 className="text-lg font-black text-white mb-4">{detectedObjects.length} Bricks Found</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {detectedObjects.map((obj, i) => {
                const isSelected = selectedBricks.has(obj.detectionId);
                const partNum = obj.prediction.brickPartNum || '3001';
                return (
                  <div key={obj.detectionId || i} onClick={() => { const s = new Set(selectedBricks); isSelected ? s.delete(obj.detectionId) : s.add(obj.detectionId); setSelectedBricks(s); }} className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${isSelected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10'}`}>
                    <img src={(obj as any).snippet || `https://cdn.rebrickable.com/media/parts/elements/${partNum}.jpg`} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{brickDetectionService.generationFallbackLabel(obj)}</p>
                      <p className="text-[10px] text-slate-500">{Math.round(obj.prediction.identityConfidence * 100)}% match</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-4 pb-[max(env(safe-area-inset-bottom),6rem)] flex gap-3">
              <button onClick={() => setPhase('scanning')} className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-bold">Reset</button>
              <button onClick={handleSaveSelected} className="flex-[2] py-3.5 rounded-2xl bg-orange-500 text-white font-bold">Add to Collection</button>
            </div>
          </div>
        </div>
      )}
      {isProcessing && <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
    </div>
  );
};
