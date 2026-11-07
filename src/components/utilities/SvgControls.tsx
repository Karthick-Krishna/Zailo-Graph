import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { FileCode2, PenTool, Sparkles, Download, Copy, Check, Eye } from 'lucide-react';

export const SvgControls: React.FC = () => {
  const { activeImage, activeUtilityId, executeActiveUtility } = useSession();
  const { user, openAuthModal } = useAuth();

  // SVG to High-Res PNG state (Utility 06)
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2);
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [transparentBg, setTransparentBg] = useState<boolean>(true);

  // PNG to SVG Vectorizer state (Utility 07)
  const [vectorMode, setVectorMode] = useState<'color' | 'monochrome'>('color');
  const [colorCount, setColorCount] = useState<number>(8);
  const [filterSpeckle, setFilterSpeckle] = useState<number>(4);
  const [svgOutputCode, setSvgOutputCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!activeImage) return null;

  const isVectorize = activeUtilityId === 'png-to-svg';

  const handleRasterizeSvg = (mult = scaleMultiplier, dpi = targetDpi, trans = transparentBg) => {
    // Check if user attempts >2x without signing in
    if (mult > 2 && !user) {
      openAuthModal('pro_feature', 'svg-to-png', '16× High-Resolution print rendering is completely free. Sign in with email to render up to 16,000px!');
      return;
    }

    executeActiveUtility({
      scaleMultiplier: mult,
      dpi,
      transparentBackground: trans,
    });
  };

  const handleVectorize = () => {
    if (!user) {
      openAuthModal('pro_feature', 'png-to-svg', 'PNG to SVG Vectorization is completely free. Sign in with email to trace full-color vector paths!');
      return;
    }

    // Execute vector tracing
    executeActiveUtility({
      mode: vectorMode,
      colorCount,
      filterSpeckle,
    });

    // Generate sample SVG representation
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${activeImage.width || 800} ${activeImage.height || 600}">
  <!-- Imazora VTracer Vector Paths -->
  <path fill="#09090B" d="M150 100 L650 100 Q700 300 650 500 L150 500 Z" />
  <circle cx="400" cy="300" r="120" fill="#F59E0B" opacity="0.9" />
</svg>`;
    setSvgOutputCode(sampleSvg);
  };

  const handleCopySvg = () => {
    if (!svgOutputCode) return;
    navigator.clipboard.writeText(svgOutputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {!isVectorize ? (
        /* Utility 06: SVG to High-Resolution PNG */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Resolution Multiplier</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              {[
                { mult: 1, label: '1× (1K)' },
                { mult: 2, label: '2× (2K)' },
                { mult: 4, label: '4× (4K)', isPro: true },
                { mult: 16, label: '16× (Print)', isPro: true },
              ].map(item => (
                <button
                  key={item.mult}
                  onClick={() => {
                    setScaleMultiplier(item.mult);
                    handleRasterizeSvg(item.mult);
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center ${
                    scaleMultiplier === item.mult
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isPro && !user && (
                    <span className="text-[9px] text-amber-600 font-bold">Pro Free</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Print DPI Standard</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { dpi: 72, label: '72 DPI (Web)' },
                { dpi: 150, label: '150 DPI (Medium)' },
                { dpi: 300, label: '300 DPI (Print)' },
              ].map(d => (
                <button
                  key={d.dpi}
                  onClick={() => {
                    setTargetDpi(d.dpi);
                    handleRasterizeSvg(scaleMultiplier, d.dpi);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                    targetDpi === d.dpi
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-800">Preserve Alpha Transparency</span>
            <button
              onClick={() => {
                const next = !transparentBg;
                setTransparentBg(next);
                handleRasterizeSvg(scaleMultiplier, targetDpi, next);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                transparentBg ? 'bg-neutral-900' : 'bg-neutral-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                transparentBg ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      ) : (
        /* Utility 07: PNG to SVG Vectorizer */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Vectorization Mode</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => setVectorMode('color')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vectorMode === 'color' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Full Color Curves
              </button>
              <button
                onClick={() => setVectorMode('monochrome')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vectorMode === 'monochrome' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Monochrome Silhouette
              </button>
            </div>
          </div>

          {vectorMode === 'color' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Color Precision Quantization</span>
                <span className="font-mono">{colorCount} colors</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full accent-neutral-900"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Noise Filter (Speckle Suppression)</span>
              <span className="font-mono">{filterSpeckle} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={filterSpeckle}
              onChange={(e) => setFilterSpeckle(parseInt(e.target.value))}
              className="w-full accent-neutral-900"
            />
          </div>

          <button
            onClick={handleVectorize}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Trace Vector Paths Now</span>
          </button>

          {svgOutputCode && (
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">Generated SVG Code</span>
                <button
                  onClick={handleCopySvg}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy SVG'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[10px] font-mono text-neutral-700 overflow-x-auto max-h-32">
                {svgOutputCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

