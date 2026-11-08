import React from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES } from '../../types/utility';
import { formatBytes } from '../../utils/formatters';
import { 
  Play, 
  Download, 
  X, 
  Sliders, 
  Sparkles, 
  Maximize2, 
  FileDown, 
  Smartphone, 
  Repeat, 
  FileCode2, 
  PenTool, 
  Zap, 
  Eraser, 
  Crop, 
  Share2, 
  Stamp, 
  LayoutGrid, 
  Palette, 
  IdCard, 
  SunMedium, 
  Wand2, 
  FileSearch, 
  ShieldCheck, 
  EyeOff, 
  AppWindow, 
  Binary, 
  FileCode, 
  Camera,
  Lock
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Maximize2,
  FileDown,
  Smartphone,
  Repeat,
  FileCode2,
  PenTool,
  Zap,
  Eraser,
  Sliders,
  Crop,
  Share2,
  Stamp,
  LayoutGrid,
  Palette,
  IdCard,
  SunMedium,
  Wand2,
  FileSearch,
  ShieldCheck,
  EyeOff,
  AppWindow,
  Binary,
  FileCode,
  Camera,
};

// Modular Utility Controls
import { ResizeControls } from '../utilities/ResizeControls';
import { CompressionControls } from '../utilities/CompressionControls';
import { HeicControls } from '../utilities/HeicControls';
import { WebpToRasterControls } from '../utilities/WebpToRasterControls';
import { RasterToWebpControls } from '../utilities/RasterToWebpControls';
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
import { RecipeControls } from '../utilities/RecipeControls';
import { RotateFlipControls } from '../utilities/RotateFlipControls';
import { MemeControls } from '../utilities/MemeControls';
import { ImageSplitterControls } from '../utilities/ImageSplitterControls';

interface ControlRackProps {
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const ControlRack: React.FC<ControlRackProps> = ({
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const { activeImage, activeUtilityId, executeActiveUtility, downloadImage, sendToUtility, isProcessing } = useSession();
  const { isUtilityUnlocked, openAuthModal } = useAuth();

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  const containerClasses = isMobileDrawer
    ? "w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col justify-between overflow-y-auto border-t border-neutral-200 animate-in slide-in-from-bottom duration-200 relative z-30"
    : "hidden md:flex w-80 lg:w-88 h-full bg-white border-l border-neutral-200 flex-col justify-between overflow-y-auto shrink-0 relative z-20 shadow-xs";

  if (!activeImage) {
    if (activeUtilityId === 'base64-to-image') {
      return (
        <aside className={containerClasses}>
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Settings</span>
                <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80 uppercase">
                  {activeUtility.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {activeUtility.name}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                {activeUtility.description}
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100">
              <Base64Controls />
            </div>
          </div>
        </aside>
      );
    }
    return (
      <aside className="w-full md:w-84 h-full bg-white border-l border-neutral-200/80 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-neutral-400">Select or drop an image to configure utility parameters.</p>
      </aside>
    );
  }

  const renderActiveControls = () => {
    switch (activeUtilityId) {
      case 'workflow-recipes':
        return <RecipeControls />;
      case 'batch-resize':
        return <ResizeControls />;
      case 'compression':
        return <CompressionControls />;
      case 'heic-converter':
        return <HeicControls />;
      case 'webp-to-raster':
        return <WebpToRasterControls />;
      case 'raster-to-webp':
        return <RasterToWebpControls />;
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
      case 'rotate-flip':
        return <RotateFlipControls />;
      case 'meme-generator':
        return <MemeControls />;
      case 'image-splitter':
        return <ImageSplitterControls />;
      default:
        return (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center">
            <p className="text-xs text-neutral-500">Configure parameters for {activeUtility.name}</p>
          </div>
        );
    }
  };

  return (
    <aside className={containerClasses}>
      {/* Top Section: Active Tool Parameters */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Mobile Pull Handle & Close Header */}
        {isMobileDrawer && (
          <div className="flex flex-col items-center pb-3 border-b border-neutral-100">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 mb-2"></div>
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-neutral-900">Adjust Settings</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Close mobile controls"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Studio Active Tool Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-neutral-800">
            {React.createElement(ICON_MAP[activeUtility.icon] || Sparkles, { className: "w-5 h-5 text-cyan-400" })}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-200/60">
                {activeUtility.category}
              </span>
              {activeUtility.badge && (
                <span className="text-[9px] font-mono text-neutral-400 px-1 py-0.5 rounded bg-neutral-100 border border-neutral-200/60 uppercase">
                  {activeUtility.badge}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight truncate">
              {activeUtility.name}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
              {activeUtility.description}
            </p>
          </div>
        </div>

        {/* Dynamic Tool Controls or Pro Lock Message */}
        <div className="pt-2 border-t border-neutral-100">
          {!isUnlocked ? (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">
                  {activeUtility.name} is a Pro Feature
                </h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed max-w-xs mx-auto">
                  Sign in with Google to unlock instant, unrestricted access to all 14 Pro features. 100% Free forever.
                </p>
              </div>
              <button
                onClick={() => openAuthModal('pro_feature', activeUtilityId)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Unlock for Free</span>
              </button>
            </div>
          ) : (
            renderActiveControls()
          )}
        </div>
      </div>

      {/* Bottom Action Rack & "Send To..." Workflow Bus - 100% Solid Pure White */}
      <div className={`p-4 sm:p-5 pb-8 sm:pb-5 border-t border-neutral-200 bg-white space-y-2.5 relative z-10 shrink-0 ${
        isMobileDrawer ? 'sticky bottom-0 bg-white/95 backdrop-blur-md shadow-lg' : ''
      }`}>
        {!isUnlocked ? (
          <button
            onClick={() => openAuthModal('pro_feature', activeUtilityId)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>Unlock {activeUtility.name} (Pro)</span>
          </button>
        ) : (
          /* Process Button - Vibrant, punchy, active primary CTA */
          <button
            onClick={() => {
              executeActiveUtility();
              if (isMobileDrawer && onCloseMobile) {
                // On mobile, keep drawer or let user inspect result
              }
            }}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2 text-white font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping"></span>
                <span>Processing with WebAssembly...</span>
              </span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold">Apply Transformation</span>
              </>
            )}
          </button>
        )}

        {/* Download Button (when result exists) */}
        {activeImage.processedBlob && (
          <button
            onClick={() => downloadImage(activeImage.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs transition shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Result ({formatBytes(activeImage.processedSize!)})</span>
          </button>
        )}

        {/* Connected Workflow "Send to..." Menu */}
        {activeImage.processedBlob && (
          <div className="pt-2 border-t border-neutral-200">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Continue Workflow in...
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => sendToUtility('watermark')}
                className="py-2 px-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200 text-[11px] font-semibold text-neutral-800 transition truncate cursor-pointer text-left shadow-2xs hover:border-neutral-300 active:scale-[0.98]"
              >
                &rarr; Watermark
              </button>
              <button
                onClick={() => sendToUtility('avatar-crop')}
                className="py-2 px-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200 text-[11px] font-semibold text-neutral-800 transition truncate cursor-pointer text-left shadow-2xs hover:border-neutral-300 active:scale-[0.98]"
              >
                &rarr; Circular Crop
              </button>
              <button
                onClick={() => sendToUtility('batch-resize')}
                className="py-2 px-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200 text-[11px] font-semibold text-neutral-800 transition truncate cursor-pointer text-left shadow-2xs hover:border-neutral-300 active:scale-[0.98]"
              >
                &rarr; Batch Resize
              </button>
              <button
                onClick={() => sendToUtility('social-presets')}
                className="py-2 px-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200 text-[11px] font-semibold text-neutral-800 transition truncate cursor-pointer text-left shadow-2xs hover:border-neutral-300 active:scale-[0.98]"
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
