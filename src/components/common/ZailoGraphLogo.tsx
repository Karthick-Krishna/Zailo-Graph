import React from 'react';

export interface ZailoGraphLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  variant?: 'vector' | 'banner';
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
    xs: { icon: 22, text: 'text-sm', tagline: 'text-[8px]', star: 8 },
    sm: { icon: 30, text: 'text-base', tagline: 'text-[9px]', star: 10 },
    md: { icon: 38, text: 'text-xl', tagline: 'text-[10px]', star: 13 },
    lg: { icon: 56, text: 'text-3xl', tagline: 'text-xs', star: 16 },
    xl: { icon: 76, text: 'text-5xl', tagline: 'text-sm', star: 20 },
  };

  const { icon, text, tagline, star } = sizeMap[size];

  // Optional Full Raster Banner Mode
  if (variant === 'banner') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/zailograph-banner.jpg"
          alt="Zailograph — Create • Edit • Convert • Optimize"
          className="rounded-2xl shadow-2xl border border-violet-500/30 max-w-full h-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector Emblem matching the new Zailograph icon badge */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-md"
      >
        <defs>
          {/* Neon Border Gradient: Vivid Magenta/Purple to Electric Cyan */}
          <linearGradient id="zg-neon-border" x1="12" y1="108" x2="108" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E026FD" />
            <stop offset="45%" stopColor="#A855F7" />
            <stop offset="75%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>

          {/* Electric Stylized Letter 'Z' Gradient */}
          <linearGradient id="zg-z-gradient" x1="28" y1="92" x2="94" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D946EF" />
            <stop offset="30%" stopColor="#C026D3" />
            <stop offset="65%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>

          {/* Mountain Silhouette Landscape Gradient */}
          <linearGradient id="zg-mountains" x1="30" y1="90" x2="85" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B0764" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Subtle Outer Neon Glow Filter */}
          <filter id="zg-outer-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Dark Canvas Background */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="26"
          fill="#070913"
        />

        {/* Squircle Neon Ambient Glow Border */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="26"
          stroke="url(#zg-neon-border)"
          strokeWidth="3.5"
          filter="url(#zg-outer-glow)"
        />

        {/* Viewfinder Crop Corner Brackets */}
        {/* Top-Left Bracket */}
        <path
          d="M24 38V24H38"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom-Right Bracket */}
        <path
          d="M96 82V96H82"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Background Mountain Peaks */}
        <path
          d="M26 84L45 56C47 53 51 53 53 56L68 76L74 68C76 65 80 65 82 68L94 84H26Z"
          fill="url(#zg-mountains)"
          opacity="0.85"
        />

        {/* Celestial Sun/Moon Dot */}
        <circle cx="86" cy="46" r="4.5" fill="#00F0FF" />

        {/* Electric Sharp Stylized Lightning Letter 'Z' */}
        <path
          d="M32 30H86C88 30 90 32 89 34L42 78H88C90 78 91 80 90 82L86 90C85 91 83 92 81 92H28C26 92 24 90 25 88L72 44H30C28 44 27 42 28 40L32 30Z"
          fill="url(#zg-z-gradient)"
        />

        {/* Specular Inner Blade Edge */}
        <path
          d="M32 30H86L42 78L72 44H30L32 30Z"
          fill="#FFFFFF"
          opacity="0.25"
        />
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center overflow-visible">
          <div className={`font-black flex items-baseline leading-normal relative overflow-visible ${text}`}>
            {/* 'Zailo' in Pure White (Dark Mode) or Rich Obsidian (Light Mode) */}
            <span className={`inline-block ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
              Zailo
            </span>

            {/* 'graph' with Electric Neon Magenta to Cyan Gradient (Generous padding & clone box-decoration to prevent 'g' left-bowl, ear, and descender clipping across all displays) */}
            <span 
              className="inline-block bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent font-black px-2 py-1 -ml-1.5 overflow-visible"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                WebkitBoxDecorationBreak: 'clone',
              }}
            >
              graph
            </span>

            {/* 4-Point Neon Sparkle Star over the 'h' */}
            <svg
              width={star}
              height={star}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block ml-0.5 -translate-y-1.5 shrink-0 overflow-visible"
            >
              <path
                d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                fill="url(#zg-star-grad)"
              />
              <defs>
                <linearGradient id="zg-star-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E026FD" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Sub-tagline: CREATE • EDIT • CONVERT • OPTIMIZE */}
          {showTagline && (
            <div className={`flex items-center gap-1.5 font-mono font-semibold tracking-widest text-neutral-400 uppercase mt-1 ${tagline}`}>
              <span>CREATE</span>
              <span className="text-fuchsia-500">•</span>
              <span>EDIT</span>
              <span className="text-purple-500">•</span>
              <span>CONVERT</span>
              <span className="text-cyan-500">•</span>
              <span>OPTIMIZE</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ImazoraLogo = ZailoGraphLogo;
