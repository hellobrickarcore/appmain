import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, Zap, Target, Shield, Sparkles, Swords, ChevronLeft } from 'lucide-react';
import { Screen, GameModeId, BattleResult } from '../types';
import { xpHelpers } from '../services/xpService';
import { detectFrame, OnnxDetection } from '../services/onnxDetectionService';

interface HeadToHeadBattleScreenProps {
    onNavigate: (screen: Screen) => void;
    modeId: GameModeId;
    onBattleComplete: (result: BattleResult) => void;
    isPro?: boolean;
}

type BattleState = 'COUNTDOWN' | 'REVEAL' | 'PLAYING' | 'FINISHED';

const MOCK_TARGETS = {
    'TARGET': { label: '2x4 Red Brick', image: 'https://images.unsplash.com/photo-1585366447221-d552f9576f3d?auto=format&fit=crop&w=200&h=200' },
    'SPRINT': { label: '3 Blue Bricks', type: 'Category: Bricks', count: 3 },
    'MIRROR': { label: 'Any 2x2 Plate', type: 'Score Attack', count: 0 }
};

export const HeadToHeadBattleScreen: React.FC<HeadToHeadBattleScreenProps> = ({ onNavigate, modeId, onBattleComplete, isPro = false }) => {
    const [gameState, setGameState] = useState<BattleState>('COUNTDOWN');
    const [countdown, setCountdown] = useState(3);
    const [gameTimer, setGameTimer] = useState(60);

    // Gameplay State
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [itemsFound, setItemsFound] = useState<string[]>([]);

    // Activity tracking for XP
    const scanAttemptsRef = useRef(0);
    const uniqueDetectionsRef = useRef(0);
    const validDetectionsRef = useRef(0);

    // Camera & Detection
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const detectionIntervalRef = useRef<number | null>(null);

    // Mock Opponent Logic
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const interval = setInterval(() => {
            // Opponent randomly scores
            if (Math.random() > 0.85) {
                setOpponentScore(prev => prev + 1);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [gameState]);

    // Main Game Loop Timer
    useEffect(() => {
        if (gameState === 'COUNTDOWN') {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('REVEAL');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (gameState === 'REVEAL') {
            const timer = setTimeout(() => {
                setGameState('PLAYING');
                startCamera();
            }, 3000);
            return () => clearTimeout(timer);
        } else if (gameState === 'PLAYING') {
            const timer = setInterval(() => {
                setGameTimer(prev => {
                    if (prev <= 1) {
                        finishGame(playerScore, opponentScore);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState, playerScore, opponentScore]);

    useEffect(() => {
        if (gameState === 'PLAYING' && isScanning && videoRef.current) {
            startDetectionLoop();
        } else {
            stopDetectionLoop();
        }
        return () => stopDetectionLoop();
    }, [gameState, isScanning]);

    const startDetectionLoop = () => {
        if (detectionIntervalRef.current) return;

        const loop = async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

            try {
                const { objects } = await detectFrame(videoRef.current);
                if (objects.length > 0) {
                    processDetections(objects);
                }
            } catch (err) {
                console.error('Detection loop error:', err);
            }

            if (gameState === 'PLAYING') {
                detectionIntervalRef.current = window.setTimeout(loop, 200);
            }
        };

        loop();
    };

    const stopDetectionLoop = () => {
        if (detectionIntervalRef.current) {
            clearTimeout(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
    };

    const processDetections = (objects: OnnxDetection[]) => {
        scanAttemptsRef.current += 1;
        const target = MOCK_TARGETS[modeId];
        const targetLabel = (target as any).label.toLowerCase();

        for (const obj of objects) {
            const objLabel = obj.label.toLowerCase();
            let isMatch = false;

            if (modeId === 'TARGET') {
                isMatch = targetLabel.includes(objLabel) || objLabel.includes(targetLabel.split(' ')[0]);
            } else if (modeId === 'SPRINT') {
                isMatch = objLabel.includes('brick');
            } else {
                isMatch = true;
            }

            if (isMatch) {
                handleValidDetection(obj.id);
            }
        }
    };

    const handleValidDetection = (detectionId: string) => {
        if (itemsFound.includes(detectionId)) return;

        setItemsFound(prev => [...prev, detectionId]);
        validDetectionsRef.current += 1;
        uniqueDetectionsRef.current += 1;

        if (modeId === 'TARGET') {
            setPlayerScore(1);
            finishGame(1, opponentScore);
        } else if (modeId === 'SPRINT') {
            setPlayerScore(prev => {
                const newScore = prev + 1;
                if (newScore >= 3) {
                    finishGame(newScore, opponentScore);
                }
                return newScore;
            });
        } else {
            setPlayerScore(prev => prev + 1);
        }
    };

    const finishGame = async (pScore: number, oScore: number) => {
        setGameState('FINISHED');
        setIsScanning(false);
        stopDetectionLoop();

        const won = pScore > oScore;

        if (!isPro) {
            const battleResult: BattleResult = {
                won,
                xp: 0,
                playerScore: pScore,
                opponentScore: oScore,
                modeId
            };
            onBattleComplete(battleResult);
            onNavigate(Screen.H2H_RESULT);
            return;
        }

        try {
            const result = won ? 'win' : (pScore === oScore ? 'draw' : 'loss');
            const xpResponse = await xpHelpers.battleCompleted(
                modeId,
                result,
                pScore,
                oScore,
                {
                    scan_attempts: scanAttemptsRef.current,
                    unique_detections: uniqueDetectionsRef.current,
                    valid_detections: validDetectionsRef.current,
                }
            );

            onBattleComplete({
                won,
                xp: xpResponse.xp_awarded,
                playerScore: pScore,
                opponentScore: oScore,
                modeId
            });
            onNavigate(Screen.H2H_RESULT);
        } catch (error) {
            onBattleComplete({
                won,
                xp: won ? 50 : 15,
                playerScore: pScore,
                opponentScore: oScore,
                modeId
            });
            onNavigate(Screen.H2H_RESULT);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
            }
        } catch (e) {
            console.error("Camera failed", e);
        }
    };

    const getTargetUI = () => {
        const target = (MOCK_TARGETS as any)[modeId];
        return (
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-12 duration-700">
               <div className="bg-[#050A18]/80 backdrop-blur-3xl px-8 py-5 rounded-[40px] border border-white/10 shadow-3xl flex flex-col items-center">
                   <div className="flex items-center gap-2 mb-2">
                       <Target className="w-3.5 h-3.5 text-rose-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Arena Objective</span>
                   </div>
                   <div className="flex items-center gap-6">
                       {modeId === 'TARGET' && <img src={MOCK_TARGETS['TARGET'].image} className="w-14 h-14 rounded-2xl border border-white/10 shadow-2xl" />}
                       <span className="font-black text-2xl text-white tracking-tight">{target.label}</span>
                   </div>
               </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#050A18] font-sans text-white overflow-hidden flex flex-col">
            
            {gameState === 'COUNTDOWN' && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050A18] flex-col overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-20">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-indigo-500/20 rounded-full animate-[ping_4s_linear_infinite]" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-12 shadow-inner">
                           <h1 className="text-[100px] font-black text-white tracking-widest leading-none drop-shadow-3xl">{countdown}</h1>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                           <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm">Initializing Arena</p>
                           <div className="flex gap-2">
                              {[1, 2, 3].map(i => (
                                 <div key={i} className={`w-2 h-2 rounded-full ${i <= (3-countdown) ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`} />
                              ))}
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'REVEAL' && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050A18] animate-in fade-in duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-rose-600/10 via-transparent to-transparent opacity-50" />
                    
                    <div className="relative z-20 text-center max-w-sm px-10">
                        <div className="flex items-center justify-center gap-3 mb-10">
                           <Swords className="w-6 h-6 text-rose-500" />
                           <h2 className="text-sm font-black text-rose-500 uppercase tracking-[0.4em]">Mission Target</h2>
                        </div>
                        
                        <div className="w-72 h-72 bg-white rounded-[64px] flex items-center justify-center mb-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-[12px] border-white/5 overflow-hidden transition-all relative">
                            {modeId === 'TARGET' ? (
                                <img src={MOCK_TARGETS['TARGET'].image} className="w-full h-full object-cover scale-110" />
                            ) : (
                                <div className="text-slate-950 font-black text-5xl leading-tight px-10">
                                    {MOCK_TARGETS[modeId].label}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        <h3 className="text-3xl font-black text-white tracking-tight mb-4 ">{(MOCK_TARGETS as any)[modeId].label}</h3>
                        <p className="text-slate-500 font-bold leading-relaxed">Identity confirmed. Searching environment for exact matches.</p>
                        
                        <div className="mt-12 flex justify-center">
                           <div className="w-16 h-1 border-t-2 border-slate-800" />
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <>
                    <div className="absolute inset-0 z-0">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050A18] via-transparent to-[#050A18]/60" />
                    </div>

                    {/* HUD Header */}
                    <div className="absolute top-0 left-0 right-0 px-6 pt-16 flex justify-between items-start z-50">
                        <div className="bg-[#050A18]/60 backdrop-blur-3xl rounded-[28px] p-1 border border-white/5 shadow-2xl">
                           <div className="bg-white/5 px-6 py-3 rounded-[24px] flex items-center gap-4">
                               <Clock className="w-5 h-5 text-indigo-400" />
                               <span className="font-black text-3xl tracking-tighter text-white">{gameTimer}<span className="text-xs text-slate-500 ml-1">S</span></span>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-3 bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Opponent Score: {opponentScore}</span>
                            </div>
                        </div>
                    </div>

                    {getTargetUI()}

                    {/* Targeting Crosshair */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                        <div className="w-72 h-72 relative">
                            <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-[spin_20s_linear_infinite] p-4">
                               <div className="w-2 h-2 bg-white/20 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
                            </div>
                            <div className="absolute inset-8 border border-white/5 rounded-full" />
                            
                            {/* Brackets */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                            
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    </div>

                    {/* HUD Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#050A18] via-[#050A18]/80 to-transparent z-50">
                        <div className="flex items-end justify-between">
                            <div className="text-left">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Your Deployment</span>
                                <div className="text-7xl font-black text-white tracking-tighter flex items-end">
                                   {playerScore} 
                                   <span className="text-xl text-slate-700 font-bold mb-4 ml-3">/ {modeId === 'SPRINT' ? '3' : '∞'}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-6">
                               {modeId === 'SPRINT' && (
                                   <div className="flex gap-3">
                                       {[...Array(3)].map((_, i) => (
                                           <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${i < playerScore ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10'}`}>
                                               {i < playerScore ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Shield className="w-5 h-5 text-slate-800" />}
                                           </div>
                                       ))}
                                   </div>
                               )}
                               <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Earning +150 XP</span>
                               </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            <style>{`
               @keyframes scan {
                  0% { top: 0; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
               }
            `}</style>
        </div>
    );
};
