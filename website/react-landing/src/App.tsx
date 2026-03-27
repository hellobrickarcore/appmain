import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/education" element={<Education />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/support" element={<Support />} />
      
      {/* Admin Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Dashboard */}
      <Route path="/admin" element={<AdminRoute><AdminLayout title="Dashboard Overview"><Dashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/scans" element={<AdminRoute><Scans /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
    </Routes>
  );
};

export default App;
