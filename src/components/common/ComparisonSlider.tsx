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
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 to 100)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => setIsDragging(true);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Top Floating Telemetry & Zoom Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-md">
        <span className="text-xs font-semibold text-neutral-800 truncate max-w-[180px]">
          {imageName}
        </span>
        <div className="h-4 w-px bg-neutral-200" />
        <span className="text-xs text-neutral-500 font-mono">
          {formatBytes(originalSize)}
        </span>

        {processedSize && savings && (
          <>
            <div className="h-4 w-px bg-neutral-200" />
            <span className="text-xs text-emerald-600 font-bold font-mono">
              &rarr; {formatBytes(processedSize)} ({savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`})
            </span>
          </>
        )}

        <div className="h-4 w-px bg-neutral-200" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={zoomOut}
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-neutral-500 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={resetZoom}
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition ml-0.5"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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
        className="relative max-w-4xl max-h-[70vh] w-full h-[600px] overflow-hidden rounded-2xl bg-[#F0F0F2] border border-neutral-200/80 shadow-inner select-none flex items-center justify-center cursor-ew-resize"
      >
        <div 
          className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Layer: Original Image */}
          <img
            src={originalUrl}
            alt="Original Preview"
            className="max-w-full max-h-[580px] object-contain pointer-events-none"
            draggable={false}
          />

          {/* Top Layer: Processed Image (Clipped by slider position) */}
          {processedUrl && (
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img
                src={processedUrl}
                alt="Processed Result"
                className="max-w-full max-h-[580px] object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Divider Handle */}
          {processedUrl && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-neutral-200 flex items-center justify-center text-neutral-800">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* Labels: Before / After */}
        {processedUrl && (
          <>
            <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
              Original: {formatBytes(originalSize)} {originalWidth ? `(${formatDimensions(originalWidth, originalHeight)})` : ''}
            </div>
            <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
              Processed: {processedSize ? formatBytes(processedSize) : ''} {processedWidth ? `(${formatDimensions(processedWidth, processedHeight)})` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
