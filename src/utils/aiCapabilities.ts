/**
 * Client-Side AI Runtime & Capability Detection
 * Checks browser WebGPU and WebAssembly support for local on-device neural inference.
 */

export interface AiSystemCapabilities {
  hasWebGPU: boolean;
  hasWasm: boolean;
  gpuAdapterName?: string;
  recommendedBackend: 'webgpu' | 'wasm' | 'algorithmic';
}

let cachedCapabilities: AiSystemCapabilities | null = null;

export async function detectAiCapabilities(): Promise<AiSystemCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;

  const hasWasm = typeof WebAssembly !== 'undefined' && typeof WebAssembly.validate === 'function';
  let hasWebGPU = false;
  let gpuAdapterName: string | undefined;

  if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
        try {
          const info = await adapter.requestAdapterInfo?.();
          if (info) {
            gpuAdapterName = info.description || info.vendor || info.architecture || 'WebGPU Device';
          }
        } catch {
          gpuAdapterName = 'WebGPU Device';
        }
      }
    } catch {
      hasWebGPU = false;
    }
  }

  const recommendedBackend: 'webgpu' | 'wasm' | 'algorithmic' = hasWebGPU
    ? 'webgpu'
    : hasWasm
    ? 'wasm'
    : 'algorithmic';

  cachedCapabilities = {
    hasWebGPU,
    hasWasm,
    gpuAdapterName,
    recommendedBackend,
  };

  return cachedCapabilities;
}

