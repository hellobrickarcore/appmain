import { detectBricks, DetectionStabilizer, brickDetectionService } from '../services/brickDetectionService';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Zap, ShieldCheck, ShieldAlert, Shield, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen } from '../types';
import { FrameDetection, ScanFrameResponse, bboxToRenderBox } from '../types/detection';
import { saveCollectionToSupabase } from '../services/trainingDataService';
import { usageService } from '../services/usageService';
import { analytics } from '../services/analyticsService';
import { CONFIG } from '../services/configService';
import { recordScan } from '../services/supabaseService';

interface ScannerScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  challenge?: any;
  onPhaseChange?: (phase: 'preview' | 'scanning' | 'results') => void;
  mode?: 'scan' | 'h2h';
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8'];

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

// ─── NMS Deduplication for multi-pass merge ───────────────────────
function nmsDedup(detections: FrameDetection[], iouThreshold = 0.35): FrameDetection[] {
  const sorted = [...detections].sort((a, b) =>
    b.prediction.identityConfidence - a.prediction.identityConfidence
  );
  const kept: FrameDetection[] = [];

  sorted.forEach(curr => {
    const isDuplicate = kept.some(existing => {
      const b1 = curr.geometry.bbox;
      const b2 = existing.geometry.bbox;

      const xIn1 = Math.max(b1.xMin, b2.xMin);
      const yIn1 = Math.max(b1.yMin, b2.yMin);
      const xIn2 = Math.min(b1.xMax, b2.xMax);
      const yIn2 = Math.min(b1.yMax, b2.yMax);

      if (xIn2 <= xIn1 || yIn2 <= yIn1) return false;

      const intersection = (xIn2 - xIn1) * (yIn2 - yIn1);
      const area1 = (b1.xMax - b1.xMin) * (b1.yMax - b1.yMin);
      const area2 = (b2.xMax - b2.xMin) * (b2.yMax - b2.yMin);
      const union = area1 + area2 - intersection;
      const iou = intersection / union;
      const containment1 = intersection / area1;
      const containment2 = intersection / area2;

      return iou > iouThreshold || containment1 > 0.95 || containment2 > 0.95;
    });

    if (!isDuplicate) {
      kept.push(curr);
    }
  });

  return kept;
}

// ─── Color correction: analyze actual pixels to fix misclassified white bricks ───
function correctBrickColors(detections: FrameDetection[], frameCanvas: HTMLCanvasElement): FrameDetection[] {
  const ctx = frameCanvas.getContext('2d');
  if (!ctx) return detections;

  return detections.map(det => {
    const bbox = det.geometry.bbox;
    const x = Math.max(0, Math.floor(bbox.xMin));
    const y = Math.max(0, Math.floor(bbox.yMin));
    const w = Math.min(frameCanvas.width - x, Math.floor(bbox.xMax - bbox.xMin));
    const h = Math.min(frameCanvas.height - y, Math.floor(bbox.yMax - bbox.yMin));

    if (w <= 0 || h <= 0) return det;

    try {
      // Sample a grid of pixels from the center 60% of the brick (avoid edges/shadows)
      const cx = x + Math.floor(w * 0.2);
      const cy = y + Math.floor(h * 0.2);
      const cw = Math.floor(w * 0.6);
      const ch = Math.floor(h * 0.6);
      
      if (cw <= 0 || ch <= 0) return det;
      
      const imageData = ctx.getImageData(cx, cy, cw, ch);
      const pixels = imageData.data;
      const sampleCount = Math.min(100, Math.floor(pixels.length / 4));
      const step = Math.max(1, Math.floor(pixels.length / 4 / sampleCount));

      let totalR = 0, totalG = 0, totalB = 0;
      let actualSamples = 0;

      for (let i = 0; i < pixels.length; i += step * 4) {
        totalR += pixels[i];
        totalG += pixels[i + 1];
        totalB += pixels[i + 2];
        actualSamples++;
      }

      if (actualSamples === 0) return det;

      const avgR = totalR / actualSamples;
      const avgG = totalG / actualSamples;
      const avgB = totalB / actualSamples;
      const brightness = (avgR + avgG + avgB) / 3;

      // Calculate saturation (how colorful vs gray the pixel is)
      const maxC = Math.max(avgR, avgG, avgB);
      const minC = Math.min(avgR, avgG, avgB);
      const saturation = maxC > 0 ? ((maxC - minC) / maxC) * 255 : 0;

      // White brick detection: high brightness, low saturation
      if (brightness > 180 && saturation < 40) {
        console.log(`[ColorCorrect] Brick at (${x},${y}) → WHITE (brightness=${brightness.toFixed(0)}, sat=${saturation.toFixed(0)}, was: ${det.prediction.brickColorName})`);
        return {
          ...det,
          prediction: {
            ...det.prediction,
            brickColorName: 'White',
            colorConfidence: 0.95,
          }
        };
      }
    } catch (e) {
      // Ignore pixel sampling errors
    }

    return det;
  });
}

// ─── Crop-based detection: send a cropped region to the API and remap coords ───
async function detectFromRegion(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; w: number; h: number },
  _originalWidth?: number,
  _originalHeight?: number
): Promise<FrameDetection[]> {
  // _originalWidth/_originalHeight reserved for future use
  void _originalWidth; void _originalHeight;
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = region.w;
  cropCanvas.height = region.h;
  const ctx = cropCanvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(canvas, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);

  try {
    const response = await detectBricks(cropCanvas);
    // Remap bounding boxes back to full-frame coordinates
    return response.detections.map(det => ({
      ...det,
      detectionId: `${det.detectionId}_r${region.x}_${region.y}`,
      geometry: {
        ...det.geometry,
        bbox: {
          ...det.geometry.bbox,
          xMin: det.geometry.bbox.xMin + region.x,
          yMin: det.geometry.bbox.yMin + region.y,
          xMax: det.geometry.bbox.xMax + region.x,
          yMax: det.geometry.bbox.yMax + region.y,
        }
      }
    }));
  } catch (err) {
    console.warn('[MultiPass] Region scan failed:', err);
    return [];
  }
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate, challenge, onPhaseChange, mode = 'scan' }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef(false);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const frameDimsRef = useRef({ w: 1080, h: 1920 });
  const autoCaptureTriggeredRef = useRef(false);

  // State
  const [shouldAutoCapture, setShouldAutoCapture] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'scanning' | 'results'>(mode === 'scan' ? 'scanning' : 'preview');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<FrameDetection[]>([]);
  const [lastResponse, setLastResponse] = useState<ScanFrameResponse | null>(null);
  const [selectedBricks, setSelectedBricks] = useState<Set<string>>(new Set());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qualityAdvice, setQualityAdvice] = useState<string | null>(mode === 'h2h' ? 'Position opponent QR code' : null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Multi-pass state
  const [multiPassActive, setMultiPassActive] = useState(false);
  const [passNumber, setPassNumber] = useState(0);
  const [laserDirection, setLaserDirection] = useState<'horizontal' | 'vertical' | null>(null);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

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
          setQualityAdvice('Camera API not supported.');
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
        setQualityAdvice(err.name === 'NotAllowedError' ? 'Permission denied.' : 'Camera error.');
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

  useEffect(() => {
    if (streamRef.current && videoRef.current && (phase === 'scanning' || phase === 'preview')) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('[Scanner] Play error:', e));
      }
    }
  }, [phase, hasPermission]);

  useEffect(() => {
    if (hasPermission && phase === 'preview') {
      setPhase('scanning');
      analytics.track('scan_started');
    }
  }, [hasPermission]);

  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(2000, 0.18, 15));
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');

  // Diagnostic Health Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthUrl = `${new URL(CONFIG.DETECT_IMAGE).origin}/api/health`;
        const resp = await fetch(healthUrl, { method: 'GET' });
        setApiStatus(resp.ok ? 'connected' : 'error');
      } catch {
        setApiStatus('error');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── API Detection Loop ────────────────
  useEffect(() => {
    if (phase !== 'scanning' || !hasPermission || multiPassActive) return;

    let timeoutId: any;
    let isActive = true;

    const detectLoop = async () => {
      if (!isActive || phase !== 'scanning' || !videoRef.current || isDetectingRef.current) {
        if (isActive) timeoutId = setTimeout(detectLoop, 200);
        return;
      }

      if (videoRef.current.readyState < 2) {
        timeoutId = setTimeout(detectLoop, 200);
        return;
      }

      try {
        isDetectingRef.current = true;
        const response: ScanFrameResponse = await detectBricks(videoRef.current);

        if (phase === 'scanning' && !isProcessing && isActive) {
          const stabilizedDetections = stabilizerRef.current.stabilize(response.detections);
          setDetectedObjects(stabilizedDetections);
          setLastResponse(response);

          if (stabilizedDetections.length >= 3 && !multiPassActive && !autoCaptureTriggeredRef.current) {
             autoCaptureTriggeredRef.current = true;
             setShouldAutoCapture(true);
          }

          if (challenge) {
            const target = challenge.target?.toLowerCase() || '';
            const goalMet = response.detections.some(obj => {
              const name = obj.prediction.brickName?.toLowerCase() || '';
              const color = obj.prediction.brickColorName?.toLowerCase() || '';
              return (obj.prediction.identityConfidence || 0) >= 0.7 && (name.includes(target) || color.includes(target));
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
        console.error('Detection error:', err);
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
  }, [phase, hasPermission, isProcessing, challenge, saveSuccess, multiPassActive]);

  useEffect(() => {
    if (phase === 'scanning') {
      autoCaptureTriggeredRef.current = false;
    }
  }, [phase]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  // ─── MULTI-PASS CAPTURE ─────────────────────────────────────────
  // Strategy: Tile the camera frame into overlapping regions.
  // Each region gets sent to YOLO at full 1024px resolution,
  // so bricks that were 40-60px in the full frame become 80-120px
  // in a quadrant — well within YOLO's reliable detection range.
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || multiPassActive) return;
    
    // 1. Freeze the frame
    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth === 0) return;

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = videoWidth;
    frameCanvas.height = videoHeight;
    const ctx = frameCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    // Store dimensions before the video element gets unmounted
    frameDimsRef.current = { w: videoWidth, h: videoHeight };

    const imageDataUrl = frameCanvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageDataUrl);
    setMultiPassActive(true);
    setIsProcessing(true);
    isDetectingRef.current = true;

    analytics.track('multipass_scan_started');

    let allDetections: FrameDetection[] = [];

    try {
      // ── PASS 1: Full frame — catches obvious/large bricks ──
      setPassNumber(1);
      setLaserDirection('horizontal');

      const pass1Response = await detectBricks(frameCanvas);
      allDetections = [...pass1Response.detections];
      console.log(`[MultiPass] Pass 1 (full frame): ${pass1Response.detections.length} detections`);
      
      setDetectedObjects(nmsDedup(allDetections));
      setLastResponse(pass1Response);
      await new Promise(r => setTimeout(r, 400));

      // ── PASS 2: 6 Overlapping Sectors (3 rows, 2 columns) ──
      // This is the key pass. Mobile video is tall (e.g. 1080x1920).
      // YOLO expects square inputs. If we use a 2x2 grid, each chunk is tall and gets severely 
      // squished by YOLO, hiding edge bricks. A 3x2 grid makes each chunk nearly perfectly square!
      setPassNumber(2);
      setLaserDirection('vertical');

      const colW = videoWidth / 2;
      const rowH = videoHeight / 3;
      // Increased overlap ensures bricks on boundaries aren't missed
      const oX = 150; 
      const oY = 150;

      const sectors = [
        // Top Row
        { x: 0, y: 0, w: colW + oX, h: rowH + oY },
        { x: colW - oX, y: 0, w: colW + oX, h: rowH + oY },
        // Middle Row
        { x: 0, y: rowH - oY, w: colW + oX, h: rowH + oY * 2 },
        { x: colW - oX, y: rowH - oY, w: colW + oX, h: rowH + oY * 2 },
        // Bottom Row
        { x: 0, y: rowH * 2 - oY, w: colW + oX, h: rowH + oY },
        { x: colW - oX, y: rowH * 2 - oY, w: colW + oX, h: rowH + oY },
      ];

      // Run sectors in pairs to avoid server overload
      const [s1, s2] = await Promise.all([
        detectFromRegion(frameCanvas, sectors[0]),
        detectFromRegion(frameCanvas, sectors[1]),
      ]);
      allDetections = [...allDetections, ...s1, ...s2];
      setDetectedObjects(nmsDedup(allDetections));

      const [s3, s4] = await Promise.all([
        detectFromRegion(frameCanvas, sectors[2]),
        detectFromRegion(frameCanvas, sectors[3]),
      ]);
      allDetections = [...allDetections, ...s3, ...s4];
      setDetectedObjects(nmsDedup(allDetections));

      const [s5, s6] = await Promise.all([
        detectFromRegion(frameCanvas, sectors[4]),
        detectFromRegion(frameCanvas, sectors[5]),
      ]);
      allDetections = [...allDetections, ...s5, ...s6];
      setDetectedObjects(nmsDedup(allDetections));
      console.log(`[MultiPass] Pass 2 (6 sectors): +${s1.length + s2.length + s3.length + s4.length + s5.length + s6.length} detections`);


      await new Promise(r => setTimeout(r, 300));

      // ── PASS 3: Edge border strips — catches bricks at the outer edges of the camera ──
      // Bricks at the very edge of the frame often get clipped by quadrant boundaries.
      // These 4 strips scan the outer 35% of each border at full resolution.
      setPassNumber(3);
      setLaserDirection('horizontal');

      const edgeDepthX = Math.floor(videoWidth * 0.35);
      const edgeDepthY = Math.floor(videoHeight * 0.35);

      const edgeStrips = [
        // Top strip (full width × top 35%)
        { x: 0, y: 0, w: videoWidth, h: edgeDepthY },
        // Bottom strip (full width × bottom 35%)
        { x: 0, y: videoHeight - edgeDepthY, w: videoWidth, h: edgeDepthY },
        // Left strip (left 35% × full height)
        { x: 0, y: 0, w: edgeDepthX, h: videoHeight },
        // Right strip (right 35% × full height)
        { x: videoWidth - edgeDepthX, y: 0, w: edgeDepthX, h: videoHeight },
      ];

      // Run edges in pairs
      const [edgeTop, edgeBottom] = await Promise.all([
        detectFromRegion(frameCanvas, edgeStrips[0]),
        detectFromRegion(frameCanvas, edgeStrips[1]),
      ]);
      allDetections = [...allDetections, ...edgeTop, ...edgeBottom];

      const [edgeLeft, edgeRight] = await Promise.all([
        detectFromRegion(frameCanvas, edgeStrips[2]),
        detectFromRegion(frameCanvas, edgeStrips[3]),
      ]);
      allDetections = [...allDetections, ...edgeLeft, ...edgeRight];
      setDetectedObjects(nmsDedup(allDetections));
      console.log(`[MultiPass] Pass 3 (edges): +${edgeTop.length + edgeBottom.length + edgeLeft.length + edgeRight.length} detections`);

      // ── BONUS PASS: White brick boost — darkened frame helps YOLO see white bricks ──
      try {
        const darkCanvas = document.createElement('canvas');
        darkCanvas.width = frameCanvas.width;
        darkCanvas.height = frameCanvas.height;
        const darkCtx = darkCanvas.getContext('2d');
        if (darkCtx) {
          darkCtx.filter = 'brightness(0.7) contrast(1.3)';
          darkCtx.drawImage(frameCanvas, 0, 0);
          const darkDetections = await detectFromRegion(darkCanvas, { x: 0, y: 0, w: darkCanvas.width, h: darkCanvas.height });
          allDetections = [...allDetections, ...darkDetections];
          console.log(`[MultiPass] White brick boost: +${darkDetections.length} detections`);
        }
      } catch (boostErr) {
        console.warn('[MultiPass] White brick boost failed:', boostErr);
      }

    } catch (err) {
      console.error('[MultiPass] Error during passes:', err);
    }

    // ── FINAL: deduplication, color correction, and show results ──
    // Relaxed NMS to 0.60 so tightly clustered/overlapping bricks aren't instantly merged
    let finalDetections = nmsDedup(allDetections, 0.60);
    finalDetections = correctBrickColors(finalDetections, frameCanvas);
    console.log(`[MultiPass] FINAL: ${finalDetections.length} unique bricks (from ${allDetections.length} raw across all passes)`);

    // Now process like the old single-pass did
    setPhase('results');
    setMultiPassActive(false);
    setLaserDirection(null);
    setPassNumber(0);

    // Defer expensive cropping
    setTimeout(async () => {
      try {
        const capturedBricks = finalDetections.filter(b => (b.prediction.identityConfidence || 0) >= 0.1);

        const enrichedBricks = await Promise.all(capturedBricks.map(async (b, idx) => {
          let snippet;
          if (imageDataUrl && idx < 30) {
            try { snippet = await cropBrickImage(imageDataUrl, b.geometry.bbox); } catch (e) {}
          }
          return { ...b, snippet };
        }));

        setDetectedObjects(enrichedBricks);
        setSelectedBricks(new Set(capturedBricks.map(b => b.detectionId)));
        analytics.track('multipass_scan_completed', { brick_count: capturedBricks.length, raw_count: allDetections.length });
      } catch (err) {
        console.error("Capture processing failed:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  }, [captureImage, detectedObjects, multiPassActive]);

  useEffect(() => {
    if (shouldAutoCapture) {
      setShouldAutoCapture(false);
      handleCapture();
    }
  }, [shouldAutoCapture, handleCapture]);

  const handleSaveSelected = async () => {
    const bricksToSave = detectedObjects.filter(obj => selectedBricks.has(obj.detectionId));
    if (bricksToSave.length === 0) return;

    setIsProcessing(true);
    const userId = localStorage.getItem('hellobrick_userId') || `user_${Date.now()}`;
    localStorage.setItem('hellobrick_userId', userId);

    try {
      const bricksWithMetaData = await Promise.all(bricksToSave.map(async (obj) => {
        const pred = obj.prediction;
        const bbox = obj.geometry.bbox;
        const partId = pred.brickPartNum;
        let brickImage = `https://cdn.rebrickable.com/media/parts/elements/${partId}.jpg`;
        if (capturedImage) {
          try { brickImage = await cropBrickImage(capturedImage, bbox); } catch (e) { console.warn('Crop failed:', e); }
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
          bbox: { x: bbox.xMin, y: bbox.yMin, width: bbox.xMax - bbox.xMin, height: bbox.yMax - bbox.yMin }
        };
      }));

      const stored = localStorage.getItem('hellobrick_collection');
      let existingBricks: any[] = [];
      if (stored) {
        try { existingBricks = JSON.parse(stored).bricks || []; } catch { }
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
      import('../services/xpService').then(({ xpHelpers }) => { xpHelpers.scanDetection(bricksToSave.length, bricksToSave.length); });
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      
      // Phase 11 Admin Fix: Record scan telemetry to Supabase 'scans' table via Bridge
      const avgConf = bricksToSave.length > 0 
        ? bricksToSave.reduce((acc, b) => acc + (b.prediction?.identityConfidence || 0), 0) / bricksToSave.length 
        : 0;
      recordScan(bricksToSave.length, bricksToSave.map(b => b.detectionId), avgConf, lastResponse?.inferenceMs || 0).catch(() => {});

      saveCollectionToSupabase(userId, bricksWithMetaData).catch(() => { });

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 }, colors: ['#F59E0B', '#EF4444', '#3B82F6', '#10B981'] });
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
      <div className="absolute top-[max(env(safe-area-inset-top),16px)] left-0 right-0 px-6 flex justify-between items-center z-50">
        <button onClick={() => onNavigate(Screen.HOME)} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-95 transition-all">
          <X className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg active:scale-95 transition-all">
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {(phase === 'preview' || phase === 'scanning') && (
        <>
          <div className="relative flex-1 bg-black overflow-hidden" ref={overlayContainerRef}>
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-6 z-50">
                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-sm">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">{qualityAdvice || 'Camera Access Required'}</h3>
                  <button onClick={() => window.location.reload()} className="mt-2 w-full bg-orange-500 text-white font-bold py-3 rounded-lg">Retry</button>
                </div>
              </div>
            )}

            {/* Live video or frozen multi-pass frame */}
            {multiPassActive && capturedImage ? (
              <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Scanning..." />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />
            )}

            <div className="absolute top-0 left-0 right-0 p-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex items-center justify-between z-50 pointer-events-none">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[14px] font-black text-white/90 uppercase tracking-[0.15em]">
                      {multiPassActive ? `SCANNING PILE ${passNumber}/3` : 'LOOKING FOR BRICKS...'}
                    </span>
                  </div>
                </div>
            </div>

            {/* ─── Laser Scan Animation ──────────────────── */}
            {multiPassActive && laserDirection === 'horizontal' && (
              <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                <div
                  className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  style={{
                    animation: 'laserSweepV 2s ease-in-out infinite',
                  }}
                />
                <style>{`
                  @keyframes laserSweepV {
                    0% { top: 5%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 95%; opacity: 0; }
                  }
                `}</style>
              </div>
            )}
            {multiPassActive && laserDirection === 'vertical' && (
              <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-orange-400 to-transparent shadow-[0_0_20px_rgba(251,146,60,0.6)]"
                  style={{
                    animation: 'laserSweepH 2s ease-in-out infinite',
                  }}
                />
                <style>{`
                  @keyframes laserSweepH {
                    0% { left: 5%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: 95%; opacity: 0; }
                  }
                `}</style>
              </div>
            )}

            {/* Detection overlays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {detectedObjects.map((obj, i) => {
                const container = overlayContainerRef.current;
                if (!container) return null;
                // Use stored frame dimensions (stable even when <video> is unmounted during multi-pass)
                const sourceW = multiPassActive ? frameDimsRef.current.w : (videoRef.current?.videoWidth || frameDimsRef.current.w);
                const sourceH = multiPassActive ? frameDimsRef.current.h : (videoRef.current?.videoHeight || frameDimsRef.current.h);
                const renderBox = bboxToRenderBox(obj.geometry.bbox, sourceW, sourceH, container.clientWidth, container.clientHeight, 'cover');
                return (
                  <div key={obj.detectionId || i} className="absolute" style={{ top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`, border: '1.5px solid #3B82F6', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                    {obj.prediction.identityConfidence > 0.15 && (
                      <div className="absolute -top-7 left-0 bg-[#3B82F6]/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black text-white uppercase truncate">
                        {brickDetectionService.generationFallbackLabel(obj)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capture button - hidden during multi-pass */}
          {!multiPassActive && (
            <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center z-50">
                <button onClick={handleCapture} disabled={isProcessing} className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center group active:scale-95 transition-all shadow-2xl">
                  <div className="w-[70px] h-[70px] rounded-full bg-white group-active:bg-slate-100 transition-colors shadow-inner" />
                </button>
            </div>
          )}

          {/* Multi-pass progress indicator */}
          {multiPassActive && (
            <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center justify-center z-50 gap-3">
              <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Finding what you can build... Pass {passNumber}/3
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(n => (
                  <div
                    key={n}
                    className={`w-10 h-1 rounded-full transition-all duration-500 ${
                      n <= passNumber ? 'bg-cyan-400' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {detectedObjects.length} bricks found so far
              </span>
            </div>
          )}
        </>
      )}

      {phase === 'results' && (
        <div className="absolute inset-0 bg-[#0A0F1C] z-50 overflow-hidden flex flex-col">
          {/* Top Navbar */}
          <div className="absolute top-[max(env(safe-area-inset-top),16px)] left-0 right-0 px-6 flex justify-between items-center z-50">
            <button onClick={() => setPhase('scanning')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Epic Hero Image Area */}
          <div className="relative h-[40%] min-h-[300px] w-full bg-black/50">
            {capturedImage && (
              <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen" alt="Scanned Pile" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/50 to-transparent" />
            
            {/* Overlay the detected boxes on the hero image */}
            <div className="absolute inset-0 pointer-events-none">
              {detectedObjects.map((obj, i) => {
                const img = document.getElementById('captured-result-image') as HTMLImageElement;
                if (!img?.parentElement) return null;
                const sourceW = lastResponse?.frameWidth || frameDimsRef.current.w;
                const sourceH = lastResponse?.frameHeight || frameDimsRef.current.h;
                const renderBox = bboxToRenderBox(obj.geometry.bbox, sourceW, sourceH, img.parentElement.clientWidth, img.parentElement.clientHeight, 'cover');
                const isSelected = selectedBricks.has(obj.detectionId);
                return (
                  <div key={obj.detectionId || i} className="absolute border-[1.5px] rounded-sm transition-all" style={{ top: `${renderBox.top}%`, left: `${renderBox.left}%`, width: `${renderBox.width}%`, height: `${renderBox.height}%`, borderColor: isSelected ? '#3B82F6' : 'rgba(255,255,255,0.2)', opacity: isSelected ? 1 : 0.4 }} />
                );
              })}
              {/* Dummy img to trigger sizing */}
              {capturedImage && <img id="captured-result-image" src={capturedImage} className="hidden" alt="hidden" />}
            </div>

            <div className="absolute bottom-6 left-6 right-6">
               <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Scan Complete</span>
               </div>
               <h1 className="text-4xl font-black text-white leading-tight">
                  <span className="text-blue-400">{detectedObjects.length}</span> Bricks<br />Detected
               </h1>
            </div>
          </div>

          {/* Premium Bottom Sheet */}
          <div className="flex-1 bg-[#0A0F1C] px-6 pt-4 pb-8 flex flex-col">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Ready to Build?</span>
              <span className="text-blue-500">{selectedBricks.size} selected</span>
            </h2>

            {/* List of Bricks */}
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-6">
              {detectedObjects.map((obj, i) => {
                const isSelected = selectedBricks.has(obj.detectionId);
                const partNum = obj.prediction.brickPartNum || '3001';
                return (
                  <div key={obj.detectionId || i} onClick={() => { const s = new Set(selectedBricks); isSelected ? s.delete(obj.detectionId) : s.add(obj.detectionId); setSelectedBricks(s); }} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5'}`}>
                    <div className="relative w-12 h-12 bg-slate-800 rounded-xl overflow-hidden border border-white/10 p-1 flex items-center justify-center">
                      <img src={(obj as any).snippet || `https://cdn.rebrickable.com/media/parts/elements/${partNum}.jpg`} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">{brickDetectionService.generationFallbackLabel(obj)}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{Math.round(obj.prediction.identityConfidence * 100)}% match</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/20'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Big Dopamine CTAs */}
            <div className="pt-4 flex gap-3">
               <button 
                  onClick={async () => {
                    if (navigator.share) {
                      try { await navigator.share({ title: 'HelloBrick', text: `I just scanned my pile and found ${detectedObjects.length} bricks!`, url: 'https://hellobrick.app' }); } catch (e) {}
                    } else { alert('Sharing not supported on this device'); }
                  }} 
                  className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white/10 text-white active:scale-95 transition-all"
                >
                  <Share2 className="w-6 h-6" />
                </button>
               <button onClick={handleSaveSelected} className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                 <span>Save & Build</span>
                 <Zap className="w-5 h-5 fill-current" />
               </button>
            </div>
          </div>
        </div>
      )}
      {isProcessing && !multiPassActive && <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
    </div>
  );
};
