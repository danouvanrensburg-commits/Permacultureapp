import React, { useState } from 'react';
import {
  Compass,
  Sprout,
  Droplets,
  Flame,
  Layers,
  Leaf,
  Users,
  Search,
  BookOpen,
  ArrowRight,
  Sun,
  CloudRain,
  Trees,
  CheckCircle2
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

interface ExploreHubProps {
  navigate: (route: string) => void;
}

export const ExploreHub: React.FC<ExploreHubProps> = ({ navigate }) => {
  const { allUsers, openTopUpModal } = usePermaculture();
  const [activeTab, setActiveTab] = useState<'principles' | 'guilds' | 'climates'>('principles');
  const [selectedGuild, setSelectedGuild] = useState<number>(0);

  const permaculturePrinciples = [
    {
      num: 1,
      title: 'Observe and Interact',
      description: 'By taking time to engage with nature we can design solutions that suit our particular situation.',
      icon: '👁️',
      action: 'Watch sun angles, wind corridors, and water runoff patterns over a full 4 seasons.'
    },
    {
      num: 2,
      title: 'Catch and Store Energy',
      description: 'By developing systems that collect resources at peak abundance, we can use them in times of need.',
      icon: '☀️',
      action: 'Dig swales on contour, build passive solar thermal greenhouses, and collect rainwater.'
    },
    {
      num: 3,
      title: 'Obtain a Yield',
      description: 'You cannot work on an empty stomach. Ensure that you are truly getting immediate returns from the energy invested.',
      icon: '🍎',
      action: 'Plant quick annual greens (radish, kale) between slow-growing perennial fruit trees.'
    },
    {
      num: 4,
      title: 'Apply Self-Regulation & Accept Feedback',
      description: 'We need to discourage inappropriate activity to ensure that systems can continue to function well.',
      icon: '🔄',
      action: 'If pests attack, identify the underlying soil deficiency rather than applying poisons.'
    },
    {
      num: 5,
      title: 'Use & Value Renewable Resources & Services',
      description: 'Make the best use of nature’s abundance to reduce our consumptive behavior and dependence on non-renewables.',
      icon: '💧',
      action: 'Harness hydraulic ram pumps, compost heater coils, and nitrogen-fixing trees.'
    },
    {
      num: 6,
      title: 'Produce No Waste',
      description: 'By valuing and making use of all the resources that are available to us, nothing goes to waste.',
      icon: '♻️',
      action: 'Feed pruned branches to Kontiki biochar kilns or create fungal hugelkultur beds.'
    }
  ];

  const guildsDatabase = [
    {
      name: 'The Classic Apple Tree Guild',
      canopy: 'Heritage Apple (e.g. Honeycrisp or Bramley)',
      nitrogenFixer: 'Goumi Berry (Elaeagnus multiflora)',
      dynamicAccumulator: 'Russian Comfrey (Bocking 14)',
      insectary: 'Fennel, Dill, & Sweet Alyssum',
      grassBarrier: 'Daffodils & Garlic Chives',
      mulchProducer: 'Rhubarb & Horseradish',
      benefit: 'Matures into a zero-spray, self-fertilizing mini orchard ecosystem.'
    },
    {
      name: 'Subtropical Citrus & Avocado Guild',
      canopy: 'Hass Avocado / Meyer Lemon',
      nitrogenFixer: 'Pigeon Pea (Cajanus cajan)',
      dynamicAccumulator: 'Vetiver Grass & Yarrow',
      insectary: 'Coriander & Marigolds',
      grassBarrier: 'Lemongrass rim border',
      mulchProducer: 'Banana circle mulch pit',
      benefit: 'Shields sensitive feeder roots while recycling heavy potassium and mulch.'
    },
    {
      name: 'Walnut & Hazelnut Agroforestry Guild',
      canopy: 'Persian Walnut (Juglone tolerant)',
      nitrogenFixer: 'Sea Buckthorn (Hippophae rhamnoides)',
      dynamicAccumulator: 'Dandelion & Stinging Nettle',
      insectary: 'Elderberry & Wild Rose',
      grassBarrier: 'Jerusalem Artichoke (Sunchoke)',
      mulchProducer: 'Black Currant & Jostaberry',
      benefit: 'High-protein perennial nut and berry guild resistant to deer browsing.'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5" />
            <span>Regenerative Knowledge Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Permaculture Principles & Guilds
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400">
            Open blueprints grounded in Bill Mollison and David Holmgren's regenerative design ethics: Earth Care, People Care, Fair Share.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setActiveTab('principles')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'principles'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-950/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            12 Core Principles
          </button>
          <button
            onClick={() => setActiveTab('guilds')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'guilds'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-950/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Companion Plant Guilds
          </button>
          <button
            onClick={() => setActiveTab('climates')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'climates'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-950/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Featured Creators & Mentors
          </button>
        </div>

        {/* TAB 1: PRINCIPLES */}
        {activeTab === 'principles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {permaculturePrinciples.map(p => (
              <div
                key={p.num}
                className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-950 text-amber-600 dark:text-amber-400 border border-stone-200 dark:border-stone-800">
                      Principle {p.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{p.title}</h3>
                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Practical Action:</span>
                  <span>{p.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: COMPANION PLANT GUILDS */}
        {activeTab === 'guilds' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guild Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
                Select Food Forest Guild
              </h3>
              {guildsDatabase.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGuild(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedGuild === idx
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 shadow-md'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
                  }`}
                >
                  <p className="font-bold text-sm">{g.name}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{g.canopy}</p>
                </button>
              ))}
            </div>

            {/* Guild Interactive Blueprint */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                    {guildsDatabase[selectedGuild].name}
                  </h2>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {guildsDatabase[selectedGuild].benefit}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Trees className="h-5 w-5" />
                </div>
              </div>

              {/* Multi-Strata Guild Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold block mb-1">1. Canopy (Central Yield)</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].canopy}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">2. Nitrogen Fixer (Fertilizer)</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].nitrogenFixer}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold block mb-1">3. Dynamic Accumulator (Minerals)</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].dynamicAccumulator}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold block mb-1">4. Insectary (Pollinators & Predators)</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].insectary}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-yellow-600 dark:text-yellow-400 font-bold block mb-1">5. Grass Barrier (Prevents Weed Invasions)</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].grassBarrier}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="font-mono text-stone-600 dark:text-stone-400 font-bold block mb-1">6. Mulch / Biomass Producer</span>
                  <p className="text-stone-800 dark:text-stone-200">{guildsDatabase[selectedGuild].mulchProducer}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate('bush-tv')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <span>Discuss this Guild in #food-forests</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURED CREATORS & MENTORS */}
        {activeTab === 'climates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUsers.map(user => (
              <div
                key={user.id}
                className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3.5 mb-4">
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.full_name}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-amber-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base">{user.full_name}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">@{user.username}</p>
                      {user.badge && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300">
                          {user.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-3">{user.bio}</p>
                  
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                    <div>Zone: <span className="text-stone-800 dark:text-stone-200 font-medium">{user.climate_zone}</span></div>
                    <div>Focus: <span className="text-emerald-700 dark:text-emerald-400 font-medium">{user.permaculture_focus}</span></div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="text-xs text-cyan-700 dark:text-cyan-400 font-mono font-bold">
                    <span className="flex items-center space-x-1">
                      <span>💧</span>
                      <span>{user.moments_harvested.toLocaleString()} Drops</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 font-normal block">
                      ({((user.moments_harvested || 0) / 500).toFixed(1)} 🪣)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => navigate(`profile/${user.username}`)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1"
                    >
                      <span>🌧️</span>
                      <span>Plant the Rain</span>
                    </button>
                    <button
                      onClick={() => navigate(`profile/${user.username}`)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
