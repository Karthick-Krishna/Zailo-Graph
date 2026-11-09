import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Repeat, 
  FileImage,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { formatBytes, calculateSavings } from '../../utils/formatters';

export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

interface FormatOption {
  id: TargetFormat;
  label: string;
  ext: string;
  badge: string;
  description: string;
  supportsLossy: boolean;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'image/jpeg',
    label: 'JPG / JPEG',
    ext: 'jpg',
    badge: 'Universal',
    description: 'High compatibility across all operating systems, web, and printing.',
    supportsLossy: true,
  },
  {
    id: 'image/png',
    label: 'Lossless PNG',
    ext: 'png',
    badge: 'Lossless',
    description: 'Preserves full 32-bit pixel fidelity and transparent alpha channels.',
    supportsLossy: false,
  },
  {
    id: 'image/webp',
    label: 'Google WebP',
    ext: 'webp',
    badge: 'Modern Web',
    description: 'Next-gen web compression (25-35% smaller than JPEG with transparency).',
    supportsLossy: true,
  },
  {
    id: 'image/avif',
    label: 'Next-Gen AVIF',
    ext: 'avif',
    badge: 'Ultra Compact',
    description: 'Cutting-edge AV1 intra-frame codec with maximum size reduction.',
    supportsLossy: true,
  },
];

export const UniversalConverterControls: React.FC = () => {
  const { 
    images, 
    activeImage, 
    executeActiveUtility, 
    executeBatchUtility, 
    setCurrentParams, 
    isProcessing 
  } = useSession();

  // Target format state (default to JPEG/JPG as requested)
  const [toFormat, setToFormat] = useState<TargetFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.90);
  const [preserveExif, setPreserveExif] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [isBatchConverting, setIsBatchConverting] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  // Detect input image format
  const lowerName = activeImage.name.toLowerCase();
  const mimeType = (activeImage.type || '').toLowerCase();

  const isHeicInput = lowerName.endsWith('.heic') || lowerName.endsWith('.heif') || mimeType.includes('heic') || mimeType.includes('heif');
  const isWebpInput = lowerName.endsWith('.webp') || mimeType.includes('webp');
  const isPngInput = lowerName.endsWith('.png') || mimeType.includes('png');
  const isJpgInput = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || mimeType.includes('jpeg');
  const isAvifInput = lowerName.endsWith('.avif') || mimeType.includes('avif');
  const isSvgInput = lowerName.endsWith('.svg') || mimeType.includes('svg');

  const detectedSourceLabel = isHeicInput 
    ? 'Apple HEIC / HEIF'
    : isWebpInput
    ? 'Google WebP'
    : isPngInput
    ? 'Lossless PNG'
    : isJpgInput
    ? 'JPEG / JPG'
    : isAvifInput
    ? 'Next-Gen AVIF'
    : isSvgInput
    ? 'Scalable Vector (SVG)'
    : (activeImage.type || 'Raster Image');

  const getEffectiveParams = (fmt = toFormat, q = quality, bg = bgColor, exif = preserveExif) => ({
    format: fmt,
    toFormat: fmt,
    quality: q,
    bgColor: bg,
    preserveExif: exif,
  });

  const handleApply = (fmt = toFormat, q = quality, bg = bgColor, exif = preserveExif) => {
    const params = getEffectiveParams(fmt, q, bg, exif);
    setCurrentParams(params);
    executeActiveUtility(params, 'format-converter');
  };

  const handleBatchConvert = async () => {
    if (images.length === 0) return;
    setIsBatchConverting(true);
    try {
      const params = getEffectiveParams();
      await executeBatchUtility(params, 'format-converter');
    } finally {
      setIsBatchConverting(false);
    }
  };

  // Auto-run when switching active image
  useEffect(() => {
    const runKey = `${activeImage.id}_conv_${toFormat}_${quality}_${bgColor}_${preserveExif}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply(toFormat, quality, bgColor, preserveExif);
    }
  }, [activeImage.id]);

  const savings = activeImage.processedSize 
    ? calculateSavings(activeImage.size, activeImage.processedSize) 
    : null;

  const currentOption = FORMAT_OPTIONS.find(o => o.id === toFormat) || FORMAT_OPTIONS[0];

  return (
    <div className="space-y-4">
      {/* Visual Pipeline Bridge: FROM ───→ TO */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 text-white border border-neutral-800 shadow-md">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold">
            Universal Format Bridge
          </span>
          <span className="font-mono text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
            {formatBytes(activeImage.size)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
          {/* FROM */}
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">FROM</span>
            <div className="flex items-center gap-1.5 truncate">
              {isHeicInput ? (
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <FileImage className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="text-xs font-bold text-white truncate">{detectedSourceLabel}</span>
            </div>
          </div>

          {/* ARROW */}
          <div className="p-1.5 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-300 shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          {/* TO */}
          <div className="flex-1 min-w-0 text-right">
            <span className="text-[9px] font-mono uppercase text-neutral-400 block mb-0.5">TO</span>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="text-xs font-bold text-cyan-300 truncate">{currentOption.label}</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Target Format Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-700">Target Output Format</label>
          <span className="text-[10px] font-mono text-neutral-400">Select format</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = toFormat === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setToFormat(opt.id);
                  handleApply(opt.id, quality, bgColor, preserveExif);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm ring-2 ring-violet-500/30'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-xs">{opt.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected 
                      ? 'bg-violet-500/30 text-violet-200 border border-violet-400/30' 
                      : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <span className={`text-[10px] leading-tight line-clamp-2 ${
                  isSelected ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Settings (When lossy format selected) */}
      {currentOption.supportsLossy ? (
        <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              <span>Compression Quality</span>
            </label>
            <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              {Math.round(quality * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.10"
            max="1.0"
            step="0.02"
            value={quality}
            onChange={(e) => {
              const q = parseFloat(e.target.value);
              setQuality(q);
              handleApply(toFormat, q, bgColor, preserveExif);
            }}
            className="w-full accent-violet-600 cursor-pointer"
          />

          {/* Quick Quality Presets */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
            {[
              { label: 'Web (65%)', q: 0.65 },
              { label: 'Bal (80%)', q: 0.80 },
              { label: 'High (90%)', q: 0.90 },
              { label: 'Max (98%)', q: 0.98 },
            ].map(preset => (
              <button
                key={preset.q}
                onClick={() => {
                  setQuality(preset.q);
                  handleApply(toFormat, preset.q, bgColor, preserveExif);
                }}
                className={`py-1 px-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                  Math.abs(quality - preset.q) < 0.04
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/80 flex items-start gap-2.5 text-xs text-cyan-950">
          <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">100% Lossless Bit-Exact Output</span>
            <span className="text-[11px] text-cyan-800 leading-relaxed">
              PNG preserves every single pixel without compression artifacts, ideal for vector graphics, text, and transparent logos.
            </span>
          </div>
        </div>
      )}

      {/* Transparency Fill (For JPG Target) */}
      {toFormat === 'image/jpeg' && (
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700">Transparency Background Fill</span>
            <span className="text-[10px] text-neutral-400">JPG lacks alpha</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { label: 'White Fill', color: '#FFFFFF' },
              { label: 'Black Fill', color: '#000000' },
              { label: 'Light Gray', color: '#F3F4F6' },
            ].map((fill) => (
              <button
                key={fill.color}
                onClick={() => {
                  setBgColor(fill.color);
                  handleApply(toFormat, quality, fill.color, preserveExif);
                }}
                className={`py-1.5 px-2 rounded-lg border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  bgColor === fill.color
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-neutral-400 shrink-0" 
                  style={{ backgroundColor: fill.color }} 
                />
                <span className="text-[11px]">{fill.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preserve EXIF Metadata Toggle */}
      <div 
        onClick={() => {
          const next = !preserveExif;
          setPreserveExif(next);
          handleApply(toFormat, quality, bgColor, next);
        }}
        className="p-3 rounded-xl bg-white border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${preserveExif ? 'text-violet-600' : 'text-neutral-400'}`} />
          <div>
            <span className="text-xs font-semibold text-neutral-800 block">Preserve Camera Metadata</span>
            <span className="text-[10px] text-neutral-400">Keeps EXIF, capture date, and camera lens info</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={preserveExif}
          onChange={() => {}}
          className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
        />
      </div>

      {/* Action Buttons: 1-Click Convert & Batch */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => handleApply(toFormat, quality, bgColor, preserveExif)}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-md shadow-violet-900/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Convert to {currentOption.label}</span>
        </button>

        {images.length > 1 && (
          <button
            onClick={handleBatchConvert}
            disabled={isBatchConverting || isProcessing}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Batch Convert All ({images.length}) to {currentOption.ext.toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Live Result Telemetry Card */}
      {activeImage.processedSize && (
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conversion Ready</span>
            </span>
            {savings && (
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                savings.percent > 0 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-neutral-200 text-neutral-700'
              }`}>
                {savings.percent > 0 ? `-${savings.percent}%` : `+${Math.abs(savings.percent)}%`}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 pt-1">
            <span>{formatBytes(activeImage.size)}</span>
            <span>→</span>
            <span className="font-bold">{formatBytes(activeImage.processedSize)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
