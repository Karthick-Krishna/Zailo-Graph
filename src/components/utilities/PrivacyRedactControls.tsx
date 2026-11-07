import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { EyeOff, Shield, Plus, Trash2, Check } from 'lucide-react';

interface RedactBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mode: 'blur' | 'pixelate' | 'blackout';
}

export const PrivacyRedactControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();

  const [mode, setMode] = useState<'pixelate' | 'blur' | 'blackout'>('pixelate');
  const [regions, setRegions] = useState<RedactBox[]>([
    { id: 'box-1', x: 100, y: 100, width: 250, height: 120, mode: 'pixelate' },
  ]);

  if (!activeImage) return null;

  const handleApply = (activeRegions = regions) => {
    const params = {
      regions: activeRegions.map(r => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        mode: r.mode,
      })),
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const addRegion = () => {
    const newBox: RedactBox = {
      id: 'box-' + (regions.length + 1),
      x: Math.round(activeImage.width / 4),
      y: Math.round(activeImage.height / 4),
      width: Math.min(300, Math.round(activeImage.width / 2)),
      height: Math.min(150, Math.round(activeImage.height / 3)),
      mode,
    };
    const next = [...regions, newBox];
    setRegions(next);
    handleApply(next);
  };

  const removeRegion = (id: string) => {
    const next = regions.filter(r => r.id !== id);
    setRegions(next);
    handleApply(next);
  };

  const updateMode = (newMode: 'pixelate' | 'blur' | 'blackout') => {
    setMode(newMode);
    const next = regions.map(r => ({ ...r, mode: newMode }));
    setRegions(next);
    handleApply(next);
  };

  return (
    <div className="space-y-5">
      {/* Redaction Style Mode */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Redaction Style</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
          {[
            { id: 'pixelate', label: 'Pixelate' },
            { id: 'blur', label: 'Blur' },
            { id: 'blackout', label: 'Blackout' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => updateMode(m.id as any)}
              className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                mode === m.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Redacted Regions List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-700">Protected Areas ({regions.length})</label>
          <button
            onClick={addRegion}
            className="text-[11px] font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Box</span>
          </button>
        </div>

        <div className="space-y-2">
          {regions.map((reg, idx) => (
            <div
              key={reg.id}
              className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-neutral-800">Zone #{idx + 1}</span>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  {reg.width}×{reg.height} px at ({reg.x}, {reg.y}) • {reg.mode}
                </span>
              </div>
              <button
                onClick={() => removeRegion(reg.id)}
                className="p-1 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                title="Remove redaction zone"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Guarantee Notice */}
      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Destructive Pixel Eradication</span>
        </div>
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Unlike reversible CSS blur overlays, Imazora irreversibly scrambles the underlying pixel array in raw WASM memory before export.
        </p>
      </div>
    </div>
  );
};

