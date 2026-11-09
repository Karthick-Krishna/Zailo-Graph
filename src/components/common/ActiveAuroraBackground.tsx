import React, { useEffect, useRef } from 'react';

export const ActiveAuroraBackground: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const spotlightRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run mouse tracking on devices with a mouse/fine pointer to conserve mobile CPU/battery
    const isFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 3 };

    let animationFrameId: number;
    let isMoving = false;
    let idleTimeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isMoving) {
        isMoving = true;
        animationFrameId = requestAnimationFrame(updateMotion);
      }
      clearTimeout(idleTimeout);
      // Stop rAF loop 1 second after mouse stops moving to prevent unnecessary GPU wakeups
      idleTimeout = setTimeout(() => {
        isMoving = false;
        cancelAnimationFrame(animationFrameId);
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updateMotion = () => {
      const dx = mouseRef.current.x - currentPosRef.current.x;
      const dy = mouseRef.current.y - currentPosRef.current.y;

      currentPosRef.current.x += dx * 0.08;
      currentPosRef.current.y += dy * 0.08;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentPosRef.current.x - 300}px, ${currentPosRef.current.y - 300}px, 0)`;
      }

      if (parallaxRef.current) {
        const tiltX = (mouseRef.current.x / window.innerWidth - 0.5) * 30;
        const tiltY = (mouseRef.current.y / window.innerHeight - 0.5) * 20;
        parallaxRef.current.style.transform = `translate3d(${tiltX}px, ${tiltY}px, 0)`;
      }

      if (isMoving) {
        animationFrameId = requestAnimationFrame(updateMotion);
      }
    };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimeout);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full max-w-full overflow-hidden pointer-events-none select-none z-0" 
      aria-hidden="true"
    >
      {/* MOBILE-OPTIMIZED AURORA: Feather-soft radial gradients with ZERO blur filter cost for locked 60fps/120fps */}
      <div 
        className="md:hidden absolute inset-0 pointer-events-none opacity-80"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.16) 0%, transparent 45%),
            radial-gradient(circle at 85% 25%, rgba(6, 182, 212, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 20% 75%, rgba(217, 70, 239, 0.12) 0%, transparent 50%)
          `
        }}
      />

      {/* DESKTOP LAYER 1: Interactive Mouse-Reactive Magnetic Spotlight (Hidden on touch mobile) */}
      <div
        ref={spotlightRef}
        className="hidden md:block absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[80px] pointer-events-none transition-opacity duration-300 opacity-70 will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(6, 182, 212, 0.35) 40%, rgba(217, 70, 239, 0.15) 60%, transparent 75%)',
        }}
      />

      {/* DESKTOP LAYER 2: Floating Autonomous Parallax Aurora Orbs (Contained within desktop bounds) */}
      <div ref={parallaxRef} className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden will-change-transform transition-transform duration-100 ease-out">
        {/* Orb 1: Vibrant Electric Violet */}
        <div 
          className="absolute -top-24 left-[15%] w-[800px] h-[520px] rounded-full blur-[90px] pointer-events-none animate-aura-1"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.48) 0%, rgba(99, 102, 241, 0.35) 45%, transparent 70%)',
          }}
        />

        {/* Orb 2: Radiant Cyan & Sky Blue */}
        <div 
          className="absolute top-1/4 -right-16 w-[700px] h-[700px] rounded-full blur-[100px] pointer-events-none animate-aura-2"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.44) 0%, rgba(59, 130, 246, 0.32) 45%, transparent 70%)',
          }}
        />

        {/* Orb 3: Fuchsia & Magenta Sunset */}
        <div 
          className="absolute -bottom-20 -left-16 w-[650px] h-[650px] rounded-full blur-[85px] pointer-events-none animate-aura-3"
          style={{
            background: 'radial-gradient(circle, rgba(217, 70, 239, 0.40) 0%, rgba(244, 63, 94, 0.28) 45%, transparent 70%)',
          }}
        />

        {/* Orb 4: Pulsing Central Ethereal Core */}
        <div 
          className="absolute top-1/3 left-1/3 w-[550px] h-[550px] rounded-full blur-[90px] pointer-events-none animate-aura-glow"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.36) 0%, rgba(6, 182, 212, 0.28) 50%, transparent 75%)',
          }}
        />
      </div>

      {/* LAYER 3: Studio Precision Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.38] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
