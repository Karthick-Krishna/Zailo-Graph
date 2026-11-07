import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Lock, Unlock, Percent, Maximize2 } from 'lucide-react';

export const ResizeControls: React.FC = () => {
  const { activeImage, executeActiveUtility } = useSession();

  const [width, setWidth] = useState<number>(activeImage?.width || 1920);
  const [height, setHeight] = useState<number>(activeImage?.height || 1080);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [mode, setMode] = useState<'percent' | 'exact'>('percent');

  if (!activeImage) return null;

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && activeImage.width > 0) {
      setHeight(Math.round((activeImage.height * val) / activeImage.width));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && activeImage.height > 0) {
      setWidth(Math.round((activeImage.width * val) / activeImage.height));
    }
  };

  const handleScaleChange = (percent: number) => {
    setScalePercent(percent);
    setWidth(Math.round((activeImage.width * percent) / 100));
    setHeight(Math.round((activeImage.height * percent) / 100));
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
    setMode('exact');
    executeActiveUtility({ width: presetW, height: presetH });
  };

  return (
    <div className="space-y-5">
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        <button
          onClick={() => setMode('percent')}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'percent' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Scale %</span>
        </button>
        <button
          onClick={() => setMode('exact')}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'exact' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Exact Pixels</span>
        </button>
      </div>

      {mode === 'percent' ? (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span>Scale Factor</span>
            <span className="font-mono text-neutral-900 font-bold">{scalePercent}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={scalePercent}
            onChange={(e) => handleScaleChange(parseInt(e.target.value))}
            className="w-full accent-neutral-900"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>25% (Tiny)</span>
            <span>100% (Original)</span>
            <span>200% (2x)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              lockAspect 
                ? 'bg-neutral-50 border-neutral-300 text-neutral-800' 
                : 'bg-white border-dashed border-neutral-300 text-neutral-400'
            }`}
          >
            {lockAspect ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{lockAspect ? 'Aspect Ratio Locked' : 'Freeform Aspect Ratio'}</span>
          </button>
        </div>
      )}

      {/* Common Presets */}
      <div>
        <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Common Resolution Presets</label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => applyPreset(3840, 2160)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            4K UHD
          </button>
          <button
            onClick={() => applyPreset(1920, 1080)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            1080p FHD
          </button>
          <button
            onClick={() => applyPreset(1280, 720)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            720p HD
          </button>
          <button
            onClick={() => applyPreset(1080, 1080)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            Square 1:1
          </button>
          <button
            onClick={() => applyPreset(800, 600)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            SVGA 800×600
          </button>
          <button
            onClick={() => applyPreset(512, 512)}
            className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 border border-neutral-200 transition cursor-pointer text-center"
          >
            Icon 512×512
          </button>
        </div>
      </div>
    </div>
  );
};

