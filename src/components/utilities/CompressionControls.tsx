import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { formatBytes, calculateSavings } from '../../utils/formatters';
import { Zap, CheckCircle2 } from 'lucide-react';

export const CompressionControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();

  const [format, setFormat] = useState<'image/avif' | 'image/webp' | 'image/jpeg' | 'image/png'>('image/avif');
  const [quality, setQuality] = useState<number>(0.85);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const handleApply = (newFormat = format, newQuality = quality) => {
    const params = {
      format: newFormat,
      quality: newQuality,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_compress_${format}_${quality}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply(format, quality);
    }
  }, [activeImage.id]);

  const savings = activeImage.processedSize 
    ? calculateSavings(activeImage.size, activeImage.processedSize) 
    : null;

  return (
    <div className="space-y-5">
      {/* Target Format */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Target Compression Codec</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
          {[
            { id: 'image/avif', label: 'AVIF', tag: 'Next-Gen 30%' },
            { id: 'image/webp', label: 'WebP', tag: 'Best Web' },
            { id: 'image/jpeg', label: 'MozJPEG', tag: 'Universal' },
            { id: 'image/png', label: 'PNG', tag: 'Lossless' },
          ].map(fmt => (
            <button
              key={fmt.id}
              onClick={() => {
                setFormat(fmt.id as any);
                handleApply(fmt.id as any, quality);
              }}
              className={`py-2 px-1 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
                format === fmt.id 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span className="font-bold">{fmt.label}</span>
              <span className="text-[8px] text-neutral-400 font-normal leading-tight text-center">{fmt.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (for lossy formats) */}
      {format !== 'image/png' && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>Compression Quality</span>
            <span className="font-mono text-neutral-900 font-bold">{Math.round(quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={quality}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setQuality(val);
              handleApply(format, val);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>Aggressive (Small)</span>
            <span>Balanced (85%)</span>
            <span>Visually Lossless</span>
          </div>
        </div>
      )}

      {/* Real-Time Savings Telemetry Card */}
      {savings && (
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Original Size:</span>
            <span className="font-mono font-medium text-neutral-700">{formatBytes(activeImage.size)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Compressed Size:</span>
            <span className="font-mono font-bold text-neutral-900">{formatBytes(activeImage.processedSize!)}</span>
          </div>
          <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Storage Saved:</span>
            </span>
            <span className={`font-mono text-sm ${savings.isSaved ? 'text-emerald-600' : 'text-neutral-600'}`}>
              {savings.isSaved ? `-${savings.percent}% (${formatBytes(savings.bytes)})` : `+${savings.percent}%`}
            </span>
          </div>
        </div>
      )}

      {/* Guarantee Notice */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-[11px]">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>Lossless Huffman table optimization and trellis quantization are applied with 100% local client WASM.</span>
      </div>
    </div>
  );
};

