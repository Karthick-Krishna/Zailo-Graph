import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { Palette, Copy, Check, Download, Sparkles } from 'lucide-react';

interface ColorSwatch {
  hex: string;
  rgb: string;
  luminance: number;
}

export const PaletteControls: React.FC = () => {
  const { activeImage, executeActiveUtility } = useSession();
  const [swatchCount, setSwatchCount] = useState<number>(6);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    if (activeImage) {
      executeActiveUtility({ count: swatchCount });
    }
  }, [activeImage?.id, swatchCount]);

  if (!activeImage) return null;

  // Placeholder or extracted palette data
  const samplePalette: ColorSwatch[] = [
    { hex: '#0F172A', rgb: 'rgb(15, 23, 42)', luminance: 20 },
    { hex: '#334155', rgb: 'rgb(51, 65, 85)', luminance: 65 },
    { hex: '#64748B', rgb: 'rgb(100, 116, 139)', luminance: 110 },
    { hex: '#94A3B8', rgb: 'rgb(148, 163, 184)', luminance: 160 },
    { hex: '#CBD5E1', rgb: 'rgb(203, 213, 225)', luminance: 212 },
    { hex: '#F8FAFC', rgb: 'rgb(248, 250, 252)', luminance: 250 },
  ].slice(0, swatchCount);

  const copyCssVariables = () => {
    const css = samplePalette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    setCopiedFormat('css');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyTailwindJson = () => {
    const obj = samplePalette.reduce((acc, c, i) => {
      acc[`color-${i + 1}`] = c.hex;
      return acc;
    }, {} as Record<string, string>);
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedFormat('tailwind');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Number of Colors */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1.5">
          <span>Dominant Swatches</span>
          <span className="font-mono font-bold text-neutral-900">{swatchCount} colors</span>
        </div>
        <input
          type="range"
          min="4"
          max="8"
          value={swatchCount}
          onChange={(e) => setSwatchCount(parseInt(e.target.value))}
          className="w-full accent-neutral-900 cursor-pointer"
        />
      </div>

      {/* Extracted Swatches List */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Palette Harmonies</label>
        <div className="space-y-1.5">
          {samplePalette.map((c, idx) => (
            <div
              key={idx}
              onClick={() => {
                navigator.clipboard.writeText(c.hex);
                setCopiedFormat(`hex-${idx}`);
                setTimeout(() => setCopiedFormat(null), 1500);
              }}
              className="p-2 rounded-xl border border-neutral-200/80 hover:border-neutral-300 bg-white flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border border-black/10 shadow-sm shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <span className="font-mono text-xs font-bold text-neutral-900 block">{c.hex}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{c.rgb}</span>
                </div>
              </div>

              <div className="text-neutral-400 group-hover:text-neutral-900 p-1">
                {copiedFormat === `hex-${idx}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Export Buttons */}
      <div className="pt-2 border-t border-neutral-100 space-y-2">
        <label className="block text-xs font-semibold text-neutral-700">Developer Export</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyCssVariables}
            className="py-2 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copiedFormat === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>CSS Variables</span>
          </button>

          <button
            onClick={copyTailwindJson}
            className="py-2 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copiedFormat === 'tailwind' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Tailwind JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

