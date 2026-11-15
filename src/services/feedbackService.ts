import { FeedbackItem, FeedbackCategory, SystemDiagnostics, FeedbackReply, FAQItem } from '../types/feedback';
import { UTILITIES } from '../types/utility';
import { CONVERSIONS } from './conversion/conversionRegistry';

const FEEDBACK_STORAGE_KEY = 'zailograph_community_feedback_v1';
const UPVOTES_STORAGE_KEY = 'zailograph_user_upvoted_feedback_ids';

export interface ToolOption {
  id: string;
  name: string;
  category: string;
}

/**
 * Returns all 61+ studio tools (Image Utilities + Document Converters) plus General Studio.
 */
export function getAllAvailableTools(): ToolOption[] {
  const tools: ToolOption[] = [
    { id: 'general', name: 'General Studio / Whole App', category: 'General' },
  ];

  // 1. Core Image Utilities
  UTILITIES.forEach(u => {
    tools.push({
      id: u.id,
      name: u.name,
      category: 'Image Tools',
    });
  });

  // 2. Document & File Converters
  CONVERSIONS.forEach(c => {
    if (!tools.some(t => t.id === c.id)) {
      tools.push({
        id: c.id,
        name: c.name,
        category: 'Document Converters',
      });
    }
  });

  // 3. Standalone Converters & Specialized Studio Utilities
  const standaloneTools: { id: string; name: string; category: string }[] = [
    { id: 'png-to-svg', name: 'PNG to SVG Vectorizer', category: 'Vector & Raster' },
    { id: 'format-converter', name: 'Universal Format Converter', category: 'Image Tools' },
    { id: 'video-metadata-editor', name: 'Video Metadata Editor', category: 'Metadata' },
    { id: 'photo-metadata-editor', name: 'Photo Metadata & EXIF Editor', category: 'Metadata' },
    { id: 'privacy-redact', name: 'Privacy & Face Redact', category: 'Image Tools' },
    { id: 'document-converter', name: 'Document & File Converter Studio', category: 'Document Converters' },
    { id: 'webp-to-raster', name: 'WebP to Raster (JPG/PNG)', category: 'Image Tools' },
    { id: 'raster-to-webp', name: 'Raster to WebP Converter', category: 'Image Tools' },
  ];

  standaloneTools.forEach(st => {
    if (!tools.some(t => t.id === st.id)) {
      tools.push(st);
    }
  });

  return tools;
}

/**
 * Get display name for a tool ID
 */
export function getToolNameById(toolId: string): string {
  const tools = getAllAvailableTools();
  const found = tools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
  return found ? found.name : toolId;
}

/**
 * Safely collect client-side non-PII technical diagnostics
 */
export function getSystemDiagnostics(activeToolId?: string): SystemDiagnostics {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) browser = `Firefox ${ua.split('Firefox/')[1]?.split(' ')[0] || ''}`.trim();
    else if (ua.includes('Edg/')) browser = `Edge ${ua.split('Edg/')[1]?.split(' ')[0] || ''}`.trim();
    else if (ua.includes('Chrome/')) browser = `Chrome ${ua.split('Chrome/')[1]?.split(' ')[0] || ''}`.trim();
    else if (ua.includes('Safari/')) browser = 'Safari';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  }

  const wasmSupported = typeof WebAssembly !== 'undefined';
  const simdSupported = typeof WebAssembly !== 'undefined' && typeof WebAssembly.validate === 'function' &&
    WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 26, 11]));

  return {
    browser,
    os,
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A',
    wasmSupported,
    simdSupported,
    hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    deviceMemory: typeof (navigator as any)?.deviceMemory === 'number' ? (navigator as any).deviceMemory : undefined,
    activeToolId,
  };
}

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'privacy',
    question: 'Are my images or documents ever uploaded to any cloud server?',
    answer: 'Never. Zailograph is built with a strict Zero-Cloud architecture. All image compression, document conversions, and format changes happen entirely in your browser using WebAssembly (Wasm) and HTML5 Web Workers. Your files never touch our servers.',
  },
  {
    id: 'faq-2',
    category: 'conversion',
    question: 'Why does PDF to Word produce genuine editable text while other sites fail?',
    answer: 'Many free tools simply rasterize PDF pages as static background pictures inside a Word file. Zailograph parses vector text coordinates, font metrics, table borders, and document tree flow directly to compile a true OpenXML (.docx) file that you can freely edit in Microsoft Word, Google Docs, or LibreOffice.',
  },
  {
    id: 'faq-3',
    category: 'performance',
    question: 'Is there a limit on how many files I can convert in a batch?',
    answer: 'Because processing happens on your local device hardware, batch size depends on your machine’s RAM and CPU cores. Modern laptops and desktops can easily batch convert dozens of images simultaneously with our parallel multi-threaded workers.',
  },
  {
    id: 'faq-4',
    category: 'tools',
    question: 'How do I submit a bug report for a specific converter?',
    answer: 'Use the floating "Feedback & Reviews" button at the bottom-right of any tool page, or navigate to our Community Hub. You can select the specific tool and attach non-PII browser diagnostics with 1-click so our engineering team can isolate the issue immediately.',
  },
];

/**
 * Load all community feedback items. Starts 100% clean with zero mock/placeholder data.
 */
export function getCommunityFeedback(): FeedbackItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge any legacy placeholder seed items if stored previously
    const cleanItems = parsed.filter((item: any) => item && typeof item.id === 'string' && !item.id.startsWith('seed-'));
    if (cleanItems.length !== parsed.length) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(cleanItems));
    }

    const upvotedIds = getUpvotedFeedbackIds();
    return cleanItems.map((item: FeedbackItem) => ({
      ...item,
      hasUserUpvoted: upvotedIds.includes(item.id),
    }));
  } catch (e) {
    console.warn('Failed to parse feedback from localStorage', e);
    return [];
  }
}

/**
 * Get list of IDs upvoted by the current local client
 */
export function getUpvotedFeedbackIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UPVOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Submit a new feedback or review
 */
export function submitFeedback(params: {
  authorName: string;
  authorEmail?: string;
  rating: number;
  category: FeedbackCategory;
  toolId: string;
  title: string;
  comment: string;
  includeDiagnostics: boolean;
}): FeedbackItem {
  const allFeedback = getCommunityFeedback();
  const toolName = getToolNameById(params.toolId);

  const newItem: FeedbackItem = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    authorName: params.authorName.trim() || 'Anonymous Creator',
    authorEmail: params.authorEmail?.trim() || undefined,
    rating: Math.max(1, Math.min(5, params.rating)),
    category: params.category,
    toolId: params.toolId,
    toolName,
    title: params.title.trim() || `${toolName} ${params.category === 'bug' ? 'Issue' : 'Feedback'}`,
    comment: params.comment.trim(),
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    status: params.category === 'bug' ? 'investigating' : 'none',
    statusNote: params.category === 'bug' ? 'Under Review by Team' : undefined,
    diagnostics: params.includeDiagnostics ? getSystemDiagnostics(params.toolId) : undefined,
    replies: [],
  };

  const updated = [newItem, ...allFeedback];
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save feedback to localStorage', e);
  }

  return newItem;
}

/**
 * Toggle helpful upvote
 */
export function toggleHelpfulUpvote(feedbackId: string): FeedbackItem[] {
  const allFeedback = getCommunityFeedback();
  const upvotedIds = getUpvotedFeedbackIds();
  const alreadyUpvoted = upvotedIds.includes(feedbackId);

  const newUpvoted = alreadyUpvoted
    ? upvotedIds.filter(id => id !== feedbackId)
    : [...upvotedIds, feedbackId];

  localStorage.setItem(UPVOTES_STORAGE_KEY, JSON.stringify(newUpvoted));

  const updated = allFeedback.map(item => {
    if (item.id === feedbackId) {
      return {
        ...item,
        helpfulCount: Math.max(0, item.helpfulCount + (alreadyUpvoted ? -1 : 1)),
        hasUserUpvoted: !alreadyUpvoted,
      };
    }
    return item;
  });

  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Post a reply (community or developer)
 */
export function addReplyToFeedback(params: {
  feedbackId: string;
  authorName?: string;
  authorRole: 'Founder' | 'Co-Founder & CTO' | 'Developer' | 'Community';
  comment: string;
}): FeedbackItem[] {
  const allFeedback = getCommunityFeedback();

  let resolvedName = params.authorName?.trim();
  const isFounder = params.authorRole === 'Founder';
  const isCto = params.authorRole === 'Co-Founder & CTO';
  const isOfficial = isFounder || isCto || params.authorRole === 'Developer';

  if (!resolvedName) {
    if (isFounder) resolvedName = 'Karthick Krishna';
    else if (isCto) resolvedName = 'Co-Founder & CTO';
    else resolvedName = 'Community Member';
  }

  const newReply: FeedbackReply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    authorName: resolvedName,
    authorRole: params.authorRole,
    isOfficial,
    comment: params.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = allFeedback.map(item => {
    if (item.id === params.feedbackId) {
      return {
        ...item,
        status: item.category === 'bug' ? ('resolved' as const) : item.status,
        replies: [...(item.replies || []), newReply],
      };
    }
    return item;
  });

  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Export feedback to Spreadsheet-ready CSV format
 */
export function exportFeedbackToCSV(): void {
  const items = getCommunityFeedback();
  const headers = ['ID', 'Date', 'Author', 'Rating', 'Category', 'Tool', 'Title', 'Comment', 'Status', 'Helpful Count', 'Official Replies Count', 'Browser', 'OS', 'Wasm SIMD'];

  const rows = items.map(item => [
    `"${item.id}"`,
    `"${item.createdAt}"`,
    `"${item.authorName.replace(/"/g, '""')}"`,
    item.rating,
    `"${item.category}"`,
    `"${item.toolName.replace(/"/g, '""')}"`,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.comment.replace(/"/g, '""')}"`,
    `"${item.status}"`,
    item.helpfulCount,
    item.replies?.filter(r => r.isOfficial).length || 0,
    `"${item.diagnostics?.browser || 'N/A'}"`,
    `"${item.diagnostics?.os || 'N/A'}"`,
    `"${item.diagnostics?.simdSupported ? 'Yes' : 'No'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zailograph_feedback_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
