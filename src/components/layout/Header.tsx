import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { Shield, Trash2, LogOut, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, tier, logout, openAuthModal } = useAuth();
  const { images, clearWorkspace } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAFA] border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs select-none">
            I
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-neutral-900 tracking-tight">Imazora</span>
            <span className="text-[11px] text-neutral-400 font-normal">by Zorquelz</span>
          </div>
        </div>

        {/* Center: Quiet Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-medium">Local Browser Sandbox</span>
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

          {tier === 'guest' ? (
            <button
              onClick={() => openAuthModal('manual')}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-900 hover:bg-white text-neutral-800 text-xs font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Guest (10MB)</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-900 font-semibold">Sign in free</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-800 text-xs font-medium transition flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">
                  {user?.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-neutral-700">{user?.name || user?.email}</span>
                <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-mono text-[10px]">PRO</span>
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
