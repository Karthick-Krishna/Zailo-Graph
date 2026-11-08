import { describe, it, expect, beforeEach } from 'vitest';
import {
  isOPFSSupported,
  saveToOPFS,
  readFromOPFS,
  deleteFromOPFS,
  clearOPFSWorkspace,
  getStorageEstimate,
} from '../utils/opfs';

describe('OPFS & local persistence utility', () => {
  beforeEach(async () => {
    await clearOPFSWorkspace();
  });

  it('detects OPFS support or falls back cleanly', async () => {
    const supported = await isOPFSSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('saves and reads blob cleanly through fallback or native OPFS', async () => {
    const dummyData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const blob = new Blob([dummyData], { type: 'image/png' });
    const testId = 'test-image-123';

    const saved = await saveToOPFS(testId, blob);
    expect(saved).toBe(true);

    const retrieved = await readFromOPFS(testId, 'image/png');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.type).toBe('image/png');

    const retrievedBytes = new Uint8Array(await retrieved!.arrayBuffer());
    expect(Array.from(retrievedBytes)).toEqual(Array.from(dummyData));
  });

  it('deletes stored image item cleanly', async () => {
    const blob = new Blob(['hello world'], { type: 'text/plain' });
    const testId = 'item-to-delete';

    await saveToOPFS(testId, blob);
    const beforeDelete = await readFromOPFS(testId);
    expect(beforeDelete).not.toBeNull();

    await deleteFromOPFS(testId);
    const afterDelete = await readFromOPFS(testId);
    expect(afterDelete).toBeNull();
  });

  it('returns storage estimates safely without throwing', async () => {
    const estimate = await getStorageEstimate();
    if (estimate !== null) {
      expect(typeof estimate.usage).toBe('number');
      expect(typeof estimate.quota).toBe('number');
    } else {
      expect(estimate).toBeNull();
    }
  });
});
