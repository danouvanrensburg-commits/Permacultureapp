import React, { useState, useEffect } from 'react';
import {
  X,
  Droplets,
  Sprout,
  Flame,
  Compass,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { TOP_UP_PACKAGES } from '../lib/supabase';

export const TopUpModal: React.FC = () => {
  const {
    isTopUpModalOpen,
    closeTopUpModal,
    momentsBalance,
    topUpMoments
  } = usePermaculture();

  const [isTestMode, setIsTestMode] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pack_garden');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  // Escape key listener to close modal immediately
  useEffect(() => {
    if (!isTopUpModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTopUpModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTopUpModalOpen, closeTopUpModal]);

  if (!isTopUpModalOpen) return null;

  const selectedPkg = TOP_UP_PACKAGES.find(p => p.id === selectedPackageId) || TOP_UP_PACKAGES[1];

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      topUpMoments(selectedPackageId, isTestMode);
      setIsProcessing(false);
      setShowSuccessNotice(true);
      setTimeout(() => {
        setShowSuccessNotice(false);
      }, 1500);
    }, 800);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sprout':
        return <Sprout className="h-6 w-6 text-emerald-400" />;
      case 'Droplets':
        return <Droplets className="h-6 w-6 text-emerald-400" />;
      case 'Flame':
        return <Flame className="h-6 w-6 text-amber-400" />;
      case 'Compass':
        return <Compass className="h-6 w-6 text-amber-300" />;
      default:
        return <Droplets className="h-6 w-6 text-emerald-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 dark:bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeTopUpModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl text-stone-900 dark:text-stone-100 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* ============================================================ */}
        {/* 1. STICKY / PINNED HEADER - ALWAYS VISIBLE WITH PROMINENT EXIT */}
        {/* ============================================================ */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-stone-200 dark:border-stone-800/80 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>🌧️ Become a Rain Maker</span>
                <span>•</span>
                <span>1 🪣 = 500 💧 ($5)</span>
              </div>
              <h2 id="modal-headline" className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                Become a Rain Maker • Rain Drops 💧
              </h2>
            </div>
          </div>

          {/* Prominent, high-contrast Close Button */}
          <button
            type="button"
            onClick={closeTopUpModal}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 shadow-sm transition-all cursor-pointer shrink-0"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <span>Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. SCROLLABLE MODAL BODY                                     */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Become a Rain Maker Highlight Card */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/30 via-stone-900/60 to-cyan-950/30 border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-stone-950">
                  Creator Membership
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">$9.90 / month</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Activate your Rain Maker steward status to host Bush TV channels, create paid tiers, and earn from community paywalls.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-stone-900/80 border border-stone-800 px-3 py-2 rounded-xl self-start sm:self-center shrink-0">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Your Drops Balance</p>
                <div className="flex items-center space-x-1 text-cyan-400 font-mono font-bold text-sm">
                  <span>💧 {momentsBalance.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    ({(momentsBalance / 500).toFixed(1)} 🪣)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo / Test Mode Switcher */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Demo / Sandbox Test Mode
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-[10px] text-amber-800 dark:text-amber-200 font-mono">
                    Stripe Safe
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Simulate instant top-ups with zero real charges during preview.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTestMode(!isTestMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isTestMode ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isTestMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Package Grid */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5">
              Select Rain Drops & Water Buckets Package:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOP_UP_PACKAGES.map(pkg => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`group relative cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-stone-800/90 shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 ring-1 ring-cyan-500'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-850'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-950 shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50 shadow-sm">
                          {getIcon(pkg.iconName)}
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors text-sm">
                            {pkg.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{pkg.bonus}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                          ${pkg.price_usd.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-mono">USD</span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2.5 border-t border-stone-200 dark:border-stone-800/60">
                      <div className="flex items-center space-x-1.5 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-xs sm:text-sm">
                        <span>💧</span>
                        <span>+{(pkg.raindrops || pkg.moments).toLocaleString()}</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                          ({pkg.buckets || Math.floor(pkg.moments / 500)} 🪣)
                        </span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-stone-400 dark:border-stone-600'
                      }`}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white dark:text-stone-950" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated Payment Sheet */}
          <div className="rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 p-3.5">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
              <span className="flex items-center space-x-1.5">
                <CreditCard className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                <span>{isTestMode ? 'Simulated Card (Test Mode)' : 'Credit / Debit Card (Stripe)'}</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">256-Bit SSL Encrypted</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                disabled={!isTestMode}
                className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:border-cyan-500 disabled:opacity-75"
              />
              {isTestMode && (
                <span className="absolute right-3 top-2 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Test Token Ready
                </span>
              )}
            </div>
          </div>

          {/* Success Notice if submitted */}
          {showSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Successfully added {(selectedPkg.raindrops || selectedPkg.moments).toLocaleString()} Rain Drops 💧 ({selectedPkg.buckets || Math.floor(selectedPkg.moments / 500)} Water Buckets 🪣)!</span>
            </div>
          )}

          {/* Note */}
          <div className="flex items-center space-x-2 text-[11px] text-stone-400 dark:text-stone-500">
            <Info className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
            <span>
              Rain Drops 💧 and Water Buckets 🪣 can be gifted to creators (20 Drops minimum) across Bush TV, field posts, and profiles. Creators receive 95% net payout.
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. STICKY / PINNED FOOTER - ALWAYS IN REACH WITH CANCEL & OK */}
        {/* ============================================================ */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800/80 bg-stone-50/95 dark:bg-stone-950/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 self-start sm:self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Instant delivery into your regenerative wallet</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {/* Explicit Cancel / Close Button at the bottom */}
            <button
              type="button"
              onClick={closeTopUpModal}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel / Close
            </button>

            {/* Confirm Checkout Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCheckout}
              className="w-1/2 sm:w-auto min-w-[200px] flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 px-5 py-2.5 font-extrabold text-stone-950 text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>🌧️</span>
                  <span>
                    Get {(selectedPkg.raindrops || selectedPkg.moments).toLocaleString()} 💧 (${selectedPkg.price_usd.toFixed(2)})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
