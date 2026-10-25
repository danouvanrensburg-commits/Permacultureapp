import React, { useState } from 'react';
import {
  X,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Droplets,
  MessageCircle,
  AtSign,
  Radio,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

export interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser } = usePermaculture();

  // Local state for notification preferences (with localStorage persistence)
  const [emailEnabled, setEmailEnabled] = useState<boolean>(() => {
    return localStorage.getItem('perma_email_notifs') !== 'false';
  });

  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>(() => {
    return (localStorage.getItem('perma_notif_freq') as any) || 'instant';
  });

  const [notifyTips, setNotifyTips] = useState<boolean>(() => {
    return localStorage.getItem('perma_notif_tips') !== 'false';
  });

  const [notifyComments, setNotifyComments] = useState<boolean>(() => {
    return localStorage.getItem('perma_notif_comments') !== 'false';
  });

  const [notifyMentions, setNotifyMentions] = useState<boolean>(() => {
    return localStorage.getItem('perma_notif_mentions') !== 'false';
  });

  const [notifyFireside, setNotifyFireside] = useState<boolean>(() => {
    return localStorage.getItem('perma_notif_fireside') !== 'false';
  });

  // Email verification simulation state
  const userEmail = currentUser.email || `${currentUser.username}@permacultureapp.com`;
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return localStorage.getItem(`perma_verified_${currentUser.id}`) === 'true';
  });

  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendCode = () => {
    setCodeSent(true);
    setVerificationError(null);
    // In local simulation, default active code is 782419 or any 6-digit number
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length !== 6) {
      setVerificationError('Please enter a valid 6-digit confirmation code.');
      return;
    }

    // Success
    setIsVerified(true);
    setCodeSent(false);
    setVerificationError(null);
    localStorage.setItem(`perma_verified_${currentUser.id}`, 'true');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('perma_email_notifs', emailEnabled ? 'true' : 'false');
    localStorage.setItem('perma_notif_freq', frequency);
    localStorage.setItem('perma_notif_tips', notifyTips ? 'true' : 'false');
    localStorage.setItem('perma_notif_comments', notifyComments ? 'true' : 'false');
    localStorage.setItem('perma_notif_mentions', notifyMentions ? 'true' : 'false');
    localStorage.setItem('perma_notif_fireside', notifyFireside ? 'true' : 'false');

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-6 shadow-2xl text-neutral-900 dark:text-stone-100 text-left space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg shadow-inner">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-base">
                Notification &amp; Email Preferences
              </h3>
              <p className="text-xs text-neutral-500 dark:text-stone-400">
                Configure alert frequencies and verify your account email
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

        {/* 1. Account Email & Verification Status */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-stone-950/70 border border-neutral-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-neutral-800 dark:text-stone-200">
                Account Email
              </span>
            </div>
            {isVerified ? (
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-mono">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 font-mono">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span>Unverified</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-700 dark:text-stone-300">
            <span className="truncate pr-2">{userEmail}</span>
            {!isVerified && !codeSent && (
              <button
                type="button"
                onClick={handleSendCode}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0"
              >
                Send Verification Code
              </button>
            )}
          </div>

          {/* Verification input field */}
          {!isVerified && codeSent && (
            <form onSubmit={handleVerifyCode} className="pt-2 border-t border-neutral-200 dark:border-stone-800 space-y-2">
              <p className="text-[11px] text-neutral-600 dark:text-stone-400">
                A 6-digit confirmation code has been dispatched. Enter any 6 digits (e.g. <strong>782419</strong>) to complete verification:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6-digit code"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-neutral-300 dark:border-stone-700 text-xs font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              </div>
              {verificationError && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{verificationError}</p>
              )}
            </form>
          )}
        </div>

        {/* 2. Frequency Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
            Email Delivery Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'instant', label: 'Instant', desc: 'Real-time alerts' },
              { id: 'daily', label: 'Daily Digest', desc: 'Once per evening' },
              { id: 'weekly', label: 'Weekly', desc: 'Sunday summary' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFrequency(opt.id as any)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  frequency === opt.id
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/40'
                    : 'border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-950/50 text-neutral-700 dark:text-stone-300 hover:bg-neutral-100'
                }`}
              >
                <p className="font-bold">{opt.label}</p>
                <p className="text-[10px] text-neutral-500 dark:text-stone-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Event Notification Toggles */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
            Notification Triggers
          </label>

          <div className="space-y-2">
            {/* Tips & Rain Drops */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-stone-100">
                    Rain Drops &amp; Micro-Tips
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-stone-400">
                    Alerts when stewards plant water drops on your content or profile
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyTips}
                onChange={(e) => setNotifyTips(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Comments & Replies */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-stone-100">
                    Comments &amp; Discussion Replies
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-stone-400">
                    When someone replies to your moments or answers your comments
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyComments}
                onChange={(e) => setNotifyComments(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Mentions */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AtSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-stone-100">
                    Mentions &amp; Tags
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-stone-400">
                    When another steward mentions your username with @
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyMentions}
                onChange={(e) => setNotifyMentions(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Bush TV Firesides */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-stone-100">
                    Bush TV Live Fireside Circles
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-stone-400">
                    Broadcast announcements when channels you follow go live
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyFireside}
                onChange={(e) => setNotifyFireside(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-600 dark:text-stone-400 hover:bg-neutral-100 dark:hover:bg-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
