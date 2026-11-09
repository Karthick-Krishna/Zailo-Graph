import React from 'react';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Cpu, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-neutral-950 text-neutral-300 pt-10 sm:pt-14 pb-8 sm:pb-12 mt-12 sm:mt-16 border-t border-neutral-800/80 relative overflow-hidden select-none">
      {/* Subtle Aurora Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Brand, Collaborative Credit & Specs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-3">
              <ZailoGraphLogo size="md" showText={true} theme="dark" />
            </div>
            
            <div className="space-y-0.5">
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

        {/* Copyright & Legal Attribution */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-neutral-400 text-center sm:text-left">
          <p>
            &copy; 2026 Zailo Graph by Coralgenz &amp; Zorquelz. A Collaborative Product by Coralgenz &amp; Zorquelz. All 25 browser utilities are 100% free forever.
          </p>

          <div className="flex items-center justify-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>Apache-2.0 License</span>
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
