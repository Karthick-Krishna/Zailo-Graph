import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { Header } from './components/layout/Header';
import { Workspace } from './components/layout/Workspace';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { ToastNotification } from './components/common/ToastNotification';
import { ActiveAuroraBackground } from './components/common/ActiveAuroraBackground';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { closeAuthModal, closeSettings } = useAuth();
  const { 
    images, 
    activeImage, 
    executeActiveUtility, 
    downloadImage, 
    clearWorkspace, 
    setActiveUtilityId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSession();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // '?' or 'Shift + /' toggles Shortcuts HUD
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // 'Escape' closes any open modal (Auth, Settings, Shortcuts)
      if (e.key === 'Escape') {
        closeAuthModal();
        closeSettings();
        setIsShortcutsOpen(false);
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z: Redo
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Cmd/Ctrl + Enter: Execute active utility
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeImage) {
          executeActiveUtility({});
        }
        return;
      }

      // Cmd/Ctrl + D: Download current processed image
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeImage) {
          downloadImage(activeImage.id);
        }
        return;
      }

      // Cmd/Ctrl + Backspace / Delete: Clear workspace
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        if (images.length > 0) {
          clearWorkspace();
        }
        return;
      }

      // 1-6 quick switch between main tool groups when not modifier-held
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') setActiveUtilityId('compression');
        else if (e.key === '2') setActiveUtilityId('batch-resize');
        else if (e.key === '3') setActiveUtilityId('heic-converter');
        else if (e.key === '4') setActiveUtilityId('avatar-crop');
        else if (e.key === '5') setActiveUtilityId('exif-viewer');
        else if (e.key === '6') setActiveUtilityId('camera-raw');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, activeImage, executeActiveUtility, downloadImage, clearWorkspace, setActiveUtilityId, undo, redo, canUndo, canRedo]);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-[#F8F9FB] text-[#09090B] relative overflow-x-hidden">
      {/* Active Fluid Animated Aurora Gradient Background (Visible on all pages) */}
      <ActiveAuroraBackground />

      <Header onOpenShortcuts={() => setIsShortcutsOpen(true)} />
      <Workspace />
      <AuthModal />
      <OnboardingModal />
      <SettingsModal />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <ToastNotification />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
