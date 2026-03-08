
import React, { useState, useEffect } from 'react';
import { Cloud, Star, Music } from 'lucide-react';
import { signInWithGoogle, signInWithApple, isSupabaseConfigured } from '../services/supabaseService';
import { Screen } from '../types';

interface AuthScreenProps {
  onAuthenticate: () => void;
  onNavigate?: (screen: Screen) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'google' | 'apple' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const supabaseAvailable = isSupabaseConfigured();

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (onNavigate && e.detail?.screen) {
        onNavigate(e.detail.screen as Screen);
      }
    };
    window.addEventListener('navigate' as any, handleNavigate);
    return () => window.removeEventListener('navigate' as any, handleNavigate);
  }, [onNavigate]);

  const handleGoogleSignIn = async () => {
    if (!supabaseAvailable) {
      onAuthenticate();
      return;
    }

    setIsLoading(true);
    setAuthType('google');
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign-in failed:', error);
        onAuthenticate();
      } else if (user) {
        onAuthenticate();
      }
    } catch (error) {
      console.error('Google sign-in exception:', error);
      onAuthenticate();
    } finally {
      setIsLoading(false);
      setAuthType(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (!supabaseAvailable) {
      onAuthenticate();
      return;
    }

    setIsLoading(true);
    setAuthType('apple');
    try {
      const { user, error } = await signInWithApple();
      if (error) {
        console.error('Apple sign-in failed:', error);
        onAuthenticate();
      } else if (user) {
        onAuthenticate();
      }
    } catch (error) {
      console.error('Apple sign-in exception:', error);
      onAuthenticate();
    } finally {
      setIsLoading(false);
      setAuthType(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFC905] relative overflow-hidden font-sans">

      {/* TOP HALF: Illustration Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center pb-12">

        {/* Floating Abstract Elements */}
        <div className="absolute top-12 left-8 animate-bounce delay-700">
          <Cloud className="w-12 h-12 text-white fill-white opacity-90" />
        </div>
        <div className="absolute top-20 right-8 animate-pulse">
          <Star className="w-10 h-10 text-white fill-white opacity-80" />
        </div>

        {/* Rainbow Element (CSS) */}
        <div className="absolute top-32 right-[-20px] w-24 h-24 border-[12px] border-t-red-400 border-r-orange-400 border-b-transparent border-l-transparent rounded-full rotate-45 opacity-90" />

        {/* Music Notes */}
        <div className="absolute bottom-32 left-8 -rotate-12">
          <Music className="w-8 h-8 text-blue-500 fill-blue-500" />
        </div>

        {/* The Logo */}
        <div className="relative z-10 animate-[float_4s_ease-in-out_infinite]">
          {/* New HelloBrick Logo */}
          <div className="relative flex items-center justify-center">
            {/* Logo with custom size to match original */}
            <div className="w-48 h-48 flex items-center justify-center">
              <div className="w-48 h-48 bg-[#FFD600] rounded-[26px] flex items-center justify-center shadow-xl shadow-yellow-500/20 ring-2 ring-black/5">
                <div className="w-24 h-24 bg-[#F97316] rounded-[12px] flex items-center justify-center shadow-inner">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Star decoration (optional, keeping for visual interest) */}
            <div className="absolute top-8 right-10 w-4 h-4 text-white opacity-90">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            </div>
          </div>

          {/* Phone Frame Behind */}
          <div className="absolute inset-0 w-64 h-96 bg-white/20 rounded-[48px] -z-10 top-[-80px] left-[-32px] border-4 border-white/30 backdrop-blur-sm" />
        </div>

      </div>

      {/* CURVED DIVIDER */}
      <div className="absolute bottom-[35%] left-0 right-0 z-20">
        <svg viewBox="0 0 1440 320" className="w-full h-auto block" preserveAspectRatio="none">
          <path fill="#0B1736" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* BOTTOM HALF: Content Area (Navy) */}
      <div className="bg-[#0B1736] px-8 pb-6 pt-6 relative z-30 flex-shrink-0 flex flex-col">
        {/* Welcome Section - Compact */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-2">
            Welcome to{' '}
            <span className="inline-flex items-baseline leading-none">
              <span
                className="font-bold tracking-tight"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '-0.03em'
                }}
              >
                Hello
              </span>
              <span
                className="font-bold text-[#F97316] ml-[1px]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '-0.08em'
                }}
              >
                Brick
              </span>
            </span>
          </h1>
          <p className="text-blue-200 text-sm font-medium leading-relaxed">
            Detect and Organise Bricks, compete against others, and more on the #1 App for Brick Owners.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-2.5 mb-4">
          {/* Google Sign In Button */}
          {supabaseAvailable && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading || !termsAccepted}
                className={`w-full bg-white hover:bg-gray-50 text-gray-900 font-bold py-3.5 rounded-full text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 border-2 border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed ${!termsAccepted ? 'grayscale' : ''}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isLoading && authType === 'google' ? 'Signing in...' : 'Continue with Google'}
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={isLoading || !termsAccepted}
                className={`w-full bg-black hover:bg-zinc-900 text-white font-bold py-3.5 rounded-full text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed ${!termsAccepted ? 'grayscale' : ''}`}
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96.95-2.12 1.44-3.41 1.44-1.25 0-2.31-.41-3.23-1.3l-.11-.1c-.91-.87-1.95-1.3-3.16-1.3-1.25 0-2.33.44-3.28 1.34l-.11.1c-.26.25-.56.38-.88.38-.34 0-.64-.13-.88-.38l-.75-.75c-.25-.24-.38-.54-.38-.88 0-.31.12-.6.37-.85l.13-.13c1.69-1.6 3.55-2.4 5.66-2.4 2.15 0 4.04.81 5.75 2.45l.1.1c.25.23.37.52.37.84 0 .34-.13.64-.38.89l-.75.75c-.25.24-.55.37-.89.37-.32 0-.62-.12-.87-.37l-.1-.1c-.48-.46-1-.69-1.57-.69-.58 0-1.11.23-1.57.69l-.1.1c-.25.25-.55.37-.88.37s-.63-.12-.88-.37l-.75-.75c-.25-.24-.37-.54-.37-.88 0-.31.12-.6.37-.85l.1-.1c1.37-1.35 2.95-2.02 4.77-2.02 1.84 0 3.44.69 4.86 2.07l.11.11c.24.23.36.52.36.83 0 .34-.12.63-.37.88zm-3.79-13.41c1.88 0 3.19 1.44 3.19 3.51 0 2.1-1.31 3.54-3.19 3.54s-3.19-1.44-3.19-3.54c0-2.07 1.31-3.51 3.19-3.51zm9.33 3.51c0 2.1-1.31 3.54-3.19 3.54s-3.19-1.44-3.19-3.54c0-2.07 1.31-3.51 3.19-3.51s3.19 1.44 3.19 3.51z" />
                </svg>
                {isLoading && authType === 'apple' ? 'Signing in...' : 'Continue with Apple'}
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate && onNavigate(Screen.EMAIL_SIGNUP)}
            disabled={!termsAccepted}
            className={`w-full bg-[#1A2645] hover:bg-[#202E54] text-white font-bold py-3.5 rounded-full text-base active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Continue with Email
          </button>
        </div>

        {/* Terms Checkbox */}
        <div className="mt-4 flex flex-col items-center">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-6 h-6 rounded-lg border-2 border-blue-400 bg-white/5 peer-checked:bg-[#F97316] peer-checked:border-[#F97316] transition-colors flex items-center justify-center">
                <svg className={`w-3.5 h-3.5 text-white transition-opacity ${termsAccepted ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-blue-200/60 font-medium select-none">
              I agree to the <a href="https://hellobrick.app/terms" target="_blank" rel="noopener noreferrer" className="text-blue-300 font-bold hover:underline" onClick={e => e.stopPropagation()}>Terms</a> and <a href="https://hellobrick.app/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-300 font-bold hover:underline" onClick={e => e.stopPropagation()}>Privacy</a>
            </span>
          </label>

          {/* Fallback for development (demo mode link) */}
          {!supabaseAvailable && (
            <button
              onClick={() => onNavigate && onNavigate(Screen.HOME)}
              disabled={!termsAccepted}
              className={`mt-4 text-xs font-bold ${termsAccepted ? 'text-white underline hover:text-orange-400' : 'text-slate-500 cursor-not-allowed'} transition-colors`}
            >
              Development Bypass
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
