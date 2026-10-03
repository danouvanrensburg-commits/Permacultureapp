import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  CloudRain,
  Trees,
  Compass,
  Check,
  Trash2,
  Globe,
  Sparkles,
  Mountain,
  Waves
} from 'lucide-react';

interface EditClimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (climate: string) => void;
  currentClimate?: string;
}

const CLIMATE_PRESETS = [
  {
    name: 'Mediterranean',
    icon: '☀️',
    badge: 'Zone 9 - 10',
    desc: 'Hot dry summers, mild rainy winters. Olives, figs, grapes, water swales.'
  },
  {
    name: 'Temperate',
    icon: '🌲',
    badge: 'Zone 5 - 8',
    desc: 'Four distinct seasons with regular rainfall. Apples, berries, comfrey guilds.'
  },
  {
    name: 'Subtropical',
    icon: '🌿',
    badge: 'Zone 9 - 11',
    desc: 'Warm humid summers, mild frost-free winters. Citrus, avocados, food forests.'
  },
  {
    name: 'Tropical / Humid Tropics',
    icon: '🌴',
    badge: 'Zone 11+',
    desc: 'Year-round warmth and high precipitation. Multi-strata jungle agroforestry.'
  },
  {
    name: 'Arid / Drylands',
    icon: '🌵',
    badge: 'Low Rainfall',
    desc: 'Low precipitation, high evaporation. Keyline earthworks, drought-tolerant species.'
  },
  {
    name: 'Continental / Cold Winter',
    icon: '❄️',
    badge: 'Zone 3 - 5',
    desc: 'Warm summers, freezing snowy winters. Hugelkultur, windbreaks, cold-hardy stock.'
  },
  {
    name: 'Montane / Alpine',
    icon: '🏔️',
    badge: 'High Elevation',
    desc: 'Short growing season, high solar radiation. Microclimates, terraces, thermal mass.'
  },
  {
    name: 'Oceanic / Maritime',
    icon: '🌊',
    badge: 'Coastal Moderate',
    desc: 'Cool summers, mild winters, consistent moisture and overcast cloud cover.'
  }
];

export const EditClimateModal: React.FC<EditClimateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentClimate = ''
}) => {
  const [selectedClimate, setSelectedClimate] = useState<string>(currentClimate);
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedClimate(currentClimate || '');
      // Check if current matches a preset
      const match = CLIMATE_PRESETS.find(p => p.name.toLowerCase() === (currentClimate || '').toLowerCase());
      if (match) {
        setIsCustomMode(false);
        setCustomInput('');
      } else if (currentClimate && currentClimate.trim() !== '') {
        setIsCustomMode(true);
        setCustomInput(currentClimate);
      } else {
        setIsCustomMode(false);
        setCustomInput('');
      }
    }
  }, [isOpen, currentClimate]);

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

  const handleSelectPreset = (name: string) => {
    setSelectedClimate(name);
    setIsCustomMode(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalValue = isCustomMode ? customInput.trim() : selectedClimate.trim();
    onSave(finalValue);
    onClose();
  };

  const handleClear = () => {
    setSelectedClimate('');
    setCustomInput('');
    setIsCustomMode(false);
    onSave('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 dark:bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="climate-modal-title"
    >
      <div
        className="relative w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100 overflow-hidden transition-all max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Globe className="h-4 w-4" />
              </span>
              <h2 id="climate-modal-title" className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Choose Climate Zone
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Display your site's climate on your profile banner, or leave it blank.
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

        {/* Form Body */}
        <form id="climate-form" onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 scrollbar-thin">
          
          {/* Current Selection Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Selected:</span>
              {(isCustomMode ? customInput : selectedClimate) ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                  {isCustomMode ? customInput : selectedClimate}
                </span>
              ) : (
                <span className="text-xs text-stone-400 italic">None (Blank)</span>
              )}
            </div>

            {(isCustomMode ? customInput : selectedClimate) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold flex items-center space-x-1 cursor-pointer"
                title="Remove climate badge"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Leave Blank</span>
              </button>
            )}
          </div>

          {/* Permaculture Climate Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5">
              Select Bioregion / Climate:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLIMATE_PRESETS.map(preset => {
                const isSelected = !isCustomMode && selectedClimate === preset.name;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset.name)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40'
                        : 'border-stone-200 dark:border-stone-700/70 hover:border-amber-500/40 bg-white dark:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base select-none">{preset.icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400">
                          {preset.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Climate Input */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="custom-climate-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Or enter custom climate / hardiness zone:
              </label>
              {isCustomMode && (
                <span className="text-[10px] font-mono text-amber-500 font-bold">Custom Mode</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="custom-climate-input"
                type="text"
                value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value);
                  setIsCustomMode(true);
                }}
                placeholder="e.g. 'Zone 8b - Maritime Mediterranean' or 'Semi-Arid Drylands'"
                className="flex-1 bg-[#f6f6f6] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customInput.trim()) {
                    setIsCustomMode(true);
                    setSelectedClimate(customInput.trim());
                  }
                }}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Use Custom
              </button>
            </div>
          </div>

        </form>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Leave Blank (No Climate)
          </button>

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
              form="climate-form"
              className="py-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Save Climate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
