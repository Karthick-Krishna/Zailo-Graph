import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { RotateCw, FlipHorizontal, FlipVertical, Circle, Square, Sparkles, ZoomIn, Move } from 'lucide-react';

export const CropControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();
  const [isCircle, setIsCircle] = useState(true);
  const [aspectPreset, setAspectPreset] = useState<'1:1' | '4:5' | '16:9' | '9:16' | 'free'>('1:1');
  const [zoom, setZoom] = useState<number>(1.0);
  const [offsetX, setOffsetX] = useState<number>(0); // -100 to 100
  const [offsetY, setOffsetY] = useState<number>(0); // -100 to 100
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const handleApplyCrop = (
    circle = isCircle,
    preset = aspectPreset,
    z = zoom,
    ox = offsetX,
    oy = offsetY,
    rot = rotation,
    fH = flipH,
    fV = flipV
  ) => {
    let baseW = activeImage.width;
    let baseH = activeImage.height;

    if (preset === '1:1' || circle) {
      const dim = Math.min(activeImage.width, activeImage.height);
      baseW = dim;
      baseH = dim;
    } else if (preset === '4:5') {
      baseW = Math.min(activeImage.width, Math.round((activeImage.height * 4) / 5));
      baseH = Math.round((baseW * 5) / 4);
    } else if (preset === '16:9') {
      baseW = activeImage.width;
      baseH = Math.min(activeImage.height, Math.round((activeImage.width * 9) / 16));
    } else if (preset === '9:16') {
      baseH = activeImage.height;
      baseW = Math.min(activeImage.width, Math.round((activeImage.height * 9) / 16));
    }

    const targetW = Math.max(16, Math.round(baseW / z));
    const targetH = Math.max(16, Math.round(baseH / z));

    const maxOffsetX = Math.max(0, activeImage.width - targetW);
    const maxOffsetY = Math.max(0, activeImage.height - targetH);

    const centerX = maxOffsetX / 2;
    const centerY = maxOffsetY / 2;

    const startX = Math.max(0, Math.min(maxOffsetX, Math.round(centerX + (ox / 100) * centerX)));
    const startY = Math.max(0, Math.min(maxOffsetY, Math.round(centerY + (oy / 100) * centerY)));

    const params = {
      x: startX,
      y: startY,
      width: targetW,
      height: targetH,
      isCircle: circle,
      rotation: rot,
      flipH: fH,
      flipV: fV,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_crop_${isCircle}_${aspectPreset}_${zoom}_${offsetX}_${offsetY}_${rotation}_${flipH}_${flipV}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, offsetY, rotation, flipH, flipV);
    }
  }, [activeImage.id]);

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, offsetY, nextRot, flipH, flipV);
  };

  const handleFlipH = () => {
    const next = !flipH;
    setFlipH(next);
    handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, offsetY, rotation, next, flipV);
  };

  const handleFlipV = () => {
    const next = !flipV;
    setFlipV(next);
    handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, offsetY, rotation, flipH, next);
  };

  const resetPosition = () => {
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
    handleApplyCrop(isCircle, aspectPreset, 1.0, 0, 0, rotation, flipH, flipV);
  };

  return (
    <div className="space-y-4">
      {/* Mask Mode */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Mask Shape</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setIsCircle(true);
              setAspectPreset('1:1');
              handleApplyCrop(true, '1:1', zoom, offsetX, offsetY, rotation, flipH, flipV);
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isCircle 
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs' 
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Circle className="w-4 h-4 text-cyan-400" />
            <span>Circle Avatar</span>
          </button>

          <button
            onClick={() => {
              setIsCircle(false);
              handleApplyCrop(false, aspectPreset, zoom, offsetX, offsetY, rotation, flipH, flipV);
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              !isCircle 
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs' 
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Rectangle</span>
          </button>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      {!isCircle && (
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Aspect Ratio Presets</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '1:1', label: '1:1 Square' },
              { id: '4:5', label: '4:5 Portrait' },
              { id: '16:9', label: '16:9 Cinema' },
              { id: '9:16', label: '9:16 Story' },
              { id: 'free', label: 'Original' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setAspectPreset(p.id as any);
                  handleApplyCrop(false, p.id as any, zoom, offsetX, offsetY, rotation, flipH, flipV);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  aspectPreset === p.id 
                    ? 'bg-neutral-900 text-white shadow-xs' 
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Crop Zoom & Offset Controls */}
      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-700">Crop Focus & Pan</label>
          {(zoom > 1.0 || offsetX !== 0 || offsetY !== 0) && (
            <button
              onClick={resetPosition}
              className="text-[10px] text-violet-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Focus
            </button>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Crop Zoom</span>
            <span className="font-mono font-semibold">{zoom.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={zoom}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setZoom(val);
              handleApplyCrop(isCircle, aspectPreset, val, offsetX, offsetY, rotation, flipH, flipV);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
        </div>

        {zoom > 1.0 && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                <span>Pan X</span>
                <span className="font-mono">{offsetX}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={offsetX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOffsetX(val);
                  handleApplyCrop(isCircle, aspectPreset, zoom, val, offsetY, rotation, flipH, flipV);
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                <span>Pan Y</span>
                <span className="font-mono">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={offsetY}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOffsetY(val);
                  handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, val, rotation, flipH, flipV);
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rotation & Flip Controls */}
      <div className="pt-2 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
          <span>Transform Orientation</span>
          {rotation > 0 && (
            <span className="font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              Rotated {rotation}°
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleRotate}
            className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
              rotation > 0 ? 'bg-violet-50 border-violet-300 text-violet-900 font-bold' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <RotateCw className="w-4 h-4 text-violet-600" />
            <span className="text-[10px]">Rotate 90°</span>
          </button>

          <button
            onClick={handleFlipH}
            className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
              flipH ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <FlipHorizontal className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px]">{flipH ? 'Flipped H ✓' : 'Flip H'}</span>
          </button>

          <button
            onClick={handleFlipV}
            className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
              flipV ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <FlipVertical className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px]">{flipV ? 'Flipped V ✓' : 'Flip V'}</span>
          </button>
        </div>
      </div>

      {/* Direct Apply Button */}
      <button
        onClick={() => handleApplyCrop(isCircle, aspectPreset, zoom, offsetX, offsetY, rotation, flipH, flipV)}
        className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Apply {isCircle ? 'Circle Avatar Mask' : `${aspectPreset} Crop`}</span>
      </button>
    </div>
  );
};
