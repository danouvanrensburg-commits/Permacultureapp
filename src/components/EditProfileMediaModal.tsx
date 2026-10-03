import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  Trash2,
  Sparkles,
  User,
  Layers,
  Eye,
  RefreshCw,
  Droplets
} from 'lucide-react';

interface EditProfileMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (images: { avatar_url: string; cover_url?: string }) => void;
  currentAvatar: string;
  currentCover?: string;
  fullName: string;
  username: string;
  initialTab?: 'avatar' | 'cover';
}

const PRESET_AVATARS = [
  {
    name: 'Garden Steward',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Forest Farmer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Seed Guardian',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Agroforestry Guide',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Natural Builder',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Soil Microbiologist',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80'
  }
];

const PRESET_BANNERS = [
  {
    title: 'Edible Food Forest Canopy',
    url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Rainwater Swale & Wetlands',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Solar Permaculture Homestead',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Mountain Terraced Earthworks',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Heritage Harvest Garden',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Medicinal Herb Spiral & Orchard',
    url: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=1200&q=80'
  }
];

export const EditProfileMediaModal: React.FC<EditProfileMediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentAvatar,
  currentCover,
  fullName,
  username,
  initialTab = 'avatar'
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'cover'>(initialTab);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [coverUrl, setCoverUrl] = useState(currentCover || '');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [customCoverInput, setCustomCoverInput] = useState('');

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAvatarUrl(currentAvatar);
      setCoverUrl(currentCover || '');
      setActiveTab(initialTab);
      setCustomAvatarInput('');
      setCustomCoverInput('');
    }
  }, [isOpen, currentAvatar, currentCover, initialTab]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      avatar_url: avatarUrl.trim() || currentAvatar,
      cover_url: coverUrl.trim() ? coverUrl.trim() : undefined
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 dark:bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-media-title"
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100 overflow-hidden transition-all max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Camera className="h-4 w-4" />
              </span>
              <h2 id="edit-media-title" className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Edit Profile Picture & Banner
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Update your avatar portrait and regenerative farm cover banner.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 px-6 pt-4 pb-2 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Picture (Avatar)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'cover'
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Cover Banner</span>
          </button>
        </div>

        {/* Form Body */}
        <form id="media-form" onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          
          {/* Live Mini Preview Header */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-md bg-stone-900">
            <div className="h-28 sm:h-36 w-full relative overflow-hidden bg-stone-800">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Live Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 flex items-center justify-center text-xs text-stone-500">
                  <span>No banner selected (default gradient will display)</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                Live Preview
              </div>
            </div>

            <div className="px-5 pb-4 pt-0 relative bg-white dark:bg-stone-900">
              <div className="flex items-end space-x-3 -mt-10 sm:-mt-12">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt="Live Avatar Preview"
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-white dark:ring-stone-900 border border-emerald-500/50 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-stone-950 shadow">
                    <Droplets className="h-3 w-3" />
                  </div>
                </div>

                <div className="pb-1 min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                    {fullName}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono truncate">
                    @{username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: PROFILE PICTURE (AVATAR) */}
          {activeTab === 'avatar' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Native file input */}
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={avatarUrl}
                    alt="Current Avatar"
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500/50"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      Upload from your device
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      PNG, JPG, or WEBP up to 5MB. Square (1:1) recommended.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose Photo File</span>
                </button>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Or enter image URL:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={e => setCustomAvatarInput(e.target.value)}
                    placeholder="https://example.com/my-profile-picture.jpg"
                    className="flex-1 bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setAvatarUrl(customAvatarInput.trim());
                        setCustomAvatarInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Or select a Regenerative Steward Avatar:
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    1-Click Select
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_AVATARS.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`flex items-center space-x-2.5 p-2 rounded-2xl border transition-all text-left cursor-pointer group ${
                        avatarUrl === preset.url
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40'
                          : 'border-stone-200 dark:border-stone-700/70 hover:border-emerald-500/50 bg-stone-50 dark:bg-stone-800/40'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-10 w-10 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                          {preset.name}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-mono">
                          {avatarUrl === preset.url ? 'Selected' : 'Use Preset'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COVER BANNER */}
          {activeTab === 'cover' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Native file input */}
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleCoverFile}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    Upload banner image
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Landscape format recommended (2.5:1 ratio, min 1200x480px).
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Banner File</span>
                  </button>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                      title="Remove banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Or enter banner image URL:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={customCoverInput}
                    onChange={e => setCustomCoverInput(e.target.value)}
                    placeholder="https://example.com/my-farm-swale-banner.jpg"
                    className="flex-1 bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCoverInput.trim()) {
                        setCoverUrl(customCoverInput.trim());
                        setCustomCoverInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Preset Banners */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Or select a Permaculture Landscape Banner:
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    High-Res Banners
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_BANNERS.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setCoverUrl(preset.url)}
                      className={`relative h-24 rounded-2xl overflow-hidden border text-left cursor-pointer group transition-all ${
                        coverUrl === preset.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                          : 'border-stone-200 dark:border-stone-700/70 hover:border-emerald-500/40'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-xs font-bold text-white leading-tight">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-emerald-300 font-mono mt-0.5">
                          {coverUrl === preset.url ? '✓ Active Selection' : 'Click to preview'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Changes apply instantly to your profile & posts
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-2xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="media-form"
              className="py-2 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Save Photos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
