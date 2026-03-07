import React, { useState, useRef } from 'react';
import { UploadCloud, ChevronLeft, Award, Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Screen } from '../types';

interface TrainingScreenProps {
  onNavigate: (screen: Screen) => void;
  isPro?: boolean;
}

interface TrainingItem {
  id: string;
  image: string;
  predictedLabel: string;
  confidence: string;
  partNumber: string;
  color: string;
  currentVotes: number;
  required: number;
}

export const TrainingScreen: React.FC<TrainingScreenProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'menu' | 'requirements' | 'upload' | 'verify'>('menu');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verify mode state
  const [currentItem, setCurrentItem] = useState<TrainingItem | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [verifyCount, setVerifyCount] = useState(0);
  const [verifyXP, setVerifyXP] = useState(0);

  const loadNextTrainingItem = async () => {
    setVerifyLoading(true);
    setVoteFeedback(null);
    try {
      const response = await fetch('/api/dataset/training/next');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.item) {
          setCurrentItem(data.item);
        } else {
          setCurrentItem(null);
        }
      } else {
        setCurrentItem(null);
      }
    } catch (err) {
      console.error('Error loading training item:', err);
      setCurrentItem(null);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVote = async (confirmed: boolean) => {
    if (!currentItem) return;

    setVoteFeedback(confirmed ? 'correct' : 'incorrect');

    try {
      const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';
      await fetch('/api/dataset/training/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: currentItem.id,
          confirmed,
          userId,
          timestamp: Date.now(),
        }),
      });

      setVerifyCount(prev => prev + 1);
      setVerifyXP(prev => prev + 5);
    } catch (err) {
      console.error('Error submitting vote:', err);
    }

    // Load next item after short delay
    setTimeout(() => {
      loadNextTrainingItem();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;

        if (duration < 900) {
          setError(`Video is too short (${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s). Minimum required is 15 minutes.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        setUploading(true);
        setTimeout(() => {
          setUploading(false);
          setUploadSuccess(true);
          setTimeout(() => {
            setUploadSuccess(false);
            setMode('menu');
          }, 5000);
        }, 3000);
      };

      video.src = URL.createObjectURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans relative overflow-hidden text-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => mode === 'menu' ? onNavigate(Screen.HOME) : setMode('menu')}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">HQ Training Base</span>
        </div>

        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 relative z-10 no-scrollbar">

        {/* MENU MODE */}
        {mode === 'menu' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-2">Train the AI</h2>
              <p className="text-slate-400 text-sm">Help make HelloBrick smarter and earn XP</p>
            </div>

            {/* Upload Training Data Card */}
            <button
              onClick={() => setMode('requirements')}
              className="w-full bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-2xl p-6 text-left hover:border-orange-500/50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <UploadCloud className="w-7 h-7 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Upload Build Video</h3>
                  <p className="text-sm text-slate-400">Record your build and submit for review</p>
                </div>
                <div className="bg-orange-500/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-black text-orange-400">+500 XP</span>
                </div>
              </div>
            </button>

            {/* Verify Bricks Card */}
            <button
              onClick={() => { setMode('verify'); loadNextTrainingItem(); }}
              className="w-full bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border border-blue-500/30 rounded-2xl p-6 text-left hover:border-blue-500/50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Verify Bricks</h3>
                  <p className="text-sm text-slate-400">Answer quick questions to strengthen our dataset</p>
                </div>
                <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-black text-blue-400">+5 XP each</span>
                </div>
              </div>
            </button>

            <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-6">
              5 matching answers from different users = verified data
            </p>
          </div>
        )}

        {/* REQUIREMENTS MODE */}
        {mode === 'requirements' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 mb-4">
              <h2 className="text-xl font-bold text-white mb-4">Training Requirements</h2>
              <ul className="space-y-4">
                {[
                  { title: "Minimum 15 Minutes", desc: "Short videos are automatically rejected to ensure model stability.", icon: "⏱️" },
                  { title: "No Faces Allowed", desc: "For privacy, ensure no people are visible in the recording.", icon: "👤" },
                  { title: "Multi-Angle Coverage", desc: "Move around the bricks to capture all perspectives.", icon: "🔄" },
                  { title: "Bright Lighting", desc: "Clear visibility of part edges is critical for detection.", icon: "💡" }
                ].map((req, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="text-xl flex-shrink-0 mt-1">{req.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{req.title}</h4>
                      <p className="text-xs text-slate-400">{req.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setMode('upload')}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all transform active:scale-[0.98]"
            >
              I Understand, Let's Go
            </button>
            <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              +500 XP PER APPROVED SUBMISSION
            </p>
          </div>
        )}

        {/* UPLOAD MODE */}
        {mode === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              onClick={!uploading && !uploadSuccess ? triggerFileSelect : undefined}
              className={`bg-slate-900 border-2 border-dashed ${uploadSuccess ? 'border-green-500 bg-green-500/10' : error ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-orange-500/50 hover:bg-white/5'} rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group mb-8`}
            >
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              {uploading ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-white">Uploading Dataset...</h3>
                  <p className="text-sm text-slate-400 mt-2">Encoding & hashing video packets</p>
                </div>
              ) : uploadSuccess ? (
                <div className="flex flex-col items-center py-6">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Sent for Review!</h3>
                  <p className="text-green-400 font-bold text-sm">+500 XP Pending Approval</p>
                  <p className="text-xs text-slate-400 mt-4">Admins will review your data within 24h.</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Select Your Build Video</h3>
                  <p className="text-sm text-slate-400 mb-6 px-12">Choose a video file that meets all the high-quality requirements.</p>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl text-xs mb-4 animate-in shake-in duration-300">
                      {error}
                    </div>
                  )}

                  <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    BROWSE FILES
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => { setMode('requirements'); setError(null); }}
              className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Back to Requirements
            </button>
          </div>
        )}

        {/* VERIFY MODE */}
        {mode === 'verify' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Bar */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">{verifyCount}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified</p>
              </div>
              <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-blue-400">+{verifyXP}</p>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">XP Earned</p>
              </div>
            </div>

            {verifyLoading ? (
              <div className="flex flex-col items-center py-16">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                <p className="text-slate-400 font-bold text-sm">Loading next brick...</p>
              </div>
            ) : !currentItem ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">All Caught Up!</h3>
                <p className="text-slate-400 text-sm mb-6">No more bricks to verify right now. Scan more bricks to build the queue!</p>
                <button
                  onClick={() => onNavigate(Screen.SCANNER)}
                  className="px-6 py-3 bg-blue-500 rounded-2xl font-bold text-white active:scale-95 transition-transform"
                >
                  Go Scan Bricks
                </button>
              </div>
            ) : (
              <div>
                {/* Brick Image */}
                <div className={`bg-slate-900 border-2 rounded-3xl p-6 mb-6 flex flex-col items-center transition-all ${voteFeedback === 'correct' ? 'border-green-500/50 bg-green-500/5' :
                  voteFeedback === 'incorrect' ? 'border-red-500/50 bg-red-500/5' :
                    'border-white/10'
                  }`}>
                  <div className="w-48 h-48 bg-slate-800 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                    {currentItem.image ? (
                      <img src={currentItem.image} alt="Brick" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-6xl">🧱</span>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                      {currentItem.currentVotes}/{currentItem.required} votes
                    </p>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Is this a {currentItem.color !== 'Unknown' ? `${currentItem.color} ` : ''}{currentItem.predictedLabel}?
                    </h3>
                    {currentItem.partNumber !== 'Unknown' && (
                      <p className="text-slate-400 text-sm font-mono">#{currentItem.partNumber}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-2">Confidence: {currentItem.confidence}</p>
                  </div>
                </div>

                {/* Vote Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(false)}
                    disabled={voteFeedback !== null}
                    className={`flex-1 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${voteFeedback === 'incorrect'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 border-2 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      }`}
                  >
                    <XCircle className="w-6 h-6" />
                    No
                  </button>
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voteFeedback !== null}
                    className={`flex-1 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${voteFeedback === 'correct'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-500/10 border-2 border-green-500/30 text-green-400 hover:bg-green-500/20'
                      }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Yes
                  </button>
                </div>

                {voteFeedback && (
                  <p className="text-center text-blue-400 font-bold text-sm mt-4 animate-in fade-in">
                    +5 XP earned!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
