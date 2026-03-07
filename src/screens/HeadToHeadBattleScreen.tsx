import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
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
    'TARGET': { label: '2x4 Red Brick', image: 'https://picsum.photos/seed/brick1/200/200' },
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
            }, 3000); // 3 second reveal
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

    // Detection Loop Effect
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
                detectionIntervalRef.current = window.setTimeout(loop, 200); // 5fps for battle
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
        const targetLabel = target.label.toLowerCase();

        for (const obj of objects) {
            const objLabel = obj.label.toLowerCase();
            let isMatch = false;

            if (modeId === 'TARGET') {
                // Match like "2x4" in "2x4 Red Brick"
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
        // Use a set or simple check to avoid double-counting the same unique instance in a short window
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
            // Fallback for non-pro (still let them see results but maybe no XP)
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
        const target = MOCK_TARGETS[modeId];
        return (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl flex flex-col items-center border border-white/20 animate-in slide-in-from-top-4">
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Current Objective</span>
                <div className="flex items-center gap-3">
                    {modeId === 'TARGET' && <img src={MOCK_TARGETS['TARGET'].image} className="w-8 h-8 rounded border border-white/20" />}
                    <span className="font-black text-xl text-white">{target.label}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black font-sans text-white overflow-hidden flex flex-col">

            {gameState === 'COUNTDOWN' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
                    <div className="text-center">
                        <h1 className="text-[120px] font-black text-white animate-[ping_1s_linear_infinite]">{countdown}</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest mt-8">Get ready… challenge incoming.</p>
                    </div>
                </div>
            )}

            {gameState === 'REVEAL' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-rose-600 animate-in fade-in duration-300">
                    <div className="text-center p-8">
                        <p className="text-rose-200 font-black uppercase text-xl mb-4">Find This First</p>
                        <div className="w-64 h-64 bg-white rounded-[40px] flex items-center justify-center mb-8 shadow-2xl mx-auto rotate-3">
                            {modeId === 'TARGET' ? (
                                <img src={MOCK_TARGETS['TARGET'].image} className="w-40 h-40 object-contain" />
                            ) : (
                                <div className="text-slate-900 font-black text-4xl text-center px-4">
                                    {MOCK_TARGETS[modeId].label}
                                </div>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-white">{MOCK_TARGETS[modeId].label}</h2>
                    </div>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <>
                    <div className="absolute inset-0 z-0">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60" />
                    </div>

                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                        <div className="flex flex-col gap-1">
                            <div className="bg-slate-900/80 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2 border border-slate-700">
                                <Clock className="w-4 h-4 text-white" />
                                <span className="font-mono font-bold text-xl">{gameTimer}s</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white shadow-black drop-shadow-md">Opponent</span>
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="bg-rose-500/90 backdrop-blur rounded-xl px-3 py-1.5 border border-rose-400">
                                <span className="font-black text-sm">Score: {opponentScore}</span>
                            </div>
                        </div>
                    </div>

                    {getTargetUI()}

                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/50" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500/50" />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent z-20">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Your Progress</p>
                                <div className="text-4xl font-black text-white">{playerScore} <span className="text-lg text-slate-500">/ {modeId === 'SPRINT' ? '3' : '-'}</span></div>
                            </div>
                            {modeId === 'SPRINT' && (
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i < playerScore ? 'bg-green-500 border-green-500' : 'border-slate-600 bg-slate-800'}`}>
                                            {i < playerScore && <CheckCircle2 className="w-5 h-5 text-white" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
