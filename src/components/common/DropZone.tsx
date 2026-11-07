import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, ShieldCheck, Zap } from 'lucide-react';

export const DropZone: React.FC = () => {
  const { addImages } = useSession();
  const { tier, openAuthModal } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await addImages(files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await addImages(files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full max-w-3xl mx-auto my-12 p-12 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
        isDragOver
          ? 'border-neutral-900 bg-neutral-100/70 scale-[1.01]'
          : 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/50 shadow-sm'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.cr2,.cr3,.nef,.arw,.dng,.svg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Cloud Icon */}
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-600 flex items-center justify-center transition-all duration-200 shadow-sm mb-5">
        <UploadCloud className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-1.5">
        Drop your images here, or <span className="text-neutral-900 underline decoration-neutral-300 underline-offset-4">browse</span>
      </h3>
      <p className="text-xs text-neutral-500 max-w-md mb-6">
        Supports JPEG, PNG, WebP, SVG, HEIC & Camera RAW (CR2, NEF, ARW, DNG).
      </p>

      {/* Limits & Privacy Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Private Local Browser Processing</span>
        </div>

        {tier === 'guest' ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              openAuthModal('size_limit');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Guest: 10 MB file / 3-item limit (Unlock 50 MB Free)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pro Unlocked: 50 MB / 50-Image Batch Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
