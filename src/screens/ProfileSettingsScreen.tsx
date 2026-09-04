// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Lock, Globe, Bell, Shield, FileText, Trash2, Camera, AlertTriangle, DollarSign, Volume2, Compass, Check } from 'lucide-react';
import { Screen } from '../types';
import { notificationService } from '../services/notificationService';
import { userSettingsService } from '../services/userSettingsService';
import { Browser } from '@capacitor/browser';
import { deleteAccount } from '../services/supabaseService';
import { Logo } from '../components/Logo';

interface ProfileSettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ onNavigate }) => {
  const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';
  const [isPrivate, setIsPrivate] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    localStorage.getItem('hellobrick_profile_image') || ''
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [profileName, setProfileName] = useState(
    localStorage.getItem('hellobrick_profile_name') || 'Builder'
  );
  const [currency, setCurrency] = useState(
    localStorage.getItem('hellobrick_currency') || 'USD'
  );
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [scanSound, setScanSound] = useState(
    localStorage.getItem('hellobrick_scan_sound') !== 'false'
  );

  const currencies = [
    { code: 'USD', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧' },
    { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
    { code: 'DKK', symbol: 'kr', flag: '🇩🇰' },
    { code: 'NOK', symbol: 'kr', flag: '🇳🇴' },
    { code: 'SEK', symbol: 'kr', flag: '🇸🇪' },
    { code: 'CHF', symbol: 'Fr', flag: '🇨🇭' },
    { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  ];

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem('hellobrick_currency', code);
    setShowCurrencyPicker(false);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const settings = userSettingsService.getSettings(userId);
    setIsPrivate(settings.isPrivate);
    setNotificationsEnabled(settings.notificationsEnabled);
    notificationService.initialize();
    const notifSettings = notificationService.getSettings();
    setNotificationsEnabled(notifSettings.enabled);
  }, [userId]);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('../services/supabaseService');
      await signOut();
    } catch(e) {}
    
    // Retain onboarding finished flag
    const onboardingFinished = localStorage.getItem('hellobrick_onboarding_finished');
    localStorage.clear();
    if (onboardingFinished) {
      localStorage.setItem('hellobrick_onboarding_finished', onboardingFinished);
    }
    
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const updateProfileName = (newName: string) => {
    setProfileName(newName);
    localStorage.setItem('hellobrick_profile_name', newName);
    
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

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

  const openLegal = async (url: string) => {
    await Browser.open({ url, presentationStyle: 'popover' });
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="relative z-[20] px-6 pt-[max(env(safe-area-inset-top),2.8rem)] pb-3 flex items-center justify-between border-b border-gray-200 backdrop-blur-xl bg-[#F5F5F7]/90 sticky top-0">
        <button
          onClick={() => onNavigate(Screen.PROFILE)}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-[max(env(safe-area-inset-bottom),180px)] relative z-10">
        
        {/* Profile Card */}
        <div className="px-6 py-8 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-24 h-24 relative group overflow-hidden rounded-[26px] border border-gray-200 shadow-lg bg-white flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="text-3xl font-black text-gray-800">{profileName.charAt(0).toUpperCase()}</div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-2xl flex items-center justify-center border-2 border-white shadow">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          
          <div className="mt-5 w-full max-w-[240px] relative">
            <input 
              type="text"
              value={profileName}
              onChange={(e) => updateProfileName(e.target.value)}
              className="w-full bg-white border border-gray-200/80 shadow-xs rounded-xl px-4 py-2.5 text-center font-black text-gray-900 focus:border-emerald-500 transition-all outline-none"
              placeholder="Your Name"
            />
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Tap to edit name</p>
              {saveStatus === 'saving' && <div className="w-2 h-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              {saveStatus === 'saved' && <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-50">✓ Saved</div>}
            </div>
          </div>
          <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {userId.substring(0, 12)}</p>
        </div>

        {/* Settings Groups */}
        <div className="px-6 space-y-6">
          {/* GROUP: Preferences */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Preferences</h3>
            <div className="bg-white rounded-[28px] border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
              
              <button 
                onClick={handlePrivacyToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Privacy Mode</p>
                    <p className="text-[10px] text-gray-500 font-medium">{isPrivate ? 'Only you can see profile' : 'Public collector profile'}</p>
                  </div>
                </div>
                <div className={`w-12 h-6.5 rounded-full transition-all relative ${isPrivate ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.75 shadow transition-all ${isPrivate ? 'left-[23px]' : 'left-[5px]'}`} />
                </div>
              </button>

              <button 
                onClick={handleNotificationToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                    <p className="text-[10px] text-gray-500 font-medium">Price drops & market signals</p>
                  </div>
                </div>
                <div className={`w-12 h-6.5 rounded-full transition-all relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.75 shadow transition-all ${notificationsEnabled ? 'left-[23px]' : 'left-[5px]'}`} />
                </div>
              </button>

              <button 
                onClick={() => {
                  const newVal = !scanSound;
                  setScanSound(newVal);
                  localStorage.setItem('hellobrick_scan_sound', String(newVal));
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Scan Audio</p>
                    <p className="text-[10px] text-gray-500 font-medium">Haptic chime on card match</p>
                  </div>
                </div>
                <div className={`w-12 h-6.5 rounded-full transition-all relative ${scanSound ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.75 shadow transition-all ${scanSound ? 'left-[23px]' : 'left-[5px]'}`} />
                </div>
              </button>

              <button 
                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Currency</p>
                    <p className="text-[10px] text-gray-500 font-medium">Display prices in local currency</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{currencies.find(c => c.code === currency)?.flag} {currency}</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>

              <button 
                onClick={() => {
                  localStorage.removeItem('hellobrick_onboarding_finished');
                  onNavigate(Screen.ONBOARDING_QUESTIONNAIRE);
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Re-run App Tour</p>
                    <p className="text-[10px] text-gray-500 font-medium">Review onboarding overview</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>

              {showCurrencyPicker && (
                <div className="bg-gray-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-1.5">
                    {currencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => handleCurrencyChange(c.code)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                          currency === c.code
                            ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                            : 'bg-white border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className={`text-xs font-bold ${currency === c.code ? 'text-emerald-700' : 'text-gray-800'}`}>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GROUP: Support & Legal */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Support & Legal</h3>
            <div className="bg-white rounded-[28px] border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
              {[
                { label: 'Privacy Policy', icon: <Shield className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', url: 'https://hellobrick.app/privacy' },
                { label: 'Terms of Use (EULA)', icon: <FileText className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', url: 'https://hellobrick.app/terms' },
                { label: 'Contact Support', icon: <Globe className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', url: 'mailto:support@hellobrick.app' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => item.url.startsWith('mailto') ? window.open(item.url) : openLegal(item.url)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
              ))}
            </div>
          </div>

          {/* Logout Group */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Session</h3>
            <div className="bg-white rounded-[28px] border border-gray-200/80 shadow-sm overflow-hidden">
              <button 
                onClick={handleLogout}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
              >
                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Log Out</p>
                  <p className="text-[10px] text-gray-500 font-medium">Clear local session data</p>
                </div>
              </button>
            </div>
          </div>

          {/* GROUP: Danger Zone */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">Account Management</h3>
            <div className="bg-white rounded-[28px] border border-rose-200 shadow-sm overflow-hidden">
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 flex items-center gap-4 hover:bg-rose-50 transition-colors cursor-pointer text-rose-600"
              >
                <div className="w-10 h-10 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-rose-600">Delete Account</p>
                  <p className="text-[10px] text-rose-400 font-medium">Permanently purge collection data</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center pb-20">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em]">HelloBrick v2.0.0</p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-[36px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                  <div className="w-18 h-18 bg-rose-50 border border-rose-200 rounded-[24px] flex items-center justify-center text-rose-600 mb-5">
                      <AlertTriangle className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Are you sure?</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Deleting your account will permanently remove all your scanned assets, portfolio gains, and vault history. 
                    <span className="text-rose-600 block mt-2 font-bold uppercase text-xs tracking-wider">This action cannot be undone.</span>
                  </p>
                  
                  <div className="w-full flex flex-col gap-3">
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-4 bg-gray-100 text-gray-800 font-black rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Everything'}
                    </button>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
