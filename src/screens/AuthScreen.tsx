import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { signInWithGoogle, signInWithApple, isSupabaseConfigured } from '../services/supabaseService';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { Browser } from '@capacitor/browser';
import { appStateService } from '../services/appStateService';

interface AuthScreenProps {
  onAuthenticate: () => void;
  onNavigate: (screen: Screen) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate, onNavigate }) => {
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'google' | 'apple' | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabaseAvailable = isSupabaseConfigured();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

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
      if (import.meta.env.DEV) {
        // Dev fallback → go to subscription after auth
        localStorage.setItem('hellobrick_authenticated', 'true');
        localStorage.setItem('hellobrick_userId', 'dev-user');
        appStateService.onAuthSuccess();
        return;
      } else {
        alert('Authentication is currently unavailable. Please try again later.');
        return;
      }
    }

    setIsLoading(true);
    setAuthType(platform);
    try {
      const { user, error } = platform === 'google'
        ? await signInWithGoogle()
        : await signInWithApple();

      if (user && (user.id || user.user?.id)) {
        localStorage.setItem('hellobrick_userId', user.id || user.user?.id);
        localStorage.setItem('hellobrick_userEmail', user.email || user.user?.email);
        localStorage.setItem('hellobrick_authenticated', 'true');
        // Route to subscription paywall after sign-up
        appStateService.onAuthSuccess();
      } else if (user && user.url) {
        // OAuth redirect started — deep link in App.tsx will complete
        console.log(`[Auth] OAuth started for ${platform}, waiting for browser callback...`);
      } else if (error) {
        console.error(`${platform} sign-in error:`, error);
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

  const features = [
    'Identify any LEGO set or minifigure instantly',
    'Track real-time market valuations',
    'AI-powered collection insights',
  ];

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans overflow-hidden relative">

      <style>{`
        @keyframes auth-slide-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .auth-hero  { animation: auth-scale-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .auth-row-0 { animation: auth-slide-up 0.4s 0.15s ease-out both; }
        .auth-row-1 { animation: auth-slide-up 0.4s 0.22s ease-out both; }
        .auth-row-2 { animation: auth-slide-up 0.4s 0.30s ease-out both; }
        .auth-row-3 { animation: auth-slide-up 0.4s 0.38s ease-out both; }
        .auth-row-4 { animation: auth-slide-up 0.4s 0.46s ease-out both; }
      `}</style>

      {/* Top yellow accent bar */}
      <div className="h-1 bg-[#FFD600] w-full z-20 shrink-0" />

      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF7A3014 0%, transparent 70%)', marginTop: '-60px' }} />

      {/* Back button */}
      <button
        onClick={() => onNavigate(Screen.ONBOARDING_QUESTIONNAIRE)}
        className="absolute top-[max(calc(env(safe-area-inset-top)+1.2rem),2rem)] left-5 w-10 h-10 bg-white/8 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-transform z-30"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 pt-[max(calc(env(safe-area-inset-top)+5rem),6.5rem)] overflow-y-auto no-scrollbar pb-[max(env(safe-area-inset-bottom),2rem)]">

        {/* Logo / hero */}
        {mounted && (
          <div className="auth-hero flex justify-center mb-8">
            <Logo size="xl" showText={false} />
          </div>
        )}

        {/* Headline */}
        {mounted && (
          <div className="auth-row-0 text-center mb-7">
            <h1 className="text-[30px] font-black text-white leading-tight tracking-tight">
              Welcome to <span className="text-[#FF7A30]">Hello</span>Brick
            </h1>
            <p className="text-zinc-500 text-sm font-semibold mt-2">Create an account to get started</p>
          </div>
        )}

        {/* Features list */}
        {mounted && (
          <div className="auth-row-1 space-y-3 mb-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF7A30]/15 border border-[#FF7A30]/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#FF7A30]" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-semibold text-zinc-300">{f}</p>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {mounted && (
          <div className="auth-row-2 w-full space-y-3 mb-6">
            {/* Google */}
            <button
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading}
              className="w-full h-[56px] bg-white text-[#111111] rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center px-5 gap-4 active:scale-[0.97] transition-transform shadow-xl disabled:opacity-50 relative overflow-hidden"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 shrink-0" alt="Google" />
              <span className="flex-1 text-center pr-5">
                {isLoading && authType === 'google' ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleSocialAuth('apple')}
              disabled={isLoading}
              className="w-full h-[56px] bg-[#1C1C1E] border border-white/12 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center px-5 gap-4 active:scale-[0.97] transition-transform shadow-xl disabled:opacity-50"
            >
              <svg viewBox="0 0 170 170" className="w-5 h-5 fill-current shrink-0">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.7 3.17-5.22 2.13-9.41 3.24-12.58 3.35-5.52.19-10.51-2.1-14.97-6.85-3.05-3.21-6.72-8.3-10.99-15.28-4.27-6.98-7.39-14.93-9.35-23.83-2.09-9.47-3.14-18.44-3.14-26.89 0-14.89 3.24-27.12 9.71-36.68 5.12-7.56 12.02-11.4 20.7-11.53 4.29 0 9.28 1.18 14.96 3.54 5.68 2.36 10.15 3.54 13.41 3.54 3.05 0 7.82-1.32 14.31-3.97 6.49-2.65 11.83-3.97 16.03-3.97 12 0 21.6 4.3 28.8 12.91-10.33 6.22-15.5 15.35-15.5 27.38 0 9.8 3.19 18 9.58 24.6 3 3.12 6.64 5.53 10.96 7.24.4 1.13.78 2.3 1.15 3.53zM111.4 34.07c-5.29 6.39-12.18 9.76-20.65 10.12-.13-1.07-.19-2.06-.19-2.97 0-9 3.16-17.51 9.47-25.54 5.37-6.83 12.1-10.54 20.2-11.12.19 1.13.28 2.22.28 3.26 0 10.23-4.04 19.33-9.11 26.25z" />
              </svg>
              <span className="flex-1 text-center pr-5">
                {isLoading && authType === 'apple' ? 'Connecting...' : 'Continue with Apple'}
              </span>
            </button>

            {/* Email */}
            <button
              onClick={() => onNavigate(Screen.EMAIL_SIGNUP)}
              className="w-full py-4 text-zinc-500 font-bold text-[12px] uppercase tracking-[0.18em] hover:text-white transition-colors active:opacity-70"
            >
              Or use email address
            </button>
          </div>
        )}

        {/* T&C agree */}
        {mounted && (
          <div className="auth-row-3 flex flex-col items-center gap-4 mt-auto">
            <button
              onClick={() => setAgreed(!agreed)}
              className="flex items-center gap-3 group"
            >
              <div className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${agreed ? 'bg-[#FF7A30] border-[#FF7A30]' : 'border-white/15 group-hover:border-white/25'}`}>
                {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">I agree to the terms below</p>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openLegal('https://hellobrick.app/terms')}
                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Terms of Use
              </button>
              <div className="w-1 h-1 bg-zinc-700 rounded-full" />
              <button
                onClick={() => openLegal('https://hellobrick.app/privacy')}
                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
            </div>

            <button
              onClick={() => onNavigate(Screen.EMAIL_LOGIN)}
              className="text-zinc-600 text-[12px] font-semibold active:opacity-70 pb-1"
            >
              Already have an account? <span className="text-white font-black">Sign in</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
