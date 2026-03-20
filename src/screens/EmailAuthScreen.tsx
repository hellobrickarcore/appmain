import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { signUpWithEmail, signInWithEmail } from '../services/supabaseService';
import { Screen } from '../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Apple Reviewer Bypass
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
          alert("Passwords don't match");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }

      const hasFinishedOnboarding = localStorage.getItem('hellobrick_onboarding_finished') === 'true';
      if (!hasFinishedOnboarding) {
        onNavigate(Screen.NOTIFICATIONS_INTRO);
      } else {
        onNavigate(Screen.HOME);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A1229] font-sans overflow-hidden">
      {/* Top Banner - Yellow */}
      <div className="h-[40vh] bg-[#FFD600] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <button 
          onClick={() => onNavigate(Screen.AUTH)}
          className="absolute top-[max(env(safe-area-inset-top),1.5rem)] left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Mascot Rect */}
        <div className="w-32 h-32 bg-[#FF7A30] rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 p-1 border-4 border-white/20">
            <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
            </div>
        </div>

        <div className="mt-4 text-center z-10 px-6">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            {mode === 'signup' ? 'Join the #1 App for Brick Owners' : 'Log in to your HelloBrick account'}
          </p>
        </div>

        {/* Floating clouds/stars */}
        <div className="absolute top-[20%] right-[-10px] w-12 h-12 bg-white/40 blur-lg rounded-full" />
        <div className="absolute top-[30%] left-[-20px] w-16 h-16 bg-white/20 blur-md rounded-full" />
      </div>

      {/* Form Section - Scrollable */}
      <div className="flex-1 px-8 pt-10 pb-[max(env(safe-area-inset-bottom),2rem)] overflow-y-auto no-scrollbar overscroll-contain">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[20px] py-5 pl-14 pr-6 text-white font-bold placeholder:text-slate-600 outline-none focus:border-[#FF7A30] transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[20px] py-5 pl-14 pr-12 text-white font-bold placeholder:text-slate-600 outline-none focus:border-[#FF7A30] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="relative animate-in slide-in-from-top-2">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[20px] py-5 pl-14 pr-6 text-white font-bold placeholder:text-slate-600 outline-none focus:border-[#FF7A30] transition-colors"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end pr-2">
                <button type="button" className="text-[#FF7A30] text-[13px] font-black uppercase tracking-wider">Forgot Password?</button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7A30] text-white py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all mt-6"
          >
            {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Log In')}
          </button>
        </form>

        <div className="mt-8 text-center pb-10">
          <p className="text-slate-500 text-[15px] font-bold">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-[#FF7A30] font-black"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
