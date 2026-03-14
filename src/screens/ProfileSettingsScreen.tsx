// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Lock, Globe, Bell, Shield, FileText, Trash2, Key, Camera, X, AlertTriangle } from 'lucide-react';
import { Screen } from '../types';
import { notificationService } from '../services/notificationService';
import { userSettingsService } from '../services/userSettingsService';
import { CONFIG } from '../services/configService';

interface ProfileSettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ onNavigate }) => {
  const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';
  const [isPrivate, setIsPrivate] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string>(
    localStorage.getItem('hellobrick_profile_image') || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const settings = userSettingsService.getSettings(userId);
    setIsPrivate(settings.isPrivate);
    setNotificationsEnabled(settings.notificationsEnabled);
    notificationService.initialize();
    const notifSettings = notificationService.getSettings();
    setNotificationsEnabled(notifSettings.enabled);
  }, [userId]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setProfileImage(imageData);
      localStorage.setItem('hellobrick_profile_image', imageData);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePrivacyToggle = async () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    await userSettingsService.setPrivacy(userId, newValue);
  };

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await notificationService.setEnabled(newValue);
    await userSettingsService.setNotifications(userId, newValue);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600/5 via-blue-500/0 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#050A18]/80 sticky top-0">
        <button
          onClick={() => onNavigate(Screen.PROFILE)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-widest">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Profile Card */}
        <div className="px-6 py-10 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative"
          >
            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center p-1 border border-white/10 shadow-2xl relative overflow-hidden group">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full rounded-[38px] object-cover" alt="Profile" />
              ) : (
                <span className="text-3xl font-black text-slate-500">{userId.charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-2xl flex items-center justify-center border-4 border-[#050A18]">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          <h2 className="mt-4 font-black text-white text-lg">@{userId}</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Private Account</p>
        </div>

        {/* Settings Groups */}
        <div className="px-6 space-y-8">
          {/* GROUP: Preferences */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Account Preferences</h3>
            <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-2 space-y-1">
                <button 
                  onClick={handlePrivacyToggle}
                  className="w-full h-16 px-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Privacy Mode</p>
                      <p className="text-[10px] text-slate-400 font-medium">{isPrivate ? 'Anyone can see your profile' : 'Only you can see profile'}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6.5 rounded-full transition-all relative ${isPrivate ? 'bg-orange-500' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.75 transition-all ${isPrivate ? 'left-[23px]' : 'left-[5px]'}`} />
                  </div>
                </button>

                <button 
                  onClick={handleNotificationToggle}
                  className="w-full h-16 px-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Notifications</p>
                      <p className="text-[10px] text-slate-400 font-medium">New drops & daily streaks</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6.5 rounded-full transition-all relative ${notificationsEnabled ? 'bg-orange-500' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.75 transition-all ${notificationsEnabled ? 'left-[23px]' : 'left-[5px]'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* GROUP: Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Support & Legal</h3>
            <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-2 space-y-1">
                {[
                  { label: 'Privacy Policy', icon: <Shield className="w-5 h-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Terms of Service', icon: <FileText className="w-5 h-5" />, color: 'text-slate-400', bg: 'bg-white/5' },
                ].map((item, i) => (
                  <button key={i} className="w-full h-16 px-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                        {item.icon}
                      </div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-600 rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GROUP: Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-red-500/50 uppercase tracking-widest px-2">Important</h3>
            <div className="bg-red-500/5 rounded-[32px] border border-red-500/10 overflow-hidden">
              <div className="p-2">
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full h-16 px-4 flex items-center gap-4 hover:bg-red-500/10 transition-colors rounded-2xl text-red-500"
                >
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Delete Account</p>
                    <p className="text-[10px] text-red-500/50 font-medium">This cannot be undone</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">HelloBrick v4.0.2</p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
          <div className="bg-[#050A18] border border-red-500/20 w-full max-w-md rounded-[40px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center text-red-500 mb-6">
                      <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">Are you sure?</h3>
                  <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                    Deleting your account will permanently remove all your scanned bricks, XP, and history. 
                    <span className="text-red-400 block mt-2 font-bold uppercase text-xs tracking-widest">This cannot be undone.</span>
                  </p>
                  
                  <div className="w-full flex flex-col gap-3">
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-5 bg-white/5 text-white font-black rounded-3xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                      Wait, cancel
                    </button>
                    <button 
                      className="w-full py-5 bg-red-600 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                      Delete everything
                    </button>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
