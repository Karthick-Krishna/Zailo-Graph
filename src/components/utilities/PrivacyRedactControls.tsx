import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Shield, Plus, Trash2, EyeOff, Sliders } from 'lucide-react';

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
  const [selectedBoxId, setSelectedBoxId] = useState<string>('box-1');
  const [regions, setRegions] = useState<RedactBox[]>(() => {
    const w = activeImage?.width || 1000;
    const h = activeImage?.height || 1000;
    return [
      {
        id: 'box-1',
        x: Math.round(w * 0.25),
        y: Math.round(h * 0.25),
        width: Math.round(w * 0.5),
        height: Math.round(h * 0.25),
        mode: 'pixelate',
      },
    ];
  });

  if (!activeImage) return null;

  const handleApply = (activeRegions = regions) => {
    const params = {
      regions: activeRegions.map(r => ({
        x: Math.max(0, Math.min(activeImage.width, r.x)),
        y: Math.max(0, Math.min(activeImage.height, r.y)),
        width: Math.max(10, Math.min(activeImage.width - r.x, r.width)),
        height: Math.max(10, Math.min(activeImage.height - r.y, r.height)),
        mode: r.mode,
      })),
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  const addRegion = () => {
    const newId = 'box-' + (Date.now());
    const newBox: RedactBox = {
      id: newId,
      x: Math.round(activeImage.width * 0.2),
      y: Math.round(activeImage.height * 0.2),
      width: Math.min(400, Math.round(activeImage.width * 0.4)),
      height: Math.min(200, Math.round(activeImage.height * 0.25)),
      mode,
    };
    const next = [...regions, newBox];
    setRegions(next);
    setSelectedBoxId(newId);
    handleApply(next);
  };

  const removeRegion = (id: string) => {
    const next = regions.filter(r => r.id !== id);
    setRegions(next);
    if (selectedBoxId === id && next.length > 0) {
      setSelectedBoxId(next[0].id);
    }
    handleApply(next);
  };

  const updateMode = (newMode: 'pixelate' | 'blur' | 'blackout') => {
    setMode(newMode);
    const next = regions.map(r => ({ ...r, mode: newMode }));
    setRegions(next);
    handleApply(next);
  };

  const updateBoxProperty = (id: string, prop: keyof RedactBox, val: any) => {
    const next = regions.map(r => (r.id === id ? { ...r, [prop]: val } : r));
    setRegions(next);
    handleApply(next);
  };

  const applyPresetToBox = (id: string, preset: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
    const imgW = activeImage.width;
    const imgH = activeImage.height;
    let newX = 0, newY = 0, newW = 0, newH = 0;

    switch (preset) {
      case 'center':
        newW = Math.round(imgW * 0.5);
        newH = Math.round(imgH * 0.3);
        newX = Math.round((imgW - newW) / 2);
        newY = Math.round((imgH - newH) / 2);
        break;
      case 'top':
        newW = imgW;
        newH = Math.round(imgH * 0.2);
        newX = 0;
        newY = 0;
        break;
      case 'bottom':
        newW = imgW;
        newH = Math.round(imgH * 0.2);
        newX = 0;
        newY = imgH - newH;
        break;
      case 'left':
        newW = Math.round(imgW * 0.35);
        newH = imgH;
        newX = 0;
        newY = 0;
        break;
      case 'right':
        newW = Math.round(imgW * 0.35);
        newH = imgH;
        newX = imgW - newW;
        newY = 0;
        break;
    }

    const next = regions.map(r => (r.id === id ? { ...r, x: newX, y: newY, width: newW, height: newH } : r));
    setRegions(next);
    handleApply(next);
  };

  const activeBox = regions.find(r => r.id === selectedBoxId) || regions[0];

  return (
    <div className="space-y-4">
      {/* Redaction Style Mode */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Default Redaction Style</label>
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

      {/* Redacted Regions Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-700">Protected Areas ({regions.length})</label>
          <button
            onClick={addRegion}
            className="text-[11px] font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {regions.map((reg, idx) => (
            <button
              key={reg.id}
              onClick={() => setSelectedBoxId(reg.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                selectedBoxId === reg.id
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
              }`}
            >
              <span>Zone #{idx + 1}</span>
              {regions.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRegion(reg.id);
                  }}
                  className="hover:text-red-400 p-0.5 rounded cursor-pointer"
                  title="Remove zone"
                >
                  &times;
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Zone Editor */}
        {activeBox && (
          <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-neutral-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">
                Zone Parameters ({activeBox.width}×{activeBox.height}px)
              </span>
              <select
                value={activeBox.mode}
                onChange={(e) => updateBoxProperty(activeBox.id, 'mode', e.target.value)}
                className="text-[11px] font-medium bg-white border border-neutral-300 rounded-md px-2 py-0.5"
              >
                <option value="pixelate">Pixelate</option>
                <option value="blur">Blur</option>
                <option value="blackout">Blackout</option>
              </select>
            </div>

            {/* Quick Position Presets */}
            <div>
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-1">Preset Placement</span>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'center', label: 'Center' },
                  { id: 'top', label: 'Header' },
                  { id: 'bottom', label: 'Footer' },
                  { id: 'left', label: 'Left' },
                  { id: 'right', label: 'Right' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetToBox(activeBox.id, p.id as any)}
                    className="py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-[10px] font-medium text-neutral-700 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-neutral-500 font-medium block">X Position (px)</label>
                <input
                  type="number"
                  min="0"
                  max={activeImage.width}
                  value={activeBox.x}
                  onChange={(e) => updateBoxProperty(activeBox.id, 'x', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white rounded border border-neutral-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 font-medium block">Y Position (px)</label>
                <input
                  type="number"
                  min="0"
                  max={activeImage.height}
                  value={activeBox.y}
                  onChange={(e) => updateBoxProperty(activeBox.id, 'y', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white rounded border border-neutral-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 font-medium block">Width (px)</label>
                <input
                  type="number"
                  min="10"
                  max={activeImage.width}
                  value={activeBox.width}
                  onChange={(e) => updateBoxProperty(activeBox.id, 'width', parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1 bg-white rounded border border-neutral-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 font-medium block">Height (px)</label>
                <input
                  type="number"
                  min="10"
                  max={activeImage.height}
                  value={activeBox.height}
                  onChange={(e) => updateBoxProperty(activeBox.id, 'height', parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1 bg-white rounded border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Guarantee Notice */}
      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Irreversible Client-Side Redaction</span>
        </div>
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Directly destroys raw pixel data within browser memory. Exported files contain zero hidden layers or reversible metadata.
        </p>
      </div>
    </div>
  );
};
