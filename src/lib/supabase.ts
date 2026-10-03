/**
 * Supabase Client & Architecture for permacultureapp.com
 * Includes full MVP fallback mode with local storage persistence
 * and exportable production SQL migration schema.
 */

import { BushTVChannel, ChatMessage, CommunityPost, MomentsTransaction, UserProfile } from '../types';

export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- Permaculture App (permacultureapp.com / App The Moment)
-- Supabase Schema & Realtime PostgreSQL Migration
-- ====================================================================

-- 1. Profiles Table (Regenerative creators & community members)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  permaculture_focus text default 'Permaculture Enthusiast',
  climate_zone text default 'Temperate',
  location text,
  tier text default 'free' check (tier in ('free', 'supporter', 'vip')),
  is_creator boolean default false,
  supporter_count integer default 0,
  follower_count integer default 0,
  moments_balance integer default 1250,
  moments_harvested integer default 0,
  badge text default 'Seedling',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bush TV Channels Table (Categorized fireside chat rooms)
create table if not exists public.bush_tv_channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  category text not null check (category in ('public', 'followers', 'supporter_5', 'vip_10')),
  tier_required text not null check (tier_required in ('public', 'followers', 'supporter', 'vip')),
  min_moments_unlock integer default 0,
  active_viewers_count integer default 0,
  topic_tags text[] default array[]::text[],
  host_id uuid references public.profiles(id) on delete set null,
  pinned_notice text,
  live_stream_url text,
  live_stream_type text default 'ambient_fire',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Messages Table (Real-time fireside chat with YouTube & Media embeds)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.bush_tv_channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  moments_tipped integer default 0,
  youtube_id text,
  image_url text,
  reactions jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Community Posts Table (Social feed with yield photos & field logs)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  media_urls text[] default array[]::text[],
  youtube_url text,
  moments_harvested integer default 0,
  likes_count integer default 0,
  comments_count integer default 0,
  location_tag text,
  permaculture_principle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Moments Transactions Table (Watering economy ledger)
create table if not exists public.moments_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('tip_sent', 'tip_received', 'topup_purchase', 'channel_unlock')),
  amount integer not null,
  counterparty_name text not null,
  reference_title text not null,
  status text default 'completed' check (status in ('completed', 'pending', 'failed')),
  test_mode boolean default false,
  tx_hash text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Channel Memberships & Unlocks Table
create table if not exists public.channel_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  channel_id uuid references public.bush_tv_channels(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, channel_id)
);

-- Indexes for performance
create index if not exists idx_messages_channel on public.messages (channel_id, created_at desc);
create index if not exists idx_posts_created on public.posts (created_at desc);
create index if not exists idx_transactions_user on public.moments_transactions (user_id, created_at desc);

-- Realtime Publication for Bush TV chat
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bush_tv_channels;
alter publication supabase_realtime add table public.moments_transactions;

-- Row Level Security (RLS) policies
alter table public.profiles enable row level security;
alter table public.bush_tv_channels enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.moments_transactions enable row level security;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public read channels" on public.bush_tv_channels for select using (true);
create policy "Public read messages" on public.messages for select using (true);
create policy "Public read posts" on public.posts for select using (true);
create policy "Users read own transactions" on public.moments_transactions for select using (auth.uid() = user_id);
`;

// Default Seed Profiles
export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'user_danou',
    username: 'danou_van_rensburg',
    full_name: 'Danou van Rensburg',
    email: 'danou@onshow.properties',
    is_admin: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    headline: 'Time Keeper & Decentralized Water Steward',
    bio: 'Time Keeper on Permaculture App. Cultivating water-conscious microclimates, broadacre swales, and community firesides.',
    permaculture_focus: 'Keyline Swales & Water Economy',
    climate_zone: 'Temperate / Mediterranean',
    location: 'Western Cape, South Africa',
    tier: 'vip',
    is_creator: true,
    supporter_count: 42,
    follower_count: 1250,
    moments_balance: 500,
    moments_harvested: 0,
    badge: 'TIME KEEPER',
    created_at: '2025-01-01T00:00:00Z',
    channels_hosted: ['ch_general_fireside', 'ch_soil_building'],
    goal: {
      title: 'Swale Contour Excavation & Nursery Shelter',
      description: 'Funding community water harvesting earthworks and indigenous seed stock.',
      current_water: 1200,
      target_water: 5000,
      unit_label: 'Drops'
    },
    recent_supporters: [
      {
        id: 'supp_d_1',
        supporter_name: 'Willow Sage',
        supporter_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        water_drops: 5,
        moments_amount: 500,
        message: 'Watering your broadacre swale prototype! Looking forward to the next Bush TV broadcast.',
        created_at: '2026-09-28T10:00:00Z',
        is_monthly: true
      }
    ],
    membership_tiers: [
      {
        id: 'tier_d_1',
        name: '⏳ Time Keeper Circle',
        water_drops_per_month: 10,
        price_usd: 9.90,
        badge: 'TIME KEEPER',
        description: 'Direct site design consultation and monthly live fireside Q&A.',
        perks: ['VIP Campfire in Bush TV', 'Direct site teardowns', 'Time Keeper badge', 'Priority water drop responses'],
        popular: true
      }
    ]
  },
  {
    id: 'user_current',
    username: 'willow_permaculture',
    full_name: 'Willow Sage',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
    headline: 'Guild designer, compost enthusiast, and seed guardian. Zone 8b edible forest.',
    bio: 'Guild designer, compost enthusiast, and seed guardian. Cultivating an edible 1/2 acre forest in Zone 8b. I document cold-hardy companion guilds, hugelkultur moisture trials, and closed-loop soil microbiology.',
    permaculture_focus: 'Fruit Guilds & Microclimate Water Swales',
    climate_zone: 'Temperate (Zone 8b)',
    location: 'Pacific Northwest, USA',
    tier: 'supporter',
    is_creator: true,
    supporter_count: 84,
    follower_count: 512,
    moments_balance: 1250,
    moments_harvested: 3420,
    badge: 'Firekeeper & Guild Builder',
    created_at: '2025-01-15T08:00:00Z',
    channels_hosted: ['ch_soil_building', 'ch_food_forests'],
    social_links: {
      website: 'https://permacultureapp.com/willow_permaculture',
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com'
    },
    goal: {
      title: 'Solar Drip Irrigation & Seed Bank Expansion',
      description: 'Help fund solar moisture sensors and a zero-loss heritage seed nursery cabinet for community seed swaps.',
      current_water: 3420,
      target_water: 5000,
      unit_label: 'Drops'
    },
    recent_supporters: [
      {
        id: 'supp_w_1',
        supporter_name: 'Geoff & Nadia Calder',
        supporter_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        water_drops: 5,
        moments_amount: 500,
        message: 'Your comfrey root propagation method worked wonders on our outer swales! 🌿',
        created_at: '2026-09-28T14:20:00Z',
        is_monthly: true
      },
      {
        id: 'supp_w_2',
        supporter_name: 'Dr. Elena Rostova',
        supporter_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        water_drops: 3,
        moments_amount: 300,
        message: 'Sending water for the heritage apple guild! Great fungal ratios in your soil logs.',
        created_at: '2026-09-27T10:15:00Z'
      },
      {
        id: 'supp_w_3',
        supporter_name: 'Kai Fernandez',
        supporter_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        water_drops: 2,
        moments_amount: 200,
        message: 'Happy to water your garden! Keep the fires burning in Bush TV.',
        created_at: '2026-09-25T16:40:00Z'
      }
    ],
    membership_tiers: [
      {
        id: 'tier_w_1',
        name: '🌱 Seedling Guild',
        water_drops_per_month: 3,
        price_usd: 3.00,
        badge: 'Seedling Supporter',
        description: 'Support ongoing guild research and receive monthly seed propagation guides.',
        perks: ['Exclusive field logs & unlisted yield charts', 'Access to #food-forests Bush TV circle', 'Supporter badge by your name']
      },
      {
        id: 'tier_w_2',
        name: '🌿 Canopy Steward',
        water_drops_per_month: 10,
        price_usd: 9.90,
        badge: 'Canopy Steward',
        description: 'Direct site design consultation and printable CAD planting templates.',
        perks: ['All Seedling perks', 'Priority Q&A in Bush TV live firesides', 'Downloadable CAD site blueprints', '10% discount on rare seed varieties'],
        popular: true
      }
    ],
    blueprints: [
      {
        id: 'bp_1',
        title: '7-Layer Temperate Guild Master Schematic',
        category: 'Food Forest CAD',
        image_url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
        description: 'Complete companion spacing for Honeycrisp canopy, Goumi berry, Bocking 14 comfrey, and garlic chives.',
        water_cost: 100
      },
      {
        id: 'bp_2',
        title: 'Hugelkultur Swale Hydrology Overlay',
        category: 'Hydrology & Earthworks',
        image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
        description: 'Sub-surface moisture holding calculation and wood decaying inoculation steps.',
        water_cost: 150
      }
    ]
  },
  {
    id: 'user_geoff',
    username: 'geoff_earthworks',
    full_name: 'Geoff & Nadia Calder',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    headline: 'Master earthmover, swale architect, and broadacre regenerative farm consultant.',
    bio: 'Master earthmover, swale architect, and regenerative farm consultant. Greening the drylands for 25+ years with keyline design, gravity dam cascades, and salt-bush biological desalinization.',
    permaculture_focus: 'Keyline Design & Broadacre Hydrology',
    climate_zone: 'Subtropical / Arid Drylands',
    location: 'New South Wales, Australia',
    tier: 'vip',
    is_creator: true,
    supporter_count: 620,
    follower_count: 4890,
    moments_balance: 24500,
    moments_harvested: 89400,
    badge: 'Master Permaculturist',
    created_at: '2024-03-10T10:00:00Z',
    channels_hosted: ['ch_general_fireside', 'ch_permaculture_mentorship'],
    social_links: {
      website: 'https://permacultureapp.com/geoff_earthworks',
      youtube: 'https://youtube.com'
    },
    goal: {
      title: 'Community Keyline Laser Level & Swale Demo Day',
      description: 'Acquiring an open-source laser contour surveying rig for hands-on student earthwork workshops.',
      current_water: 18450,
      target_water: 25000,
      unit_label: 'Drops'
    },
    recent_supporters: [
      {
        id: 'supp_g_1',
        supporter_name: 'Rowan Marsh',
        supporter_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        water_drops: 10,
        moments_amount: 1000,
        message: 'Watered your laser level goal! The dam overflow spillway tutorial saved our pasture from heavy rains.',
        created_at: '2026-09-29T09:30:00Z',
        is_monthly: true
      },
      {
        id: 'supp_g_2',
        supporter_name: 'Willow Sage',
        supporter_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        water_drops: 5,
        moments_amount: 500,
        message: 'Thanks for the fireside mentorship session Geoff! Water for your tireless work.',
        created_at: '2026-09-28T18:00:00Z'
      },
      {
        id: 'supp_g_3',
        supporter_name: 'Astrid Lind',
        supporter_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        water_drops: 3,
        moments_amount: 300,
        message: 'Greening the drylands inspires our cold climate earthworks too.',
        created_at: '2026-09-27T11:22:00Z'
      }
    ],
    membership_tiers: [
      {
        id: 'tier_g_1',
        name: '🪵 Earthwork Supporter',
        water_drops_per_month: 5,
        price_usd: 5.00,
        badge: 'Swale Builder',
        description: 'Access broadacre site reviews and technical contour calculation sheets.',
        perks: ['Direct access to #permaculture-mentorship Bush TV room', 'Contour calculator spreadsheets', 'Early access to YouTube video breakdowns']
      },
      {
        id: 'tier_g_2',
        name: '🌊 Hydrology VIP Circle',
        water_drops_per_month: 25,
        price_usd: 25.00,
        badge: 'Water Master',
        description: 'Monthly live group site review via Bush TV video stream + 1-on-1 design feedback.',
        perks: ['All Earthwork perks', 'Private 1-on-1 site feedback via Bush TV VIP stream', 'Full CAD engineering archives', 'VIP campfire voice privileges'],
        popular: true
      }
    ],
    blueprints: [
      {
        id: 'bp_g1',
        title: 'Keyline Broadacre Water Catchment Blueprints',
        category: 'Hydrology',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        description: 'Ridge-to-valley flow vectors, keypoint spillway elevations, and storage sizing.',
        water_cost: 250
      }
    ]
  },
  {
    id: 'user_elena',
    username: 'elena_biochar',
    full_name: 'Dr. Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    headline: 'Soil microbiologist & Pyrolysis biochar researcher. Turning forest waste into terra preta.',
    bio: 'Soil microbiologist & Pyrolysis biochar researcher. Turning forest waste into terra preta carbon sinks with fungal inoculants and compost tea vortex brewers.',
    permaculture_focus: 'Mycelial Inoculation & Biochar Stoves',
    climate_zone: 'Continental Alpine',
    location: 'Tyrol, Austria',
    tier: 'supporter',
    is_creator: true,
    supporter_count: 310,
    follower_count: 2450,
    moments_balance: 15400,
    moments_harvested: 38200,
    badge: 'Soil Doctor',
    created_at: '2024-06-20T14:30:00Z',
    channels_hosted: ['ch_biochar_mastery'],
    social_links: {
      website: 'https://permacultureapp.com/elena_biochar'
    },
    goal: {
      title: 'Microbial Microscope Video Camera Attachment',
      description: 'Stream live 1000x soil microbe samples directly into Bush TV chat so stewards can test their fungal-to-bacterial ratios.',
      current_water: 7800,
      target_water: 10000,
      unit_label: 'Drops'
    },
    recent_supporters: [
      {
        id: 'supp_e_1',
        supporter_name: 'Kai Fernandez',
        supporter_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        water_drops: 5,
        moments_amount: 500,
        message: 'Water for your incredible biochar kiln thermal exchange experiments!',
        created_at: '2026-09-28T21:10:00Z'
      }
    ],
    membership_tiers: [
      {
        id: 'tier_e_1',
        name: '🍄 Mycelial Inner Ring',
        water_drops_per_month: 5,
        price_usd: 5.00,
        badge: 'Mycelial Steward',
        description: 'Microbiology assay guides and recipe cards for active aerated compost teas.',
        perks: ['Live microscope stream access in Bush TV', 'Compost tea brewing ratio calculators', 'Monthly biochar burn test results']
      }
    ]
  },
  {
    id: 'user_kai',
    username: 'kai_offgrid',
    full_name: 'Kai Fernandez',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    headline: 'DC solar microgrids, ram pumps, and rocket mass heaters. Autonomous homestead engineering.',
    bio: 'DC solar microgrids, ram pumps, and rocket mass heaters. Building autonomous homestead systems that run purely on sunlight, gravity, and thermal mass.',
    permaculture_focus: 'Off-Grid Tech & Passive Solar Thermal',
    climate_zone: 'Mediterranean (Zone 9a)',
    location: 'Andalucía, Spain',
    tier: 'supporter',
    is_creator: true,
    supporter_count: 415,
    follower_count: 3120,
    moments_balance: 9800,
    moments_harvested: 27500,
    badge: 'Off-Grid Engineer',
    created_at: '2024-08-11T12:00:00Z',
    channels_hosted: ['ch_offgrid_tech'],
    social_links: {
      website: 'https://permacultureapp.com/kai_offgrid'
    },
    goal: {
      title: 'Open-Source Ram Pump Fabrication Guide',
      description: 'Building transparent 3D-printed check valves to demonstrate electricity-free water lifting.',
      current_water: 4200,
      target_water: 6000,
      unit_label: 'Drops'
    },
    recent_supporters: [
      {
        id: 'supp_k_1',
        supporter_name: 'Willow Sage',
        supporter_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        water_drops: 4,
        moments_amount: 400,
        message: 'Water for your solar ram pump prototype! It is lifting water 40m without power.',
        created_at: '2026-09-28T12:00:00Z'
      }
    ],
    membership_tiers: [
      {
        id: 'tier_k_1',
        name: '⚡ Autonomous Homesteader',
        water_drops_per_month: 6,
        price_usd: 6.00,
        badge: 'Off-Grid Steward',
        description: 'Wiring schematics, battery sizing calculators, and rocket mass heater core plans.',
        perks: ['Open-source CAD plumbing blueprints', 'Direct Q&A in #offgrid-tech Bush TV room', 'Thermal mass dimension formulas']
      }
    ]
  }
];

// Initial Bush TV Channels
export const SEED_CHANNELS: BushTVChannel[] = [
  {
    id: 'ch_general_fireside',
    slug: 'general-fireside',
    name: '#general-fireside',
    description: 'The main campfire for all permaculturists. Share your daily harvest, observations, and fireside musings.',
    category: 'public',
    tier_required: 'public',
    min_moments_unlock: 0,
    is_locked: false,
    active_viewers_count: 42,
    topic_tags: ['General', 'Community', 'Daily Harvest', 'Fireside'],
    host: {
      id: 'user_geoff',
      username: 'geoff_earthworks',
      full_name: 'Geoff & Nadia Calder',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badge: 'Master Permaculturist'
    },
    pinned_notice: '🪵 Welcome to Bush TV! Please respect everyone around the fire. Plant the rain with Rain Drops (💧) and Water Buckets (🪣) to support creators.',
    live_stream_url: 'https://www.youtube.com/watch?v=F3z_mZVo5rk', // Ambient relaxing permaculture / campfire
    live_stream_type: 'ambient_fire'
  },
  {
    id: 'ch_soil_building',
    slug: 'soil-building',
    name: '#soil-building',
    description: 'Living soil biology, thermo-compost recipes, worm casting teas, Korean Natural Farming (KNF), and hugelkultur.',
    category: 'public',
    tier_required: 'public',
    min_moments_unlock: 0,
    is_locked: false,
    active_viewers_count: 28,
    topic_tags: ['Soil Food Web', 'Compost', 'Mycelium', 'Hugelkultur'],
    host: {
      id: 'user_elena',
      username: 'elena_biochar',
      full_name: 'Dr. Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      badge: 'Soil Doctor'
    },
    pinned_notice: '🔬 Weekly Soil Challenge: Share a photo of your fungal dominant woodchip mulch breakdown!',
    live_stream_type: 'ambient_fire'
  },
  {
    id: 'ch_food_forests',
    slug: 'food-forests',
    name: '#food-forests',
    description: 'Multi-strata canopy design, pioneer nitrogen fixers, dynamic accumulators, and perennial food guild blueprints.',
    category: 'public',
    tier_required: 'public',
    min_moments_unlock: 0,
    is_locked: false,
    active_viewers_count: 35,
    topic_tags: ['7 Layers', 'Guilds', 'Perennials', 'Fruit Trees'],
    host: {
      id: 'user_current',
      username: 'willow_permaculture',
      full_name: 'Willow Sage',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      badge: 'Guild Builder'
    },
    pinned_notice: '🍎 Currently discussing: Sub-tropical to temperate cold-hardy avocado rootstocks and comfrey rings.',
    live_stream_type: 'ambient_fire'
  },
  {
    id: 'ch_seed_exchange',
    slug: 'seed-exchange',
    name: '#seed-exchange',
    description: 'Heirloom seed saving techniques, landrace genetics, and global exchange protocol for followers of the community.',
    category: 'followers',
    tier_required: 'followers',
    min_moments_unlock: 50,
    is_locked: false,
    active_viewers_count: 19,
    topic_tags: ['Seeds', 'Heirloom', 'Landrace', 'Preservation'],
    host: {
      id: 'user_current',
      username: 'willow_permaculture',
      full_name: 'Willow Sage',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      badge: 'Seed Guardian'
    },
    pinned_notice: '🌱 Follow Willow Sage to participate in spring seed swaps.'
  },
  {
    id: 'ch_offgrid_tech',
    slug: 'off-grid-tech',
    name: '#off-grid-tech',
    description: 'Hydraulic ram pumps, DIY wood gasifiers, solar micro-inverters, biogas digesters, and rocket stove mass heaters.',
    category: 'supporter_5',
    tier_required: 'supporter',
    min_moments_unlock: 200,
    is_locked: false,
    active_viewers_count: 16,
    topic_tags: ['Ram Pumps', 'Rocket Stoves', 'Solar', 'Biogas'],
    host: {
      id: 'user_kai',
      username: 'kai_offgrid',
      full_name: 'Kai Fernandez',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      badge: 'Off-Grid Engineer'
    },
    pinned_notice: '⚡ $5/mo Supporter Tier: Full CAD schematics and wiring diagrams shared inside this channel.'
  },
  {
    id: 'ch_biochar_mastery',
    slug: 'biochar-mastery',
    name: '#biochar-mastery',
    description: 'Advanced pyrolysis, Kontiki kilns, compost charging, nutrient buffering, and terra preta field trials.',
    category: 'supporter_5',
    tier_required: 'supporter',
    min_moments_unlock: 200,
    is_locked: false,
    active_viewers_count: 14,
    topic_tags: ['Biochar', 'Pyrolysis', 'Kontiki', 'Carbon Sequestration'],
    host: {
      id: 'user_elena',
      username: 'elena_biochar',
      full_name: 'Dr. Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      badge: 'Soil Doctor'
    },
    pinned_notice: '🔥 Exclusive kiln burn videos and lab mineral assay downloads.'
  },
  {
    id: 'ch_permaculture_mentorship',
    slug: 'permaculture-mentorship',
    name: '#permaculture-mentorship',
    description: 'Direct 1-on-1 and small group live masterclasses with master designers. Review your site contour maps and swale layouts.',
    category: 'vip_10',
    tier_required: 'vip',
    min_moments_unlock: 500,
    is_locked: true,
    active_viewers_count: 9,
    topic_tags: ['VIP Mentorship', 'Contour Mapping', 'Site Design', 'Masterclass'],
    host: {
      id: 'user_geoff',
      username: 'geoff_earthworks',
      full_name: 'Geoff & Nadia Calder',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badge: 'Master Permaculturist'
    },
    pinned_notice: '⭐ VIP Tier ($10/mo or 500 Rain Drops 💧 [1 Water Bucket 🪣] unlock): Bi-weekly live video map teardowns and private Q&A.'
  },
  {
    id: 'ch_regenerative_farm_scale',
    slug: 'regenerative-farm-scale',
    name: '#regenerative-farm-scale',
    description: 'Broadacre keyline cultivation, multi-species holistic grazing, farm economics, and regenerative enterprise scaling.',
    category: 'vip_10',
    tier_required: 'vip',
    min_moments_unlock: 500,
    is_locked: true,
    active_viewers_count: 11,
    topic_tags: ['Broadacre', 'Holistic Grazing', 'Keyline', 'Enterprise'],
    host: {
      id: 'user_geoff',
      username: 'geoff_earthworks',
      full_name: 'Geoff & Nadia Calder',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badge: 'Master Permaculturist'
    },
    pinned_notice: '⭐ VIP Tier: Real financial spreadsheets and enterprise budgeting for 50+ acre regenerative properties.'
  }
];

// Initial Chat Messages (with YouTube embeds and tipping)
export const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  ch_general_fireside: [
    {
      id: 'msg_1',
      channel_id: 'ch_general_fireside',
      user_id: 'user_geoff',
      user: {
        id: 'user_geoff',
        username: 'geoff_earthworks',
        full_name: 'Geoff & Nadia Calder',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        badge: 'Master Permaculturist',
        tier: 'vip'
      },
      content: 'Welcome to tonight’s Bush TV fireside! Remember rule #1 of permaculture hydrology: You don’t fight gravity, you guide it. Catch water at the highest possible point and let it soak slowly into your ridge lines.',
      created_at: '2026-09-29T10:15:00Z',
      moments_tipped: 310,
      youtube_id: '8gpyoxbDY-E', // Permaculture water harvesting demo
      reactions: { '🔥': 14, '💧': 22, '🌱': 18 }
    },
    {
      id: 'msg_2',
      channel_id: 'ch_general_fireside',
      user_id: 'user_elena',
      user: {
        id: 'user_elena',
        username: 'elena_biochar',
        full_name: 'Dr. Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        badge: 'Soil Doctor',
        tier: 'supporter'
      },
      content: 'Just ran the lab assay on the compost-charged biochar we inoculated with forest humus. The microscopic fungal hyphae density is up 340%! Here is the micrograph preview:',
      created_at: '2026-09-29T10:28:00Z',
      moments_tipped: 180,
      image_url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
      reactions: { '🔬': 12, '💧': 15, '🍄': 26 }
    },
    {
      id: 'msg_3',
      channel_id: 'ch_general_fireside',
      user_id: 'user_kai',
      user: {
        id: 'user_kai',
        username: 'kai_offgrid',
        full_name: 'Kai Fernandez',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        badge: 'Off-Grid Engineer',
        tier: 'supporter'
      },
      content: 'For anyone dealing with summer heatwaves: our passive geothermal earth-tube intake dropped the greenhouse temperature by 7°C without a single watt of grid power! 🌬️',
      created_at: '2026-09-29T10:45:00Z',
      moments_tipped: 90,
      reactions: { '🔥': 8, '💧': 19 }
    },
    {
      id: 'msg_4',
      channel_id: 'ch_general_fireside',
      user_id: 'user_current',
      user: {
        id: 'user_current',
        username: 'willow_permaculture',
        full_name: 'Willow Sage',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        badge: 'Guild Builder',
        tier: 'supporter'
      },
      content: 'Our autumn Asian pear guild with Russian comfrey (Bocking 14), horseradish, and garlic chives yielded over 65 lbs of fruit with zero chemical sprays. Permaculture diversity really does build self-regulating immunity!',
      created_at: '2026-09-29T11:05:00Z',
      moments_tipped: 140,
      image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
      reactions: { '🍐': 21, '💧': 17, '🌱': 15 }
    }
  ],
  ch_soil_building: [
    {
      id: 'msg_soil_1',
      channel_id: 'ch_soil_building',
      user_id: 'user_elena',
      user: {
        id: 'user_elena',
        username: 'elena_biochar',
        full_name: 'Dr. Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        badge: 'Soil Doctor',
        tier: 'supporter'
      },
      content: 'Golden rule for aerobic compost: Keep your carbon to nitrogen ratio at roughly 30:1. If it smells sour or smells like ammonia, it went anaerobic. Turn it immediately and add wood shavings or dry brown leaves!',
      created_at: '2026-09-29T09:30:00Z',
      moments_tipped: 210,
      youtube_id: 'Q-gO7U6wW-w',
      reactions: { '💧': 25, '🌱': 19 }
    }
  ],
  ch_food_forests: [
    {
      id: 'msg_ff_1',
      channel_id: 'ch_food_forests',
      user_id: 'user_current',
      user: {
        id: 'user_current',
        username: 'willow_permaculture',
        full_name: 'Willow Sage',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        badge: 'Guild Builder',
        tier: 'supporter'
      },
      content: 'Here is the 7-layer food forest diagram we used for our 0.5 acre demonstration site. Canopy: Sweet Chestnut. Sub-canopy: Apples. Shrub: Currants & Jostaberries. Herbaceous: Comfrey. Groundcover: Alpine Strawberry. Root: Horseradish. Vine: Hardy Kiwi.',
      created_at: '2026-09-29T08:50:00Z',
      moments_tipped: 350,
      image_url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
      reactions: { '🌳': 30, '💧': 45 }
    }
  ],
  ch_offgrid_tech: [
    {
      id: 'msg_og_1',
      channel_id: 'ch_offgrid_tech',
      user_id: 'user_kai',
      user: {
        id: 'user_kai',
        username: 'kai_offgrid',
        full_name: 'Kai Fernandez',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        badge: 'Off-Grid Engineer',
        tier: 'supporter'
      },
      content: 'Ram pump operating smoothly at 4:1 pressure ratio! Pumping 1,200 liters/day 35 meters uphill using only stream momentum. No gas, no grid, zero moving electrical parts.',
      created_at: '2026-09-29T07:15:00Z',
      moments_tipped: 260,
      youtube_id: 'b6vWzP0hF5Q',
      reactions: { '⚡': 22, '💧': 38 }
    }
  ]
};

// Initial Community Posts
export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    author_id: 'user_geoff',
    author: SEED_PROFILES[1],
    title: 'Earthworks & Swale System on Keyline Ridges: Year 3 Transformation',
    content: 'Three years ago, this degraded cattle paddock had a compacted hardpan and lost 85% of rainfall to erosive runoff. By cutting level sill spillways and deep swales along contour lines, we turned this hillside into a sponge. Today, the natural groundwater aquifer feeds perennial springs 400m below!',
    tags: ['Water Harvesting', 'Earthworks', 'Swales', 'Keyline'],
    media_urls: [
      'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=F3z_mZVo5rk',
    created_at: '2026-09-29T06:30:00Z',
    moments_harvested: 1840,
    likes_count: 142,
    comments_count: 36,
    location_tag: 'Zaytuna Farm Ridge, NSW',
    permaculture_principle: 'Principle 2: Catch and Store Energy'
  },
  {
    id: 'post_2',
    author_id: 'user_danou',
    author: SEED_PROFILES[0],
    title: 'Autumn Guild Harvest: 140lbs of Winter Squash, Comfrey Chop-and-Drop, and Wild Foraged Mushrooms',
    content: 'Closing out the growing cycle with our favorite routine: cutting comfrey leaves to mulch the fruit tree rootzones before the frost hits. Dynamic accumulators like comfrey pull deep potassium, calcium, and trace minerals straight into the topsoil. Watered the entire bed with worm casting tea.',
    tags: ['Guilds', 'Composting', 'Food Forest', 'Soil Building'],
    media_urls: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80'
    ],
    created_at: '2026-09-28T18:15:00Z',
    moments_harvested: 920,
    likes_count: 88,
    comments_count: 19,
    location_tag: 'Cascadia Demonstration Forest',
    permaculture_principle: 'Principle 3: Obtain a Yield'
  },
  {
    id: 'post_3',
    author_id: 'user_elena',
    author: SEED_PROFILES[2],
    title: 'The Biochar Crucible: Why Quenching at 650°C Creates the Perfect Micro-Porosity',
    content: 'When quenching high-temp biochar, adding stinging nettle tea and fish hydrolysate charges millions of micro-caves with living beneficial bacteria. Never apply raw uncharged biochar directly to your soil, or it will temporarily rob available nitrogen. Charge it first in an active compost pile for 30 days!',
    tags: ['Biochar', 'Soil Building', 'Composting', 'Microbiology'],
    media_urls: [
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1000&q=80'
    ],
    created_at: '2026-09-27T12:00:00Z',
    moments_harvested: 1350,
    likes_count: 114,
    comments_count: 24,
    location_tag: 'Alpine Soil Bio-Lab',
    permaculture_principle: 'Principle 6: Produce No Waste'
  },
  {
    id: 'post_4',
    author_id: 'user_kai',
    author: SEED_PROFILES[3],
    title: 'Zero-Electricity Ram Pump Field Test: Lifting 1,200L Daily from our Creek',
    content: 'Built from standard galvanized fittings and brass swing check valves. Harnessing the kinetic water hammer effect to lift clean spring water up a 40-meter vertical rise to gravity-feed our drip irrigation lines. Off-grid independence feels incredible.',
    tags: ['Off-Grid', 'Water Harvesting', 'Appropriate Technology'],
    media_urls: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80'
    ],
    created_at: '2026-09-26T16:45:00Z',
    moments_harvested: 870,
    likes_count: 95,
    comments_count: 18,
    location_tag: 'Sierra Foothills Micro-Station',
    permaculture_principle: 'Principle 5: Use & Value Renewable Resources & Services'
  }
];

// Initial Transactions
export const SEED_TRANSACTIONS: MomentsTransaction[] = [
  {
    id: 'tx_seed_1',
    user_id: 'user_current',
    type: 'topup_purchase',
    amount: 1000,
    counterparty_name: 'Garden Pack (Stripe Test Mode)',
    reference_title: 'Rain Drops Top-Up: 1,000 Drops / 2 Water Buckets 🪣 ($10.00)',
    created_at: '2026-09-29T08:00:00Z',
    status: 'completed',
    test_mode: true,
    tx_hash: 'tx_0x9f4a12b884c7'
  },
  {
    id: 'tx_seed_2',
    user_id: 'user_current',
    type: 'tip_sent',
    amount: -40,
    counterparty_name: 'Dr. Elena Rostova',
    reference_title: 'Plant the Rain 🌧️: 40 Rain Drops 💧 tip on Biochar guide',
    created_at: '2026-09-29T10:32:00Z',
    status: 'completed',
    test_mode: false,
    tx_hash: 'tx_0x7b2c99a031e4',
    fee_amount: 0.02,
    net_usd: 0.38
  },
  {
    id: 'tx_seed_3',
    user_id: 'user_current',
    type: 'tip_received',
    amount: 100,
    counterparty_name: 'Kai Fernandez',
    reference_title: 'Plant the Rain 🌧️: 100 Rain Drops 💧 tip on pear guild post',
    created_at: '2026-09-29T11:10:00Z',
    status: 'completed',
    test_mode: false,
    tx_hash: 'tx_0x4c8e11f92a01',
    fee_amount: 0.05,
    net_usd: 0.95
  },
  {
    id: 'tx_seed_4',
    user_id: 'user_current',
    type: 'channel_unlock',
    amount: -200,
    counterparty_name: '#off-grid-tech',
    reference_title: 'Supporter Tier Channel Access (200 Rain Drops)',
    created_at: '2026-09-28T14:20:00Z',
    status: 'completed',
    test_mode: false,
    tx_hash: 'tx_0x3d1a88b52c90'
  }
];

// Top Up Packages: 100 Rain Drops 💧 = $1.00 USD | 1 Water Bucket 🪣 = 500 Rain Drops ($5.00 USD)
export const TOP_UP_PACKAGES = [
  {
    id: 'pack_sprout',
    name: 'Sprout Pack',
    moments: 500,
    raindrops: 500,
    buckets: 1,
    price_usd: 5.00,
    bonus: '1 Water Bucket 🪣',
    description: 'Perfect for small tips (20 Rain Drops min) and supporting creator livestreams.',
    iconName: 'Droplets',
    popular: false
  },
  {
    id: 'pack_garden',
    name: 'Garden Pack',
    moments: 1000,
    raindrops: 1000,
    buckets: 2,
    price_usd: 10.00,
    bonus: '2 Water Buckets 🪣 (Popular)',
    description: 'Most popular! Unlocks supporter firesides and sustains regenerative guides.',
    iconName: 'Sparkles',
    popular: true
  },
  {
    id: 'pack_orchard',
    name: 'Orchard Pack',
    moments: 2500,
    raindrops: 2500,
    buckets: 5,
    price_usd: 25.00,
    bonus: '5 Water Buckets 🪣',
    description: 'Deep support for broadacre blueprints, swale designs, and continuous fireside tipping.',
    iconName: 'Flame',
    popular: false
  },
  {
    id: 'pack_farm',
    name: 'Sovereign Farm',
    moments: 5000,
    raindrops: 5000,
    buckets: 10,
    price_usd: 50.00,
    bonus: '10 Water Buckets 🪣 (Founder Tier)',
    description: 'For active community stewards, funding earthworks, and broadacre demonstrations.',
    iconName: 'Compass',
    popular: false
  }
];
