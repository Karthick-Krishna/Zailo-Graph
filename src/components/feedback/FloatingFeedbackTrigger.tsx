import React from 'react';
import { MessageSquare } from 'lucide-react';

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
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-neutral-900/95 hover:bg-neutral-900 text-neutral-100 border border-neutral-700/80 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        title="Quality verification & feedback console for all 61 tools"
        aria-label="Open feedback console"
      >
        <div className="w-5 h-5 rounded-full bg-neutral-800 text-cyan-400 flex items-center justify-center shrink-0">
          <MessageSquare className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold tracking-tight">
          <span>Feedback</span>
          {typeof reviewCount === 'number' && reviewCount > 0 ? (
            <span className="font-mono text-[10px] text-cyan-300 bg-neutral-800 px-1.5 py-0.5 rounded-full border border-neutral-700">
              {reviewCount}
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </div>
      </button>
    </aside>
  );
};
