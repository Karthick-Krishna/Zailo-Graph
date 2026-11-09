import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Trash2, LogOut, ChevronDown, Keyboard, Undo2, Redo2, Layers, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { user, logout, openAuthModal, openSettings } = useAuth();
  const { images, clearWorkspace, undo, redo, canUndo, canRedo, activeHistory, activeHistoryIndex, isMobileToolsOpen, setIsMobileToolsOpen } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-white border-b border-neutral-200 select-none overflow-visible">
      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-3 sm:px-6 h-14 flex items-center justify-between gap-1 sm:gap-4">
        {/* Brand with Official Vector Logo & Mobile Tools (25) Launcher */}
        <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-3 shrink-0">
          <ZailoGraphLogo size="sm" showText={true} hideTextOnMobile={true} />
          <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 pl-2 border-l border-neutral-200">
            by Coralgenz &amp; Zorquelz
          </span>
          <button
            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
            className="md:hidden flex items-center gap-1 px-1.5 min-[360px]:px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-900 border border-blue-200 text-xs font-bold transition cursor-pointer shadow-2xs min-h-[32px] shrink-0"
            title="Browse all 25 Studio Tools"
            aria-label="Open 25 Studio Tools Navigation"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden min-[380px]:inline text-[11px]">Tools </span>
            <span className="font-mono text-[10px] min-[360px]:text-[11px]">(25)</span>
          </button>
        </div>

        {/* Center: Quiet Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 animate-pulse"></span>
            <Shield className="w-3.5 h-3.5 text-blue-600" />
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* History Undo / Redo */}
          {images.length > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-neutral-100/90 border border-neutral-200 shadow-2xs">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                title="Undo transformation (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                title="Redo transformation (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              {activeHistory.length > 1 && (
                <span className="hidden sm:inline text-[10px] font-mono text-neutral-500 px-1 border-l border-neutral-200">
                  {activeHistoryIndex + 1}/{activeHistory.length}
                </span>
              )}
            </div>
          )}

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="hidden sm:flex px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-xs font-mono text-neutral-600 hover:text-neutral-900 transition items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts (?)"
              aria-label="Toggle keyboard shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline text-[11px] font-semibold">Shortcuts</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-500">?</kbd>
            </button>
          )}

          {images.length > 0 && (
            <button
              onClick={clearWorkspace}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-xs font-medium text-neutral-600 hover:text-red-600 transition flex items-center gap-1 cursor-pointer min-h-[32px]"
              title="Clear all images from workspace"
              aria-label="Clear all images"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {!user ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Secondary Sign In Button */}
              <button
                type="button"
                onClick={() => openAuthModal('manual', undefined, undefined, 'sign_in')}
                className="px-2 min-[360px]:px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 text-[11px] min-[360px]:text-xs font-semibold transition cursor-pointer min-h-[32px] sm:min-h-[36px] whitespace-nowrap shadow-2xs shrink-0"
              >
                Sign In
              </button>

              {/* Primary Sign Up Button */}
              <button
                type="button"
                onClick={() => openAuthModal('manual', undefined, undefined, 'sign_up')}
                className="px-2.5 min-[360px]:px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-neutral-900 via-blue-950 to-neutral-900 hover:from-blue-900 hover:to-blue-950 text-white text-[11px] min-[360px]:text-xs font-semibold transition-all shadow-xs hover:shadow-md hover:shadow-blue-500/15 cursor-pointer flex items-center gap-1 sm:gap-1.5 border border-neutral-800 min-h-[32px] sm:min-h-[36px] whitespace-nowrap shrink-0"
              >
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dedicated Settings Button */}
              <button
                onClick={openSettings}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition flex items-center gap-1.5 cursor-pointer min-h-[34px] shadow-2xs"
                title="Account Settings (Name, Profile & Danger Zone)"
                aria-label="Settings"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden md:inline">Settings</span>
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                  className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 active:bg-neutral-50 text-neutral-800 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[34px]"
                  aria-label="User account menu"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name || user.email}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover shadow-xs border border-neutral-200" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      {(user.email?.[0] || 'Z').toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate text-neutral-700 font-medium">
                    {user?.name || user?.email}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200/60 font-mono text-[9px] font-bold">
                    PRO
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200/90 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* Account Info Header */}
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/70">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name || user.email}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-2xs" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                            {(user.email?.[0] || 'Z').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-neutral-900 truncate">
                            {user.name || 'Zailo Graph Creator'}
                          </p>
                          <p className="text-[11px] font-mono text-neutral-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-neutral-500 font-medium">Account Tier</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 font-bold font-mono">
                          PRO UNLOCKED
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          openSettings();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-xl flex items-center gap-2.5 transition cursor-pointer font-medium"
                      >
                        <Settings className="w-4 h-4 text-neutral-500" />
                        <span>Account Settings</span>
                      </button>

                      {onOpenShortcuts && (
                        <button
                          onClick={() => {
                            onOpenShortcuts();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-xl flex items-center gap-2.5 transition cursor-pointer font-medium sm:hidden"
                        >
                          <Keyboard className="w-4 h-4 text-neutral-500" />
                          <span>Keyboard Shortcuts</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-xl flex items-center gap-2.5 transition cursor-pointer font-medium border-t border-neutral-100 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
