import React from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + O', desc: 'Browse and open images from disk' },
    { key: '⌘ / Ctrl + Enter', desc: 'Apply active utility transformation' },
    { key: '⌘ / Ctrl + D', desc: 'Download current processed image' },
    { key: '⌘ / Ctrl + ⌫', desc: 'Clear all images from workspace' },
    { key: '1 – 6', desc: 'Quick switch between tool categories' },
    { key: '← / →', desc: 'Navigate previous / next image in queue' },
    { key: '?', desc: 'Toggle this keyboard shortcuts menu' },
    { key: 'Esc', desc: 'Close open dialogs and drawers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Keyboard className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Keyboard Shortcuts
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
            aria-label="Close shortcuts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition"
            >
              <span className="text-xs text-neutral-600 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200/80 font-mono text-[11px] font-semibold text-neutral-800 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-neutral-50 border-t border-neutral-100 text-center text-[11px] text-neutral-400 font-mono">
          PRESS <span className="font-bold text-neutral-600">?</span> ANYWHERE TO TOGGLE
        </div>
      </div>
    </div>
  );
};
