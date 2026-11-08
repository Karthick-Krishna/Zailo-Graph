import { describe, it, expect } from 'vitest';
import { stripPngMetadataLossless, stripAllImageMetadata } from '../utils/exif';

describe('exif & metadata stripping utility', () => {
  it('strips non-critical metadata chunks from a PNG bitstream', async () => {
    // Construct a minimal PNG bitstream with an IHDR chunk, a tEXt chunk, and an IEND chunk
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    // Helper to build a chunk: [length (4), type (4), data (N), crc (4)]
    const makeChunk = (typeStr: string, data: number[]) => {
      const typeBytes = [typeStr.charCodeAt(0), typeStr.charCodeAt(1), typeStr.charCodeAt(2), typeStr.charCodeAt(3)];
      const len = data.length;
      const lenBytes = [(len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
      const dummyCrc = [0x00, 0x00, 0x00, 0x00];
      return [...lenBytes, ...typeBytes, ...data, ...dummyCrc];
    };

    // Minimal dummy IHDR (13 bytes)
    const ihdr = makeChunk('IHDR', new Array(13).fill(0));
    // Metadata tEXt chunk
    const textChunk = makeChunk('tEXt', [0x61, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x00, 0x41, 0x6c, 0x69, 0x63, 0x65]);
    // IEND chunk
    const iend = makeChunk('IEND', []);

    const fullPngBytes = new Uint8Array([...pngSignature, ...ihdr, ...textChunk, ...iend]);
    const inputBlob = new Blob([fullPngBytes], { type: 'image/png' });

    const strippedBlob = await stripPngMetadataLossless(inputBlob);
    expect(strippedBlob.type).toBe('image/png');

    const strippedBuf = new Uint8Array(await strippedBlob.arrayBuffer());
    // Stripped buffer should be smaller by exactly textChunk.length
    expect(strippedBuf.byteLength).toBe(fullPngBytes.byteLength - textChunk.length);

    // Verify 'tEXt' chunk type does not exist in stripped bytes
    const textSignature = 'tEXt';
    let foundText = false;
    for (let i = 0; i < strippedBuf.length - 4; i++) {
      if (
        strippedBuf[i] === textSignature.charCodeAt(0) &&
        strippedBuf[i + 1] === textSignature.charCodeAt(1) &&
        strippedBuf[i + 2] === textSignature.charCodeAt(2) &&
        strippedBuf[i + 3] === textSignature.charCodeAt(3)
      ) {
        foundText = true;
        break;
      }
    }
    expect(foundText).toBe(false);
  });

  it('strips JPEG APP1 segments cleanly', async () => {
    // SOI (0xFFD8) + APP1 (0xFFE1, len 10) + DQT (0xFFDB, len 4) + SOS (0xFFDA) + EOI (0xFFD9)
    const jpegBytes = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // APP1 Exif (len 8 + 2)
      0xff, 0xdb, 0x00, 0x04, 0x01, 0x02, // DQT (len 4)
      0xff, 0xda, 0x00, 0x03, 0x01, // SOS
      0xaa, 0xbb, // compressed scan data
      0xff, 0xd9, // EOI
    ]);

    const inputBlob = new Blob([jpegBytes], { type: 'image/jpeg' });
    const strippedBlob = await stripAllImageMetadata(inputBlob);

    const strippedBuf = new Uint8Array(await strippedBlob.arrayBuffer());
    // Verify APP1 marker 0xFF, 0xE1 is not present
    let foundApp1 = false;
    for (let i = 0; i < strippedBuf.length - 1; i++) {
      if (strippedBuf[i] === 0xff && strippedBuf[i + 1] === 0xe1) {
        foundApp1 = true;
        break;
      }
    }
    expect(foundApp1).toBe(false);
  });
});

