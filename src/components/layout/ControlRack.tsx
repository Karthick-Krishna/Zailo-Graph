import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { UTILITIES } from '../../types/utility';
import { formatBytes, calculateSavings } from '../../utils/formatters';
import { Play, Download } from 'lucide-react';

export const ControlRack: React.FC = () => {
  const { activeImage, activeUtilityId, executeActiveUtility, downloadImage, sendToUtility, isProcessing } = useSession();

  // Compression state
  const [compressFormat, setCompressFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [compressQuality, setCompressQuality] = useState<number>(0.85);

  // Resize state
  const [resizeWidth, setResizeWidth] = useState<number>(activeImage?.width || 1920);
  const [resizeHeight, setResizeHeight] = useState<number>(activeImage?.height || 1080);
  const [scalePercent, setScalePercent] = useState<number>(100);

  // Watermark state
  const [watermarkText, setWatermarkText] = useState<string>('© Imazora by Zorquelz');
  const [watermarkSize, setWatermarkSize] = useState<number>(32);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.7);

  // Filter state
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);
  const [sharpen, setSharpen] = useState<number>(1);

  // Avatar state
  const [isCircleCrop, setIsCircleCrop] = useState<boolean>(true);

  if (!activeImage) {
    return (
      <aside className="w-80 h-full bg-white border-l border-neutral-200/80 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-neutral-400">Select or drop an image to configure utility parameters.</p>
      </aside>
    );
  }

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];

  const handleExecute = async () => {
    if (activeUtilityId === 'compression') {
      await executeActiveUtility({ format: compressFormat, quality: compressQuality });
    } else if (activeUtilityId === 'batch-resize') {
      await executeActiveUtility({ width: resizeWidth, height: resizeHeight, scalePercent });
    } else if (activeUtilityId === 'watermark') {
      await executeActiveUtility({
        text: watermarkText,
        fontSize: watermarkSize,
        opacity: watermarkOpacity,
        position: 'bottom-right',
        color: '#FFFFFF',
        rotation: 0,
      });
    } else if (activeUtilityId === 'avatar-crop') {
      const minDim = Math.min(activeImage.width, activeImage.height);
      await executeActiveUtility({
        x: Math.round((activeImage.width - minDim) / 2),
        y: Math.round((activeImage.height - minDim) / 2),
        width: minDim,
        height: minDim,
        isCircle: isCircleCrop,
      });
    } else if (activeUtilityId === 'sharpen-enhance') {
      await executeActiveUtility({ brightness, contrast, saturation: 1, sharpen });
    }
  };

  const savings = activeImage.processedSize ? calculateSavings(activeImage.size, activeImage.processedSize) : null;

  return (
    <aside className="w-84 h-full bg-white border-l border-neutral-200/80 flex flex-col justify-between overflow-y-auto">
      {/* Top Section: Active Tool Parameters */}
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tool Parameters</span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              WASM Engine
            </span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            {activeUtility.name}
          </h3>
        </div>

        {/* Compression Controls */}
        {activeUtilityId === 'compression' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">Target Format</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                {(['image/webp', 'image/jpeg', 'image/png'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setCompressFormat(fmt)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      compressFormat === fmt ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
                <span>Quality Level</span>
                <span className="font-mono text-neutral-900 font-bold">{Math.round(compressQuality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={compressQuality}
                onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                className="w-full accent-neutral-900"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>Maximum Savings</span>
                <span>Visually Lossless</span>
              </div>
            </div>

            {savings && (
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Original Size:</span>
                  <span className="font-mono text-neutral-700">{formatBytes(activeImage.size)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-900">Output Size:</span>
                  <span className="font-mono text-emerald-600">
                    {formatBytes(activeImage.processedSize!)} ({savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Batch Resize Controls */}
        {activeUtilityId === 'batch-resize' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
                <span>Scale Percentage</span>
                <span className="font-mono text-neutral-900 font-bold">{scalePercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={scalePercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setScalePercent(val);
                  setResizeWidth(Math.round((activeImage.width * val) / 100));
                  setResizeHeight(Math.round((activeImage.height * val) / 100));
                }}
                className="w-full accent-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={resizeWidth}
                  onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={resizeHeight}
                  onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Avatar & Cropper Controls */}
        {activeUtilityId === 'avatar-crop' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs font-semibold text-neutral-800">Circular Mask</span>
              <button
                onClick={() => setIsCircleCrop(!isCircleCrop)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isCircleCrop ? 'bg-neutral-900' : 'bg-neutral-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isCircleCrop ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Exports as transparent PNG avatar ready for profiles, Slack, Discord, and Google.
            </p>
          </div>
        )}

        {/* Watermarking Controls */}
        {activeUtilityId === 'watermark' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Font Size</span>
                <span className="font-mono">{watermarkSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="96"
                value={watermarkSize}
                onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Opacity</span>
                <span className="font-mono">{Math.round(watermarkOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>
          </div>
        )}

        {/* Sharpen & Enhancement Controls */}
        {activeUtilityId === 'sharpen-enhance' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Sharpen Strength</span>
                <span className="font-mono">{sharpen}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={sharpen}
                onChange={(e) => setSharpen(parseFloat(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Brightness</span>
                <span className="font-mono">{brightness}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Contrast</span>
                <span className="font-mono">{contrast}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>
          </div>
        )}

        {/* EXIF Viewer Mode */}
        {activeUtilityId === 'exif-viewer' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-800">Extracted Camera Metadata</h4>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Camera:</span>
                <span className="font-semibold text-neutral-800">
                  {activeImage.metadata.camera?.make} {activeImage.metadata.camera?.model || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Lens:</span>
                <span className="font-semibold text-neutral-800 truncate max-w-[150px]">
                  {activeImage.metadata.camera?.lens || 'Standard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ISO:</span>
                <span className="font-semibold text-neutral-800">
                  {activeImage.metadata.camera?.iso || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shutter:</span>
                <span className="font-semibold text-neutral-800">
                  {activeImage.metadata.camera?.shutterSpeed || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GPS:</span>
                <span className="font-semibold text-neutral-800">
                  {activeImage.metadata.gps ? `${activeImage.metadata.gps.latitude?.toFixed(4)}, ${activeImage.metadata.gps.longitude?.toFixed(4)}` : 'No GPS Tag'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Rack & "Send To..." Workflow Bus */}
      <div className="p-6 border-t border-neutral-200/80 bg-neutral-50/50 space-y-3">
        {/* Process Button */}
        <button
          onClick={handleExecute}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <span>Computing in Worker...</span>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Apply Transformation</span>
            </>
          )}
        </button>

        {/* Download Button (when result exists) */}
        {activeImage.processedBlob && (
          <button
            onClick={() => downloadImage(activeImage.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Result ({formatBytes(activeImage.processedSize!)})</span>
          </button>
        )}

        {/* Connected Workflow "Send to..." Menu */}
        {activeImage.processedBlob && (
          <div className="pt-2 border-t border-neutral-200/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Continue Workflow in...
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => sendToUtility('watermark')}
                className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 transition truncate cursor-pointer text-left"
              >
                &rarr; Watermarking
              </button>
              <button
                onClick={() => sendToUtility('avatar-crop')}
                className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 transition truncate cursor-pointer text-left"
              >
                &rarr; Circular Crop
              </button>
              <button
                onClick={() => sendToUtility('batch-resize')}
                className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 transition truncate cursor-pointer text-left"
              >
                &rarr; Resize
              </button>
              <button
                onClick={() => sendToUtility('social-presets')}
                className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 transition truncate cursor-pointer text-left"
              >
                &rarr; Social Preset
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
