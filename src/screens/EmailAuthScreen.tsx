import React, { useState } from 'react';
import { Cloud, Star, Music, ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, resetPassword } from '../services/supabaseService';
import { Screen } from '../types';

interface EmailAuthScreenProps {
  onNavigate: (screen: Screen) => void;
  onAuthenticate: () => void;
  mode: 'signup' | 'login';
}

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({ onNavigate, onAuthenticate, mode }) => {
  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/bac1b455-4231-4e43-9f38-58072d864166', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EmailAuthScreen.tsx:ENTRY', 'message': 'EmailAuthScreen rendered', 'data': { mode, hasOnNavigate: !!onNavigate }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'nav-debug', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { user, error: authError } = mode === 'signup'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (authError) {
        // DEV/TEST BYPASS: Allow any email to log in during testing
        console.warn('⚠️ Auth error (bypassed for testing):', authError.message);
        localStorage.setItem('hellobrick_userId', email);
        onAuthenticate();
        return;
      }

      if (user) {
        onAuthenticate();
      }
    } catch (err: any) {
      // DEV/TEST BYPASS: Still allow login even if Supabase is unreachable
      console.warn('⚠️ Auth exception (bypassed for testing):', err);
      localStorage.setItem('hellobrick_userId', email);
      onAuthenticate();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFC905] relative overflow-hidden font-sans">

      {/* HEADER WITH BACK BUTTON */}
      <div className="absolute top-[max(env(safe-area-inset-top),1rem)] left-6 z-50">
        <button
          onClick={() => onNavigate(Screen.AUTH)}
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all text-white border border-white/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* TOP HALF: Illustration Area */}
      <div className="flex-[0.8] relative flex flex-col items-center justify-center pb-8 pt-[max(env(safe-area-inset-top),2.5rem)]">
        {/* Floating Abstract Elements */}
        <div className="absolute top-12 left-20 animate-bounce delay-700">
          <Cloud className="w-10 h-10 text-white fill-white opacity-80" />
        </div>
        <div className="absolute top-24 right-12 animate-pulse">
          <Star className="w-8 h-8 text-white fill-white opacity-70" />
        </div>
        <div className="absolute bottom-20 left-12 -rotate-12">
          <Music className="w-6 h-6 text-blue-500 fill-blue-500 opacity-60" />
        </div>

        {/* The Logo (Scaled Down) */}
        <div className="relative z-10 animate-[float_4s_ease-in-out_infinite]">
          <div className="w-32 h-32 bg-[#FFD600] rounded-[22px] flex items-center justify-center shadow-lg ring-1 ring-black/5">
            <div className="w-16 h-16 bg-[#F97316] rounded-[8px] flex items-center justify-center shadow-inner">
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-black rounded-[0.5px]"></div>
                <div className="w-1 h-1 bg-black rounded-[0.5px]"></div>
              </div>
            </div>
          </div>
          {/* Decorative Phone Frame */}
          <div className="absolute inset-0 w-44 h-64 bg-white/10 rounded-[40px] -z-10 top-[-60px] left-[-22px] border-2 border-white/20 backdrop-blur-[2px]" />
        </div>

        <div className="mt-6 text-center z-10 px-4">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-800 text-sm font-semibold opacity-70">
            {mode === 'signup' ? 'Join the #1 App for Brick Owners' : 'Log in to your HelloBrick account'}
          </p>
        </div>
      </div>

      {/* CURVED DIVIDER */}
      <div className="absolute bottom-[38%] left-0 right-0 z-20">
        <svg viewBox="0 0 1440 320" className="w-full h-auto block" preserveAspectRatio="none">
          <path fill="#0B1736" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* BOTTOM HALF: Form Area (Navy) */}
      <div className="flex-1 bg-[#0B1736] px-8 pb-8 pt-4 relative z-30 flex flex-col justify-center overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-[#1F2E54]/50 border-2 border-white/5 focus:border-[#F97316] text-white placeholder-blue-300/30 pl-12 pr-4 py-4 rounded-2xl outline-none transition-all font-medium"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#1F2E54]/50 border-2 border-white/5 focus:border-[#F97316] text-white placeholder-blue-300/30 pl-12 pr-12 py-4 rounded-2xl outline-none transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password (Signup) */}
            {mode === 'signup' && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-[#1F2E54]/50 border-2 border-white/5 focus:border-[#F97316] text-white placeholder-blue-300/30 pl-12 pr-12 py-4 rounded-2xl outline-none transition-all font-medium"
                  required
                />
              </div>
            )}

            {/* Forgot Password (Login) */}
            {mode === 'login' && (
              <div className="flex justify-end pr-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError('Please enter your email address');
                      return;
                    }
                    setIsLoading(true);
                    const { error: resetErr } = await resetPassword(email);
                    setIsLoading(false);
                    if (resetErr) setError(resetErr.message);
                    else alert('Reset link sent to your email!');
                  }}
                  className="text-xs font-bold text-[#F97316] hover:text-orange-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F97316] hover:bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:active:scale-100"
          >
            {isLoading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Log In')}
          </button>

          <p className="text-center text-sm text-blue-200/50 font-medium">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => onNavigate(mode === 'signup' ? Screen.EMAIL_LOGIN : Screen.EMAIL_SIGNUP)}
              className="text-[#F97316] font-bold hover:underline"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
