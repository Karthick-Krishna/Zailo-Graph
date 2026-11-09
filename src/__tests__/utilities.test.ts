import { describe, it, expect } from 'vitest';
import { UTILITIES } from '../types/utility';

describe('UTILITIES catalog', () => {
  it('registers all 20 utilities with unique IDs', () => {
    expect(UTILITIES.length).toBe(20);

    const ids = UTILITIES.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);
    expect(ids).toContain('document-converter');
    expect(ids).toContain('format-converter');
    expect(ids).toContain('photo-metadata-editor');
    expect(ids).toContain('video-metadata-editor');
    expect(ids).toContain('batch-resize');
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
    expect(freeUtilities.length).toBe(10);

    // Verify key Pro features
    const proIds = proUtilities.map(u => u.id);
    expect(proIds).toContain('document-converter');
    expect(proIds).toContain('workflow-recipes');
    expect(proIds).toContain('watermark');
    expect(proIds).toContain('collage-maker');
    expect(proIds).toContain('passport-photo');
    expect(proIds).toContain('privacy-redact');
    expect(proIds).toContain('favicon-studio');
    expect(proIds).toContain('svg-to-png');
    expect(proIds).toContain('png-to-svg');
    expect(proIds).toContain('video-metadata-editor');

    // Verify key Free features
    const freeIds = freeUtilities.map(u => u.id);
    expect(freeIds).toContain('batch-resize');
    expect(freeIds).toContain('photo-metadata-editor');

    // Verify removed tools
    const allIds = UTILITIES.map(u => u.id);
    expect(allIds).not.toContain('avatar-crop');
    expect(allIds).not.toContain('exif-viewer');
    expect(allIds).not.toContain('exif-remover');
    expect(allIds).not.toContain('image-to-base64');
    expect(allIds).not.toContain('base64-to-image');
    expect(allIds).not.toContain('camera-raw');

    // Verify AI tools are completely removed
    expect(allIds).not.toContain('ai-upscale');
    expect(allIds).not.toContain('ai-bg-removal');
    expect(allIds).not.toContain('ai-colorization');
    expect(allIds).not.toContain('ai-inpainting');

    // Verify browser utilities exist
    expect(allIds).toContain('rotate-flip');
    expect(allIds).toContain('meme-generator');
    expect(allIds).toContain('image-splitter');
  });
});

