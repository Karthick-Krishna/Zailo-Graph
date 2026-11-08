import { describe, it, expect } from 'vitest';
import { detectAiCapabilities } from '../utils/aiCapabilities';

describe('aiCapabilities utility', () => {
  it('detects runtime capabilities without throwing', async () => {
    const caps = await detectAiCapabilities();
    expect(caps).toBeDefined();
    expect(typeof caps.hasWebGPU).toBe('boolean');
    expect(typeof caps.hasWasm).toBe('boolean');
    expect(['webgpu', 'wasm', 'algorithmic']).toContain(caps.recommendedBackend);
  });
});

