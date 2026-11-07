import React, { useState, useRef, useCallback } from 'react';
import { formatBytes, formatDimensions, calculateSavings } from '../../utils/formatters';
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeftRight } from 'lucide-react';

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
  originalWidth,
  originalHeight,
  processedWidth,
  processedHeight,
  imageName,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    // Allow instant tap-to-reposition slider
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    }
  };

  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, [isDragging]);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => {
    setZoomLevel(1);
    setSliderPosition(50);
  };

  const savings = processedSize ? calculateSavings(originalSize, processedSize) : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Responsive Telemetry & Zoom Strip */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-sm text-xs max-w-[95vw]">
        <span className="font-semibold text-neutral-800 truncate max-w-[100px] sm:max-w-[160px]">
          {imageName}
        </span>
        <span className="text-neutral-300 hidden sm:inline">|</span>
        <span className="font-mono text-neutral-500 text-[11px] sm:text-xs">
          {formatBytes(originalSize)}
        </span>

        {processedSize && savings && (
          <>
            <span className="text-violet-500 font-bold">&rarr;</span>
            <span className="font-mono text-neutral-900 font-semibold text-[11px] sm:text-xs">
              {formatBytes(processedSize)}
            </span>
            <span className={`font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md ${
              savings.isSaved 
                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60' 
                : 'bg-neutral-100 text-neutral-600'
            }`}>
              {savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`}
            </span>
          </>
        )}

        <span className="text-neutral-300 hidden sm:inline">|</span>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 pl-1 sm:pl-0 border-l sm:border-l-0 border-neutral-200">
          <button 
            onClick={zoomOut}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono text-neutral-500 px-0.5 sm:px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetZoom}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer ml-0.5"
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Viewport with Touch-Friendly Slider */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="relative max-w-4xl w-full h-[54vh] sm:h-[64vh] md:h-[600px] overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-300/80 select-none flex items-center justify-center cursor-ew-resize touch-none shadow-sm"
      >
        {/* Subtle Ambient Background Grid & Radial Glow */}
        <div className="absolute inset-0 bg-radial from-violet-900/20 via-neutral-950 to-neutral-950 pointer-events-none opacity-50"></div>

        <div 
          className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Layer: Original Image */}
          <img
            src={originalUrl}
            alt="Original Preview"
            className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain pointer-events-none"
            draggable={false}
          />

          {/* Top Layer: Processed Image */}
          {processedUrl && (
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img
                src={processedUrl}
                alt="Processed Result"
                className="max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[560px] object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Glowing Violet-to-Cyan Divider Handle */}
          {processedUrl && (
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 via-white to-cyan-400 shadow-md pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-500/40 border-2 border-white flex items-center justify-center text-white cursor-ew-resize transform transition-transform hover:scale-110 active:scale-95">
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          )}
        </div>

        {/* Responsive Corner Badges */}
        {processedUrl && (
          <>
            <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono tracking-wide border border-white/10">
              Original: {formatBytes(originalSize)} {originalWidth ? `(${formatDimensions(originalWidth, originalHeight)})` : ''}
            </div>
            <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-gradient-to-r from-violet-950/80 to-indigo-950/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono tracking-wide border border-violet-400/30">
              Result: {processedSize ? formatBytes(processedSize) : ''} {processedWidth ? `(${formatDimensions(processedWidth, processedHeight)})` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
