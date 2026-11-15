import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Table, 
  Presentation, 
  Image as ImageIcon, 
  FileCode, 
  Settings, 
  MessageSquare, 
  Keyboard, 
  Trash2, 
  ArrowRight, 
  CornerDownLeft, 
  X, 
  Layers, 
  ShieldCheck,
  Star,
  ExternalLink
} from 'lucide-react';
import { UTILITIES } from '../../types/utility';
import { CONVERSIONS } from '../../services/conversion/conversionRegistry';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

interface PaletteItem {
  id: string;
  name: string;
  description: string;
  category: 'Image Studio' | 'Document' | 'Spreadsheet' | 'Presentation' | 'Action';
  type: 'utility' | 'conversion' | 'action';
  icon: React.FC<{ className?: string }>;
  tags: string[];
  badge?: string;
  sourceFormat?: string;
  targetFormat?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { 
    setActiveUtilityId, 
    setActiveView, 
    setIsFeedbackModalOpen,
    clearWorkspace,
    images
  } = useSession();

  const { openSettings } = useAuth();

  // Helper to navigate to a conversion
  const navigateToConversion = (conversionId: string) => {
    setActiveView('studio');
    setActiveUtilityId('document-converter');
    if (typeof window !== 'undefined') {
      window.history.pushState({ conversion: conversionId }, '', `/${conversionId}.html`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onClose();
  };

  // Helper to navigate to an image utility
  const navigateToUtility = (utilityId: string) => {
    setActiveView('studio');
    setActiveUtilityId(utilityId);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', `/${utilityId}.html`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onClose();
  };

  // Compile all 61 tools + core actions into unified palette index
  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = [];

    // 1. Core Actions & Navigation
    items.push({
      id: 'action-feedback-page',
      name: 'Open Community Reviews & Feedback Board',
      description: 'Browse user reviews, bug reports, and official developer replies',
      category: 'Action',
      type: 'action',
      icon: Star,
      tags: ['reviews', 'ratings', 'feedback', 'community', 'forum', 'bugs'],
      badge: 'Hub',
      onSelect: () => {
        setActiveView('feedback');
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/feedback');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        onClose();
      },
    });

    items.push({
      id: 'action-feedback-modal',
      name: 'Submit Quality Feedback / Defect Report',
      description: 'Report an issue or rate engine fidelity directly to maintainers',
      category: 'Action',
      type: 'action',
      icon: MessageSquare,
      tags: ['report', 'bug', 'feedback', 'rate', 'support'],
      badge: 'Modal',
      onSelect: () => {
        setIsFeedbackModalOpen(true);
        onClose();
      },
    });

    items.push({
      id: 'action-settings',
      name: 'Account & Local Storage Settings',
      description: 'Manage authentication profile, OPFS cache, and session data',
      category: 'Action',
      type: 'action',
      icon: Settings,
      tags: ['settings', 'account', 'cache', 'storage', 'profile', 'google'],
      badge: 'Preferences',
      onSelect: () => {
        openSettings();
        onClose();
      },
    });

    if (onOpenShortcuts) {
      items.push({
        id: 'action-shortcuts',
        name: 'Keyboard Shortcuts Reference HUD',
        description: 'View all keyboard shortcuts for high-speed workflow control',
        category: 'Action',
        type: 'action',
        icon: Keyboard,
        tags: ['shortcuts', 'keyboard', 'hotkeys', 'hud'],
        badge: '?',
        onSelect: () => {
          onOpenShortcuts();
          onClose();
        },
      });
    }

    if (images.length > 0) {
      items.push({
        id: 'action-clear',
        name: 'Clear Active Workspace',
        description: `Remove ${images.length} open ${images.length === 1 ? 'file' : 'files'} from local canvas memory`,
        category: 'Action',
        type: 'action',
        icon: Trash2,
        tags: ['clear', 'delete', 'reset', 'empty', 'workspace'],
        badge: 'Canvas',
        onSelect: () => {
          clearWorkspace();
          onClose();
        },
      });
    }

    // 2. The 20 Image & Creative Studio Utilities
    UTILITIES.forEach(u => {
      items.push({
        id: u.id,
        name: u.name,
        description: u.description,
        category: 'Image Studio',
        type: 'utility',
        icon: ImageIcon,
        tags: [
          u.name.toLowerCase(),
          u.id.toLowerCase(),
          u.category.toLowerCase(),
          ...u.inputFormats.map(f => f.split('/')[1] || ''),
          ...u.outputFormats.map(f => f.split('/')[1] || ''),
          'image',
          'photo',
          'studio',
        ],
        badge: u.badge || 'WASM',
        onSelect: () => navigateToUtility(u.id),
      });
    });

    // 3. The 41 Document, Spreadsheet & Presentation Converters
    CONVERSIONS.forEach(c => {
      let category: 'Document' | 'Spreadsheet' | 'Presentation' = 'Document';
      let icon = FileText;

      if (c.category === 'spreadsheets') {
        category = 'Spreadsheet';
        icon = Table;
      } else if (c.category === 'presentations') {
        category = 'Presentation';
        icon = Presentation;
      }

      items.push({
        id: c.id,
        name: c.name,
        description: c.description,
        category,
        type: 'conversion',
        icon,
        tags: [
          c.name.toLowerCase(),
          c.id.toLowerCase(),
          c.sourceFormat.toLowerCase(),
          c.targetFormat.toLowerCase(),
          category.toLowerCase(),
          'convert',
          'file',
          c.sourceFormat.toLowerCase().includes('xls') || c.sourceFormat.toLowerCase().includes('csv') ? 'excel' : '',
          c.targetFormat.toLowerCase().includes('xls') || c.targetFormat.toLowerCase().includes('csv') ? 'excel' : '',
          c.sourceFormat.toLowerCase().includes('doc') ? 'word' : '',
          c.targetFormat.toLowerCase().includes('doc') ? 'word' : '',
        ].filter(Boolean),
        sourceFormat: c.sourceFormat,
        targetFormat: c.targetFormat,
        badge: `${c.sourceFormat} → ${c.targetFormat}`,
        onSelect: () => navigateToConversion(c.id),
      });
    });

    return items;
  }, [images.length, onOpenShortcuts]);

  // Filtered Results based on search query and category tab
  const filteredItems = useMemo(() => {
    let result = allItems;

    // Filter tab
    if (selectedFilter !== 'all') {
      result = result.filter(item => {
        if (selectedFilter === 'image') return item.category === 'Image Studio';
        if (selectedFilter === 'document') return item.category === 'Document';
        if (selectedFilter === 'spreadsheet') return item.category === 'Spreadsheet';
        if (selectedFilter === 'presentation') return item.category === 'Presentation';
        if (selectedFilter === 'action') return item.category === 'Action';
        return true;
      });
    }

    if (!searchQuery.trim()) return result;

    const q = searchQuery.toLowerCase().trim();
    const queryParts = q.split(/\s+/);

    return result.filter(item => {
      const targetText = `${item.name} ${item.description} ${item.id} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      return queryParts.every(part => targetText.includes(part));
    });
  }, [allItems, searchQuery, selectedFilter]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedFilter]);

  // Focus input on mount & modal open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setSelectedFilter('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, filteredItems.length - 1)));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Auto scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200/90 flex flex-col overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative px-4 py-3.5 border-b border-neutral-100 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 61 tools, document formats, or actions... (e.g. Word, Excel, WebP, Crop)"
            className="w-full bg-transparent text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-500">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50/60 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'all', label: `All Tools (61)` },
            { id: 'image', label: 'Images (20)' },
            { id: 'document', label: 'Documents (17)' },
            { id: 'spreadsheet', label: 'Spreadsheets (8)' },
            { id: 'presentation', label: 'Presentations (6)' },
            { id: 'action', label: 'Actions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium text-xs whitespace-nowrap transition cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                  : 'bg-white hover:bg-neutral-200/60 text-neutral-600 border border-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-mono text-neutral-400 shrink-0 pl-2">
            {filteredItems.length} {filteredItems.length === 1 ? 'match' : 'matches'}
          </span>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-neutral-50"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <FileCode className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">
                No matching tools or actions found
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try searching for a format like "PDF", "Word", "Excel", or a task like "Resize", "Compress", or "Convert".
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 text-blue-950 border border-blue-200/80 shadow-2xs'
                      : 'hover:bg-neutral-50 text-neutral-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate ${
                            isSelected
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5 max-w-md sm:max-w-lg">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar with Keyboard Hints */}
        <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-700 shadow-2xs">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-700 shadow-2xs">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-700 shadow-2xs">esc</kbd>
              <span>close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>61 Engines · 100% Client-Side</span>
          </div>
        </div>
      </div>
    </div>
  );
};
