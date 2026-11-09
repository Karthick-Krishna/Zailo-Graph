import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Check, X, Zap, Loader2, AlertCircle, ArrowRight, User as UserIcon, CheckCircle2, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    user,
    authModal, 
    closeAuthModal, 
    signInWithGoogle, 
    directSignIn,
    isLoading, 
    authError, 
    clearAuthError,
    showNameOnboarding,
    completeNameOnboarding,
  } = useAuth();

  const [onboardingName, setOnboardingName] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  // Pre-fill name from Google account when entering name onboarding
  useEffect(() => {
    if (user?.name) {
      setOnboardingName(user.name);
    } else if (user?.email) {
      setOnboardingName(user.email.split('@')[0]);
    }
  }, [user, showNameOnboarding]);

  // Close modal when user presses Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModal.isOpen) {
        e.preventDefault();
        if (showNameOnboarding) {
          completeNameOnboarding(); // Skip and use default Google name on Escape
        } else {
          closeAuthModal();
        }
      }
    };
    if (authModal.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [authModal.isOpen, showNameOnboarding, closeAuthModal, completeNameOnboarding]);

  if (!authModal.isOpen) return null;

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || !manualEmail.includes('@')) return;
    directSignIn(manualEmail, manualName);
    setManualName('');
    setManualEmail('');
  };

  const handleSaveOnboardingName = (e: React.FormEvent) => {
    e.preventDefault();
    completeNameOnboarding(onboardingName);
  };

  const handleSkipOnboardingName = () => {
    completeNameOnboarding(); // Uses Google account name by default
  };

  const defaultGoogleName = user?.name || (user?.email ? user.email.split('@')[0] : 'Creator');

  const getReasonTitle = () => {
    if (showNameOnboarding) {
      return 'Welcome to Zailo Graph!';
    }
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (showNameOnboarding) {
            handleSkipOnboardingName();
          } else {
            closeAuthModal();
          }
        }
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
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
                {showNameOnboarding && user?.email 
                  ? `Signed in as ${user.email}`
                  : 'Privacy-first image workspace • Zero passwords'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (showNameOnboarding) {
                handleSkipOnboardingName();
              } else {
                closeAuthModal();
              }
            }}
            className="shrink-0 p-2 text-neutral-400 hover:text-neutral-800 active:text-neutral-950 hover:bg-neutral-200/70 active:bg-neutral-300 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center relative z-20 touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* STEP 2: Name Onboarding View after successful login */}
        {showNameOnboarding ? (
          <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
            {/* Success Pill Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentication successful! Pro features unlocked.</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="onboardingName" className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-violet-600" />
                <span>Personalize your display name:</span>
              </label>
              <p className="text-[11px] text-neutral-500">
                This name will appear on your workspace and exported media.
              </p>
            </div>

            <form onSubmit={handleSaveOnboardingName} className="space-y-3">
              <input
                id="onboardingName"
                type="text"
                autoFocus
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 text-sm text-neutral-900 outline-none transition font-medium"
              />

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save Name &amp; Enter Studio</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipOnboardingName}
                  className="py-3 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap"
                  title={`Use "${defaultGoogleName}" from your Google account`}
                >
                  <span>Skip</span>
                </button>
              </div>
            </form>

            <p className="text-[11px] text-center text-neutral-400">
              Skipping keeps your Google name (<span className="font-medium text-neutral-600">{defaultGoogleName}</span>). You can edit this anytime in Settings.
            </p>
          </div>
        ) : (
          /* STEP 1: Quick Google Sign-In View */
          <>
            {/* Custom trigger alert banner if triggered by a limit */}
            {authModal.customMessage && (
              <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{authModal.customMessage}</span>
              </div>
            )}

            {/* Auth Error Banner with direct resolution */}
            {authError && (
              <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                  <button 
                    onClick={clearAuthError}
                    className="text-amber-700 hover:text-amber-950 font-bold ml-1 text-sm leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center space-y-1">
                <h4 className="text-sm sm:text-base font-semibold text-neutral-900">
                  Quick Sign in with Google
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Instant one-click access. Unlocks all 10 Pro utilities, persistent workspaces, and 50-image batch queues.
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
                      <span>Signing in...</span>
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

                {/* Email entry option (uses real user email) */}
                <form onSubmit={handleManualSubmit} className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="flex-1 h-px bg-neutral-200"></span>
                    <span>or sign in with your email</span>
                    <span className="flex-1 h-px bg-neutral-200"></span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      placeholder="Enter your Gmail / Work email"
                      required
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-violet-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!manualEmail.trim() || !manualEmail.includes('@')}
                      className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Enter
                    </button>
                  </div>
                </form>
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
          </>
        )}
      </div>
    </div>
  );
};

