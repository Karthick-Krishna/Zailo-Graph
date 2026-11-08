import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';
import { 
  Plus, 
  Check, 
  Loader2, 
  Download, 
  Trash2, 
  Archive, 
  Play, 
  RotateCcw, 
  AlertCircle,
  XCircle,
  Camera
} from 'lucide-react';
import JSZip from 'jszip';

interface BatchDrawerProps {
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const BatchDrawer: React.FC<BatchDrawerProps> = ({
  isMobileModal = false,
  onCloseMobile,
}) => {
  const { 
    images, 
    activeImageId, 
    setActiveImageId, 
    removeImage, 
    addImages, 
    downloadImage,
    executeBatchUtility,
    cancelBatch,
    batchProgress,
    retryFailedImage,
    clearWorkspace,
    isProcessing,
  } = useSession();

  const { entitlements } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (images.length === 0) return null;

  const totalWorkspaceBytes = images.reduce((acc, img) => acc + img.size + (img.processedSize || 0), 0);
  const processedCount = images.filter(img => img.status === 'done').length;
  const errorCount = images.filter(img => img.status === 'error').length;

  const handleAddMore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addImages(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addImages(Array.from(e.dataTransfer.files));
    }
  };

  const handleBatchDownload = async () => {
    if (images.length === 1) {
      downloadImage(images[0].id);
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const blob = img.processedBlob || img.blob;
        const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/avif' ? 'avif' : blob.type === 'image/x-icon' ? 'ico' : 'png';
        const baseName = img.name.replace(/\.[^/.]+$/, '');
        zip.file(`${baseName}_imazora_${i + 1}.${ext}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imazora_batch_export_${images.length}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error('Batch zip download failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`w-full bg-white/95 backdrop-blur-md border-t px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 shadow-md relative transition-colors ${
        isDragOver ? 'border-violet-500 bg-violet-50/70' : 'border-neutral-200'
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.cr2,.cr3,.nef,.arw,.dng,.svg"
        onChange={handleAddMore}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleAddMore}
        className="hidden"
      />

      {/* Batch Execution Progress Bar (When Running) */}
      {batchProgress.isRunning && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
            style={{ 
              width: `${batchProgress.total > 0 ? (batchProgress.completed / batchProgress.total) * 100 : 0}%` 
            }}
          />
        </div>
      )}

      {/* Left: Queue Thumbnails Scrubber */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl no-scrollbar">
        {images.map((img) => {
          const isActive = img.id === activeImageId;
          return (
            <div
              key={img.id}
              onClick={() => {
                setActiveImageId(img.id);
                if (isMobileModal && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`relative group shrink-0 w-13 sm:w-14 h-13 sm:h-14 rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                  : img.status === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-neutral-200/90 hover:border-neutral-400 opacity-85 hover:opacity-100'
              }`}
              title={`${img.name} (${formatBytes(img.size)})${img.status === 'error' ? ' - Error: ' + img.error : ''}`}
            >
              <img
                src={img.previewUrl || img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute bottom-1 right-1 pointer-events-none">
                {img.status === 'done' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </div>
                )}
                {img.status === 'processing' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                    <Loader2 className="w-2 h-2 animate-spin" />
                  </div>
                )}
                {img.status === 'error' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <AlertCircle className="w-2 h-2 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Hover Actions: Delete / Retry / Download */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {img.status === 'error' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retryFailedImage(img.id);
                    }}
                    className="w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center cursor-pointer transition"
                    title="Retry this image"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(img.id);
                    }}
                    className="w-5 h-5 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center cursor-pointer transition"
                    title="Download individual file"
                  >
                    <Download className="w-2.5 h-2.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition"
                  title="Remove from queue"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add More Button */}
        <button
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="shrink-0 w-13 sm:w-14 h-13 sm:h-14 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-500 text-neutral-400 hover:text-neutral-700 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer bg-neutral-50/70 hover:bg-neutral-100/60"
          title="Add more images"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Add</span>
        </button>

        {/* Camera Capture Button */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="shrink-0 w-13 sm:w-14 h-13 sm:h-14 rounded-xl border border-dashed border-neutral-300 hover:border-violet-500 text-neutral-400 hover:text-violet-700 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer bg-neutral-50/70 hover:bg-violet-50/40"
          title="Take photo with camera"
        >
          <Camera className="w-4 h-4 text-violet-600" />
          <span className="text-[9px] font-semibold text-neutral-600">Snap</span>
        </button>
      </div>

      {/* Right: Batch Actions & Telemetry */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-semibold text-neutral-800">
            {images.length} in queue ({processedCount} done{errorCount > 0 ? `, ${errorCount} failed` : ''})
          </p>
          <p className="text-[10px] text-neutral-400 font-mono">
            {formatBytes(totalWorkspaceBytes)} in RAM
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Process All Button */}
          {batchProgress.isRunning ? (
            <button
              onClick={cancelBatch}
              className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Cancel batch processing"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel ({batchProgress.completed}/{batchProgress.total})</span>
            </button>
          ) : (
            <button
              onClick={() => executeBatchUtility()}
              disabled={isProcessing}
              className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Process all images in the queue with the active tool"
            >
              <Play className="w-3 h-3 fill-white" />
              <span className="hidden sm:inline">Process All</span>
              <span className="sm:hidden">All</span>
            </button>
          )}

          {/* Download ZIP Button */}
          <button
            onClick={handleBatchDownload}
            disabled={isZipping || images.length === 0}
            className="py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-neutral-800"
            title="Download all processed files as a ZIP archive"
          >
            {isZipping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="hidden sm:inline">Download ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          {/* Clear Queue Button */}
          <button
            onClick={clearWorkspace}
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
            title="Clear all images from workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
