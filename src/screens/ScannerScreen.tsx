import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera as CameraIcon, 
  X, 
  RotateCcw, 
  Zap, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  LayoutGrid, 
  Flame, 
  History,
  Shield,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Screen, DetectionResult, ScanSession } from '../types';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { detectBricks, processDetectionOverlay, DetectionStabilizer } from '../services/brickDetectionService';
import { xpHelpers, getUserId } from '../services/xpService';
import { CONFIG } from '../services/configService';
import { saveScanSession } from '../services/supabaseService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen) => void;
  isPro?: boolean;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, isPro = false }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [sessionStats, setSessionStats] = useState({ totalBricks: 0, uniqueBricks: 0, xpEarned: 0 });
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeSession, setActiveSession] = useState<ScanSession | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const stabilizerRef = useRef(new DetectionStabilizer());
  const scanIntervalRef = useRef<any>();

  // Use dynamic interval based on performance (Adaptive Scan)
  const [scanInterval, setScanInterval] = useState(200); // ms

  const startScanner = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        // Initialize Session
        setActiveSession({
          id: `scan_${Date.now()}`,
          startTime: Date.now(),
          detections: [],
          totalXp: 0
        });

        // Start Detection Loop
        startDetectionLoop();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Please enable camera access in settings to scan bricks.');
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setShowSummary(true);
  };

  const startDetectionLoop = () => {
    const processFrame = async () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const startTime = performance.now();
      
      // 1. Core Detection (Phase 7 CV Pipeline)
      const rawDetections = await detectBricks(videoRef.current, canvasRef.current);
      
      // 2. Magnetic Stabilizer (Smoothing)
      const stabilized = stabilizerRef.current.stabilize(rawDetections);
      
      // 3. Update State
      setDetections(stabilized);
      
      if (stabilized.length > 0) {
        setSessionStats(prev => ({
          ...prev,
          totalBricks: prev.totalBricks + stabilized.length,
          uniqueBricks: prev.uniqueBricks + new Set(stabilized.map(d => d.label)).size,
          xpEarned: prev.xpEarned + (stabilized.length * 5)
        }));
        setLastDetection(stabilized[0]);
      }

      // 4. Render Overlay
      if (overlayRef.current) {
        processDetectionOverlay(overlayRef.current, stabilized);
      }

      const endTime = performance.now();
      const RTT = endTime - startTime;
      
      // 5. Adaptive Interval (Dynamic Performance Tuning)
      const nextInterval = Math.max(150, Math.min(1000, RTT * 1.5));
      setScanInterval(nextInterval);
      
      scanIntervalRef.current = setTimeout(processFrame, nextInterval);
    };

    processFrame();
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  if (showSummary) {
    return (
      <div className="flex flex-col h-full bg-[#050A18] text-white font-sans animate-in fade-in duration-500">
        <div className="px-6 pt-20 pb-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-orange-500/10 rounded-[32px] flex items-center justify-center mb-6 border border-orange-500/20 shadow-2xl">
                <Trophy className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black mb-2">Scan Complete!</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">You've reached a new discovery peak</p>
        </div>

        <div className="px-6 space-y-4 flex-1">
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex justify-between items-center shadow-2xl">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bricks</p>
                    <p className="text-3xl font-black text-white">{sessionStats.totalBricks}</p>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Earned</p>
                    <p className="text-3xl font-black text-orange-500">+{sessionStats.xpEarned}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 text-center">
                    <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                    <p className="text-xl font-black">{sessionStats.uniqueBricks}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unique</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 text-center">
                    <History className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                    <p className="text-xl font-black">12m</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scan Time</p>
                </div>
            </div>
        </div>

        <div className="p-8 space-y-4">
            <button 
                onClick={() => { setShowSummary(false); setSessionStats({ totalBricks: 0, uniqueBricks: 0, xpEarned: 0 }); }}
                className="w-full h-16 bg-white text-[#050A18] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
                Scan Again
            </button>
            <button 
                onClick={() => onNavigate(Screen.HOME)}
                className="w-full h-16 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
            >
                Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black font-sans overflow-hidden relative">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

      {/* Modern HUD Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        {/* Top HUD */}
        <div className="flex justify-between items-start pt-[env(safe-area-inset-top)]">
           <button 
             onClick={() => onNavigate(Screen.HOME)} 
             className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-all shadow-2xl"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] px-4 py-2 flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Scanning...</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{scanInterval.toFixed(0)}ms latency</span>
              </div>
           </div>

           <button 
             className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-all shadow-2xl"
           >
             <Zap className="w-5 h-5 text-orange-500" />
           </button>
        </div>

        {/* Center Target Rect (Subtle Decoration) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/20 rounded-[48px] pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-[32px]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-[32px]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-[32px]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-[32px]" />
        </div>

        {/* Bottom Metadata & Controls */}
        <div className="space-y-6 pb-[env(safe-area-inset-bottom)]">
          {lastDetection && (
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 flex items-center gap-5 shadow-3xl animate-in slide-in-from-bottom-4 duration-500 pointer-events-auto max-w-[320px] mx-auto">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-3xl">🧱</span>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Identified</p>
                  <h3 className="text-lg font-black text-white leading-tight">{lastDetection.label}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                     <div className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-bold text-slate-300 uppercase">Part {lastDetection.partNumber || '3001'}</div>
                     <div className="text-[8px] font-bold text-emerald-400 uppercase">{Math.round(lastDetection.confidence * 100)}% Match</div>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-500" />
            </div>
          )}

          {!isScanning ? (
            <div className="flex flex-col items-center">
              {cameraError && (
                <div className="bg-red-500/20 border border-red-500/30 text-white px-6 py-4 rounded-3xl text-xs font-bold mb-6 text-center backdrop-blur-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  {cameraError}
                </div>
              )}
              <button 
                onClick={startScanner}
                className="px-12 py-6 bg-orange-500 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] pointer-events-auto active:scale-95 transition-all flex items-center gap-4"
              >
                  <CameraIcon className="w-5 h-5" />
                  Start Ingest
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={stopScanner}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-3xl pointer-events-auto active:scale-90 transition-all group"
              >
                <div className="w-8 h-8 bg-[#050A18] rounded-lg group-hover:scale-90 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
