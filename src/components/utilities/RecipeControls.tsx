import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  Sparkles, 
  ShoppingBag, 
  Video, 
  IdCard, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';

interface RecipeDef {
  id: 'ecommerce' | 'youtube' | 'passport' | 'web_seo' | 'privacy';
  name: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  steps: string[];
  output: string;
}

const RECIPES: RecipeDef[] = [
  {
    id: 'ecommerce',
    name: 'Amazon & Shopify E-Commerce',
    badge: 'Store Ready',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
    summary: 'Converts raw product photos into compliant marketplace listings in 1 click.',
    steps: ['Studio White Background', '1:1 Square Auto-Padding', 'Product Micro-Contrast', 'WebP/AVIF <300KB'],
    output: 'Square WebP/AVIF • 1:1 Aspect',
  },
  {
    id: 'youtube',
    name: 'YouTube & Creator Thumbnail',
    badge: 'High CTR',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    icon: <Video className="w-4 h-4 text-red-600" />,
    summary: 'Optimizes video covers for maximum mobile click-through rates and punchy colors.',
    steps: ['16:9 Cinema Crop', 'Saturation & Vibrancy Boost (+25%)', 'High-Pass Edge Sharpening', '1280×720 MozJPEG'],
    output: '1280 × 720 px • 16:9 Cinema JPEG',
  },
  {
    id: 'passport',
    name: 'Biometric Passport 6-Grid Sheet',
    badge: 'Official DPI',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <IdCard className="w-4 h-4 text-blue-600" />,
    summary: 'Generates a ready-to-print 4×6 photo sheet with 6 biometric visa photos.',
    steps: ['Background Whitening', 'Biometric 2×2" Framing', '300 DPI Resolution', '6-Photo Printable Grid'],
    output: '1800 × 1200 px (4×6") Print Sheet',
  },
  {
    id: 'web_seo',
    name: 'Lighthouse 100 Web SEO Pack',
    badge: 'PageSpeed 100',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Zap className="w-4 h-4 text-amber-600" />,
    summary: 'Prepares hero and article images for optimal Core Web Vitals performance.',
    steps: ['Downscale to Max 1920px', 'Strip All EXIF GPS Metadata', 'Next-Gen AVIF / WebP Encode (82%)', 'Sub-150KB Target'],
    output: 'AVIF / WebP • Lossless Metadata Strip',
  },
  {
    id: 'privacy',
    name: 'Total Privacy & Metadata Cleanse',
    badge: 'Zero Trace',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
    summary: 'Destroys device serial numbers, GPS tracking coordinates, and camera timestamps.',
    steps: ['Wipe GPS Latitude / Longitude', 'Scrub EXIF MakerNotes', 'Sanitize Canvas Raster', 'Clean Anonymous PNG'],
    output: 'Pristine Sanitized PNG',
  },
];

export const RecipeControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams, isProcessing } = useSession();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDef>(RECIPES[0]);
  const initialRunRef = useRef<string | null>(null);

  if (!activeImage) return null;

  const handleRunRecipe = (recipe = selectedRecipe) => {
    const params = {
      recipeId: recipe.id,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  useEffect(() => {
    const runKey = `${activeImage.id}_recipe_${selectedRecipe.id}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleRunRecipe(selectedRecipe);
    }
  }, [activeImage.id, selectedRecipe.id]);

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 border border-violet-200/80">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span>1-Click Multi-Step Workflows</span>
        </div>
        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
          Automate complex multi-step processing chains instantly without manual configuration.
        </p>
      </div>

      {/* Recipe Cards List */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-neutral-700">Select Production Pipeline</label>
        {RECIPES.map(r => {
          const isSelected = selectedRecipe.id === r.id;
          return (
            <div
              key={r.id}
              onClick={() => {
                setSelectedRecipe(r);
                handleRunRecipe(r);
              }}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 shadow-md ring-2 ring-violet-500/30'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-neutral-100">{r.icon}</div>
                  <span className="text-xs font-bold text-neutral-900">{r.name}</span>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${r.badgeColor}`}>
                  {r.badge}
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 leading-snug mb-2.5">
                {r.summary}
              </p>

              {/* Multi-Step Pipeline Flow */}
              <div className="flex flex-wrap items-center gap-1 text-[10px] text-neutral-600 pt-2 border-t border-neutral-200/60 font-mono">
                {r.steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200/60 text-neutral-800">
                      {step}
                    </span>
                    {idx < r.steps.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Re-Run Button */}
      <button
        onClick={() => handleRunRecipe()}
        disabled={isProcessing}
        className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition shadow-md shadow-violet-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>{isProcessing ? 'Processing Pipeline...' : `Execute ${selectedRecipe.name}`}</span>
      </button>
    </div>
  );
};
