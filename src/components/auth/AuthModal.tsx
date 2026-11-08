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
        return 'Continue to ZailoGraph';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <ZailoGraphLogo size="sm" showText={false} />
            <div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                {getReasonTitle()}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Privacy-first image workspace • Zero passwords
              </p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom trigger alert banner if triggered by a limit */}
        {authModal.customMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{authModal.customMessage}</span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-2.5 text-xs text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
            <button 
              onClick={clearAuthError}
              className="text-red-600 hover:text-red-900 font-bold ml-1 text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1.5">
            <h4 className="text-base font-semibold text-neutral-900">
              Continue to ZailoGraph
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Sign in with Google to continue to ZailoGraph and unlock full session persistence and all 26 local image tools.
            </p>
          </div>

          {/* Primary Google Sign In Action */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-semibold text-sm transition-all border border-neutral-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google Vector G Logo */}
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
                  <span className="text-neutral-800 font-medium">Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-neutral-400">
              Redirects to Google OAuth • No password needed
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100 MB Max File Size</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50-Image Batch Queue</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Local AI Super-Res &amp; Matting</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Camera RAW &amp; Lossless EXIF</span>
            </div>
          </div>
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium text-center">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your image files never leave your device. 100% private.</span>
        </div>
      </div>
    </div>
  );
};
