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

  it('loads seed community feedback when storage is clean', () => {
    const items = getCommunityFeedback();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some(i => i.replies.some(r => r.isOfficial))).toBe(true);
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
    expect(all[0].id).toBe(newItem.id);
  });

  it('toggles upvotes correctly', () => {
    const items = getCommunityFeedback();
    const firstId = items[0].id;
    const initialCount = items[0].helpfulCount;

    // Upvote
    const afterUpvote = toggleHelpfulUpvote(firstId);
    const targetAfter = afterUpvote.find(i => i.id === firstId);
    expect(targetAfter?.helpfulCount).toBe(initialCount + 1);
    expect(targetAfter?.hasUserUpvoted).toBe(true);

    // Toggle off
    const afterUndo = toggleHelpfulUpvote(firstId);
    const targetUndo = afterUndo.find(i => i.id === firstId);
    expect(targetUndo?.helpfulCount).toBe(initialCount);
    expect(targetUndo?.hasUserUpvoted).toBe(false);
  });

  it('adds an official developer reply to a thread', () => {
    const items = getCommunityFeedback();
    const targetId = items[0].id;

    const updated = addReplyToFeedback({
      feedbackId: targetId,
      authorName: 'Karthick Krishna',
      authorRole: 'Creator',
      comment: 'Thanks for bringing this to our attention. Fixed in current build.',
    });

    const target = updated.find(i => i.id === targetId);
    expect(target?.replies.some(r => r.comment.includes('Fixed in current build'))).toBe(true);
    expect(target?.replies.some(r => r.isOfficial)).toBe(true);
  });
});
