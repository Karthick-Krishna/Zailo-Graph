import React from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES } from '../../types/utility';
import { formatBytes } from '../../utils/formatters';
import { Play, Download } from 'lucide-react';

// Modular Utility Controls
import { ResizeControls } from '../utilities/ResizeControls';
import { CompressionControls } from '../utilities/CompressionControls';
import { CropControls } from '../utilities/CropControls';
import { SocialPresetControls } from '../utilities/SocialPresetControls';
import { WatermarkControls } from '../utilities/WatermarkControls';
import { SharpenControls } from '../utilities/SharpenControls';
import { PaletteControls } from '../utilities/PaletteControls';
import { PassportPhotoControls } from '../utilities/PassportPhotoControls';
import { ExifControls } from '../utilities/ExifControls';
import { PrivacyRedactControls } from '../utilities/PrivacyRedactControls';
import { FaviconStudioControls } from '../utilities/FaviconStudioControls';
import { Base64Controls } from '../utilities/Base64Controls';
import { SvgControls } from '../utilities/SvgControls';
import { CollageControls } from '../utilities/CollageControls';
import { CameraRawControls } from '../utilities/CameraRawControls';
import { AiSuiteControls } from '../utilities/AiSuiteControls';

export const ControlRack: React.FC = () => {
  const { activeImage, activeUtilityId, executeActiveUtility, downloadImage, sendToUtility, isProcessing } = useSession();
  const { isUtilityUnlocked } = useAuth();

  if (!activeImage) {
    return (
      <aside className="w-84 h-full bg-white border-l border-neutral-200/80 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-neutral-400">Select or drop an image to configure utility parameters.</p>
      </aside>
    );
  }

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  const renderActiveControls = () => {
    switch (activeUtilityId) {
      case 'batch-resize':
        return <ResizeControls />;
      case 'compression':
      case 'webp-to-raster':
      case 'raster-to-webp':
      case 'heic-converter':
        return <CompressionControls />;
      case 'avatar-crop':
        return <CropControls />;
      case 'social-presets':
        return <SocialPresetControls />;
      case 'watermark':
        return <WatermarkControls />;
      case 'sharpen-enhance':
        return <SharpenControls />;
      case 'color-palette':
        return <PaletteControls />;
      case 'passport-photo':
        return <PassportPhotoControls />;
      case 'exif-viewer':
      case 'exif-remover':
        return <ExifControls />;
      case 'privacy-redact':
        return <PrivacyRedactControls />;
      case 'favicon-studio':
        return <FaviconStudioControls />;
      case 'image-to-base64':
      case 'base64-to-image':
        return <Base64Controls />;
      case 'svg-to-png':
      case 'png-to-svg':
        return <SvgControls />;
      case 'collage-maker':
        return <CollageControls />;
      case 'camera-raw':
        return <CameraRawControls />;
      case 'ai-bg-removal':
      case 'ai-upscale':
      case 'ai-inpainting':
      case 'ai-colorization':
        return <AiSuiteControls />;
      default:
        return (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center">
            <p className="text-xs text-neutral-500">Configure parameters for {activeUtility.name}</p>
          </div>
        );
    }
  };

  return (
    <aside className="w-84 h-full bg-white border-l border-neutral-200/80 flex flex-col justify-between overflow-y-auto">
      {/* Top Section: Active Tool Parameters */}
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active Utility</span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Local Sandbox
            </span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            {activeUtility.name}
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
            {activeUtility.description}
          </p>
        </div>

        {/* Dynamic Tool Controls */}
        <div className="pt-2 border-t border-neutral-100">
          {renderActiveControls()}
        </div>
      </div>

      {/* Bottom Action Rack & "Send To..." Workflow Bus */}
      <div className="p-6 border-t border-neutral-200/80 bg-neutral-50/50 space-y-3">
        {/* Process Button */}
        <button
          onClick={() => executeActiveUtility({})}
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
                &rarr; Watermark
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
                &rarr; Batch Resize
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
