import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Sliders, Sun, Eye, Sparkles } from 'lucide-react';

export const SharpenControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();

  const [sharpen, setSharpen] = useState<number>(1.5);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [contrast, setContrast] = useState<number>(1.0);
  const [saturation, setSaturation] = useState<number>(1.0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [sepia, setSepia] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  const handleApply = (
    s = sharpen,
    b = brightness,
    c = contrast,
    sat = saturation,
    gray = grayscale,
    sep = sepia,
    inv = invert
  ) => {
    const params = {
      sharpen: s,
      brightness: b,
      contrast: c,
      saturation: sat,
      grayscale: gray,
      sepia: sep,
      invert: inv,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  useEffect(() => {
    if (!activeImage) return;
    const runKey = `${activeImage.id}_sharpen`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply();
    }
  }, [activeImage?.id]);

  const resetAll = () => {
    setSharpen(0);
    setBrightness(1.0);
    setContrast(1.0);
    setSaturation(1.0);
    setGrayscale(false);
    setSepia(false);
    setInvert(false);
    handleApply(0, 1.0, 1.0, 1.0, false, false, false);
  };

  return (
    <div className="space-y-5">
      {/* Sharpening Strength */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Unsharp Mask Strength</span>
          </span>
          <span className="font-mono font-bold text-neutral-900">{sharpen}x</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.25"
          value={sharpen}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setSharpen(val);
            handleApply(val);
          }}
          className="w-full accent-neutral-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>0 (Natural)</span>
          <span>1.5x (Crisp)</span>
          <span>5x (Ultra High)</span>
        </div>
      </div>

      {/* Lighting & Contrast */}
      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Brightness</span>
            <span className="font-mono">{Math.round(brightness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={brightness}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setBrightness(val);
              handleApply(sharpen, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Contrast</span>
            <span className="font-mono">{Math.round(contrast * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={contrast}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setContrast(val);
              handleApply(sharpen, brightness, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Color Saturation</span>
            <span className="font-mono">{Math.round(saturation * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={saturation}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSaturation(val);
              handleApply(sharpen, brightness, contrast, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>
      </div>

      {/* Preset Filters */}
      <div className="pt-2 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Style Toggles</label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              const next = !grayscale;
              setGrayscale(next);
              handleApply(sharpen, brightness, contrast, saturation, next, false, false);
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
              grayscale ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
            }`}
          >
            B&W Gray
          </button>

          <button
            onClick={() => {
              const next = !sepia;
              setSepia(next);
              handleApply(sharpen, brightness, contrast, saturation, false, next, false);
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
              sepia ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
            }`}
          >
            Sepia
          </button>

          <button
            onClick={() => {
              const next = !invert;
              setInvert(next);
              handleApply(sharpen, brightness, contrast, saturation, false, false, next);
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
              invert ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
            }`}
          >
            Invert
          </button>
        </div>

        <button
          onClick={resetAll}
          className="w-full mt-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition underline underline-offset-4 cursor-pointer text-center block"
        >
          Reset All Adjustments
        </button>
      </div>
    </div>
  );
};

