export type FeedbackCategory = 'review' | 'bug' | 'feature' | 'question';

export type FeedbackStatus = 'resolved' | 'investigating' | 'planned' | 'verified' | 'none';

export interface SystemDiagnostics {
  browser: string;
  os: string;
  screenResolution: string;
  wasmSupported: boolean;
  simdSupported: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  activeToolId?: string;
}

export type OfficialRole = 'Founder' | 'Co-Founder & CTO' | 'Developer' | 'Community';

export interface FeedbackReply {
  id: string;
  authorName: string;
  authorRole: OfficialRole;
  isOfficial: boolean;
  avatar?: string;
  comment: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  category: FeedbackCategory;
  toolId: string; // e.g. 'batch-resize', 'svg-to-png', 'pdf-to-word', 'general'
  toolName: string;
  title: string;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  hasUserUpvoted?: boolean;
  status: FeedbackStatus;
  statusNote?: string;
  diagnostics?: SystemDiagnostics;
  replies: FeedbackReply[];
}

export interface FeedbackFilter {
  category: FeedbackCategory | 'all';
  toolId: string | 'all';
  minRating: number;
  search: string;
  sortBy: 'helpful' | 'newest' | 'rating' | 'replied';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'privacy' | 'conversion' | 'performance' | 'tools';
}

