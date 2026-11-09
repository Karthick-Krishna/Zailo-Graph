import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityDefinition, UtilityCategory } from '../../types/utility';
import {
  Sparkles,
  Maximize2,
  FileDown,
  Smartphone,
  Repeat,
  FileCode2,
  PenTool,
  Zap,
  Eraser,
  Sliders,
  Crop,
  Share2,
  Stamp,
  LayoutGrid,
  Palette,
  IdCard,
  SunMedium,
  Wand2,
  FileSearch,
  ShieldCheck,
  EyeOff,
  AppWindow,
  Binary,
  FileCode,
  Camera,
  Lock,
  Search,
  X,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Layers,
  RotateCw,
  Type,
  Grid,
  ArrowRightLeft
} from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Maximize2,
  FileDown,
  Smartphone,
  Repeat,
  FileCode2,
  PenTool,
  Zap,
  Eraser,
  Sliders,
  Crop,
  Share2,
  Stamp,
  LayoutGrid,
  Palette,
  IdCard,
  SunMedium,
  Wand2,
  FileSearch,
  ShieldCheck,
  EyeOff,
  AppWindow,
  Binary,
  FileCode,
  Camera,
  RotateCw,
  Type,
  Grid,
  ArrowRightLeft,
};

const CATEGORIES: Array<{ id: UtilityCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All (24)' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'convert', label: 'Convert' },
  { id: 'edit', label: 'Edit & Crop' },
  { id: 'social', label: 'Social & Share' },
  { id: 'metadata', label: 'Metadata' },
];

interface ToolSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const { activeUtilityId, setActiveUtilityId } = useSession();
  const { user, isUtilityUnlocked } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on keyboard shortcut '/' or '⌘K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tools by category and search query
  const filteredUtilities = useMemo(() => {
    return UTILITIES.filter(u => {
      const matchesCategory = selectedCategory === 'all' || u.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.inputFormats.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.outputFormats.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Group utilities by category when viewing 'All' and no search query active
  const groupedUtilities = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery.trim()) return null;

    const groups: Record<string, UtilityDefinition[]> = {
      '1-Click Automation': UTILITIES.filter(u => u.category === 'recipes'),
      'Optimize & Compress': UTILITIES.filter(u => u.category === 'optimize'),
      'Convert & Vectorize': UTILITIES.filter(u => u.category === 'convert'),
      'Creative Studio & Crop': UTILITIES.filter(u => u.category === 'edit'),
      'Social & Sharing': UTILITIES.filter(u => u.category === 'social'),
      'Privacy & Metadata': UTILITIES.filter(u => u.category === 'metadata'),
    };
    return groups;
  }, [selectedCategory, searchQuery]);

  const renderToolButton = (u: UtilityDefinition) => {
    const isSelected = u.id === activeUtilityId;
    const isLocked = !isUtilityUnlocked(u.id);
    const isDocConverter = u.id === 'document-converter';
    const IconComponent = ICON_MAP[u.icon] || Sparkles;

    if (isCollapsed) {
      return (
        <div key={u.id} className="relative group mb-1.5">
          <button
            onClick={() => setActiveUtilityId(u.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isDocConverter
                ? isSelected
                  ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-sky-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                  : 'bg-gradient-to-br from-blue-50 to-sky-100 text-blue-700 border-2 border-blue-400/90 shadow-2xs hover:border-blue-600 hover:scale-105'
                : isSelected
                ? 'bg-neutral-900 text-cyan-300 shadow-sm ring-1 ring-neutral-800'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            aria-label={u.name}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            {isDocConverter && !isLocked && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            )}
            {isLocked && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                <Lock className="w-2 h-2" />
              </span>
            )}
          </button>

          {/* Instant Floating Tooltip Popover (Senior Dev Desktop Tooling) */}
          <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center">
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-medium tracking-tight shadow-xl border border-neutral-700/60 whitespace-nowrap flex items-center gap-1.5">
              <span>{u.name}</span>
              {isDocConverter ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-600 text-white uppercase font-bold">
                  PRO • 38 in 1
                </span>
              ) : u.badge ? (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-cyan-300 uppercase">
                  {u.badge}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (isMobileDrawer) {
      if (isDocConverter) {
        return (
          <button
            key={u.id}
            onClick={() => {
              setActiveUtilityId(u.id);
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group mb-2.5 border-2 ${
              isSelected
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 border-blue-400 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-300/40'
                : 'bg-gradient-to-r from-blue-50 via-white to-sky-50 border-blue-400 text-blue-950 shadow-xs hover:border-blue-500'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                isSelected ? 'bg-white/20 text-white' : 'bg-blue-600 text-white shadow-xs'
              }`}>
                <IconComponent className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-blue-950'}`}>
                    {u.name}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase font-bold ${
                    isSelected ? 'bg-white/20 text-white' : isLocked ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    PRO • 38 in 1
                  </span>
                </div>
                <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-700'}`}>
                  Convert Word, PDF, PPT, Excel XLS/XLSX &amp; Images
                </p>
              </div>
            </div>
            <div className="pl-2 shrink-0">
              {isLocked ? (
                <Lock className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
              ) : (
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-blue-600'}`}>&rarr;</span>
              )}
            </div>
          </button>
        );
      }

      return (
        <button
          key={u.id}
          onClick={() => {
            setActiveUtilityId(u.id);
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group mb-2 border ${
            isSelected
              ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSelected ? 'bg-neutral-800 text-cyan-400' : 'bg-neutral-100 text-neutral-600'
            }`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold truncate">{u.name}</span>
                {u.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-semibold ${
                    isSelected ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}>
                    {u.badge}
                  </span>
                )}
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {u.description}
              </p>
            </div>
          </div>

          <div className="pl-2 shrink-0">
            {isLocked ? (
              <Lock className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
            ) : (
              <span className={`text-xs ${isSelected ? 'text-cyan-400 font-bold' : 'text-neutral-400'}`}>&rarr;</span>
            )}
          </div>
        </button>
      );
    }

    if (isDocConverter) {
      return (
        <button
          key={u.id}
          onClick={() => {
            setActiveUtilityId(u.id);
            if (isMobileDrawer && onCloseMobile) onCloseMobile();
          }}
          className={`w-full px-2.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group mb-2.5 border-2 relative overflow-hidden ${
            isSelected
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 text-white font-bold shadow-md shadow-blue-600/30 border-blue-400 ring-2 ring-blue-300/40'
              : 'bg-gradient-to-r from-blue-50/95 via-sky-50/70 to-white hover:from-blue-100/90 hover:via-sky-100/80 hover:to-white text-blue-950 font-bold border-blue-400/90 hover:border-blue-600 shadow-2xs hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
              isSelected ? 'bg-white/20 text-white' : 'bg-blue-600 text-white shadow-2xs group-hover:scale-105'
            }`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold truncate tracking-tight ${isSelected ? 'text-white' : 'text-blue-950'}`}>
                  {u.name}
                </span>
              </div>
              <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100 font-normal' : 'text-blue-700/80 font-medium'}`}>
                38 in 1 Universal Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {isLocked && (
              <Lock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
            )}
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
              isSelected
                ? 'bg-white/25 text-white ring-1 ring-white/40'
                : isLocked
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-blue-600 text-white shadow-xs'
            }`}>
              {isLocked ? 'PRO' : '38 in 1'}
            </span>
          </div>
        </button>
      );
    }

    return (
      <button
        key={u.id}
        onClick={() => {
          setActiveUtilityId(u.id);
          if (isMobileDrawer && onCloseMobile) {
            onCloseMobile();
          }
        }}
        className={`w-full px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group mb-1 min-h-[40px] ${
          isSelected
            ? 'bg-neutral-900 text-white font-medium shadow-sm'
            : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 font-normal'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Left Active Glow Indicator Pip */}
          <span className={`w-1 h-3.5 rounded-full transition-all shrink-0 ${
            isSelected 
              ? 'bg-gradient-to-b from-blue-500 to-sky-400 opacity-100' 
              : 'opacity-0'
          }`} />
          <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-300' : 'text-neutral-500 group-hover:text-neutral-800'}`} />
          <span className="text-xs truncate tracking-tight">{u.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {u.badge && !isSelected && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 border border-neutral-200/60 uppercase">
              {u.badge}
            </span>
          )}
          {isLocked && (
            <Lock className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
          )}
        </div>
      </button>
    );
  };

  return (
    <aside
      className={
        isMobileDrawer
          ? "w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col justify-between overflow-hidden border-t border-neutral-200 animate-in slide-in-from-bottom duration-200 relative z-30"
          : `hidden md:flex h-full bg-white border-r border-neutral-200/90 flex-col shrink-0 select-none transition-all duration-200 z-20 ${
              isCollapsed ? 'w-16 items-center py-3' : 'w-64 sm:w-72'
            }`
      }
    >
      {/* Mobile Handle & Close Bar */}
      {isMobileDrawer && (
        <div className="pt-3 pb-2 px-6 flex flex-col items-center border-b border-neutral-100 bg-neutral-50/70">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300 mb-2"></div>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-neutral-900 font-display">Choose Utility</span>
              <span className="text-[10px] font-mono text-neutral-500 bg-white px-2 py-0.5 rounded-full border border-neutral-200 font-semibold">
                25 Tools
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
              aria-label="Close tools drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Header: Brand & Collapse Toggle */}
      {!isMobileDrawer && (
        <div className={`p-3.5 border-b border-neutral-200/80 flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              <span className="text-xs font-bold text-neutral-900 tracking-tight">Toolbox</span>
              <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-200/60 font-semibold">
                25
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer border border-transparent hover:border-neutral-200"
              title={isCollapsed ? 'Expand Toolbox Sidebar' : 'Collapse Toolbox to Rail'}
              aria-label="Toggle toolbox sidebar"
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      {/* Search Input (When Expanded) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 25 tools... (/)"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white focus:ring-1 focus:ring-neutral-400 focus:outline-none rounded-xl border border-neutral-200 text-neutral-800 placeholder:text-neutral-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (When no active search) */}
          {!searchQuery && (
            <div className="relative pt-2">
              <div 
                className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar" 
                style={{ scrollbarWidth: 'none' }}
              >
                {CATEGORIES.map(cat => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition cursor-pointer ${
                        isCatSelected
                          ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 border border-neutral-200/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool List Container */}
      <div className={`flex-1 overflow-y-auto px-2.5 py-3 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {filteredUtilities.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-neutral-400">No tools match "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-2 text-[11px] font-semibold text-neutral-800 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : groupedUtilities ? (
          // Grouped Categories view
          Object.entries(groupedUtilities).map(([groupTitle, tools]) => {
            if (tools.length === 0) return null;
            return (
              <div key={groupTitle} className="mb-4">
                <div className="px-2 mb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {groupTitle}
                </div>
                {tools.map(u => renderToolButton(u))}
              </div>
            );
          })
        ) : (
          // Filtered / Searched flat list
          filteredUtilities.map(u => renderToolButton(u))
        )}
      </div>

      {/* Bottom Pro / System Status Banner (When expanded) */}
      {!isCollapsed && (
        <div 
          className="p-3 border-t border-neutral-200/80 bg-neutral-50/60"
          style={isMobileDrawer ? { paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' } : undefined}
        >
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-medium text-neutral-700">100% Private Processing</span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
              Client WASM
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

