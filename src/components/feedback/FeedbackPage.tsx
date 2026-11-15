import React, { useState, useMemo, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Search, 
  ThumbsUp, 
  ShieldCheck, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Reply, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { 
  getCommunityFeedback, 
  toggleHelpfulUpvote, 
  addReplyToFeedback, 
  exportFeedbackToCSV, 
  getAllAvailableTools, 
  INITIAL_FAQS 
} from '../../services/feedbackService';
import { FeedbackItem, FeedbackCategory, FeedbackFilter } from '../../types/feedback';
import { FeedbackModal } from './FeedbackModal';

interface FeedbackPageProps {
  onBackToStudio: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  onBackToStudio,
  onSelectTool,
}) => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'faqs'>('reviews');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('Zailograph Team');
  const [replyRole, setReplyRole] = useState<'Developer' | 'Creator' | 'Community'>('Developer');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Filters
  const [filters, setFilters] = useState<FeedbackFilter>({
    category: 'all',
    toolId: 'all',
    minRating: 0,
    search: '',
    sortBy: 'helpful',
  });

  const availableTools = getAllAvailableTools();

  useEffect(() => {
    setItems(getCommunityFeedback());
  }, []);

  const refreshItems = () => {
    setItems(getCommunityFeedback());
  };

  const handleUpvote = (id: string) => {
    const updated = toggleHelpfulUpvote(id);
    setItems(updated);
  };

  const handlePostReply = (feedbackId: string) => {
    if (!replyText.trim()) return;
    const updated = addReplyToFeedback({
      feedbackId,
      authorName: replyAuthor.trim() || 'Zailograph Team',
      authorRole: replyRole,
      comment: replyText.trim(),
    });
    setItems(updated);
    setReplyText('');
    setReplyOpenId(null);
  };

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      // Tool filter
      if (filters.toolId !== 'all' && item.toolId.toLowerCase() !== filters.toolId.toLowerCase()) {
        return false;
      }
      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesComment = item.comment.toLowerCase().includes(q);
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        const matchesTool = item.toolName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesComment && !matchesAuthor && !matchesTool) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filters.sortBy === 'replied') {
        const aHasOfficial = a.replies?.some(r => r.isOfficial) ? 1 : 0;
        const bHasOfficial = b.replies?.some(r => r.isOfficial) ? 1 : 0;
        return bHasOfficial - aHasOfficial;
      }
      return 0;
    });
  }, [items, filters]);

  // Metric Computations
  const averageRating = useMemo(() => {
    if (items.length === 0) return '5.0';
    const sum = items.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

  const totalHelpful = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.helpfulCount, 0);
  }, [items]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-neutral-900 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToStudio}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
          <span>Back to Studio</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportFeedbackToCSV()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Download feedback and ratings as a clean CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Spreadsheet (CSV)</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a Review / Report</span>
          </button>
        </div>
      </div>

      {/* Hero Header & Scorecard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-900 text-white p-6 sm:p-8 border border-neutral-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Community Reviews &amp; Quality Control Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Zailograph Verification &amp; Reviews
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Open feedback, bug tracking, and developer responses across all 61 client-side conversion tools. All processing happens 100% inside your browser.
            </p>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
                <span className="text-2xl font-black text-white">{averageRating}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Average Score</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center px-2">
              <div className="text-2xl font-black text-white">{items.length}</div>
              <span className="text-[10px] text-neutral-400 font-medium">Community Logs</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center px-2">
              <div className="text-2xl font-black text-cyan-400">61</div>
              <span className="text-[10px] text-neutral-400 font-medium">Tools Monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Reviews vs FAQs */}
      <div className="flex items-center justify-between border-b border-neutral-200 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Reviews &amp; Threads</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {filteredItems.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'faqs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs &amp; Zero-Cloud Guide</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Zero cloud uploads guaranteed</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'reviews' ? (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* Search */}
              <div className="relative w-full sm:flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Search reviews, bugs, or specific tools..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tool Selector Dropdown */}
              <div className="w-full sm:w-64">
                <select
                  value={filters.toolId}
                  onChange={e => setFilters(f => ({ ...f, toolId: e.target.value }))}
                  aria-label="Filter reviews by tool"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All 61 Studio Tools</option>
                  {availableTools.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="w-full sm:w-44">
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
                  aria-label="Sort reviews"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="helpful">Sort: Most Helpful</option>
                  <option value="newest">Sort: Newest First</option>
                  <option value="rating">Sort: Highest Rating</option>
                  <option value="replied">Sort: Developer Replied</option>
                </select>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
              {[
                { id: 'all', label: 'All Entries' },
                { id: 'review', label: '⭐ Reviews' },
                { id: 'bug', label: '🐛 Bug Reports' },
                { id: 'feature', label: '💡 Feature Requests' },
                { id: 'question', label: '❓ Questions' },
              ].map(cat => {
                const isSelected = filters.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(f => ({ ...f, category: cat.id as any }))}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Cards Stream */}
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">No entries match your filter.</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try selecting a different tool or clearing your search term, or be the first to leave a review!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => {
                const hasReplies = item.replies && item.replies.length > 0;
                const isReplying = replyOpenId === item.id;

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs hover:shadow-md transition-shadow space-y-3.5"
                  >
                    {/* Top Meta: Author, Rating, Tool Badge, Time */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.authorAvatar ? (
                          <img
                            src={item.authorAvatar}
                            alt={item.authorName}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                            {item.authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{item.authorName}</span>
                            {item.status === 'verified' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Award className="w-3 h-3 text-emerald-600" />
                                Verified User
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Tool & Status Pill */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectTool?.(item.toolId)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          title="Open this tool in studio"
                        >
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>{item.toolName}</span>
                        </button>

                        {item.category === 'bug' && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            Bug Report
                          </span>
                        )}
                        {item.category === 'feature' && (
                          <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            Feature Request
                          </span>
                        )}
                        {item.status === 'resolved' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Resolved
                          </span>
                        )}
                        {item.status === 'planned' && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Planned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Star Rating + Title */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              item.rating >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                      {item.comment}
                    </p>

                    {/* Optional System Diagnostics Card */}
                    {item.diagnostics && (
                      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200 text-[10px] text-neutral-600 font-mono">
                        <span className="font-bold text-neutral-800 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-blue-600" />
                          Specs:
                        </span>
                        <span>{item.diagnostics.browser}</span>
                        <span>•</span>
                        <span>{item.diagnostics.os}</span>
                        <span>•</span>
                        <span>Res: {item.diagnostics.screenResolution}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Wasm SIMD: {item.diagnostics.simdSupported ? 'Active' : 'N/A'}
                        </span>
                      </div>
                    )}

                    {/* Interaction Footer: Helpful upvote + Reply button */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpvote(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            item.hasUserUpvoted
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${item.hasUserUpvoted ? 'fill-blue-600 text-blue-600' : ''}`} />
                          <span>Helpful</span>
                          <span className="font-mono text-[10px] bg-neutral-100 px-1 py-0.2 rounded">
                            {item.helpfulCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReplyOpenId(isReplying ? null : item.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-semibold transition cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Reply</span>
                          {hasReplies && (
                            <span className="font-mono text-[10px] bg-neutral-100 px-1 py-0.2 rounded">
                              {item.replies.length}
                            </span>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-neutral-400">
                        {item.statusNote || 'Community Verified'}
                      </span>
                    </div>

                    {/* Threaded Replies Section */}
                    {hasReplies && (
                      <div className="space-y-2 pt-2 border-t border-neutral-100/80">
                        {item.replies.map(reply => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                              reply.isOfficial
                                ? 'bg-gradient-to-r from-blue-50/70 via-white to-sky-50/50 border-blue-200/90 shadow-2xs'
                                : 'bg-neutral-50/80 border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900">{reply.authorName}</span>
                                {reply.isOfficial && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[9px] shadow-2xs">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {reply.authorRole}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-neutral-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-neutral-700 text-xs leading-relaxed">
                              {reply.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {isReplying && (
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={replyAuthor}
                              onChange={e => setReplyAuthor(e.target.value)}
                              placeholder="Your Name / Handle"
                              className="px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs w-40"
                            />
                            <select
                              value={replyRole}
                              onChange={e => setReplyRole(e.target.value as any)}
                              className="px-2 py-1 rounded-lg border border-neutral-300 bg-white text-xs cursor-pointer"
                            >
                              <option value="Developer">Role: Developer (Official)</option>
                              <option value="Creator">Role: Creator</option>
                              <option value="Community">Role: Community Member</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReplyOpenId(null)}
                            className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write a reply or address this feedback..."
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handlePostReply(item.id)}
                            disabled={!replyText.trim()}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer"
                          >
                            Post Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* FAQs Accordion View */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Frequently Asked Questions</h3>
              <p className="text-xs text-neutral-500">
                Understanding how Zailograph’s client-side engine guarantees privacy, vector fidelity, and high speed.
              </p>
            </div>

            <div className="space-y-3">
              {INITIAL_FAQS.map(faq => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-neutral-200 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100 flex items-center justify-between gap-3 text-left transition cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        {faq.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 bg-white text-xs text-neutral-700 leading-relaxed border-t border-neutral-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refreshItems();
        }}
        activeToolId={filters.toolId !== 'all' ? filters.toolId : 'general'}
      />
    </div>
  );
};
