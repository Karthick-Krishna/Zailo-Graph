import React from 'react';

export const ActiveAuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none" aria-hidden="true">
      {/* Orb 1: Electric Violet & Indigo Drift (Top-Center) */}
      <div 
        className="absolute -top-32 left-1/4 w-[850px] h-[550px] rounded-full blur-[100px] pointer-events-none animate-aura-1"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.42) 0%, rgba(99, 102, 241, 0.32) 50%, rgba(168, 85, 247, 0) 75%)',
        }}
      />

      {/* Orb 2: Radiant Cyan & Azure Bloom (Right & Bottom-Right) */}
      <div 
        className="absolute top-1/4 -right-28 w-[720px] h-[720px] rounded-full blur-[110px] pointer-events-none animate-aura-2"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.38) 0%, rgba(59, 130, 246, 0.28) 45%, rgba(14, 165, 233, 0) 70%)',
        }}
      />

      {/* Orb 3: Fuchsia, Pink & Violet Flow (Bottom-Left) */}
      <div 
        className="absolute -bottom-24 -left-20 w-[650px] h-[650px] rounded-full blur-[95px] pointer-events-none animate-aura-3"
        style={{
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.32) 0%, rgba(139, 92, 246, 0.28) 50%, rgba(236, 72, 153, 0) 70%)',
        }}
      />

      {/* Orb 4: Center Pulsing Ethereal Core */}
      <div 
        className="absolute top-1/3 left-1/3 w-[550px] h-[550px] rounded-full blur-[120px] pointer-events-none animate-aura-glow"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.30) 0%, rgba(6, 182, 212, 0.22) 50%, rgba(168, 85, 247, 0) 75%)',
        }}
      />

      {/* Subtle Studio Dot Matrix Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.40] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
