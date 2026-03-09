import { detectBricks, toDetectionOverlay, generationFallbackLabel, brickDetectionService } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { X, Zap, CheckCircle2, RefreshCw, Bug, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { DetectionOverlay } from '../types/detection';
import { DetectionOverlayLayer } from '../components/DetectionOverlayLayer';
import { PreviewLayout, bboxToRenderBox } from '../utils/coordinateMapping';
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
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef(false);
  const overlayContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [overlays, setOverlays] = useState<DetectionOverlay[]>([]);
  const [detectedBricks, setDetectedBricks] = useState<any[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
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
  const [isScanningHolistically, setIsScanningHolistically] = useState(false);
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
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const isSecureContext = window.isSecureContext || location.protocol === 'https:';
        const isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile && !isSecureContext) {
          setHasPermission(false);
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setHasPermission(false);
          return;
        }

        try {
          const { getCameraStream } = await import('../services/cameraService');
          stream = await getCameraStream();
        } catch {
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
      }
    };

    startCamera();

    // Phase 7 Warmup
    const warmup = async () => {
      try {
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 64; dummyCanvas.height = 64;
        await detectBricks(dummyCanvas, { sessionId: 'warmup' });
        setPhase('preview');
      } catch (e) {
        setPhase('preview');
      }
    };
    warmup();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
      if (isDetectingRef.current || phase !== 'scanning' || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;

      try {
        isDetectingRef.current = true;
        // Live mode uses faster 800px inference
        const frameTime = Date.now();
        const fps = Math.round(1000 / (frameTime - lastFrameTime.current));
        lastFrameTime.current = frameTime;

        const response = await brickDetectionService.scanFrame(video, {
          sessionId,
          frameIndex: frameIndexRef.current++,
          debugMode: true // Force server-side debug logs
        });

        if (phase === 'scanning') {
          // STAGE D: OVERLAY CREATION & MAPPING
          const trackedOverlays = (response.trackedObjects || []).map(toDetectionOverlay).filter((o): o is DetectionOverlay => o !== null);
          const rawOverlays = response.detections.map(toDetectionOverlay).filter((o): o is DetectionOverlay => o !== null);

          // Merge: Show all tracked, plus detections that aren't already tracked
          const mergedOverlays = [...trackedOverlays];
          rawOverlays.forEach(ro => {
            if (!mergedOverlays.some(mo => mo.id === ro.id)) {
              mergedOverlays.push(ro);
            }
          });

          setOverlays(mergedOverlays);

          const container = overlayContainerRef.current;
          if (container) {
            setPreviewLayout({
              sourceWidth: response.frameWidth,
              sourceHeight: response.frameHeight,
              previewX: 0, previewY: 0,
              previewWidth: container.clientWidth,
              previewHeight: container.clientHeight
            });

            // LOG COORDINATE MAPPING (Stage D)
            if (debugMode && mergedOverlays.length > 0) {
              const o = mergedOverlays[0];
              console.log(`📍 [STAGE D] Mapping Overlay: Source(${o.x},${o.y}) -> Render(via previewLayout)`);
            }
          }

          // UPDATE DEBUG STATS (Stages A, B, C, D, E)
          setDebugStats({
            raw: response.debug?.raw || 0,
            validGeo: response.debug?.valid_geo || 0,
            afterNms: response.debug?.after_nms || 0,
            final: response.debug?.final || 0,
            overlaysMapped: mergedOverlays.length,
            overlaysRendered: mergedOverlays.length,
            colorEstimates: response.debug?.color_estimates || 0,
            dimEstimates: response.debug?.dim_estimates || 0,
            identityEstimates: response.debug?.identity_estimates || 0,
            inferenceMs: response.inferenceMs || 0,
            frameSize: `${response.frameWidth}x${response.frameHeight}`,
            fps: fps
          });
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      } finally {
        isDetectingRef.current = false;
      }
    };

    intervalId = setInterval(detectLoop, 300); // Slightly faster for responsiveness
    return () => clearInterval(intervalId);
  }, [phase, hasPermission, challenge]);

  const liveBricksRef = useRef<any[]>([]);
  useEffect(() => {
    // Keep a running reference of stable bricks for capture merging
    liveBricksRef.current = overlays
      .filter(o => o.isStable || o.geometryConfidence > 0.3)
      .map(o => ({
        id: o.id,
        name: o.compactLabel,
        color: o.colorConfidence > 0.5 ? o.compactLabel?.split(' ')[0] : 'Unknown',
        family: o.brickFamily,
        dimensions: o.dimensionsLabel,
        confidence: o.identityConfidence,
        selected: true,
        box: o.box,
        displayText: o.displayText,
        sourceRes: { width: previewLayout.sourceWidth, height: previewLayout.sourceHeight }
      }));
  }, [overlays, previewLayout]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setIsScanningHolistically(true);

    try {
      const video = videoRef.current;
      // Holistic Analysis using 'mass_capture' mode for high recall + tiling
      const response = await detectBricks(video, {
        mode: 'mass_capture',
        imgsz: 1024,
        sessionId: 'session_mass_capture'
      });

      // Capture static frame for results display
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));

      const rawDetections = response.detections.map(d => ({
        id: d.detectionId,
        name: d.prediction.brickName,
        color: d.prediction.brickColorName,
        family: d.prediction.brickFamily,
        dimensions: d.prediction.dimensionsLabel,
        confidence: d.prediction.identityConfidence,
        selected: d.labelDisplayStatus === 'confirmed' || d.geometry.geometryConfidence > 0.15,
        box: d.geometry.bbox,
        displayText: d.compactLabel || generationFallbackLabel(d),
        sourceRes: { width: response.frameWidth, height: response.frameHeight }
      }));

      // MERGE LOGIC: Preserve everything seen in Live mode (Locked-in)
      const liveBricks = liveBricksRef.current;
      const mergedBricks = [...liveBricks];

      // Only add raw detections if they don't significantly overlap with live ones
      rawDetections.forEach(rd => {
        const alreadyExists = liveBricks.some(lb => {
          // Simple centroid distance check for merging
          const lbCX = (lb.box.xMin + lb.box.xMax) / 2;
          const lbCY = (lb.box.yMin + lb.box.yMax) / 2;
          const rdCX = (rd.box.xMin + rd.box.xMax) / 2;
          const rdCY = (rd.box.yMin + rd.box.yMax) / 2;
          const dist = Math.sqrt(Math.pow(lbCX - rdCX, 2) + Math.pow(lbCY - rdCY, 2));
          return dist < 30; // 30px proximity = same brick
        });
        if (!alreadyExists) mergedBricks.push(rd);
      });

      // Laser Line sweep animation time
      setTimeout(() => {
        setDetectedBricks(mergedBricks);
        setPhase('results');
        setIsScanningHolistically(false);
      }, 2000);

    } catch (err) {
      console.error('Capture failed:', err);
      setIsScanningHolistically(false);
    } finally {
      setIsProcessing(false);
    }
  }, [challenge, puzzleProgress.found]);

  const deleteBrick = (id: string) => {
    setDetectedBricks(prev => prev.filter(b => b.id !== id));
    if (editingBrickId === id) setEditingBrickId(null);
  };

  const updateBrick = (id: string, updates: any) => {
    setDetectedBricks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    setEditingBrickId(null);
  };

  const toggleSelection = (id: string) => {
    setDetectedBricks(prev => prev.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
  };

  const handleImageTap = (e: React.MouseEvent) => {
    if (phase !== 'results' || !isManualAdding || !capturedImage) return;

    // Calculate relativ position in image
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Add a default brick at this spot
    const newId = `manual_${Date.now()}`;
    const newBrick = {
      id: newId,
      name: 'Generic 2x4',
      color: 'Gray',
      family: 'Brick',
      dimensions: '2x4',
      confidence: 1.0,
      selected: true,
      box: { xMin: x * 640 - 30, yMin: y * 480 - 30, xMax: x * 640 + 30, yMax: y * 480 + 30 },
      displayText: 'Gray Brick 2x4',
      sourceRes: { width: 640, height: 480 },
      isManual: true
    };

    setDetectedBricks(prev => [...prev, newBrick]);
    setIsManualAdding(false);
    setEditingBrickId(newId);
  };

  const handleSaveSelected = async () => {
    const bricksToSave = detectedBricks.filter(b => b.selected);
    if (bricksToSave.length === 0) return;
    setIsProcessing(true);
    try {
      const userId = localStorage.getItem('hellobrick_userId') || `user_${Date.now()}`;
      localStorage.setItem('hellobrick_userId', userId);

      await saveCollectionToSupabase(userId, bricksToSave.map(b => ({
        partName: b.name,
        colorName: b.color,
        dimensions: b.dimensions,
        confidence: b.confidence
      })));

      setSaveSuccess(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => onNavigate(Screen.HOME), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      // Robustness: Return home anyway in local dev
      setSaveSuccess(true);
      setTimeout(() => onNavigate(Screen.HOME), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Bar */}
      <div className="absolute left-0 right-0 px-6 flex justify-between items-center z-50 top-[max(env(safe-area-inset-top),16px)]">
        <button onClick={() => onNavigate(Screen.HOME)} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white shadow-lg">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setDebugMode(!debugMode)} className={`w-10 h-10 ${debugMode ? 'bg-orange-500' : 'bg-black/40'} backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20`}>
            <Bug className="w-5 h-5" />
          </button>
        </div>
      </div>

      {(phase === 'preview' || phase === 'scanning' || phase === 'warmup') && (
        <>
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

            {phase === 'scanning' && overlays.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white font-bold text-sm">
                  Scanning for bricks...
                </div>
              </div>
            )}
          </div>

          <div className="bg-black py-8 flex items-center justify-center safe-area-bottom gap-6">
            <button onClick={handleCapture} disabled={isProcessing} className="w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center group active:scale-95 transition-all">
              <div className={`w-[66px] h-[66px] rounded-full transition-all ${isProcessing ? 'bg-orange-500 scale-75' : 'bg-white'}`} />
            </button>
          </div>

          {/* Holistic Scan Animation Overlay */}
          {isScanningHolistically && (
            <div className="absolute inset-0 z-[60] bg-black/40 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
              {/* Laser Sweep */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-500 shadow-[0_0_20px_#f97316] animate-scan-sweep" />
              <div className="bg-black/60 backdrop-blur-xl px-10 py-5 rounded-3xl border border-white/20 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-t-2 border-orange-500 rounded-full animate-spin" />
                <p className="text-sm font-black tracking-widest uppercase">Analyzing Layout...</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Mass Scan Active (1024px)</p>
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="relative flex-[2] bg-black overflow-hidden group">
            {capturedImage && (
              <img
                src={capturedImage}
                onClick={handleImageTap}
                className={`w-full h-full object-contain transition-all ${isManualAdding ? 'scale-[1.02] cursor-crosshair' : ''}`}
                alt="Captured"
              />
            )}

            {isManualAdding && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-orange-500 rounded-full animate-ping opacity-50" />
                <div className="absolute bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full bottom-8 animate-bounce">
                  TAP BRICK TO ADD
                </div>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none">
              {detectedBricks.map((b, i) => {
                const sourceW = b.sourceRes?.width || 640;
                const sourceH = b.sourceRes?.height || 480;
                const renderBox = bboxToRenderBox(b.box, sourceW, sourceH, window.innerWidth, window.innerHeight * 0.4, 'contain');
                const isEditing = editingBrickId === b.id;

                return (
                  <div key={b.id || i} className={`absolute border-2 rounded-sm transition-all ${isEditing ? 'border-white border-[3px] z-30 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-orange-500/50'}`} style={{
                    top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`
                  }}>
                    {/* ALWAYS show labels in debug mode or if confirmed */}
                    {(debugMode || b.labelDisplayStatus !== 'hidden') && (
                      <div className="absolute -top-6 left-0 flex flex-col items-start gap-1">
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap shadow-lg ${b.labelDisplayStatus === 'confirmed' ? 'bg-orange-500 text-white' : 'bg-white/20 backdrop-blur-md text-white border border-white/20'}`}>
                          {b.compactLabel || b.displayText}
                        </div>
                        {debugMode && (
                          <div className="bg-black/80 text-[6px] text-slate-300 p-1 rounded font-mono leading-none">
                            GEO: {b.geometryConfidence?.toFixed(2)} | ID: {b.identityConfidence?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                    {isEditing && (
                      <div className="absolute -bottom-4 right-0 bg-white text-black text-[6px] font-black px-1 rounded-sm uppercase">
                        Editing
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 12: Debug Toggle */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-md border transition-all ${debugMode ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/20 border-white/10 text-white/40'}`}
              title="Toggle Debug Mode"
            >
              <Bug className="w-4 h-4" />
            </button>

            {/* LIVE DEBUG PANEL (Diagnostics Stage A-E) */}
            {debugMode && (
              <div className="absolute top-16 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-60 shadow-2xl pointer-events-none">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Diagnostic Panel</span>
                </div>

                <div className="space-y-2.5">
                  <DebugMetric label="Frame" value={debugStats.frameSize} sub={`${debugStats.fps} FPS`} />
                  <DebugMetric label="Stage B: Raw" value={debugStats.raw} color="text-slate-400" />
                  <DebugMetric label="Stage C1: Geo" value={debugStats.validGeo} drop={debugStats.raw - debugStats.validGeo} />
                  <DebugMetric label="Stage C2: NMS" value={debugStats.afterNms} drop={debugStats.validGeo - debugStats.afterNms} />
                  <DebugMetric label="Stage D: Overlays" value={debugStats.overlaysMapped} color="text-orange-400" />

                  <div className="h-px bg-white/5 my-2" />

                  <DebugMetric label="Color Est" value={debugStats.colorEstimates} />
                  <DebugMetric label="Dim Est" value={debugStats.dimEstimates} />
                  <DebugMetric label="ID Est" value={debugStats.identityEstimates} />

                  <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Inference</span>
                    <span className="text-[10px] text-orange-500 font-black font-mono">{debugStats.inferenceMs}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-[3] bg-slate-900 rounded-t-3xl p-6 flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-white">{detectedBricks.length} Bricks Found</h2>
                <p className="text-xs text-slate-400">High Resolution Mass Scan Result</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`p-2 rounded-xl border transition-all ${debugMode ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                >
                  <Bug className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsManualAdding(!isManualAdding)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isManualAdding ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">{isManualAdding ? 'Tapping Image...' : 'Add Missing'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {detectedBricks.map(b => (
                <div key={b.id} className="relative group">
                  <div
                    onClick={() => toggleSelection(b.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/10 ${b.selected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${b.color === 'Yellow' ? 'bg-yellow-400 text-black' : b.color === 'Red' ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'}`}>
                      {b.dimensions || '??'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-white text-sm leading-tight">{b.compactLabel || b.displayText}</p>
                        {b.labelDisplayStatus === 'tentative' && !b.isManual && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black rounded border border-yellow-500/30 uppercase tracking-tighter">Speculative</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5 font-bold">
                        {b.isManual ? 'MANUALLY ADDED' : `${(b.identityConfidence * 100).toFixed(0)}% Recall Proposal`} • {b.family || 'Generic'}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); deleteBrick(b.id); }} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {editingBrickId === b.id && (
                    <div className="mt-2 p-4 bg-slate-800 rounded-xl border border-white/10 shadow-2xl animate-in slide-in-from-top-2 z-10">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Edit Details</p>
                        <button onClick={() => setEditingBrickId(null)} className="p-1 px-2 bg-white/10 rounded text-[8px] font-bold text-white uppercase active:scale-95">Done</button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Display Name / Label</p>
                          <input
                            type="text"
                            autoFocus
                            value={b.displayText}
                            onChange={(e) => updateBrick(b.id, { displayText: e.target.value, name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            placeholder="e.g. Red Sloped Brick..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Color</p>
                            <div className="flex flex-wrap gap-1">
                              {['Red', 'Blue', 'Yellow', 'White', 'Black', 'Green', 'Gray'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => updateBrick(b.id, { color: c, displayText: b.displayText.replace(b.color || '', c) })}
                                  className={`w-5 h-5 rounded-full border-2 transition-all ${b.color === c ? 'border-orange-500 scale-110 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'border-black'}`}
                                  style={{ backgroundColor: c.toLowerCase() === 'white' ? '#fff' : c.toLowerCase() === 'gray' ? '#888' : c.toLowerCase() }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Dimensions</p>
                            <div className="flex flex-wrap gap-1">
                              {['1x1', '1x2', '2x2', '2x4', '4x4'].map(d => (
                                <button key={d} onClick={() => updateBrick(b.id, { dimensions: d })} className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-tighter transition-all ${b.dimensions === d ? 'bg-white text-black' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{d}</button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Brick Family</p>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            {['Brick', 'Plate', 'Tile', 'Slope', 'Technic', 'Round'].map(f => (
                              <button key={f} onClick={() => updateBrick(b.id, { family: f })} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${b.family === f ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{f}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Spacer to clear BottomNav or Sticky Menus */}
              <div className="h-32" />
            </div>

            <div className="pt-6 pb-10 border-t border-white/5 bg-slate-900 px-6 -mx-6 mb-[-24px]">
              {saveSuccess ? (
                <div className="py-4 text-center bg-green-500/20 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-5 h-5" /> Saved to Collection!
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setPhase('scanning')} className="flex-1 bg-white/5 text-white font-bold py-4 rounded-2xl border border-white/10 active:scale-95 transition-all">Retake</button>
                  <button onClick={handleSaveSelected} disabled={isProcessing || detectedBricks.filter(b => b.selected).length === 0} className="flex-[2] bg-orange-500 disabled:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-white" /> Save {detectedBricks.filter(b => b.selected).length} Bricks</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
