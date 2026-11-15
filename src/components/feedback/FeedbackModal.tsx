import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Monitor,
  Terminal,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  getAllAvailableTools, 
  getSystemDiagnostics, 
  submitFeedback 
} from '../../services/feedbackService';
import { FeedbackCategory, SystemDiagnostics } from '../../types/feedback';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId?: string;
  onOpenCommunityPage?: () => void;
}

const CATEGORY_TABS: { id: FeedbackCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'review', label: 'Review & Rating', icon: Star },
  { id: 'bug', label: 'Defect Report', icon: FileCode },
  { id: 'feature', label: 'Feature Proposal', icon: Sparkles },
  { id: 'question', label: 'Technical Inquiry', icon: Layers },
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: '5.0 / 5.0 — Precision Benchmark (Production Ready)',
  4: '4.0 / 5.0 — Stable Performance (Minor Edge Cases)',
  3: '3.0 / 5.0 — Functional (Latency / Formatting Variance)',
  2: '2.0 / 5.0 — Degraded Output Quality',
  1: '1.0 / 5.0 — Critical Fault / Non-Functional',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  activeToolId = 'general',
  onOpenCommunityPage,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('review');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [toolId, setToolId] = useState<string>(activeToolId);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const availableTools = getAllAvailableTools();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync active tool and diagnostics when modal opens
  useEffect(() => {
    if (isOpen) {
      setToolId(activeToolId || 'general');
      setDiagnostics(getSystemDiagnostics(activeToolId));
      setIsSuccess(false);
      setSubmittedRef(null);
      // Auto focus title input
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, activeToolId]);

  // Global key bindings: Escape to close, Ctrl/Cmd + Enter to submit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (comment.trim() && !isSubmitting) {
          triggerSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, comment, isSubmitting, title, rating, category, toolId, authorName, authorEmail, includeDiagnostics]);

  if (!isOpen) return null;

  const triggerSubmit = () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedRef = `REF-ZG-${Math.floor(1000 + Math.random() * 9000)}`;
      submitFeedback({
        authorName: authorName.trim() || 'Verified Contributor',
        authorEmail: authorEmail.trim() || undefined,
        rating,
        category,
        toolId,
        title: title.trim() || `${category.toUpperCase()} Benchmark: ${toolId}`,
        comment: comment.trim(),
        includeDiagnostics,
      });

      setSubmittedRef(generatedRef);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setTitle('');
        setComment('');
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback telemetry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmit();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden my-auto text-neutral-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Corporate Header */}
        <div className="p-4 sm:p-5 pb-3.5 border-b border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50/80">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ZailoGraphLogo size="sm" showText={false} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                  Quality Assurance &amp; Review Console
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-900 text-white tracking-wide">
                  QC PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5 truncate">
                Direct telemetry and verification across all 61 WebAssembly engines
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 p-2 text-neutral-400 hover:text-neutral-800 active:text-neutral-950 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close review dialog"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-cyan-400 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900 tracking-tight">
                  Telemetry Successfully Logged
                </h4>
                <p className="font-mono text-xs text-neutral-500">
                  Transaction Signature: <span className="text-neutral-900 font-semibold">{submittedRef || 'REF-ZG-OK'}</span>
                </p>
              </div>
              <p className="text-xs text-neutral-600 max-w-sm leading-relaxed">
                Your report has been committed to the public Quality Registry and routed to core maintainers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {/* Segmented Category Rail */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Submission Classification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/70">
                  {CATEGORY_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isSelected = category === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setCategory(tab.id)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/60'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/40'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality & Performance Metric (Numerical Scale) */}
              <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Execution Precision Score
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500 block mt-0.5">
                    {RATING_DESCRIPTIONS[rating]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      title={`${star} Star Rating`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-neutral-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-1.5 font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-neutral-200/80 text-neutral-800">
                    {rating}.0
                  </span>
                </div>
              </div>

              {/* Engine Scope Selector (All 61 tools) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Target Engine Scope
                  </label>
                  <span className="font-mono text-[10px] text-neutral-400">
                    61 Active Engines
                  </span>
                </div>
                <select
                  value={toolId}
                  onChange={e => setToolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs cursor-pointer transition font-mono"
                >
                  {availableTools.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category.toUpperCase()}] {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Headline & Technical Observations */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Report Summary
                    </label>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Sub-pixel interpolation benchmark or Table alignment anomaly"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs transition"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Technical Observations &amp; Reproduction <span className="text-rose-500">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {comment.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={
                      category === 'bug'
                        ? 'Detail the source file specifications, observed formatting/execution error, and expected RFC/OpenXML standard output...'
                        : 'Detail engine throughput, visual precision, conversion fidelity, or architectural recommendations...'
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs leading-relaxed resize-none transition"
                    required
                  />
                </div>
              </div>

              {/* Reporter Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Contributor Identifier
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Name or Organization"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Work Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={e => setAuthorEmail(e.target.value)}
                    placeholder="corporate@domain.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs transition"
                  />
                </div>
              </div>

              {/* Hardware & Environment Telemetry Drawer */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 text-neutral-300 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-neutral-100 uppercase tracking-wider">
                      Client Sandbox Diagnostics
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] select-none text-neutral-400 hover:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={includeDiagnostics}
                      onChange={e => setIncludeDiagnostics(e.target.checked)}
                      className="rounded bg-neutral-800 border-neutral-700 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Attach Telemetry</span>
                  </label>
                </div>

                {includeDiagnostics && diagnostics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px] pt-1 border-t border-neutral-800/80 text-neutral-400">
                    <div className="p-1.5 rounded-lg bg-neutral-800/70 border border-neutral-700/60 truncate">
                      <span className="text-neutral-500 block">BROWSER</span>
                      <span className="text-neutral-200 truncate block">{diagnostics.browser}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-neutral-800/70 border border-neutral-700/60 truncate">
                      <span className="text-neutral-500 block">OS</span>
                      <span className="text-neutral-200 truncate block">{diagnostics.os}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-neutral-800/70 border border-neutral-700/60 truncate">
                      <span className="text-neutral-500 block">WASM SIMD</span>
                      <span className={diagnostics.simdSupported ? 'text-emerald-400' : 'text-neutral-400'}>
                        {diagnostics.simdSupported ? 'Active' : 'Fallback'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-neutral-800/70 border border-neutral-700/60 truncate">
                      <span className="text-neutral-500 block">VIEWPORT</span>
                      <span className="text-neutral-200 truncate block">{diagnostics.screenResolution}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-sans">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Zero-knowledge client isolation. No document binaries or image buffers are transmitted.</span>
                </div>
              </div>

              {/* Action Bar & Ergonomics */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  {onOpenCommunityPage ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCommunityPage();
                      }}
                      className="text-neutral-700 hover:text-neutral-950 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Public Registry</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="hidden sm:inline font-mono text-[10px]">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[9px]">⌘+Enter</kbd> to submit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Transmitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
