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

  it('includes key required utilities', () => {
    const required = [
      'workflow-recipes',
      'batch-resize',
      'compression',
      'heic-converter',
      'webp-to-raster',
      'raster-to-webp',
      'svg-to-png',
      'png-to-svg',
      'ai-upscale',
      'ai-bg-removal',
      'sharpen-enhance',
      'avatar-crop',
      'social-presets',
      'watermark',
      'collage-maker',
      'color-palette',
      'passport-photo',
      'ai-colorization',
      'ai-inpainting',
      'exif-viewer',
      'exif-remover',
      'privacy-redact',
      'favicon-studio',
      'image-to-base64',
      'base64-to-image',
      'camera-raw',
    ];

    const ids = UTILITIES.map(u => u.id);
    for (const r of required) {
      expect(ids).toContain(r);
    }
  });
});

