import React, { useState, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityCategory } from '../../types/utility';
import { LandingWorkspace } from './LandingWorkspace';
import { ComparisonSlider } from '../common/ComparisonSlider';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ControlRack } from './ControlRack';
import { BatchDrawer } from './BatchDrawer';
import { Lock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, setActiveUtilityId, toastMessage, dismissToast } = useSession();
  const { user, isUtilityUnlocked } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | 'all'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  const filteredUtilities = selectedCategory === 'all' 
    ? UTILITIES 
    : UTILITIES.filter(u => u.category === selectedCategory);

  const scrollNavbar = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleToolSelect = (utilityId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveUtilityId(utilityId);
    // Smoothly animate and center the clicked item horizontally
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-neutral-900 text-white text-xs py-2 px-6 flex items-center justify-between z-30 animate-in slide-in-from-top duration-150">
          <span className="font-medium">{toastMessage}</span>
          <button onClick={dismissToast} className="text-neutral-400 hover:text-white font-bold ml-4 cursor-pointer text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Horizontal Tool Selector Bar */}
      <nav className="w-full bg-white border-b border-neutral-200/90 px-4 py-2.5 flex items-center gap-3 shrink-0 select-none shadow-xs z-20 relative">
        {/* Category Filter Segmented Control */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-xl shrink-0 border border-neutral-200/60">
          {[
            { id: 'all', label: 'All 25' },
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isCatSelected
                    ? 'bg-neutral-900 text-white shadow-xs scale-[1.02]'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-neutral-200 shrink-0"></div>

        {/* Left Scroll Arrow */}
        <button
          onClick={() => scrollNavbar('left')}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
          title="Scroll tools left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Utility Items Scrubber with Smooth Auto-Scroll & Animation */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredUtilities.map(u => {
            const isSelected = u.id === activeUtilityId;
            const isToolLocked = u.isCompetitorPaid && !user;

            return (
              <button
                key={u.id}
                onClick={(e) => handleToolSelect(u.id, e)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer transform active:scale-95 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/20 scale-[1.03] ring-2 ring-violet-500/50'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border border-neutral-200/70 hover:border-neutral-300'
                }`}
              >
                {/* Animated Glowing Active Indicator Dot */}
                {isSelected && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-violet-400 to-cyan-400"></span>
                  </span>
                )}

                <span>{u.name}</span>

                {isToolLocked && (
                  <Lock className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scrollNavbar('right')}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
          title="Scroll tools right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Live Active Tool Feedback Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-neutral-200 shrink-0">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Active:</span>
          <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200/60 truncate max-w-[150px]">
            {activeUtility.name}
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas Viewport */}
        <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto bg-[#F8F9FA] relative">
          {images.length === 0 ? (
            <LandingWorkspace />
          ) : !isUnlocked ? (
            <div className="flex-1 flex items-center justify-center p-6 w-full">
              <GatedFeatureCard utility={activeUtility} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 w-full">
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
              />
            </div>
          )}
        </main>

        {/* Right Utility Configuration Rack (Only shown when an image is loaded) */}
        {images.length > 0 && isUnlocked && <ControlRack />}
      </div>

      {/* Bottom Batch Image Queue Drawer (Only shown when images exist) */}
      {images.length > 0 && <BatchDrawer />}
    </div>
  );
};
