import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';
import { Plus, Check, Loader2, Download, Trash2, Archive } from 'lucide-react';
import JSZip from 'jszip';

export const BatchDrawer: React.FC = () => {
  const { images, activeImageId, setActiveImageId, removeImage, addImages, downloadImage } = useSession();
  const { user, entitlements, openAuthModal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isZipping, setIsZipping] = useState(false);

  if (images.length === 0) return null;

  const totalWorkspaceBytes = images.reduce((acc, img) => acc + img.size + (img.processedSize || 0), 0);

  const handleAddMore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addImages(Array.from(e.target.files));
      e.target.value = '';
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
        const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
        const baseName = img.name.replace(/\.[^/.]+$/, '');
        zip.file(`${baseName}_zailograph_${i + 1}.${ext}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zailo_graph_batch_export_${images.length}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Batch zip download failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full bg-white border-t border-neutral-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 z-30 shadow-md relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.cr2,.cr3,.nef,.arw,.dng,.svg"
        onChange={handleAddMore}
        className="hidden"
      />

      {/* Left: Queue Thumbnails Scrubber */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-2xl sm:max-w-3xl no-scrollbar">
        {images.map((img) => {
          const isActive = img.id === activeImageId;
          return (
            <div
              key={img.id}
              onClick={() => setActiveImageId(img.id)}
              className={`relative group shrink-0 w-13 sm:w-14 h-13 sm:h-14 rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                  : 'border-neutral-200/90 hover:border-neutral-400 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.previewUrl || img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute bottom-1 right-1">
                {img.status === 'done' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2 h-2" />
                  </div>
                )}
                {img.status === 'processing' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                    <Loader2 className="w-2 h-2 animate-spin" />
                  </div>
                )}
              </div>

              {/* Remove on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* Add More Button */}
        <button
          onClick={() => {
            if (!user && images.length >= entitlements.maxBatchQueue) {
              openAuthModal('batch_limit');
            } else {
              fileInputRef.current?.click();
            }
          }}
          className="shrink-0 w-13 sm:w-14 h-13 sm:h-14 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-500 text-neutral-400 hover:text-neutral-700 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer bg-neutral-50/70 hover:bg-neutral-100/60"
          title="Add more images"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Add</span>
        </button>
      </div>

      {/* Right: Telemetry & Batch Export */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-semibold text-neutral-800">
            {images.length} {images.length === 1 ? 'file' : 'files'} in queue
          </p>
          <p className="text-[10px] text-neutral-400 font-mono">
            {formatBytes(totalWorkspaceBytes)} in memory
          </p>
        </div>

        <button
          onClick={handleBatchDownload}
          disabled={isZipping}
          className="py-2 px-3 sm:px-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-neutral-800"
        >
          {isZipping ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Archive className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span className="hidden sm:inline">Download ZIP</span>
          <span className="sm:hidden">ZIP</span>
        </button>
      </div>
    </div>
  );
};
