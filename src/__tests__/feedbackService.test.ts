import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getAllAvailableTools, 
  getSystemDiagnostics, 
  getCommunityFeedback, 
  submitFeedback, 
  toggleHelpfulUpvote, 
  addReplyToFeedback, 
  getToolNameById 
} from '../services/feedbackService';

describe('Feedback & Quality Control Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('aggregates all studio tools (>60 tools)', () => {
    const tools = getAllAvailableTools();
    expect(tools.length).toBeGreaterThanOrEqual(60);
    expect(tools.some(t => t.id === 'svg-to-png')).toBe(true);
    expect(tools.some(t => t.id === 'batch-resize')).toBe(true);
    expect(tools.some(t => t.id === 'word-to-pdf')).toBe(true);
  });

  it('resolves tool names by ID accurately', () => {
    expect(getToolNameById('svg-to-png')).toContain('SVG');
    expect(getToolNameById('batch-resize')).toContain('Resolution');
    expect(getToolNameById('general')).toContain('General');
  });

  it('gathers non-PII system diagnostics safely', () => {
    const diag = getSystemDiagnostics('svg-to-png');
    expect(diag).toBeDefined();
    expect(diag.browser).toBeDefined();
    expect(diag.os).toBeDefined();
    expect(diag.activeToolId).toBe('svg-to-png');
    expect(typeof diag.hardwareConcurrency).toBe('number');
  });

  it('starts with 0 placeholder/fake reviews when storage is clean', () => {
    const items = getCommunityFeedback();
    expect(items.length).toBe(0);
  });

  it('submits a new feedback item and retrieves it', () => {
    const newItem = submitFeedback({
      authorName: 'Test Architect',
      rating: 5,
      category: 'review',
      toolId: 'svg-to-png',
      title: 'Flawless output',
      comment: 'Best client side converter tested.',
      includeDiagnostics: true,
    });

    expect(newItem.id).toBeDefined();
    expect(newItem.authorName).toBe('Test Architect');
    expect(newItem.diagnostics).toBeDefined();

    const all = getCommunityFeedback();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(newItem.id);
  });

  it('toggles upvotes correctly on real submitted feedback', () => {
    const item = submitFeedback({
      authorName: 'Tester',
      rating: 4,
      category: 'review',
      toolId: 'compression',
      title: 'Great compression',
      comment: 'Reduced file size significantly.',
      includeDiagnostics: false,
    });

    // Upvote
    const afterUpvote = toggleHelpfulUpvote(item.id);
    const targetAfter = afterUpvote.find(i => i.id === item.id);
    expect(targetAfter?.helpfulCount).toBe(1);
    expect(targetAfter?.hasUserUpvoted).toBe(true);

    // Toggle off
    const afterUndo = toggleHelpfulUpvote(item.id);
    const targetUndo = afterUndo.find(i => i.id === item.id);
    expect(targetUndo?.helpfulCount).toBe(0);
    expect(targetUndo?.hasUserUpvoted).toBe(false);
  });

  it('adds Founder and Co-Founder & CTO official reply badges', () => {
    const item = submitFeedback({
      authorName: 'Tester',
      rating: 5,
      category: 'bug',
      toolId: 'pdf-to-word',
      title: 'Formatting question',
      comment: 'Check table borders',
      includeDiagnostics: false,
    });

    // Founder reply
    const founderReplyUpdate = addReplyToFeedback({
      feedbackId: item.id,
      authorRole: 'Founder',
      comment: 'We verified and addressed this table border case.',
    });

    const targetFounder = founderReplyUpdate.find(i => i.id === item.id);
    const founderReply = targetFounder?.replies.find(r => r.authorRole === 'Founder');
    expect(founderReply).toBeDefined();
    expect(founderReply?.authorName).toBe('Karthick Krishna');
    expect(founderReply?.isOfficial).toBe(true);

    // Co-Founder & CTO reply
    const ctoReplyUpdate = addReplyToFeedback({
      feedbackId: item.id,
      authorRole: 'Co-Founder & CTO',
      comment: 'Wasm multi-threading engine has been verified and deployed.',
    });

    const targetCto = ctoReplyUpdate.find(i => i.id === item.id);
    const ctoReply = targetCto?.replies.find(r => r.authorRole === 'Co-Founder & CTO');
    expect(ctoReply).toBeDefined();
    expect(ctoReply?.authorName).toBe('Co-Founder & CTO');
    expect(ctoReply?.isOfficial).toBe(true);
  });
});
