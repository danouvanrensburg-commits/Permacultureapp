import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  FileText,
  User,
  Sparkles,
  Check,
  Sprout,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: {
    location: string;
    bio: string;
    full_name?: string;
    headline?: string;
    permaculture_focus?: string;
  }) => void;
}

const REGION_PRESETS = [
  '📍 Windhoek, Namibia',
  '📍 Cascadia, WA',
  '📍 Western Cape, South Africa',
  '📍 Byron Bay, Australia',
  '📍 Sunshine Coast, QLD',
  '📍 Alentejo, Portugal',
  '📍 Austin, TX, USA'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [permacultureFocus, setPermacultureFocus] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocation(profile.location || '');
      // Automatically sanitize any legacy branding in the initial bio load
      let initialBio = profile.bio || '';
      if (initialBio.includes('App The Moment')) {
        initialBio = initialBio.replace(/App The Moment/g, 'Permaculture App');
      }
      setBio(initialBio);
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setPermacultureFocus(profile.permaculture_focus || '');
      setFeedback(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Detect any legacy ATM or App The Moment mentions
  const hasLegacyBrand =
    bio.toLowerCase().includes('app the moment') ||
    bio.includes(' ATM ') ||
    bio.endsWith(' ATM') ||
    bio.startsWith('ATM ');

  const handleFixBranding = () => {
    let cleaned = bio.replace(/App The Moment/gi, 'Permaculture App');
    cleaned = cleaned.replace(/\bATM\b/g, 'Permaculture App');
    setBio(cleaned);
    setFeedback('✨ Bio updated to "Permaculture App" branding!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSelectPresetLocation = (preset: string) => {
    // Strip leading emoji if desired or keep clean
    const cleanPreset = preset.replace(/^📍\s*/, '');
    setLocation(cleanPreset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-clean on submit if any legacy branding remains
    let finalBio = bio.trim();
    if (finalBio.includes('App The Moment')) {
      finalBio = finalBio.replace(/App The Moment/g, 'Permaculture App');
    }

    onSave({
      location: location.trim(),
      bio: finalBio,
      full_name: fullName.trim() || profile.full_name,
      headline: headline.trim() || profile.headline,
      permaculture_focus: permacultureFocus.trim() || profile.permaculture_focus
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0b120f] border border-stone-200 dark:border-[#1b2b24] shadow-2xl overflow-hidden transition-all text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-[#1b2b24] bg-stone-50/70 dark:bg-[#070d0b]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                <span>Edit Profile ✏️</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Update your location, town/region, and steward bio for the Permaculture App
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#15231e] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Closest Town / Region */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <span className="flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Closest Town / Region (📍)</span>
              </span>
              <span className="text-[11px] font-mono text-stone-400">Shown in header & posts</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 📍 Windhoek, Namibia or 📍 Cascadia, WA"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#121c17] border border-stone-300 dark:border-[#21352b] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {REGION_PRESETS.map((preset) => {
                  const clean = preset.replace(/^📍\s*/, '');
                  const isSelected = location.toLowerCase() === clean.toLowerCase();
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPresetLocation(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold'
                          : 'bg-stone-100 dark:bg-[#101a15] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-[#1a2c24] hover:border-emerald-500/30'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bio Description */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Bio Description</span>
              </label>
              {hasLegacyBrand && (
                <button
                  type="button"
                  onClick={handleFixBranding}
                  className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Update to "Permaculture App"</span>
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your site, guilds, watershed focus, and regenerative projects..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#121c17] border border-stone-300 dark:border-[#21352b] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors shadow-inner resize-none leading-relaxed"
            />
            {hasLegacyBrand && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Notice: Old 'App The Moment' reference detected. Clicking Save or the button above will modernize to 'Permaculture App'.</span>
              </p>
            )}
          </div>

          {/* Display Name & Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-stone-500" />
                <span>Display Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Danou van Rensburg"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#121c17] border border-stone-300 dark:border-[#21352b] text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Permaculture Focus</span>
              </label>
              <input
                type="text"
                value={permacultureFocus}
                onChange={(e) => setPermacultureFocus(e.target.value)}
                placeholder="e.g., Keyline Swales & Water Economy"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#121c17] border border-stone-300 dark:border-[#21352b] text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Headline / Subtitle
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Time Keeper & Decentralized Water Steward"
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#121c17] border border-stone-300 dark:border-[#21352b] text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200 dark:border-[#1b2b24]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#15231e] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
