import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { RotateCw, FlipHorizontal, FlipVertical, Circle, Square } from 'lucide-react';

export const CropControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();
  const [isCircle, setIsCircle] = useState(false);
  const [aspectPreset, setAspectPreset] = useState<'1:1' | '4:5' | '16:9' | '9:16' | 'free'>('1:1');

  if (!activeImage) return null;

  const handleApplyCrop = (circle = isCircle, preset = aspectPreset) => {
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
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-5">
      {/* Mask Mode */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Mask Shape</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setIsCircle(true);
              setAspectPreset('1:1');
              handleApplyCrop(true, '1:1');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isCircle 
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Circle Avatar</span>
          </button>

          <button
            onClick={() => {
              setIsCircle(false);
              handleApplyCrop(false, aspectPreset);
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              !isCircle 
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
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
          <label className="block text-xs font-semibold text-neutral-700 mb-2">Aspect Ratio Presets</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '1:1', label: '1:1 Square' },
              { id: '4:5', label: '4:5 Portrait' },
              { id: '16:9', label: '16:9 Cinema' },
              { id: '9:16', label: '9:16 Story' },
              { id: 'free', label: 'Free Aspect' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setAspectPreset(p.id as any);
                  handleApplyCrop(false, p.id as any);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  aspectPreset === p.id 
                    ? 'bg-neutral-900 text-white shadow-sm' 
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
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Transform Orientation</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleApplyCrop(isCircle, aspectPreset)}
            className="py-2 px-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 flex flex-col items-center gap-1 transition cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[10px]">Rotate 90°</span>
          </button>
          <button
            onClick={() => handleApplyCrop(isCircle, aspectPreset)}
            className="py-2 px-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 flex flex-col items-center gap-1 transition cursor-pointer"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="text-[10px]">Flip H</span>
          </button>
          <button
            onClick={() => handleApplyCrop(isCircle, aspectPreset)}
            className="py-2 px-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 flex flex-col items-center gap-1 transition cursor-pointer"
          >
            <FlipVertical className="w-4 h-4" />
            <span className="text-[10px]">Flip V</span>
          </button>
        </div>
      </div>
    </div>
  );
};

