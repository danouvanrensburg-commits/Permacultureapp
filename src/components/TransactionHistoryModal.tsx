import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Droplets,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { MomentsTransaction } from '../types';

export const TransactionHistoryModal: React.FC = () => {
  const { isTxHistoryOpen, setTxHistoryOpen, transactions, momentsBalance } = usePermaculture();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isTxHistoryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTxHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTxHistoryOpen, setTxHistoryOpen]);

  if (!isTxHistoryOpen) return null;

  const filtered = transactions.filter(tx => {
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      tx.counterparty_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tx_hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTxIcon = (tx: MomentsTransaction) => {
    switch (tx.type) {
      case 'tip_sent':
        return <ArrowUpRight className="h-4 w-4 text-amber-400" />;
      case 'tip_received':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
      case 'topup_purchase':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'channel_unlock':
        return <Lock className="h-4 w-4 text-purple-400" />;
      default:
        return <Droplets className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getTxTypeBadge = (tx: MomentsTransaction) => {
    switch (tx.type) {
      case 'tip_sent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300">Planted Rain 🌧️</span>;
      case 'tip_received':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">Rain Harvested 💧</span>;
      case 'topup_purchase':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300">Rain Drops Top-Up 💧</span>;
      case 'channel_unlock':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300">Channel Unlock</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 dark:bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setTxHistoryOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl my-auto rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setTxHistoryOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-200 dark:border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                Rain Drops 💧 Transaction Ledger
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verified Rain Drops 💧 and Water Buckets 🪣 transaction history
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-stone-100 dark:bg-stone-950 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="text-xs text-stone-500 dark:text-stone-400">Balance:</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
              <span>💧</span>
              <span>{momentsBalance.toLocaleString()}</span>
              <span className="text-[11px] font-normal text-emerald-500">
                ({(momentsBalance / 500).toFixed(1)} 🪣)
              </span>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Search reference, creator, hash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('tip_sent')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'tip_sent' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Tips Sent
            </button>
            <button
              onClick={() => setFilterType('tip_received')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'tip_received' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Harvested
            </button>
            <button
              onClick={() => setFilterType('topup_purchase')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'topup_purchase' ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Top-Ups
            </button>
            <button
              onClick={() => setFilterType('channel_unlock')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'channel_unlock' ? 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Unlocks
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              No transactions match this filter criteria.
            </div>
          ) : (
            filtered.map(tx => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700/80 transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                      {getTxIcon(tx)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-stone-900 dark:text-stone-200 text-sm">{tx.counterparty_name}</span>
                        {getTxTypeBadge(tx)}
                        {tx.test_mode && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-400 font-mono">
                            Demo Mode
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{tx.reference_title}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
                        <span>{new Date(tx.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="truncate max-w-[140px] text-stone-400 dark:text-stone-500">{tx.tx_hash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono flex items-center justify-end space-x-1 ${
                        isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <span>💧</span>
                      <span>{isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}</span>
                    </div>
                    <span className="inline-flex items-center text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500 mr-1" />
                      Completed
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
          <span>Ledger state stored in Supabase `moments_transactions` table</span>
          <button
            onClick={() => setTxHistoryOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
