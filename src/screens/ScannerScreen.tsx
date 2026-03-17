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

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, challenge, onPhaseChange }) => {
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
  const [qualityAdvice, setQualityAdvice] = useState<string | null>(null);
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

  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(2500, 0.2, 12));


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
          
          if (stabilizedDetections.length > 0) {
            console.log(`[Scanner] 🎯 Detections Loop: ${stabilizedDetections.length} objects (RTT: ${response.rttMs}ms)`, stabilizedDetections.map(d => ({
              id: d.detectionId,
              name: d.prediction.brickName,
              conf: d.prediction.identityConfidence,
              bbox: d.geometry.bbox
            })));
          }

          setDetectedObjects(stabilizedDetections);
          setLastResponse(response);
          setQualityAdvice(null);

          // ... challenge logic remains same ...
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

  // Removed old detection loop

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
    // Phase 18: Stop the loop immediately to freeze the "locked" states
    isDetectingRef.current = true; 


    const image = captureImage();
    if (image) {
      setCapturedImage(image);
    }

    try {
      // Phase 24: Lower threshold from 0.5 to 0.3 to match distance detection
      const threshold = 0.3;
      const capturedBricks = detectedObjects.filter(b => (b.prediction.identityConfidence || 0) >= threshold);
      console.log('[Scanner] 📸 Capture Event:', {
        totalDetected: detectedObjects.length,
        passedThreshold: capturedBricks.length,
        threshold,
        bricks: capturedBricks.map(b => ({ id: b.detectionId, name: b.prediction.brickName }))
      });
      setDetectedObjects(capturedBricks);
      
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
        
        // CROP the real image from the capture
        let brickImage = `https://cdn.rebrickable.com/media/parts/elements/${partId}.jpg`;
        if (capturedImage) {
          try {
            brickImage = await cropBrickImage(
              capturedImage, 
              bbox
            );
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

      // Increment daily scan count
      usageService.incrementScanCount();

      // AWARD XP
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
          <button 
            onClick={() => onNavigate(Screen.HOW_TO_SCAN)} 
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-95 transition-all"
          >
            <span className="text-xl font-black">?</span>
          </button>
        </div>
        
        <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg active:scale-95 transition-all">
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* ─── SCANNING PHASE ─── */}
      {(phase === 'preview' || phase === 'scanning') && (
        <>
          <div className="relative flex-1 bg-black overflow-hidden">
            {/* Camera permission error */}
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-6 z-50">
                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-sm">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">Camera Access Required</h3>
                  <p className="text-slate-300 text-sm mb-4">{qualityAdvice || 'Allow camera access.'}</p>
                  <button onClick={() => window.location.reload()} className="mt-2 w-full bg-orange-500 text-white font-bold py-3 rounded-lg">
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Live video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />

            {/* Scanning title or Challenge (Phase 20) */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex items-center justify-center z-50 pointer-events-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span className="text-[14px] font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                      {challenge ? 'CHALLENGE ACTIVE' : 'LIVE SCANNER'}
                    </span>
                  </div>
                  {challenge && (
                    <div className="bg-orange-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-500/30">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                        GOAL: {challenge.type}
                      </span>
                    </div>
                  )}
                </div>
            </div>

            {/* Minimal controls overlays (deprecated - using Top Controls above) */}
            <div className="hidden absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30">
              <button
                onClick={() => onNavigate(Screen.HOME)}
                className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
                <Zap className="w-6 h-6" />
              </button>
            </div>

            {/* 🔒 LOCK: Live bounding box overlays — using canonical utility. */}
            <div ref={overlayContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
              {detectedObjects.map((obj, i) => {
                const container = overlayContainerRef.current;
                const video = videoRef.current;
                if (!container || !video) return null;

                const vw = video.videoWidth || 640;
                const vh = video.videoHeight || 480;
                const cw = container.clientWidth;
                const ch = container.clientHeight;

                const renderBox = bboxToRenderBox(
                  obj.geometry.bbox,
                  vw,
                  vh,
                  cw,
                  ch,
                  'cover'
                );

                return (
                  <div
                    key={obj.detectionId || i}
                    className="absolute"
                    style={{
                      top: `${renderBox.top}%`,
                      left: `${renderBox.left}%`,
                      width: `${renderBox.width}%`,
                      height: `${renderBox.height}%`,
                      transition: 'all 0.1s ease-out',
                      border: '1.5px solid #3B82F6',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    {/* Label pill — Phase 22: Show more details and lower threshold for visibility */}
                    {obj.prediction.identityConfidence > 0.3 && (
                      <div 
                        className={`absolute -top-7 left-0 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 shadow-lg whitespace-nowrap border transition-opacity duration-300 ${
                          obj.prediction.identityConfidence > 0.6 
                            ? 'bg-[#3B82F6]/90 border-white/20' 
                            : 'bg-slate-800/80 border-white/5 opacity-80'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${obj.prediction.identityConfidence > 0.6 ? 'bg-white' : 'bg-slate-400'}`} />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                          {brickDetectionService.generationFallbackLabel(obj)}
                          <span className="ml-1.5 opacity-60 font-medium">
                            {Math.round(obj.prediction.identityConfidence * 100)}%
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 🔍 SEARCHING ANIMATION (Phase 22) */}
            {detectedObjects.length === 0 && phase === 'scanning' && !isProcessing && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent absolute top-0 animate-scan-sweep shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                <div className="bg-black/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                     {[0,1,2].map(i => (
                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                     ))}
                  </div>
                  <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em]">
                    Scanning for bricks...
                  </span>
                </div>
              </div>
            )}

            {/* Object count badge */}
            {detectedObjects.length > 0 && phase === 'scanning' && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-30">
                <span className="text-[12px] font-bold text-white">
                  {detectedObjects.length} brick{detectedObjects.length !== 1 ? 's' : ''} detected
                </span>
              </div>
            )}

            {/* Quality advice */}
            {qualityAdvice && (
              <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 z-30 pointer-events-none">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-[11px]">{qualityAdvice}</span>
              </div>
            )}
          </div>

          {/* Capture Button Container */}
          <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center z-50">
              <button
                onClick={handleCapture}
                disabled={isProcessing}
                className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center group active:scale-95 transition-all shadow-2xl"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-white group-active:bg-slate-100 transition-colors shadow-inner" />
              </button>
          </div>
        </>
      )}

      {/* ─── RESULTS PHASE ─── */}
      {phase === 'results' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Captured image with overlays */}
          <div className="relative flex-[3] bg-black overflow-hidden">
            {capturedImage && (
              <img
                src={capturedImage}
                className="absolute inset-0 w-full h-full object-contain"
                alt="Captured"
                id="captured-result-image"
              />
            )}

            {/* Bounding boxes on captured image */}
            <div className="absolute inset-0 pointer-events-none">
              {detectedObjects.map((obj, i) => {
                const img = document.getElementById('captured-result-image') as HTMLImageElement;
                const container = img?.parentElement;
                if (!img || !container) return null;

                const frameW = lastResponse?.frameWidth || img.naturalWidth || 640;
                const frameH = lastResponse?.frameHeight || img.naturalHeight || 480;
                const cw = container.clientWidth;
                const ch = container.clientHeight;

                const renderBox = bboxToRenderBox(obj.geometry.bbox, frameW, frameH, cw, ch, 'contain');
                const color = COLORS[i % COLORS.length];
                const isSelected = selectedBricks.has(obj.detectionId);

                // Log individual box data for review
                if (i === 0) {
                  console.log('[Scanner] 🔍 Results Phase Render:', { 
                    total: detectedObjects.length, 
                    selected: selectedBricks.size,
                    frame: { w: frameW, h: frameH },
                    container: { w: cw, h: ch }
                  });
                }

                return (
                  <div key={obj.detectionId || i}>
                    <div
                      className="absolute border-2 rounded-md"
                      style={{
                        top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`,
                        borderColor: isSelected ? color : `${color}50`,
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    />
                    <div
                      className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border flex flex-col gap-0.5"
                      style={{ borderColor: color }}
                    >
                      <div className="flex items-center gap-1.5 px-1 uppercase">
                        <span className="text-orange-400">{Math.round(obj.prediction.identityConfidence * 100)}%</span>
                        <span className="opacity-50">•</span>
                        <span>
                          {brickDetectionService.generationFallbackLabel(obj)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Sheet */}
          <div className="flex-[4] bg-slate-900 border-t border-white/10 rounded-t-[24px] -mt-4 relative z-10 flex flex-col overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mt-3 mb-3 flex-shrink-0" />

            {saveSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Saved to Collection!</h2>
                <p className="text-slate-400 text-sm mt-1">Your bricks have been catalogued</p>
              </div>
            ) : (
              <>
                <div className="px-5 mb-3 flex-shrink-0 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {detectedObjects.length} Brick{detectedObjects.length !== 1 ? 's' : ''} Found
                    </h2>
                    <p className="text-slate-400 text-xs">Tap to select • Delete incorrect detections</p>
                  </div>
                  <button
                    onClick={() => setPhase('scanning')}
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                {/* Brick List */}
                <div className="flex-1 overflow-y-auto px-5 space-y-2">
                  {detectedObjects.map((obj, i) => {
                    const isSelected = selectedBricks.has(obj.detectionId);
                    const pred = obj.prediction;
                    const partNum = pred.brickPartNum && pred.brickPartNum !== 'Unknown' ? pred.brickPartNum : '3001';
                    const drawingImageUrl = `https://cdn.rebrickable.com/media/parts/elements/${partNum}.jpg`;

                    return (
                      <div
                        key={obj.detectionId || i}
                        onClick={() => {
                          const s = new Set(selectedBricks);
                          if (isSelected) s.delete(obj.detectionId);
                          else s.add(obj.detectionId);
                          setSelectedBricks(s);
                        }}
                        className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10'
                          }`}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 flex items-center">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-slate-800/50 border-slate-600'
                            }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {/* Brick Image */}
                        <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg border border-white/10 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={drawingImageUrl}
                            alt={pred.brickName}
                            onError={(e) => { e.currentTarget.src = `https://cdn.rebrickable.com/media/parts/ldraw/14/3001.png`; }}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <p className="font-bold text-sm text-white truncate">
                               {brickDetectionService.generationFallbackLabel(obj)}
                            </p>
                          </div>
                          {partNum && partNum !== 'Unknown' && (
                            <p className="text-[11px] text-slate-400 ml-4">#{partNum}</p>
                          )}
                          <p className="text-[10px] text-slate-500 ml-4 mb-2">
                            {pred.identityConfidence ? `${(pred.identityConfidence * 100).toFixed(0)}%` : '?'} confidence
                          </p>
                          {/* Confidence Bar */}
                          <div className="ml-4 w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                (pred.identityConfidence || 0) > 0.8 ? 'bg-green-500' : 
                                (pred.identityConfidence || 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${(pred.identityConfidence || 0) * 100}%` }} 
                            />
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletedBrickIdsRef.current.push(obj.detectionId);
                            setDetectedObjects(prev => prev.filter(d => d.detectionId !== obj.detectionId));
                            setSelectedBricks(prev => { const s = new Set(prev); s.delete(obj.detectionId); return s; });
                          }}
                          className="flex-shrink-0 w-8 h-8 bg-red-500/15 hover:bg-red-500/30 rounded-lg flex items-center justify-center self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Since we auto-save, we don't need the Add button anymore, but we can provide a Close option */}
                <div className="px-5 py-4 flex gap-3 flex-shrink-0 safe-area-bottom border-t border-white/5">
                  <button
                    onClick={() => {
                      setDetectedObjects([]);
                      setCapturedImage(null);
                      setPhase('scanning');
                    }}
                    className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleSaveSelected}
                    disabled={selectedBricks.size === 0 || isProcessing}
                    className="flex-[2] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-700 disabled:shadow-none active:scale-95 transition-all"
                  >
                    Add {selectedBricks.size} Brick{selectedBricks.size !== 1 ? 's' : ''} to Collection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-bold">Analyzing...</p>
          </div>
        </div>
      )}
    </div>
  );
};
