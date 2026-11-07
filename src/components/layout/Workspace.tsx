import React, { useState, useRef, useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityCategory } from '../../types/utility';
import { LandingWorkspace } from './LandingWorkspace';
import { ComparisonSlider } from '../common/ComparisonSlider';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ControlRack } from './ControlRack';
import { BatchDrawer } from './BatchDrawer';
import { Lock, ChevronLeft, ChevronRight, Sliders, Search, X, Sparkles } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, setActiveUtilityId, toastMessage, dismissToast } = useSession();
  const { user, isUtilityUnlocked } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileControls, setShowMobileControls] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

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

  const scrollNavbar = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleToolSelect = (utilityId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveUtilityId(utilityId);
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-[#FBFBFC]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-neutral-900 text-white text-xs py-2 px-6 flex items-center justify-between z-30 animate-in slide-in-from-top duration-150 border-b border-neutral-800">
          <span className="font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {toastMessage}
          </span>
          <button onClick={dismissToast} className="text-neutral-400 hover:text-white font-bold ml-4 cursor-pointer text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Corporate Modern Tool Navigation Bar */}
      <nav className="w-full bg-white border-b border-neutral-200/80 px-3 sm:px-5 py-2 flex items-center gap-2.5 shrink-0 select-none shadow-2xs z-20 relative">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100/80 rounded-xl shrink-0 border border-neutral-200/60 text-xs">
          {[
            { id: 'all', label: 'All 26' },
            { id: 'recipes', label: 'Recipes' },
            { id: 'optimize', label: 'Optimize' },
            { id: 'convert', label: 'Convert' },
            { id: 'ai', label: 'AI Suite' },
            { id: 'edit', label: 'Edit & Crop' },
            { id: 'metadata', label: 'Metadata' },
          ].map(cat => {
            const isCatSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                  isCatSelected
                    ? 'bg-white text-neutral-900 font-semibold shadow-2xs border border-neutral-200/70'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input for Instant Filtering */}
        <div className="relative shrink-0 hidden md:block">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools or formats..."
            className="pl-8 pr-7 py-1 text-[11px] bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white focus:ring-1 focus:ring-neutral-400 focus:outline-none rounded-lg border border-neutral-200 w-44 transition text-neutral-800 placeholder:text-neutral-400"
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

        {/* Divider */}
        <div className="h-5 w-[1px] bg-neutral-200 shrink-0"></div>

        {/* Left Scroll Arrow */}
        <button
          onClick={() => scrollNavbar('left')}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center border border-transparent hover:border-neutral-200"
          title="Scroll tools left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Utility Items Scrubber */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredUtilities.length === 0 ? (
            <span className="text-xs text-neutral-400 italic px-2">No tools match "{searchQuery}"</span>
          ) : (
            filteredUtilities.map(u => {
              const isSelected = u.id === activeUtilityId;
              const isToolLocked = u.isCompetitorPaid && !user;

              return (
                <button
                  key={u.id}
                  onClick={(e) => handleToolSelect(u.id, e)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-150 flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 font-medium'
                  }`}
                >
                  {/* Understated Active Indicator Dot */}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  )}

                  <span>{u.name}</span>

                  {isToolLocked && (
                    <Lock className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scrollNavbar('right')}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center border border-transparent hover:border-neutral-200"
          title="Scroll tools right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Refined Active Utility Badge */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-neutral-200 shrink-0">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Active:</span>
          <span className="text-xs font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80 truncate max-w-[150px]">
            {activeUtility.name}
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-[#FBFBFC] relative p-2 sm:p-4">
          {images.length === 0 ? (
            <LandingWorkspace />
          ) : !isUnlocked ? (
            <div className="flex-1 flex items-center justify-center p-6 w-full">
              <GatedFeatureCard utility={activeUtility} />
            </div>
          ) : (
            <div className="flex-1 w-full h-full flex items-center justify-center min-h-0">
              <ComparisonSlider
                originalUrl={activeImage!.url}
                processedUrl={activeImage!.processedUrl}
                originalSize={activeImage!.size}
                processedSize={activeImage!.processedSize}
                originalWidth={activeImage!.width}
                originalHeight={activeImage!.height}
                processedWidth={activeImage!.processedWidth}
                processedHeight={activeImage!.processedHeight}
                imageName={activeImage!.name}
                activeUtilityId={activeUtilityId}
              />
            </div>
          )}
        </main>

        {/* Right Utility Configuration Rack */}
        {images.length > 0 && isUnlocked && <ControlRack />}
      </div>

      {/* Mobile Floating Controls Button */}
      {images.length > 0 && isUnlocked && (
        <div className="md:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => setShowMobileControls(true)}
            className="px-5 py-2 rounded-full bg-neutral-900 text-white font-medium text-xs shadow-lg flex items-center gap-2 border border-neutral-700 cursor-pointer active:scale-95 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Parameters</span>
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Controls Sheet */}
      {images.length > 0 && isUnlocked && showMobileControls && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowMobileControls(false)}
        >
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <ControlRack isMobileDrawer={true} onCloseMobile={() => setShowMobileControls(false)} />
          </div>
        </div>
      )}

      {/* Bottom Batch Image Queue Drawer */}
      {images.length > 0 && <BatchDrawer />}
    </div>
  );
};
