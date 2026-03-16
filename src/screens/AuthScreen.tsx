import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { signInWithGoogle, signInWithApple } from '../services/supabaseService';
import { Screen } from '../types';
import { Logo } from '../components/Logo';

interface AuthScreenProps {
  onAuthenticate: () => void;
  onNavigate: (screen: Screen) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onNavigate }) => {
  const [agreed, setAgreed] = useState(true);

  const handleSocialAuth = async (platform: 'google' | 'apple') => {
    if (!agreed) return;
    try {
      if (platform === 'google') await signInWithGoogle();
      else await signInWithApple();
      onNavigate(Screen.NOTIFICATIONS_INTRO);
    } catch (e) {
      console.error(e);
      onNavigate(Screen.NOTIFICATIONS_INTRO);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A1229] font-sans overflow-hidden">
      {/* Top Section - Thin Yellow Bar */}
      <div className="h-4 bg-[#FFD600] w-full relative z-20" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-[max(env(safe-area-inset-top),2rem)] overflow-y-auto no-scrollbar overscroll-contain pb-[max(env(safe-area-inset-bottom),2rem)]">
        <div className="px-10 flex flex-col items-center">
            {/* Mascot Centered */}
            <Logo size="xl" showText={false} className="mb-10" />

            <h1 className="text-[32px] font-black text-white leading-tight tracking-tight mb-6 whitespace-nowrap">
                Welcome to <span className="text-[#FF7A30]">Hello</span>Brick
            </h1>

            <p className="text-slate-400 text-center text-[15px] font-bold leading-snug mb-10">
                Detect and Organise Bricks, compete against others, and more on the #1 App for Brick Owners.
            </p>
        </div>

        <div className="space-y-4">
            <button
                onClick={() => handleSocialAuth('google')}
                className="w-full bg-white text-black py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all"
            >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
            </button>

            <button
                onClick={() => handleSocialAuth('apple')}
                className="w-full bg-black text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all border border-white/10"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.04 1.72-3.23 1.72-1.17 0-1.55-.72-2.92-.72-1.38 0-1.81.72-2.92.72-1.14 0-2.31-.83-3.27-1.78-1.95-1.93-3.41-5.46-3.41-8.52 0-3.08 1.48-5.74 3.39-5.74 1.05 0 1.93.72 2.68.72.68 0 1.83-.79 3.01-.79 1.25 0 2.41.65 3.1 1.62-2.52 1.43-2.11 4.79.43 5.8 1.1-.56 2.02-1.39 2.52-2.52 1 2.91-.71 6.09-2.68 8.93zM12.03 5.07c0-2.34 1.93-4.24 4.29-4.24.16 2.34-1.93 4.24-4.29 4.24z"/></svg>
                Continue with Apple
            </button>

            <button
                onClick={() => onNavigate(Screen.EMAIL_SIGNUP)}
                className="w-full bg-white/5 text-slate-400 py-5 rounded-[24px] font-black text-lg active:scale-[0.98] transition-all"
            >
                Continue with Email
            </button>
        </div>

        {/* Terms */}
        <div className="mt-auto mb-10 flex items-center justify-center gap-3">
            <button 
                onClick={() => setAgreed(!agreed)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${agreed ? 'bg-[#FF7A30]' : 'bg-white/10 border border-white/10'}`}
            >
                {agreed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
            <p className="text-slate-500 text-[13px] font-bold">
                I agree to the <span className="text-slate-300 border-b border-slate-700">Terms</span> and <span className="text-slate-300 border-b border-slate-700">Privacy</span>
            </p>
        </div>
      </div>
    </div>
  );
};
