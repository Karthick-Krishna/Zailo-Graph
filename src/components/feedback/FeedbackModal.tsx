import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Cpu, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { 
  getAllAvailableTools, 
  getSystemDiagnostics, 
  submitFeedback 
} from '../../services/feedbackService';
import { FeedbackCategory, SystemDiagnostics } from '../../types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId?: string;
  onOpenCommunityPage?: () => void;
}

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

  // Reset or update active tool when modal opens
  useEffect(() => {
    if (isOpen) {
      setToolId(activeToolId || 'general');
      setDiagnostics(getSystemDiagnostics(activeToolId));
      setIsSuccess(false);
    }
  }, [isOpen, activeToolId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      submitFeedback({
        authorName: authorName.trim() || 'Anonymous User',
        authorEmail: authorEmail.trim() || undefined,
        rating,
        category,
        toolId,
        title: title.trim() || `${category.toUpperCase()}: ${toolId}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-sky-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                Zailograph Feedback &amp; Review
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  QC Active
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Help us verify all 61 studio tools. 100% private, client-side only.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Thank You! Your feedback was saved.</h3>
              <p className="text-neutral-500 max-w-sm text-xs">
                Your review has been added to the Community Discussion board and logged for quality control.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Pills */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5">Feedback Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'review', label: 'Review / Rating', icon: Star, color: 'text-amber-500' },
                    { id: 'bug', label: 'Bug / Glitch', icon: Bug, color: 'text-rose-500' },
                    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-indigo-500' },
                    { id: 'question', label: 'Question / Help', icon: HelpCircle, color: 'text-emerald-500' },
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id as FeedbackCategory)}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating (Show prominently on reviews) */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-800 block">Experience Rating</span>
                  <span className="text-[11px] text-neutral-500">
                    {rating === 5 ? 'Exceptional ⚡' : rating === 4 ? 'Great 👍' : rating === 3 ? 'Average' : 'Needs Polish ⚠️'}
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
                        className={`w-5 h-5 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Target Selector */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Associated Tool (61 available)
                </label>
                <select
                  value={toolId}
                  onChange={e => setToolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer"
                >
                  {availableTools.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Comment */}
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Title / Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Crisp vector conversion or Issue with 50MB PDF"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Details &amp; Observations <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={
                      category === 'bug'
                        ? 'Describe what happened, file type used, and the expected output...'
                        : 'Share your thoughts, speed feedback, or ideas for improvement...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
                    required
                  />
                </div>
              </div>

              {/* Author & Optional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Your Name / Handle</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. Alex or CreativePro"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email (Optional, for replies)</label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={e => setAuthorEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Smart Technical Diagnostics Checkbox */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-1.5">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeDiagnostics}
                    onChange={e => setIncludeDiagnostics(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-[11px] text-neutral-700">
                    <span className="font-bold flex items-center gap-1.5 text-blue-950">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      Include non-PII system diagnostics for bug isolation
                    </span>
                    <span className="text-neutral-500 block mt-0.5">
                      Attaches: {diagnostics?.browser || 'Browser'} • {diagnostics?.os || 'OS'} • Wasm SIMD ({diagnostics?.simdSupported ? 'Supported' : 'No'}) • {diagnostics?.screenResolution}
                    </span>
                  </div>
                </label>
                <div className="flex items-center gap-1 text-[10px] text-blue-800 font-medium pl-5">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Zero files or image contents are ever shared or transmitted.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {onOpenCommunityPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCommunityPage();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px] transition cursor-pointer"
                  >
                    <span>View Community Hub</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Post Feedback'}</span>
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

