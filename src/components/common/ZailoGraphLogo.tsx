import React from 'react';

export interface ZailoGraphLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const ZailoGraphLogo: React.FC<ZailoGraphLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', tagline: 'text-[9px]' },
    md: { icon: 34, text: 'text-xl', tagline: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', tagline: 'text-xs' },
    xl: { icon: 64, text: 'text-4xl', tagline: 'text-sm' },
  };

  const { icon, text, tagline } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Vector Emblem matching the brandmark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Ribbon Gradient: Neon Violet to Electric Cyan */}
          <linearGradient id="zg-ribbon" x1="20" y1="95" x2="105" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="35%" stopColor="#818CF8" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Ribbon Shadow/Depth Inner Layer */}
          <linearGradient id="zg-depth" x1="30" y1="80" x2="90" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#581C87" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Mountain Peak Gradient */}
          <linearGradient id="zg-mountain" x1="45" y1="80" x2="80" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Ambient Glow Filter */}
          <filter id="zg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Top-Left Crop Bracket */}
        <path
          d="M32 20H22C19.7909 20 18 21.7909 18 24V34"
          stroke="#C084FC"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bottom-Right Crop Bracket */}
        <path
          d="M88 100H98C100.209 100 102 98.2091 102 96V86"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Geometric Camera/Artwork Ribbon Frame */}
        <g filter="url(#zg-glow)">
          {/* Outer Stylized Folded Parallelogram Ribbon */}
          <path
            d="M32 40C30 33 34 26 42 24L86 16C92 15 98 20 96 26L88 78C87 84 81 89 75 90L34 98C27 99 22 93 24 87L32 40Z"
            fill="url(#zg-ribbon)"
          />

          {/* Inner Cutout (revealing dark/photo center) */}
          <path
            d="M39 44L47 31L86 25L80 71L72 82L34 89L39 44Z"
            fill="#0B0F19"
          />

          {/* Interior Mountain Silhouette */}
          <path
            d="M38 74L54 54C56 51 60 51 62 54L71 65L77 59C79 57 82 57 84 59L87 63L85 71L38 74Z"
            fill="url(#zg-mountain)"
          />

          {/* Sun / Moon Orb */}
          <circle cx="78" cy="40" r="6" fill="#F8FAFC" />
        </g>
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight text-neutral-900 flex items-baseline leading-none ${text}`}>
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent font-extrabold">
              Zailo
            </span>
            <span className="ml-1.5 text-neutral-900 font-bold">Graph</span>
          </div>

          {showTagline && (
            <span className={`font-mono font-medium tracking-widest text-neutral-400 uppercase mt-1 ${tagline}`}>
              Your images. Your workflow. Your control.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const ImazoraLogo = ZailoGraphLogo;
