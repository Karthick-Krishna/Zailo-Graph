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
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-white text-neutral-800 border border-neutral-200 shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        title="Share feedback or read community reviews"
        aria-label="Open feedback dialog"
      >
        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <MessageSquare className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-neutral-800">
          <span>Feedback</span>
          {typeof reviewCount === 'number' && reviewCount > 0 && (
            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
              {reviewCount}
            </span>
          )}
        </div>
      </button>
    </aside>
  );
};
