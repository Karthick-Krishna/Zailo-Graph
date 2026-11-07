import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { Header } from './components/layout/Header';
import { Workspace } from './components/layout/Workspace';
import { AuthModal } from './components/auth/AuthModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';

const AppContent: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { images, activeImage, executeActiveUtility, downloadImage, clearWorkspace, setActiveUtilityId } = useSession();

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

      // 'Escape' closes Shortcuts HUD
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
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
        else if (e.key === '3') setActiveUtilityId('ai-bg-removal');
        else if (e.key === '4') setActiveUtilityId('avatar-crop');
        else if (e.key === '5') setActiveUtilityId('exif-viewer');
        else if (e.key === '6') setActiveUtilityId('camera-raw');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, activeImage, executeActiveUtility, downloadImage, clearWorkspace, setActiveUtilityId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-[#09090B] relative overflow-hidden">
      {/* Universal Ambient Adaptive Aura Background Visual (Visible across all pages) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Top-Center Radiant Atmospheric Aura Bloom */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-violet-600/25 via-indigo-500/20 to-cyan-400/25 rounded-full blur-[110px] transform -rotate-6 pointer-events-none"></div>

        {/* Bottom-Right Electric Cyan Bloom */}
        <div className="absolute -bottom-28 -right-28 w-[650px] h-[650px] bg-gradient-to-br from-cyan-400/20 via-blue-600/15 to-violet-600/20 rounded-full blur-[130px] pointer-events-none"></div>

        {/* Bottom-Left Deep Violet Glow */}
        <div className="absolute -bottom-20 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/20 to-violet-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Subtle Precision Dot Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        ></div>
      </div>

      <Header onOpenShortcuts={() => setIsShortcutsOpen(true)} />
      <Workspace />
      <AuthModal />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;
