import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Move, Maximize2 } from 'lucide-react';

interface InteractiveCropOverlayProps {
  originalWidth: number;
  originalHeight: number;
  isCircle?: boolean;
  aspectPreset?: '1:1' | '4:5' | '16:9' | '9:16' | 'free';
  initialParams?: { x?: number; y?: number; width?: number; height?: number };
  onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
  onCropCommit: (crop: { x: number; y: number; width: number; height: number }) => void;
}

type DragHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'body' | null;

export const InteractiveCropOverlay: React.FC<InteractiveCropOverlayProps> = ({
  originalWidth,
  originalHeight,
  isCircle = false,
  aspectPreset = '1:1',
  initialParams,
  onCropChange,
  onCropCommit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; box: { x: number; y: number; w: number; h: number } } | null>(null);

  // Normalized percentages (0 - 100)
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number }>(() => {
    if (initialParams?.width && initialParams?.height && initialParams.width > 0 && initialParams.height > 0) {
      return {
        x: Math.max(0, Math.min(100, (initialParams.x || 0) / originalWidth * 100)),
        y: Math.max(0, Math.min(100, (initialParams.y || 0) / originalHeight * 100)),
        w: Math.max(5, Math.min(100, initialParams.width / originalWidth * 100)),
        h: Math.max(5, Math.min(100, initialParams.height / originalHeight * 100)),
      };
    }
    // Default: centered 75% square
    const minDim = Math.min(originalWidth, originalHeight) * 0.75;
    const w = (minDim / originalWidth) * 100;
    const h = (minDim / originalHeight) * 100;
    return {
      x: (100 - w) / 2,
      y: (100 - h) / 2,
      w,
      h,
    };
  });

  // Sync when initialParams changes externally (e.g. from preset buttons in sidebar)
  useEffect(() => {
    if (initialParams?.width && initialParams?.height) {
      const nextX = Math.max(0, Math.min(100, ((initialParams.x ?? 0) / originalWidth) * 100));
      const nextY = Math.max(0, Math.min(100, ((initialParams.y ?? 0) / originalHeight) * 100));
      const nextW = Math.max(5, Math.min(100, (initialParams.width / originalWidth) * 100));
      const nextH = Math.max(5, Math.min(100, (initialParams.height / originalHeight) * 100));
      setBox({ x: nextX, y: nextY, w: nextW, h: nextH });
    }
  }, [initialParams?.x, initialParams?.y, initialParams?.width, initialParams?.height, originalWidth, originalHeight]);

  const toRealPixels = useCallback((b: typeof box) => {
    return {
      x: Math.max(0, Math.round((b.x / 100) * originalWidth)),
      y: Math.max(0, Math.round((b.y / 100) * originalHeight)),
      width: Math.max(10, Math.round((b.w / 100) * originalWidth)),
      height: Math.max(10, Math.round((b.h / 100) * originalHeight)),
    };
  }, [originalWidth, originalHeight]);

  const handlePointerDown = (e: React.PointerEvent, handle: DragHandle) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveHandle(handle);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      box: { ...box },
    };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeHandle || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
    const startBox = dragStartRef.current.box;

    let newX = startBox.x;
    let newY = startBox.y;
    let newW = startBox.w;
    let newH = startBox.h;

    const minSize = 8; // min 8% of frame

    if (activeHandle === 'body') {
      newX = Math.max(0, Math.min(100 - startBox.w, startBox.x + deltaXPercent));
      newY = Math.max(0, Math.min(100 - startBox.h, startBox.y + deltaYPercent));
    } else {
      // Corner & Edge Resizing
      if (activeHandle.includes('e')) {
        newW = Math.max(minSize, Math.min(100 - startBox.x, startBox.w + deltaXPercent));
      }
      if (activeHandle.includes('s')) {
        newH = Math.max(minSize, Math.min(100 - startBox.y, startBox.h + deltaYPercent));
      }
      if (activeHandle.includes('w')) {
        const potentialW = startBox.w - deltaXPercent;
        if (potentialW >= minSize && startBox.x + deltaXPercent >= 0) {
          newX = startBox.x + deltaXPercent;
          newW = potentialW;
        }
      }
      if (activeHandle.includes('n')) {
        const potentialH = startBox.h - deltaYPercent;
        if (potentialH >= minSize && startBox.y + deltaYPercent >= 0) {
          newY = startBox.y + deltaYPercent;
          newH = potentialH;
        }
      }

      // Aspect ratio enforcement
      if (isCircle || aspectPreset === '1:1') {
        const targetSide = Math.min(newW, newH);
        newW = targetSide;
        newH = targetSide;
      }
    }

    const updated = { x: newX, y: newY, w: newW, h: newH };
    setBox(updated);
    onCropChange(toRealPixels(updated));
  }, [activeHandle, isCircle, aspectPreset, toRealPixels, onCropChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (activeHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveHandle(null);
      dragStartRef.current = null;
      onCropCommit(toRealPixels(box));
    }
  }, [activeHandle, box, toRealPixels, onCropCommit]);

  const realPixels = toRealPixels(box);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 select-none touch-none pointer-events-auto z-30"
    >
      {/* 4 Shaded Dimming Panels around the Crop Box */}
      {/* Top Mask */}
      <div
        className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-[0.5px] pointer-events-none transition-colors"
        style={{ height: `${box.y}%` }}
      />
      {/* Bottom Mask */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[0.5px] pointer-events-none transition-colors"
        style={{ height: `${Math.max(0, 100 - (box.y + box.h))}%` }}
      />
      {/* Left Mask */}
      <div
        className="absolute left-0 bg-black/60 backdrop-blur-[0.5px] pointer-events-none transition-colors"
        style={{
          top: `${box.y}%`,
          height: `${box.h}%`,
          width: `${box.x}%`,
        }}
      />
      {/* Right Mask */}
      <div
        className="absolute right-0 bg-black/60 backdrop-blur-[0.5px] pointer-events-none transition-colors"
        style={{
          top: `${box.y}%`,
          height: `${box.h}%`,
          width: `${Math.max(0, 100 - (box.x + box.w))}%`,
        }}
      />

      {/* Interactive Crop Window */}
      <div
        className="absolute border-2 border-white shadow-2xl transition-shadow cursor-move"
        style={{
          left: `${box.x}%`,
          top: `${box.y}%`,
          width: `${box.w}%`,
          height: `${box.h}%`,
        }}
        onPointerDown={(e) => handlePointerDown(e, 'body')}
      >
        {/* Rule-of-Thirds Grid Lines */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-40">
          <div className="border-r border-b border-dashed border-white"></div>
          <div className="border-r border-b border-dashed border-white"></div>
          <div className="border-b border-dashed border-white"></div>
          <div className="border-r border-b border-dashed border-white"></div>
          <div className="border-r border-b border-dashed border-white"></div>
          <div className="border-b border-dashed border-white"></div>
          <div className="border-r border-dashed border-white"></div>
          <div className="border-r border-dashed border-white"></div>
          <div></div>
        </div>

        {/* Circular Avatar Mask Outline */}
        {isCircle && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none shadow-xs"></div>
        )}

        {/* Real Dimensions Telemetry Pill */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-neutral-900/90 backdrop-blur-md text-white font-mono text-[10px] font-semibold tracking-wider flex items-center gap-1.5 shadow-md pointer-events-none border border-white/20 whitespace-nowrap">
          <Maximize2 className="w-2.5 h-2.5 text-cyan-400" />
          <span>{realPixels.width} × {realPixels.height} px</span>
          <span className="text-neutral-400 font-normal">({isCircle ? 'Circle' : aspectPreset})</span>
        </div>

        {/* 4 Corner Drag Handles */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'nw')}
          className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-xs shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'ne')}
          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-xs shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'sw')}
          className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-xs shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, 'se')}
          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-xs shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
        />

        {/* 4 Edge Midpoint Drag Handles (When not strictly aspect-locked to circle) */}
        {!isCircle && (
          <>
            <div
              onPointerDown={(e) => handlePointerDown(e, 'n')}
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-white border border-violet-600 rounded-full shadow-xs cursor-ns-resize hover:scale-110"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, 's')}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-white border border-violet-600 rounded-full shadow-xs cursor-ns-resize hover:scale-110"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, 'w')}
              className="absolute top-1/2 -left-1 -translate-y-1/2 h-5 w-1.5 bg-white border border-violet-600 rounded-full shadow-xs cursor-ew-resize hover:scale-110"
            />
            <div
              onPointerDown={(e) => handlePointerDown(e, 'e')}
              className="absolute top-1/2 -right-1 -translate-y-1/2 h-5 w-1.5 bg-white border border-violet-600 rounded-full shadow-xs cursor-ew-resize hover:scale-110"
            />
          </>
        )}
      </div>
    </div>
  );
};

