// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Globe, Bell, Shield, FileText, Trash2, Key, Mail, X, AlertTriangle, Camera } from 'lucide-react';
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
  const [deleteStep, setDeleteStep] = useState(1); // 1: initial, 2: warning, 3: confirm
  const [confirmText, setConfirmText] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string>(
    localStorage.getItem('hellobrick_profile_image') || ''
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // Load settings on mount
  useEffect(() => {
    const settings = userSettingsService.getSettings(userId);
    setIsPrivate(settings.isPrivate);
    setNotificationsEnabled(settings.notificationsEnabled);

    // Initialize notification service
    notificationService.initialize();
    const notifSettings = notificationService.getSettings();
    setNotificationsEnabled(notifSettings.enabled);
  }, [userId]);

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

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Send password reset request to backend
      const response = await fetch(CONFIG.AUTH_RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      if (response.ok) {
        alert('Password reset email sent! Check your inbox.');
        setShowResetPasswordModal(false);
        setResetEmail('');
      } else {
        alert('Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to send reset email. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    if (deleteStep === 1) {
      // Step 1: Initial click - show warning
      setDeleteStep(2);
    } else if (deleteStep === 2) {
      // Step 2: Show confirmation input
      setDeleteStep(3);
    } else if (deleteStep === 3) {
      // Step 3: Verify confirmation text
      if (confirmText === 'CONFIRM') {
        performAccountDeletion();
      } else {
        alert('Please type CONFIRM exactly to delete your account');
      }
    }
  };

  const performAccountDeletion = async () => {
    try {
      // Delete from backend
      const response = await fetch(CONFIG.USER_DELETE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // Clear local storage
      localStorage.removeItem('hellobrick_userId');
      localStorage.removeItem('hellobrick_collection');
      localStorage.removeItem(`hellobrick_user_settings_${userId}`);
      localStorage.removeItem('hellobrick_notification_settings');
      localStorage.removeItem('hellobrick_fcm_token');

      // Close modal and navigate to auth
      setShowDeleteModal(false);
      setDeleteStep(1);
      setConfirmText('');

      // Navigate to auth screen (will need to add this to App.tsx)
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const openPrivacyPolicy = () => {
    window.open('/privacy-policy.html', '_blank');
  };

  const openTermsOfService = () => {
    window.open('/terms-of-service.html', '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-[max(env(safe-area-inset-top),3.5rem)] pb-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => onNavigate(Screen.PROFILE)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Settings</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 safe-area-bottom">
        {/* Profile Picture Section */}
        <div className="bg-white border-b border-slate-200 mt-4 px-4 py-6 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            {profileImage ? (
              <img
                src={profileImage}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                alt="Profile"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-2xl font-black text-slate-400">
                  {userId.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-orange-600 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          <p className="text-xs text-slate-500 mt-2 font-medium">Tap to change profile picture</p>
        </div>
        {/* Privacy Section */}
        <div className="bg-white border-b border-slate-200 mt-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Privacy</h2>
          </div>

          <button
            onClick={handlePrivacyToggle}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
              <div className="flex-shrink-0">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-slate-700" />
                ) : (
                  <Globe className="w-5 h-5 text-slate-700" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm break-words">Account Privacy</div>
                <div className="text-xs text-slate-500 break-words leading-tight">
                  {isPrivate ? 'Private - Only you can see profile' : 'Public - Everyone can see profile'}
                </div>
              </div>
            </div>
            <div className={`w-12 h-6.5 rounded-full transition-colors flex-shrink-0 flex items-center relative ${isPrivate ? 'bg-orange-500' : 'bg-slate-300'}`}>
              <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-sm transition-transform absolute ${isPrivate ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </div>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white border-b border-slate-200 mt-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Notifications</h2>
          </div>

          <button
            onClick={handleNotificationToggle}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
              <div className="flex-shrink-0">
                <Bell className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm break-words">Push Notifications</div>
                <div className="text-xs text-slate-500 break-words leading-tight">Get notified about new puzzle drops</div>
              </div>
            </div>
            <div className={`w-12 h-6.5 rounded-full transition-colors flex-shrink-0 flex items-center relative ${notificationsEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}>
              <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-sm transition-transform absolute ${notificationsEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </div>
          </button>
        </div>

        {/* Account Section */}
        <div className="bg-white border-b border-slate-200 mt-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Account</h2>
          </div>

          <button
            onClick={() => setShowResetPasswordModal(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-700" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-slate-900 break-words">Reset Password</div>
                <div className="text-sm text-slate-500 break-words">Change your account password</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
          </button>
        </div>

        {/* Legal Section */}
        <div className="bg-white border-b border-slate-200 mt-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Legal</h2>
          </div>

          <button
            onClick={openPrivacyPolicy}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-700" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-slate-900 break-words">Privacy Policy</div>
                <div className="text-sm text-slate-500 break-words">Read our privacy policy</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
          </button>

          <button
            onClick={openTermsOfService}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-700" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold text-slate-900 break-words">Terms of Service</div>
                <div className="text-sm text-slate-500 break-words">Read our terms of service</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border-b border-slate-200 mt-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-red-500 uppercase tracking-wide">Danger Zone</h2>
          </div>

          <button
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteStep(1);
            }}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-50 text-red-600"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-bold break-words">Delete Account</div>
                <div className="text-sm text-red-400 break-words">Permanently delete your account and data</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResetEmail('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResetEmail('');
                }}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal - Triple Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            {deleteStep === 1 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-bold text-red-600">Warning: Data Loss</h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 font-bold mb-2">If you delete your account, you will lose:</p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>All your brick collections</li>
                    <li>Your XP, levels, and achievements</li>
                    <li>All your posts and contributions</li>
                    <li>Your training data contributions</li>
                    <li>Your battle history</li>
                    <li>All account settings and preferences</li>
                  </ul>
                  <p className="text-sm text-red-800 font-bold mt-3">This action is permanent and cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 3 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-red-600">Final Confirmation</h2>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                      setConfirmText('');
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  To confirm account deletion, please type <strong className="text-red-600">CONFIRM</strong> in the box below:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="Type CONFIRM here"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-mono text-lg"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                      setConfirmText('');
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== 'CONFIRM'}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
