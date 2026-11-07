import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Trash2, LogOut, ChevronDown, Keyboard } from 'lucide-react';

interface HeaderProps {
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { images, clearWorkspace } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAFA]/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand with Official Vector Logo */}
        <div className="flex items-center gap-3">
          <ZailoGraphLogo size="sm" showText={true} />
          <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 pl-2 border-l border-neutral-200">
            by Zorquelz
          </span>
        </div>

        {/* Center: Quiet Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 animate-pulse"></span>
            <Shield className="w-3.5 h-3.5 text-violet-600" />
            <span className="font-medium text-neutral-700">100% Private • Zero Cloud Uploads</span>
          </div>

          {images.length > 0 && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="font-mono text-neutral-500">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions & Account */}
        <div className="flex items-center gap-2">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-xs font-mono text-neutral-600 hover:text-neutral-900 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts (?)"
              aria-label="Toggle keyboard shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5 text-violet-500" />
              <span className="hidden lg:inline text-[11px] font-semibold">Shortcuts</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-500">?</kbd>
            </button>
          )}

          {images.length > 0 && (
            <button
              onClick={clearWorkspace}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-xs font-medium text-neutral-600 hover:text-red-600 transition flex items-center gap-1.5 cursor-pointer"
              title="Clear all images from workspace"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('manual')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 hover:from-violet-950 hover:to-indigo-950 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-md hover:shadow-violet-500/10 cursor-pointer flex items-center gap-2 border border-neutral-800"
              >
                <span>Sign In / Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-800 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  {user?.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-neutral-700">{user?.name || user?.email}</span>
                <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-violet-50 to-cyan-50 text-violet-700 border border-violet-200/60 font-mono text-[9px] font-bold">PRO</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-[10px] text-neutral-400 uppercase font-mono">Account</p>
                    <p className="text-xs font-medium text-neutral-800 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-neutral-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
