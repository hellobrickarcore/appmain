import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';

const ALLOWED_ADMINS = [
  'hellobrickar@gmail.com'
];

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Master Bypass check
        const hasBypass = localStorage.getItem('hellobrick_admin_bypass') === 'true';
        if (hasBypass) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email && ALLOWED_ADMINS.includes(user.email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin" />
        <p className="text-brand-text-dim text-[11px] font-black uppercase tracking-[0.2em]">Authenticating Brain...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
