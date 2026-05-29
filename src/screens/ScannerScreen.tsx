import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, ChevronLeft, Plus } from 'lucide-react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mock camera stream initialization
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Camera error:', err));
    }
  }, []);

  const startScan = () => {
    setIsScanning(true);
    // Simulate AI scanning delay
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
    <div className="flex flex-col h-full bg-[#111111] font-sans text-white relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 pt-[max(env(safe-area-inset-top),3rem)] px-6 pb-4 flex items-center justify-between z-40 bg-gradient-to-b from-[#111111]/90 to-transparent">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {!showResult ? (
        <div className="flex-1 relative flex flex-col justify-end">
          {/* Live Camera Viewport */}
          <div className="absolute inset-0 bg-zinc-900 z-0">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-60"
            />
          </div>

          {/* Elegant Viewfinder */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className={`w-72 h-80 rounded-3xl border-2 border-white/20 relative transition-all duration-500 ${isScanning ? 'scale-105 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : ''}`}>
              {/* Corner brackets */}
              <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
              <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
              <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
              <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
              
              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite]" />
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="relative z-20 pb-[max(env(safe-area-inset-bottom),2rem)] pt-12 px-8 flex flex-col items-center bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent">
            {isScanning ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <h3 className="text-xl font-medium tracking-wide text-white">AI Scanning...</h3>
                <p className="text-zinc-400 mt-2 text-sm">Identifying set, condition, and market value</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <h3 className="text-xl font-medium tracking-wide text-white mb-8">Point at any LEGO box</h3>
                <button 
                  onClick={startScan}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                    <Camera className="w-7 h-7 text-black" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Instant Result Card */
        <div className="flex-1 bg-[#111111] pt-24 px-6 flex flex-col relative z-20 animate-in slide-in-from-bottom-10 fade-in duration-500">
          
          <div className="bg-[#1A1A1A] rounded-[32px] p-6 shadow-2xl border border-white/5 relative overflow-hidden w-full max-w-sm mx-auto">
            {/* Success Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
            
            <button onClick={resetScan} className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex justify-center mt-6 mb-8">
              <div className="w-48 h-48 bg-black/30 rounded-2xl p-4 border border-white/5 drop-shadow-2xl">
                <img src="https://cdn.rebrickable.com/media/sets/10270-1/1.jpg" alt="Bookshop" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm font-medium text-zinc-400 mb-1">Creator Expert</p>
              <h2 className="text-2xl font-semibold text-white">Bookshop</h2>
              <p className="text-sm font-medium text-zinc-500 mt-1">#10270 • 2,504 pcs</p>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-zinc-400">Current Value</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">+12.4% ↗</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Sealed (NIB)</span>
                  <span className="text-3xl font-semibold text-white">$285.00</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Used (Complete)</span>
                  <span className="text-xl font-medium text-zinc-300">$210.00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={() => {
                  appStateService.navigate(Screen.SET_DETAIL, { setNum: '10270-1' });
                }}
                className="w-full py-4 bg-emerald-500 text-white rounded-full font-semibold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Save to Collection
              </button>
              <button 
                onClick={() => {
                  appStateService.navigate(Screen.SET_DETAIL, { setNum: '10270-1' });
                }}
                className="w-full py-4 bg-transparent border-2 border-zinc-800 text-white rounded-full font-semibold text-lg active:scale-95 transition-transform hover:bg-white/5"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 98%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};
