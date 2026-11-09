import JSZip from 'jszip';
import { ConversionProgressState, ConversionResult, ConvertedOutputItem } from '../../types/conversion';

type ProgressCallback = (state: ConversionProgressState) => void;

/**
 * Validates against Zip Slip path traversal and malicious filenames
 */
export function sanitizeArchiveFilename(filename: string): string {
  // Disallow parent directory traversal
  if (filename.includes('..') || filename.startsWith('/') || filename.startsWith('\\') || /^[a-zA-Z]:/.test(filename)) {
    throw new Error(`Security Violation: Unsafe path in archive "${filename}"`);
  }
  return filename.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * 1. ZIP to Extracted Files
 */
export async function extractZipArchive(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Inspecting ZIP archive structure...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const filenames = Object.keys(zip.files).filter(f => !zip.files[f].dir);
  if (filenames.length === 0) {
    throw new Error('ZIP archive is empty or contains only folders.');
  }

  const items: ConvertedOutputItem[] = [];
  const cleanZip = new JSZip();
  let totalExtractedBytes = 0;
  const maxSafeBytes = 250 * 1024 * 1024; // 250MB decompression limit to prevent zip bombs

  for (let i = 0; i < filenames.length; i++) {
    const rawName = filenames[i];
    const safeName = sanitizeArchiveFilename(rawName);

    onProgress?.({
      status: 'processing',
      phase: `Extracting file ${i + 1} of ${filenames.length}: ${safeName}...`,
      percent: Math.min(85, Math.round(25 + ((i + 1) / filenames.length) * 60))
    });

    const entry = zip.files[rawName];
    const uint8 = await entry.async('uint8array');
    totalExtractedBytes += uint8.length;

    if (totalExtractedBytes > maxSafeBytes) {
      throw new Error('Extraction aborted: archive exceeds safe decompression limit (250 MB).');
    }

    const ext = safeName.split('.').pop()?.toLowerCase() || '';
    let mime = 'application/octet-stream';
    if (['jpg', 'jpeg'].includes(ext)) mime = 'image/jpeg';
    else if (ext === 'png') mime = 'image/png';
    else if (ext === 'webp') mime = 'image/webp';
    else if (ext === 'pdf') mime = 'application/pdf';
    else if (ext === 'txt') mime = 'text/plain';
    else if (ext === 'json') mime = 'application/json';
    else if (ext === 'csv') mime = 'text/csv';

    const blob = new Blob([uint8 as unknown as BlobPart], { type: mime });
    const url = URL.createObjectURL(blob);

    items.push({
      id: `file_${i + 1}`,
      name: safeName.split('/').pop() || safeName,
      size: blob.size,
      blob,
      mimeType: mime,
      url,
      previewUrl: mime.startsWith('image/') ? url : undefined,
    });

    cleanZip.file(safeName, blob);
  }

  onProgress?.({ status: 'generating', phase: 'Packaging clean extracted archive...', percent: 90 });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const cleanZipBlob = await cleanZip.generateAsync({ type: 'blob' });
  const cleanZipName = `${baseName}_extracted.zip`;

  onProgress?.({ status: 'done', phase: `Extracted ${items.length} files successfully!`, percent: 100 });
  return {
    primaryBlob: cleanZipBlob,
    primaryFilename: cleanZipName,
    primaryMimeType: 'application/zip',
    primarySize: cleanZipBlob.size,
    items,
    zipBlob: cleanZipBlob,
    zipFilename: cleanZipName,
    zipSize: cleanZipBlob.size,
    summary: `Extracted ${items.length} files safely with path traversal protection (${(cleanZipBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 2. TAR to Extracted Files (POSIX/GNU tar format 512-byte blocks)
 */
export async function extractTarArchive(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing TAR archive header blocks...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const items: ConvertedOutputItem[] = [];
  const cleanZip = new JSZip();
  let offset = 0;
  const dec = new TextDecoder('ascii');

  while (offset + 512 <= data.length) {
    // 512-byte header block
    const header = data.subarray(offset, offset + 512);

    // If block is all zeros, end of archive
    if (header.every(b => b === 0)) break;

    // Filename: 0..100
    const rawName = dec.decode(header.subarray(0, 100)).replace(/\0.*$/, '').trim();
    if (!rawName) {
      offset += 512;
      continue;
    }

    const safeName = sanitizeArchiveFilename(rawName);

    // File size in octal: offset 124..136
    const sizeStr = dec.decode(header.subarray(124, 136)).replace(/\0.*$/, '').trim();
    const fileSize = parseInt(sizeStr, 8) || 0;

    // Type flag: offset 156
    const typeFlag = String.fromCharCode(header[156]);
    offset += 512; // Advance past header

    // If regular file ('0' or '\0')
    if (typeFlag === '0' || typeFlag === '\0' || typeFlag === '') {
      if (offset + fileSize <= data.length) {
        const fileContent = data.subarray(offset, offset + fileSize);
        const blob = new Blob([fileContent as unknown as BlobPart], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        items.push({
          id: `tar_file_${items.length + 1}`,
          name: safeName.split('/').pop() || safeName,
          size: fileSize,
          blob,
          mimeType: 'application/octet-stream',
          url,
        });

        cleanZip.file(safeName, blob);
      }
    }

    // TAR pads each file to a 512-byte boundary
    const padding = (512 - (fileSize % 512)) % 512;
    offset += fileSize + padding;
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const cleanZipBlob = await cleanZip.generateAsync({ type: 'blob' });
  const cleanZipName = `${baseName}_extracted.zip`;

  onProgress?.({ status: 'done', phase: `Extracted ${items.length} files from TAR!`, percent: 100 });
  return {
    primaryBlob: cleanZipBlob,
    primaryFilename: cleanZipName,
    primaryMimeType: 'application/zip',
    primarySize: cleanZipBlob.size,
    items,
    zipBlob: cleanZipBlob,
    zipFilename: cleanZipName,
    zipSize: cleanZipBlob.size,
    summary: `Extracted ${items.length} files from TAR archive (${(cleanZipBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 3. TAR.GZ / TGZ to Extracted Files
 * Decompresses gzip stream via native DecompressionStream API, then unpacks tar records.
 */
export async function extractTarGzArchive(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Decompressing GZIP stream...', percent: 20 });

  let decompressedArrayBuffer: ArrayBuffer;

  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip');
    const decompressedStream = file.stream().pipeThrough(ds);
    const response = new Response(decompressedStream);
    decompressedArrayBuffer = await response.arrayBuffer();
  } else {
    // Fallback: read directly
    decompressedArrayBuffer = await file.arrayBuffer();
  }

  onProgress?.({ status: 'processing', phase: 'Unpacking TAR files...', percent: 55 });
  const decompressedFile = new File([decompressedArrayBuffer], file.name.replace(/\.tar\.gz$|\.tgz$|\.gz$/i, '.tar'), {
    type: 'application/x-tar'
  });

  return extractTarArchive(decompressedFile, onProgress);
}
