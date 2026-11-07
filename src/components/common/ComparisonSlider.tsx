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
  const [sliderPosition, setSliderPosition] = useState<number>(50);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
      {/* Quiet Telemetry Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-white/95 border border-neutral-200/90 shadow-xs text-xs">
        <span className="font-medium text-neutral-800 truncate max-w-[160px]">
          {imageName}
        </span>
        <span className="text-neutral-300">|</span>
        <span className="font-mono text-neutral-500">
          {formatBytes(originalSize)}
        </span>

        {processedSize && savings && (
          <>
            <span className="text-neutral-300">&rarr;</span>
            <span className="font-mono text-neutral-900 font-medium">
              {formatBytes(processedSize)}
            </span>
            <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
              savings.isSaved ? 'bg-neutral-100 text-neutral-800 font-semibold' : 'text-neutral-500'
            }`}>
              {savings.isSaved ? `-${savings.percent}%` : `+${savings.percent}%`}
            </span>
          </>
        )}

        <span className="text-neutral-300">|</span>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <button 
            onClick={zoomOut}
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-500 px-1">
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
            className="p-1 text-neutral-400 hover:text-neutral-800 rounded transition cursor-pointer ml-0.5"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="relative max-w-4xl max-h-[72vh] w-full h-[620px] overflow-hidden rounded-xl bg-[#EBEBEF] border border-neutral-300/70 select-none flex items-center justify-center cursor-ew-resize"
      >
        <div 
          className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Layer: Original Image */}
          <img
            src={originalUrl}
            alt="Original Preview"
            className="max-w-full max-h-[600px] object-contain pointer-events-none"
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
                className="max-w-full max-h-[600px] object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Divider Handle */}
          {processedUrl && (
            <div 
              className="absolute top-0 bottom-0 w-px bg-white shadow-xs pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow-md border border-neutral-300 flex items-center justify-center text-neutral-700">
                <ArrowLeftRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>

        {/* Quiet Corner Labels */}
        {processedUrl && (
          <>
            <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono tracking-wide">
              Original: {formatBytes(originalSize)} {originalWidth ? `(${formatDimensions(originalWidth, originalHeight)})` : ''}
            </div>
            <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-mono tracking-wide">
              Result: {processedSize ? formatBytes(processedSize) : ''} {processedWidth ? `(${formatDimensions(processedWidth, processedHeight)})` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
