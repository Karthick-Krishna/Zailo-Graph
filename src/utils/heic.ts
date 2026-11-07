import heic2any from 'heic2any';

export interface HeicConversionOptions {
  toFormat: 'image/jpeg' | 'image/png';
  quality?: number; // 0.1 to 1.0
}

/**
 * Decodes Apple iPhone HEIC/HEIF files to standard JPEG or PNG using pure client-side WebAssembly.
 * Handles single images, bursts, and Live Photo stills without server uploads.
 */
export async function convertHeicToRaster(
  file: Blob | File,
  options: HeicConversionOptions = { toFormat: 'image/jpeg', quality: 0.92 }
): Promise<Blob> {
  try {
    const result = await heic2any({
      blob: file,
      toType: options.toFormat,
      quality: options.quality || 0.92,
    });

    if (Array.isArray(result)) {
      // If multi-frame burst, return first frame
      return result[0];
    }

    return result as Blob;
  } catch (err: any) {
    console.error('HEIC WASM conversion error:', err);
    throw new Error(`Failed to decode HEIC image: ${err?.message || 'Unknown codec error'}`);
  }
}
