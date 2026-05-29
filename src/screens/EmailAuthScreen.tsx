import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ArrowRight, Shield } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, resetPassword } from '../services/supabaseService';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { appStateService } from '../services/appStateService';

interface EmailAuthScreenProps {
  onAuthenticate: () => void;
  onNavigate: (screen: Screen) => void;
  mode: 'login' | 'signup';
}

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({ onNavigate, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Apple Reviewer Bypass (CRITICAL FOR APP STORE APPROVAL)
    if (email.toLowerCase() === 'apple_test@hellobrick.app' && password === 'AppleReview2026!') {
      console.log('🍎 Apple Reviewer Bypass Triggered');
      localStorage.setItem('hellobrick_authenticated', 'true');
      localStorage.setItem('hellobrick_userId', 'apple-reviewer-1');
      localStorage.setItem('hellobrick_profile_name', 'Apple Reviewer');
      localStorage.setItem('hellobrick_is_pro', 'true');
      localStorage.setItem('hellobrick_is_reviewer', 'true');
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      onNavigate(Screen.HOME);
      return;
    }

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        const { user, error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) {
          setError(signUpError.message);
        } else if (user) {
          localStorage.setItem('hellobrick_userId', user.id);
          localStorage.setItem('hellobrick_userEmail', email);
          localStorage.setItem('hellobrick_authenticated', 'true');
          // ✅ Route to subscription paywall after sign-up
          appStateService.onAuthSuccess();
        }
      } else {
        const { user, error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
          setError(signInError.message);
        } else if (user) {
          localStorage.setItem('hellobrick_userId', user.id);
          localStorage.setItem('hellobrick_userEmail', email);
          localStorage.setItem('hellobrick_authenticated', 'true');
          // ✅ Route to subscription paywall after login (if not finished onboarding yet)
          appStateService.onAuthSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) setError(resetError.message);
      else setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans overflow-hidden relative">

      <style>{`
        @keyframes email-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .email-r0 { animation: email-slide-up 0.38s 0.05s ease-out both; }
        .email-r1 { animation: email-slide-up 0.38s 0.13s ease-out both; }
        .email-r2 { animation: email-slide-up 0.38s 0.21s ease-out both; }
        .email-r3 { animation: email-slide-up 0.38s 0.29s ease-out both; }
        .email-r4 { animation: email-slide-up 0.38s 0.37s ease-out both; }
      `}</style>

      {/* Top accent bar */}
      <div className="h-1 bg-[#FF7A30] w-full z-20 shrink-0" />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF7A3010 0%, transparent 70%)', marginTop: '-60px' }} />

      {/* Header */}
      <div className="relative z-10 px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate(Screen.AUTH)}
          className="w-10 h-10 bg-white/6 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-transform hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-300" />
        </button>
        <Logo size="sm" showText={false} />
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 pt-4 overflow-y-auto no-scrollbar pb-10">
        {mounted && (
          <>
            <div className="email-r0 mb-8">
              <h1 className="text-[30px] font-black text-white leading-tight tracking-tight">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-zinc-500 text-[13px] font-semibold mt-1 uppercase tracking-widest">
                {mode === 'signup' ? 'Start your brick collection' : 'Log in to your vault'}
              </p>
            </div>

            {error && (
              <div className="email-r1 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {resetSent ? (
              <div className="email-r1 p-8 bg-[#1C1C1E] border border-white/8 rounded-[32px] text-center">
                <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Mail className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Check your email</h3>
                <p className="text-sm text-zinc-400 font-semibold mb-8">We've sent reset instructions to {email}</p>
                <button
                  onClick={() => setResetSent(false)}
                  className="w-full py-4 bg-white/6 text-white font-black rounded-2xl uppercase tracking-widest text-xs border border-white/10 active:scale-[0.97] transition-transform"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="email-r1 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl h-[56px] pl-12 pr-5 text-white font-semibold focus:border-[#FF7A30] outline-none transition-all placeholder:text-zinc-600"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="email-r2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl h-[56px] pl-12 pr-12 text-white font-semibold focus:border-[#FF7A30] outline-none transition-all placeholder:text-zinc-600"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>

                {/* Confirm Password (signup) */}
                {mode === 'signup' && (
                  <div className="email-r3 space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl h-[56px] pl-12 pr-5 text-white font-semibold focus:border-[#FF7A30] outline-none transition-all placeholder:text-zinc-600"
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>
                )}

                {/* Forgot password */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-[#FF7A30] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <div className="email-r4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[56px] bg-[#FF7A30] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-[0_8px_30px_rgba(255,122,48,0.3)] mt-4 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'login' : 'signup');
                      setError(null);
                    }}
                    className="w-full py-4 text-zinc-600 font-bold text-[11px] uppercase tracking-[0.18em] hover:text-white transition-colors active:opacity-70"
                  >
                    {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
