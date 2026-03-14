import React, { useState, useRef } from 'react';
import { UploadCloud, ChevronLeft, Award, Loader2, CheckCircle, XCircle, Eye, Sparkles, Shield, Info, Play, Brain, Database } from 'lucide-react';
import { Screen } from '../types';
import { submitTrainingFeedback } from '../services/trainingFeedbackService';
import { CONFIG } from '../services/configService';

interface TrainingScreenProps {
  onNavigate: (screen: Screen) => void;
  isPro?: boolean;
}

interface TrainingItem {
  id: string;
  image: string;
  predictedLabel: string;
  confidence: any;
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
      const response = await fetch(CONFIG.DATASET_NEXT);
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
      
      const formData = new FormData();
      formData.append('itemId', currentItem.id);
      formData.append('confirmed', String(confirmed));
      formData.append('userId', userId);

      await fetch(CONFIG.DATASET_VOTE, {
        method: 'POST',
        body: formData
      });

      await submitTrainingFeedback({
        itemId: currentItem.id,
        confirmed,
        userId,
        originalLabel: currentItem.predictedLabel,
        timestamp: Date.now()
      });

      setVerifyCount(prev => prev + 1);
      setVerifyXP(prev => prev + 10); // Boosted XP to match user desire for "totalling up"
      
      const storedProgress = localStorage.getItem('hellobrick_progress');
      if (storedProgress) {
        try {
          const progress = JSON.parse(storedProgress);
          progress.xp += 10;
          localStorage.setItem('hellobrick_progress', JSON.stringify(progress));
        } catch (e) {}
      }

    } catch (err) {
      console.error('Error submitting vote:', err);
    }

    setTimeout(() => {
      loadNextTrainingItem();
    }, 600);
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

        if (duration < 300) { // Reduced to 5 mins for prototype ease
          setError(`Video too short (${Math.floor(duration)}s). Min 5 mins.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('userId', localStorage.getItem('hellobrick_userId') || 'anonymous');

        fetch(CONFIG.DATASET_UPLOAD, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
          setUploading(false);
          if (data.success) {
            setUploadSuccess(true);
            setTimeout(() => { setUploadSuccess(false); setMode('menu'); }, 4000);
          } else { setError(data.error || 'Upload failed'); }
        })
        .catch(err => { setUploading(false); setError('Network error during upload'); });
      };
      video.src = URL.createObjectURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => mode === 'menu' ? onNavigate(Screen.HOME) : setMode('menu')}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Neural Training</h1>
           <div className="flex items-center gap-1.5 mt-0.5">
              <Brain className="w-2.5 h-2.5 text-orange-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Model v4.2 Internal</span>
           </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-10 relative z-10 no-scrollbar">

        {mode === 'menu' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-left mb-10">
              <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">AI Workbench</h2>
              <p className="text-slate-500 font-bold text-base leading-relaxed">Contribute high-quality data to amplify our detection accuracy.</p>
            </div>

            <button
              onClick={() => { setMode('verify'); loadNextTrainingItem(); }}
              className="w-full bg-white/5 border border-white/10 rounded-[40px] p-8 text-left hover:border-orange-500/50 transition-all active:scale-[0.98] group shadow-2xl"
            >
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-orange-500/10 rounded-[28px] flex items-center justify-center border border-orange-500/20 shadow-2xl group-hover:scale-105 transition-transform">
                  <Eye className="w-10 h-10 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-2xl text-white mb-1">Verify Bricks</h3>
                  <p className="text-[13px] text-slate-500 font-medium">Earn XP by validating AI object labels</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-xl">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">+10 XP</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('requirements')}
              className="w-full bg-white/5 border border-white/10 rounded-[40px] p-8 text-left hover:border-indigo-500/50 transition-all active:scale-[0.98] group shadow-2xl"
            >
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[28px] flex items-center justify-center border border-indigo-500/20 shadow-2xl group-hover:scale-105 transition-transform">
                  <Database className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-2xl text-white mb-1">Ingest Data</h3>
                  <p className="text-[13px] text-slate-500 font-medium">Upload build videos for full model ingest</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-xl">
                    <Award className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master XP</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'requirements' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pt-6">
            <div className="bg-white/5 border border-white/5 rounded-[48px] p-10 mb-6 shadow-3xl">
              <div className="flex items-center gap-3 mb-8">
                 <Info className="w-5 h-5 text-indigo-500" />
                 <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em]">Protocol Requirements</h2>
              </div>
              <ul className="space-y-8">
                {[
                  { title: "5 Minute Minimum", desc: "Shorter streams do not provide enough spatial variety for neural mapping.", icon: <Clock className="w-5 h-5" /> },
                  { title: "Privacy Lockdown", desc: "Zero facial visibility. Focus exclusively on the components.", icon: <Shield className="w-5 h-5" /> },
                  { title: "360° Perspective", desc: "Rotate parts to allow for depth-map generation.", icon: <Eye className="w-5 h-5" /> },
                  { title: "Lumen Optimization", desc: "Maintain high-contrast lighting for edge-case detection.", icon: <Sparkles className="w-5 h-5" /> }
                ].map((req, i) => (
                  <li key={i} className="flex gap-5 items-start px-2">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 border border-white/10">{req.icon}</div>
                    <div>
                      <h4 className="font-black text-base text-white mb-1">{req.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{req.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setMode('upload')}
              className="w-full py-6 bg-white text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-3xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-4 h-4 fill-current" />
              Upload Feed
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pt-6">
            <div
              onClick={!uploading && !uploadSuccess ? () => fileInputRef.current?.click() : undefined}
              className={`relative border-2 border-dashed ${uploadSuccess ? 'border-emerald-500 bg-emerald-500/5' : error ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08]'} rounded-[56px] p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-3xl overflow-hidden group mb-10`}
            >
              <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

              {uploading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="relative">
                     <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-white italic">Ingesting...</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4">Transmitting Neural Packets</p>
                </div>
              ) : uploadSuccess ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-3xl border border-emerald-500/20">
                    <Award className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">Payload Secure</h3>
                  <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">+500 XP Pending Verification</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Sync Visual Data</h3>
                  <p className="text-sm text-slate-500 mb-10 px-6 font-medium leading-relaxed">Select build footage for server-side neural integration.</p>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                      {error}
                    </div>
                  )}

                  <div className="px-8 py-3.5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    Browse Archives
                  </div>
                </>
              )}
            </div>

            <button onClick={() => { setMode('requirements'); setError(null); }} className="w-full py-2 text-slate-700 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors">Abort Sync</button>
          </div>
        )}

        {mode === 'verify' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* HUD Stats */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-white/5 border border-white/5 rounded-[32px] p-6 text-center backdrop-blur-md">
                <p className="text-3xl font-black text-white mb-1">{verifyCount}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Objects Confirmed</p>
              </div>
              <div className={`flex-1 ${verifyXP > 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/5'} rounded-[32px] p-6 text-center transition-colors`}>
                <p className={`text-3xl font-black mb-1 ${verifyXP > 0 ? 'text-indigo-400' : 'text-slate-800'}`}>+{verifyXP}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">XP Accumulated</p>
              </div>
            </div>

            {verifyLoading ? (
              <div className="flex flex-col items-center py-24">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Querying Database...</p>
              </div>
            ) : !currentItem ? (
              <div className="text-center py-20 bg-white/5 rounded-[48px] border border-white/5 p-10">
                <div className="w-24 h-24 bg-indigo-500/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12 text-indigo-700 opacity-30" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Sync Complete</h3>
                <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed px-4">The queue is currently empty. Scan new specimens to continue internal training.</p>
                <button onClick={() => onNavigate(Screen.SCANNER)} className="w-full py-5 bg-white text-slate-950 rounded-[32px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl">Re-Initiate Scanner</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`relative bg-white/5 border-[3px] rounded-[56px] p-10 flex flex-col items-center transition-all duration-500 shadow-3xl ${voteFeedback === 'correct' ? 'border-emerald-500 bg-emerald-500/5' : voteFeedback === 'incorrect' ? 'border-rose-500 bg-rose-500/5' : 'border-white/5'}`}>
                  
                  {voteFeedback && (
                    <div className="absolute inset-x-0 -top-4 flex justify-center animate-in slide-in-from-bottom-2">
                       <div className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl ${voteFeedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {voteFeedback === 'correct' ? 'Confirmed' : 'Rejected'}
                       </div>
                    </div>
                  )}

                  <div className="w-72 h-72 bg-[#0A0F1E] rounded-[48px] overflow-hidden mb-10 flex items-center justify-center border-4 border-[#050A18] shadow-inner relative group">
                    {currentItem.image ? (
                        <img src={currentItem.image.length > 10 ? (currentItem.image.startsWith('data:') || currentItem.image.startsWith('http') ? currentItem.image : `/api/dataset/crops/${currentItem.image}`) : ''} alt="Specimen" className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" />
                    ) : <span className="text-8xl opacity-10">🧱</span>}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050A18]/20 to-transparent pointer-events-none" />
                  </div>

                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-2 mb-4">
                       <span className="w-8 h-[1px] bg-slate-800" />
                       <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">{currentItem.currentVotes} / {currentItem.required} CONSENSUS</p>
                       <span className="w-8 h-[1px] bg-slate-800" />
                    </div>
                    
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2 italicOpacity: 0.8">Neural Prediction:</h3>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 leading-tight">
                       {currentItem.color !== 'Unknown' ? `${currentItem.color} ` : ''}{currentItem.predictedLabel}
                    </h2>
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                       <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 font-mono text-xs font-bold text-slate-400">#{currentItem.partNumber}</div>
                       <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${currentItem.confidence > 0.8 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                          {Math.round(currentItem.confidence * 100)}% Match
                       </div>
                    </div>
                  </div>
                </div>

                {/* Tactical Vote Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(false)}
                    disabled={voteFeedback !== null}
                    className={`flex-1 py-7 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 ${voteFeedback === 'incorrect'
                      ? 'bg-rose-500 text-white shadow-3xl'
                      : 'bg-white/5 border border-white/10 text-slate-500'
                      }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voteFeedback !== null}
                    className={`flex-[1.5] py-7 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${voteFeedback === 'correct'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-950'
                      }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Entity
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
