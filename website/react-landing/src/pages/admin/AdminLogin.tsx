import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { Logo } from '../../components/Logo';
import { ArrowRight, Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    // 🚨 MASTER OVERRIDE BYPASS (Emergency Access)
    const MASTER_PIN = 'BRICK-MASTER-77';
    if (email === 'hellobrickar@gmail.com' && password === MASTER_PIN) {
       console.log('🛡️ Master Override Activated');
       localStorage.setItem('hellobrick_admin_bypass', 'true');
       navigate(from, { replace: true });
       setLoading(false);
       return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      // Verification check (for UI feedback, actual check is in AdminRoute)
      const allowedAdmins = ['hellobrickar@gmail.com'];
      if (data.user && data.user.email && allowedAdmins.includes(data.user.email)) {
        navigate(from, { replace: true });
      } else {
        if (supabase) await supabase.auth.signOut();
        setError('Access denied. This email is not authorized to access the admin portal.');
      }
    } catch (err: any) {
      console.error('Login attempt failed:', err);
      const detail = err.status ? `[Error ${err.status}: ${err.code}] ` : '';
      setError(`${detail}${err.message || 'Failed to sign in'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-brand-orange selection:text-white">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="mb-4">
            <Logo size="lg" light={true} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Admin Portal</h1>
          <p className="text-brand-text-dim text-ui-body font-medium">Access the HelloBrick product brain</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/5 rounded-full blur-[80px] group-hover:bg-brand-yellow/10 transition-all duration-1000" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-brand-text-dim uppercase tracking-widest ml-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-yellow/30 transition-all font-medium placeholder:text-white/10"
                placeholder="admin@hellobrick.app"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-brand-text-dim uppercase tracking-widest ml-1">Master Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-yellow/30 transition-all font-medium placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                 <p className="text-red-400 text-[12px] font-bold text-center leading-relaxed italic">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-yellow hover:bg-white text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-brand-text-dim uppercase tracking-widest">
          <Lock className="w-3 h-3" />
          End-to-End Encrypted Session
        </div>
      </div>
    </div>
  );
};
