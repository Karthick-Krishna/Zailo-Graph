import React from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityDefinition } from '../../types/utility';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { Shield, Lock, ArrowUp, Sparkles, ExternalLink, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveUtilityId } = useSession();
  const { isUtilityUnlocked, openAuthModal } = useAuth();

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

  // Group utilities for the footer columns
  const convertTools = UTILITIES.filter(u => u.category === 'convert');
  const editTools = UTILITIES.filter(u => u.category === 'edit' || u.category === 'recipes');
  const optimizeTools = UTILITIES.filter(u => u.category === 'optimize' || u.category === 'social');
  const privacyTools = UTILITIES.filter(u => u.category === 'metadata');

  const renderToolLink = (u: UtilityDefinition) => {
    const isLocked = !isUtilityUnlocked(u.id);
    return (
      <li key={u.id}>
        <a
          href={`/tools/${u.id}.html`}
          onClick={(e) => handleToolClick(u, e)}
          className="group flex items-center justify-between py-1 text-xs text-neutral-600 hover:text-violet-600 transition-colors cursor-pointer"
          title={`${u.name} — ${u.description}`}
        >
          <span className="group-hover:translate-x-0.5 transition-transform truncate mr-2">
            {u.name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isLocked && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/80 font-bold flex items-center gap-0.5">
                <Lock className="w-2 h-2" />
                <span>PRO</span>
              </span>
            )}
          </div>
        </a>
      </li>
    );
  };

  return (
    <footer className="w-full bg-neutral-900 text-neutral-300 pt-16 pb-12 mt-16 border-t border-neutral-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Brand & Value Proposition */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-neutral-800">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2">
              <ZailoGraphLogo size="md" showText={true} />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Privacy-first, browser-native image workspace. 100% client-side memory execution with zero cloud storage, zero tracking, and zero API costs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center gap-2 text-xs text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center gap-2 text-xs text-neutral-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>WASM &amp; Web Workers</span>
            </div>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer border border-neutral-700"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Directory Columns for The 25 Browser Utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Format Conversion & Vectorization */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              Format Conversion ({convertTools.length})
            </h3>
            <ul className="space-y-1.5">
              {convertTools.map(renderToolLink)}
            </ul>
          </div>

          {/* Column 2: Creative Studio & Editing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Creative Studio ({editTools.length})
            </h3>
            <ul className="space-y-1.5">
              {editTools.map(renderToolLink)}
            </ul>
          </div>

          {/* Column 3: Optimization & Social */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Optimization &amp; Social ({optimizeTools.length})
            </h3>
            <ul className="space-y-1.5">
              {optimizeTools.map(renderToolLink)}
            </ul>
          </div>

          {/* Column 4: Security & Privacy Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Security &amp; Privacy ({privacyTools.length})
            </h3>
            <ul className="space-y-1.5">
              {privacyTools.map(renderToolLink)}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Platform Details */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 ZailoGraph by Zorquelz. Apache-2.0 License. The 25 Browser Utilities are 100% free forever.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Client OPFS Virtual Disk</span>
            <span>•</span>
            <span>Zero Server Uploads</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-neutral-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
