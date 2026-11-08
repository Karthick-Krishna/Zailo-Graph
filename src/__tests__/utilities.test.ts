import { describe, it, expect } from 'vitest';
import { UTILITIES } from '../types/utility';

describe('UTILITIES catalog', () => {
  it('registers all 26 utilities with unique IDs', () => {
    expect(UTILITIES.length).toBe(26);

    const ids = UTILITIES.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(26);
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

  it('correctly categorizes Pro utilities and Free utilities', () => {
    const proUtilities = UTILITIES.filter(u => u.isCompetitorPaid);
    const freeUtilities = UTILITIES.filter(u => !u.isCompetitorPaid);

    expect(proUtilities.length).toBe(14);
    expect(freeUtilities.length).toBe(12);

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
    expect(proIds).toContain('ai-upscale');
    expect(proIds).toContain('ai-bg-removal');
    expect(proIds).toContain('ai-colorization');
    expect(proIds).toContain('ai-inpainting');
    expect(proIds).toContain('camera-raw');
  });
});

