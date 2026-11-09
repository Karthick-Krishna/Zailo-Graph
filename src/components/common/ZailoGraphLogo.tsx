import React from 'react';

export interface ZailoGraphLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  variant?: 'vector' | 'banner' | 'image';
}

export const ZailoGraphLogo: React.FC<ZailoGraphLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  theme = 'auto',
  variant = 'vector',
}) => {
  const sizeMap = {
    xs: { iconH: 22, text: 'text-xs', tagline: 'text-[8px]', gap: 'gap-1.5' },
    sm: { iconH: 28, text: 'text-sm', tagline: 'text-[9px]', gap: 'gap-2' },
    md: { iconH: 36, text: 'text-lg', tagline: 'text-[10px]', gap: 'gap-2.5' },
    lg: { iconH: 52, text: 'text-2xl', tagline: 'text-xs', gap: 'gap-3' },
    xl: { iconH: 72, text: 'text-4xl', tagline: 'text-sm', gap: 'gap-4' },
  };

  const { iconH, text, tagline, gap } = sizeMap[size];

  // Full Logo Banner Mode
  if (variant === 'banner') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/zailograph-logo.png"
          alt="ZAILO GRAPH — Privacy-First Image Studio"
          className="rounded-2xl shadow-xl max-w-full h-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Official 3D Folded Cobalt Ribbon Emblem */}
      <img
        src="/zailograph-symbol.png"
        alt="Zailo Graph Emblem"
        style={{ height: `${iconH}px`, width: 'auto' }}
        className="shrink-0 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
        loading="eager"
      />

      {/* Brand Wordmark matching exact geometric extended typography */}
      {showText && (
        <div className="flex flex-col justify-center overflow-visible">
          <div className={`font-brand font-black flex items-baseline tracking-widest uppercase leading-none overflow-visible ${text}`}>
            {/* 'ZAILO' in Obsidian / Dark Navy (Light Mode) or Crisp White (Dark Mode) */}
            <span className={`inline-block mr-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
              ZAILO
            </span>

            {/* 'GRAPH' in Electric Cobalt & Azure Gradient */}
            <span 
              className={`inline-block font-black ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 text-transparent bg-clip-text'
                  : 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-transparent bg-clip-text'
              }`}
            >
              GRAPH
            </span>
          </div>

          {/* Sub-tagline */}
          {showTagline && (
            <div className={`flex items-center gap-1.5 font-mono font-bold tracking-widest text-slate-400 uppercase mt-1 ${tagline}`}>
              <span>CREATE</span>
              <span className="text-blue-500">•</span>
              <span>EDIT</span>
              <span className="text-sky-500">•</span>
              <span>CONVERT</span>
              <span className="text-blue-600">•</span>
              <span>OPTIMIZE</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ImazoraLogo = ZailoGraphLogo;
