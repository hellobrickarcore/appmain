import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, resetPassword } from '../services/supabaseService';
import { Screen } from '../types';
import { Logo } from '../components/Logo';

interface EmailAuthScreenProps {
  onAuthenticate: () => void;
  onNavigate: (screen: Screen) => void;
  mode: 'login' | 'signup';
}

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({ onNavigate, onAuthenticate, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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
            localStorage.setItem('hellobrick_authenticated', 'true');
            onNavigate(Screen.NOTIFICATIONS_INTRO);
        }
      } else {
        const { user, error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
            setError(signInError.message);
        } else if (user) {
            localStorage.setItem('hellobrick_userId', user.id);
            localStorage.setItem('hellobrick_authenticated', 'true');
            onNavigate(Screen.NOTIFICATIONS_INTRO);
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
    <div className="flex flex-col h-full bg-[#0A1229] font-sans overflow-hidden">
      {/* Top Section - Thin Yellow Bar */}
      <div className="h-4 bg-[#FFD600] w-full relative z-20" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate(Screen.AUTH)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <Logo size="sm" showText={false} className="w-8 h-8" />
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col px-10 pt-8 overflow-y-auto no-scrollbar pb-10">
        <h1 className="text-3xl font-black text-white leading-tight tracking-tight mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">
            {mode === 'signup' ? 'Start your brick collection' : 'Log in to your vault'}
        </p>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-400 leading-relaxed">{error}</p>
            </div>
        )}

        {resetSent ? (
            <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-[32px] text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Check your email</h3>
                <p className="text-sm text-slate-400 font-bold mb-8">We've sent password reset instructions to {email}</p>
                <button 
                  onClick={() => setResetSent(false)}
                  className="w-full py-5 bg-white/5 text-white font-black rounded-3xl uppercase tracking-widest text-xs"
                >
                    Back to login
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-14 pr-6 text-white font-bold focus:border-orange-500 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-14 pr-14 text-white font-bold focus:border-orange-500 outline-none transition-all"
                            placeholder="Minimum 8 characters"
                        />
                    </div>
                </div>

                {mode === 'signup' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-14 pr-6 text-white font-bold focus:border-orange-500 outline-none transition-all"
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>
                )}

                {mode === 'login' && (
                    <div className="text-right">
                        <button 
                            type="button"
                            onClick={handleResetPassword}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-orange-500/20 mt-8 disabled:opacity-50"
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
                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                    {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
