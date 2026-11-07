/**
 * Formats byte counts into human-readable strings (KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats image resolution dimensions (e.g. "3840 × 2160 px").
 */
export function formatDimensions(w?: number, h?: number): string {
  if (!w || !h) return '—';
  return `${w.toLocaleString()} × ${h.toLocaleString()} px`;
}

/**
 * Calculates compression percentage and byte reduction.
 */
export function calculateSavings(original: number, processed: number): {
  bytes: number;
  percent: number;
  isSaved: boolean;
} {
  const diff = original - processed;
  const percent = original > 0 ? (diff / original) * 100 : 0;
  return {
    bytes: Math.abs(diff),
    percent: Math.round(percent * 10) / 10,
    isSaved: diff > 0,
  };
}

/**
 * Strips file extension from a filename.
 */
export function getFilenameWithoutExt(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Extracts lowercase extension from a filename.
 */
export function getFileExt(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

