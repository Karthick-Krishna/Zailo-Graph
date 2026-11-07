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
  // Determine if aspect ratios differ significantly (e.g. crop, custom batch-resize, social preset, passport)
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

  // If aspect ratios differ or it's a crop/collage tool, default to full result view
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (isCropOrMaskTool || isAspectMismatched) return 'result';
    return 'slider';
  });

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
    // If zoomed in and middle click or Alt/Shift, trigger pan
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
    <div className="relative w-full h-full flex flex-col items-center justify-between p-1 sm:p-3 overflow-hidden select-none">
      {/* Top Floating Control Deck */}
      <div className="z-20 flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-md text-xs max-w-[96vw] mb-2 shrink-0">
        
        {/* File Telemetry */}
        <div className="flex items-center gap-1.5 font-medium text-neutral-800">
          <span className="font-semibold truncate max-w-[120px] sm:max-w-[180px]">{imageName}</span>
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
          {/* Split Mode: available when aspect ratios match */}
          {!isAspectMismatched ? (
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'slider' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Split comparison slider"
            >
              <SplitSquareVertical className="w-3 h-3 text-violet-600" />
              <span className="hidden sm:inline">Split</span>
            </button>
          ) : (
            <span 
              className="px-2 py-1 text-[10px] text-neutral-400 font-medium italic flex items-center gap-1 cursor-help"
              title="Split wipe requires matching aspect ratios. Output has custom dimensions."
            >
              <SplitSquareVertical className="w-3 h-3 opacity-40" />
              <span className="hidden sm:inline">Split (Aspect Differs)</span>
            </span>
          )}

          <button
            onClick={() => setViewMode('result')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'result' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Show Processed Result Only (Full scale)"
          >
            <Eye className="w-3 h-3 text-cyan-600" />
            <span>Result</span>
          </button>

          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'side_by_side' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Side-by-side comparison"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'original' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Show Original Only"
          >
            <span className="hidden sm:inline">Original</span>
          </button>
        </div>

        {/* 1:1 Pixel Inspection Button */}
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
          <span>{zoomLevel >= 2 ? 'Exit 100%' : '1:1 Pixels'}</span>
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
        className={`relative w-full flex-1 max-w-7xl min-h-[460px] overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800/80 select-none flex items-center justify-center touch-none shadow-xl ${
          viewMode === 'slider' ? 'cursor-ew-resize' : zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          // Professional dark checkerboard backdrop for transparency and edge inspection
          backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px), radial-gradient(#27272a 1px, #09090b 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* VIEW MODE 1: SPLIT SLIDER (For matching aspect ratios) */}
        {viewMode === 'slider' && (
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 transition-transform duration-75"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
            }}
          >
            {/* Image Frame: strictly tightly-bounded to the image aspect ratio so split wipe has NO dead space */}
            <div 
              ref={imageFrameRef}
              className="relative inline-flex items-center justify-center max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-white/10"
              style={{
                aspectRatio: `${originalWidth} / ${originalHeight}`,
              }}
            >
              {/* Base Layer: Original Image */}
              <img
                src={originalUrl}
                alt="Original Preview"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* Top Layer: Processed Result (Cleanly clipped without black letterboxing) */}
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

              {/* Glowing Draggable Split Handle Line */}
              {processedUrl && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-white to-violet-400 pointer-events-none z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-xl shadow-violet-500/50 border-2 border-white flex items-center justify-center text-white cursor-ew-resize transform transition-transform hover:scale-110 active:scale-95">
                    <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>

            {/* Badges on Top Corners */}
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 shadow-sm">
              Original: {originalWidth}×{originalHeight} px
            </span>
            {processedWidth && (
              <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-950 to-indigo-950 backdrop-blur-md text-cyan-300 text-[10px] font-mono border border-violet-400/40 shadow-sm">
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
            <div className="flex flex-col items-center justify-center w-full h-full max-h-full bg-black/40 rounded-xl p-3 border border-white/10 relative overflow-hidden">
              <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                Original • {originalWidth}×{originalHeight} px • {formatBytes(originalSize)}
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-lg"
                draggable={false}
              />
            </div>

            {/* Processed Panel */}
            <div 
              className="flex flex-col items-center justify-center w-full h-full max-h-full rounded-xl p-3 border border-violet-500/40 relative overflow-hidden"
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
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xl"
                  draggable={false}
                />
              ) : (
                <div className="text-neutral-500 text-xs italic">Awaiting transformation...</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: RESULT ONLY (Full Frame High-Definition View) */}
        {viewMode === 'result' && (
          <div 
            className="relative w-full h-full transition-transform duration-75 flex items-center justify-center p-3 overflow-hidden"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {/* Dimensions Badge */}
            {processedWidth && (
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-950 to-indigo-950 backdrop-blur-md text-cyan-300 text-[10px] font-mono border border-violet-400/40 shadow-sm">
                Result: {processedWidth}×{processedHeight} px {processedSize ? `• ${formatBytes(processedSize)}` : ''}
              </span>
            )}

            {/* Rendered Result Image - Unsquashed & High Definition */}
            <img
              src={isPeekingOriginal ? originalUrl : (processedUrl || originalUrl)}
              alt="Processed Result"
              className="max-w-full max-h-full object-contain select-none transition-all duration-75 drop-shadow-2xl rounded-lg"
              draggable={false}
            />

            {/* Quick Hold to Compare Button in Result View (Mouse hold or Spacebar) */}
            {processedUrl && (
              <button
                onMouseDown={() => setIsPeekingOriginal(true)}
                onMouseUp={() => setIsPeekingOriginal(false)}
                onTouchStart={() => setIsPeekingOriginal(true)}
                onTouchEnd={() => setIsPeekingOriginal(false)}
                className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full font-semibold text-xs backdrop-blur-md border shadow-2xl flex items-center gap-2 active:scale-95 transition cursor-pointer select-none ${
                  isPeekingOriginal 
                    ? 'bg-cyan-500 text-black border-cyan-300 scale-105' 
                    : 'bg-black/85 hover:bg-black text-white border-white/20'
                }`}
                title="Hold down (or press Spacebar) to compare with original image"
              >
                <Eye className={`w-4 h-4 ${isPeekingOriginal ? 'text-black' : 'text-cyan-400'}`} />
                <span>{isPeekingOriginal ? 'Showing Original (Release to View Result)' : 'Hold to View Original (Spacebar)'}</span>
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
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
              Original • {originalWidth}×{originalHeight} px • {formatBytes(originalSize)}
            </span>
            <img
              src={originalUrl}
              alt="Original"
              className="max-w-full max-h-full object-contain select-none drop-shadow-xl"
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
                  <span className="text-cyan-400 font-bold">Bounds:</span>
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
