import React, { useState, useEffect } from 'react';
import { X, Info, Check } from 'lucide-react';
import { CreatorGoal } from '../types';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: CreatorGoal) => void;
  initialGoal?: CreatorGoal;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal
}) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('450.00');
  const [startingAmount, setStartingAmount] = useState('0');
  const [includeShopSales, setIncludeShopSales] = useState(true);
  const [includeCommissionSales, setIncludeCommissionSales] = useState(true);
  const [showTargetPublicly, setShowTargetPublicly] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Sync state when modal opens or initialGoal changes
  useEffect(() => {
    if (isOpen) {
      setGoalTitle(initialGoal?.title || 'Help Us Expand Our Permaculture Project & Unlocks New Funding');
      setGoalDescription(
        initialGoal?.description ||
          "We've been given an incredible opportunity to take part in a major fundraising event for our permaculture project!\n\nTo participate and receive funds, we need to register a U.S. LLC, which costs $450."
      );
      const targetUsd =
        initialGoal?.target_amount_usd !== undefined
          ? initialGoal.target_amount_usd.toFixed(2)
          : initialGoal?.target_water
          ? (initialGoal.target_water / 100).toFixed(2)
          : '450.00';
      setTargetAmount(targetUsd);
      setStartingAmount((initialGoal?.starting_amount ?? 0).toString());
      setIncludeShopSales(initialGoal?.include_shop_sales ?? true);
      setIncludeCommissionSales(initialGoal?.include_commission_sales ?? true);
      setShowTargetPublicly(initialGoal?.show_target_publicly ?? true);
    }
  }, [isOpen, initialGoal]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsd = Math.max(1, parseFloat(targetAmount) || 450);
    const startNum = Math.max(0, parseFloat(startingAmount) || 0);
    // 100 Rain Drops = $1.00 USD
    const targetDrops = Math.round(targetUsd * 100);

    const prevStartingDrops = Math.round((initialGoal?.starting_amount || 0) * 100);
    const existingTipsDrops = Math.max(0, (initialGoal?.current_water || 0) - prevStartingDrops);
    const newStartingDrops = Math.round(startNum * 100);
    const totalCurrentDrops = existingTipsDrops + newStartingDrops;

    const updatedGoal: CreatorGoal = {
      title: goalTitle.trim() || 'Stewardship Goal',
      description: goalDescription.trim(),
      current_water: totalCurrentDrops,
      current_raindrops: totalCurrentDrops,
      target_water: targetDrops,
      target_raindrops: targetDrops,
      target_amount_usd: targetUsd,
      starting_amount: startNum,
      include_shop_sales: includeShopSales,
      include_commission_sales: includeCommissionSales,
      show_target_publicly: showTargetPublicly,
      unit_label: 'Drops'
    };

    onSave(updatedGoal);
    onClose();
  };

  const tooltips: Record<string, string> = {
    title: 'A clear, descriptive headline for what this campaign achieves.',
    desc: 'Explain what you are building, the project scope, and how funds will be used.',
    target: 'Total funding target in USD ($) required to complete this goal.',
    start: 'Initial progress amount (e.g., offline pledges or existing funds).',
    shop: 'Automatically credit blueprint, seed stock, and digital shop sales towards this goal.',
    comm: 'Include custom landscape design and consultation commissions in this goal.',
    public: 'Display the exact numeric target amount publicly on your profile.'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 dark:bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-goal-title"
    >
      <div
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 overflow-hidden transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100 dark:border-stone-800/80">
          <h2 id="edit-goal-title" className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Edit goal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:space-y-5">
          {/* Goal title */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
              <label htmlFor="goal-title-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Goal title
              </label>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'title' ? null : 'title')}
                  onMouseEnter={() => setActiveTooltip('title')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Goal title info"
                >
                  <Info className="h-4 w-4" />
                </button>
                {activeTooltip === 'title' && (
                  <div className="absolute left-6 top-0 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.title}
                  </div>
                )}
              </div>
            </div>
            <input
              id="goal-title-input"
              type="text"
              required
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              placeholder="e.g. Help Us Expand Our Permaculture Project & Unlocks New Funding"
              className="w-full bg-[#f4f4f4] dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all"
            />
          </div>

          {/* Goal description */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
              <label htmlFor="goal-desc-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Goal description
              </label>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'desc' ? null : 'desc')}
                  onMouseEnter={() => setActiveTooltip('desc')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Goal description info"
                >
                  <Info className="h-4 w-4" />
                </button>
                {activeTooltip === 'desc' && (
                  <div className="absolute left-6 top-0 z-20 w-56 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.desc}
                  </div>
                )}
              </div>
            </div>
            <textarea
              id="goal-desc-input"
              rows={4}
              required
              value={goalDescription}
              onChange={e => setGoalDescription(e.target.value)}
              placeholder="We've been given an incredible opportunity to take part in a major fundraising event..."
              className="w-full bg-[#f4f4f4] dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/70 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all leading-relaxed"
            />
          </div>

          {/* Target amount */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
              <label htmlFor="target-amount-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Target amount
              </label>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'target' ? null : 'target')}
                  onMouseEnter={() => setActiveTooltip('target')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Target amount info"
                >
                  <Info className="h-4 w-4" />
                </button>
                {activeTooltip === 'target' && (
                  <div className="absolute left-6 top-0 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.target}
                  </div>
                )}
              </div>
            </div>
            <input
              id="target-amount-input"
              type="text"
              required
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="450.00"
              className="w-full bg-[#f4f4f4] dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all"
            />
          </div>

          {/* Starting amount */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
              <label htmlFor="starting-amount-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Starting amount
              </label>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'start' ? null : 'start')}
                  onMouseEnter={() => setActiveTooltip('start')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Starting amount info"
                >
                  <Info className="h-4 w-4" />
                </button>
                {activeTooltip === 'start' && (
                  <div className="absolute left-6 top-0 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.start}
                  </div>
                )}
              </div>
            </div>
            <input
              id="starting-amount-input"
              type="text"
              value={startingAmount}
              onChange={e => setStartingAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="w-full bg-[#f4f4f4] dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00aeef] focus:border-transparent transition-all"
            />
          </div>

          {/* Advanced Section */}
          <div className="pt-2 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              Advanced
            </h3>

            {/* Checkbox 1: Include Shop sales */}
            <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
              <div
                onClick={() => setIncludeShopSales(!includeShopSales)}
                className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors ${
                  includeShopSales
                    ? 'bg-[#00aeef] text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {includeShopSales && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Include Shop sales
              </span>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'shop' ? null : 'shop');
                  }}
                  onMouseEnter={() => setActiveTooltip('shop')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Shop sales info"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {activeTooltip === 'shop' && (
                  <div className="absolute left-6 -top-2 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.shop}
                  </div>
                )}
              </div>
            </label>

            {/* Checkbox 2: Include Commission sales */}
            <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
              <div
                onClick={() => setIncludeCommissionSales(!includeCommissionSales)}
                className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors ${
                  includeCommissionSales
                    ? 'bg-[#00aeef] text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {includeCommissionSales && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Include Commission sales
              </span>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'comm' ? null : 'comm');
                  }}
                  onMouseEnter={() => setActiveTooltip('comm')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Commission sales info"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {activeTooltip === 'comm' && (
                  <div className="absolute left-6 -top-2 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.comm}
                  </div>
                )}
              </div>
            </label>

            {/* Checkbox 3: Show target amount publicly */}
            <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
              <div
                onClick={() => setShowTargetPublicly(!showTargetPublicly)}
                className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors ${
                  showTargetPublicly
                    ? 'bg-[#00aeef] text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {showTargetPublicly && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Show target amount publicly
              </span>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'public' ? null : 'public');
                  }}
                  onMouseEnter={() => setActiveTooltip('public')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 focus:outline-none cursor-pointer"
                  aria-label="Show target amount info"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {activeTooltip === 'public' && (
                  <div className="absolute left-6 -top-2 z-20 w-52 p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    {tooltips.public}
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Bottom Action: Update Button aligned right */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-8 rounded-xl bg-[#00aeef] hover:bg-[#009bd6] active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
