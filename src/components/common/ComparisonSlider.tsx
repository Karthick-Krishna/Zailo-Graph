import React, { useState, useRef, useCallback, useEffect } from 'react';
import { formatBytes, formatDimensions, calculateSavings } from '../../utils/formatters';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowLeftRight, 
  Columns, 
  Eye, 
  Sparkles, 
  Maximize2,
  Check,
  SplitSquareVertical
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
  // Determine if aspect ratios differ significantly (e.g. crop or circle avatar)
  const isAspectMismatched = Boolean(
    processedWidth && 
    processedHeight && 
    Math.abs((originalWidth / originalHeight) - (processedWidth / processedHeight)) > 0.08
  );

  const isCropOrMaskTool = activeUtilityId === 'avatar-crop' || activeUtilityId === 'passport-photo' || activeUtilityId === 'social-presets';
  const isUpscaleTool = activeUtilityId === 'ai-upscale';
  const isBgRemovalTool = activeUtilityId === 'ai-bg-removal';

  // Default view mode: for crops or masks with mismatch, default to 'side_by_side' or 'result'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (isCropOrMaskTool) return 'side_by_side';
    return 'slider';
  });

  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync mode when utility changes
  useEffect(() => {
    if (isCropOrMaskTool && viewMode === 'slider') {
      setViewMode('side_by_side');
    }
  }, [activeUtilityId, isCropOrMaskTool]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // If zoomed in and right button or space-drag, pan; otherwise drag slider
    if (e.button === 1 || e.altKey || (zoomLevel > 1 && e.shiftKey)) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }

    if (viewMode === 'slider' && containerRef.current) {
      setIsDragging(true);
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (isDragging && containerRef.current && viewMode === 'slider') {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      {/* Top Floating Control Deck */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-md text-xs max-w-[96vw]">
        
        {/* File Telemetry */}
        <div className="flex items-center gap-1.5 font-medium text-neutral-800">
          <span className="font-semibold truncate max-w-[110px] sm:max-w-[150px]">{imageName}</span>
          <span className="text-neutral-300">|</span>
          <span className="font-mono text-neutral-500 text-[11px]">{formatBytes(originalSize)}</span>
        </div>

        {/* Processed Stats Badge */}
        {processedSize && (
          <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-200">
            <span className="text-violet-600 font-bold">&rarr;</span>
            <span className="font-mono text-neutral-900 font-semibold text-[11px]">
              {formatBytes(processedSize)}
            </span>
            {savings && (
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                savings.isSaved 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                  : 'bg-neutral-100 text-neutral-700'
              }`}>
                {savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`}
              </span>
            )}
          </div>
        )}

        {/* Mode Selector Segmented Control */}
        <div className="flex items-center gap-0.5 p-0.5 bg-neutral-100 rounded-xl border border-neutral-200/80">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'slider' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Split comparison slider"
          >
            <SplitSquareVertical className="w-3 h-3" />
            <span className="hidden md:inline">Split</span>
          </button>

          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'side_by_side' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Side-by-side comparison"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden md:inline">Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('result')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'result' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Show Processed Result Only"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">Result</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'original' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Show Original Only"
          >
            <span className="hidden md:inline">Original</span>
          </button>
        </div>

        {/* 1:1 Pixel Inspection Button (Essential for checking sharpness, noise, and real resolution) */}
        <button
          onClick={togglePixelInspection}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs border ${
            zoomLevel >= 2
              ? 'bg-violet-600 border-violet-700 text-white'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
          }`}
          title="Inspect 1:1 actual pixel resolution (100% scale)"
        >
          <Sparkles className="w-3 h-3 text-cyan-500" />
          <span>{zoomLevel >= 2 ? 'Exit 100%' : '1:1 Actual Pixels'}</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 pl-1 border-l border-neutral-200">
          <button 
            onClick={zoomOut}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-neutral-600 px-1 min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetZoom}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={`relative max-w-5xl w-full h-[56vh] sm:h-[66vh] md:h-[620px] overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-300/80 select-none flex items-center justify-center touch-none shadow-md ${
          viewMode === 'slider' ? 'cursor-ew-resize' : zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          // Subtle checkered pattern for transparency inspection
          backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px), radial-gradient(#27272a 1px, #09090b 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* VIEW MODE 1: SPLIT SLIDER */}
        {viewMode === 'slider' && (
          <div 
            className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            {/* Base Layer: Original */}
            <img
              src={originalUrl}
              alt="Original Preview"
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* Top Layer: Processed Result (With opaque alpha-checkerboard so transparency doesn't bleed original through!) */}
            {processedUrl && (
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                style={{ 
                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  backgroundColor: '#0E1017',
                  backgroundImage: 'radial-gradient(#2A2D3D 1px, transparent 1px), radial-gradient(#2A2D3D 1px, #0E1017 1px)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px',
                }}
              >
                <img
                  src={processedUrl}
                  alt="Processed Result"
                  className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain select-none"
                  draggable={false}
                />
              </div>
            )}

            {/* Floating In-Viewport Badges */}
            <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 shadow-sm">
              Original: {originalWidth}×{originalHeight} px
            </span>
            {processedWidth && (
              <span className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-950 to-indigo-950 backdrop-blur-md text-cyan-300 text-[10px] font-mono border border-violet-400/40 shadow-sm">
                Result: {processedWidth}×{processedHeight} px
              </span>
            )}

            {/* Glowing Draggable Split Handle */}
            {processedUrl && (
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 via-white to-cyan-400 shadow-md pointer-events-none z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-xl shadow-violet-500/50 border-2 border-white flex items-center justify-center text-white cursor-ew-resize transform transition-transform hover:scale-110 active:scale-95">
                  <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
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
            <div className="flex flex-col items-center justify-center w-full h-full max-h-[52vh] sm:max-h-[60vh] bg-black/40 rounded-xl p-3 border border-white/5 relative">
              <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                Original • {originalWidth}×{originalHeight} px • {formatBytes(originalSize)}
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Processed Panel */}
            <div 
              className="flex flex-col items-center justify-center w-full h-full max-h-[52vh] sm:max-h-[60vh] rounded-xl p-3 border border-violet-500/30 relative overflow-hidden"
              style={{
                backgroundColor: '#0E1017',
                backgroundImage: 'radial-gradient(#2A2D3D 1px, transparent 1px), radial-gradient(#2A2D3D 1px, #0E1017 1px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px',
              }}
            >
              <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-950 to-indigo-950 backdrop-blur-md text-cyan-300 text-[10px] font-mono border border-violet-400/40">
                Result {processedWidth ? `• ${processedWidth}×${processedHeight} px` : ''} {processedSize ? `• ${formatBytes(processedSize)}` : ''}
              </span>
              {processedUrl ? (
                <img
                  src={processedUrl}
                  alt="Processed"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="text-neutral-500 text-xs italic">Awaiting transformation...</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: RESULT ONLY */}
        {viewMode === 'result' && (
          <div 
            className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center rounded-2xl overflow-hidden p-2"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              backgroundColor: '#0E1017',
              backgroundImage: 'radial-gradient(#2A2D3D 1px, transparent 1px), radial-gradient(#2A2D3D 1px, #0E1017 1px)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px',
            }}
          >
            {processedWidth && (
              <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-950 to-indigo-950 backdrop-blur-md text-cyan-300 text-[10px] font-mono border border-violet-400/40 shadow-sm">
                Result: {processedWidth}×{processedHeight} px {processedSize ? `• ${formatBytes(processedSize)}` : ''}
              </span>
            )}
            <img
              src={processedUrl || originalUrl}
              alt="Processed Result"
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain"
              draggable={false}
            />
          </div>
        )}

        {/* VIEW MODE 4: ORIGINAL ONLY */}
        {viewMode === 'original' && (
          <div 
            className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            <img
              src={originalUrl}
              alt="Original"
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain"
              draggable={false}
            />
          </div>
        )}

        {/* Bottom Status & Dimension Banners */}
        {processedUrl && (
          <>
            <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono tracking-wide border border-white/10 flex items-center gap-1.5 shadow-sm">
              <span className="text-neutral-400">Original:</span>
              <span>{formatBytes(originalSize)}</span>
              {originalWidth ? <span className="text-neutral-400">({formatDimensions(originalWidth, originalHeight)})</span> : null}
            </div>

            <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-950/90 via-indigo-950/90 to-neutral-900/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono tracking-wide border border-violet-400/40 flex items-center gap-1.5 shadow-sm">
              {isUpscaleTool ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-cyan-300">
                    AI 4× Super-Res: {processedWidth} × {processedHeight} px
                  </span>
                </>
              ) : isCropOrMaskTool ? (
                <>
                  <span className="text-cyan-400 font-bold">Cropped Bounds:</span>
                  <span>{processedWidth} × {processedHeight} px</span>
                </>
              ) : isBgRemovalTool ? (
                <>
                  <span className="text-emerald-400 font-bold">Alpha Cutout:</span>
                  <span>Transparent Mask</span>
                </>
              ) : (
                <>
                  <span className="text-violet-300">Result:</span>
                  <span>{processedSize ? formatBytes(processedSize) : ''}</span>
                  {processedWidth ? <span className="text-neutral-300">({formatDimensions(processedWidth, processedHeight)})</span> : null}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
