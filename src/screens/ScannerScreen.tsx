import { detectBricks } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Zap, AlertCircle, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { FrameDetection, DetectionResponse, bboxToRenderBox } from '../types/detection';
import { saveCollectionToSupabase } from '../services/trainingDataService';
import { analytics } from '../services/analyticsService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen) => void;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
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
  const [lastResponse, setLastResponse] = useState<DetectionResponse | null>(null);
  const [selectedBricks, setSelectedBricks] = useState<Set<string>>(new Set());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qualityAdvice, setQualityAdvice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'scanning' | 'results'>('preview');

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

  // Auto-start scanning as soon as camera is ready
  useEffect(() => {
    if (hasPermission && phase === 'preview') {
      setPhase('scanning');
      analytics.track('scan_started');
    }
  }, [hasPermission]);

  // ─── API Detection Loop ────────────────
  useEffect(() => {
    if (phase !== 'scanning' || !hasPermission) return;

    let intervalId: any;

    const detectLoop = async () => {
      if (isDetectingRef.current || phase !== 'scanning' || !videoRef.current) return;

      const video = videoRef.current;
      if (video.readyState < 2) return;

      try {
        isDetectingRef.current = true;
        const response: DetectionResponse = await detectBricks(video);

        if (phase === 'scanning') {
          setDetectedObjects(response.detections);
          setLastResponse(response);
          setQualityAdvice(null);
        }
      } catch (err) {
        console.error('Detection error:', err);
      } finally {
        isDetectingRef.current = false;
      }
    };

    // Detection every 250ms for stability on mobile
    intervalId = setInterval(detectLoop, 250);

    return () => clearInterval(intervalId);
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
    setPhase('scanning'); // Ensure we stay in scanning visual state
    setIsProcessing(true);

    const image = captureImage();
    if (image) {
      setCapturedImage(image);
    }

    try {
      const capturedBricks = [...detectedObjects];
      setDetectedObjects(capturedBricks);
      setSelectedBricks(new Set(capturedBricks.map(b => b.detection_id)));
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
    const bricksToSave = detectedObjects.filter(obj => selectedBricks.has(obj.detection_id));
    if (bricksToSave.length === 0) return;

    setIsProcessing(true);
    const userId = localStorage.getItem('hellobrick_userId') || `user_${Date.now()}`;
    localStorage.setItem('hellobrick_userId', userId);

    try {
      const bricksWithMetaData = bricksToSave.map(obj => {
        const pred = obj.prediction;
        const bbox = obj.geometry.bbox;
        const partId = pred.brick_part_num;

        return {
          id: obj.detection_id,
          name: pred.brick_name,
          type: 'Part',
          category: 'Bricks',
          color: pred.color_name,
          partNumber: partId,
          confidence: obj.confidence,
          count: 1,
          image: `https://cdn.rebrickable.com/media/parts/elements/${partId}.jpg`,
          bbox: {
            x: bbox.x_min,
            y: bbox.y_min,
            width: bbox.x_max - bbox.x_min,
            height: bbox.y_max - bbox.y_min,
          }
        };
      });

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

      {/* Top Bar */}
      <div className="absolute left-0 right-0 px-6 flex justify-between items-center z-50 top-[max(env(safe-area-inset-top),16px)]">
        <button onClick={handleClose} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white shadow-lg">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white">
            <Zap className="w-5 h-5" />
          </button>
        </div>
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

            {/* Minimal controls overlays */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30">
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

            {/* 🔒 LOCK: Live bounding box overlays — using canonical utility. 
                Do not modify coordinate mapping or bbox logic without testing on mobile. */}
            <div ref={overlayContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
              {detectedObjects.map((obj, i) => {
                const container = overlayContainerRef.current;
                const video = videoRef.current;
                if (!container || !video) return null;

                const vw = video.videoWidth || 640;
                const vh = video.videoHeight || 480;
                const cw = container.clientWidth;
                const ch = container.clientHeight;

                // Log dimensions occasionally for debugging
                if (i === 0 && Math.random() < 0.05) {
                  console.log(`[Scanner] v:${vw}x${vh} c:${cw}x${ch}`);
                }

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
                    key={obj.detection_id || i}
                    className="absolute"
                    style={{
                      top: `${renderBox.top}%`,
                      left: `${renderBox.left}%`,
                      width: `${renderBox.width}%`,
                      height: `${renderBox.height}%`,
                      transition: 'all 0.1s ease-out'
                    }}
                  >
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFD600] rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFD600] rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFD600] rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFD600] rounded-br-sm" />

                    {/* Label pill */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 whitespace-nowrap shadow-lg">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
                        {obj.prediction.color_name !== 'Unknown' ? `${obj.prediction.color_name} ` : ''}{obj.prediction.brick_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scanning hint */}
            {phase === 'scanning' && detectedObjects.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-center">
                  <div className="w-[75vw] h-[45vh] border-2 border-white/15 rounded-3xl mb-6 mx-auto" />
                  <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex flex-col items-center gap-1 mx-auto max-w-[80%]">
                    <span className="text-[13px] font-bold text-white tracking-wide">Scanning for bricks...</span>
                    <span className="text-[10px] font-medium text-orange-400">Stable detection (2-5s)</span>
                  </div>
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

          {/* Capture Button */}
          <div className="bg-black py-6 flex justify-center safe-area-bottom">
            <button
              onClick={handleCapture}
              disabled={isProcessing}
              className="w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center group active:scale-90 transition-all shadow-2xl"
            >
              <div className="w-[66px] h-[66px] rounded-full bg-white group-active:bg-slate-100 transition-colors" />
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

                const frameW = lastResponse?.frame_width || img.naturalWidth || 640;
                const frameH = lastResponse?.frame_height || img.naturalHeight || 480;
                const cw = container.clientWidth;
                const ch = container.clientHeight;

                const renderBox = bboxToRenderBox(obj.geometry.bbox, frameW, frameH, cw, ch, 'contain');
                const color = COLORS[i % COLORS.length];
                const isSelected = selectedBricks.has(obj.detection_id);

                return (
                  <div key={obj.detection_id || i}>
                    <div
                      className="absolute border-2 rounded-md"
                      style={{
                        top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`,
                        borderColor: isSelected ? color : `${color}50`,
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    />
                    <div
                      className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border"
                      style={{ borderColor: color }}
                    >
                      {obj.prediction.brick_name}
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
                    const isSelected = selectedBricks.has(obj.detection_id);
                    const pred = obj.prediction;
                    const partNum = pred.brick_part_num;
                    const drawingImageUrl = `https://cdn.rebrickable.com/media/parts/elements/${partNum}.jpg`;

                    return (
                      <div
                        key={obj.detection_id || i}
                        onClick={() => {
                          const s = new Set(selectedBricks);
                          if (isSelected) s.delete(obj.detection_id);
                          else s.add(obj.detection_id);
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
                            alt={pred.brick_name}
                            onError={(e) => { e.currentTarget.src = `https://cdn.rebrickable.com/media/parts/ldraw/14/3001.png`; }}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <p className="font-bold text-sm text-white truncate">
                              {pred.color_name && pred.color_name !== 'Unknown' ? `${pred.color_name} ` : ''}{pred.brick_name}
                            </p>
                          </div>
                          {partNum && partNum !== 'Unknown' && (
                            <p className="text-[11px] text-slate-400 ml-4">#{partNum}</p>
                          )}
                          <p className="text-[10px] text-slate-500 ml-4">
                            {obj.confidence ? `${(obj.confidence * 100).toFixed(0)}%` : '?'} confidence
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletedBrickIdsRef.current.push(obj.detection_id);
                            setDetectedObjects(prev => prev.filter(d => d.detection_id !== obj.detection_id));
                            setSelectedBricks(prev => { const s = new Set(prev); s.delete(obj.detection_id); return s; });
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
