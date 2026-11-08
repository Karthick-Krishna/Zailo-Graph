import exifr from 'exifr';

/**
 * High-speed extractor for Camera RAW containers (CR2, CR3, NEF, ARW, DNG, ORF, RAF).
 * 1. Leverages exifr.thumbnail() to read the TIFF SubIFD / IFD1 embedded full-resolution JPEG preview.
 * 2. Falls back to byte-level JPEG SOI/EOI marker scanning if exifr parser encounters an unsupported tag.
 */
export async function extractEmbeddedRawPreview(file: Blob): Promise<Blob | null> {
  // Strategy 1: Fast EXIF/TIFF IFD thumbnail extraction
  try {
    const thumbBuffer = await exifr.thumbnail(file);
    if (thumbBuffer && thumbBuffer.byteLength > 1024) {
      const copy = new Uint8Array(thumbBuffer.byteLength);
      copy.set(new Uint8Array(thumbBuffer.buffer, thumbBuffer.byteOffset, thumbBuffer.byteLength));
      return new Blob([copy.buffer as ArrayBuffer], { type: 'image/jpeg' });
    }
  } catch (err) {
    console.warn('exifr.thumbnail extraction failed, falling back to byte scan:', err);
  }

  // Strategy 2: Fast byte-level JPEG SOI (0xFFD8) marker detection
  try {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    const maxSearchLength = Math.min(arrayBuffer.byteLength - 4, 16 * 1024 * 1024); // search first 16MB

    let jpegStart = -1;

    for (let i = 0; i < maxSearchLength; i++) {
      if (dataView.getUint8(i) === 0xFF && dataView.getUint8(i + 1) === 0xD8) {
        const third = dataView.getUint8(i + 2);
        const fourth = dataView.getUint8(i + 3);
        if (third === 0xFF && (fourth === 0xE1 || fourth === 0xE0 || fourth === 0xDB || fourth === 0xC0)) {
          jpegStart = i;
          break;
        }
      }
    }

    if (jpegStart === -1) {
      return null;
    }

    // Scan forward from jpegStart for EOI (0xFFD9), skipping internal RST and data markers
    let jpegEnd = -1;
    let offset = jpegStart + 2;
    const len = arrayBuffer.byteLength;

    // Scan forward to locate the matching EOI marker
    while (offset < len - 1) {
      if (dataView.getUint8(offset) === 0xFF) {
        const m = dataView.getUint8(offset + 1);
        if (m === 0xD9) {
          jpegEnd = offset + 2;
          // Continue scanning if this preview looks too small (< 20KB) to ensure we get the full-res preview
          if (jpegEnd - jpegStart > 20480) {
            break;
          }
        }
      }
      offset++;
    }

    if (jpegStart !== -1 && jpegEnd !== -1 && jpegEnd > jpegStart) {
      const jpegSlice = arrayBuffer.slice(jpegStart, jpegEnd);
      return new Blob([jpegSlice], { type: 'image/jpeg' });
    }
  } catch (err) {
    console.warn('RAW byte scanner error:', err);
  }

  return null;
}


export function isRawFile(file: { name?: string; type?: string }): boolean {
  const name = (file.name || '').toLowerCase();
  const rawExtensions = ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.raf', '.rw2', '.orf', '.pef', '.srw'];
  return rawExtensions.some(ext => name.endsWith(ext));
}
