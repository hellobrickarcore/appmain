import { detectBricks, toDetectionOverlay, brickDetectionService } from '../services/brickDetectionService';
import { colorService } from '../services/colorService';
import { xpHelpers } from '../services/xpService';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { X, Zap, CheckCircle2, RefreshCw, Bug, Activity, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { DetectionOverlay } from '../types/detection';
import { DetectionOverlayLayer } from '../components/DetectionOverlayLayer';
import { PreviewLayout, bboxToRenderBox, calculateIOU } from '../utils/coordinateMapping';
import { saveCollectionToSupabase } from '../services/trainingDataService';
import { analytics } from '../services/analyticsService';

interface ScannerScreenProps {
  onNavigate: (screen: any) => void;
  challenge?: any;
  onPhaseChange?: (phase: string) => void;
}

const DebugMetric: React.FC<{ label: string; value: string | number; sub?: string; drop?: number; color?: string }> = ({ label, value, sub, drop, color }) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="text-slate-400 font-medium">{label}</span>
    <div className="flex items-center gap-1.5 leading-none">
      {drop !== undefined && drop > 0 && (
        <span className="text-[8px] text-red-500/80 font-bold">-{drop}</span>
      )}
      <span className={`font-black font-mono ${color || 'text-white'}`}>{value}</span>
      {sub && <span className="text-[8px] text-slate-500 ml-1">{sub}</span>}
    </div>
  </div>
);

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, challenge, onPhaseChange }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'warmup' | 'preview' | 'scanning' | 'results'>('warmup');
  const sessionId = useMemo(() => `session_${Math.random().toString(36).substr(2, 9)}`, []);
  const frameIndexRef = useRef(0);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastInferenceRef = useRef<number>(Date.now());
  const [inferenceStuck, setInferenceStuck] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef(false);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const smoothedOverlaysRef = useRef<Map<string, DetectionOverlay>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());

  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [overlays, setOverlays] = useState<DetectionOverlay[]>([]);
  const [detectedBricks, setDetectedBricks] = useState<any[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isScanningHolistically, setIsScanningHolistically] = useState(false);
  const [holisticBricks, setHolisticBricks] = useState<any[]>([]);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeSuccessData, setChallengeSuccessData] = useState<any>(null);
  const [debugStats, setDebugStats] = useState({
    raw: 0,
    validGeo: 0,
    afterNms: 0,
    final: 0,
    overlaysMapped: 0,
    overlaysRendered: 0,
    colorEstimates: 0,
    dimEstimates: 0,
    identityEstimates: 0,
    inferenceMs: 0,
    frameSize: '0x0',
    fps: 0
  });

  const lastFrameTime = useRef<number>(Date.now());
  const [isManualAdding, setIsManualAdding] = useState(false);
  const [editingBrickId, setEditingBrickId] = useState<string | null>(null);
  const [previewLayout, setPreviewLayout] = useState<PreviewLayout>({
    sourceWidth: 640,
    sourceHeight: 480,
    previewX: 0,
    previewY: 0,
    previewWidth: 0,
    previewHeight: 0
  });

  // ─── Camera Setup ───────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    const stopCamera = () => {
      console.log("[Scanner] Stopping camera tracks...");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => {
          t.stop();
          console.log(`[Scanner] Stopped track: ${t.label}`);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      console.log("[Scanner] Starting camera...");
      try {
        // Stop any existing stream first
        stopCamera();

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Use onloadedmetadata to ensure video is ready
          videoRef.current.onloadedmetadata = async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play();
                console.log("[Scanner] Video playing, resolution:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
                setHasPermission(true);
              }
            } catch (playErr) {
              console.error("[Scanner] Video play error:", playErr);
            }
          };
        }
      } catch (err: any) {
        console.error("[Scanner] Camera error:", err);
        setHasPermission(false);
      }
    };

    const warmup = async () => {
      console.log("[Scanner] Warming up detector...");
      try {
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 64; dummyCanvas.height = 64;
        await detectBricks(dummyCanvas, { sessionId: 'warmup' });
        if (active) setPhase('preview');
      } catch (e) {
        console.error("[Scanner] Warmup failed:", e);
        if (active) setPhase('preview');
      }
    };

    startCamera();
    warmup();

    // ─── Visibility Listener ───
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[Scanner] App hidden, stopping camera...");
        stopCamera();
      } else {
        console.log("[Scanner] App visible, restarting camera...");
        startCamera();
      }
    };
    // Stuck Watchdog
    const watchdogInterval = setInterval(() => {
      if (phase === 'scanning' && !document.hidden) {
        const timeSinceLastInf = Date.now() - lastInferenceRef.current;
        if (timeSinceLastInf > 10000) { // 10 seconds with no inference
          console.warn("[Scanner] Watchdog detected stuck inference loop!");
          setInferenceStuck(true);
        } else {
          setInferenceStuck(false);
        }
      }
    }, 5000);

    return () => {
      active = false;
      console.log("[Scanner] Unmounting, cleaning up...");
      clearInterval(watchdogInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera();
    };
  }, [phase]); // Re-run watchdog if phase changes to scanning

  useEffect(() => {
    if (hasPermission && (phase === 'preview' || phase === 'warmup')) {
      if (phase !== 'warmup') setPhase('scanning');
      analytics.track('scan_started');
    }
  }, [hasPermission]);

  // ─── Detection Loop ────────────────
  useEffect(() => {
    if (phase !== 'scanning' || !hasPermission) return;

    let intervalId: any;

    const detectLoop = async () => {
      if (isDetectingRef.current) return;
      if (phase !== 'scanning' || !videoRef.current) return;

      const video = videoRef.current;
      if (video.readyState < 2 && video.videoWidth === 0) return;

      try {
        isDetectingRef.current = true;
        const frameTime = Date.now();
        const fps = Math.round(1000 / (frameTime - lastFrameTime.current));
        lastFrameTime.current = frameTime;

        const response = await brickDetectionService.scanFrame(video, {
          sessionId,
          frameIndex: frameIndexRef.current++,
          debugMode: true
        });

        lastInferenceRef.current = Date.now();

        if (phase === 'scanning') {
          const trackedOverlays = (response.trackedObjects || []).map(toDetectionOverlay).filter((o): o is DetectionOverlay => o !== null);
          const rawOverlays = response.detections.map(toDetectionOverlay).filter((o): o is DetectionOverlay => o !== null);

          // deduplication
          const currentBatch = [...trackedOverlays];
          const combinedForHolistic = [...trackedOverlays, ...rawOverlays];

          // 2. HOLISTIC ACCUMULATION (Phase 9)
          if (isScanningHolistically) {
            setHolisticBricks(prev => {
              const next = [...prev];
              combinedForHolistic.forEach(vo => {
                const exists = next.some(existing =>
                  Math.abs((existing.x || 0) - (vo.x || 0)) < 20 &&
                  Math.abs((existing.y || 0) - (vo.y || 0)) < 20 &&
                  (existing.compactLabel || existing.displayText) === (vo.compactLabel || vo.displayText)
                );
                if (!exists) {
                  next.push({
                    ...vo,
                    id: `holistic_${Date.now()}_${Math.random()}`,
                    selected: true
                  });
                }
              });
              return next;
            });
          }

          rawOverlays.forEach(ro => {
            const isDuplicated = currentBatch.some(mo => {
              if (mo.id === ro.id) return true;
              if (mo.trackId && ro.trackId && mo.trackId === ro.trackId) return true;
              if (!mo.box || !ro.box) return false;
              return calculateIOU(mo.box, ro.box) > 0.6;
            });
            if (!isDuplicated) currentBatch.push(ro);
          });

          // Challenge Logic
          if (challenge && !challengeSuccess) {
            const targetFound = combinedForHolistic.find(ov => {
              const label = (ov.compactLabel || ov.displayText || '').toLowerCase();
              const target = challenge.target.toLowerCase();
              // Lower threshold for puzzles to 0.4 to ensure it works in various conditions
              const puzzleThreshold = 0.4;
              if (challenge.type === 'SHAPE') {
                return label.includes(target) && (ov.finalConfidence || 0) > puzzleThreshold;
              } else {
                return ov.colorName?.toLowerCase() === target && (ov.finalConfidence || 0) > puzzleThreshold;
              }
            });

            if (targetFound) {
              setChallengeSuccess(true);
              setChallengeSuccessData(targetFound);
              confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

              // Sync XP and Gems
              xpHelpers.challengeCompleted(challenge.id, 'easy').catch(console.error);

              setTimeout(() => onNavigate(Screen.PUZZLES), 3000);
            }
          }

          const now = Date.now();
          const nextOverlays: DetectionOverlay[] = [];
          const alpha = 0.4;

          currentBatch.forEach(ov => {
            const trackKey = ov.trackId || ov.id;
            const prev = smoothedOverlaysRef.current.get(trackKey);

            if (prev && prev.box && ov.box) {
              ov.box = {
                xMin: prev.box.xMin * (1 - alpha) + ov.box.xMin * alpha,
                yMin: prev.box.yMin * (1 - alpha) + ov.box.yMin * alpha,
                xMax: prev.box.xMax * (1 - alpha) + ov.box.xMax * alpha,
                yMax: prev.box.yMax * (1 - alpha) + ov.box.yMax * alpha,
              };
            }

            smoothedOverlaysRef.current.set(trackKey, ov);
            lastSeenRef.current.set(trackKey, now);
            nextOverlays.push(ov);
          });

          smoothedOverlaysRef.current.forEach((prevOv, key) => {
            const lastSeen = lastSeenRef.current.get(key) || 0;
            const age = now - lastSeen;
            // Reduce grace period from 1000ms to 400ms to handle jerky movement better
            if (age > 0 && age < 400 && !nextOverlays.find(o => (o.trackId || o.id) === key)) {
              nextOverlays.push({ ...prevOv, labelDisplayStatus: 'hidden' as any, isStable: false });
            } else if (age >= 400) {
              smoothedOverlaysRef.current.delete(key);
              lastSeenRef.current.delete(key);
            }
          });

          const validOverlays = nextOverlays.filter(ov => {
            if (!ov.box) return false;
            if (ov.geometryConfidence < 0.25 && !ov.isStable) return false;
            const isInvalid = ov.box.yMin >= response.frameHeight * 0.95 ||
              ov.box.yMax <= response.frameHeight * 0.05 ||
              ov.box.xMin >= response.frameWidth * 0.95;
            if (ov.labelDisplayStatus === 'hidden' && !ov.isStable) return false;
            return !isInvalid;
          });

          setOverlays(validOverlays);

          if (overlayContainerRef.current) {
            setPreviewLayout({
              sourceWidth: response.frameWidth,
              sourceHeight: response.frameHeight,
              previewX: 0, previewY: 0,
              previewWidth: overlayContainerRef.current.clientWidth,
              previewHeight: overlayContainerRef.current.clientHeight
            });
          }

          setDebugStats({
            raw: response.debug?.raw || 0,
            validGeo: response.debug?.valid_geo || 0,
            afterNms: response.debug?.after_nms || 0,
            final: response.debug?.final || 0,
            overlaysMapped: validOverlays.length,
            overlaysRendered: validOverlays.length,
            colorEstimates: response.debug?.color_estimates || 0,
            dimEstimates: response.debug?.dim_estimates || 0,
            identityEstimates: response.debug?.identity_estimates || 0,
            inferenceMs: response.inferenceMs || 0,
            frameSize: `${response.frameWidth}x${response.frameHeight}`,
            fps: fps
          });
        }
      } catch (err) {
        console.error('DetectLoop error:', err);
      } finally {
        isDetectingRef.current = false;
      }
    };

    intervalId = setInterval(detectLoop, 300);
    return () => clearInterval(intervalId);
  }, [phase, hasPermission, challenge, isScanningHolistically]);

  const liveBricksRef = useRef<any[]>([]);
  useEffect(() => {
    liveBricksRef.current = overlays
      .filter(o => o.isStable || o.geometryConfidence > 0.20)
      .map(o => ({
        id: o.id,
        name: o.compactLabel || 'Unknown Brick',
        color: o.colorName || 'Unknown',
        family: o.brickFamily || 'Brick',
        dimensions: o.dimensionsLabel || '',
        confidence: o.finalConfidence || o.identityConfidence,
        finalConfidence: o.finalConfidence,
        identityConfidence: o.identityConfidence,
        geometryConfidence: o.geometryConfidence,
        colorConfidence: o.colorConfidence,
        dimensionConfidence: o.dimensionConfidence,
        selected: true,
        box: o.box,
        displayText: o.compactLabel || 'Unknown Brick',
        compactLabel: o.compactLabel,
        colorName: o.colorName,
        sourceRes: { width: previewLayout.sourceWidth, height: previewLayout.sourceHeight },
        labelDisplayStatus: o.labelDisplayStatus
      }));
  }, [overlays, previewLayout]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      isDetectingRef.current = false;

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));

      const bricksArr = isScanningHolistically ? holisticBricks : liveBricksRef.current;

      const bricksWithCrops = await Promise.all(bricksArr.map(async (brick: any) => {
        if (!brick.box) return brick;

        const cropCanvas = document.createElement('canvas');
        const box = brick.box;
        const width = box.xMax - box.xMin;
        const height = box.yMax - box.yMin;
        const padding = Math.max(width, height) * 0.15;
        const sx = Math.max(0, box.xMin - padding);
        const sy = Math.max(0, box.yMin - padding);
        const sw = Math.min(canvas.width - sx, width + padding * 2);
        const sh = Math.min(canvas.height - sy, height + padding * 2);

        cropCanvas.width = 120; cropCanvas.height = 120;
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.fillStyle = '#0f172a';
          cropCtx.fillRect(0, 0, 120, 120);
          cropCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 120, 120);
        }

        if (ctx) {
          const colorResult = colorService.estimateColor(ctx, sx, sy, sw, sh);
          return {
            ...brick,
            thumbnail: cropCanvas.toDataURL('image/jpeg', 0.8),
            color: colorResult.name,
            color_hex: colorResult.hex,
            displayText: `${colorResult.name} ${brick.name || 'Brick'}`
          };
        }
        return brick;
      }));

      setDetectedBricks(bricksWithCrops);
      setPhase('results');
      setIsScanningHolistically(false);
    } catch (err) {
      console.error('Capture failed:', err);
      setIsScanningHolistically(false);
      isDetectingRef.current = true;
    } finally {
      setIsProcessing(false);
    }
  }, [isScanningHolistically, holisticBricks]);

  const deleteBrick = (id: string) => setDetectedBricks(prev => prev.filter(b => b.id !== id));
  const updateBrick = (id: string, updates: any) => setDetectedBricks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  const toggleSelection = (id: string) => setDetectedBricks(prev => prev.map(b => b.id === id ? { ...b, selected: !b.selected } : b));

  const handleSaveSelected = async () => {
    const bricksToSave = detectedBricks.filter(b => b.selected);
    if (bricksToSave.length === 0) return;
    setIsProcessing(true);
    try {
      const userId = localStorage.getItem('hellobrick_userId') || `user_${Date.now()}`;
      const stored = localStorage.getItem('hellobrick_collection');
      let existingBricks = [];
      if (stored) {
        try { existingBricks = JSON.parse(stored).bricks || []; } catch (e) { }
      }

      const updatedCollection = [...existingBricks];
      bricksToSave.forEach(newBrick => {
        const matchIdx = updatedCollection.findIndex(ex => ex.name === newBrick.name && ex.color === newBrick.color);
        if (matchIdx >= 0) {
          updatedCollection[matchIdx].count += 1;
        } else {
          updatedCollection.push({
            id: `brick_${Date.now()}_${Math.random()}`,
            name: newBrick.name || 'Unknown Brick',
            category: newBrick.family || 'Bricks',
            count: 1,
            image: newBrick.thumbnail || 'https://images.brickset.com/parts/design1.jpg',
            color: newBrick.color || 'Unknown',
            color_hex: newBrick.color_hex,
            dimensions: newBrick.dimensions,
            confidence: newBrick.finalConfidence || 0.85
          });
        }
      });

      localStorage.setItem('hellobrick_collection', JSON.stringify({ updatedAt: new Date().toISOString(), bricks: updatedCollection }));
      window.dispatchEvent(new Event('hellobrick:collection-updated'));
      saveCollectionToSupabase(userId, updatedCollection).catch(() => { });

      // Phase 15: Reward XP for saving bricks
      xpHelpers.scanDetection(bricksToSave.length, bricksToSave.filter(b => b.isNew).length).catch(console.error);

      setSaveSuccess(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => onNavigate(Screen.COLLECTION), 1500);
    } catch (err) {
      setSaveSuccess(true);
      setTimeout(() => onNavigate(Screen.HOME), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col font-sans h-[100dvh]">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Bar */}
      <div className="absolute left-0 right-0 px-6 flex justify-between items-center z-50 top-[max(env(safe-area-inset-top),16px)]">
        <button
          onClick={() => {
            // If in a challenge, go back to puzzles, otherwise home
            onNavigate(challenge ? Screen.PUZZLES : Screen.HOME);
          }}
          className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <button onClick={() => setDebugMode(!debugMode)} className={`w-10 h-10 ${debugMode ? 'bg-orange-500' : 'bg-black/40'} backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20`}>
          <Bug className="w-5 h-5" />
        </button>
      </div>

      {inferenceStuck && (
        <div className="absolute top-20 left-0 right-0 z-[60] px-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-orange-600/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <p className="text-white text-xs font-bold leading-tight">Detector hanging? Try resetting.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {(phase === 'preview' || phase === 'scanning' || phase === 'warmup') && (
        <div className="relative flex-1 bg-black overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div ref={overlayContainerRef} className="absolute inset-0 pointer-events-none z-20">
            <DetectionOverlayLayer overlays={overlays} layout={previewLayout} debugMode={debugMode} />
          </div>

          {phase === 'warmup' && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initializing AI...</p>
              </div>
            </div>
          )}

          {phase === 'scanning' && overlays.length === 0 && !isScanningHolistically && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white font-bold text-sm">
                Scanning for bricks...
              </div>
            </div>
          )}

          <div className="absolute bottom-12 left-0 right-0 z-40 px-8 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setIsScanningHolistically(!isScanningHolistically)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center pointer-events-auto transition-all ${isScanningHolistically ? 'bg-orange-500 scale-110 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
            >
              <Activity className={`w-6 h-6 ${isScanningHolistically ? 'text-white animate-pulse' : 'text-slate-400'}`} />
            </button>

            <div className="relative pointer-events-auto">
              {isScanningHolistically && (
                <svg className="absolute -inset-2 w-[100px] h-[100px] -rotate-90 pointer-events-none">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.1" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#F97316" strokeWidth="4" strokeDasharray={289} strokeDashoffset={289 - (289 * (holisticBricks.length % 100)) / 100} className="transition-all duration-300" />
                </svg>
              )}
              <button
                onClick={handleCapture}
                disabled={isProcessing}
                className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90"
              >
                <div className={`w-16 h-16 rounded-full transition-all ${isScanningHolistically ? 'bg-orange-500' : 'bg-white'}`} />
              </button>
            </div>
            <div className="w-14 h-14" />
          </div>

          {isScanningHolistically && (
            <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-40 bg-orange-500 px-4 py-1 rounded-full animate-bounce shadow-lg">
              <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Collecting: {holisticBricks.length} Bricks</span>
            </div>
          )}

          {challenge && !challengeSuccess && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 w-full px-6 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-orange-500/50 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center animate-pulse"><Play className="w-5 h-5 text-white fill-white" /></div>
                  <div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Puzzle: {challenge.name}</p>
                    <p className="text-white font-bold">Find: <span className="text-orange-400">{challenge.target}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="relative flex-[2] bg-black overflow-hidden">
            {capturedImage && <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />}
            <div className="absolute inset-0 pointer-events-none">
              {detectedBricks.map((b, i) => {
                const renderBox = bboxToRenderBox(b.box, b.sourceRes?.width || 640, b.sourceRes?.height || 480, window.innerWidth, window.innerHeight * 0.4, 'contain');
                return (
                  <div key={b.id || i} className="absolute border-2 border-orange-500/50 rounded-sm" style={{ top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%` }}>
                    <div className="absolute -top-6 left-0 px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase whitespace-nowrap">{b.compactLabel || b.displayText}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-[3] bg-slate-900 rounded-t-3xl p-6 flex flex-col overflow-hidden">
            <h2 className="text-xl font-black text-white mb-6">{detectedBricks.length} Bricks Found</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
              {detectedBricks.map(b => (
                <div key={b.id} onClick={() => toggleSelection(b.id)} className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${b.selected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-800 flex-shrink-0">
                      {b.thumbnail && <img src={b.thumbnail} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-base leading-tight truncate">{b.displayText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-0.5 bg-orange-500 rounded text-[9px] font-black text-white uppercase tracking-tighter">
                          {Math.round((b.finalConfidence || 0.85) * 100)}% Confidence
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold">{b.family || 'Brick'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Geometry</span>
                      <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(b.geometryConfidence || 0) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Color</span>
                      <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${(b.colorConfidence || 0) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Dimensions</span>
                      <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${(b.dimensionConfidence || 0) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-32" />
            </div>
            <div className="pt-6 pb-28 border-t border-white/5 bg-slate-900 px-6 -mx-6 mb-[-24px]">
              {saveSuccess ? (
                <div className="py-4 text-center bg-green-500/20 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-5 h-5" /> Saved!
                </div>
              ) : (
                <button onClick={handleSaveSelected} disabled={isProcessing} className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3">
                  {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-white" /> Save {detectedBricks.filter(b => b.selected).length} Bricks</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {challengeSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-green-500 rounded-[40px] p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white uppercase italic">Found it!</h2>
            <p className="text-green-400 font-bold">REWARD EARNED</p>
          </div>
        </div>
      )}
    </div>
  );
};
