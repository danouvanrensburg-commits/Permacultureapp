import React, { useState } from 'react';
import { ArrowLeft, Scale, Lock, Sprout, ShieldCheck, Droplets, Check, AlertCircle } from 'lucide-react';

export interface LegalPageViewProps {
  type: 'terms' | 'privacy' | 'guidelines';
  navigate: (route: string) => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({ type: initialType, navigate }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'guidelines'>(initialType);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-stone-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('feed')}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-stone-800/80 hover:bg-neutral-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            title="Return to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
              <span>Trust, Safety &amp; Legal Hub</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-stone-400">
              Permaculture App • The Regenerative Guild Community Standards
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-stone-900/90 border border-neutral-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'terms'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Terms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'privacy'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            <span>Standards</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-white dark:bg-stone-900/90 border border-neutral-200 dark:border-stone-800 p-6 sm:p-8 shadow-xl text-xs text-neutral-700 dark:text-stone-300 leading-relaxed space-y-6">
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fair Share Terms of Service</span>
              </div>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 text-xs">
                Permaculture App connects creators, broadacre hydrologists, and community members in a direct regenerative economy.
                All donor transactions are governed by our 95% creator / 5% platform split.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                1. The Watering Economy (Rain Drops &amp; Water Buckets)
              </h2>
              <p>
                Rain Drops (💧) are platform utility tokens used to show appreciation, fund creator goals, and unlock exclusive fireside channels on Bush TV.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Valuation:</strong> 100 Rain Drops equal $1.00 USD. 1 Water Bucket equals 500 Rain Drops ($5.00 USD).</li>
                <li><strong>Fair Share Split:</strong> When you gift Rain Drops, <strong>95%</strong> of the net value goes directly to the creator&apos;s earnings balance, and <strong>5%</strong> is retained by the platform to support server costs, development, and open-source regenerative design repositories.</li>
                <li><strong>No Speculation:</strong> Rain Drops cannot be staked or traded outside the platform. They are digital tokens intended solely to nourish permaculture creators and practical regenerative work.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                2. Intellectual Property Rights
              </h2>
              <p>
                You retain ownership of any blueprints, photos, articles, or courses you post. By publishing them, you grant Permaculture App a non-exclusive license to host, display, and stream your content to members.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                3. Field Implementation &amp; Engineering Disclaimer
              </h2>
              <p>
                All earthworks, water harvesting swales, keyline calculations, and medicinal forage tips provided by the platform, community members, or the Dan advisory system are educational. Physical implementation must be evaluated by licensed civil engineers and local authorities before breaking ground.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-cyan-900 dark:text-cyan-200 text-sm">
                <Lock className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Zero-Surveillance Privacy Commitment</span>
              </div>
              <p className="text-cyan-800/90 dark:text-cyan-300/90 text-xs">
                We believe personal privacy is a fundamental human right. We do not sell your personal data or deploy ad tracking networks.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                1. Data Collected
              </h2>
              <p>
                We only retain data required to support your account: profile details (name, handle, bio, climate zone), posted moments, comments, and transaction records of purchased and gifted Rain Drops.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                2. Cookies &amp; Storage
              </h2>
              <p>
                We use secure local storage keys for authentication session tokens, theme preferences, and notification read states. We do not place third-party marketing tracking cookies on your device.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                3. Your Data Portability &amp; Erasure Rights
              </h2>
              <p>
                You may request a machine-readable export of all your published moments or submit an account deletion request at any time by contacting <strong>privacy@permacultureapp.com</strong>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
                <Sprout className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Regenerative Community Standards</span>
              </div>
              <p className="text-amber-800/90 dark:text-amber-300/90 text-xs">
                Our fireside discussions and feeds thrive on mutual respect, grounded ecological experimentation, and practical knowledge sharing.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100">
                Core Community Pillars
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-stone-950/60 border border-neutral-200 dark:border-stone-800">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">Earth Care</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Protect biological diversity, soil microbes, and clean aquifers.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-stone-950/60 border border-neutral-200 dark:border-stone-800">
                  <p className="font-bold text-blue-700 dark:text-blue-400">People Care</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Support beginners and experienced elders with respect and patience.</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-stone-950/60 border border-neutral-200 dark:border-stone-800">
                  <p className="font-bold text-amber-700 dark:text-amber-400">Fair Share</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Nourish creators and reinvest surplus energy into community resilience.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center space-x-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>Automated Prohibitions</span>
              </h2>
              <p>
                Automated shielding algorithms monitor messages and posts. Any promotional spam, crypto pitch links, abusive harassment, or bio-hazardous contamination recommendations will be quarantined immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
