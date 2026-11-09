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
import { DocumentConversionPanel } from '../converter/DocumentConversionPanel';
import { Sliders, Sparkles, Download, Layers, X } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { images, activeImage, activeUtilityId, downloadImage, toastMessage, dismissToast, isMobileToolsOpen, setIsMobileToolsOpen } = useSession();
  const { isUtilityUnlocked } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showMobileBatch, setShowMobileBatch] = useState(false);

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtilityId);

  return (
    <div className="flex-1 w-full max-w-full flex flex-col h-[calc(100dvh-56px)] overflow-x-hidden overflow-y-hidden bg-transparent">
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
      <div className="flex-1 w-full max-w-full flex overflow-x-hidden overflow-y-hidden">
        {/* Left Vertical Tool Navigation Sidebar (Desktop Rail / Expanded) */}
        <ToolSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Center Canvas Viewport */}
        <main className={`flex-1 w-full max-w-full flex flex-col items-center justify-center overflow-x-hidden bg-transparent relative p-1.5 sm:p-4 ${
          images.length > 0 && activeUtilityId !== 'document-converter' ? 'pb-20 sm:pb-4' : ''
        }`}>
          {activeUtilityId === 'document-converter' ? (
            <div className="w-full h-full flex-1 overflow-y-auto py-2 sm:py-6 px-2 sm:px-6 flex flex-col items-center justify-start animate-in fade-in duration-150">
              <div className="w-full max-w-3xl">
                <DocumentConversionPanel />
              </div>
            </div>
          ) : images.length === 0 || !activeImage ? (
            <LandingWorkspace />
          ) : !isUnlocked ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 w-full">
              <GatedFeatureCard utility={activeUtility} />
            </div>
          ) : (
            <div className="flex-1 w-full h-full flex items-center justify-center min-h-0">
              <ComparisonSlider
                originalUrl={activeImage.url}
                processedUrl={activeImage.processedUrl}
                originalSize={activeImage.size}
                processedSize={activeImage.processedSize}
                originalWidth={activeImage.width}
                originalHeight={activeImage.height}
                processedWidth={activeImage.processedWidth}
                processedHeight={activeImage.processedHeight}
                imageName={activeImage.name}
                activeUtilityId={activeUtilityId}
              />
            </div>
          )}
        </main>

        {/* Right Utility Configuration Rack (Desktop) */}
        {images.length > 0 && activeImage && isUnlocked && activeUtilityId !== 'document-converter' && <ControlRack />}
      </div>

      {/* Mobile Floating Command Dock (Optimized for all screen sizes down to 320px with safe area) */}
      {images.length > 0 && activeImage && isUnlocked && (
        <div 
          className="md:hidden fixed left-2 right-2 sm:left-3 sm:right-3 z-40 bg-white/95 backdrop-blur-xl border border-neutral-200/90 shadow-2xl rounded-2xl p-1.5 flex items-center justify-between gap-1 sm:gap-1.5 pointer-events-auto"
          style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
        >
          {/* Active Tool Picker Button */}
          <button
            onClick={() => setIsMobileToolsOpen(true)}
            className="flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 flex items-center justify-center gap-1 sm:gap-1.5 transition text-xs font-semibold cursor-pointer min-h-[42px] sm:min-h-[44px]"
            title="Switch Tool"
          >
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 shrink-0" />
            <span className="truncate max-w-[75px] sm:max-w-[110px] text-[11px] sm:text-xs">{activeUtility.name}</span>
          </button>

          {/* Parameters Sheet Button */}
          <button
            onClick={() => setShowMobileControls(true)}
            className="flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center gap-1 sm:gap-1.5 transition text-xs font-bold shadow-sm shadow-blue-600/25 cursor-pointer min-h-[42px] sm:min-h-[44px]"
            title="Adjust Settings"
          >
            <Sliders className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs">Settings</span>
          </button>

          {/* Quick Download Button (When Result Exists) */}
          {activeImage?.processedBlob && (
            <button
              onClick={() => downloadImage(activeImage.id)}
              className="py-2 px-2.5 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-1 transition text-xs font-bold shadow-sm shadow-emerald-600/20 cursor-pointer min-h-[42px] sm:min-h-[44px] shrink-0"
              title="Download Processed Result"
            >
              <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          )}

          {/* Batch Queue Button */}
          {images.length > 1 && (
            <button
              onClick={() => setShowMobileBatch(true)}
              className="py-2 px-2 sm:px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer min-h-[42px] sm:min-h-[44px] shrink-0"
              title="View Image Queue"
            >
              <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-500" />
              <span className="text-[10px] font-mono font-bold bg-neutral-200 px-1.5 py-0.2 rounded-full">
                {images.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Slide-Up Tool Picker Sheet (Accessible anytime) */}
      {isMobileToolsOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsMobileToolsOpen(false)}
        >
          <div className="w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <ToolSidebar isMobileDrawer={true} onCloseMobile={() => setIsMobileToolsOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Parameters Sheet */}
      {showMobileControls && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowMobileControls(false)}
        >
          <div className="w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <ControlRack isMobileDrawer={true} onCloseMobile={() => setShowMobileControls(false)} />
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Batch Queue Sheet */}
      {showMobileBatch && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowMobileBatch(false)}
        >
          <div className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <span className="text-xs font-bold text-neutral-900">Batch Queue ({images.length} items)</span>
              <button 
                onClick={() => setShowMobileBatch(false)} 
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg cursor-pointer"
                aria-label="Close batch queue"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <BatchDrawer isMobileModal={true} onCloseMobile={() => setShowMobileBatch(false)} />
          </div>
        </div>
      )}

      {/* Desktop Bottom Batch Image Queue Drawer */}
      <div className="hidden md:block">
        {images.length > 0 && <BatchDrawer />}
      </div>
    </div>
  );
};
