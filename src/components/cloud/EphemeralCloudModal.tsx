import React, { useState } from 'react';
import { Cloud, ShieldCheck, Lock, X, ArrowRight, Server, Zap, CheckCircle2 } from 'lucide-react';

interface EphemeralCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmConsent: () => void;
  targetTaskName: string;
}

export const EphemeralCloudModal: React.FC<EphemeralCloudModalProps> = ({
  isOpen,
  onClose,
  onConfirmConsent,
  targetTaskName,
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                Ephemeral Cloud Accelerator
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Volatile GPU Compute for {targetTaskName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Your hardware does not have an active WebGPU backend, or this task requires heavy neural execution. You can opt to dispatch this single job through the <strong>Zorquelz Zero-Retention Cloud Engine</strong>.
          </p>

          {/* Privacy & Security Guarantees */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Zero-Knowledge Privacy Charter
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700">
                  <strong>Volatile Memory Only:</strong> The image is streamed directly into GPU VRAM. The filesystem is mounted read-only; zero temporary files are written to disk.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700">
                  <strong>Zero Retention:</strong> Once the processed result streams back to your browser, memory is scrubbed immediately. No copies or logs are retained.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700">
                  <strong>End-to-End TLS 1.3:</strong> Encrypted transit over Cloudflare Edge with ephemeral token authentication.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-neutral-700">
              I understand and consent to ephemeral memory streaming for this task.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition cursor-pointer"
            >
              Stay on Local CPU
            </button>

            <button
              type="button"
              disabled={!agreed}
              onClick={() => {
                onConfirmConsent();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white font-bold text-xs transition shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Launch Acceleration</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zorquelz Zero-Knowledge Verified • No Accounts or Credit Cards</span>
        </div>
      </div>
    </div>
  );
};
