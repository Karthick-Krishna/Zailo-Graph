import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast } = useAuth();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      dismissToast();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div 
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] pointer-events-auto max-w-md w-[calc(100%-2rem)] px-4 animate-in slide-in-from-top-4 fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div className={`p-3.5 sm:p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 backdrop-blur-md transition-all ${
        isError 
          ? 'bg-red-950/95 text-white border-red-800 shadow-red-950/20' 
          : isInfo
          ? 'bg-neutral-900/95 text-white border-neutral-700 shadow-neutral-950/20'
          : 'bg-neutral-900/95 text-white border-neutral-800 shadow-neutral-950/20'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : isInfo ? (
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium tracking-tight truncate">
            {toast.message}
          </span>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
