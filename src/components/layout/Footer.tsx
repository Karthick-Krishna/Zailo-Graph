import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityDefinition } from '../../types/utility';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { 
  Shield, 
  Lock, 
  ArrowUp, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Zap,
  Sliders,
  Crop,
  Share2,
  FileSearch,
  Repeat
} from 'lucide-react';

type FilterCategory = 'all' | 'optimize' | 'convert' | 'edit' | 'social' | 'metadata';

interface FilterTab {
  id: FilterCategory;
  label: string;
  count: number;
}

export const Footer: React.FC = () => {
  const { setActiveUtilityId } = useSession();
  const { isUtilityUnlocked, openAuthModal } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const handleToolClick = (tool: UtilityDefinition, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveUtilityId(tool.id);
    const isLocked = !isUtilityUnlocked(tool.id);
    if (isLocked) {
      openAuthModal('pro_feature', tool.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter tabs definition
  const filterTabs: FilterTab[] = [
    { id: 'all', label: 'All 25', count: 25 },
    { 
      id: 'optimize', 
      label: 'Optimize', 
      count: UTILITIES.filter(u => u.category === 'optimize').length 
    },
    { 
      id: 'convert', 
      label: 'Convert', 
      count: UTILITIES.filter(u => u.category === 'convert').length 
    },
    { 
      id: 'edit', 
      label: 'Edit & Crop', 
      count: UTILITIES.filter(u => u.category === 'edit' || u.category === 'recipes').length 
    },
    { 
      id: 'social', 
      label: 'Social & Share', 
      count: UTILITIES.filter(u => u.category === 'social').length 
    },
    { 
      id: 'metadata', 
      label: 'Metadata', 
      count: UTILITIES.filter(u => u.category === 'metadata').length 
    },
  ];

  const filteredUtilities = UTILITIES.filter(tool => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'edit') return tool.category === 'edit' || tool.category === 'recipes';
    return tool.category === activeFilter;
  });

  return (
    <footer className="w-full bg-neutral-950 text-neutral-300 pt-12 sm:pt-20 pb-10 sm:pb-12 mt-12 sm:mt-20 border-t border-neutral-800/80 relative overflow-hidden select-none">
      {/* Subtle Aurora Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        {/* ========================================================= */}
        {/* SECTION 1: THE 25 BROWSER UTILITIES DIRECTORY             */}
        {/* ========================================================= */}
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-neutral-800/80 pb-5 sm:pb-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] font-mono font-semibold text-neutral-300 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse"></span>
                <span>Complete Studio Directory</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                The 25 Browser Utilities
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Select any utility below to launch its dedicated workspace with custom parameters.
              </p>
            </div>

            {/* Quick stats badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Client-Side RAM</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>WebAssembly &amp; Workers</span>
              </span>
            </div>
          </div>

          {/* Category Filter Pills (Edge-to-edge touch scroll on mobile) */}
          <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[36px] sm:min-h-[38px] ${
                  activeFilter === tab.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeFilter === tab.id
                      ? 'bg-violet-700/60 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Directory Grid of 25 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
            {filteredUtilities.map(tool => {
              const isLocked = !isUtilityUnlocked(tool.id);
              const isPro = tool.isCompetitorPaid;

              return (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}.html`}
                  onClick={(e) => handleToolClick(tool, e)}
                  className="group relative p-3.5 sm:p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/90 hover:border-violet-500/50 transition-all duration-200 flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-violet-950/20 active:scale-[0.99]"
                >
                  {/* Card Header: Category & Access Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-2 py-0.5 rounded-md bg-neutral-800/90 border border-neutral-700/60 font-semibold">
                      {tool.category}
                    </span>

                    {isPro ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Free Pro</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Local</span>
                      </span>
                    )}
                  </div>

                  {/* Card Body: Title & Exact Description */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
                      <span className="truncate mr-1">{tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70 sm:opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-violet-400 shrink-0" />
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {tool.description}
                    </p>
                  </div>

                  {/* Card Footer: Capability Badge */}
                  <div className="pt-2 border-t border-neutral-800/70 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${tool.supportsBatch ? 'bg-cyan-400' : 'bg-neutral-500'}`}></span>
                      <span>{tool.supportsBatch ? 'Batch Capable' : 'Single Studio'}</span>
                    </span>
                    <span className="text-[10px] text-violet-400 group-hover:text-violet-300 font-semibold flex items-center gap-0.5">
                      Launch &rarr;
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: BRAND, COLLABORATION & SPECS                   */}
        {/* ========================================================= */}
        <div className="pt-6 sm:pt-8 border-t border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Brand & Collaborative Credit */}
          <div className="space-y-2.5 sm:space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <ZailoGraphLogo size="md" showText={true} theme="dark" />
            </div>
            
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-sm font-bold text-white tracking-wide">
                Zailo Graph by Coralgenz &amp; Zorquelz
              </p>
              <p className="text-xs font-semibold text-violet-400">
                A Collaborative Product by Coralgenz &amp; Zorquelz
              </p>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Engineered as a zero-cloud, privacy-first browser media workstation. 
              All image operations execute in local hardware memory using WebAssembly, Web Workers, and OPFS.
            </p>
          </div>

          {/* Trust Guarantees & Back to Top */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">Zero Server Transmission</p>
                <p className="text-[10px] text-neutral-400 font-mono">100% In-Browser Memory</p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-300">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">OPFS Virtual Storage</p>
                <p className="text-[10px] text-neutral-400 font-mono">High-Throughput Local Disk</p>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="py-2.5 px-4 sm:p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer border border-neutral-800 shadow-sm flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
              title="Scroll to Top"
              aria-label="Scroll to top of workspace"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="sm:hidden text-xs font-semibold">Back to Top</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: COPYRIGHT & LEGAL ATTRIBUTION                 */}
        {/* ========================================================= */}
        <div className="pt-5 sm:pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-neutral-400 text-center sm:text-left">
          <p>
            &copy; 2026 Zailo Graph by Coralgenz &amp; Zorquelz. A Collaborative Product by Coralgenz &amp; Zorquelz. All 25 browser utilities are 100% free forever.
          </p>

          <div className="flex items-center justify-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>Apache-2.0</span>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-violet-400 hover:text-violet-300 transition cursor-pointer font-sans font-semibold p-1"
            >
              Top &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
