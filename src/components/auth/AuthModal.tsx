import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Check, X, Zap, Loader2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModal, 
    closeAuthModal, 
    signInWithGoogle, 
    isLoading, 
    authError, 
    clearAuthError 
  } = useAuth();

  // Close modal when user presses Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModal.isOpen) {
        e.preventDefault();
        closeAuthModal();
      }
    };
    if (authModal.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [authModal.isOpen, closeAuthModal]);

  if (!authModal.isOpen) return null;

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const getReasonTitle = () => {
    switch (authModal.reason) {
      case 'size_limit':
        return 'Unlock 100 MB High-Res Processing';
      case 'batch_limit':
        return 'Unlock 50-Image Batch Queues';
      case 'pro_feature':
        return 'Unlock Full Pro Creative Suite';
      case 'resolution_limit':
        return 'Unlock Unconstrained Master Exports';
      default:
        return 'Continue to Imazora';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <ZailoGraphLogo size="sm" showText={false} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight truncate">
                {getReasonTitle()}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-0.5 truncate">
                Privacy-first image workspace • Google Authentication
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeAuthModal();
            }}
            className="shrink-0 p-2 text-neutral-400 hover:text-neutral-800 active:text-neutral-950 hover:bg-neutral-200/70 active:bg-neutral-300 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center relative z-20 touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Custom trigger alert banner if triggered by a limit */}
        {authModal.customMessage && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{authModal.customMessage}</span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-2.5 text-xs text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
            <button 
              onClick={clearAuthError}
              className="text-red-600 hover:text-red-900 font-bold ml-1 text-sm leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          <div className="text-center space-y-1.5">
            <h4 className="text-base sm:text-lg font-bold text-neutral-900">
              Sign in with Google
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Authenticate instantly with your Google account. Your image files are processed 100% locally in your browser.
            </p>
          </div>

          {/* Primary Google-Only Sign In Action */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-semibold text-sm transition-all border border-neutral-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-neutral-800 font-medium text-sm">Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-neutral-400">
              One-click instant authentication • No password required
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>10 Pro Tools Unlocked</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50-Image Batch Queue</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Camera RAW &amp; Vectorizer</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Passport ID &amp; Redact Tools</span>
            </div>
          </div>
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="p-3.5 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium text-center">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Zero cloud image uploads • Private client-side execution</span>
        </div>
      </div>
    </div>
  );
};
