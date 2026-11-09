import React from 'react';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Cpu, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-full bg-white/95 backdrop-blur-md text-neutral-700 pt-10 sm:pt-14 pb-8 sm:pb-12 mt-12 sm:mt-16 border-t border-neutral-200 relative overflow-hidden">
      {/* Subtle Ambient Light Gradients matching page theme */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-violet-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-6 right-1/4 w-80 h-80 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Brand, Collaborative Credit & Specs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-3">
              <ZailoGraphLogo size="md" showText={true} theme="light" />
            </div>
            
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-neutral-900 tracking-wide">
                Zailo Graph by Coralgenz &amp; Zorquelz
              </h3>
              <p className="text-xs font-semibold text-violet-600">
                A Collaborative Product by Coralgenz &amp; Zorquelz
              </p>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Engineered as a zero-cloud, privacy-first browser media workstation. 
              All image operations execute in local hardware memory using WebAssembly, Web Workers, and OPFS.
            </p>
          </div>

          {/* Trust Guarantees & Back to Top */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-neutral-50/90 border border-neutral-200/90 flex items-center gap-2.5 text-xs text-neutral-700 shadow-2xs">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900">Zero Server Transmission</p>
                <p className="text-[10px] text-neutral-500 font-mono">100% In-Browser Memory</p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-neutral-50/90 border border-neutral-200/90 flex items-center gap-2.5 text-xs text-neutral-700 shadow-2xs">
              <Cpu className="w-4 h-4 text-cyan-600 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900">OPFS Virtual Storage</p>
                <p className="text-[10px] text-neutral-500 font-mono">High-Throughput Local Disk</p>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="py-2.5 px-4 sm:p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 hover:text-neutral-900 transition cursor-pointer border border-neutral-200/90 shadow-2xs flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
              title="Scroll to Top"
              aria-label="Scroll to top of workspace"
            >
              <ArrowUp className="w-4 h-4 text-neutral-600" />
              <span className="sm:hidden text-xs font-semibold">Back to Top</span>
            </button>
          </div>
        </div>

        {/* Copyright & Legal Attribution */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>
            &copy; 2026 Zailo Graph by Coralgenz &amp; Zorquelz. A Collaborative Product by Coralgenz &amp; Zorquelz. All 25 browser utilities are 100% free forever.
          </p>

          <div className="flex items-center justify-center gap-3 text-neutral-500 font-mono text-[11px]">
            <span>Apache-2.0 License</span>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-violet-600 hover:text-violet-700 transition cursor-pointer font-sans font-semibold p-1"
            >
              Back to Top &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
