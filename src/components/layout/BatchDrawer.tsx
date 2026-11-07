import React, { useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';
import { Plus, Check, Loader2, Download, Trash2 } from 'lucide-react';

export const BatchDrawer: React.FC = () => {
  const { images, activeImageId, setActiveImageId, removeImage, addImages, downloadImage } = useSession();
  const { tier, entitlements, openAuthModal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (images.length === 0) return null;

  const totalWorkspaceBytes = images.reduce((acc, img) => acc + img.size + (img.processedSize || 0), 0);

  const handleAddMore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addImages(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleBatchDownload = () => {
    images.forEach(img => {
      downloadImage(img.id);
    });
  };

  return (
    <div className="w-full bg-white border-t border-neutral-200/80 px-6 py-3 flex items-center justify-between gap-4 z-30 shadow-sm">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleAddMore}
        className="hidden"
      />

      {/* Left: Queue Thumbnails Scrubber */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-3xl">
        {images.map((img) => {
          const isActive = img.id === activeImageId;
          return (
            <div
              key={img.id}
              onClick={() => setActiveImageId(img.id)}
              className={`relative group shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                isActive
                  ? 'border-neutral-900 shadow-md ring-2 ring-neutral-900/10'
                  : 'border-neutral-200 hover:border-neutral-300 opacity-80 hover:opacity-100'
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
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                {img.status === 'processing' && (
                  <div className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  </div>
                )}
              </div>

              {/* Remove on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Add More Button */}
        <button
          onClick={() => {
            if (tier === 'guest' && images.length >= entitlements.maxBatchQueue) {
              openAuthModal('batch_limit');
            } else {
              fileInputRef.current?.click();
            }
          }}
          className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 text-neutral-400 hover:text-neutral-900 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
          title="Add more images"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] font-bold">Add</span>
        </button>
      </div>

      {/* Right: Telemetry & Batch Export */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-semibold text-neutral-700">
            {images.length} {images.length === 1 ? 'file' : 'files'} in queue
          </p>
          <p className="text-[10px] text-neutral-400 font-mono">
            {formatBytes(totalWorkspaceBytes)} in browser memory
          </p>
        </div>

        <button
          onClick={handleBatchDownload}
          className="py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Save All ({images.length})</span>
        </button>
      </div>
    </div>
  );
};
