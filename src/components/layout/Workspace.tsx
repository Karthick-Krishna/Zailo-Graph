import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityCategory } from '../../types/utility';
import { LandingWorkspace } from './LandingWorkspace';
import { ComparisonSlider } from '../common/ComparisonSlider';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ControlRack } from './ControlRack';
import { BatchDrawer } from './BatchDrawer';
import { Lock } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, setActiveUtilityId, toastMessage, dismissToast } = useSession();
  const { user, isUtilityUnlocked } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | 'all'>('all');

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  const filteredUtilities = selectedCategory === 'all' 
    ? UTILITIES 
    : UTILITIES.filter(u => u.category === selectedCategory);

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

      {/* Top Utility Selector Bar (Only displayed or condensed when workspace is active) */}
      <div className="w-full bg-[#FAFAFA] border-b border-neutral-200/80 px-6 py-2 flex items-center gap-3 overflow-x-auto shrink-0 select-none">
        {/* Category Filter */}
        <div className="flex items-center gap-1 pr-3 border-r border-neutral-200 shrink-0">
          {[
            { id: 'all', label: 'All 25' },
            { id: 'optimize', label: 'Optimize' },
            { id: 'convert', label: 'Convert' },
            { id: 'ai', label: 'AI Suite' },
            { id: 'edit', label: 'Edit & Crop' },
            { id: 'metadata', label: 'Metadata' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Utility Items Scrubber */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {filteredUtilities.map(u => {
            const isSelected = u.id === activeUtilityId;
            const isToolLocked = u.isCompetitorPaid && !user;

            return (
              <button
                key={u.id}
                onClick={() => setActiveUtilityId(u.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-900 border border-violet-300 shadow-xs ring-1 ring-violet-500/10'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 border border-transparent'
                }`}
              >
                <span>{u.name}</span>
                {isToolLocked && (
                  <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

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
