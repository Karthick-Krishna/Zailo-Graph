import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';

export const RotateFlipControls: React.FC = () => {
  const { executeActiveUtility, setCurrentParams } = useSession();
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const applyChanges = (newAngle: number, newFlipH: boolean, newFlipV: boolean) => {
    const params = { angle: newAngle, flipH: newFlipH, flipV: newFlipV };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const rotateBy = (delta: number) => {
    const newAngle = (angle + delta + 360) % 360;
    setAngle(newAngle);
    applyChanges(newAngle, flipH, flipV);
  };

  const toggleFlipH = () => {
    const next = !flipH;
    setFlipH(next);
    applyChanges(angle, next, flipV);
  };

  const toggleFlipV = () => {
    const next = !flipV;
    setFlipV(next);
    applyChanges(angle, flipH, next);
  };

  return (
    <div className="space-y-4">
      {/* 90-degree Quick Rotations */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Quick 90° Rotations
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => rotateBy(-90)}
            className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
            <span>90° Left</span>
          </button>
          <button
            type="button"
            onClick={() => rotateBy(90)}
            className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-600" />
            <span>90° Right</span>
          </button>
        </div>
      </div>

      {/* Mirror Flips */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Mirror Flip
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleFlipH}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition active:scale-95 ${
              flipH
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Horizontal</span>
          </button>
          <button
            type="button"
            onClick={toggleFlipV}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition active:scale-95 ${
              flipV
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Fine Angle Slider */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-neutral-700">Arbitrary Rotation</span>
          <span className="font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
            {angle}°
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={angle}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setAngle(val);
            applyChanges(val, flipH, flipV);
          }}
          className="w-full accent-violet-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>
    </div>
  );
};

