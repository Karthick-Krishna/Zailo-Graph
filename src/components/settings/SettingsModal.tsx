import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  LogOut, 
  AlertTriangle, 
  Trash2, 
  Save, 
  Sparkles, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    user, 
    isSettingsOpen, 
    closeSettings, 
    updateUserName, 
    logout, 
    deleteAccount 
  } = useAuth();
  
  const { clearWorkspace, images } = useSession();

  const [nameInput, setNameInput] = useState('');
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setDeleteConfirmationInput('');
      setDeleteError(null);
      setNameSaveSuccess(false);
    }
  }, [user, isSettingsOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        e.preventDefault();
        closeSettings();
      }
    };
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen || !user) return null;

  const currentDisplayName = (user.name || user.email.split('@')[0] || 'Creator').trim();
  const isDeleteConfirmed = deleteConfirmationInput.trim().toLowerCase() === currentDisplayName.toLowerCase();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSavingName(true);
    setNameSaveSuccess(false);
    try {
      const success = await updateUserName(nameInput);
      if (success) {
        setNameSaveSuccess(true);
        setTimeout(() => setNameSaveSuccess(false), 3000);
      }
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleteConfirmed) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Clear all active image memory and cached files
      clearWorkspace();

      const result = await deleteAccount(deleteConfirmationInput);
      if (!result.success) {
        setDeleteError(result.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting account.');
      setIsDeleting(false);
    }
  };

  const formattedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Active';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeSettings();
        }
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50/70">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ZailoGraphLogo size="sm" showText={false} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight truncate flex items-center gap-2">
                Account &amp; Workspace Settings
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-0.5 truncate">
                Manage your profile, credentials, and local studio storage
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSettings();
            }}
            className="shrink-0 p-2 text-neutral-400 hover:text-neutral-800 active:text-neutral-950 hover:bg-neutral-200/70 active:bg-neutral-300 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center relative z-20 touch-manipulation"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Profile & Pro Badge Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/60 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={currentDisplayName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {(user.name?.[0] || user.email?.[0] || 'Z').toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span>{currentDisplayName}</span>
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-1">
                  <Mail className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span className="font-medium select-all">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Pro Status Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-violet-100/80 border border-violet-200 text-violet-900 flex items-center gap-1.5 shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-bold tracking-tight">PRO UNLOCKED</span>
            </div>
          </div>

          {/* Account Metadata Quick Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member Since</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 mt-1">{formattedDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Active Images</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 mt-1">
                {images.length} {images.length === 1 ? 'image' : 'images'} in memory
              </p>
            </div>
          </div>

          {/* Section: Edit Display Name */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-violet-600" />
                <span>Display Name</span>
              </label>
              {nameSaveSuccess && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                id="displayName"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-xs sm:text-sm text-neutral-900 outline-none transition"
              />
              <button
                type="submit"
                disabled={isSavingName || !nameInput.trim() || nameInput.trim() === user.name}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingName ? 'Saving...' : 'Save'}</span>
              </button>
            </form>
          </div>

          {/* Section: Log Out */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-neutral-900">Session Management</h5>
              <p className="text-[11px] text-neutral-500">Sign out of your active session on this device</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-500" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Section: Danger Zone (Delete Account) */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-red-950">
                    Danger Zone: Delete Account
                  </h5>
                  <p className="text-[11px] text-red-800/90 leading-relaxed mt-1">
                    Deleting your account is permanent and irreversible. Your user identity, session state, and Pro access privileges will be permanently erased.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-xs text-red-900 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2 pt-1 border-t border-red-200/70">
                <label className="text-[11px] font-medium text-red-900 block">
                  To confirm deletion, please re-type your display name: <span className="font-bold underline decoration-red-400">{currentDisplayName}</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    placeholder={`Type "${currentDisplayName}"`}
                    className="flex-1 px-3 py-2 rounded-xl border border-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-xs sm:text-sm text-neutral-900 outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={!isDeleteConfirmed || isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Privacy Guarantee */}
        <div className="p-3 sm:p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Local client-side architecture • Your data is under your full control</span>
        </div>
      </div>
    </div>
  );
};

