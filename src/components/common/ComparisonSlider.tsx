import React, { useState, useRef, useCallback, useEffect } from 'react';
import { formatBytes, formatDimensions, calculateSavings } from '../../utils/formatters';
import { useSession } from '../../context/SessionContext';
import { InteractiveCropOverlay } from './InteractiveCropOverlay';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowLeftRight, 
  Columns, 
  Eye, 
  Sparkles, 
  SplitSquareVertical,
  Sun,
  Moon,
  Search,
  Crop,
  Undo2,
  Redo2,
  Crosshair,
  Maximize2
} from 'lucide-react';

export type ViewMode = 'slider' | 'side_by_side' | 'result' | 'original';

interface ComparisonSliderProps {
  originalUrl: string;
  processedUrl?: string;
  originalSize: number;
  processedSize?: number;
  originalWidth?: number;
  originalHeight?: number;
  processedWidth?: number;
  processedHeight?: number;
  imageName: string;
  activeUtilityId?: string;
  format?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  originalWidth = 1000,
  originalHeight = 1000,
  processedWidth,
  processedHeight,
  imageName,
  activeUtilityId,
}) => {
  const { 
    currentParams, 
    setCurrentParams, 
    executeActiveUtility, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useSession();

  // Pixel Inspection Loupe State
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupeZoom, setLoupeZoom] = useState<2 | 4>(2);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [imageScreenRect, setImageScreenRect] = useState<DOMRect | null>(null);

  // Interactive Crop Mode State
  const isCropTool = activeUtilityId === 'avatar-crop';
  const [showCropHandles, setShowCropHandles] = useState(isCropTool);

  useEffect(() => {
    setShowCropHandles(activeUtilityId === 'avatar-crop');
  }, [activeUtilityId]);

  // Determine if aspect ratios differ significantly
  const isAspectMismatched = Boolean(
    processedWidth && 
    processedHeight && 
    originalWidth &&
    originalHeight &&
    Math.abs((originalWidth / originalHeight) - (processedWidth / processedHeight)) > 0.05
  );

  const isCropOrMaskTool = 
    activeUtilityId === 'avatar-crop' || 
    activeUtilityId === 'passport-photo' || 
    activeUtilityId === 'social-presets' ||
    activeUtilityId === 'collage-maker';

  const isUpscaleTool = activeUtilityId === 'ai-upscale';
  const isBgRemovalTool = activeUtilityId === 'ai-bg-removal';

  // Default view mode: for crops or masks or aspect mismatch, default to 'result'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (isCropOrMaskTool || isAspectMismatched) return 'result';
    return 'slider';
  });

  // Corporate light canvas vs dark studio toggle
  const [canvasTheme, setCanvasTheme] = useState<'light' | 'dark'>('light');

  // Concept 1: Ambient Adaptive Aura (Reactive Backlight)
  const [showAura, setShowAura] = useState<boolean>(true);

  const [isPeekingOriginal, setIsPeekingOriginal] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  
  // Ref on the actual image frame for accurate pixel-to-pixel split wipe
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Loupe hotkeys: Z toggles loupe, X switches zoom level
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key.toLowerCase() === 'z' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsLoupeActive(prev => !prev);
      }
      if (e.key.toLowerCase() === 'x' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setLoupeZoom(prev => prev === 2 ? 4 : 2);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Auto-switch away from split slider if aspect ratio changes so outputs never look smashed or letterboxed
  useEffect(() => {
    if (isAspectMismatched || isCropOrMaskTool) {
      if (viewMode === 'slider') {
        setViewMode('result');
      }
    }
  }, [activeUtilityId, isAspectMismatched, isCropOrMaskTool, viewMode]);

  // Spacebar hotkey to hold and peek original image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && processedUrl && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsPeekingOriginal(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsPeekingOriginal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [processedUrl]);

  const updateSliderFromEvent = (clientX: number) => {
    const frame = imageFrameRef.current || containerRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.altKey || (zoomLevel > 1 && e.shiftKey)) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }

    if (viewMode === 'slider') {
      setIsDragging(true);
      updateSliderFromEvent(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    setLoupePos({ x: e.clientX, y: e.clientY });

    // Measure frame for loupe tracking
    const frame = imageFrameRef.current;
    if (frame) {
      const rect = frame.getBoundingClientRect();
      setImageScreenRect(rect);
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      setIsHoveringImage(isInside);
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (isDragging && viewMode === 'slider') {
      updateSliderFromEvent(e.clientX);
    }
  }, [isDragging, isPanning, viewMode]);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  const togglePixelInspection = () => {
    if (zoomLevel >= 2) {
      resetZoom();
    } else {
      setZoomLevel(2.5);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const savings = processedSize ? calculateSavings(originalSize, processedSize) : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-1 sm:p-2 overflow-hidden select-none">
      {/* Top Floating Control Islands (Linear / Figma Studio Hierarchy) */}
      <div className="z-20 w-full max-w-7xl px-2 mb-2 shrink-0 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        
        {/* Island 1: File Telemetry & Quick Undo/Redo */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-2xs text-xs shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 font-medium text-neutral-800">
            <span className="font-semibold truncate max-w-[75px] min-[360px]:max-w-[100px] sm:max-w-[160px] tracking-tight">{imageName}</span>
            <span className="text-neutral-300">|</span>
            <span className="font-mono text-neutral-500 text-[10px] sm:text-[11px]">{formatBytes(originalSize)}</span>
          </div>

          {processedSize && (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 border-l border-neutral-200">
              <span className="text-neutral-400 font-bold text-[10px] sm:text-xs">&rarr;</span>
              <span className="font-mono text-neutral-900 font-semibold text-[10px] sm:text-[11px]">
                {formatBytes(processedSize)}
              </span>
              {savings && (
                <span className={`font-mono text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-md font-semibold ${
                  savings.isSaved 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                    : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`}
                </span>
              )}
            </div>
          )}

          {/* Inline Undo / Redo (Hidden on mobile as it is already in Header) */}
          <div className="hidden sm:flex items-center gap-0.5 pl-1.5 border-l border-neutral-200">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              title="Undo transformation (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              title="Redo transformation (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Island 2: Mode Selector Segmented Control */}
        <div className="flex items-center gap-0.5 p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-2xs text-xs shrink-0">
          {!isAspectMismatched ? (
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'slider' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
              }`}
              title="Split comparison wipe slider"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
          ) : null}

          <button
            onClick={() => setViewMode('result')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'result' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
            }`}
            title="Show Processed Result"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Result</span>
          </button>

          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'side_by_side' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
            }`}
            title="Side-by-side comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'original' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
            }`}
            title="Show Original"
          >
            <span className="hidden sm:inline">Original</span>
          </button>

          {/* Interactive Canvas Crop Toggle (When Crop tool active) */}
          {isCropTool && (
            <button
              onClick={() => setShowCropHandles(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ml-1 border ${
                showCropHandles
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border-neutral-200'
              }`}
              title="Toggle Interactive Draggable Crop Overlay on Canvas"
            >
              <Crop className="w-3 h-3 text-cyan-300" />
              <span>Crop Box</span>
            </button>
          )}
        </div>

        {/* Island 3: Optics, Inspection & Viewport Controls */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-2xs text-xs shrink-0">
          {/* Pixel Inspection Loupe (2× / 4× Magnifier) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLoupeActive(prev => !prev)}
              className={`px-2 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                isLoupeActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border-neutral-200'
              }`}
              title="Toggle Pixel Inspection Loupe (Hotkey: Z)"
            >
              <Search className="w-3 h-3 text-cyan-400" />
              <span>Loupe</span>
            </button>

            {isLoupeActive && (
              <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-mono">
                <button
                  onClick={() => setLoupeZoom(2)}
                  className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                    loupeZoom === 2 ? 'bg-white text-blue-700 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  2×
                </button>
                <button
                  onClick={() => setLoupeZoom(4)}
                  className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                    loupeZoom === 4 ? 'bg-white text-blue-700 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  4×
                </button>
              </div>
            )}
          </div>

          {/* 1:1 Pixel Inspection Button */}
          <button
            onClick={togglePixelInspection}
            className={`px-2 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
              zoomLevel >= 2
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border-neutral-200'
            }`}
            title="Inspect 1:1 actual pixel resolution (100% scale)"
          >
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span className="hidden sm:inline">{zoomLevel >= 2 ? 'Exit 100%' : '1:1'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-neutral-200">
            <button 
              onClick={zoomOut}
              className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-600 px-1 min-w-[34px] text-center font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={zoomIn}
              className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={resetZoom}
              className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button 
              onClick={resetZoom}
              className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg transition cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Canvas Backdrop Theme Toggle (Light Corporate vs Dark Studio) */}
          <div className="flex items-center gap-1 pl-1 border-l border-neutral-200">
            <button
              onClick={() => setCanvasTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer border border-neutral-200"
              title={canvasTheme === 'light' ? 'Switch to Dark Studio Canvas' : 'Switch to Light Corporate Canvas'}
            >
              {canvasTheme === 'light' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </button>

            {/* Concept 1: Ambient Adaptive Aura Toggle */}
            <button
              onClick={() => setShowAura(prev => !prev)}
              className={`p-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                showAura
                  ? 'bg-neutral-900 border-neutral-900 text-cyan-300 shadow-2xs'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-400 border-neutral-200'
              }`}
              title="Toggle Ambient Adaptive Aura"
            >
              <span className={`block w-2 h-2 rounded-full ${showAura ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-400'}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={`relative w-full flex-1 max-w-7xl min-h-[460px] overflow-hidden rounded-2xl select-none flex items-center justify-center touch-none transition-colors duration-200 ${
          canvasTheme === 'light' 
            ? 'bg-[#F4F4F6]/80 backdrop-blur-md border border-neutral-300/80 shadow-xs' 
            : 'bg-neutral-950/85 backdrop-blur-md border border-neutral-800 shadow-xl'
        } ${
          viewMode === 'slider' ? 'cursor-ew-resize' : zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          backgroundImage: canvasTheme === 'light'
            ? 'radial-gradient(#d1d5db 1px, transparent 1px), radial-gradient(#d1d5db 1px, #f4f4f6 1px)'
            : 'radial-gradient(#27272a 1px, transparent 1px), radial-gradient(#27272a 1px, #09090b 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* Concept 1: Ambient Adaptive Aura (Dynamic Reactive Backlight from image) */}
        {showAura && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div 
              className={`w-4/5 h-4/5 max-w-5xl max-h-[80vh] rounded-full blur-[72px] transform scale-110 transition-all duration-700 pointer-events-none ${
                canvasTheme === 'light' ? 'opacity-50 saturate-200' : 'opacity-70 saturate-150'
              }`}
              style={{
                backgroundImage: `url(${processedUrl || originalUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(54px) contrast(1.2)',
              }}
            />
          </div>
        )}

        {/* VIEW MODE 1: SPLIT SLIDER */}
        {viewMode === 'slider' && (
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 transition-transform duration-75"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            <div 
              ref={imageFrameRef}
              className={`relative inline-flex items-center justify-center max-w-full max-h-full rounded-xl overflow-hidden shadow-xl border ${
                canvasTheme === 'light' ? 'border-neutral-300/80' : 'border-white/10'
              }`}
              style={{
                aspectRatio: `${originalWidth} / ${originalHeight}`,
              }}
            >
              <img
                src={originalUrl}
                alt="Original Preview"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {processedUrl && (
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ 
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  }}
                >
                  <img
                    src={processedUrl}
                    alt="Processed Result"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Glowing Draggable & Keyboard-Accessible Split Handle Line */}
              {processedUrl && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-sm pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div
                    role="slider"
                    aria-label="Image comparison split slider"
                    aria-valuenow={Math.round(sliderPosition)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSliderPosition(prev => Math.max(0, prev - (e.shiftKey ? 10 : 2)));
                      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSliderPosition(prev => Math.min(100, prev + (e.shiftKey ? 10 : 2)));
                      } else if (e.key === 'Home') {
                        e.preventDefault();
                        setSliderPosition(0);
                      } else if (e.key === 'End') {
                        e.preventDefault();
                        setSliderPosition(100);
                      }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-white cursor-ew-resize transform transition-transform hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none active:scale-95 shadow-md pointer-events-auto touch-none"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>

            {/* Badges on Top Corners */}
            <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border shadow-2xs backdrop-blur-md ${
              canvasTheme === 'light' ? 'bg-white/90 text-neutral-800 border-neutral-200' : 'bg-black/80 text-white border-white/10'
            }`}>
              Original: {originalWidth}×{originalHeight} px
            </span>
            {processedWidth && (
              <span className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border shadow-2xs backdrop-blur-md ${
                canvasTheme === 'light' ? 'bg-white/90 text-neutral-900 border-neutral-300 font-semibold' : 'bg-neutral-900/90 text-cyan-300 border-white/15'
              }`}>
                Result: {processedWidth}×{processedHeight} px
              </span>
            )}
          </div>
        )}

        {/* VIEW MODE 2: SIDE BY SIDE */}
        {viewMode === 'side_by_side' && (
          <div 
            className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center transition-transform duration-75 overflow-auto"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            {/* Original Panel */}
            <div className={`flex flex-col items-center justify-center w-full h-full max-h-full rounded-xl p-3 border relative overflow-hidden ${
              canvasTheme === 'light' ? 'bg-white/70 border-neutral-200' : 'bg-black/40 border-white/10'
            }`}>
              <span className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border backdrop-blur-md ${
                canvasTheme === 'light' ? 'bg-white/90 text-neutral-800 border-neutral-200' : 'bg-black/80 text-white border-white/10'
              }`}>
                Original • {originalWidth}×{originalHeight} px • {formatBytes(originalSize)}
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm"
                draggable={false}
              />
            </div>

            {/* Processed Panel */}
            <div className={`flex flex-col items-center justify-center w-full h-full max-h-full rounded-xl p-3 border relative overflow-hidden ${
              canvasTheme === 'light' ? 'bg-white/70 border-neutral-300' : 'bg-neutral-900/60 border-white/10'
            }`}>
              <span className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border backdrop-blur-md ${
                canvasTheme === 'light' ? 'bg-white/90 text-neutral-900 border-neutral-300 font-semibold' : 'bg-black/80 text-cyan-300 border-white/10'
              }`}>
                Result {processedWidth ? `• ${processedWidth}×${processedHeight} px` : ''} {processedSize ? `• ${formatBytes(processedSize)}` : ''}
              </span>
              {processedUrl ? (
                <img
                  src={processedUrl}
                  alt="Processed"
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm"
                  draggable={false}
                />
              ) : (
                <div className="text-neutral-400 text-xs italic">Awaiting transformation...</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: RESULT ONLY (Full Frame View with Optional Interactive Crop Overlay) */}
        {viewMode === 'result' && (
          <div 
            className="relative w-full h-full transition-transform duration-75 flex items-center justify-center p-3 overflow-hidden"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {processedWidth && (
              <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border shadow-2xs backdrop-blur-md ${
                canvasTheme === 'light' ? 'bg-white/90 text-neutral-900 border-neutral-300 font-semibold' : 'bg-black/80 text-cyan-300 border-white/10'
              }`}>
                Result: {processedWidth}×{processedHeight} px {processedSize ? `• ${formatBytes(processedSize)}` : ''}
              </span>
            )}

            <div 
              ref={imageFrameRef}
              className={`relative inline-flex items-center justify-center max-w-full max-h-full rounded-xl overflow-hidden shadow-xl border ${
                canvasTheme === 'light' ? 'border-neutral-300/80' : 'border-white/10'
              }`}
              style={{
                aspectRatio: `${originalWidth} / ${originalHeight}`,
              }}
            >
              <img
                src={showCropHandles && isCropTool ? originalUrl : (isPeekingOriginal ? originalUrl : (processedUrl || originalUrl))}
                alt="Active Viewport"
                className="w-full h-full object-contain select-none transition-all duration-75 drop-shadow-md rounded-lg pointer-events-none"
                draggable={false}
              />

              {/* Live Interactive Draggable Crop Overlay */}
              {isCropTool && showCropHandles && (
                <InteractiveCropOverlay
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                  isCircle={currentParams?.isCircle}
                  aspectPreset={currentParams?.aspectPreset || '1:1'}
                  initialParams={currentParams}
                  onCropChange={(crop) => {
                    setCurrentParams((prev: any) => ({ ...prev, ...crop }));
                  }}
                  onCropCommit={(crop) => {
                    setCurrentParams((prev: any) => ({ ...prev, ...crop }));
                    executeActiveUtility({ ...currentParams, ...crop });
                  }}
                />
              )}
            </div>

            {/* Quick Hold to Compare Button */}
            {processedUrl && !showCropHandles && (
              <button
                onMouseDown={() => setIsPeekingOriginal(true)}
                onMouseUp={() => setIsPeekingOriginal(false)}
                onTouchStart={() => setIsPeekingOriginal(true)}
                onTouchEnd={() => setIsPeekingOriginal(false)}
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full font-medium text-xs backdrop-blur-md border shadow-lg flex items-center gap-2 active:scale-95 transition cursor-pointer select-none ${
                  isPeekingOriginal 
                    ? 'bg-neutral-900 text-white border-neutral-700' 
                    : 'bg-white/95 text-neutral-800 border-neutral-300 hover:bg-white'
                }`}
                title="Hold down (or press Spacebar) to compare with original image"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isPeekingOriginal ? 'Original Image' : 'Hold to View Original (Spacebar)'}</span>
              </button>
            )}
          </div>
        )}

        {/* VIEW MODE 4: ORIGINAL ONLY */}
        {viewMode === 'original' && (
          <div 
            className="relative w-full h-full transition-transform duration-75 flex items-center justify-center p-3"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono border backdrop-blur-md ${
              canvasTheme === 'light' ? 'bg-white/90 text-neutral-800 border-neutral-200' : 'bg-black/80 text-white border-white/10'
            }`}>
              Original • {originalWidth}×{originalHeight} px • {formatBytes(originalSize)}
            </span>
            <img
              src={originalUrl}
              alt="Original"
              className="max-w-full max-h-full object-contain select-none drop-shadow-sm"
              draggable={false}
            />
          </div>
        )}

        {/* Bottom Status & Dimension Banners */}
        {processedUrl && (
          <>
            <div className={`absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono border flex items-center gap-1.5 shadow-2xs backdrop-blur-md ${
              canvasTheme === 'light' ? 'bg-white/90 text-neutral-700 border-neutral-200' : 'bg-black/80 text-white border-white/10'
            }`}>
              <span className="text-neutral-400">Original:</span>
              <span>{formatBytes(originalSize)}</span>
              {originalWidth ? <span className="text-neutral-400">({formatDimensions(originalWidth, originalHeight)})</span> : null}
            </div>

            <div className={`absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono border flex items-center gap-1.5 shadow-2xs backdrop-blur-md ${
              canvasTheme === 'light' ? 'bg-white/90 text-neutral-800 border-neutral-300 font-semibold' : 'bg-neutral-900/90 text-white border-white/15'
            }`}>
              {isUpscaleTool ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>4× Super-Res: {processedWidth} × {processedHeight} px</span>
                </>
              ) : isCropOrMaskTool ? (
                <>
                  <span className="text-neutral-500">Bounds:</span>
                  <span>{processedWidth} × {processedHeight} px</span>
                </>
              ) : isBgRemovalTool ? (
                <>
                  <span className="text-emerald-600 font-semibold">Alpha Cutout:</span>
                  <span>Transparent Mask</span>
                </>
              ) : (
                <>
                  <span className="text-neutral-400">Result:</span>
                  <span>{processedSize ? formatBytes(processedSize) : ''}</span>
                  {processedWidth ? <span className="text-neutral-400">({formatDimensions(processedWidth, processedHeight)})</span> : null}
                </>
              )}
            </div>
          </>
        )}
        {/* Pixel Inspection Loupe (Floating 2× / 4× Lens) */}
        {isLoupeActive && isHoveringImage && imageScreenRect && (
          <div
            className="fixed pointer-events-none z-50 rounded-full border-2 border-white shadow-2xl overflow-hidden ring-2 ring-blue-500/50 backdrop-blur-xs"
            style={{
              width: 170,
              height: 170,
              left: loupePos.x - 85,
              top: loupePos.y - 85,
            }}
          >
            {/* Magnified Image Background */}
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundImage: `url(${viewMode === 'result' && processedUrl ? processedUrl : originalUrl})`,
                backgroundSize: `${imageScreenRect.width * loupeZoom}px ${imageScreenRect.height * loupeZoom}px`,
                backgroundPosition: `${-((loupePos.x - imageScreenRect.left) * loupeZoom - 85)}px ${-((loupePos.y - imageScreenRect.top) * loupeZoom - 85)}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: loupeZoom === 4 ? 'pixelated' : 'auto',
              }}
            />

            {/* Precision Crosshair Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-[1.5px] bg-cyan-400 drop-shadow-sm opacity-90" />
              <div className="h-6 w-[1.5px] bg-cyan-400 drop-shadow-sm opacity-90 absolute" />
              <div className="w-3 h-3 rounded-full border border-cyan-300/80 absolute" />
            </div>

            {/* Magnification Badge */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-neutral-900/90 text-cyan-300 font-mono text-[9px] font-bold border border-white/20 shadow-md">
              {loupeZoom}.0× Inspection
            </div>

            {/* Quick Toggle Tip */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-neutral-900/80 text-neutral-300 font-mono text-[8px] whitespace-nowrap border border-white/10">
              [Z] Toggle • [X] Zoom
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
