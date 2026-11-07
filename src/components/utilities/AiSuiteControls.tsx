import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Cpu, Cloud, Eraser, Zap, SunMedium, Wand2, ShieldCheck, Check } from 'lucide-react';

export const AiSuiteControls: React.FC = () => {
  const { activeImage, activeUtilityId, executeActiveUtility } = useSession();
  const { tier, openAuthModal } = useAuth();

  // Execution Hardware Provider
  const [hardwareProvider, setHardwareProvider] = useState<'webgpu' | 'cloud'>('webgpu');

  // Background Removal State (Utility 09)
  const [bgFeather, setBgFeather] = useState<number>(2);
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'gray'>('transparent');

  // Upscale State (Utility 08)
  const [upscaleScale, setUpscaleScale] = useState<number>(4);
  const [upscaleModel, setUpscaleModel] = useState<'photo' | 'anime'>('photo');
  const [denoiseStrength, setDenoiseStrength] = useState<number>(50);

  // Inpainting State (Utility 18)
  const [brushSize, setBrushSize] = useState<number>(36);

  // Colorization State (Utility 17)
  const [colorIntensity, setColorIntensity] = useState<number>(85);
  const [colorTone, setColorTone] = useState<'neutral' | 'warm' | 'cool'>('neutral');

  if (!activeImage) return null;

  const handleApplyAi = () => {
    if (tier === 'guest') {
      openAuthModal('pro_feature', activeUtilityId, 'This AI model is completely free on Imazora. Create a free account to run it directly on your hardware!');
      return;
    }

    executeActiveUtility({
      provider: hardwareProvider,
      bgFeather,
      bgMode,
      upscaleScale,
      upscaleModel,
      denoiseStrength,
      brushSize,
      colorIntensity,
      colorTone,
    });
  };

  return (
    <div className="space-y-5">
      {/* Hardware Acceleration Provider */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Compute Runtime Engine</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHardwareProvider('webgpu')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              hardwareProvider === 'webgpu'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Local WebGPU</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Runs on device GPU (100% Private)</p>
          </button>

          <button
            onClick={() => setHardwareProvider('cloud')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              hardwareProvider === 'cloud'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Ephemeral Cloud</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Volatile RAM pipe (Zero disk write)</p>
          </button>
        </div>
      </div>

      {/* Utility 09: Background Removal */}
      {activeUtilityId === 'ai-bg-removal' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Background Replacement</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              {[
                { id: 'transparent', label: 'Transparent' },
                { id: 'white', label: 'Studio White' },
                { id: 'gray', label: 'Neutral Gray' },
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBgMode(b.id as any)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    bgMode === b.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Edge Feathering Radius</span>
              <span className="font-mono">{bgFeather} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={bgFeather}
              onChange={(e) => setBgFeather(parseInt(e.target.value))}
              className="w-full accent-neutral-900"
            />
          </div>
        </div>
      )}

      {/* Utility 08: 4x Super-Resolution */}
      {activeUtilityId === 'ai-upscale' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Upscaling Multiplier</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUpscaleScale(2)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleScale === 2 ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                2× Resolution (2K/4K)
              </button>
              <button
                onClick={() => setUpscaleScale(4)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleScale === 4 ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                4× Super-Resolution (8K)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Model Architecture</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => setUpscaleModel('photo')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleModel === 'photo' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Real-ESRGAN Photo
              </button>
              <button
                onClick={() => setUpscaleModel('anime')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleModel === 'anime' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Illustration / Anime
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Utility 18: Object Removal & Inpainting */}
      {activeUtilityId === 'ai-inpainting' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Mask Brush Diameter</span>
              <span className="font-mono">{brushSize} px</span>
            </div>
            <input
              type="range"
              min="12"
              max="120"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full accent-neutral-900"
            />
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Paint directly on unwanted objects or watermarks on the canvas. LaMa will fill the area contextually.
          </p>
        </div>
      )}

      {/* Utility 17: B&W Colorization */}
      {activeUtilityId === 'ai-colorization' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Color Saturation Vibrancy</span>
              <span className="font-mono">{colorIntensity}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="120"
              value={colorIntensity}
              onChange={(e) => setColorIntensity(parseInt(e.target.value))}
              className="w-full accent-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Color Temperature Calibration</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              {[
                { id: 'neutral', label: 'Neutral' },
                { id: 'warm', label: 'Warm Vintage' },
                { id: 'cool', label: 'Cool Modern' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setColorTone(t.id as any)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    colorTone === t.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Run Trigger */}
      <button
        onClick={handleApplyAi}
        className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Run AI Model Inference</span>
      </button>

      {/* Model Weight & Privacy Guarantee */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>Quantized ONNX models are cached locally in your browser storage. Zero inference data is shared.</span>
      </div>
    </div>
  );
};
