import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Lock, Unlock, Percent, Maximize2, Sparkles, Layers, Sliders } from 'lucide-react';

export const ResizeControls: React.FC = () => {
  const { images, activeImage, executeActiveUtility, executeBatchUtility, setCurrentParams, isProcessing } = useSession();

  const [width, setWidth] = useState<number>(activeImage?.width || 1920);
  const [height, setHeight] = useState<number>(activeImage?.height || 1080);
  const [scalePercent, setScalePercent] = useState<number>(75);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [mode, setMode] = useState<'percent' | 'exact'>('percent');
  const [resampleMethod, setResampleMethod] = useState<'lanczos3' | 'bicubic' | 'pixel_art'>('lanczos3');
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [isBatchApplying, setIsBatchApplying] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const currentW = mode === 'percent' ? Math.max(1, Math.round((activeImage.width * scalePercent) / 100)) : width;
  const currentH = mode === 'percent' ? Math.max(1, Math.round((activeImage.height * scalePercent) / 100)) : height;

  const getEffectiveParams = (overrideW = currentW, overrideH = currentH) => ({
    width: overrideW,
    height: overrideH,
    scalePercent: mode === 'percent' ? scalePercent : undefined,
    resampleMethod,
    format,
    quality,
  });

  const handleApplyResize = (w = currentW, h = currentH) => {
    const params = getEffectiveParams(w, h);
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    let newH = height;
    if (lockAspect && activeImage.width > 0) {
      newH = Math.max(1, Math.round((activeImage.height * val) / activeImage.width));
      setHeight(newH);
    }
    handleApplyResize(val, newH);
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    let newW = width;
    if (lockAspect && activeImage.height > 0) {
      newW = Math.max(1, Math.round((activeImage.width * val) / activeImage.height));
      setWidth(newW);
    }
    handleApplyResize(newW, val);
  };

  const handleScaleChange = (percent: number) => {
    setScalePercent(percent);
    const newW = Math.max(1, Math.round((activeImage.width * percent) / 100));
    const newH = Math.max(1, Math.round((activeImage.height * percent) / 100));
    setWidth(newW);
    setHeight(newH);
    const params = {
      width: newW,
      height: newH,
      scalePercent: percent,
      resampleMethod,
      format,
      quality,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
    setMode('exact');
    handleApplyResize(presetW, presetH);
  };

  const handleBatchResizeAll = async () => {
    if (images.length === 0) return;
    setIsBatchApplying(true);
    try {
      const params = getEffectiveParams();
      await executeBatchUtility(params);
    } finally {
      setIsBatchApplying(false);
    }
  };

  // Auto-run when image or tool mounts
  useEffect(() => {
    const runKey = `${activeImage.id}_resize_init`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleScaleChange(75);
    }
  }, [activeImage.id]);

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        <button
          onClick={() => setMode('percent')}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'percent' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Scale %</span>
        </button>
        <button
          onClick={() => setMode('exact')}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'exact' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Exact Pixels</span>
        </button>
      </div>

      {mode === 'percent' ? (
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>Scale Multiplier</span>
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              {scalePercent}% &rarr; {currentW} × {currentH} px
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="250"
            step="5"
            value={scalePercent}
            onChange={(e) => handleScaleChange(parseInt(e.target.value))}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
            <span onClick={() => handleScaleChange(25)} className="hover:text-neutral-900 cursor-pointer">25%</span>
            <span onClick={() => handleScaleChange(50)} className="hover:text-neutral-900 cursor-pointer">50%</span>
            <span onClick={() => handleScaleChange(75)} className="hover:text-neutral-900 cursor-pointer font-bold text-neutral-700">75%</span>
            <span onClick={() => handleScaleChange(100)} className="hover:text-neutral-900 cursor-pointer">100% (1x)</span>
            <span onClick={() => handleScaleChange(200)} className="hover:text-neutral-900 cursor-pointer">200% (2x)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Target Width</label>
              <div className="relative">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                />
                <span className="absolute right-2.5 top-1.5 text-[10px] text-neutral-400 font-mono">px</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Target Height</label>
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                />
                <span className="absolute right-2.5 top-1.5 text-[10px] text-neutral-400 font-mono">px</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              lockAspect 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-white border-dashed border-neutral-300 text-neutral-500'
            }`}
          >
            {lockAspect ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{lockAspect ? 'Constrain Aspect Ratio (Locked)' : 'Freeform Aspect Ratio (Unlocked)'}</span>
          </button>
        </div>
      )}

      {/* Resampling Filter Algorithm */}
      <div>
        <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Resample Algorithm</span>
        </label>
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-100 rounded-lg text-[10px] font-semibold">
          {[
            { id: 'lanczos3', label: 'Lanczos3 Smooth' },
            { id: 'bicubic', label: 'Bicubic High' },
            { id: 'pixel_art', label: 'Nearest Pixel' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setResampleMethod(m.id as any);
                handleApplyResize();
              }}
              className={`py-1.5 px-1 rounded-md text-center transition cursor-pointer truncate ${
                resampleMethod === m.id ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format & Quality */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Output Format</label>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as any);
              handleApplyResize();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-neutral-900 bg-white"
          >
            <option value="image/webp">WebP (Modern)</option>
            <option value="image/jpeg">JPEG (Photo)</option>
            <option value="image/png">PNG (Lossless)</option>
          </select>
        </div>
        {format !== 'image/png' && (
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-neutral-700 mb-1">
              <span>Quality</span>
              <span className="font-mono text-violet-700 font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => {
                setQuality(parseFloat(e.target.value));
                handleApplyResize();
              }}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Instant Preset Buttons */}
      <div>
        <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Standard Resolutions</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: '4K UHD', w: 3840, h: 2160 },
            { label: '1080p FHD', w: 1920, h: 1080 },
            { label: '720p HD', w: 1280, h: 720 },
            { label: 'Square 1:1', w: 1080, h: 1080 },
            { label: 'Web 800×600', w: 800, h: 600 },
            { label: 'Icon 512×512', w: 512, h: 512 },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.w, p.h)}
              className="py-1.5 px-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[10px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center truncate"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Apply Button */}
      <button
        onClick={() => handleApplyResize()}
        disabled={isProcessing}
        className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Maximize2 className="w-3.5 h-3.5 text-white" />
        <span>Resize to {currentW} × {currentH} px</span>
      </button>

      {/* Batch Apply across entire queue if multiple images uploaded */}
      {images.length > 1 && (
        <button
          onClick={handleBatchResizeAll}
          disabled={isBatchApplying || isProcessing}
          className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Apply to All {images.length} Queue Images</span>
        </button>
      )}
    </div>
  );
};
