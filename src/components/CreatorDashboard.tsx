import React, { useState } from 'react';
import {
  Wallet,
  Droplets,
  DollarSign,
  ArrowRightLeft,
  ArrowUpRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  History,
  Building2,
  CreditCard,
  Send,
  Lock,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

interface CreatorDashboardProps {
  navigate: (route: string) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ navigate }) => {
  const {
    currentUser,
    waterBalance,
    earningsBalanceUsd,
    cashOutEarnings,
    convertEarningsToWater,
    openTopUpModal,
    transactions
  } = usePermaculture();

  // Cash Out Modal State (Stripe Connect Only)
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState<string>('100');
  const [stripeAccountId, setStripeAccountId] = useState<string>(
    currentUser.username ? `${currentUser.username}@stripe.connect` : 'danou@onshow.properties'
  );
  const [payoutStatusMessage, setPayoutStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Stripe fee calculation: 0.25% + $0.25 standard Stripe Connect payout fee
  const parsedWithdrawal = parseFloat(cashOutAmount) || 0;
  const stripePayoutFee = parsedWithdrawal > 0 ? Number((parsedWithdrawal * 0.0025 + 0.25).toFixed(2)) : 0;
  const netStripeTakeHome = Number(Math.max(0, parsedWithdrawal - stripePayoutFee).toFixed(2));

  // Convert Earnings -> Water State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertAmountUsd, setConvertAmountUsd] = useState<string>('10');
  const [convertStatusMessage, setConvertStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  const minCashOutThreshold = 100.00;
  const isEligibleToCashOut = earningsBalanceUsd >= minCashOutThreshold;
  const cashOutProgressPercent = Math.min(100, Math.round((earningsBalanceUsd / minCashOutThreshold) * 100));

  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashOutAmount);
    if (isNaN(amount) || amount <= 0) return;

    const result = cashOutEarnings(
      amount,
      'Stripe Connect',
      `Account: ${stripeAccountId} (Stripe Fee: -$${stripePayoutFee.toFixed(2)})`
    );
    setPayoutStatusMessage({ success: result.success, text: result.message });

    if (result.success) {
      setTimeout(() => {
        setIsCashOutModalOpen(false);
        setPayoutStatusMessage(null);
      }, 2500);
    }
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(convertAmountUsd);
    if (isNaN(amount) || amount <= 0) return;

    const result = convertEarningsToWater(amount);
    setConvertStatusMessage({ success: result.success, text: result.message });

    if (result.success) {
      setTimeout(() => {
        setIsConvertModalOpen(false);
        setConvertStatusMessage(null);
      }, 2500);
    }
  };

  // Filter transactions related to earnings and water conversions
  const relevantTransactions = transactions.filter(
    tx => tx.type === 'tip_sent' || tx.type === 'cash_out' || tx.type === 'convert_earnings_to_water' || tx.type === 'topup_purchase'
  );

  return (
    <div className="min-h-screen bg-[#070b09] text-stone-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER & IDENTITY */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#15221d] gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator Monetization & Water Accounting</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Creator Earnings & Two-Wallet Hub
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              Track in-app Rain Drops 💧 spending, 95% creator net yields, payout cash outs, and free drop reinvestment.
            </p>
          </div>
        </div>

        {/* 1. THE MATH EXPLANATION BANNER (EXACT USER SPECIFICATION) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f1a15] via-[#101c17] to-[#0d1713] border border-cyan-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center space-x-2">
                <Percent className="h-5 w-5 text-cyan-400" />
                <h3 className="text-xl font-extrabold text-white">
                  How The Rain Drops 💧 & Water Buckets 🪣 Math Works
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs leading-relaxed text-stone-300">
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#080d0b] border border-[#1a2d24]">
                  <p className="font-bold text-cyan-400 flex items-center space-x-1.5">
                    <span>💧</span>
                    <span>Rain Drops Wallet (In-App Currency)</span>
                  </p>
                  <p className="text-stone-400">
                    Standard rate: <strong>100 Rain Drops = $1.00 USD</strong>. Macro unit: <strong>1 Water Bucket 🪣 = 500 Rain Drops ($5.00 USD)</strong>. Minimum gift is <strong>20 Rain Drops ($0.20 USD)</strong>.
                  </p>
                  <p className="text-amber-400/90 text-[11px] font-semibold">
                    ⚠️ Rain Drops can only be planted/given away — when you plant rain for a creator, it turns into cash earnings in their Earnings Wallet (95% net).
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#080d0b] border border-[#1a2d24]">
                  <p className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <DollarSign className="h-4 w-4" />
                    <span>Earnings Wallet (Cash Out)</span>
                  </p>
                  <p className="text-stone-400">
                    Exact 5% platform fee: at <strong>20 Drops ($0.20)</strong>, the platform receives <strong>1 Drop ($0.01)</strong> and the creator receives <strong>19 Drops ($0.19)</strong>.
                  </p>
                  <p className="text-emerald-400/90 text-[11px] font-semibold">
                    ✓ Cash out via Stripe Connect above $100.00 USD. Freely convert earnings back into Rain Drops 💧 anytime with 0% fee!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="bg-[#090e0c] rounded-2xl border border-[#1c3026] p-4 text-center min-w-[200px] flex flex-col justify-center space-y-1">
              <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Creator Net Yield</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">95%</span>
              <span className="text-[10px] text-stone-500 font-mono">5% platform fee ($0.01 per 20 drops)</span>
            </div>
          </div>
        </div>

        {/* 2. THE TWO WALLETS HERO DISPLAY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WALLET 1: RAIN DROPS WALLET */}
          <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                    <span className="text-2xl">💧</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Rain Drops Wallet</h2>
                    <p className="text-xs text-stone-400">In-App Community Currency</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#172d24] text-cyan-300 border border-cyan-500/30">
                  Spending Currency
                </span>
              </div>

              {/* Rain Drops Balance Numbers & Macro Buckets */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-400">Current Balance:</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
                      {waterBalance.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-stone-400 ml-1.5">Rain Drops 💧</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 font-mono border-t border-[#15221d] pt-2">
                  <span className="text-emerald-400 font-semibold">
                    🪣 Macro Units: {(waterBalance / 500).toFixed(1)} Water Buckets
                  </span>
                  <span>${(waterBalance / 100).toFixed(2)} USD (100 Drops = $1)</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start space-x-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                <p className="leading-relaxed">
                  Planting rain for creators turns into cash earnings in the recipient's wallet (95% net after exact 5% fee). 1 Water Bucket 🪣 = 500 Drops ($5.00). Minimum gift is 20 Drops ($0.20).
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={openTopUpModal}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 hover:opacity-95 active:scale-98 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>🌧️</span>
                <span>+ Buy Rain Drops & Water Buckets (100 💧 = $1.00 USD)</span>
              </button>
            </div>
          </div>

          {/* WALLET 2: CREATOR EARNINGS WALLET */}
          <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Earnings Wallet</h2>
                    <p className="text-xs text-stone-400">Withdrawable USD Cash (95% Net)</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  isEligibleToCashOut
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isEligibleToCashOut ? '✓ Ready for Cash Out' : 'Progress to $100.00'}
                </span>
              </div>

              {/* Earnings Balance Numbers */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-400">Available to Cash Out:</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      ${earningsBalanceUsd.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-stone-400 ml-1">USD</span>
                  </div>
                </div>

                {/* Cash Out Threshold Progress Bar */}
                <div className="space-y-1.5 border-t border-[#15221d] pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Cash Out Threshold ($100.00 min):</span>
                    <span className={isEligibleToCashOut ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {cashOutProgressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#15231e] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEligibleToCashOut ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      }`}
                      style={{ width: `${cashOutProgressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {isEligibleToCashOut
                      ? '✓ You have reached the $100 minimum and can cash out via Stripe anytime!'
                      : `Earn $${(minCashOutThreshold - earningsBalanceUsd).toFixed(2)} more to unlock Stripe payout.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Cash Out or Convert to Rain Drops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                disabled={!isEligibleToCashOut}
                onClick={() => setIsCashOutModalOpen(true)}
                className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                  isEligibleToCashOut
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-950/40 cursor-pointer active:scale-98'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Cash Out via Stripe (Above $100)</span>
              </button>

              <button
                onClick={() => setIsConvertModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-[#15231e] hover:bg-[#1c322a] border border-[#213b30] text-cyan-400 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>Convert to Rain Drops 💧 (0% Fee)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. RECENT WALLET TRANSACTIONS LEDGER */}
        <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Wallet & Payout Activity</h3>
            </div>
            <span className="text-xs font-mono text-stone-400">
              {relevantTransactions.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#15221d] text-stone-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Wallet Impact</th>
                  <th className="pb-3 font-semibold">Platform Fee (5%)</th>
                  <th className="pb-3 font-semibold">Net USD / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15221d]">
                {relevantTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#15231e]/50 transition-colors">
                    <td className="py-3 text-stone-400 font-mono">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-stone-200">
                      <div className="font-medium text-white">{tx.reference_title}</div>
                      <div className="text-[11px] text-stone-400">{tx.counterparty_name}</div>
                    </td>
                    <td className="py-3 font-mono">
                      {tx.type === 'tip_sent' && (
                        <span className="text-emerald-400 font-bold">
                          {tx.amount} Drops (Water Wallet)
                        </span>
                      )}
                      {tx.type === 'cash_out' && (
                        <span className="text-amber-400 font-bold">
                          -${tx.net_usd?.toFixed(2)} (Earnings Wallet)
                        </span>
                      )}
                      {tx.type === 'convert_earnings_to_water' && (
                        <span className="text-emerald-400 font-bold">
                          +{tx.amount} Drops (Converted)
                        </span>
                      )}
                      {tx.type === 'topup_purchase' && (
                        <span className="text-emerald-400 font-bold">
                          +{tx.amount} Drops (Bought)
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-stone-400">
                      {tx.fee_amount ? `-$${tx.fee_amount.toFixed(2)}` : '0%'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#172d24] text-emerald-400 border border-emerald-500/20">
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* CASH OUT MODAL (WITHDRAW ABOVE $100)                         */}
      {/* ============================================================ */}
      {isCashOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#1b2b24] bg-[#0c120f] p-6 sm:p-7 shadow-2xl text-stone-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cash Out via Stripe</h3>
                  <p className="text-xs text-stone-400">Withdraw your creator revenue directly to your connected Stripe account</p>
                </div>
              </div>
              <button
                onClick={() => setIsCashOutModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {payoutStatusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                payoutStatusMessage.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
              }`}>
                {payoutStatusMessage.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{payoutStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span>Withdrawal Amount (USD):</span>
                  <span className="text-stone-500 font-mono">Available: ${earningsBalanceUsd.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="100"
                    max={earningsBalanceUsd}
                    step="0.01"
                    value={cashOutAmount}
                    onChange={e => setCashOutAmount(e.target.value)}
                    className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-stone-500 font-mono mt-1">
                  Minimum cash out threshold is $100.00 USD.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">Payout Method (Stripe Only):</label>
                <div className="p-3.5 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 to-[#0e1613] flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-sm">
                      S
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">Stripe Connect</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active & Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">Exclusive creator payout partner</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              {/* STRIPE PROCESSING & PAYOUT FEE BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Gross Withdrawal:</span>
                  <span className="font-mono font-bold text-white">${parsedWithdrawal.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span>Stripe Payout Fee (0.25% + $0.25):</span>
                  <span className="font-mono font-bold">-${stripePayoutFee.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#15221d]">
                  <span className="text-white">Net Deposited into Stripe:</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    +${netStripeTakeHome.toFixed(2)} USD
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-mono pt-1">
                  Stripe transfer fees apply to all payouts. Funds clear within 1-2 business days.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Connected Stripe Account Email or ID:
                </label>
                <input
                  type="text"
                  required
                  value={stripeAccountId}
                  onChange={e => setStripeAccountId(e.target.value)}
                  placeholder="e.g. danou@onshow.properties or acct_1N..."
                  className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-[#15221d] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCashOutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-950/40 cursor-pointer"
                >
                  Confirm Stripe Payout (${parsedWithdrawal.toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONVERT EARNINGS TO WATER MODAL (REINVESTMENT)                */}
      {/* ============================================================ */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#1b2b24] bg-[#0c120f] p-6 sm:p-7 shadow-2xl text-stone-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Convert Earnings to Rain Drops 💧</h3>
                  <p className="text-xs text-stone-400">Reinvest in the community at 100 Rain Drops per $1 USD (0% fee)</p>
                </div>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {convertStatusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                convertStatusMessage.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
              }`}>
                {convertStatusMessage.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{convertStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span>Amount to Convert from Earnings (USD):</span>
                  <span className="text-stone-500 font-mono">Available: ${earningsBalanceUsd.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    max={earningsBalanceUsd}
                    step="1"
                    value={convertAmountUsd}
                    onChange={e => setConvertAmountUsd(e.target.value)}
                    className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Instant conversion preview */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Conversion Rate:</span>
                  <span className="font-mono font-bold text-white">1 USD = 100 Rain Drops 💧 (1 Water Bucket 🪣 = 500 💧)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Platform Conversion Fee:</span>
                  <span className="font-mono font-bold text-emerald-400">0% (Completely Free)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#15221d]">
                  <span className="text-white">Rain Drops You Will Receive:</span>
                  <div className="text-right">
                    <span className="text-lg font-mono font-extrabold text-emerald-400">
                      +{(parseFloat(convertAmountUsd || '0') * 100).toLocaleString()} 💧
                    </span>
                    <span className="text-xs text-stone-400 font-mono ml-1.5">
                      ({((parseFloat(convertAmountUsd || '0') * 100) / 500).toFixed(1)} 🪣)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#15221d] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Convert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
