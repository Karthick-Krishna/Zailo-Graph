import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { RotateCw, FlipHorizontal, FlipVertical, Circle, Square, Sparkles } from 'lucide-react';

export const CropControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();
  const [isCircle, setIsCircle] = useState(true);
  const [aspectPreset, setAspectPreset] = useState<'1:1' | '4:5' | '16:9' | '9:16' | 'free'>('1:1');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const handleApplyCrop = (
    circle = isCircle,
    preset = aspectPreset,
    rot = rotation,
    fH = flipH,
    fV = flipV
  ) => {
    let targetW = activeImage.width;
    let targetH = activeImage.height;

    if (preset === '1:1' || circle) {
      const dim = Math.min(activeImage.width, activeImage.height);
      targetW = dim;
      targetH = dim;
    } else if (preset === '4:5') {
      targetW = Math.min(activeImage.width, Math.round((activeImage.height * 4) / 5));
      targetH = Math.round((targetW * 5) / 4);
    } else if (preset === '16:9') {
      targetW = activeImage.width;
      targetH = Math.min(activeImage.height, Math.round((activeImage.width * 9) / 16));
    } else if (preset === '9:16') {
      targetH = activeImage.height;
      targetW = Math.min(activeImage.width, Math.round((activeImage.height * 9) / 16));
    }

    const startX = Math.max(0, Math.round((activeImage.width - targetW) / 2));
    const startY = Math.max(0, Math.round((activeImage.height - targetH) / 2));

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

  // Automatically execute crop on mount / image load so preview updates immediately
  useEffect(() => {
    const runKey = `${activeImage.id}_crop_${isCircle}_${aspectPreset}_${rotation}_${flipH}_${flipV}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApplyCrop(isCircle, aspectPreset, rotation, flipH, flipV);
    }
  }, [activeImage.id]);

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    handleApplyCrop(isCircle, aspectPreset, nextRot, flipH, flipV);
  };

  const handleFlipH = () => {
    const next = !flipH;
    setFlipH(next);
    handleApplyCrop(isCircle, aspectPreset, rotation, next, flipV);
  };

  const handleFlipV = () => {
    const next = !flipV;
    setFlipV(next);
    handleApplyCrop(isCircle, aspectPreset, rotation, flipH, next);
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
              handleApplyCrop(true, '1:1', rotation, flipH, flipV);
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
              handleApplyCrop(false, aspectPreset, rotation, flipH, flipV);
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

      {/* Standard Aspect Presets */}
      {!isCircle && (
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Aspect Ratio Presets</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '1:1', label: '1:1 Square' },
              { id: '4:5', label: '4:5 Portrait' },
              { id: '16:9', label: '16:9 Cinema' },
              { id: '9:16', label: '9:16 Story' },
              { id: 'free', label: 'Original Ratio' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setAspectPreset(p.id as any);
                  handleApplyCrop(false, p.id as any, rotation, flipH, flipV);
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

      {/* Rotation & Flip Controls */}
      <div>
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
        onClick={() => handleApplyCrop(isCircle, aspectPreset, rotation, flipH, flipV)}
        className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Apply {isCircle ? 'Circle Avatar Mask' : `${aspectPreset} Crop`}</span>
      </button>
    </div>
  );
};
