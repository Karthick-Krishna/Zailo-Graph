import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Smartphone, CheckCircle2, Sliders, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const HeicControls: React.FC = () => {
  const { images, activeImage, executeActiveUtility, setCurrentParams, isProcessing } = useSession();

  const [toFormat, setToFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [preserveExif, setPreserveExif] = useState<boolean>(true);
  const [isBatchConverting, setIsBatchConverting] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const isHeicInput = activeImage.name.toLowerCase().endsWith('.heic') || 
                      activeImage.name.toLowerCase().endsWith('.heif') ||
                      activeImage.type === 'image/heic' ||
                      activeImage.type === 'image/heif';

  const getEffectiveParams = (fmt = toFormat, q = quality) => ({
    toFormat: fmt,
    quality: q,
    preserveExif,
  });

  const handleApply = (fmt = toFormat, q = quality) => {
    const params = getEffectiveParams(fmt, q);
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const handleBatchConvert = async () => {
    if (images.length === 0) return;
    setIsBatchConverting(true);
    try {
      const params = getEffectiveParams();
      await executeActiveUtility(params);
    } finally {
      setIsBatchConverting(false);
    }
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_heic_${toFormat}_${quality}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply(toFormat, quality);
    }
  }, [activeImage.id]);

  return (
    <div className="space-y-4">
      {/* Input Codec Status Badge */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
        isHeicInput 
          ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
      }`}>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <span className="font-semibold">{isHeicInput ? 'Apple HEIC/HEIF Detected' : 'Raster Format Active'}</span>
        </div>
        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-neutral-200">
          {formatBytes(activeImage.size)}
        </span>
      </div>

      {/* Target Output Format */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Target Decoded Format</label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => {
              setToFormat('image/jpeg');
              handleApply('image/jpeg', quality);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
              toFormat === 'image/jpeg' 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="font-bold">JPEG (Universal)</span>
            <span className="text-[9px] text-neutral-400 font-normal">Best for photos & web</span>
          </button>

          <button
            onClick={() => {
              setToFormat('image/png');
              handleApply('image/png', quality);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
              toFormat === 'image/png' 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="font-bold">PNG (Lossless)</span>
            <span className="text-[9px] text-neutral-400 font-normal">Maximum fidelity</span>
          </button>
        </div>
      </div>

      {/* Quality Tuning (for JPEG mode) */}
      {toFormat === 'image/jpeg' && (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>JPEG Output Quality</span>
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.02"
            value={quality}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setQuality(val);
              handleApply(toFormat, val);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
            <span onClick={() => { setQuality(0.8); handleApply(toFormat, 0.8); }} className="hover:text-neutral-900 cursor-pointer">80% (Compact)</span>
            <span onClick={() => { setQuality(0.92); handleApply(toFormat, 0.92); }} className="hover:text-neutral-900 cursor-pointer font-bold text-neutral-700">92% (Apple Default)</span>
            <span onClick={() => { setQuality(1.0); handleApply(toFormat, 1.0); }} className="hover:text-neutral-900 cursor-pointer">100% (Max)</span>
          </div>
        </div>
      )}

      {/* EXIF Preservation Toggle */}
      <div 
        onClick={() => {
          const next = !preserveExif;
          setPreserveExif(next);
          const p = { ...getEffectiveParams(), preserveExif: next };
          setCurrentParams(p);
          executeActiveUtility(p);
        }}
        className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between cursor-pointer hover:bg-neutral-100/70 transition"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div>
            <div className="text-xs font-semibold text-neutral-800">Preserve Camera Metadata (EXIF)</div>
            <div className="text-[10px] text-neutral-500">Retain iPhone lens data, timestamp, and ISO</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={preserveExif}
          onChange={() => {}}
          className="accent-neutral-900 rounded cursor-pointer"
        />
      </div>

      {/* Direct Apply Button */}
      <button
        onClick={() => handleApply()}
        disabled={isProcessing}
        className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Convert HEIC to {toFormat === 'image/jpeg' ? 'JPEG' : 'PNG'}</span>
      </button>

      {/* Batch Convert All Images in Queue */}
      {images.length > 1 && (
        <button
          onClick={handleBatchConvert}
          disabled={isBatchConverting || isProcessing}
          className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Convert All {images.length} Queue Images</span>
        </button>
      )}

      {/* Privacy Guarantee */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-[10px]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>Decoded via pure client-side libheif WebAssembly. Zero cloud upload.</span>
      </div>
    </div>
  );
};

