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
import { useEffect } from 'react';

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Tracking on route change
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-19NTJ70M5E', {
        page_path: location.pathname,
      });
    }
  }, [location]);

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
      <Route path="/admin" element={<AdminRoute><AdminLayout title="LIVE PRODUCTION HUB (V2.1)"><Dashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/scans" element={<AdminRoute><Scans /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
    </Routes>
  );
};

export default App;
