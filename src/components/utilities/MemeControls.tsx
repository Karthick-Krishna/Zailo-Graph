import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Type, Sparkles } from 'lucide-react';

export const MemeControls: React.FC = () => {
  const { executeActiveUtility, setCurrentParams } = useSession();
  const [topText, setTopText] = useState('WHEN YOU FIND');
  const [bottomText, setBottomText] = useState('THE PERFECT TOOL');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [allCaps, setAllCaps] = useState(true);

  const applyMeme = (overrides?: any) => {
    const params = {
      topText,
      bottomText,
      fontSize,
      fontColor,
      strokeColor,
      strokeWidth,
      allCaps,
      ...overrides,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-4">
      {/* Top Text Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Top Caption
        </label>
        <input
          type="text"
          value={topText}
          onChange={(e) => {
            setTopText(e.target.value);
            applyMeme({ topText: e.target.value });
          }}
          placeholder="TOP CAPTION"
          className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
        />
      </div>

      {/* Bottom Text Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
          Bottom Caption
        </label>
        <input
          type="text"
          value={bottomText}
          onChange={(e) => {
            setBottomText(e.target.value);
            applyMeme({ bottomText: e.target.value });
          }}
          placeholder="BOTTOM CAPTION"
          className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
        />
      </div>

      {/* Typography Controls */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-neutral-700">Font Size</span>
          <span className="font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
            {fontSize}px
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="96"
          value={fontSize}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setFontSize(val);
            applyMeme({ fontSize: val });
          }}
          className="w-full accent-violet-600 cursor-pointer"
        />
      </div>

      {/* Colors & Stroke */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
        <div>
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value);
                applyMeme({ fontColor: e.target.value });
              }}
              className="w-7 h-7 rounded border border-neutral-300 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-neutral-600 uppercase font-semibold">{fontColor}</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Outline Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                applyMeme({ strokeColor: e.target.value });
              }}
              className="w-7 h-7 rounded border border-neutral-300 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-neutral-600 uppercase font-semibold">{strokeColor}</span>
          </div>
        </div>
      </div>

      {/* All Caps Switch */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
        <span className="text-neutral-700 font-medium">Force UPPERCASE (Meme style)</span>
        <input
          type="checkbox"
          checked={allCaps}
          onChange={(e) => {
            setAllCaps(e.target.checked);
            applyMeme({ allCaps: e.target.checked });
          }}
          className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
        />
      </div>
    </div>
  );
};

