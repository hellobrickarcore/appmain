import { detectBricks, DetectionStabilizer, brickDetectionService } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef(false);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(2000, 0.18, 15));
  
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

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const isSecureContext = window.isSecureContext || location.protocol === 'https:';
        if (!navigator.mediaDevices?.getUserMedia) {
          setHasPermission(false);
          setQualityAdvice('Camera not supported.');
          return;
        }

        const { getCameraStream } = await import('../services/cameraService');
        stream = await getCameraStream();
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        setHasPermission(false);
        setQualityAdvice(err.name === 'NotAllowedError' ? 'Permission denied.' : 'Camera error.');
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (streamRef.current && videoRef.current && (phase === 'scanning' || phase === 'preview')) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [phase, hasPermission]);

  useEffect(() => {
    if (hasPermission && phase === 'preview') {
      setPhase('scanning');
      analytics.track('scan_started');
    }
  }, [hasPermission]);

  // Detection Loop with Stabilizer & Adaptive Interval
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
              return confidence >= 0.7 && (name === target || name.includes(target) || color === target || color.includes(target));
            });

            if (goalMet && !saveSuccess) {
               confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#F97316', '#FB923C', '#FFFFFF'] });
               setSaveSuccess(true);
               import('../services/xpService').then(({ xpHelpers }) => { xpHelpers.challengeCompleted(challenge.id, 'daily'); });
               setTimeout(() => setPhase('results'), 2000);
            }
          }
        }

        const nextDelay = Math.max(150, Math.min(1000, (response.rttMs || 150) + 50));
        if (isActive) timeoutId = setTimeout(detectLoop, nextDelay);
      } catch (err) {
        if (isActive) timeoutId = setTimeout(detectLoop, 500);
      } finally {
        isDetectingRef.current = false;
      }
    };

    detectLoop();
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, hasPermission, challenge, isProcessing, saveSuccess]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const handleCapture = useCallback(async () => {
    setIsProcessing(true);
    isDetectingRef.current = true; 

    const image = captureImage();
    if (image) setCapturedImage(image);

    try {
      const threshold = 0.3;
      const capturedBricks = detectedObjects.filter(b => (b.prediction.identityConfidence || 0) >= threshold);
      setDetectedObjects(capturedBricks);
      setSelectedBricks(new Set(capturedBricks.map(b => b.detectionId)));
      setPhase('results');
      analytics.track('scan_captured', { brick_count: capturedBricks.length });
    } catch (err) {
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

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-[max(env(safe-area-inset-top),16px)] left-0 right-0 px-6 flex justify-between items-center z-50">
        <div className="flex gap-4">
          <button onClick={() => onNavigate(Screen.HOME)} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-95 transition-all">
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
        <div className="relative flex-1 bg-black overflow-hidden">
          {hasPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center text-center p-6 z-50 bg-black/80 backdrop-blur-md">
              <div className="p-8 max-w-sm">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Camera Access Required</h3>
                <p className="text-slate-300 text-sm mb-4">{qualityAdvice || 'Allow camera access.'}</p>
                <button onClick={() => window.location.reload()} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg">Retry</button>
              </div>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />

          {/* HUD Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex flex-col items-center z-50 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[14px] font-black text-white/90 uppercase tracking-[0.2em]">{challenge ? 'CHALLENGE ACTIVE' : 'LIVE SCANNER'}</span>
            </div>
            {challenge && (
              <div className="mt-2 bg-orange-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-500/30">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">GOAL: {challenge.type}</span>
              </div>
            )}
          </div>

          {/* Bounding Boxes */}
          <div ref={overlayContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
            {detectedObjects.map((obj, i) => {
              const rect = bboxToRenderBox(obj.geometry.bbox, videoRef.current?.videoWidth || 640, videoRef.current?.videoHeight || 480, overlayContainerRef.current?.clientWidth || 375, overlayContainerRef.current?.clientHeight || 812, 'cover');
              return (
                <div key={obj.detectionId || i} className="absolute" style={{ top: `${rect.top}%`, left: `${rect.left}%`, width: `${rect.width}%`, height: `${rect.height}%`, transition: 'all 0.1s ease-out', border: '1.5px solid #3B82F6', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                  {/* Label pill */}
                  <div className="absolute -top-7 left-0 bg-[#3B82F6]/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 shadow-lg border border-white/20">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      {brickDetectionService.generationFallbackLabel(obj)}
                      <span className="ml-1.5 opacity-60 font-medium">{Math.round(obj.prediction.identityConfidence * 100)}%</span>
                    </span>
                  </div>
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
                </div>
              );
            })}
          </div>

          {/* Capture Button */}
          <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center z-50">
            <button
              onClick={handleCapture}
              disabled={isProcessing}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white p-1 hover:scale-105 active:scale-95 transition-all shadow-2xl group"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                 {isProcessing ? <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" /> : <div className="w-16 h-16 rounded-full border-2 border-black/5" />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ─── RESULTS PHASE ─── */}
      {phase === 'results' && (
        <div className="flex-1 bg-[#050A18] flex flex-col pt-[max(env(safe-area-inset-top),2.5rem)] overflow-hidden">
          {/* Result Header */}
          <div className="px-6 pb-6 flex justify-between items-center shrink-0">
             <div className="flex flex-col">
               <h2 className="text-2xl font-black text-white italic tracking-tight">SCAN RESULTS</h2>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Found {detectedObjects.length} Parts</p>
             </div>
             <button onClick={() => setPhase('scanning')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
               <RefreshCw className="w-5 h-5 text-white" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-40">
            <div className="grid grid-cols-2 gap-4">
              {detectedObjects.map((obj) => (
                <div 
                  key={obj.detectionId} 
                  onClick={() => {
                    const next = new Set(selectedBricks);
                    if (next.has(obj.detectionId)) next.delete(obj.detectionId);
                    else next.add(obj.detectionId);
                    setSelectedBricks(next);
                  }}
                  className={`bg-white/5 rounded-[32px] p-4 border transition-all active:scale-95 ${selectedBricks.has(obj.detectionId) ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`}
                >
                  <div className="aspect-square rounded-2xl bg-black/40 mb-3 overflow-hidden flex items-center justify-center relative">
                    <img src={`https://cdn.rebrickable.com/media/parts/elements/${obj.prediction.brickPartNum}.jpg`} className="w-full h-full object-contain p-2" alt="brick" />
                    {selectedBricks.has(obj.detectionId) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[13px] font-black text-white leading-tight mb-1 truncate">{obj.prediction.brickColorName} {obj.prediction.brickName}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{obj.prediction.brickPartNum}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 pb-[max(env(safe-area-inset-bottom),2rem)] bg-gradient-to-t from-[#050A18] via-[#050A18] to-transparent z-50">
             <button 
              onClick={handleSaveSelected}
              disabled={isProcessing || selectedBricks.size === 0}
              className="w-full h-16 bg-[#2563EB] text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>SAVE TO COLLECTION <span className="opacity-50">· {selectedBricks.size}</span></>}
             </button>
             <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-4">Earn +{selectedBricks.size * 10} XP</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {saveSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
           <div className="bg-white rounded-[40px] p-10 flex flex-col items-center text-center relative z-10 animate-in zoom-in-50 duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">COLLECTION UPDATED!</h3>
              <p className="text-slate-500 font-bold">Added {selectedBricks.size} new parts to your collection.</p>
           </div>
        </div>
      )}
    </div>
  );
};
