import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ImageItem } from '../types/image';
import { useAuth } from './AuthContext';
import { UTILITIES } from '../types/utility';
import { parseImageMetadata, stripJpegMetadataLossless, stripAllImageMetadata } from '../utils/exif';
import { extractEmbeddedRawPreview } from '../utils/rawExtractor';
import { convertHeicToRaster } from '../utils/heic';
import { saveToOPFS, readFromOPFS, deleteFromOPFS, clearOPFSWorkspace } from '../utils/opfs';

const OPFS_SESSION_MANIFEST_KEY = 'imazora_recent_session_manifest';

interface SavedSessionItem {
  id: string;
  name: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  savedAt: number;
}

export interface HistoryStep {
  id: string;
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  utilityId: string;
  utilityName: string;
  timestamp: number;
}

export interface BatchProgressState {
  isRunning: boolean;
  completed: number;
  total: number;
  currentName?: string;
}

interface SessionContextType {
  images: ImageItem[];
  activeImageId: string | null;
  activeImage: ImageItem | null;
  activeUtilityId: string;
  isProcessing: boolean;
  toastMessage: string | null;
  currentParams: any;
  savedSessionCount: number;
  batchProgress: BatchProgressState;
  isMobileToolsOpen: boolean;
  setIsMobileToolsOpen: (open: boolean) => void;
  
  // Multi-step History Stack
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  activeHistory: HistoryStep[];
  activeHistoryIndex: number;
  
  // Actions
  addImages: (files: File[]) => Promise<void>;
  addBase64Image: (base64String: string, name?: string) => Promise<boolean>;
  removeImage: (id: string) => void;
  clearWorkspace: () => void;
  restoreSavedSession: () => Promise<void>;
  clearSavedSession: () => void;
  setActiveImageId: (id: string) => void;
  setActiveUtilityId: (utilityId: string) => void;
  setCurrentParams: (params: any) => void;
  sendToUtility: (targetUtilityId: string, imageId?: string) => void;
  executeActiveUtility: (params?: any, targetUtility?: string) => Promise<void>;
  executeBatchUtility: (params?: any, targetUtility?: string) => Promise<void>;
  cancelBatch: () => void;
  retryFailedImage: (id: string) => Promise<void>;
  downloadImage: (imageId: string, customFormat?: string, customQuality?: number) => void;
  dismissToast: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const getDefaultParamsForUtility = (utilityId: string, image: { width: number; height: number } | null) => {
  const w = image?.width || 1920;
  const h = image?.height || 1080;
  const minDim = Math.min(w, h);

  switch (utilityId) {
    case 'batch-resize':
      return {
        scalePercent: 75,
        width: Math.max(1, Math.round(w * 0.75)),
        height: Math.max(1, Math.round(h * 0.75)),
        resampleMethod: 'lanczos3',
        format: 'image/webp',
        quality: 0.85,
      };
    case 'compression':
      return { format: 'image/webp', quality: 0.8 };
    case 'heic-converter':
      return { toFormat: 'image/jpeg', quality: 0.92, preserveExif: true };
    case 'webp-to-raster':
      return { format: 'image/png', quality: 0.92 };
    case 'raster-to-webp':
      return { format: 'image/webp', quality: 0.85 };
    case 'svg-to-png':
      return { scaleMultiplier: 2, dpi: 300, transparentBackground: true };
    case 'png-to-svg':
      return { mode: 'color', colorCount: 8, filterSpeckle: 4 };
    case 'ai-upscale':
      return { upscaleScale: 2, upscaleModel: 'photo', mode: 'algorithmic' };
    case 'ai-bg-removal':
      return { bgMode: 'transparent', bgFeather: 4, mode: 'algorithmic' };
    case 'sharpen-enhance':
      return { sharpen: 1.5, contrast: 1.05, brightness: 1.0, saturation: 1.05 };
    case 'avatar-crop':
      return {
        isCircle: true,
        aspectRatio: '1:1',
        width: minDim,
        height: minDim,
        x: Math.max(0, Math.round((w - minDim) / 2)),
        y: Math.max(0, Math.round((h - minDim) / 2)),
        rotation: 0,
        flipH: false,
        flipV: false,
      };
    case 'social-presets':
      return { presetWidth: 1080, presetHeight: 1080, fillMode: 'blur', fillColor: '#FAFAFA' };
    case 'watermark':
      return {
        text: 'Imazora Studio',
        fontSize: Math.max(20, Math.round(minDim * 0.04)),
        opacity: 0.75,
        position: 'bottom-right',
        color: '#FFFFFF',
        rotation: 0,
      };
    case 'collage-maker':
      return { layout: '4-grid', gap: 16, cornerRadius: 12, backgroundColor: '#FAFAFA' };
    case 'color-palette':
      return { count: 6 };
    case 'passport-photo':
      return {
        sheetMode: '4x6_grid',
        targetWidthMm: 51,
        targetHeightMm: 51,
        whitenedBackground: true,
      };
    case 'ai-colorization':
      return { colorIntensity: 85, colorTone: 'neutral', mode: 'algorithmic' };
    case 'ai-inpainting':
      return { brushSize: 36, mode: 'algorithmic' };
    case 'exif-viewer':
      return {};
    case 'exif-remover':
      return { stripMetadata: true };
    case 'privacy-redact':
      return {
        regions: [
          {
            x: Math.round(w * 0.25),
            y: Math.round(h * 0.35),
            width: Math.round(w * 0.5),
            height: Math.round(h * 0.3),
            mode: 'pixelate',
          },
        ],
      };
    case 'favicon-studio':
      return { size: 32, asIco: false };
    case 'image-to-base64':
      return {};
    case 'base64-to-image':
      return {};
    case 'camera-raw':
      return { engineMode: 'fast_preview', exposureEv: 0, temperature: 5500 };
    case 'workflow-recipes':
      return { recipeId: 'ecommerce' };
    default:
      return {};
  }
};

/**
 * Native vector rasterizer for SVG files.
 * Renders directly at target pixel dimensions via HTMLImageElement into Canvas,
 * guaranteeing crisp vector curves without low-resolution pixelation.
 */
async function rasterizeSvgToBlob(
  svgBlob: Blob,
  scaleMultiplier = 2,
  transparentBackground = true,
  format = 'image/png'
): Promise<Blob> {
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to parse vector SVG bitstream'));
      img.src = url;
    });

    const naturalW = img.naturalWidth || 800;
    const naturalH = img.naturalHeight || 600;
    const targetW = Math.max(1, Math.round(naturalW * scaleMultiplier));
    const targetH = Math.max(1, Math.round(naturalH * scaleMultiplier));

    // Clamp to 8192px max dimension to prevent GPU texture exhaustion
    const MAX_DIM = 8192;
    const boundedW = Math.min(targetW, MAX_DIM);
    const boundedH = Math.min(targetH, MAX_DIM);

    const canvas = document.createElement('canvas');
    canvas.width = boundedW;
    canvas.height = boundedH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    if (!transparentBackground) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, boundedW, boundedH);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, boundedW, boundedH);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas raster conversion failed'));
      }, format, 0.95);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { validateFileSize, validateBatchCount, isUtilityUnlocked, openAuthModal } = useAuth();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeUtilityId, setActiveUtilityId] = useState<string>('workflow-recipes');
  const [currentParams, setCurrentParams] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

  // Multi-step History Stack Map (by Image ID)
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryStep[]>>({});
  const [historyIndexMap, setHistoryIndexMap] = useState<Record<string, number>>({});

  const [batchProgress, setBatchProgress] = useState<BatchProgressState>({
    isRunning: false,
    completed: 0,
    total: 0,
  });

  const cancelBatchRef = useRef<boolean>(false);
  const currentJobSeqRef = useRef<number>(0);

  const [savedSessionCount, setSavedSessionCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(OPFS_SESSION_MANIFEST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {}
    return 0;
  });

  // Prevent accidental tab close when images exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (images.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [images.length]);

  // Keep saved session manifest up to date in localStorage
  useEffect(() => {
    if (images.length > 0) {
      const manifest: SavedSessionItem[] = images.map(img => ({
        id: img.id,
        name: img.name,
        size: img.size,
        width: img.width,
        height: img.height,
        mimeType: img.blob.type,
        savedAt: Date.now(),
      }));
      try {
        localStorage.setItem(OPFS_SESSION_MANIFEST_KEY, JSON.stringify(manifest));
        setSavedSessionCount(manifest.length);
      } catch {}
    }
  }, [images]);

  const clearSavedSession = useCallback(() => {
    try {
      localStorage.removeItem(OPFS_SESSION_MANIFEST_KEY);
      setSavedSessionCount(0);
      clearOPFSWorkspace();
    } catch {}
  }, []);

  const restoreSavedSession = useCallback(async () => {
    try {
      const raw = localStorage.getItem(OPFS_SESSION_MANIFEST_KEY);
      if (!raw) return;
      const manifest: SavedSessionItem[] = JSON.parse(raw);
      if (!Array.isArray(manifest) || manifest.length === 0) return;

      setIsProcessing(true);
      const recoveredItems: ImageItem[] = [];

      for (const item of manifest) {
        const blob = await readFromOPFS(item.id, item.mimeType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          recoveredItems.push({
            id: item.id,
            name: item.name,
            size: item.size,
            type: item.mimeType,
            blob,
            url,
            previewUrl: url,
            width: item.width,
            height: item.height,
            status: 'idle',
            progress: 100,
            metadata: { width: item.width, height: item.height },
            createdAt: item.savedAt || Date.now(),
          });
        }
      }

      if (recoveredItems.length > 0) {
        setImages(recoveredItems);
        setActiveImageId(recoveredItems[0].id);

        // Initialize history stack for restored images
        setHistoryMap(hPrev => {
          const nextH = { ...hPrev };
          recoveredItems.forEach(item => {
            nextH[item.id] = [{
              id: 'step_init_' + Math.random().toString(36).substring(2, 9),
              blob: item.blob,
              url: item.url,
              size: item.size,
              width: item.width,
              height: item.height,
              utilityId: 'original',
              utilityName: 'Restored Image',
              timestamp: Date.now(),
            }];
          });
          return nextH;
        });

        setHistoryIndexMap(iPrev => {
          const nextI = { ...iPrev };
          recoveredItems.forEach(item => {
            nextI[item.id] = 0;
          });
          return nextI;
        });

        setToastMessage(`⚡ Restored ${recoveredItems.length} images from your private local storage.`);
      } else {
        clearSavedSession();
      }
    } catch (err) {
      console.warn('Failed to restore session from OPFS:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [clearSavedSession]);

  // Initialize Codecs Web Worker
  useEffect(() => {
    let w: Worker;
    try {
      w = new Worker(new URL('../workers/codecs.worker.ts', import.meta.url), {
        type: 'module',
      });
      w.onerror = (err) => {
        console.error('Codecs Worker runtime error:', err);
      };
      setWorker(w);
    } catch (e) {
      console.error('Failed to spawn worker via URL, fallback:', e);
    }

    return () => {
      if (w) w.terminate();
    };
  }, []);

  const activeImage = images.find(img => img.id === activeImageId) || null;

  const dismissToast = () => setToastMessage(null);

  const addImages = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;

    // Quota check: Batch Count
    const batchValidation = validateBatchCount(images.length, files.length);
    if (!batchValidation.allowed && batchValidation.allowedCount === 0) {
      openAuthModal('batch_limit', undefined, batchValidation.message);
      return;
    }

    const filesToProcess = files.slice(0, batchValidation.allowedCount);
    if (batchValidation.message) {
      setToastMessage(batchValidation.message);
    }

    const newItems: ImageItem[] = [];

    for (const file of filesToProcess) {
      // Quota check: File Size
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.allowed) {
        setToastMessage(sizeValidation.message || 'File size exceeds limit');
        continue;
      }

      let activeFile: Blob = file;
      const lowerName = file.name.toLowerCase();
      const isRaw = lowerName.endsWith('.cr2') || lowerName.endsWith('.cr3') || lowerName.endsWith('.nef') || lowerName.endsWith('.arw') || lowerName.endsWith('.dng') || lowerName.endsWith('.orf') || lowerName.endsWith('.raf');
      const isHeic = lowerName.endsWith('.heic') || lowerName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

      if (isRaw) {
        const rawPreview = await extractEmbeddedRawPreview(file);
        if (rawPreview) {
          activeFile = rawPreview;
        }
      } else if (isHeic) {
        try {
          const heicRaster = await convertHeicToRaster(file);
          activeFile = heicRaster;
        } catch (err) {
          console.warn('HEIC decode fallback:', err);
        }
      }

      const id = 'img_' + Math.random().toString(36).substring(2, 9);
      const url = URL.createObjectURL(activeFile);

      // Extract metadata (EXIF/GPS)
      const metadata = await parseImageMetadata(file);

      // Create fast thumbnail preview
      let previewUrl = url;
      let width = metadata.width || 0;
      let height = metadata.height || 0;

      try {
        const bitmap = await createImageBitmap(activeFile);
        width = bitmap.width;
        height = bitmap.height;

        // Generate fast 512px preview
        const maxThumb = 512;
        const scale = Math.min(1, maxThumb / Math.max(bitmap.width, bitmap.height));
        const thumbCanvas = new OffscreenCanvas(
          Math.max(1, Math.round(bitmap.width * scale)),
          Math.max(1, Math.round(bitmap.height * scale))
        );
        const ctx = thumbCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, thumbCanvas.width, thumbCanvas.height);
          const thumbBlob = await thumbCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
          previewUrl = URL.createObjectURL(thumbBlob);
        }
        bitmap.close();
      } catch (err) {
        console.warn('Could not generate offscreen preview thumbnail:', err);
      }

      // Persist to OPFS asynchronously
      saveToOPFS(id, file);

      newItems.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
        blob: file,
        url,
        previewUrl,
        width,
        height,
        metadata,
        status: 'idle',
        progress: 0,
        createdAt: Date.now(),
      });
    }

    if (newItems.length > 0) {
      setImages(prev => [...prev, ...newItems]);
      
      // Initialize history stack for every image
      setHistoryMap(hPrev => {
        const nextH = { ...hPrev };
        newItems.forEach(item => {
          nextH[item.id] = [{
            id: 'step_init_' + Math.random().toString(36).substring(2, 9),
            blob: item.blob,
            url: item.url,
            size: item.size,
            width: item.width,
            height: item.height,
            utilityId: 'original',
            utilityName: 'Original Upload',
            timestamp: Date.now(),
          }];
        });
        return nextH;
      });

      setHistoryIndexMap(iPrev => {
        const nextI = { ...iPrev };
        newItems.forEach(item => {
          nextI[item.id] = 0;
        });
        return nextI;
      });

      if (!activeImageId) {
        setActiveImageId(newItems[0].id);
      }
    }
  }, [images.length, activeImageId, validateFileSize, validateBatchCount, openAuthModal]);

  const addBase64Image = useCallback(async (base64Input: string, name = 'decoded_image'): Promise<boolean> => {
    try {
      const trimmed = base64Input.trim();
      let dataUrl = trimmed;
      if (!trimmed.startsWith('data:')) {
        dataUrl = `data:image/png;base64,${trimmed}`;
      }
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1]?.replace('+xml', '') || 'png';
      const file = new File([blob], `${name}_${Date.now()}.${ext}`, { type: blob.type });
      await addImages([file]);
      setToastMessage('Decoded Base64 image into workspace.');
      return true;
    } catch (err: any) {
      setToastMessage('Failed to decode Base64 data: ' + (err.message || 'Invalid format'));
      return false;
    }
  }, [addImages]);

  const removeImage = useCallback((id: string) => {
    // Revoke history step URLs and clean up history state
    setHistoryMap(hPrev => {
      const steps = hPrev[id] || [];
      steps.forEach(step => {
        if (step.url) {
          try { URL.revokeObjectURL(step.url); } catch {}
        }
      });
      const nextH = { ...hPrev };
      delete nextH[id];
      return nextH;
    });

    setHistoryIndexMap(iPrev => {
      const nextI = { ...iPrev };
      delete nextI[id];
      return nextI;
    });

    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        if (target.previewUrl !== target.url) {
          URL.revokeObjectURL(target.previewUrl);
        }
        if (target.processedUrl) {
          URL.revokeObjectURL(target.processedUrl);
        }
        deleteFromOPFS(id);
      }
      const remaining = prev.filter(img => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  }, [activeImageId]);

  const clearWorkspace = useCallback(() => {
    // 1. Revoke active image URLs
    images.forEach(img => {
      URL.revokeObjectURL(img.url);
      if (img.previewUrl !== img.url) {
        URL.revokeObjectURL(img.previewUrl);
      }
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });

    // 2. Revoke all history URLs across all images
    setHistoryMap(hPrev => {
      Object.values(hPrev).forEach(steps => {
        steps.forEach(step => {
          if (step.url) {
            try { URL.revokeObjectURL(step.url); } catch {}
          }
        });
      });
      return {};
    });
    setHistoryIndexMap({});

    clearOPFSWorkspace();
    clearSavedSession();
    setImages([]);
    setActiveImageId(null);
  }, [images, clearSavedSession]);

  // Global Clipboard Pasting (Ctrl + V from anywhere on page)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.clipboardData && e.clipboardData.items) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            if (blob) {
              const ext = blob.type.split('/')[1]?.replace('+xml', '') || 'png';
              const file = new File(
                [blob],
                `clipboard_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.${ext}`,
                { type: blob.type }
              );
              imageFiles.push(file);
            }
          }
        }
        if (imageFiles.length > 0) {
          e.preventDefault();
          await addImages(imageFiles);
          setToastMessage(`⚡ Pasted ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} from clipboard!`);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addImages]);

  // Generic processing helper that executes any utility on an ImageItem
  const processItemWithWorker = useCallback(async (
    item: ImageItem,
    utilityToRun: string,
    effectiveParams: any
  ): Promise<{ blob: Blob; size: number; width: number; height: number; extraData?: any }> => {
    if (!worker) throw new Error('Worker engine is not ready.');

    // 1. Direct handling for Lossless EXIF Stripping
    if (utilityToRun === 'exif-remover' || (utilityToRun === 'exif-viewer' && effectiveParams?.stripMetadata)) {
      const strippedBlob = await stripAllImageMetadata(item.blob);
      let sW = item.width;
      let sH = item.height;
      try {
        const b = await createImageBitmap(strippedBlob);
        sW = b.width;
        sH = b.height;
        b.close();
      } catch {}
      return { blob: strippedBlob, size: strippedBlob.size, width: sW, height: sH };
    }

    // 2. Direct handling for EXIF Viewer Inspection
    if (utilityToRun === 'exif-viewer') {
      return { blob: item.blob, size: item.size, width: item.width, height: item.height, extraData: item.metadata };
    }

    // 3. Direct handling for Image to Base64
    if (utilityToRun === 'image-to-base64') {
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(item.blob);
      });
      return { blob: item.blob, size: item.size, width: item.width, height: item.height, extraData: { base64: b64 } };
    }

    // 4. Direct handling for HEIC decoder
    if (utilityToRun === 'heic-converter') {
      const converted = await convertHeicToRaster(item.blob, effectiveParams);
      let pW = item.width;
      let pH = item.height;
      try {
        const b = await createImageBitmap(converted);
        pW = b.width;
        pH = b.height;
        b.close();
      } catch {}
      return { blob: converted, size: converted.size, width: pW, height: pH };
    }

    // 4b. Direct handling for SVG to High-Resolution PNG with crisp native vector rasterization
    if (utilityToRun === 'svg-to-png' || ((item.type === 'image/svg+xml' || item.name.toLowerCase().endsWith('.svg')) && utilityToRun === 'batch-resize')) {
      const mult = effectiveParams?.scaleMultiplier || 2;
      const transparentBg = effectiveParams?.transparentBackground !== false;
      const rasterBlob = await rasterizeSvgToBlob(item.blob, mult, transparentBg);
      let pW = item.width;
      let pH = item.height;
      try {
        const b = await createImageBitmap(rasterBlob);
        pW = b.width;
        pH = b.height;
        b.close();
      } catch {}
      return { blob: rasterBlob, size: rasterBlob.size, width: pW, height: pH };
    }

    // 5. Map utility to worker task
    let taskType = 'compress';
    if (utilityToRun === 'batch-resize' || utilityToRun === 'svg-to-png') taskType = 'resize';
    else if (utilityToRun === 'avatar-crop') taskType = 'crop';
    else if (utilityToRun === 'watermark') taskType = 'watermark';
    else if (utilityToRun === 'sharpen-enhance') taskType = 'filter';
    else if (utilityToRun === 'social-presets') taskType = 'social_preset';
    else if (utilityToRun === 'passport-photo') taskType = 'passport_photo';
    else if (utilityToRun === 'color-palette') taskType = 'extract_palette';
    else if (utilityToRun === 'privacy-redact') taskType = 'privacy_redact';
    else if (utilityToRun === 'favicon-studio') taskType = 'favicon_pack';
    else if (utilityToRun === 'ai-bg-removal') taskType = 'ai_bg_removal';
    else if (utilityToRun === 'ai-upscale') taskType = 'ai_upscale';
    else if (utilityToRun === 'ai-inpainting') taskType = 'ai_inpainting';
    else if (utilityToRun === 'ai-colorization') taskType = 'ai_colorization';
    else if (utilityToRun === 'png-to-svg') taskType = 'vectorize';
    else if (utilityToRun === 'collage-maker') taskType = 'collage';
    else if (utilityToRun === 'camera-raw') taskType = 'camera_raw';
    else if (utilityToRun === 'workflow-recipes') taskType = 'workflow_recipe';

    const bitmap = await createImageBitmap(item.blob);
    const transferables: Transferable[] = [bitmap];

    // For collage: load extra images from the queue
    let extraBitmaps: ImageBitmap[] = [];
    if (utilityToRun === 'collage-maker') {
      const otherImages = images.filter(img => img.id !== item.id).slice(0, 3);
      for (const other of otherImages) {
        try {
          const bmp = await createImageBitmap(other.blob);
          extraBitmaps.push(bmp);
          transferables.push(bmp);
        } catch {}
      }
    }

    // For watermark logo
    let logoBmp: ImageBitmap | undefined;
    if (utilityToRun === 'watermark' && effectiveParams?.logoBlob) {
      try {
        logoBmp = await createImageBitmap(effectiveParams.logoBlob);
        transferables.push(logoBmp);
      } catch {}
    }

    const taskId = 'task_' + Math.random().toString(36).substring(2, 9);

    const promise = new Promise<{ blob: Blob; size: number; extraData?: any }>((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.removeEventListener('message', handler);
        reject(new Error('Processing timed out. Please try standard resolution.'));
      }, 45000);

      const handler = (e: MessageEvent) => {
        if (e.data.taskId === taskId) {
          clearTimeout(timer);
          worker.removeEventListener('message', handler);
          if (e.data.success) {
            resolve({ blob: e.data.blob, size: e.data.size, extraData: e.data.extraData });
          } else {
            reject(new Error(e.data.error || 'Worker execution failed'));
          }
        }
      };
      worker.addEventListener('message', handler);
    });

    worker.postMessage(
      {
        taskId,
        type: taskType,
        imageBitmap: bitmap,
        extraBitmaps,
        params: {
          ...effectiveParams,
          logoBitmap: logoBmp,
        },
      },
      transferables
    );

    const result = await promise;

    let pWidth = item.width;
    let pHeight = item.height;
    try {
      const resBitmap = await createImageBitmap(result.blob);
      pWidth = resBitmap.width;
      pHeight = resBitmap.height;
      resBitmap.close();
    } catch {}

    return {
      blob: result.blob,
      size: result.size,
      width: pWidth,
      height: pHeight,
      extraData: result.extraData,
    };
  }, [worker, images]);

  const selectUtility = useCallback((newUtilityId: string) => {
    setActiveUtilityId(newUtilityId);
    // Invalidate prior job sequences
    currentJobSeqRef.current++;

    // Clear stale processed output so user never sees previous tool's result
    setImages(prev => prev.map(img => {
      if (img.id === activeImageId && img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
        return {
          ...img,
          processedBlob: undefined,
          processedUrl: undefined,
          processedSize: undefined,
          status: 'idle',
        };
      }
      return img;
    }));

    const defaults = getDefaultParamsForUtility(newUtilityId, activeImage);
    setCurrentParams(defaults);
    // Auto-execute the selected tool immediately
    setTimeout(() => {
      executeActiveUtility(defaults, newUtilityId);
    }, 20);
  }, [activeImageId, activeImage]);

  const sendToUtility = useCallback((targetUtilityId: string, imageId?: string) => {
    const targetId = imageId || activeImageId;
    if (!targetId) return;

    // Check if target utility is locked
    if (!isUtilityUnlocked(targetUtilityId)) {
      openAuthModal('pro_feature', targetUtilityId);
      return;
    }

    // Set processed result as the active pipeline basis if available
    setImages(prev => prev.map(img => {
      if (img.id === targetId && img.processedBlob) {
        const nextUrl = URL.createObjectURL(img.processedBlob);
        
        // Push step onto multi-step history stack
        const stepName = UTILITIES.find(u => u.id === activeUtilityId)?.name || activeUtilityId;
        const newStep: HistoryStep = {
          id: 'step_' + Math.random().toString(36).substring(2, 9),
          blob: img.processedBlob,
          url: nextUrl,
          size: img.processedSize || img.processedBlob.size,
          width: img.processedWidth || img.width,
          height: img.processedHeight || img.height,
          utilityId: activeUtilityId,
          utilityName: stepName,
          timestamp: Date.now(),
        };

        setHistoryMap(hPrev => {
          const currentList = hPrev[targetId] || [];
          const currentIdx = historyIndexMap[targetId] !== undefined ? historyIndexMap[targetId] : currentList.length - 1;
          
          // Revoke any redone steps that are being overwritten
          const discarded = currentList.slice(currentIdx + 1);
          discarded.forEach(step => {
            if (step.url && step.url !== img.url) {
              try { URL.revokeObjectURL(step.url); } catch {}
            }
          });

          const truncated = currentList.slice(0, currentIdx + 1);
          return { ...hPrev, [targetId]: [...truncated, newStep] };
        });

        setHistoryIndexMap(iPrev => {
          const currentIdx = iPrev[targetId] !== undefined ? iPrev[targetId] : 0;
          return { ...iPrev, [targetId]: currentIdx + 1 };
        });

        return {
          ...img,
          blob: img.processedBlob,
          url: nextUrl,
          size: img.processedSize || img.processedBlob.size,
          width: img.processedWidth || img.width,
          height: img.processedHeight || img.height,
          processedBlob: undefined,
          processedUrl: undefined,
          processedSize: undefined,
          status: 'idle',
        };
      }
      return img;
    }));

    selectUtility(targetUtilityId);
    setToastMessage(`Switched to ${targetUtilityId.replace(/-/g, ' ')} with current result.`);
  }, [activeImageId, isUtilityUnlocked, openAuthModal, selectUtility]);

  const executeActiveUtility = useCallback(async (params?: any, targetUtility?: string) => {
    if (!activeImage || !worker) return;

    const utilityToRun = targetUtility || activeUtilityId;
    if (!isUtilityUnlocked(utilityToRun)) {
      openAuthModal('pro_feature', utilityToRun);
      return;
    }

    const defaultParams = getDefaultParamsForUtility(utilityToRun, activeImage);
    const effectiveParams = { ...defaultParams, ...(currentParams || {}), ...(params || {}) };

    const thisJobSeq = ++currentJobSeqRef.current;
    const targetImageId = activeImage.id;

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === targetImageId ? { ...img, status: 'processing', progress: 10 } : img));

    try {
      const result = await processItemWithWorker(activeImage, utilityToRun, effectiveParams);

      // Check if job is still current (prevents race condition overwrite)
      if (thisJobSeq !== currentJobSeqRef.current) {
        return;
      }
      const processedUrl = URL.createObjectURL(result.blob);

      setImages(prev => prev.map(img => {
        if (img.id === targetImageId) {
          if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
          return {
            ...img,
            processedBlob: result.blob,
            processedUrl,
            processedSize: result.size,
            processedWidth: result.width,
            processedHeight: result.height,
            status: 'done',
            progress: 100,
            lastUtilityApplied: utilityToRun,
            extraData: result.extraData || img.extraData,
            error: undefined,
          };
        }
        return img;
      }));
    } catch (err: any) {
      if (thisJobSeq !== currentJobSeqRef.current) return;
      console.error('Utility execution error:', err);
      setImages(prev => prev.map(img => img.id === targetImageId ? { ...img, status: 'error', error: err.message || 'Operation failed' } : img));
    } finally {
      if (thisJobSeq === currentJobSeqRef.current) {
        setIsProcessing(false);
      }
    }
  }, [activeImage, activeUtilityId, currentParams, worker, isUtilityUnlocked, openAuthModal, processItemWithWorker]);

  const retryFailedImage = useCallback(async (id: string) => {
    const item = images.find(img => img.id === id);
    if (!item) return;

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'processing', error: undefined } : img));

    try {
      const defaultParams = getDefaultParamsForUtility(activeUtilityId, item);
      const effectiveParams = { ...defaultParams, ...(currentParams || {}) };
      const result = await processItemWithWorker(item, activeUtilityId, effectiveParams);
      const processedUrl = URL.createObjectURL(result.blob);

      setImages(prev => prev.map(img => {
        if (img.id === id) {
          if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
          return {
            ...img,
            processedBlob: result.blob,
            processedUrl,
            processedSize: result.size,
            processedWidth: result.width,
            processedHeight: result.height,
            status: 'done',
            progress: 100,
            lastUtilityApplied: activeUtilityId,
            extraData: result.extraData,
            error: undefined,
          };
        }
        return img;
      }));
      setToastMessage('Successfully processed failed image.');
    } catch (err: any) {
      setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error', error: err.message || 'Retry failed' } : img));
    } finally {
      setIsProcessing(false);
    }
  }, [images, activeUtilityId, currentParams, processItemWithWorker]);

  const cancelBatch = useCallback(() => {
    cancelBatchRef.current = true;
    setBatchProgress(prev => ({ ...prev, isRunning: false }));
    setToastMessage('Batch operation cancelled.');
  }, []);

  const executeBatchUtility = useCallback(async (params?: any, targetUtility?: string) => {
    if (images.length === 0 || !worker) return;

    const utilityToRun = targetUtility || activeUtilityId;
    cancelBatchRef.current = false;
    setBatchProgress({ isRunning: true, completed: 0, total: images.length });
    setIsProcessing(true);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < images.length; i++) {
      if (cancelBatchRef.current) break;

      const item = images[i];
      setBatchProgress({ isRunning: true, completed: i, total: images.length, currentName: item.name });
      setImages(prev => prev.map(img => img.id === item.id ? { ...img, status: 'processing', progress: 30 } : img));

      try {
        const defaultParams = getDefaultParamsForUtility(utilityToRun, item);
        const effectiveParams = { ...defaultParams, ...(currentParams || {}), ...(params || {}) };
        const result = await processItemWithWorker(item, utilityToRun, effectiveParams);

        const processedUrl = URL.createObjectURL(result.blob);
        setImages(prev => prev.map(img => {
          if (img.id === item.id) {
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
            return {
              ...img,
              processedBlob: result.blob,
              processedUrl,
              processedSize: result.size,
              processedWidth: result.width,
              processedHeight: result.height,
              status: 'done',
              progress: 100,
              lastUtilityApplied: utilityToRun,
              extraData: result.extraData,
              error: undefined,
            };
          }
          return img;
        }));
        successCount++;
      } catch (err: any) {
        console.error(`Batch processing error on ${item.name}:`, err);
        setImages(prev => prev.map(img => img.id === item.id ? { ...img, status: 'error', error: err.message || 'Failed' } : img));
        failCount++;
      }

      setBatchProgress({ isRunning: true, completed: i + 1, total: images.length });
    }

    setBatchProgress(prev => ({ ...prev, isRunning: false }));
    setIsProcessing(false);
    setToastMessage(`Batch completed: ${successCount} successful${failCount > 0 ? `, ${failCount} failed` : ''}.`);
  }, [images, worker, activeUtilityId, currentParams, processItemWithWorker]);

  const downloadImage = useCallback((imageId: string, customFormat?: string, customQuality?: number) => {
    const item = images.find(img => img.id === imageId);
    if (!item) return;

    const downloadBlob = item.processedBlob || item.blob;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;

    let ext = 'png';
    if (customFormat) {
      ext = customFormat.replace('image/', '').replace('+xml', '');
      if (ext === 'jpeg') ext = 'jpg';
    } else {
      if (downloadBlob.type === 'image/jpeg') ext = 'jpg';
      else if (downloadBlob.type === 'image/webp') ext = 'webp';
      else if (downloadBlob.type === 'image/avif') ext = 'avif';
      else if (downloadBlob.type === 'image/svg+xml') ext = 'svg';
      else if (downloadBlob.type === 'image/x-icon') ext = 'ico';
    }

    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_imazora.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [images]);

  // Auto-process initial image when loaded if not yet processed
  useEffect(() => {
    if (activeImage && !activeImage.processedUrl && activeImage.status === 'idle' && worker) {
      const defaults = getDefaultParamsForUtility(activeUtilityId, activeImage);
      executeActiveUtility(defaults, activeUtilityId);
    }
  }, [activeImage?.id, activeImage?.status, activeUtilityId, worker, executeActiveUtility]);

  // Multi-step History Stack Computations
  const activeHistory = (activeImageId && historyMap[activeImageId]) ? historyMap[activeImageId] : [];
  const activeHistoryIndex = (activeImageId && historyIndexMap[activeImageId] !== undefined) ? historyIndexMap[activeImageId] : -1;
  const canUndo = Boolean(activeImage?.processedBlob) || activeHistoryIndex > 0;
  const canRedo = activeHistoryIndex >= 0 && activeHistoryIndex < activeHistory.length - 1;

  const undo = useCallback(() => {
    if (!activeImageId) return;

    // 1. If an uncommitted processed output exists, undoing resets it
    if (activeImage?.processedBlob) {
      if (activeImage.processedUrl) URL.revokeObjectURL(activeImage.processedUrl);
      setImages(prev => prev.map(img => img.id === activeImageId ? {
        ...img,
        processedBlob: undefined,
        processedUrl: undefined,
        processedSize: undefined,
        status: 'idle',
      } : img));
      setToastMessage('Reverted current transformation preview.');
      return;
    }

    // 2. Otherwise step back in history stack
    const currentSteps = historyMap[activeImageId] || [];
    const currentIdx = historyIndexMap[activeImageId] !== undefined ? historyIndexMap[activeImageId] : 0;

    if (currentIdx > 0) {
      const prevStep = currentSteps[currentIdx - 1];
      setHistoryIndexMap(prev => ({ ...prev, [activeImageId]: currentIdx - 1 }));

      setImages(prev => prev.map(img => {
        if (img.id === activeImageId) {
          return {
            ...img,
            blob: prevStep.blob,
            url: prevStep.url,
            size: prevStep.size,
            width: prevStep.width,
            height: prevStep.height,
            processedBlob: undefined,
            processedUrl: undefined,
            processedSize: undefined,
            status: 'idle',
          };
        }
        return img;
      }));

      setToastMessage(`↩ Undid to: ${prevStep.utilityName}`);
    }
  }, [activeImageId, activeImage, historyMap, historyIndexMap]);

  const redo = useCallback(() => {
    if (!activeImageId) return;
    const currentSteps = historyMap[activeImageId] || [];
    const currentIdx = historyIndexMap[activeImageId] !== undefined ? historyIndexMap[activeImageId] : 0;

    if (currentIdx < currentSteps.length - 1) {
      const nextStep = currentSteps[currentIdx + 1];
      setHistoryIndexMap(prev => ({ ...prev, [activeImageId]: currentIdx + 1 }));

      setImages(prev => prev.map(img => {
        if (img.id === activeImageId) {
          return {
            ...img,
            blob: nextStep.blob,
            url: nextStep.url,
            size: nextStep.size,
            width: nextStep.width,
            height: nextStep.height,
            processedBlob: undefined,
            processedUrl: undefined,
            processedSize: undefined,
            status: 'idle',
          };
        }
        return img;
      }));

      setToastMessage(`↪ Redid: ${nextStep.utilityName}`);
    }
  }, [activeImageId, historyMap, historyIndexMap]);

  return (
    <SessionContext.Provider
      value={{
        images,
        activeImageId,
        activeImage,
        activeUtilityId,
        isProcessing,
        toastMessage,
        currentParams,
        savedSessionCount,
        canUndo,
        canRedo,
        undo,
        redo,
        activeHistory,
        activeHistoryIndex,
        batchProgress,
        isMobileToolsOpen,
        setIsMobileToolsOpen,
        addImages,
        addBase64Image,
        removeImage,
        clearWorkspace,
        restoreSavedSession,
        clearSavedSession,
        setActiveImageId,
        setActiveUtilityId: selectUtility,
        setCurrentParams,
        sendToUtility,
        executeActiveUtility,
        executeBatchUtility,
        cancelBatch,
        retryFailedImage,
        downloadImage,
        dismissToast,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
