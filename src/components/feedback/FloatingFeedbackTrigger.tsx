import React from 'react';
import { MessageSquare, Star } from 'lucide-react';

interface FloatingFeedbackTriggerProps {
  onClick: () => void;
  reviewCount?: number;
}

export const FloatingFeedbackTrigger: React.FC<FloatingFeedbackTriggerProps> = ({
  onClick,
  reviewCount,
}) => {
  return (
    <aside 
      aria-label="Feedback and reviews"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group print:hidden select-none"
    >
      <button
        onClick={onClick}
        type="button"
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 hover:bg-white text-neutral-800 border border-neutral-200/90 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="Leave feedback or review any of the 61 studio tools"
        aria-label="Open feedback and reviews popup"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
          <span>Feedback</span>
          {typeof reviewCount === 'number' && reviewCount > 0 && (
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
              {reviewCount}
            </span>
          )}
        </div>
      </button>
    </aside>
  );
};

