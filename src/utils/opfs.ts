/**
 * Origin Private File System (OPFS) abstraction for local virtual disk storage.
 * Keeps heavy 50 MB files off the main JavaScript heap.
 */

const WORKSPACE_DIR = 'zailo_graph_workspace';

export async function isOPFSSupported(): Promise<boolean> {
  return typeof navigator !== 'undefined' && 
         'storage' in navigator && 
         'getDirectory' in navigator.storage;
}

export async function getWorkspaceDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!(await isOPFSSupported())) return null;
  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(WORKSPACE_DIR, { create: true });
  } catch (err) {
    console.warn('OPFS unavailable, falling back to memory Blobs:', err);
    return null;
  }
}

/**
 * Saves a Blob stream into OPFS storage under an image ID.
 */
export async function saveToOPFS(id: string, blob: Blob): Promise<boolean> {
  const dir = await getWorkspaceDirectory();
  if (!dir) return false;

  try {
    const fileHandle = await dir.getFileHandle(`${id}.bin`, { create: true });
    // Write stream to OPFS
    const writable = await fileHandle.createWritable();
    await blob.stream().pipeTo(writable);
    return true;
  } catch (err) {
    console.warn(`Failed to write image ${id} to OPFS:`, err);
    return false;
  }
}

/**
 * Reads a Blob back from OPFS storage.
 */
export async function readFromOPFS(id: string, mimeType = 'application/octet-stream'): Promise<Blob | null> {
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
  const dir = await getWorkspaceDirectory();
  if (!dir) return;

  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(WORKSPACE_DIR, { recursive: true });
  } catch {
    // Ignore cleanup error
  }
}

