import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Education } from './pages/Education';
import { Privacy, Terms, Support } from './pages/Compliance';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Scans } from './pages/admin/Scans';
import { Users } from './pages/admin/Users';
import { Leaderboard } from './pages/admin/Leaderboard';
import { Analytics } from './pages/admin/Analytics';

import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLogin } from './pages/admin/AdminLogin';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './services/supabaseService';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

// Simplified Error Boundary for Web
const ErrorDisplay: React.FC<{ message: string; sub?: string }> = ({ message, sub }) => (
  <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
      <ShieldAlert className="w-10 h-10" />
    </div>
    <h1 className="text-white text-3xl font-black mb-4 tracking-tighter">System Offline</h1>
    <p className="text-brand-text-dim text-lg font-bold mb-8 max-w-md">{message}</p>
    {sub && <p className="text-white/20 text-xs font-medium uppercase tracking-widest mb-10">{sub}</p>}
    <button 
      onClick={() => window.location.reload()}
      className="flex items-center gap-3 bg-white text-brand-navy px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
    >
      <RefreshCcw className="w-5 h-5" /> Reload Platform
    </button>
  </div>
);

const App: React.FC = () => {
  const location = useLocation();

  const [envError, setEnvError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Environmental Health Check
    if (!supabase) {
      console.error('❌ SUPABASE CONFIG MISSING: Ensure VITE_SUPABASE_URL is set.');
      setEnvError('Production telemetry is currently disconnected. Please check environment configuration.');
    }

    // 2. Analytics Tracking
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-19NTJ70M5E', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  if (envError && location.pathname.startsWith('/admin')) {
    return <ErrorDisplay message={envError} sub="ADMIN CONSOLE REQUIRES ACTIVE SUPABASE SESSION" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/education" element={<Education />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/support" element={<Support />} />
      
      {/* Admin Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Dashboard */}
      <Route path="/admin" element={<AdminRoute><AdminLayout title="LIVE PRODUCTION HUB (V3.0)"><Dashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/scans" element={<AdminRoute><Scans /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
    </Routes>
  );
};

export default App;
