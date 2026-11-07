import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { Camera, Zap, Sliders, Shield, SunMedium } from 'lucide-react';

export const CameraRawControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();
  const { user, openAuthModal } = useAuth();

  const [engineMode, setEngineMode] = useState<'fast_preview' | 'sensor_demosaic'>('fast_preview');
  const [exposureEv, setExposureEv] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(5500); // Kelvin
  const [tint, setTint] = useState<number>(0);
  const [highlightRecovery, setHighlightRecovery] = useState<boolean>(true);

  if (!activeImage) return null;

  const handleApply = (mode = engineMode, ev = exposureEv, temp = temperature) => {
    if (!user) {
      openAuthModal('pro_feature', 'camera-raw', 'Camera RAW Studio is completely free on Imazora. Sign in with email to process Canon CR2/CR3, Nikon NEF, Sony ARW, and Adobe DNG files!');
      return;
    }

    const params = {
      engineMode: mode,
      exposureEv: ev,
      temperature: temp,
      tint,
      highlightRecovery,
    };

    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-5">
      {/* Engine Selection */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">RAW Decoding Engine</label>
        <div className="space-y-2">
          <button
            onClick={() => {
              setEngineMode('fast_preview');
              handleApply('fast_preview');
            }}
            className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${engineMode === 'fast_preview'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
              }`}
          >
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-900">Embedded Camera Preview (&lt; 50 ms)</div>
              <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                Extracts the full-resolution preview JPEG embedded by the camera hardware processor. Near-instantaneous.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setEngineMode('sensor_demosaic');
              handleApply('sensor_demosaic');
            }}
            className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${engineMode === 'sensor_demosaic'
                ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
              }`}
          >
            <Camera className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span>LibRaw 14-Bit Sensor Demosaic</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">WASM</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                Full AHD Bayer pattern reconstruction with custom exposure recovery.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Sensor Controls (Only for demosaicing mode) */}
      {engineMode === 'sensor_demosaic' && (
        <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Exposure Compensation</span>
              <span className="font-mono">{exposureEv > 0 ? `+${exposureEv}` : exposureEv} EV</span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.25"
              value={exposureEv}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setExposureEv(val);
                handleApply(engineMode, val);
              }}
              className="w-full accent-neutral-900"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Color Temperature</span>
              <span className="font-mono">{temperature} K</span>
            </div>
            <input
              type="range"
              min="2800"
              max="9500"
              step="100"
              value={temperature}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTemperature(val);
                handleApply(engineMode, exposureEv, val);
              }}
              className="w-full accent-neutral-900"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>2800K (Tungsten)</span>
              <span>5500K (Daylight)</span>
              <span>8500K (Shade)</span>
            </div>
          </div>
        </div>
      )}

      {/* Format Support Badge */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800">
          <Shield className="w-3.5 h-3.5 text-neutral-500" />
          <span>Supported RAW Formats</span>
        </div>
        <p className="text-[10px] text-neutral-500">
          Canon (`.cr2`, `.cr3`), Nikon (`.nef`), Sony (`.arw`), Fujifilm (`.raf`), Adobe Digital Negative (`.dng`), Olympus (`.orf`).
        </p>
      </div>
    </div>
  );
};

