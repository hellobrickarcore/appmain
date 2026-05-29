import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, ChevronLeft, Plus, Zap, Eye } from 'lucide-react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scanMode, setScanMode] = useState<'live' | 'ar'>('live');
  const [scanType, setScanType] = useState<'set' | 'minifig' | 'pile' | 'mystery'>('set');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Camera error:', err));
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        // Limit tilt to max 20 degrees for a subtle effect
        const maxTilt = 20;
        let x = e.gamma; // Left-to-right tilt
        let y = e.beta - 45; // Front-to-back tilt, offset by holding angle
        
        x = Math.max(-maxTilt, Math.min(maxTilt, x));
        y = Math.max(-maxTilt, Math.min(maxTilt, y));

        setTilt({ x: x, y: -y });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
    }, 2500);
  };

  const resetScan = () => {
    setShowResult(false);
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans text-white relative overflow-hidden select-none perspective-[1000px]">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),3rem)] px-6 pb-4 flex items-center justify-between z-40 bg-gradient-to-b from-[#111111]/90 to-transparent">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Mode Toggle */}
        <div className="bg-black/50 backdrop-blur-md rounded-full p-1 flex border border-white/10 shadow-2xl">
          <button 
            onClick={() => setScanMode('live')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${scanMode === 'live' ? 'bg-[#1A1A1A] text-white shadow-md border border-white/5' : 'text-zinc-500'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live
          </button>
          <button 
            onClick={() => setScanMode('ar')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${scanMode === 'ar' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50' : 'text-zinc-500'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            AR Lens
          </button>
        </div>
      </div>

        {/* Scan Type Selector */}
        <div className="absolute top-[max(calc(env(safe-area-inset-top)+4.5rem),7rem)] left-0 right-0 z-40 flex justify-center">
          <div className="flex gap-1 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10">
            {[
              { id: 'set' as const, label: 'Set', emoji: '📦' },
              { id: 'minifig' as const, label: 'Minifig', emoji: '🧑' },
              { id: 'pile' as const, label: 'Pile', emoji: '🧱' },
              { id: 'mystery' as const, label: 'Mystery', emoji: '🎁' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setScanType(t.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 ${
                  scanType === t.id
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-zinc-500'
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

      <div className="flex-1 relative flex flex-col justify-end">
        {/* Live Camera Viewport */}
        <div className="absolute inset-0 bg-zinc-900 z-0">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-500 ${scanMode === 'ar' ? 'opacity-100' : 'opacity-60'}`}
          />
        </div>

        {/* AR Mode Targeting HUD */}
        {!showResult && scanMode === 'ar' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-80">
            <div className="w-64 h-64 relative animate-[pulse_3s_ease-in-out_infinite]">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
              
              {isScanning && (
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,1)] animate-[ar-scan_1.5s_linear_infinite]" />
              )}
            </div>
            
            <div className="absolute top-1/4 left-8 text-cyan-400 font-mono text-[8px] flex flex-col gap-1 tracking-widest opacity-60">
              <span>TRGT: SEARCHING</span>
              <span>LENS: ACTIVE</span>
              <span>XYZ: {tilt.x.toFixed(1)}, {tilt.y.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Standard Mode Elegant Viewfinder */}
        {!showResult && scanMode === 'live' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className={`w-72 h-80 rounded-3xl border-2 border-white/20 relative transition-all duration-500 ${isScanning ? 'scale-105 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : ''}`}>
              <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
              <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
              <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
              <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
              
              {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite]" />
              )}
            </div>
          </div>
        )}

        {/* Standard Result Bottom Sheet */}
        {showResult && scanMode === 'live' && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[32px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t border-white/5 z-20 animate-in slide-in-from-bottom-10 fade-in duration-500 pb-[max(env(safe-area-inset-bottom),2rem)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">{scanType === 'minifig' ? 'Minifigure' : scanType === 'pile' ? 'Bulk Pile' : scanType === 'mystery' ? 'Mystery Pack' : 'Creator Expert'}</p>
                <h2 className="text-2xl font-semibold text-white">Bookshop</h2>
              </div>
              <button onClick={resetScan} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-24 h-24 bg-black/30 rounded-xl p-2 border border-white/5">
                <img src="https://cdn.rebrickable.com/media/sets/10270-1/1.jpg" alt="Bookshop" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-zinc-500">Sealed (NIB)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+12.4%</span>
                </div>
                <span className="text-2xl font-semibold text-white mb-2">$285.00</span>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-zinc-500">Used</span>
                  <span className="text-sm font-medium text-zinc-300">$210.00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => appStateService.navigate(Screen.SET_DETAIL, { setNum: '10270-1' })}
                className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Set
              </button>
              <button 
                onClick={() => appStateService.navigate(Screen.SET_DETAIL, { setNum: '10270-1' })}
                className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                Details
              </button>
            </div>
          </div>
        )}

        {/* AR Mode 3D Floating Result */}
        {showResult && scanMode === 'ar' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <button onClick={resetScan} className="absolute top-24 left-6 p-2 text-white bg-black/40 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* 3D Hologram Card Container */}
            <div 
              className="w-72 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-float-in preserve-3d"
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(50px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Inner floating elements */}
              <div style={{ transform: 'translateZ(30px)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded-full">
                    <span className="text-[9px] font-black text-cyan-400 tracking-wider uppercase font-mono">Verified Match</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">#10270</span>
                </div>

                <div className="flex justify-center mb-6 drop-shadow-2xl" style={{ transform: 'translateZ(40px)' }}>
                  <img src="https://cdn.rebrickable.com/media/sets/10270-1/1.jpg" alt="Bookshop" className="w-40 h-40 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">Bookshop</h2>
                  <p className="text-xs font-medium text-zinc-400">Creator Expert • 2,504 pcs</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-inner" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Market Value</span>
                    <span className="text-[10px] font-bold text-emerald-400">+12.4%</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">$285</span>
                    <span className="text-sm font-medium text-zinc-500 mb-1">.00</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                  </div>
                </div>

                <button 
                  onClick={() => appStateService.navigate(Screen.SET_DETAIL, { setNum: '10270-1' })}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <Plus className="w-4 h-4" /> Save to Collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls (Only when scanning) */}
        {!showResult && (
          <div className="relative z-20 pb-[max(env(safe-area-inset-bottom),2rem)] pt-12 px-8 flex flex-col items-center bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent">
            {isScanning ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${scanMode === 'ar' ? 'border-cyan-500/30 border-t-cyan-500' : 'border-emerald-500/30 border-t-emerald-500'}`} />
                <h3 className="text-xl font-medium tracking-wide text-white">
                  {scanMode === 'ar' ? 'Analyzing Space...' : 'AI Scanning...'}
                </h3>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <h3 className="text-xl font-medium tracking-wide text-white mb-8">
                  {scanType === 'set' ? (scanMode === 'ar' ? 'Point at built model or box' : 'Point at any LEGO box') :
                   scanType === 'minifig' ? 'Focus on a single minifigure' :
                   scanType === 'pile' ? 'Capture your entire pile' :
                   'Point at mystery pack barcode'}
                </h3>
                <button 
                  onClick={startScan}
                  className={`w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] ${scanMode === 'ar' ? 'bg-gradient-to-tr from-blue-600 to-purple-600' : 'bg-white'}`}
                >
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${scanMode === 'ar' ? 'border-white/50' : 'border-black'}`}>
                    <Camera className={`w-7 h-7 ${scanMode === 'ar' ? 'text-white' : 'text-black'}`} />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 98%; }
          100% { top: 0%; }
        }
        @keyframes ar-scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float-in {
          0% { opacity: 0; transform: scale(0.9) translateZ(-100px); }
          100% { opacity: 1; transform: scale(1) translateZ(0px); }
        }
        .animate-float-in {
          animation: float-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};
