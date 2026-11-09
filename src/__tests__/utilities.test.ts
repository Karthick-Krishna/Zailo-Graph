import { describe, it, expect } from 'vitest';
import { UTILITIES } from '../types/utility';

describe('UTILITIES catalog', () => {
  it('registers all 26 utilities with unique IDs', () => {
    expect(UTILITIES.length).toBe(26);

    const ids = UTILITIES.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(26);
    expect(ids).toContain('document-converter');
  });

  it('verifies all utilities have valid attributes', () => {
    for (const u of UTILITIES) {
      expect(u.id).toBeTruthy();
      expect(u.name).toBeTruthy();
      expect(u.description).toBeTruthy();
      expect(u.category).toBeTruthy();
      expect(Array.isArray(u.inputFormats)).toBe(true);
      expect(Array.isArray(u.outputFormats)).toBe(true);
      expect(typeof u.supportsBatch).toBe('boolean');
    }
  });

  it('correctly categorizes Pro utilities and Free utilities without AI suite', () => {
    const proUtilities = UTILITIES.filter(u => u.isCompetitorPaid);
    const freeUtilities = UTILITIES.filter(u => !u.isCompetitorPaid);

    expect(proUtilities.length).toBe(10);
    expect(freeUtilities.length).toBe(16);

    // Verify key Pro features
    const proIds = proUtilities.map(u => u.id);
    expect(proIds).toContain('workflow-recipes');
    expect(proIds).toContain('watermark');
    expect(proIds).toContain('collage-maker');
    expect(proIds).toContain('passport-photo');
    expect(proIds).toContain('exif-remover');
    expect(proIds).toContain('privacy-redact');
    expect(proIds).toContain('favicon-studio');
    expect(proIds).toContain('svg-to-png');
    expect(proIds).toContain('png-to-svg');
    expect(proIds).toContain('camera-raw');

    // Verify AI tools are completely removed
    const allIds = UTILITIES.map(u => u.id);
    expect(allIds).not.toContain('ai-upscale');
    expect(allIds).not.toContain('ai-bg-removal');
    expect(allIds).not.toContain('ai-colorization');
    expect(allIds).not.toContain('ai-inpainting');

    // Verify new browser utilities exist
    expect(allIds).toContain('rotate-flip');
    expect(allIds).toContain('meme-generator');
    expect(allIds).toContain('image-splitter');
  });
});

