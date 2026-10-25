import React from 'react';
import { X, ShieldCheck, Scale, FileText, Droplets, AlertCircle } from 'lucide-react';

export interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
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
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg shadow-inner">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                <span>Terms of Service</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Version 2026.1
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-stone-400">
                Effective Date: October 2026 • Permaculture App &amp; Bush TV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700 dark:text-stone-300 leading-relaxed scrollbar-thin">
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Summary of Core Principles</span>
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300/90 text-xs">
              Permaculture App is a regenerative community platform built on Earth Care, People Care, and Fair Share.
              We respect your intellectual property, safeguard honest agricultural exchange, and return 95% of donor micro-tips directly to creators.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <span>1. Agreement to Terms</span>
            </h3>
            <p>
              By accessing or using Permaculture App, Bush TV fireside chats, course portals, or the Watering Economy, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use our services.
            </p>
          </div>

          {/* Section 2: Watering Economy */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <span>2. The Watering Economy &amp; Rain Drops</span>
            </h3>
            <p>
              The platform utilizes a digital utility token known as <strong>Rain Drops (💧)</strong> and <strong>Water Buckets (🪣)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Exchange Valuation:</strong> 100 Rain Drops are valued at $1.00 USD (1 Rain Drop = $0.01 USD). 1 Water Bucket equals 500 Rain Drops ($5.00 USD).</li>
              <li><strong>Fair Share Split (95% / 5%):</strong> When Rain Drops are tipped to a creator or moment, 95% of the gross value is credited directly to the recipient creator&apos;s Earnings Wallet ($0.95 per 100 Drops). The remaining 5% is allocated to platform hosting, bandwidth, and open-source regenerative infrastructure.</li>
              <li><strong>Non-Refundable &amp; Non-Speculative:</strong> Rain Drops purchased in your Giving Wallet are digital tokens designed strictly for gifting and accessing creator content. They are not investment instruments or interest-bearing securities.</li>
              <li><strong>Creator Withdrawals:</strong> Verified creators can request earnings cashouts via Stripe Connect, Wise Direct, or direct electronic transfer subject to standard anti-money laundering (AML) and identity checks.</li>
            </ul>
          </div>

          {/* Section 3: User Content & IP */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <span>3. Content Ownership &amp; Intellectual Property</span>
            </h3>
            <p>
              Creators retain 100% intellectual property ownership of their original designs, contour maps, CAD blueprints, articles, videos, and course curriculum uploaded to the platform. By posting content, you grant Permaculture App a worldwide, non-exclusive license to host, display, and distribute the content solely within the service.
            </p>
          </div>

          {/* Section 4: Ecological & Field Disclaimer */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>4. Ecological &amp; Field Guidance Disclaimer</span>
            </h3>
            <p>
              All suggestions provided on this site—including automated ecological advice from &ldquo;Dan&rdquo; or other stewards—are for educational and experimental permaculture discovery. Earthworks, dam building, swale excavation, and wild plant consumption must always be cross-referenced with local certified hydrologists, engineering standards, and local zoning laws before physical implementation. Permaculture App accepts no liability for field property alterations.
            </p>
          </div>

          {/* Section 5: Conduct & Termination */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <span>5. Prohibited Conduct &amp; Account Termination</span>
            </h3>
            <p>
              We reserve the right to suspend or terminate accounts that engage in:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Posting commercial spam, financial scams, or unauthorized token promotions.</li>
              <li>Harassing or defaming other stewards, elders, or educators.</li>
              <li>Advocating hazardous chemical dumping or illegal bio-contamination.</li>
              <li>Automated scraping or denial-of-service attacks against platform servers.</li>
            </ul>
          </div>

          {/* Section 6: Contact */}
          <div className="pt-2 border-t border-neutral-200 dark:border-stone-800 text-neutral-500 dark:text-stone-400">
            <p>
              Questions regarding these Terms of Service may be addressed to <strong>support@permacultureapp.com</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-stone-800 flex justify-end bg-neutral-50/70 dark:bg-stone-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
