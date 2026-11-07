import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, Shield, ArrowRight } from 'lucide-react';

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
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full max-w-2xl mx-auto p-12 rounded-2xl border transition duration-150 cursor-pointer flex flex-col items-center justify-center text-center group ${
        isDragOver
          ? 'border-neutral-900 bg-white shadow-md'
          : 'border-neutral-300/80 bg-white hover:border-neutral-400 shadow-xs'
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

      <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center mb-4 group-hover:bg-neutral-900 group-hover:text-white transition">
        <UploadCloud className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-neutral-900 mb-1">
        Drop images here, or <span className="underline decoration-neutral-300 underline-offset-4">browse files</span>
      </h3>
      <p className="text-xs text-neutral-500 max-w-sm mb-6">
        JPEG, PNG, WebP, SVG, HEIC, and Camera RAW (CR2, NEF, ARW, DNG)
      </p>

      {/* Quiet details strip */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-neutral-100 w-full text-[11px] text-neutral-500">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200/60">
          <Shield className="w-3 h-3 text-neutral-400" />
          <span>Local browser sandbox</span>
        </div>

        {tier === 'guest' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAuthModal('size_limit');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 text-neutral-700 transition cursor-pointer"
          >
            <span>Guest limit: 10 MB</span>
            <span className="text-neutral-300">•</span>
            <span className="font-medium text-neutral-900">Unlock 50 MB</span>
            <ArrowRight className="w-3 h-3 text-neutral-400 ml-0.5" />
          </button>
        ) : (
          <div className="px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200/60 text-neutral-800 font-medium">
            Pro: 50 MB files / 50 batch active
          </div>
        )}
      </div>
    </div>
  );
};
