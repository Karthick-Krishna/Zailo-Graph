import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { formatBytes, calculateSavings } from '../../utils/formatters';
import { Zap, CheckCircle2, Sliders, Target, Layers, Sparkles } from 'lucide-react';

export const CompressionControls: React.FC = () => {
  const { images, activeImage, executeActiveUtility, executeBatchUtility, setCurrentParams, isProcessing } = useSession();

  const [mode, setMode] = useState<'quality' | 'target_size'>('quality');
  const [format, setFormat] = useState<'image/avif' | 'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState<number>(0.82);
  const [targetKb, setTargetKb] = useState<number>(300);
  const [pngColors, setPngColors] = useState<number>(256);
  const [isBatchCompressing, setIsBatchCompressing] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const getEffectiveParams = (overrideFmt = format, overrideQ = quality) => ({
    format: overrideFmt,
    quality: overrideQ,
    targetKb: mode === 'target_size' ? targetKb : undefined,
    pngColors: overrideFmt === 'image/png' ? pngColors : undefined,
  });

  const handleApply = (newFormat = format, newQuality = quality) => {
    const params = getEffectiveParams(newFormat, newQuality);
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const applyPreset = (presetFmt: any, presetQ: number, presetTargetKb?: number) => {
    setFormat(presetFmt);
    setQuality(presetQ);
    if (presetTargetKb) {
      setMode('target_size');
      setTargetKb(presetTargetKb);
    } else {
      setMode('quality');
    }
    const params = {
      format: presetFmt,
      quality: presetQ,
      targetKb: presetTargetKb,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const handleBatchCompressAll = async () => {
    if (images.length === 0) return;
    setIsBatchCompressing(true);
    try {
      const params = getEffectiveParams();
      await executeBatchUtility(params);
    } finally {
      setIsBatchCompressing(false);
    }
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_compress_${format}_${quality}_${mode}_${targetKb}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply(format, quality);
    }
  }, [activeImage.id]);

  const savings = activeImage.processedSize 
    ? calculateSavings(activeImage.size, activeImage.processedSize) 
    : null;

  return (
    <div className="space-y-4">
      {/* Mode Switcher: Quality vs Exact Target Size */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        <button
          onClick={() => {
            setMode('quality');
            handleApply(format, quality);
          }}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'quality' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Quality Tuning</span>
        </button>

        <button
          onClick={() => {
            setMode('target_size');
            handleApply(format, quality);
          }}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'target_size' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Target File Size</span>
        </button>
      </div>

      {/* Target Format */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Target Compression Codec</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
          {[
            { id: 'image/webp', label: 'WebP', tag: 'Recommended' },
            { id: 'image/avif', label: 'AVIF', tag: 'Ultra -50%' },
            { id: 'image/jpeg', label: 'MozJPEG', tag: 'Universal' },
            { id: 'image/png', label: 'PNG', tag: 'Quantized' },
          ].map(fmt => (
            <button
              key={fmt.id}
              onClick={() => {
                setFormat(fmt.id as any);
                handleApply(fmt.id as any, quality);
              }}
              className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
                format === fmt.id 
                  ? 'bg-white text-neutral-900 shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span className="font-bold">{fmt.label}</span>
              <span className="text-[8px] text-neutral-400 font-normal leading-tight text-center">{fmt.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Quality Slider (for lossy formats) */}
      {mode === 'quality' && format !== 'image/png' && (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>Compression Level</span>
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              {Math.round(quality * 100)}% Quality
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.98"
            step="0.02"
            value={quality}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setQuality(val);
              handleApply(format, val);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
            <span onClick={() => { setQuality(0.4); handleApply(format, 0.4); }} className="hover:text-neutral-900 cursor-pointer">Aggressive (40%)</span>
            <span onClick={() => { setQuality(0.75); handleApply(format, 0.75); }} className="hover:text-neutral-900 cursor-pointer">Balanced (75%)</span>
            <span onClick={() => { setQuality(0.92); handleApply(format, 0.92); }} className="hover:text-neutral-900 cursor-pointer">Lossless (92%)</span>
          </div>
        </div>
      )}

      {/* Mode 2: Target File Size (KB Solver) */}
      {mode === 'target_size' && format !== 'image/png' && (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
            <span>Maximum Target File Size</span>
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              &le; {targetKb} KB
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[100, 200, 500, 1000].map(kb => (
              <button
                key={kb}
                onClick={() => {
                  setTargetKb(kb);
                  const p = { ...getEffectiveParams(), targetKb: kb };
                  setCurrentParams(p);
                  executeActiveUtility(p);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                  targetKb === kb ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {kb >= 1000 ? `${kb/1000} MB` : `${kb} KB`}
              </button>
            ))}
          </div>
          <div className="relative pt-1">
            <input
              type="number"
              min="20"
              max="25000"
              value={targetKb}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 50;
                setTargetKb(val);
                const p = { ...getEffectiveParams(), targetKb: val };
                setCurrentParams(p);
                executeActiveUtility(p);
              }}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              placeholder="Custom limit in KB..."
            />
            <span className="absolute right-3 top-2.5 text-[10px] text-neutral-400 font-mono">KB limit</span>
          </div>
        </div>
      )}

      {/* Special PNG Quantization (TinyPNG Palette Reduction) */}
      {format === 'image/png' && (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
            <span>PNG Color Quantization (TinyPNG Mode)</span>
            <span className="font-mono text-violet-700 font-bold">{pngColors} Colors</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { colors: 64, label: '64 Colors (Mini)' },
              { colors: 128, label: '128 Colors' },
              { colors: 256, label: '256 Colors (TinyPNG)' },
            ].map(lvl => (
              <button
                key={lvl.colors}
                onClick={() => {
                  setPngColors(lvl.colors);
                  const p = { ...getEffectiveParams(), pngColors: lvl.colors };
                  setCurrentParams(p);
                  executeActiveUtility(p);
                }}
                className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer border text-center truncate ${
                  pngColors === lvl.colors ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant Presets */}
      <div>
        <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Compression Recipes</label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyPreset('image/webp', 0.82)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-left flex items-center justify-between"
          >
            <span>⚡ Lighthouse 100 SEO</span>
            <span className="text-[9px] text-neutral-400 font-mono">WebP 82%</span>
          </button>

          <button
            onClick={() => applyPreset('image/avif', 0.88)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-left flex items-center justify-between"
          >
            <span>✨ Ultra Fidelity</span>
            <span className="text-[9px] text-neutral-400 font-mono">AVIF 88%</span>
          </button>

          <button
            onClick={() => applyPreset('image/jpeg', 0.75, 300)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-left flex items-center justify-between"
          >
            <span>✉️ Email Friendly</span>
            <span className="text-[9px] text-neutral-400 font-mono">&lt; 300KB</span>
          </button>

          <button
            onClick={() => applyPreset('image/png', 1.0)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-left flex items-center justify-between"
          >
            <span>🐼 TinyPNG Diet</span>
            <span className="text-[9px] text-neutral-400 font-mono">PNG-256</span>
          </button>
        </div>
      </div>

      {/* Real-Time Savings Telemetry Card */}
      {savings && (
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Original Payload:</span>
            <span className="font-mono font-medium text-neutral-700">{formatBytes(activeImage.size)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Compressed Output:</span>
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

      {/* Direct Apply Button */}
      <button
        onClick={() => handleApply()}
        disabled={isProcessing}
        className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Compress with {format.replace('image/', '').toUpperCase()} ({mode === 'target_size' ? `≤ ${targetKb}KB` : `${Math.round(quality * 100)}%`})</span>
      </button>

      {/* Batch Compress All Images in Queue */}
      {images.length > 1 && (
        <button
          onClick={handleBatchCompressAll}
          disabled={isBatchCompressing || isProcessing}
          className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Compress All {images.length} Queue Images</span>
        </button>
      )}

      {/* Guarantee Notice */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-[10px]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>100% Client-Side. Lossless Huffman optimization and trellis quantization run in browser RAM.</span>
      </div>
    </div>
  );
};
