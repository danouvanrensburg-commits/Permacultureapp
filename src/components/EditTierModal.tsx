import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Info,
  Check,
  Sparkles,
  Droplets,
  Award,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Radio,
  MapPin,
  Users,
  Eye,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CreatorMembershipTier } from '../types';

interface EditTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tier: CreatorMembershipTier) => void;
  onDelete?: (tierId: string) => void;
  initialTier?: CreatorMembershipTier | null;
}

// Preset curated regenerative permaculture cover images
const PRESET_TIER_IMAGES = [
  {
    title: 'Edible Food Forest',
    url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Heritage Seed Harvest',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Rainwater Swale & Wetland',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Medicinal Herb Guild',
    url: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80'
  }
];

// Quick suggestions for regenerative community perks
const SUGGESTED_PERKS = [
  '🪵 Bush TV Fireside Circle Access',
  '🌱 Seasonal Seed Packet Dispatch',
  '🗺️ Downloadable CAD Permaculture Blueprints',
  '🏷️ Verified Supporter Badge in Community Feed',
  '📊 Monthly Harvest & Swale Moisture Logs',
  '💧 10% Discount on Rare Heirloom Stock',
  '💬 Direct Q&A with Guild Masters'
];

export const EditTierModal: React.FC<EditTierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTier
}) => {
  const [tierName, setTierName] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('5.00');
  const [perks, setPerks] = useState<string[]>([]);
  const [newPerkInput, setNewPerkInput] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('Guild Member');
  const [isPopular, setIsPopular] = useState(false);
  const [setupDiscord, setSetupDiscord] = useState(false);
  const [requestAddress, setRequestAddress] = useState(false);
  const [limitMembers, setLimitMembers] = useState(false);
  const [maxMembersCount, setMaxMembersCount] = useState('50');
  const [publishTier, setPublishTier] = useState(true);
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTier) {
        setTierName(initialTier.name || '');
        setPricePerMonth(initialTier.price_usd?.toFixed(2) || '5.00');
        setPerks(initialTier.perks || []);
        setDescription(initialTier.description || '');
        setImageUrl(initialTier.image_url || '');
        setWelcomeMessage(initialTier.welcome_message || '');
        setBadgeLabel(initialTier.badge || 'Guild Member');
        setIsPopular(!!initialTier.popular);
        setSetupDiscord(!!initialTier.discord_role);
        setRequestAddress(!!initialTier.request_address);
        setLimitMembers(!!initialTier.limit_members);
        setMaxMembersCount(initialTier.max_members ? initialTier.max_members.toString() : '50');
        setPublishTier(initialTier.is_published !== false);
      } else {
        // Defaults for creating a new tier
        setTierName('');
        setPricePerMonth('5.00');
        setPerks([
          'Access to exclusive monthly field logs & photo journals',
          'Supporter badge in Bush TV live firesides'
        ]);
        setDescription('');
        setImageUrl('');
        setWelcomeMessage('');
        setBadgeLabel('Guild Member');
        setIsPopular(false);
        setSetupDiscord(false);
        setRequestAddress(false);
        setLimitMembers(false);
        setMaxMembersCount('50');
        setPublishTier(true);
      }
      setNewPerkInput('');
      setShowDeleteConfirm(false);
      setShowPresetPicker(false);
    }
  }, [isOpen, initialTier]);

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

  const numericPrice = Math.max(0.5, parseFloat(pricePerMonth) || 0);
  const calculatedDrops = Math.round(numericPrice * 100);
  const calculatedBuckets = (numericPrice / 5).toFixed(1);

  const handleAddPerk = (textToAdd?: string) => {
    const text = (textToAdd || newPerkInput).trim();
    if (!text) return;
    if (!perks.includes(text)) {
      setPerks(prev => [...prev, text]);
    }
    setNewPerkInput('');
  };

  const handleRemovePerk = (index: number) => {
    setPerks(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tierName.trim() || 'New Membership Tier';
    const finalPrice = Math.max(1, parseFloat(pricePerMonth) || 5);
    const waterDrops = Math.round(finalPrice * 100);

    const savedTier: CreatorMembershipTier = {
      id: initialTier?.id || `tier_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: finalName,
      price_usd: finalPrice,
      water_drops_per_month: waterDrops,
      rain_drops_per_month: waterDrops,
      badge: badgeLabel.trim() || `${finalName} Member`,
      description: description.trim(),
      perks: perks.length > 0 ? perks : ['Community supporter recognition'],
      popular: isPopular,
      image_url: imageUrl || undefined,
      welcome_message: welcomeMessage.trim() || undefined,
      discord_role: setupDiscord,
      request_address: requestAddress,
      limit_members: limitMembers,
      max_members: limitMembers ? parseInt(maxMembersCount, 10) || 50 : undefined,
      is_published: publishTier
    };

    onSave(savedTier);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 dark:bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tier-modal-title"
    >
      <div
        className="relative w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100 overflow-hidden transition-all max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
              </span>
              <h2 id="tier-modal-title" className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                {initialTier ? 'Edit Membership Tier' : 'Create Membership Tier'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Set monthly perks, stewardship rewards, and membership benefits.
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

        {/* Scrollable Form Body */}
        <form id="tier-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          
          {/* 1. TIER NAME */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tier-name-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Tier name
              </label>
              <span className={`text-[11px] font-mono ${tierName.length >= 30 ? 'text-amber-500 font-bold' : 'text-stone-400'}`}>
                {tierName.length} / 30
              </span>
            </div>
            <input
              id="tier-name-input"
              type="text"
              required
              maxLength={30}
              value={tierName}
              onChange={e => setTierName(e.target.value)}
              placeholder="e.g. '🌱 Seedling Guild' or '🌿 Canopy Steward'"
              className="w-full bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {/* Quick Emoji / Guild Badge presets */}
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[11px] text-stone-400 font-medium">Quick icons:</span>
              {['🌱 Seedling', '🌿 Canopy', '🌳 Forest', '💧 Rain Maker', '🐝 Pollinator'].map(iconName => (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => {
                    if (!tierName) setTierName(iconName);
                    else if (!tierName.includes(iconName.split(' ')[0])) {
                      setTierName(`${iconName.split(' ')[0]} ${tierName}`.substring(0, 30));
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] font-medium text-stone-600 dark:text-stone-300 transition-colors"
                >
                  {iconName}
                </button>
              ))}
            </div>
          </div>

          {/* 2. PRICE PER MONTH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="price-month-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Price per month
              </label>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-700 dark:text-cyan-300">
                <span>🌧️ {calculatedDrops.toLocaleString()} 💧/mo</span>
                <span>•</span>
                <span>{calculatedBuckets} 🪣</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
              Set your minimum price per month. Supporters can choose to pay more.
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm select-none">
                $
              </span>
              <input
                id="price-month-input"
                type="text"
                required
                value={pricePerMonth}
                onChange={e => setPricePerMonth(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="5.00"
                className="w-full bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 3. MEMBERSHIP BENEFITS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                  Membership benefits
                </label>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Add rewards and perks exclusive to this tier ({perks.length} added)
                </p>
              </div>
            </div>

            {/* Existing Perks List */}
            {perks.length > 0 && (
              <div className="space-y-2 mb-3">
                {perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/70 text-xs sm:text-sm text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePerk(idx)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Remove benefit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input to Add Custom Benefit */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newPerkInput}
                onChange={e => setNewPerkInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPerk();
                  }
                }}
                placeholder="Type a new benefit and click '+ Add benefit'..."
                className="flex-1 bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddPerk()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add benefit</span>
              </button>
            </div>

            {/* Quick perk suggestion tags */}
            <div className="mt-2.5">
              <span className="text-[11px] font-medium text-stone-400 block mb-1.5">
                Suggested regenerative perks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PERKS.map(suggestion => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => handleAddPerk(suggestion)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>+</span>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. DESCRIPTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tier-desc-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Description
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                {description.length} characters
              </span>
            </div>
            <textarea
              id="tier-desc-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what perks you'll offer to members of this tier."
              className="w-full bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all leading-relaxed"
            />
          </div>

          {/* 5. TIER IMAGE */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <label className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Tier image
              </label>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowImageTooltip(!showImageTooltip)}
                  onMouseEnter={() => setShowImageTooltip(true)}
                  onMouseLeave={() => setShowImageTooltip(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
                  aria-label="Image guide"
                >
                  <Info className="h-4 w-4" />
                </button>
                {showImageTooltip && (
                  <div className="absolute left-6 top-0 z-20 w-60 p-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-[11px] leading-tight shadow-xl pointer-events-none">
                    Use high quality landscape images (2:1 ratio recommended). It will appear as the card banner on your profile.
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2.5">
              We recommend using 2:1 ratio and displaying text and visuals in the center to avoid cropping.
            </p>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Image Preview or Upload Placeholder */}
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 h-32 bg-stone-900 group">
                <img
                  src={imageUrl}
                  alt="Tier banner preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-stone-900/90 text-white text-xs font-bold shadow hover:bg-stone-800 transition-colors flex items-center space-x-1"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/90 text-white text-xs font-bold shadow hover:bg-rose-500 transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-[#fbfbfb] dark:bg-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Upload a file</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                  className="py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#fbfbfb] dark:bg-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-amber-500" />
                  <span>Choose Preset</span>
                </button>
              </div>
            )}

            {/* Preset Gallery Picker */}
            {showPresetPicker && !imageUrl && (
              <div className="mt-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Select Permaculture Artwork:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TIER_IMAGES.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowPresetPicker(false);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 aspect-video hover:ring-2 hover:ring-emerald-500 transition-all text-left"
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-stone-950/60 flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium leading-tight line-clamp-1">{preset.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. WELCOME MESSAGE */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="welcome-msg-input" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Welcome message
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                {welcomeMessage.length} characters
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
              This message will be sent automatically when someone joins your tier. You can also use it to deliver rewards.
            </p>
            <textarea
              id="welcome-msg-input"
              rows={3}
              value={welcomeMessage}
              onChange={e => setWelcomeMessage(e.target.value)}
              placeholder="Say hi to your new member! Share Discord fireside links or bonus download codes..."
              className="w-full bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all leading-relaxed"
            />
          </div>

          {/* 7. SETTINGS & INTEGRATIONS CHECKBOXES */}
          <div className="pt-2 space-y-3.5 border-t border-stone-100 dark:border-stone-800">
            
            {/* Checkbox 1: Set up Discord / Bush TV roles */}
            <label className="flex items-start space-x-3 cursor-pointer group select-none">
              <div
                onClick={() => setSetupDiscord(!setupDiscord)}
                className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  setupDiscord
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {setupDiscord && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Set up Discord & Bush TV roles
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Grant special badges and private circle access automatically.
                </span>
              </div>
            </label>

            {/* Checkbox 2: Request supporter's address */}
            <label className="flex items-start space-x-3 cursor-pointer group select-none">
              <div
                onClick={() => setRequestAddress(!requestAddress)}
                className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  requestAddress
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {requestAddress && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Request supporter's address
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Collect postal shipping address for physical seed packets or farm produce.
                </span>
              </div>
            </label>

            {/* Checkbox 3: Limit number of people who can join */}
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer group select-none">
                <div
                  onClick={() => setLimitMembers(!limitMembers)}
                  className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    limitMembers
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                  }`}
                >
                  {limitMembers && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    Limit number of people who can join
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Cap total subscribers to keep consultations intimate and high-touch.
                  </span>
                </div>
              </label>

              {limitMembers && (
                <div className="ml-8 flex items-center space-x-2 pt-1">
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Maximum stewards:</span>
                  <input
                    type="number"
                    min="1"
                    value={maxMembersCount}
                    onChange={e => setMaxMembersCount(e.target.value)}
                    className="w-24 bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Checkbox 4: Most Popular Tier Ribbon */}
            <label className="flex items-start space-x-3 cursor-pointer group select-none">
              <div
                onClick={() => setIsPopular(!isPopular)}
                className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  isPopular
                    ? 'bg-amber-500 text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {isPopular && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Highlight as "Most Popular"
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Feature this tier with a golden badge and prominent border.
                </span>
              </div>
            </label>

            {/* Checkbox 5: Publish tier */}
            <label className="flex items-start space-x-3 cursor-pointer group select-none pt-1">
              <div
                onClick={() => setPublishTier(!publishTier)}
                className={`h-5 w-5 mt-0.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  publishTier
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {publishTier && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Publish tier
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Show this tier on your page.
                </span>
              </div>
            </label>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <div>
            {initialTier && onDelete ? (
              showDeleteConfirm ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-rose-500 font-bold">Are you sure?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(initialTier.id)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs text-stone-700 dark:text-stone-300"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Tier</span>
                </button>
              )
            ) : (
              <span className="text-[11px] text-stone-400">
                Cancel anytime by stewards
              </span>
            )}
          </div>

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
              form="tier-form"
              className="py-2 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Save Tier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
