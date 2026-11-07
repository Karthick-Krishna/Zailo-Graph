import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { Sparkles } from 'lucide-react';

interface PresetItem {
  id: string;
  name: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'web';
  width: number;
  height: number;
  ratio: string;
}

const SOCIAL_PRESETS: PresetItem[] = [
  { id: 'ig-square', name: 'Instagram Square', platform: 'instagram', width: 1080, height: 1080, ratio: '1:1' },
  { id: 'ig-portrait', name: 'Instagram Portrait', platform: 'instagram', width: 1080, height: 1350, ratio: '4:5' },
  { id: 'ig-story', name: 'Instagram Story/Reel', platform: 'instagram', width: 1080, height: 1920, ratio: '9:16' },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', platform: 'youtube', width: 1280, height: 720, ratio: '16:9' },
  { id: 'yt-banner', name: 'YouTube Banner', platform: 'youtube', width: 2560, height: 1440, ratio: '16:9' },
  { id: 'li-post', name: 'LinkedIn Post', platform: 'linkedin', width: 1200, height: 627, ratio: '1.91:1' },
  { id: 'x-post', name: 'X / Twitter Post', platform: 'twitter', width: 1200, height: 675, ratio: '16:9' },
  { id: 'og-preview', name: 'OpenGraph Web Share', platform: 'web', width: 1200, height: 630, ratio: '1.91:1' },
];

export const SocialPresetControls: React.FC = () => {
  const { executeActiveUtility, setCurrentParams } = useSession();
  const [activePreset, setActivePreset] = useState<PresetItem>(SOCIAL_PRESETS[0]);
  const [fillMode, setFillMode] = useState<'blur' | 'color'>('blur');

  const handleApply = (preset = activePreset, fill = fillMode) => {
    const params = {
      presetWidth: preset.width,
      presetHeight: preset.height,
      fillMode: fill,
      fillColor: '#FAFAFA',
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-5">
      {/* Background Fill Style */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Canvas Padding Mode</label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => {
              setFillMode('blur');
              handleApply(activePreset, 'blur');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              fillMode === 'blur' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Smart Blur Fill</span>
          </button>
          <button
            onClick={() => {
              setFillMode('color');
              handleApply(activePreset, 'color');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              fillMode === 'color' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Solid Neutral</span>
          </button>
        </div>
      </div>

      {/* Preset Pickers */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Select Platform Preset</label>
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {SOCIAL_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset);
                  handleApply(preset, fillMode);
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-800">{preset.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {preset.width} × {preset.height} px ({preset.ratio})
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase px-2 py-0.5 bg-neutral-100 rounded-md">
                  {preset.platform}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
