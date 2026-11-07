import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES } from '../../types/utility';
import { LandingWorkspace } from './LandingWorkspace';
import { ComparisonSlider } from '../common/ComparisonSlider';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ControlRack } from './ControlRack';
import { BatchDrawer } from './BatchDrawer';
import { ToolSidebar } from './ToolSidebar';
import { Sliders } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, toastMessage, dismissToast } = useSession();
  const { isUtilityUnlocked } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-transparent">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-neutral-900 text-white text-xs py-2 px-6 flex items-center justify-between z-30 animate-in slide-in-from-top duration-150 border-b border-neutral-800 shrink-0">
          <span className="font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {toastMessage}
          </span>
          <button onClick={dismissToast} className="text-neutral-400 hover:text-white font-bold ml-4 cursor-pointer text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Main Studio Area: Left Vertical Navigation Sidebar + Center Canvas Viewport + Right Control Rack */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Tool Navigation Sidebar */}
        <ToolSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Center Canvas Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-transparent relative p-2 sm:p-4">
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
