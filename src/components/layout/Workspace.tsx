import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityCategory } from '../../types/utility';
import { DropZone } from '../common/DropZone';
import { ComparisonSlider } from '../common/ComparisonSlider';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ControlRack } from './ControlRack';
import { BatchDrawer } from './BatchDrawer';
import { Sparkles, Lock } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, setActiveUtilityId, toastMessage, dismissToast } = useSession();
  const { tier, isUtilityUnlocked } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | 'all'>('all');

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  const filteredUtilities = selectedCategory === 'all' 
    ? UTILITIES 
    : UTILITIES.filter(u => u.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-neutral-900 text-white text-xs py-2 px-4 flex items-center justify-between z-30 animate-in slide-in-from-top duration-200">
          <span>{toastMessage}</span>
          <button onClick={dismissToast} className="text-neutral-400 hover:text-white font-bold ml-4 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Top Utility Selector Bar */}
      <div className="w-full bg-white border-b border-neutral-200/80 px-6 py-2.5 flex items-center gap-3 overflow-x-auto shrink-0">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-200 shrink-0">
          {[
            { id: 'all', label: 'All 25 Tools' },
            { id: 'optimize', label: 'Optimize' },
            { id: 'convert', label: 'Convert' },
            { id: 'ai', label: 'AI Suite' },
            { id: 'edit', label: 'Edit & Crop' },
            { id: 'metadata', label: 'Metadata' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
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

            return (
              <button
                key={u.id}
                onClick={() => setActiveUtilityId(u.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/60'
                }`}
              >
                <span>{u.name}</span>
                {u.isCompetitorPaid && (
                  tier === 'guest' ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[9px] font-bold">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto bg-[#FAFAFA] relative">
          {images.length === 0 ? (
            <DropZone />
          ) : !isUnlocked ? (
            <GatedFeatureCard utility={activeUtility} />
          ) : (
            <ComparisonSlider
              originalUrl={activeImage!.url}
              processedUrl={activeImage!.processedUrl}
              originalSize={activeImage!.size}
              processedSize={activeImage!.processedSize}
              originalWidth={activeImage!.width}
              originalHeight={activeImage!.height}
              imageName={activeImage!.name}
            />
          )}
        </main>

        {/* Right Control Rack */}
        {images.length > 0 && isUnlocked && <ControlRack />}
      </div>

      {/* Bottom Batch Queue Drawer */}
      <BatchDrawer />
    </div>
  );
};
