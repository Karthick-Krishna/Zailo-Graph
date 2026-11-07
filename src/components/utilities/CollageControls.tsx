import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { LayoutGrid, Columns, Rows, Grid2X2 } from 'lucide-react';

export const CollageControls: React.FC = () => {
  const { images, executeActiveUtility } = useSession();
  const [layout, setLayout] = useState<'2-vert' | '2-horiz' | '3-editorial' | '4-grid'>('4-grid');
  const [gap, setGap] = useState<number>(16);
  const [radius, setRadius] = useState<number>(12);
  const [bgColor, setBgColor] = useState<string>('#FAFAFA');

  const handleApply = (newLayout = layout, newGap = gap, newRad = radius, newBg = bgColor) => {
    executeActiveUtility({
      layout: newLayout,
      gap: newGap,
      cornerRadius: newRad,
      backgroundColor: newBg,
    });
  };

  return (
    <div className="space-y-5">
      {/* Layout Presets */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Grid Architecture</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: '4-grid', label: '2×2 Quad Grid', icon: Grid2X2 },
            { id: '2-vert', label: '2-Photo Split V', icon: Columns },
            { id: '2-horiz', label: '2-Photo Split H', icon: Rows },
            { id: '3-editorial', label: '3-Photo Editorial', icon: LayoutGrid },
          ].map(item => {
            const Icon = item.icon;
            const isSelected = layout === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setLayout(item.id as any);
                  handleApply(item.id as any);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacing & Radius */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Cell Gap Spacing</span>
            <span className="font-mono">{gap} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={gap}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setGap(val);
              handleApply(layout, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Corner Border Radius</span>
            <span className="font-mono">{radius} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={radius}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRadius(val);
              handleApply(layout, gap, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>
      </div>

      {/* Canvas Background Color */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Canvas Matting Background</label>
        <div className="flex items-center gap-2">
          {['#FFFFFF', '#FAFAFA', '#E4E4E7', '#09090B', '#F59E0B'].map(c => (
            <button
              key={c}
              onClick={() => {
                setBgColor(c);
                handleApply(layout, gap, radius, c);
              }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                bgColor === c ? 'border-neutral-900 scale-110 shadow-sm' : 'border-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-[11px]">
        <span>Automatically aggregates active queue images ({images.length} available) into the layout.</span>
      </div>
    </div>
  );
};

