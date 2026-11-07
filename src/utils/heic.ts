export interface HeicConversionOptions {
  toFormat: 'image/jpeg' | 'image/png';
  quality?: number; // 0.1 to 1.0
}

/**
 * Decodes Apple iPhone HEIC/HEIF files to standard JPEG or PNG using pure client-side WebAssembly.
 * Dynamically imports the heavy libheif engine only on demand when a HEIC file is dropped.
 */
export async function convertHeicToRaster(
  file: Blob | File,
  options: HeicConversionOptions = { toFormat: 'image/jpeg', quality: 0.92 }
): Promise<Blob> {
  try {
    // Dynamic import to prevent inflating initial bundle load
    const heic2anyModule = await import('heic2any');
    const heic2any = (heic2anyModule.default || heic2anyModule) as any;

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

