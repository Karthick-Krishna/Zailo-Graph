import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { ShieldCheck, Sparkles, Trash2, LogOut, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, tier, logout, openAuthModal } = useAuth();
  const { images, clearWorkspace } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold tracking-tighter text-lg shadow-sm">
            I
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-neutral-900 tracking-tight">Imazora</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                by Zorquelz
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium hidden sm:block">
              Your images. Your workflow. Your control.
            </p>
          </div>
        </div>

        {/* Center: Privacy & Workspace Indicators */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Local Sandbox Active</span>
          </div>

          {images.length > 0 && (
            <span className="text-xs font-medium text-neutral-500">
              {images.length} {images.length === 1 ? 'image' : 'images'} in workspace
            </span>
          )}
        </div>

        {/* Right: Actions & Auth */}
        <div className="flex items-center gap-2.5">
          {images.length > 0 && (
            <button
              onClick={clearWorkspace}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-600 hover:text-red-600 transition flex items-center gap-1.5 cursor-pointer"
              title="Clear all images from workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {tier === 'guest' ? (
            <button
              onClick={() => openAuthModal('manual')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Guest (10MB limit) • <strong className="underline decoration-amber-400">Unlock Free Pro</strong></span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold transition flex items-center gap-2 cursor-pointer border border-neutral-200"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.name || user?.email}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PRO FREE</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-[11px] text-neutral-400">Signed in as</p>
                    <p className="text-xs font-semibold text-neutral-800 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
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
