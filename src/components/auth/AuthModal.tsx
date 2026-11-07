import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, Check, X, ArrowRight, Zap, Mail, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (!authModal.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode === 'signin') {
      signInWithEmail(email);
    } else {
      signUpWithEmail(email);
    }
  };

  const getReasonTitle = () => {
    switch (authModal.reason) {
      case 'size_limit':
        return 'Unlock 50 MB High-Res Processing';
      case 'batch_limit':
        return 'Unlock 50-Image Batch Queues';
      case 'pro_feature':
        return 'Unlock Pro Creative Suite';
      case 'resolution_limit':
        return 'Unlock 8K Unconstrained Exports';
      default:
        return mode === 'signin' ? 'Sign In to Imazora' : 'Create Free Account';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                {getReasonTitle()}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                100% Free Forever • Zero Subscriptions • Zero Passwords
              </p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
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

        <div className="p-6 space-y-5">
          {/* Sign In vs Sign Up Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sign Up (Free)</span>
            </button>
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Free Account & Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </form>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50 MB Max File Size</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50 Batch Queue</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WebGPU AI Suite</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Camera RAW &amp; Vectorizer</span>
            </div>
          </div>
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>No credit card required. 100% Free Zorquelz Platform.</span>
        </div>
      </div>
    </div>
  );
};
