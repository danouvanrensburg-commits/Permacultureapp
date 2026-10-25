import React from 'react';
import { X, Lock, Shield, EyeOff, CheckCircle2, Database } from 'lucide-react';

export interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-lg shadow-inner">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                <span>Privacy Policy</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  GDPR &amp; CCPA Compliant
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-stone-400">
                Effective Date: October 2026 • Permaculture App
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
          {/* Privacy Commitment Banner */}
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-cyan-900 dark:text-cyan-200 text-sm">
              <EyeOff className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Zero-Tracker Guarantee</span>
            </div>
            <p className="text-cyan-800/90 dark:text-cyan-300/90 text-xs">
              We believe in digital ecology. We do not sell your personal data, we do not deploy invasive third-party ad retargeting pixels, and we only collect information necessary to operate your account and process regenerative transactions.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <span>1. Information We Collect</span>
            </h3>
            <p>
              When you participate in Permaculture App, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Profile Information:</strong> Username, display name, email address, bio, climate zone, and avatar image.</li>
              <li><strong>Regenerative Activity:</strong> Community moments, Bush TV fireside messages, comments, course enrollments, and channel attendance.</li>
              <li><strong>Wallet &amp; Transaction Ledger:</strong> Rain Drops balances, tip transaction records, and payment processor references (we do not store full credit card numbers directly on our servers).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <span>2. How We Use Information</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain your fireside chat circles and community feeds.</li>
              <li>To calculate and disburse the 95% creator split accurately to recipient creators.</li>
              <li>To dispatch email notifications according to your personalized alert preferences.</li>
              <li>To enforce automated content safety and protect stewards from malicious attacks.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <Database className="h-4 w-4 text-emerald-500" />
              <span>3. Data Storage &amp; Cookies</span>
            </h3>
            <p>
              We use necessary local storage entries and session tokens to keep you securely signed in, preserve your dark/light theme choices, and cache notification read states. We do not use third-party behavioral advertising cookies.
            </p>
          </div>

          {/* Section 4: Your Rights */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-1.5">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>4. Your GDPR &amp; CCPA Rights</span>
            </h3>
            <p>
              Under international data protection legislation, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access &amp; Portability:</strong> Request an export of your personal moments, comments, and transaction records.</li>
              <li><strong>Rectification:</strong> Update or modify your profile and settings at any time in your dashboard.</li>
              <li><strong>Right to be Forgotten:</strong> Request full erasure of your account and personal identifying details.</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="pt-2 border-t border-neutral-200 dark:border-stone-800 text-neutral-500 dark:text-stone-400">
            <p>
              To exercise any of your data rights or make inquiries, contact our Data Protection Steward at <strong>privacy@permacultureapp.com</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-stone-800 flex justify-end bg-neutral-50/70 dark:bg-stone-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Acknowledge Privacy Terms
          </button>
        </div>
      </div>
    </div>
  );
};
