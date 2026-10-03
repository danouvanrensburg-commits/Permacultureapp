import React, { useState } from 'react';
import {
  X,
  AlertCircle
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { CommunityPost } from '../types';

export interface TipPostModalProps {
  post: CommunityPost;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [20, 40, 100];

export const TipPostModal: React.FC<TipPostModalProps> = ({
  post,
  isOpen,
  onClose
}) => {
  const {
    rainDropsBalance,
    givingWalletBalance,
    openTopUpModal,
    tipPost
  } = usePermaculture();

  const [selectedAmount, setSelectedAmount] = useState<number>(40);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('60');

  if (!isOpen) return null;

  const currentDropsReceived = post.moments_harvested || post.totalReceivedDrops || 0;

  // Custom validation
  const parsedCustom = parseInt(customInput, 10);
  let customValidationError: string | null = null;

  if (isCustom) {
    if (!customInput.trim() || isNaN(parsedCustom)) {
      customValidationError = 'Please enter an amount in multiples of 20 (e.g. 20, 40, 60)';
    } else if (parsedCustom < 20) {
      customValidationError = 'Minimum tip is 20 Rain Drops ($0.20 USD)';
    } else if (parsedCustom % 20 !== 0) {
      customValidationError = 'Tips must be in multiples of 20 Rain Drops (e.g. 20, 40, 60)';
    }
  }

  const effectiveAmount = isCustom
    ? (!isNaN(parsedCustom) && parsedCustom >= 20 ? parsedCustom : selectedAmount)
    : selectedAmount;

  const userBalance = givingWalletBalance ?? rainDropsBalance;
  const hasEnoughBalance = userBalance >= effectiveAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 20 && parsed % 20 === 0) {
      setSelectedAmount(parsed);
    }
  };

  const handleRoundCustom = () => {
    if (!isNaN(parsedCustom) && parsedCustom > 0) {
      const rounded = Math.max(20, Math.round(parsedCustom / 20) * 20);
      setCustomInput(rounded.toString());
      setSelectedAmount(rounded);
    } else {
      setCustomInput('20');
      setSelectedAmount(20);
    }
  };

  const handleExecuteTip = (amount: number) => {
    const tipAmount = Math.max(20, Math.ceil((amount || 40) / 20) * 20);

    // Deduct amount from current user's givingWalletBalance,
    // add 95% to recipient's earningsWalletBalance,
    // increment post's totalReceivedDrops / moments_harvested by amount
    tipPost(post.id, tipAmount);

    // Call onClose() to immediately dismiss the modal
    onClose();
  };

  const postSnippet = post.title || post.content?.slice(0, 60) || 'Permaculture Field Post';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-5 shadow-2xl text-neutral-900 dark:text-stone-100 text-left space-y-4 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-lg shadow-inner">
              💧
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-sm flex items-center space-x-1.5">
                <span>Tip Rain Drops</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  Post
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-stone-400 font-mono">
                To <span className="text-cyan-600 dark:text-cyan-300 font-semibold">@{post.author.username}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Post Snippet & Total Received Drops */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-stone-950/80 border border-neutral-200 dark:border-stone-800/80 space-y-1.5">
          <p className="text-xs text-neutral-700 dark:text-stone-300 italic line-clamp-2">
            &ldquo;{postSnippet}&rdquo;
          </p>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-200 dark:border-stone-800/60 font-mono">
            <span className="text-neutral-500 dark:text-stone-400">Total received on post:</span>
            <span className="inline-flex items-center space-x-1 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800/50">
              <span>💧</span>
              <span>{currentDropsReceived.toLocaleString()} Drops</span>
            </span>
          </div>
        </div>

        {/* Preset Selector: [ 20 ], [ 40 ], [ 100 ], and [ Custom ✏️ ] */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
            Select Tip Amount (Min 20 Drops)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = !isCustom && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                      : 'bg-neutral-100 dark:bg-stone-800/80 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-800 dark:text-stone-200 border border-neutral-200 dark:border-stone-700/80'
                  }`}
                >
                  <span className="text-xs">💧</span>
                  <span>{amt}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSelectCustom}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                isCustom
                  ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                  : 'bg-neutral-100 dark:bg-stone-800/80 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-800 dark:text-stone-200 border border-neutral-200 dark:border-stone-700/80'
              }`}
            >
              <span className="text-xs">✏️</span>
              <span className="text-[11px]">Custom</span>
            </button>
          </div>

          {/* Custom Amount Input with Multiples of 20 Validation */}
          {isCustom && (
            <div className="pt-1 space-y-1.5 animate-in fade-in duration-150">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs">💧</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customInput}
                  onChange={handleCustomChange}
                  placeholder="Enter amount (e.g. 60, 80, 120)"
                  autoFocus
                  className="w-full pl-8 pr-16 py-2 rounded-xl bg-white dark:bg-stone-950 border border-cyan-500/50 text-neutral-900 dark:text-stone-100 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-neutral-400 dark:text-stone-400 font-mono">
                  Drops
                </span>
              </div>

              {/* Multiples of 20 Validation Message & Auto-Round Action */}
              {customValidationError && (
                <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1.5 rounded-xl font-mono">
                  <div className="flex items-center space-x-1.5 truncate pr-2">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span className="truncate">{customValidationError}</span>
                  </div>
                  {!isNaN(parsedCustom) && parsedCustom > 0 && (
                    <button
                      type="button"
                      onClick={handleRoundCustom}
                      className="px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-[10px] hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                    >
                      Round to {Math.max(20, Math.round(parsedCustom / 20) * 20)}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tip Summary: User Giving Wallet Balance and Selected Tip Amount Only */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-stone-950/70 border border-neutral-200 dark:border-stone-800/70 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-neutral-800 dark:text-stone-300">
            <span className="text-neutral-500 dark:text-stone-400 font-sans">Tip Amount:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-300 text-sm">
              💧 {effectiveAmount.toLocaleString()} Drops
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-500 dark:text-stone-400 pt-1 border-t border-neutral-200 dark:border-stone-800/60 text-[11px]">
            <span className="font-sans">Giving Wallet Balance:</span>
            <div className="flex items-center space-x-2">
              <span className={hasEnoughBalance ? 'text-neutral-800 dark:text-stone-200' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                💧 {userBalance.toLocaleString()} Drops
              </span>
              {!hasEnoughBalance && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openTopUpModal();
                  }}
                  className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Top up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions: Primary action [ 💧 Tip {selectedAmount} Drops ] & Simple Cancel */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-stone-800 hover:bg-neutral-200 dark:hover:bg-stone-700 text-neutral-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={false}
            onClick={() => handleExecuteTip(selectedAmount)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <span>💧</span>
            <span>Tip {selectedAmount} Drops</span>
          </button>
        </div>
      </div>
    </div>
  );
};
