/**
 * Origin Private File System (OPFS) abstraction for local virtual disk storage.
 * Keeps heavy image files off the main JavaScript heap.
 * Includes graceful in-memory fallback for private windows or unsupported environments.
 */

const WORKSPACE_DIR = 'zailo_graph_workspace';
const memoryFallback = new Map<string, Blob>();

export async function isOPFSSupported(): Promise<boolean> {
  try {
    return (
      typeof navigator !== 'undefined' &&
      'storage' in navigator &&
      typeof navigator.storage.getDirectory === 'function'
    );
  } catch {
    return false;
  }
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && typeof navigator.storage.estimate === 'function') {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
  } catch (err) {
    console.warn('Storage estimate unavailable:', err);
  }
  return null;
}

export async function getWorkspaceDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!(await isOPFSSupported())) return null;
  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(WORKSPACE_DIR, { create: true });
  } catch (err) {
    console.warn('OPFS directory handle unavailable, using memory fallback:', err);
    return null;
  }
}

/**
 * Saves a Blob stream into in-memory RAM cache and OPFS virtual disk storage.
 */
export async function saveToOPFS(id: string, blob: Blob): Promise<boolean> {
  // Always store in volatile RAM memory cache for instant, zero-latency access
  memoryFallback.set(id, blob);

  try {
    const dir = await getWorkspaceDirectory();
    if (!dir) {
      return true;
    }

    const fileHandle = await dir.getFileHandle(`${id}.bin`, { create: true });
    const writable = await fileHandle.createWritable();
    await blob.stream().pipeTo(writable);
    return true;
  } catch (err) {
    console.warn(`Failed to write image ${id} to OPFS, using memory fallback:`, err);
    return false;
  }
}

/**
 * Returns current in-memory RAM storage statistics
 */
export function getInMemoryStorageStats(): { count: number; totalBytes: number } {
  let totalBytes = 0;
  for (const blob of memoryFallback.values()) {
    totalBytes += blob.size;
  }
  return {
    count: memoryFallback.size,
    totalBytes,
  };
}

/**
 * Reads a Blob back from OPFS storage.
 */
export async function readFromOPFS(id: string, mimeType = 'application/octet-stream'): Promise<Blob | null> {
  if (memoryFallback.has(id)) {
    return memoryFallback.get(id) || null;
  }

  const dir = await getWorkspaceDirectory();
  if (!dir) return null;

  try {
    const fileHandle = await dir.getFileHandle(`${id}.bin`);
    const file = await fileHandle.getFile();
    return new Blob([await file.arrayBuffer()], { type: mimeType });
  } catch (err) {
    return null;
  }
}

/**
 * Deletes a single image from OPFS storage.
 */
export async function deleteFromOPFS(id: string): Promise<void> {
  memoryFallback.delete(id);
  const dir = await getWorkspaceDirectory();
  if (!dir) return;

  try {
    await dir.removeEntry(`${id}.bin`);
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Clears the entire workspace directory in OPFS.
 */
export async function clearOPFSWorkspace(): Promise<void> {
  memoryFallback.clear();
  const dir = await getWorkspaceDirectory();
  if (!dir) return;

  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(WORKSPACE_DIR, { recursive: true });
  } catch {
    // Ignore cleanup error
  }
}

