import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ImageItem } from '../types/image';
import { useAuth } from './AuthContext';
import { parseImageMetadata, stripJpegMetadataLossless } from '../utils/exif';
import { extractEmbeddedRawPreview } from '../utils/rawExtractor';
import { convertHeicToRaster } from '../utils/heic';
import { saveToOPFS, deleteFromOPFS, clearOPFSWorkspace } from '../utils/opfs';

interface SessionContextType {
  images: ImageItem[];
  activeImageId: string | null;
  activeImage: ImageItem | null;
  activeUtilityId: string;
  isProcessing: boolean;
  toastMessage: string | null;
  currentParams: any;
  
  // Actions
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearWorkspace: () => void;
  setActiveImageId: (id: string) => void;
  setActiveUtilityId: (utilityId: string) => void;
  setCurrentParams: (params: any) => void;
  sendToUtility: (targetUtilityId: string, imageId?: string) => void;
  executeActiveUtility: (params?: any) => Promise<void>;
  downloadImage: (imageId: string) => void;
  dismissToast: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { validateFileSize, validateBatchCount, isUtilityUnlocked, openAuthModal } = useAuth();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeUtilityId, setActiveUtilityId] = useState<string>('compression');
  const [currentParams, setCurrentParams] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

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

  // Initialize Codecs Web Worker
  useEffect(() => {
    const w = new Worker(new URL('../workers/codecs.worker.ts', import.meta.url), {
      type: 'module',
    });
    setWorker(w);

    return () => {
      w.terminate();
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
      if (!activeImageId) {
        setActiveImageId(newItems[0].id);
      }
    }
  }, [images.length, activeImageId, validateFileSize, validateBatchCount, openAuthModal]);

  const removeImage = useCallback((id: string) => {
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
    images.forEach(img => {
      URL.revokeObjectURL(img.url);
      if (img.previewUrl !== img.url) {
        URL.revokeObjectURL(img.previewUrl);
      }
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    clearOPFSWorkspace();
    setImages([]);
    setActiveImageId(null);
  }, [images]);

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

    setActiveUtilityId(targetUtilityId);
    setToastMessage(`Switched to ${targetUtilityId.replace(/-/g, ' ')} with current result.`);
  }, [activeImageId, isUtilityUnlocked, openAuthModal]);

  const executeActiveUtility = useCallback(async (params?: any) => {
    if (!activeImage || !worker) return;

    if (!isUtilityUnlocked(activeUtilityId)) {
      openAuthModal('pro_feature', activeUtilityId);
      return;
    }

    const effectiveParams = { ...(currentParams || {}), ...(params || {}) };

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, status: 'processing', progress: 10 } : img));

    try {
      // Direct handling for lossless EXIF metadata stripping
      if (activeUtilityId === 'exif-remover' || (activeUtilityId === 'exif-viewer' && effectiveParams?.stripMetadata)) {
        const strippedBlob = await stripJpegMetadataLossless(activeImage.blob);
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
        setToastMessage('Losslessly stripped EXIF metadata markers.');
        setIsProcessing(false);
        return;
      }

      // Direct handling for EXIF viewer inspection
      if (activeUtilityId === 'exif-viewer') {
        setToastMessage('EXIF metadata parsed and available in parameter panel.');
        setIsProcessing(false);
        return;
      }

      // Direct handling for Image to Base64
      if (activeUtilityId === 'image-to-base64') {
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
      if (activeUtilityId === 'heic-converter') {
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

      // Map utility to worker task
      let taskType = 'compress';
      if (activeUtilityId === 'batch-resize' || activeUtilityId === 'svg-to-png') taskType = 'resize';
      else if (activeUtilityId === 'avatar-crop') taskType = 'crop';
      else if (activeUtilityId === 'watermark') taskType = 'watermark';
      else if (activeUtilityId === 'sharpen-enhance') taskType = 'filter';
      else if (activeUtilityId === 'social-presets') taskType = 'social_preset';
      else if (activeUtilityId === 'passport-photo') taskType = 'passport_photo';
      else if (activeUtilityId === 'color-palette') taskType = 'extract_palette';
      else if (activeUtilityId === 'privacy-redact') taskType = 'privacy_redact';
      else if (activeUtilityId === 'favicon-studio') taskType = 'favicon_pack';
      else if (activeUtilityId === 'ai-bg-removal') taskType = 'ai_bg_removal';
      else if (activeUtilityId === 'ai-upscale') taskType = 'ai_upscale';
      else if (activeUtilityId === 'ai-inpainting') taskType = 'ai_inpainting';
      else if (activeUtilityId === 'ai-colorization') taskType = 'ai_colorization';
      else if (activeUtilityId === 'png-to-svg') taskType = 'vectorize';
      else if (activeUtilityId === 'collage-maker') taskType = 'collage';
      else if (activeUtilityId === 'camera-raw') taskType = 'camera_raw';

      const bitmap = await createImageBitmap(activeImage.blob);
      const taskId = 'task_' + Math.random().toString(36).substring(2, 9);

      const promise = new Promise<{ blob: Blob; size: number }>((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.removeEventListener('message', handler);
          reject(new Error('Processing timed out. Please try a smaller file or standard settings.'));
        }, 5000);

        const handler = (e: MessageEvent) => {
          if (e.data.taskId === taskId) {
            clearTimeout(timer);
            worker.removeEventListener('message', handler);
            if (e.data.success) {
              resolve({ blob: e.data.blob, size: e.data.size });
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
            lastUtilityApplied: activeUtilityId,
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
    a.download = `${baseName}_imazora.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [images]);

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
        addImages,
        removeImage,
        clearWorkspace,
        setActiveImageId,
        setActiveUtilityId,
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

