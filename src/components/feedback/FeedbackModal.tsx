import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Check
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

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'review', label: 'Review & Rating', icon: Star },
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'question', label: 'Help & Questions', icon: HelpCircle },
];

const RATING_LABELS: Record<number, string> = {
  5: '5.0 · Outstanding',
  4: '4.0 · Very Good',
  3: '3.0 · Satisfactory',
  2: '2.0 · Needs Improvement',
  1: '1.0 · Major Issues',
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

  const availableTools = getAllAvailableTools();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync active tool and diagnostics when modal opens
  useEffect(() => {
    if (isOpen) {
      setToolId(activeToolId || 'general');
      setDiagnostics(getSystemDiagnostics(activeToolId));
      setIsSuccess(false);
      setTimeout(() => titleInputRef.current?.focus(), 80);
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
      submitFeedback({
        authorName: authorName.trim() || 'Community User',
        authorEmail: authorEmail.trim() || undefined,
        rating,
        category,
        toolId,
        title: title.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)}: ${toolId}`,
        comment: comment.trim(),
        includeDiagnostics,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setTitle('');
        setComment('');
      }, 1600);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden my-auto text-neutral-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Corporate Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50/60">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ZailoGraphLogo size="sm" showText={false} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Feedback &amp; Quality Review
              </h3>
              <p className="text-xs text-neutral-500 font-normal mt-0.5 truncate">
                Help us improve Zailograph across all 61 studio tools
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
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[82vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900">
                  Thank You for Your Feedback
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Your feedback has been logged to our community review board and shared with the engineering team.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Segmented Tabs */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Feedback Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200/70">
                  {CATEGORIES.map(tab => {
                    const Icon = tab.icon;
                    const isSelected = category === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setCategory(tab.id)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Component */}
              <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Your Rating
                  </span>
                  <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
                    {RATING_LABELS[rating]}
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
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Tool Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Related Tool
                </label>
                <select
                  value={toolId}
                  onChange={e => setToolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                >
                  {availableTools.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Comment */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Subject / Title
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short summary (e.g. Fast conversion or Formatting issue)"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Feedback Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={
                      category === 'bug'
                        ? 'Describe what happened, what file type you were using, and what you expected to see...'
                        : 'Share your observations, speed feedback, or ideas for improvements...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Contributor Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email (Optional, for replies)
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={e => setAuthorEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Clean Corporate Diagnostics Panel (NO black terminal box) */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeDiagnostics}
                    onChange={e => setIncludeDiagnostics(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs text-neutral-700">
                    <span className="font-semibold text-neutral-900 block">
                      Include non-personal system diagnostics
                    </span>
                    <span className="text-neutral-500 text-[11px] block mt-0.5">
                      Attaches: {diagnostics?.browser || 'Browser'} · {diagnostics?.os || 'OS'} · SIMD ({diagnostics?.simdSupported ? 'Supported' : 'Standard'}) · {diagnostics?.screenResolution}
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>100% private. No images, files, or personal documents are ever transmitted.</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-100">
                {onOpenCommunityPage ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCommunityPage();
                    }}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>View Public Reviews</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
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
