import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Stamp, Grid, Move } from 'lucide-react';

export const WatermarkControls: React.FC = () => {
  const { executeActiveUtility } = useSession();

  const [text, setText] = useState('© Imazora by Zorquelz');
  const [fontSize, setFontSize] = useState(28);
  const [opacity, setOpacity] = useState(0.75);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'>('bottom-right');
  const [rotation, setRotation] = useState(0);

  const handleApply = (newPos = position, newText = text, newSize = fontSize, newOpacity = opacity, newColor = color, newRot = rotation) => {
    executeActiveUtility({
      text: newText,
      fontSize: newSize,
      opacity: newOpacity,
      color: newColor,
      position: newPos,
      rotation: newRot,
    });
  };

  return (
    <div className="space-y-5">
      {/* Watermark Text */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Watermark Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleApply(position, e.target.value);
          }}
          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          placeholder="e.g. © 2026 Zorquelz"
        />
      </div>

      {/* Font Size & Opacity */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Font Size</span>
            <span className="font-mono">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="80"
            value={fontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFontSize(val);
              handleApply(position, text, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Watermark Opacity</span>
            <span className="font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setOpacity(val);
              handleApply(position, text, fontSize, val);
            }}
            className="w-full accent-neutral-900"
          />
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Text Color</label>
        <div className="flex items-center gap-2">
          {['#FFFFFF', '#000000', '#F59E0B', '#EF4444', '#3B82F6'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                handleApply(position, text, fontSize, opacity, c);
              }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                color === c ? 'border-neutral-900 scale-110 shadow-sm' : 'border-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 9-Point Anchor Grid & Tile Pattern */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Placement Anchor</label>
        <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto p-1.5 bg-neutral-100 rounded-xl">
          {[
            { id: 'top-left', label: 'TL' },
            { id: 'top', label: 'T', disabled: true },
            { id: 'top-right', label: 'TR' },
            { id: 'left', label: 'L', disabled: true },
            { id: 'center', label: 'C' },
            { id: 'right', label: 'R', disabled: true },
            { id: 'bottom-left', label: 'BL' },
            { id: 'bottom', label: 'B', disabled: true },
            { id: 'bottom-right', label: 'BR' },
          ].map((item, idx) => {
            if (item.disabled) {
              return <div key={idx} className="w-10 h-10 rounded-lg bg-neutral-200/40" />;
            }
            const isSelected = position === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPosition(item.id as any);
                  handleApply(item.id as any);
                }}
                className={`w-10 h-10 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isSelected ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tile Repeat Button */}
        <button
          onClick={() => {
            setPosition('tile');
            handleApply('tile');
          }}
          className={`w-full mt-3 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
            position === 'tile'
              ? 'bg-neutral-900 border-neutral-900 text-white'
              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Full Diagonal Tiled Pattern (Proofing)</span>
        </button>
      </div>
    </div>
  );
};

