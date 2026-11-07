import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, Check, X, ArrowRight, Zap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, loginWithDemo, loginWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await loginWithMagicLink(email);
    setIsSubmitting(false);
  };

  const getReasonTitle = () => {
    switch (authModal.reason) {
      case 'size_limit':
        return 'Unlock 50 MB File Processing';
      case 'batch_limit':
        return 'Unlock 50-Image Batch Queues';
      case 'pro_feature':
        return 'Unlock Free Pro Tools';
      case 'resolution_limit':
        return 'Unlock 8K Full-Resolution Exports';
      default:
        return 'Create Your Free Imazora Account';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                {getReasonTitle()}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                100% Free Forever • Zero Subscriptions • Zero Credit Cards
              </p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom trigger alert banner if triggered by a limit */}
        {authModal.customMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{authModal.customMessage}</span>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-600 leading-relaxed">
            Other tools charge monthly subscriptions for AI background removal, 4x upscaling, vectorization, and RAW demosaicing. On <strong>Imazora</strong>, everything is 100% free with an account.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-neutral-800">50 MB Image Size (vs 10MB)</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-neutral-800">50-Image Batch Queues</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-neutral-800">AI Background Removal & 4x</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-neutral-800">Camera RAW Studio & Vector</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isSubmitting ? 'Sending Magic Link...' : 'Continue with Email'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-400 font-semibold tracking-wider">
                Or Instant Access
              </span>
            </div>
          </div>

          {/* Instant 1-Click Demo Login */}
          <button
            onClick={() => loginWithDemo('creator@zorquelz.com')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>1-Click Instant Demo Login (Zero Friction)</span>
          </button>
        </div>

        {/* Footer Privacy Guarantee */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Zero spam. Zero tracking. Images are never linked to your account.</span>
        </div>
      </div>
    </div>
  );
};
