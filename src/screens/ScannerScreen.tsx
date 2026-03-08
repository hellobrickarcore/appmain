import { detectBricks, toDetectionOverlay, generationFallbackLabel } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Zap, CheckCircle2, RefreshCw, Bug } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { DetectionOverlay } from '../types/detection';
import { DetectionOverlayLayer } from '../components/DetectionOverlayLayer';
import { PreviewLayout, bboxToRenderBox } from '../utils/coordinateMapping';
import { saveCollectionToSupabase } from '../services/trainingDataService';
import { analytics } from '../services/analyticsService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  challenge?: any;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, challenge }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const [qualityAdvice, setQualityAdvice] = useState<string | null>(null);
  const [puzzleProgress, setPuzzleProgress] = useState({ found: false, count: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'scanning' | 'results' | 'warmup'>('warmup');
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
          setQualityAdvice('Camera requires HTTPS on mobile.');
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setHasPermission(false);
          setQualityAdvice('Camera API not supported in this browser.');
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
        setQualityAdvice(err.name === 'NotAllowedError' ? 'Camera permission denied.' : `Camera error: ${err.message}`);
      }
    };

    startCamera();

    // Phase 7 Warmup
    const warmup = async () => {
      try {
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 64; dummyCanvas.height = 64;
        await detectBricks(dummyCanvas, 'warmup');
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
    let framesSent = 0;
    let detectionsReceived = 0;

    const detectLoop = async () => {
      if (isDetectingRef.current || phase !== 'scanning' || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;

      try {
        isDetectingRef.current = true;
        framesSent++;
        const frameStartTime = Date.now();

        const response = await detectBricks(video);
        const inferenceLatency = Date.now() - frameStartTime;
        detectionsReceived += response.detections.length;

        if (debugMode) {
          console.log(`[Scanner] 📥 Resolution: ${response.frameWidth}x${response.frameHeight} | Latency: ${inferenceLatency}ms | Bricks: ${response.detections.length}`);
        }

        if (phase === 'scanning') {
          const newOverlays = response.detections
            .map(toDetectionOverlay)
            .filter((o): o is DetectionOverlay => o !== null);

          setOverlays(newOverlays);

          const container = overlayContainerRef.current;
          if (container) {
            setPreviewLayout({
              sourceWidth: response.frameWidth,
              sourceHeight: response.frameHeight,
              previewX: 0, previewY: 0,
              previewWidth: container.clientWidth,
              previewHeight: container.clientHeight
            });
          }
          // Objective Logic
          if (challenge && !puzzleProgress.found) {
            const found = response.detections.some(d =>
              d.prediction.identityConfidence > 0.6 &&
              d.prediction.brickName?.toLowerCase().includes(challenge.name?.toLowerCase().split(' ')[0])
            );
            if (found) {
              setPuzzleProgress({ found: true, count: 1 });
              confetti({ particleCount: 100, origin: { y: 0.6 } });
            }
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
      } finally {
        isDetectingRef.current = false;
      }
    };

    intervalId = setInterval(detectLoop, 350);
    return () => clearInterval(intervalId);
  }, [phase, hasPermission, challenge, puzzleProgress.found]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0);

      const screenshot = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(screenshot);

      const response = await detectBricks(screenshot, 'capture_final');
      const finalBricks = response.detections.map(d => ({
        id: d.detectionId,
        name: d.prediction.brickName,
        color: d.prediction.brickColorName,
        family: d.prediction.brickFamily,
        dimensions: d.prediction.dimensionsLabel,
        confidence: d.prediction.identityConfidence,
        selected: d.labelDisplayStatus === 'confirmed' || d.geometry.geometryConfidence > 0.4,
        box: d.geometry.bbox,
        displayText: d.compactLabel || generationFallbackLabel(d),
        sourceRes: { width: response.frameWidth, height: response.frameHeight }
      }));

      setDetectedBricks(finalBricks);
      setPhase('results');
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const toggleBrickSelection = (id: string) => {
    setDetectedBricks(prev => prev.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
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

          <div className="bg-black py-8 flex justify-center safe-area-bottom">
            <button onClick={handleCapture} disabled={isProcessing} className="w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center group active:scale-95 transition-all">
              <div className="w-[66px] h-[66px] rounded-full bg-white" />
            </button>
          </div>
        </>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <div className="relative flex-[2] bg-black">
            {capturedImage && <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />}
            <div className="absolute inset-0 pointer-events-none">
              {detectedBricks.map((b, i) => {
                const sourceW = b.sourceRes?.width || 640;
                const sourceH = b.sourceRes?.height || 480;
                const renderBox = bboxToRenderBox(b.box, sourceW, sourceH, window.innerWidth, window.innerHeight * 0.4, 'contain');
                return (
                  <div key={b.id || i} className="absolute border-2 border-orange-500/50 rounded-sm" style={{
                    top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`
                  }} />
                );
              })}
            </div>
          </div>

          <div className="flex-[3] bg-slate-900 rounded-t-3xl p-6 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">{detectedBricks.length} Bricks Identified</h2>
              <button onClick={() => setPhase('scanning')} className="p-2 bg-white/5 rounded-full"><RefreshCw className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {detectedBricks.map(b => (
                <div key={b.id} onClick={() => toggleBrickSelection(b.id)} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${b.selected ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${b.selected ? 'bg-orange-500 border-orange-500' : 'border-slate-600'}`}>
                    {b.selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm leading-tight">{b.displayText}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{(b.confidence * 100).toFixed(0)}% Conf • {b.family || 'Generic'}</p>
                  </div>
                </div>
              ))}
            </div>

            {saveSuccess ? (
              <div className="py-4 text-center bg-green-500/20 text-green-400 rounded-xl font-bold">
                Saved to Collection!
              </div>
            ) : (
              <button onClick={handleSaveSelected} disabled={isProcessing || !detectedBricks.some(b => b.selected)} className="mt-6 w-full bg-orange-500 disabled:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
                {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-white" /> Add to Collection</>}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
