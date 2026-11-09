import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sanitizeDisplayName } from '../../services/profile';
import { Sparkles, ArrowRight, CheckCircle2, User as UserIcon, Shield } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { 
    isOnboardingOpen, 
    user, 
    completeUserOnboarding, 
    skipUserOnboarding 
  } = useAuth();

  const [nameInput, setNameInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOnboardingOpen) {
      // Pre-populate with Google account name as suggestion
      const defaultName = user.google_name || user.name || user.email?.split('@')[0] || '';
      setNameInput(defaultName);
      setValidationError(null);
    }
  }, [user, isOnboardingOpen]);

  if (!isOnboardingOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const { isValid, sanitized, error } = sanitizeDisplayName(nameInput);
    if (!isValid || !sanitized) {
      setValidationError(error || 'Please enter a valid display name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeUserOnboarding(sanitized);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save display name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await skipUserOnboarding();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative Top Accent Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Avatar Greeting */}
          <div className="text-center space-y-3">
            <div className="relative inline-block mx-auto">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.google_name || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg mx-auto ring-4 ring-blue-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-blue-700 to-sky-400 text-white flex items-center justify-center font-bold text-xl shadow-lg mx-auto ring-4 ring-blue-100">
                  {(user.google_name?.[0] || user.email?.[0] || 'Z').toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <h2 id="onboarding-title" className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center gap-2 font-display">
                <span>Welcome to Zailo Graph!</span>
                <Sparkles className="w-5 h-5 text-blue-600" />
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mx-auto">
                How would you like us to address you?
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="onboarding-display-name" 
                className="block text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Enter your display name</span>
              </label>

              <div className="relative">
                <input
                  id="onboarding-display-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Alex Chen"
                  maxLength={50}
                  autoFocus
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-neutral-900 outline-none transition ${
                    validationError 
                      ? 'border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 bg-red-50/30' 
                      : 'border-neutral-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 pointer-events-none">
                  {nameInput.length}/50
                </span>
              </div>

              {validationError && (
                <p className="text-xs text-red-600 font-medium animate-in fade-in duration-150 pt-0.5">
                  {validationError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !nameInput.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{isSubmitting ? 'Saving...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-neutral-500 hover:text-neutral-800 text-xs font-semibold transition cursor-pointer hover:bg-neutral-100/70"
              >
                Skip for now
              </button>
            </div>
          </form>

          {/* Footer Subtext */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
            <Shield className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>You can change your display name anytime in Settings.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

