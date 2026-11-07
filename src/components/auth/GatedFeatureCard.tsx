import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UtilityDefinition } from '../../types/utility';
import { Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GatedFeatureCardProps {
  utility: UtilityDefinition;
}

export const GatedFeatureCard: React.FC<GatedFeatureCardProps> = ({ utility }) => {
  const { openAuthModal } = useAuth();

  return (
    <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-neutral-200/80 shadow-xl shadow-neutral-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Competitor-Paid Feature • 100% Free on Imazora</span>
      </div>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">
        {utility.name}
      </h2>
      <p className="text-sm text-neutral-500 max-w-lg mb-8 leading-relaxed">
        {utility.description}
      </p>

      {/* Visual Showcase Box */}
      <div className="w-full p-6 rounded-2xl bg-neutral-50 border border-neutral-200/60 mb-8 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          What makes this free on Imazora?
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">Local WebGPU & WASM Powered:</strong> Runs directly inside your hardware graphics engine with zero subscription fees.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">High-Resolution Outputs:</strong> Unlocked up to 8K resolution without watermarks or downsampling.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700">
              <strong className="text-neutral-900">Zero Cloud Subscriptions:</strong> Free accounts are required only to prevent bot abuse of compute resources.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => openAuthModal('pro_feature', utility.id)}
        className="w-full max-w-md py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition shadow-md shadow-neutral-900/10 flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>Unlock {utility.name} for Free</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </button>

      <p className="text-xs text-neutral-400 mt-4 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-neutral-400" />
        <span>No credit card required • Instant 5-second activation</span>
      </p>
    </div>
  );
};
