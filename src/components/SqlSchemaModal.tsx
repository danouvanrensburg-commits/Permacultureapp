import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { SUPABASE_SCHEMA_SQL } from '../lib/supabase';

export const SqlSchemaModal: React.FC = () => {
  const { isSchemaModalOpen, setSchemaModalOpen } = usePermaculture();
  const [copied, setCopied] = useState(false);

  if (!isSchemaModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/75 dark:bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSchemaModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 dark:border-stone-800/80 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                  Supabase & PostgreSQL Schema
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase">
                  Production DDL
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tables: profiles, bush_tv_channels, messages, posts, moments_transactions, channel_memberships with RLS.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors self-start sm:self-center shadow"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy SQL Migration</span>
              </>
            )}
          </button>
        </div>

        {/* Code Box */}
        <div className="mt-4 flex-1 overflow-y-auto rounded-2xl bg-stone-900 dark:bg-stone-950 border border-stone-800 p-4 font-mono text-xs text-stone-200 dark:text-stone-300 relative shadow-inner">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center space-x-1.5">
            <Terminal className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            <span>Paste directly into your Supabase SQL Editor or run with Supabase CLI</span>
          </span>
          <button
            onClick={() => setSchemaModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
