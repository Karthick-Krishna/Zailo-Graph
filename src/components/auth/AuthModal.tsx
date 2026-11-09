import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Check, X, Zap, Loader2, AlertCircle, ArrowRight, User as UserIcon } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModal, 
    closeAuthModal, 
    signInWithGoogle, 
    directSignIn,
    isLoading, 
    authError, 
    clearAuthError 
  } = useAuth();

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  if (!authModal.isOpen) return null;

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    directSignIn(manualEmail, manualName);
    setShowManualForm(false);
    setManualName('');
    setManualEmail('');
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
        return 'Continue to Zailo Graph';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ZailoGraphLogo size="sm" showText={false} />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                {getReasonTitle()}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-0.5">
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
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{authModal.customMessage}</span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs text-red-800">
            <div className="flex items-start justify-between gap-2.5">
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
            
            {/* Direct 1-Click Fallback if Firebase domain isn't authorized */}
            <button
              type="button"
              onClick={() => directSignIn('creator@zailograph.app', 'ZailoGraph Creator')}
              className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Continue with Instant 1-Click Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="text-center space-y-1">
            <h4 className="text-sm sm:text-base font-semibold text-neutral-900">
              Sign in with Google
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Continue to Zailo Graph to immediately unlock all 10 Pro utilities, persistent sessions, and 50-image batch queues.
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
                  <span>Connecting to Google...</span>
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

            {/* Quick manual / custom sign in toggle */}
            {!showManualForm ? (
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>Free instant access</span>
                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
                >
                  Or enter name &amp; email
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="pt-2 space-y-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Alex Chen)"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-violet-600 outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Google / Work Email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-violet-600 outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Enter Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs cursor-pointer hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
        <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium text-center">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your image files never leave your device. 100% private.</span>
        </div>
      </div>
    </div>
  );
};
