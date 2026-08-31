import React, { useState } from 'react';
import { Screen } from '../types';
import { 
  Bell, 
  TrendingDown, 
  Trophy, 
  Package, 
  ChevronLeft, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface AlertsScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: '1',
      type: 'retiring',
      title: 'Retiring Soon: Star Wars Millennium Falcon (75192)',
      active: true,
      createdAt: '2026-08-20',
      icon: <Bell className="w-5 h-5 text-red-400" />,
      color: 'border-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      id: '2',
      type: 'price',
      title: 'Price Drop: < $350 for Daily Bugle (76178)',
      active: true,
      createdAt: '2026-08-18',
      icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-400',
      bgColor: 'bg-emerald-400/10'
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Portfolio Value: Hit $5,000',
      active: true,
      createdAt: '2026-08-15',
      icon: <Trophy className="w-5 h-5 text-[#FFD600]" />,
      color: 'border-[#FFD600]',
      bgColor: 'bg-[#FFD600]/10'
    },
    {
      id: '4',
      type: 'restock',
      title: 'Restock: Titanic (10294) on LEGO.com',
      active: false,
      createdAt: '2026-08-10',
      icon: <Package className="w-5 h-5 text-emerald-500" />,
      color: 'border-blue-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: '5',
      type: 'price',
      title: 'Price Drop: < $80 for Bonsai Tree (10281)',
      active: true,
      createdAt: '2026-08-05',
      icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-400',
      bgColor: 'bg-emerald-400/10'
    }
  ]);

  const notifications = [
    {
      id: 'n1',
      title: 'Target Price Reached!',
      description: 'Daily Bugle is now $349.99 on Amazon.',
      time: '2 hours ago',
      icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
      read: false
    },
    {
      id: 'n2',
      title: 'Portfolio Milestone Reached! 🎉',
      description: 'Your portfolio just crossed the $4,000 mark.',
      time: '1 day ago',
      icon: <Trophy className="w-5 h-5 text-[#FFD600]" />,
      read: true
    },
    {
      id: 'n3',
      title: 'Set Retiring Soon',
      description: 'Republic Gunship (75309) is marked to retire in December.',
      time: '3 days ago',
      icon: <Bell className="w-5 h-5 text-red-400" />,
      read: true
    }
  ];

  const alertTypes = [
    {
      id: 't1',
      title: 'Set Retiring Soon',
      description: 'Get notified when LEGO announces set retirement',
      icon: <Bell className="w-6 h-6 text-red-400" />,
      borderColor: 'border-red-400/30',
      hoverBorder: 'hover:border-red-400'
    },
    {
      id: 't2',
      title: 'Price Drop',
      description: 'Alert when a wishlist item drops below your target price',
      icon: <TrendingDown className="w-6 h-6 text-emerald-400" />,
      borderColor: 'border-emerald-400/30',
      hoverBorder: 'hover:border-emerald-400'
    },
    {
      id: 't3',
      title: 'Portfolio Milestone',
      description: 'Celebrate when your portfolio hits $1K, $5K, $10K',
      icon: <Trophy className="w-6 h-6 text-[#FFD600]" />,
      borderColor: 'border-[#FFD600]/30',
      hoverBorder: 'hover:border-[#FFD600]'
    },
    {
      id: 't4',
      title: 'Restock Alert',
      description: 'Know when sold-out sets come back on LEGO.com',
      icon: <Package className="w-6 h-6 text-emerald-500" />,
      borderColor: 'border-blue-400/30',
      hoverBorder: 'hover:border-blue-400'
    }
  ];

  const toggleAlert = (id: string) => {
    setActiveAlerts(alerts =>
      alerts.map(a => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const deleteAlert = (id: string) => {
    setActiveAlerts(alerts => alerts.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] text-gray-900 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),6rem)]">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => onNavigate(Screen.Home)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold ml-2">Alerts & Notifications</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2 border-b border-gray-200/50">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'alerts' 
              ? 'bg-gray-50 text-gray-900' 
              : 'text-gray-500 hover:bg-gray-50/50'
          }`}
        >
          My Alerts
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-gray-50 text-gray-900' 
              : 'text-gray-500 hover:bg-gray-50/50'
          }`}
        >
          History
          <span className="bg-emerald-500 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            1
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {activeTab === 'alerts' ? (
          <div className="p-4 space-y-8">
            
            {/* Create New Alert Section */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Create New Alert
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alertTypes.map(type => (
                  <button
                    key={type.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${type.borderColor} bg-gray-500 ${type.hoverBorder} transition-all text-left group`}
                  >
                    <div className="p-2 rounded-lg bg-[#F5F5F7] border border-gray-200 group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{type.title}</h3>
                      <p className="text-xs text-gray-500 leading-snug">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Active Alerts Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Active Alerts
                </h2>
                <span className="text-xs text-gray-400">{activeAlerts.length} configured</span>
              </div>
              
              {activeAlerts.length > 0 ? (
                <div className="space-y-3">
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/80 border border-gray-200/80 overflow-hidden relative"
                    >
                      {/* Left colored border accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.color}`} />
                      
                      <div className={`p-2 rounded-full ${alert.bgColor} relative`}>
                        {alert.icon}
                        {alert.active && (
                          <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${alert.color.replace('border', 'bg')} animate-pulse`} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm truncate">{alert.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Created {alert.createdAt}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${alert.active ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 bg-gray-50'}`}>
                            {alert.active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle */}
                        <button 
                          onClick={() => toggleAlert(alert.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${alert.active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${alert.active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        
                        {/* Delete */}
                        <button 
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No alerts set up</h3>
                  <p className="text-sm text-gray-400 max-w-[250px]">
                    Create an alert above to get notified about price drops, restocks, and more.
                  </p>
                </div>
              )}
            </section>
            
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                className={`flex gap-4 p-4 rounded-xl border ${notif.read ? 'bg-white/40 border-gray-200/40' : 'bg-white border-gray-300'}`}
              >
                <div className="mt-1">
                  <div className={`p-2 rounded-lg ${notif.read ? 'bg-[#F5F5F7]' : 'bg-gray-50'}`}>
                    {notif.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium text-sm ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400">{notif.time}</span>
                  </div>
                  <p className={`text-sm mt-1 leading-snug ${notif.read ? 'text-gray-400' : 'text-gray-500'}`}>
                    {notif.description}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-8 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
