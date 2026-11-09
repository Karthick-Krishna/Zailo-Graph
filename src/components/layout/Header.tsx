import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Trash2, LogOut, ChevronDown, Keyboard, Undo2, Redo2, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { images, clearWorkspace, undo, redo, canUndo, canRedo, activeHistory, activeHistoryIndex, isMobileToolsOpen, setIsMobileToolsOpen } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-white border-b border-neutral-200 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand with Official Vector Logo & Mobile Tools (25) Launcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ZailoGraphLogo size="sm" showText={true} />
          <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 pl-2 border-l border-neutral-200">
            by Coralgenz &amp; Zorquelz
          </span>
          <button
            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
            className="md:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-violet-50 hover:bg-violet-100 active:bg-violet-200 text-violet-900 border border-violet-200 text-xs font-bold transition cursor-pointer shadow-2xs ml-0.5 min-h-[34px]"
            title="Browse all 25 Studio Tools"
            aria-label="Open 25 Studio Tools Navigation"
          >
            <Layers className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span className="hidden min-[360px]:inline">Tools </span>
            <span className="font-mono text-[11px]">(25)</span>
          </button>
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
              <Keyboard className="w-3.5 h-3.5 text-violet-500" />
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('manual')}
                className="px-2.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 hover:from-violet-950 hover:to-indigo-950 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-md hover:shadow-violet-500/10 cursor-pointer flex items-center gap-1.5 border border-neutral-800 min-h-[34px] sm:min-h-[38px] whitespace-nowrap"
              >
                <span>Sign In</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-800 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[34px]"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {(user.email?.[0] || 'Z').toUpperCase()}
                  </div>
                )}
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
