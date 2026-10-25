import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ModerationContentType, ModerationSeverity } from '../types';
import { REPORT_CATEGORIES, ReportCategoryOption } from '../services/moderationService';

export interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: {
    category: string;
    reason: string;
    severity: ModerationSeverity;
    additionalNotes?: string;
  }) => void;
  contentType: ModerationContentType;
  contentSnippet: string;
  authorUsername: string;
}

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentType,
  contentSnippet,
  authorUsername
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryOption>(REPORT_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category: selectedCategory.id,
      reason: selectedCategory.label,
      severity: selectedCategory.defaultSeverity,
      additionalNotes: notes.trim() || undefined
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1400);
  };

  const getContentTypeLabel = () => {
    if (contentType === 'feed_post') return 'Community Post';
    if (contentType === 'bush_tv_chat') return 'Bush TV Message';
    return 'Comment';
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-6 shadow-2xl text-neutral-900 dark:text-stone-100 text-left space-y-5 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg shadow-inner">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-base">
                Report {getContentTypeLabel()}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-stone-400">
                Help maintain a safe and respectful permaculture guild
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in fade-in">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-stone-100">
              Report Submitted for Steward Review
            </h4>
            <p className="text-xs text-neutral-500 dark:text-stone-400 max-w-xs">
              Thank you for keeping our ecosystem regenerative. Platform moderators have been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Snippet Card */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-stone-950/80 border border-neutral-200 dark:border-stone-800 text-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-stone-400">
                Content by @{authorUsername}:
              </span>
              <p className="italic text-neutral-700 dark:text-stone-300 line-clamp-2">
                &ldquo;{contentSnippet}&rdquo;
              </p>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
                Reason for Report
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                {REPORT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start space-x-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/30'
                          : 'border-neutral-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:bg-neutral-50 dark:hover:bg-stone-800/50 text-neutral-800 dark:text-stone-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportCategory"
                        checked={isSelected}
                        onChange={() => setSelectedCategory(cat)}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{cat.label}</p>
                        <p className="text-[11px] text-neutral-500 dark:text-stone-400 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe why this content violates community guidelines..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-stone-950 border border-neutral-300 dark:border-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                maxLength={300}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-neutral-100 dark:bg-stone-800 hover:bg-neutral-200 dark:hover:bg-stone-700 text-neutral-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-950/20 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
