import React from 'react';
import { X, Sprout, Heart, Users, ShieldAlert, Check } from 'lucide-react';

export interface CommunityGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityGuidelinesModal: React.FC<CommunityGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 shadow-2xl flex flex-col text-neutral-900 dark:text-stone-100 animate-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-neutral-50/70 dark:bg-stone-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg shadow-inner">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                <span>Community Standards &amp; Guild Ethics</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-stone-400">
                Ethical foundation for regenerative stewards and creators
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700 dark:text-stone-300 leading-relaxed scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Sprout className="h-4 w-4" />
                <span>1. Earth Care</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
                Prioritize living soil health, biodiversity, clean water infiltration, and biological resilience in all advice.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-blue-800 dark:text-blue-300">
                <Heart className="h-4 w-4" />
                <span>2. People Care</span>
              </div>
              <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80">
                Support fellow homesteaders, farmers, and learners with patience, practical guidance, and constructive kindness.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Users className="h-4 w-4" />
                <span>3. Fair Share</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Honor creator labor through direct micro-tipping (95% to creator) and share regenerative surpluses freely.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100">
              Expected Community Practices
            </h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Share context &amp; climate zones:</strong> When asking or giving advice, include your USDA/Köppen climate zone, soil type, and rainfall patterns.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Credit sources &amp; elders:</strong> Acknowledge indigenous ecological knowledge, lineage practitioners, and original blueprint creators.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Constructive discourse:</strong> Different sites require different strategies. Critique agricultural techniques constructively without personal attacks.</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center space-x-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>Zero-Tolerance Violations</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-stone-300">
              <li>Commercial cryptocurrency or financial investment pitch groups.</li>
              <li>Advocating the pouring of motor oil, untreated industrial solvents, or biohazards into natural soils.</li>
              <li>Hate speech, personal threats, or doxxing community members.</li>
              <li>Plagiarizing complete design schematics or course videos for unauthorized sale.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-stone-800 flex justify-end bg-neutral-50/70 dark:bg-stone-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            I Agree to Uphold Guild Standards
          </button>
        </div>
      </div>
    </div>
  );
};
