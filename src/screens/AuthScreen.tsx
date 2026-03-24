import React, { useState, useEffect } from 'react';
import { Check, Shield, ChevronRight } from 'lucide-react';
import { signInWithGoogle, signInWithApple, isSupabaseConfigured } from '../services/supabaseService';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { Browser } from '@capacitor/browser';

interface AuthScreenProps {
  onAuthenticate: () => void;
  onNavigate: (screen: Screen) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate, onNavigate }) => {
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'google' | 'apple' | null>(null);
  const supabaseAvailable = isSupabaseConfigured();

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (onNavigate && e.detail?.screen) {
        onNavigate(e.detail.screen as Screen);
      }
    };
    window.addEventListener('navigate' as any, handleNavigate);
    return () => window.removeEventListener('navigate' as any, handleNavigate);
  }, [onNavigate]);

  const handleSocialAuth = async (platform: 'google' | 'apple') => {
    if (!agreed) return;
    if (!supabaseAvailable) {
      onAuthenticate(); // Fallback for local dev without supabase
      return;
    }

    setIsLoading(true);
    setAuthType(platform);
    try {
      const { user, error } = platform === 'google' 
        ? await signInWithGoogle() 
        : await signInWithApple();
      
      if (user) {
        // Supabase user returned - this is the "official" path
        localStorage.setItem('hellobrick_userId', user.id || user.user?.id);
        localStorage.setItem('hellobrick_authenticated', 'true');
        onNavigate(Screen.NOTIFICATIONS_INTRO);
      } else if (error) {
        console.error(`${platform} sign-in error:`, error);
        // On mobile, the window stays open or we rely on deep link
      }
    } catch (error) {
      console.error(`${platform} auth exception:`, error);
    } finally {
      setIsLoading(false);
      setAuthType(null);
    }
  };

  const openLegal = async (url: string) => {
    await Browser.open({ url, presentationStyle: 'popover' });
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

            <div className="w-full space-y-4 mb-10">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">Identify any LEGO brick instantly</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">Catalog your entire collection</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">Get AI-powered building ideas</p>
                </div>
            </div>

            <div className="w-full space-y-3 mb-8">
                <button 
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  className="w-full h-16 bg-white text-[#0A1229] rounded-2xl font-black text-sm uppercase tracking-widest flex items-center px-6 gap-4 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    <span className="flex-1 text-center mr-5">{isLoading && authType === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <button 
                  onClick={() => handleSocialAuth('apple')}
                  disabled={isLoading}
                  className="w-full h-16 bg-[#000000] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center px-6 gap-4 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                    <svg viewBox="0 0 170 170" className="w-5 h-5 fill-current">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.7 3.17-5.22 2.13-9.41 3.24-12.58 3.35-5.52.19-10.51-2.1-14.97-6.85-3.05-3.21-6.72-8.3-10.99-15.28-4.27-6.98-7.39-14.93-9.35-23.83-2.09-9.47-3.14-18.44-3.14-26.89 0-14.89 3.24-27.12 9.71-36.68 5.12-7.56 12.02-11.4 20.7-11.53 4.29 0 9.28 1.18 14.96 3.54 5.68 2.36 10.15 3.54 13.41 3.54 3.05 0 7.82-1.32 14.31-3.97 6.49-2.65 11.83-3.97 16.03-3.97 12 0 21.6 4.3 28.8 12.91-10.33 6.22-15.5 15.35-15.5 27.38 0 9.8 3.19 18 9.58 24.6 3 3.12 6.64 5.53 10.96 7.24.4 1.13.78 2.3 1.15 3.53zM111.4 34.07c-5.29 6.39-12.18 9.76-20.65 10.12-.13-1.07-.19-2.06-.19-2.97 0-9 3.16-17.51 9.47-25.54 5.37-6.83 12.1-10.54 20.2-11.12.19 1.13.28 2.22.28 3.26 0 10.23-4.04 19.33-9.11 26.25z" />
                    </svg>
                    <span className="flex-1 text-center mr-5">{isLoading && authType === 'apple' ? 'Connecting...' : 'Continue with Apple'}</span>
                </button>

                <button 
                  onClick={() => onNavigate(Screen.EMAIL_AUTH)}
                  className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                    Or use email address
                </button>
            </div>

            {/* Terms of Use / Privacy */}
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setAgreed(!agreed)}
                    className="flex items-center gap-3 group"
                >
                    <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${agreed ? 'bg-orange-500 border-orange-500' : 'border-white/10 group-hover:border-white/20'}`}>
                        {agreed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">I agree to the terms below</p>
                </button>

                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => openLegal('https://hellobrick.app/terms')}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white"
                    >
                      Terms of Use (EULA)
                    </button>
                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    <button 
                      onClick={() => openLegal('https://hellobrick.app/privacy')}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white"
                    >
                      Privacy Policy
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
