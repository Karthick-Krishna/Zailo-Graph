import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ImageItem } from '../types/image';
import { useAuth } from './AuthContext';
import { UTILITIES } from '../types/utility';
import { parseImageMetadata, stripJpegMetadataLossless } from '../utils/exif';
import { extractEmbeddedRawPreview } from '../utils/rawExtractor';
import { convertHeicToRaster } from '../utils/heic';
import { saveToOPFS, readFromOPFS, deleteFromOPFS, clearOPFSWorkspace } from '../utils/opfs';

const OPFS_SESSION_MANIFEST_KEY = 'zailograph_recent_session_manifest';

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

interface SessionContextType {
  images: ImageItem[];
  activeImageId: string | null;
  activeImage: ImageItem | null;
  activeUtilityId: string;
  isProcessing: boolean;
  toastMessage: string | null;
  currentParams: any;
  savedSessionCount: number;
  
  // Multi-step History Stack
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  activeHistory: HistoryStep[];
  activeHistoryIndex: number;
  
  // Actions
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearWorkspace: () => void;
  restoreSavedSession: () => Promise<void>;
  clearSavedSession: () => void;
  setActiveImageId: (id: string) => void;
  setActiveUtilityId: (utilityId: string) => void;
  setCurrentParams: (params: any) => void;
  sendToUtility: (targetUtilityId: string, imageId?: string) => void;
  executeActiveUtility: (params?: any, targetUtility?: string) => Promise<void>;
  downloadImage: (imageId: string) => void;
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
      return { format: 'image/jpeg', quality: 0.9 };
    case 'webp-to-raster':
      return { format: 'image/png' };
    case 'raster-to-webp':
      return { format: 'image/webp', quality: 0.85 };
    case 'svg-to-png':
      return { scaleMultiplier: 2 };
    case 'png-to-svg':
      return { colorCount: 8, simplify: 2 };
    case 'ai-upscale':
      return { upscaleScale: 2, upscaleModel: 'esrgan' };
    case 'ai-bg-removal':
      return { bgMode: 'transparent', bgFeather: 20 };
    case 'sharpen-enhance':
      return { sharpen: 60, contrast: 15, brightness: 5, saturation: 10 };
    case 'avatar-crop':
      return {
        isCircle: true,
        width: minDim,
        height: minDim,
        x: Math.max(0, Math.round((w - minDim) / 2)),
        y: Math.max(0, Math.round((h - minDim) / 2)),
      };
    case 'social-presets':
      return { presetWidth: 1080, presetHeight: 1080, fillMode: 'blur' };
    case 'watermark':
      return {
        text: 'ZAILOGRAPH',
        fontSize: Math.max(24, Math.round(minDim * 0.05)),
        opacity: 0.75,
        position: 'bottom-right',
        color: '#FFFFFF',
        rotation: 0,
      };
    case 'collage-maker':
      return { layout: 'grid_2x2', gap: 12, borderRadius: 16 };
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
      return { intensity: 0.85, warmth: 1.1 };
    case 'ai-inpainting':
      return { mode: 'smart_heal', radius: 24 };
    case 'exif-viewer':
      return {};
    case 'exif-remover':
      return { stripMetadata: true };
    case 'privacy-redact':
      return {
        regions: [
          {
            x: Math.round(w * 0.2),
            y: Math.round(h * 0.2),
            width: Math.round(w * 0.3),
            height: Math.round(h * 0.2),
            mode: 'pixelate',
          },
        ],
      };
    case 'favicon-studio':
      return { size: 64 };
    case 'image-to-base64':
      return {};
    case 'base64-to-image':
      return {};
    case 'camera-raw':
      return { exposure: 0.2, contrast: 10 };
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

  // Multi-step History Stack Map (by Image ID)
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryStep[]>>({});
  const [historyIndexMap, setHistoryIndexMap] = useState<Record<string, number>>({});

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

    // 1. Quota check: Batch Count
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
      // 2. Quota check: File Size
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.allowed) {
        openAuthModal('size_limit', undefined, sizeValidation.message);
        continue;
      }

      let activeFile: Blob = file;
      const lowerName = file.name.toLowerCase();
      const isRaw = lowerName.endsWith('.cr2') || lowerName.endsWith('.cr3') || lowerName.endsWith('.nef') || lowerName.endsWith('.arw') || lowerName.endsWith('.dng') || lowerName.endsWith('.orf');
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

  const selectUtility = useCallback((newUtilityId: string) => {
    setActiveUtilityId(newUtilityId);
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

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, status: 'processing', progress: 10 } : img));

    try {
      // Direct handling for lossless EXIF metadata stripping (lossless for JPEG, clean scrub for PNG/WebP)
      if (utilityToRun === 'exif-remover' || (utilityToRun === 'exif-viewer' && effectiveParams?.stripMetadata)) {
        let strippedBlob: Blob;
        const isJpeg = activeImage.type === 'image/jpeg' || activeImage.name.toLowerCase().endsWith('.jpg') || activeImage.name.toLowerCase().endsWith('.jpeg');
        if (isJpeg) {
          strippedBlob = await stripJpegMetadataLossless(activeImage.blob);
        } else {
          // Re-render raster through OffscreenCanvas to wipe all metadata chunks (EXIF/XMP/IPTC/comments)
          const bmp = await createImageBitmap(activeImage.blob);
          const c = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = c.getContext('2d');
          if (ctx) ctx.drawImage(bmp, 0, 0);
          bmp.close();
          const targetType = activeImage.type || 'image/png';
          strippedBlob = await c.convertToBlob({ type: targetType });
        }
        const processedUrl = URL.createObjectURL(strippedBlob);
        setImages(prev => prev.map(img => {
          if (img.id === activeImage.id) {
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
            return {
              ...img,
              processedBlob: strippedBlob,
              processedUrl,
              processedSize: strippedBlob.size,
              processedWidth: img.width,
              processedHeight: img.height,
              status: 'done',
              progress: 100,
              lastUtilityApplied: 'exif-remover',
            };
          }
          return img;
        }));
        setToastMessage(isJpeg ? 'Losslessly stripped EXIF metadata markers.' : 'Scrubbed all metadata chunks from raster bitstream.');
        setIsProcessing(false);
        return;
      }

      // Direct handling for EXIF viewer inspection
      if (utilityToRun === 'exif-viewer') {
        setToastMessage('EXIF metadata parsed and available in parameter panel.');
        setIsProcessing(false);
        return;
      }

      // Direct handling for Image to Base64
      if (utilityToRun === 'image-to-base64') {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          navigator.clipboard.writeText(b64);
          setToastMessage('Base64 Data URI copied to clipboard!');
        };
        reader.readAsDataURL(activeImage.blob);
        setIsProcessing(false);
        return;
      }

      // Direct handling for HEIC decoder
      if (utilityToRun === 'heic-converter') {
        const converted = await convertHeicToRaster(activeImage.blob, effectiveParams);
        const processedUrl = URL.createObjectURL(converted);
        const bitmap = await createImageBitmap(converted);
        const pW = bitmap.width;
        const pH = bitmap.height;
        bitmap.close();

        setImages(prev => prev.map(img => {
          if (img.id === activeImage.id) {
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
            return {
              ...img,
              processedBlob: converted,
              processedUrl,
              processedSize: converted.size,
              processedWidth: pW,
              processedHeight: pH,
              status: 'done',
              progress: 100,
              lastUtilityApplied: 'heic-converter',
            };
          }
          return img;
        }));
        setToastMessage('Converted HEIC to raster format.');
        setIsProcessing(false);
        return;
      }

      // Direct handling for SVG to High-Resolution PNG with crisp native vector rasterization
      if (utilityToRun === 'svg-to-png' || ((activeImage.type === 'image/svg+xml' || activeImage.name.toLowerCase().endsWith('.svg')) && utilityToRun === 'batch-resize')) {
        const mult = effectiveParams?.scaleMultiplier || 2;
        const transparentBg = effectiveParams?.transparentBackground !== false;
        const rasterBlob = await rasterizeSvgToBlob(activeImage.blob, mult, transparentBg);
        const processedUrl = URL.createObjectURL(rasterBlob);
        const resBmp = await createImageBitmap(rasterBlob);
        const pW = resBmp.width;
        const pH = resBmp.height;
        resBmp.close();

        setImages(prev => prev.map(img => {
          if (img.id === activeImage.id) {
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
            return {
              ...img,
              processedBlob: rasterBlob,
              processedUrl,
              processedSize: rasterBlob.size,
              processedWidth: pW,
              processedHeight: pH,
              status: 'done',
              progress: 100,
              lastUtilityApplied: 'svg-to-png',
            };
          }
          return img;
        }));
        setToastMessage(`Rasterized SVG to ${mult}× high-resolution PNG.`);
        setIsProcessing(false);
        return;
      }

      // Map utility to worker task
      let taskType = 'compress';
      if (utilityToRun === 'batch-resize') taskType = 'resize';
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

      const bitmap = await createImageBitmap(activeImage.blob);
      const taskId = 'task_' + Math.random().toString(36).substring(2, 9);

      const promise = new Promise<{ blob: Blob; size: number; extraData?: any }>((resolve, reject) => {
        // Robust 45-second processing window so large super-res / WASM operations never timeout
        const timer = setTimeout(() => {
          worker.removeEventListener('message', handler);
          worker.removeEventListener('error', errHandler);
          reject(new Error('Processing took longer than expected. Please try standard resolution.'));
        }, 45000);

        const errHandler = (err: ErrorEvent) => {
          clearTimeout(timer);
          worker.removeEventListener('message', handler);
          worker.removeEventListener('error', errHandler);
          reject(new Error(err.message || 'Worker thread encountered a fatal error.'));
        };

        const handler = (e: MessageEvent) => {
          if (e.data.taskId === taskId) {
            clearTimeout(timer);
            worker.removeEventListener('message', handler);
            worker.removeEventListener('error', errHandler);
            if (e.data.success) {
              resolve({ blob: e.data.blob, size: e.data.size, extraData: e.data.extraData });
            } else {
              reject(new Error(e.data.error || 'Worker execution failed'));
            }
          }
        };

        worker.addEventListener('message', handler);
        worker.addEventListener('error', errHandler);
      });

      worker.postMessage(
        {
          taskId,
          type: taskType,
          imageBitmap: bitmap,
          params: effectiveParams,
        },
        [bitmap] // Zero-copy transfer
      );

      const result = await promise;
      const processedUrl = URL.createObjectURL(result.blob);

      // Measure real processed dimensions
      let pWidth = activeImage.width;
      let pHeight = activeImage.height;
      try {
        const resBitmap = await createImageBitmap(result.blob);
        pWidth = resBitmap.width;
        pHeight = resBitmap.height;
        resBitmap.close();
      } catch (err) {
        // fallback
      }

      setImages(prev => prev.map(img => {
        if (img.id === activeImage.id) {
          if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
          return {
            ...img,
            processedBlob: result.blob,
            processedUrl,
            processedSize: result.size,
            processedWidth: pWidth,
            processedHeight: pHeight,
            status: 'done',
            progress: 100,
            lastUtilityApplied: utilityToRun,
            extraData: result.extraData || img.extraData,
          };
        }
        return img;
      }));
    } catch (err: any) {
      console.error('Utility execution error:', err);
      setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, status: 'error', error: err.message } : img));
    } finally {
      setIsProcessing(false);
    }
  }, [activeImage, activeUtilityId, currentParams, worker, isUtilityUnlocked, openAuthModal]);

  const downloadImage = useCallback((imageId: string) => {
    const item = images.find(img => img.id === imageId);
    if (!item) return;

    const downloadBlob = item.processedBlob || item.blob;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;

    const ext = downloadBlob.type === 'image/jpeg' ? 'jpg' : downloadBlob.type === 'image/webp' ? 'webp' : 'png';
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_zailograph.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        addImages,
        removeImage,
        clearWorkspace,
        restoreSavedSession,
        clearSavedSession,
        setActiveImageId,
        setActiveUtilityId: selectUtility,
        setCurrentParams,
        sendToUtility,
        executeActiveUtility,
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

