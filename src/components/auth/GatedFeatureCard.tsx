import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UtilityDefinition } from '../../types/utility';
import { Sparkles, Shield, Lock, CheckCircle2 } from 'lucide-react';

interface GatedFeatureCardProps {
  utility: UtilityDefinition;
}

export const GatedFeatureCard: React.FC<GatedFeatureCardProps> = ({ utility }) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="w-full max-w-xl mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-100/80 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-5 shadow-2xs">
        <Lock className="w-3.5 h-3.5 text-amber-600" />
        <span>Pro Feature • Sign in with Google to Unlock</span>
      </div>

      {/* Title & Description */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
        {utility.name}
      </h2>
      <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
        {utility.description}
      </p>

      {/* Visual Showcase Box */}
      <div className="w-full p-5 rounded-2xl bg-neutral-50 border border-neutral-200/70 mb-6 text-left">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Unlocked with your Free ZailoGraph Account:
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">All 14 Pro Studio Tools:</strong> AI Super-Res, BG Removal, 1-Click Recipes, Watermarking, RAW Studio, Biometric Passports, and more.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">Unconstrained 100 MB Limit:</strong> Process massive high-resolution photo batches with 50-image queues.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">100% Privacy-First:</strong> All image pixels remain on your device in browser memory.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button with Google Branding */}
      <button
        onClick={() => openAuthModal('pro_feature', utility.id)}
        className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-bold text-sm transition-all border border-neutral-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer group"
      >
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
        <span>Sign in with Google to Continue</span>
      </button>

      <p className="text-xs text-neutral-400 mt-3.5 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-neutral-400" />
        <span>Free Forever • Zero Subscriptions • Zero Passwords</span>
      </p>
    </div>
  );
};

