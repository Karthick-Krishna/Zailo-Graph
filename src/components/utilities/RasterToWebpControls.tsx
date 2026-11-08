import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Sparkles, CheckCircle2, Sliders, Layers, Zap } from 'lucide-react';
import { formatBytes, calculateSavings } from '../../utils/formatters';

export const RasterToWebpControls: React.FC = () => {
  const { images, activeImage, executeActiveUtility, executeBatchUtility, setCurrentParams, isProcessing } = useSession();

  const [isLossless, setIsLossless] = useState<boolean>(false);
  const [quality, setQuality] = useState<number>(0.85);
  const [isBatchConverting, setIsBatchConverting] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const getEffectiveParams = (lossless = isLossless, q = quality) => ({
    format: 'image/webp',
    quality: lossless ? 1.0 : q,
  });

  const handleApply = (lossless = isLossless, q = quality) => {
    const params = getEffectiveParams(lossless, q);
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const handleBatchConvert = async () => {
    if (images.length === 0) return;
    setIsBatchConverting(true);
    try {
      const params = getEffectiveParams();
      await executeBatchUtility(params);
    } finally {
      setIsBatchConverting(false);
    }
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_raster2webp_${isLossless}_${quality}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply(isLossless, quality);
    }
  }, [activeImage.id]);

  const savings = activeImage.processedSize 
    ? calculateSavings(activeImage.size, activeImage.processedSize) 
    : null;

  return (
    <div className="space-y-4">
      {/* Encoding Mode Switcher */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">WebP Compression Mode</label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => {
              setIsLossless(false);
              handleApply(false, quality);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
              !isLossless 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="font-bold">Lossy WebP</span>
            <span className="text-[9px] text-neutral-400 font-normal">Maximum size reduction (-80%)</span>
          </button>

          <button
            onClick={() => {
              setIsLossless(true);
              handleApply(true, 1.0);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
              isLossless 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="font-bold">True Lossless</span>
            <span className="text-[9px] text-neutral-400 font-normal">Bit-for-bit exact PNG fidelity</span>
          </button>
        </div>
      </div>

      {/* Quality Tuning (for Lossy mode) */}
      {!isLossless && (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>WebP Target Quality</span>
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.98"
            step="0.02"
            value={quality}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setQuality(val);
              handleApply(false, val);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
            <span onClick={() => { setQuality(0.6); handleApply(false, 0.6); }} className="hover:text-neutral-900 cursor-pointer">60% (Tiny)</span>
            <span onClick={() => { setQuality(0.82); handleApply(false, 0.82); }} className="hover:text-neutral-900 cursor-pointer font-bold text-neutral-700">82% (Google Rec.)</span>
            <span onClick={() => { setQuality(0.95); handleApply(false, 0.95); }} className="hover:text-neutral-900 cursor-pointer">95% (High-End)</span>
          </div>
        </div>
      )}

      {/* Real-Time Savings Card */}
      {savings && (
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Original Payload:</span>
            <span className="font-mono font-medium text-neutral-700">{formatBytes(activeImage.size)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">WebP Payload:</span>
            <span className="font-mono font-bold text-neutral-900">{formatBytes(activeImage.processedSize!)}</span>
          </div>
          <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Storage Reduction:</span>
            </span>
            <span className={`font-mono text-sm ${savings.isSaved ? 'text-emerald-600' : 'text-neutral-600'}`}>
              {savings.isSaved ? `-${savings.percent}% (${formatBytes(savings.bytes)})` : `+${savings.percent}%`}
            </span>
          </div>
        </div>
      )}

      {/* Direct Apply Button */}
      <button
        onClick={() => handleApply()}
        disabled={isProcessing}
        className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Convert to {isLossless ? 'Lossless WebP' : `Lossy WebP (${Math.round(quality * 100)}%)`}</span>
      </button>

      {/* Batch Convert All Images in Queue */}
      {images.length > 1 && (
        <button
          onClick={handleBatchConvert}
          disabled={isBatchConverting || isProcessing}
          className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Convert All {images.length} Queue Images to WebP</span>
        </button>
      )}

      {/* Guarantee */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-[10px]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>Google WebP VP8/VP8L hardware-accelerated encoding in browser thread. Zero cloud latency.</span>
      </div>
    </div>
  );
};

