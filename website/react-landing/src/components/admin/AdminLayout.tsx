import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Users, 
  Trophy, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../Logo';
import { supabase } from '../../services/supabaseService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-white/10 text-brand-yellow" 
        : "text-brand-text-dim hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-brand-yellow" : "text-brand-text-dim group-hover:text-white")} />
    <span className="text-ui-body font-medium">{label}</span>
    {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
  </Link>
);

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        const allowedAdmins = ['hellobrickar@gmail.com'];
        setIsAdmin(allowedAdmins.includes(user.email || ''));
      } else if (localStorage.getItem('hellobrick_admin_bypass') === 'true') {
        setUserEmail('hellobrickar@gmail.com');
        setIsAdmin(true);
      }
    };
    fetchUser();
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#080808] border-r border-white/5 flex flex-col z-50">
      {/* Brand Section */}
      <div className="p-6 mb-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size="sm" light={true} />
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tighter text-[1.2rem] leading-none">Admin</span>
            <span className="text-[10px] text-brand-yellow font-bold tracking-widest uppercase mt-0.5 opacity-80">V4.0 INTELLIGENCE</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 px-3">Lifecycle</div>
        <NavItem 
          to="/admin" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={location.pathname === '/admin'} 
        />
        <NavItem 
          to="/admin/scans" 
          icon={Camera} 
          label="Scans" 
          active={location.pathname === '/admin/scans'} 
        />
        <NavItem 
          to="/admin/users" 
          icon={Users} 
          label="Users" 
          active={location.pathname === '/admin/users'} 
        />
        <NavItem 
          to="/admin/leaderboard" 
          icon={Trophy} 
          label="Leaderboard" 
          active={location.pathname === '/admin/leaderboard'} 
        />
        <NavItem 
          to="/admin/analytics" 
          icon={BarChart3} 
          label="Analytics" 
          active={location.pathname === '/admin/analytics'} 
        />

        <div className="pt-8 pb-4">
           <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 px-3">Deployment</div>
           <a 
             href="/" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-3 px-3 py-2 rounded-lg text-brand-text-dim hover:text-white hover:bg-white/5 transition-all duration-200 group"
           >
             <ExternalLink className="w-4 h-4 text-brand-text-dim group-hover:text-white" />
             <span className="text-ui-body font-medium">View Live Site</span>
           </a>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="px-3 py-4 mb-2 flex items-center gap-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold text-xs uppercase">
            {userEmail ? userEmail[0] : 'HB'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{userEmail || 'Anonymous'}</span>
            <span className="text-[10px] text-brand-text-dim truncate">{isAdmin ? 'Super Admin' : 'Admin'}</span>
          </div>
          <Settings className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors ml-auto" />
        </div>
        
        <button 
          onClick={async () => {
             if (supabase) await supabase.auth.signOut();
             localStorage.removeItem('hellobrick_admin_bypass');
             window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all text-ui-body font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export const AdminLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white">
      <Sidebar />
      <main className="pl-[240px] min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-brand-text-dim font-bold uppercase tracking-wider">Live</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-1 gap-1">
              {['7d', '30d', 'All'].map(range => (
                <button
                  key={range}
                  className={cn(
                    "px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                    range === '30d' ? "bg-white/10 text-white" : "text-brand-text-dim hover:text-white"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="bg-brand-orange text-black px-4 py-1.5 rounded-lg text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-brand-orange/10">
              Export CSV
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
