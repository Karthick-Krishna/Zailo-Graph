import React from 'react';

export const ActiveAuroraBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 w-full max-w-full overflow-hidden pointer-events-none select-none z-0 bg-[#F9FAFB]" 
      aria-hidden="true"
    >
      {/* Studio Precision Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft optical center falloff */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, transparent 40%, rgba(241, 245, 249, 0.7) 100%)',
        }}
      />
    </div>
  );
};
