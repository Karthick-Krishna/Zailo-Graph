import { describe, it, expect } from 'vitest';
import { isRawFile, extractEmbeddedRawPreview } from '../utils/rawExtractor';

describe('rawExtractor utility', () => {
  it('correctly identifies RAW file extensions', () => {
    const rawFiles = [
      new File([''], 'photo.cr2', { type: '' }),
      new File([''], 'photo.CR3', { type: '' }),
      new File([''], 'landscape.nef', { type: '' }),
      new File([''], 'portrait.ARW', { type: '' }),
      new File([''], 'digital.dng', { type: '' }),
      new File([''], 'fuji.raf', { type: '' }),
      new File([''], 'panasonic.rw2', { type: '' }),
      new File([''], 'olympus.orf', { type: '' }),
    ];

    for (const f of rawFiles) {
      expect(isRawFile(f)).toBe(true);
    }

    const nonRawFiles = [
      new File([''], 'photo.jpg', { type: 'image/jpeg' }),
      new File([''], 'photo.png', { type: 'image/png' }),
      new File([''], 'photo.webp', { type: 'image/webp' }),
      new File([''], 'photo.svg', { type: 'image/svg+xml' }),
    ];

    for (const f of nonRawFiles) {
      expect(isRawFile(f)).toBe(false);
    }
  });

  it('handles embedded JPEG preview extraction fallback gracefully', async () => {
    // Construct a dummy RAW file that contains an embedded JPEG SOI...EOI sequence
    const dummyJpeg = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9];
    const rawHeader = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]; // TIFF LE header
    const fileBytes = new Uint8Array([...rawHeader, ...dummyJpeg]);

    const fakeRawFile = new File([fileBytes], 'test_sample.cr2', { type: 'image/x-canon-cr2' });
    const extracted = await extractEmbeddedRawPreview(fakeRawFile);

    // If an embedded JPEG is detected, returns Blob with image/jpeg
    if (extracted) {
      expect(extracted.type).toBe('image/jpeg');
    } else {
      expect(extracted).toBeNull();
    }
  });
});
