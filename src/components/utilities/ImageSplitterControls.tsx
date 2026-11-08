import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Grid, LayoutGrid, Check } from 'lucide-react';

export const ImageSplitterControls: React.FC = () => {
  const { executeActiveUtility, setCurrentParams } = useSession();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const applyPreset = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    const params = { rows: newRows, cols: newCols };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-4">
      {/* Popular Presets */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Preset Splits
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyPreset(3, 3)}
            className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer shadow-2xs ${
              rows === 3 && cols === 3
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <span className="block font-bold">3 × 3</span>
            <span className="text-[10px] opacity-75">Instagram (9)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(1, 3)}
            className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer shadow-2xs ${
              rows === 1 && cols === 3
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <span className="block font-bold">1 × 3</span>
            <span className="text-[10px] opacity-75">Carousel (3)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(2, 2)}
            className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer shadow-2xs ${
              rows === 2 && cols === 2
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
            }`}
          >
            <span className="block font-bold">2 × 2</span>
            <span className="text-[10px] opacity-75">4 Squares</span>
          </button>
        </div>
      </div>

      {/* Custom Rows & Columns */}
      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-neutral-700">Rows</span>
            <span className="font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
              {rows}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            value={rows}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              applyPreset(val, cols);
            }}
            className="w-full accent-violet-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-neutral-700">Columns</span>
            <span className="font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
              {cols}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            value={cols}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              applyPreset(rows, val);
            }}
            className="w-full accent-violet-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Grid Summary Badge */}
      <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-200/60 flex items-center justify-between text-xs text-violet-900">
        <span className="font-semibold">Total Slices:</span>
        <span className="font-mono font-bold bg-violet-200/80 px-2 py-0.5 rounded-full">
          {rows * cols} tiles
        </span>
      </div>
    </div>
  );
};
