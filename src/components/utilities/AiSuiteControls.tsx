import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Sparkles, Cpu, Zap, ShieldCheck, Loader2, Info } from 'lucide-react';
import { detectAiCapabilities, AiSystemCapabilities } from '../../utils/aiCapabilities';

export const AiSuiteControls: React.FC = () => {
  const { activeImage, activeUtilityId, executeActiveUtility, setCurrentParams, isProcessing } = useSession();

  // Engine selection: Instant local heuristic vs ONNX Neural Web
  const [engineMode, setEngineMode] = useState<'heuristic' | 'onnx'>('heuristic');
  const [capabilities, setCapabilities] = useState<AiSystemCapabilities | null>(null);

  // Background Removal State (Utility 09)
  const [bgFeather, setBgFeather] = useState<number>(4);
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'gray'>('transparent');

  // Upscale State (Utility 08)
  const [upscaleScale, setUpscaleScale] = useState<number>(2);
  const [upscaleModel, setUpscaleModel] = useState<'photo' | 'anime'>('photo');

  // Inpainting State (Utility 18)
  const [brushSize, setBrushSize] = useState<number>(36);

  // Colorization State (Utility 17)
  const [colorIntensity, setColorIntensity] = useState<number>(85);
  const [colorTone, setColorTone] = useState<'neutral' | 'warm' | 'cool'>('neutral');

  const initialRunRef = useRef<string | null>(null);

  useEffect(() => {
    detectAiCapabilities().then(setCapabilities);
  }, []);

  if (!activeImage) return null;

  const handleApplyAi = (overrideParams?: any) => {
    const params = {
      engineMode,
      bgFeather,
      bgMode,
      upscaleScale,
      upscaleModel,
      brushSize,
      colorIntensity,
      colorTone,
      ...(overrideParams || {}),
    };

    setCurrentParams(params);
    executeActiveUtility(params);
  };

  // Auto-run when tool mounts or switches so user immediately sees the live preview result
  useEffect(() => {
    const runKey = `${activeImage.id}_${activeUtilityId}_${engineMode}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApplyAi();
    }
  }, [activeUtilityId, activeImage.id, engineMode]);

  return (
    <div className="space-y-5">
      {/* Hardware Runtime Telemetry */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-medium">Browser Inference Backend:</span>
          {capabilities?.hasWebGPU ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>WebGPU Hardware</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 text-[10px]">
              <Cpu className="w-3 h-3 text-cyan-600" />
              <span>WebAssembly (WASM)</span>
            </span>
          )}
        </div>
        {capabilities?.gpuAdapterName && (
          <p className="text-[10px] text-neutral-400 font-mono truncate">
            Device: {capabilities.gpuAdapterName}
          </p>
        )}
      </div>

      {/* Engine Selection */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Processing Pipeline</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setEngineMode('heuristic');
              handleApplyAi({ engineMode: 'heuristic' });
            }}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              engineMode === 'heuristic'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant Heuristic</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">0MB download • Fast WASM math</p>
          </button>

          <button
            onClick={() => {
              setEngineMode('onnx');
              handleApplyAi({ engineMode: 'onnx' });
            }}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              engineMode === 'onnx'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Cpu className="w-3.5 h-3.5 text-violet-600" />
              <span>ONNX Web (AI)</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Client-side neural inference</p>
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
                  onClick={() => {
                    setBgMode(b.id as any);
                    handleApplyAi({ bgMode: b.id });
                  }}
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
              max="15"
              value={bgFeather}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setBgFeather(val);
                handleApplyAi({ bgFeather: val });
              }}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              {engineMode === 'heuristic'
                ? 'Local Algorithmic Mode: Evaluates perimeter edge pixels, centroid foreground weights, and applies smooth alpha transitions.'
                : 'ONNX Neural Mode: Runs client-side salient segmentation in browser memory via ONNX Runtime Web.'}
            </span>
          </div>
        </div>
      )}

      {/* Utility 08: 4x Super-Resolution */}
      {activeUtilityId === 'ai-upscale' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Upscaling Factor</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setUpscaleScale(2);
                  handleApplyAi({ upscaleScale: 2 });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleScale === 2 ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                2× Resolution
              </button>
              <button
                onClick={() => {
                  setUpscaleScale(4);
                  handleApplyAi({ upscaleScale: 4 });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleScale === 4 ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                4× Super-Resolution
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Target Optimization</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => {
                  setUpscaleModel('photo');
                  handleApplyAi({ upscaleModel: 'photo' });
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleModel === 'photo' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Photo / Detail
              </button>
              <button
                onClick={() => {
                  setUpscaleModel('anime');
                  handleApplyAi({ upscaleModel: 'anime' });
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                  upscaleModel === 'anime' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Graphic / Art
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              {engineMode === 'heuristic'
                ? 'Multi-stage Lanczos3 and bicubic resampling with unsharp-mask high-frequency detail synthesis.'
                : 'ONNX Web local super-resolution tensor evaluation via WebGPU / WASM.'}
            </span>
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
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setBrushSize(val);
                handleApplyAi({ brushSize: val });
              }}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              Applies bi-directional Navier-Stokes spatial pixel diffusion and edge blending across masked coordinates.
            </span>
          </div>
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
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setColorIntensity(val);
                handleApplyAi({ colorIntensity: val });
              }}
              className="w-full accent-neutral-900 cursor-pointer"
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
                  onClick={() => {
                    setColorTone(t.id as any);
                    handleApplyAi({ colorTone: t.id });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    colorTone === t.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              Calculates luminance distribution histograms and synthesizes perceptual chromaticity values locally.
            </span>
          </div>
        </div>
      )}

      {/* Run Trigger */}
      <button
        onClick={() => handleApplyAi()}
        disabled={isProcessing}
        className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Processing In-Browser...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Re-Run Processing</span>
          </>
        )}
      </button>

      {/* Privacy Guarantee */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>100% Client-Side. Images never leave your device. Zero external cloud servers.</span>
      </div>
    </div>
  );
};
