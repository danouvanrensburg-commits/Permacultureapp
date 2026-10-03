import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BushTVChannel,
  ChatMessage,
  CommunityPost,
  MomentsTransaction,
  UserProfile,
  CreatorGoal,
  CreatorMembershipTier,
  ModerationReport,
  PostComment,
  PermacultureNotification
} from '../types';
import {
  SEED_CHANNELS,
  SEED_MESSAGES,
  SEED_POSTS,
  SEED_PROFILES,
  SEED_TRANSACTIONS,
  TOP_UP_PACKAGES
} from '../lib/supabase';

interface TipFeedback {
  id: string;
  amount: number;
  recipientName: string;
  x?: number;
  y?: number;
}

interface PermacultureContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  momentsBalance: number;
  waterBalance: number;
  rainDropsBalance: number;
  givingWalletBalance: number;
  waterBucketsCount: number;
  earningsBalanceUsd: number;
  earningsWalletBalance: number;
  cashOutEarnings: (amountUsd: number, payoutMethod: string, destinationDetails?: string) => { success: boolean; message: string };
  convertEarningsToWater: (amountUsd: number) => { success: boolean; message: string; waterReceived: number };
  convertEarningsToRainDrops: (amountUsd: number) => { success: boolean; message: string; dropsReceived: number };
  channels: BushTVChannel[];
  currentChannel: BushTVChannel;
  setCurrentChannel: (channel: BushTVChannel) => void;
  messages: Record<string, ChatMessage[]>;
  posts: CommunityPost[];
  transactions: MomentsTransaction[];
  unlockedChannelIds: string[];
  isTopUpModalOpen: boolean;
  openTopUpModal: () => void;
  closeTopUpModal: () => void;
  isTxHistoryOpen: boolean;
  setTxHistoryOpen: (open: boolean) => void;
  isSchemaModalOpen: boolean;
  setSchemaModalOpen: (open: boolean) => void;
  tipFeedbackList: TipFeedback[];
  tipMessage: (messageId: string, amount: number) => boolean;
  tipPost: (postId: string, amount: number) => boolean;
  plantTheRain: (
    creatorId: string,
    rainDrops: number,
    message?: string,
    isMonthly?: boolean,
    isPrivate?: boolean
  ) => { success: boolean; message?: string };
  updateUserGoal: (userId: string, goal: CreatorGoal) => void;
  updateUserMembershipTiers: (userId: string, tiers: CreatorMembershipTier[]) => void;
  updateUserProfileImages: (userId: string, images: { avatar_url?: string; cover_url?: string }) => void;
  updateUserClimate: (userId: string, climate_zone: string) => void;
  updateUserProfileDetails: (
    userId: string,
    details: {
      location?: string;
      bio?: string;
      full_name?: string;
      headline?: string;
      permaculture_focus?: string;
    }
  ) => void;
  waterCreator: (
    creatorId: string,
    waterDrops: number,
    momentsPerDrop?: number,
    message?: string,
    isMonthly?: boolean,
    isPrivate?: boolean
  ) => boolean;
  topUpMoments: (packageId: string, isTestMode: boolean) => void;
  topUpRainDrops: (packageId: string, isTestMode: boolean) => void;
  unlockChannel: (channelId: string) => boolean;
  sendMessage: (channelId: string, content: string, media?: { imageUrl?: string; youtubeId?: string }) => void;
  createPost: (data: {
    title?: string;
    content: string;
    tags?: string[];
    mediaUrls?: string[];
    youtubeUrl?: string;
    videoUrl?: string;
    principle?: string;
    location?: string;
  }) => void;
  likePost: (postId: string) => void;
  editPost: (postId: string, newContent: string) => void;
  deletePost: (postId: string) => void;
  togglePinPost: (postId: string) => void;
  toggleSavePost: (postId: string) => boolean;
  isPostSaved: (postId: string) => boolean;
  savedPostIds: string[];
  editMessage: (channelId: string, messageId: string, newContent: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  pinChannelMessage: (channelId: string, noticeText: string | null) => void;
  followedCreatorIds: string[];
  toggleFollowCreator: (creatorId: string) => void;
  isFollowingCreator: (creatorId: string) => boolean;
  isFiresideAudioPlaying: boolean;
  toggleFiresideAudio: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isLoggedIn: boolean;
  login: (user?: UserProfile) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (targetRoute?: string) => void;
  closeAuthModal: () => void;
  pendingRedirectRoute: string | null;
  setPendingRedirectRoute: (route: string | null) => void;
  moderationReports: ModerationReport[];
  submitReport: (report: Omit<ModerationReport, 'id' | 'created_at' | 'status'>) => void;
  dismissReport: (reportId: string, adminNotes?: string) => void;
  removeReportedContent: (reportId: string, adminNotes?: string) => void;
  warnReportedUser: (reportId: string, warningText?: string) => void;
  suspendUserAccount: (userId: string, reportId?: string, reason?: string) => void;
  comments: PostComment[];
  addComment: (postId: string, content: string, parentId?: string | null) => PostComment;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  getCommentsForPost: (postId: string) => PostComment[];
  tipComment: (commentId: string, amount: number) => { success: boolean; message: string };
  notifications: PermacultureNotification[];
  unreadNotificationCount: number;
  addNotification: (notification: Omit<PermacultureNotification, 'id' | 'created_at'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
}

const PermacultureContext = createContext<PermacultureContextType | undefined>(undefined);

// Web Audio campfire crackle generator (synthesized procedural fire audio)
class CampfireAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private intervalId: number | null = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      // Buffer for soft brown/pink rumble
      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 0.15;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.value = 0.25;

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      noise.start();
      this.noiseNode = noise;
      this.isPlaying = true;

      // Random micro crackles / pops
      this.intervalId = window.setInterval(() => {
        if (!this.audioCtx || !this.isPlaying) return;
        if (Math.random() > 0.4) {
          const popOsc = this.audioCtx.createOscillator();
          const popGain = this.audioCtx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(200 + Math.random() * 800, this.audioCtx.currentTime);
          popGain.gain.setValueAtTime(0.04 + Math.random() * 0.08, this.audioCtx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04 + Math.random() * 0.06);

          popOsc.connect(popGain);
          popGain.connect(this.audioCtx.destination);
          popOsc.start();
          popOsc.stop(this.audioCtx.currentTime + 0.12);
        }
      }, 180);
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.isPlaying = false;
  }

  get active() {
    return this.isPlaying;
  }
}

const fireAudioEngine = new CampfireAudioEngine();

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

export const sanitizeProfile = (profile: UserProfile): UserProfile => {
  let goal = profile.goal;
  try {
    const savedGoal = localStorage.getItem(`perma_goal_${profile.id}`);
    if (savedGoal) {
      goal = JSON.parse(savedGoal);
    }
  } catch {}

  let membership_tiers = profile.membership_tiers;
  try {
    const savedTiers = localStorage.getItem(`perma_tiers_${profile.id}`);
    if (savedTiers) {
      membership_tiers = JSON.parse(savedTiers);
    }
  } catch {}

  let avatar_url = profile.avatar_url;
  try {
    const savedAvatar = localStorage.getItem(`perma_avatar_${profile.id}`);
    if (savedAvatar) {
      avatar_url = savedAvatar;
    }
  } catch {}

  let cover_url = profile.cover_url;
  try {
    const savedCover = localStorage.getItem(`perma_cover_${profile.id}`);
    if (savedCover !== null) {
      cover_url = savedCover;
    }
  } catch {}

  let climate_zone = profile.climate_zone;
  try {
    const savedClimate = localStorage.getItem(`perma_climate_${profile.id}`);
    if (savedClimate !== null) {
      climate_zone = savedClimate;
    }
  } catch {}

  let location = profile.location;
  try {
    const savedLocation = localStorage.getItem(`perma_location_${profile.id}`);
    if (savedLocation !== null) {
      location = savedLocation;
    }
  } catch {}

  let bio = profile.bio;
  try {
    const savedBio = localStorage.getItem(`perma_bio_${profile.id}`);
    if (savedBio !== null) {
      bio = savedBio;
    }
  } catch {}

  // Auto-modernize any legacy 'App The Moment' references to 'Permaculture App'
  if (bio && bio.includes('App The Moment')) {
    bio = bio.replace(/App The Moment/g, 'Permaculture App');
  }

  const isDanou = profile.id === 'user_danou' || profile.username === 'danou_van_rensburg';

  return {
    ...profile,
    email: profile.email || (isDanou ? 'danou@onshow.properties' : `${profile.username}@permacultureapp.com`),
    is_admin: profile.is_admin ?? (isDanou ? true : false),
    status: profile.status || 'active',
    avatar_url: avatar_url && avatar_url.trim() !== '' ? avatar_url : DEFAULT_AVATAR,
    cover_url: cover_url,
    climate_zone: climate_zone !== undefined ? climate_zone : profile.climate_zone,
    location: location !== undefined ? location : profile.location,
    bio: bio !== undefined ? bio : profile.bio,
    goal: goal || profile.goal,
    membership_tiers: membership_tiers || profile.membership_tiers
  };
};

export const INITIAL_MODERATION_REPORTS: ModerationReport[] = [
  {
    id: 'rep_1',
    content_type: 'feed_post',
    content_id: 'post_1',
    title: 'Commercial Fertilizer Promo disguised as Compost Guide',
    content_snippet: 'Promoting a synthetic nitrate soluble fertilizer blend instead of regenerative aerobic composting methods. Buy now at 20% discount with promo code SYNTHGROW.',
    media_urls: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80'],
    author_id: 'user_external_spammer',
    author_name: 'EcoFast Agrochemicals',
    author_username: 'ecofast_promo',
    author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    author_badge: 'Commercial Vendor',
    reported_by_id: 'user_willow',
    reported_by_name: 'Willow Sage',
    reported_by_username: 'willow_permaculture',
    reason: 'Spam / Commercial Product Shilling (Violates Regenerative Soil Ethos)',
    severity: 'high',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending'
  },
  {
    id: 'rep_2',
    content_type: 'bush_tv_chat',
    content_id: 'msg_rep_201',
    content_snippet: 'Hey check out this automated crypto trading bot for farm equipment discount tokens! Guaranteed 10x yield in 7 days: bit.ly/agri-crypto-yield',
    author_id: 'user_crypto_bot',
    author_name: 'AgriToken Bot',
    author_username: 'token_farmer_99',
    author_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    author_badge: 'New Member',
    reported_by_id: 'user_geoff',
    reported_by_name: 'Geoff Lawton',
    reported_by_username: 'geoff_lawton',
    reason: 'Unsolicited Financial Scam / Cryptocurrency Bot Spam',
    severity: 'high',
    created_at: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    status: 'pending'
  },
  {
    id: 'rep_3',
    content_type: 'profile_post',
    content_id: 'post_seed_swale_debate',
    title: 'Aggressive insults over swale sizing and keyline geometry',
    content_snippet: 'You have zero clue what you are talking about. Your swales will fail and drown your entire neighborhood, you incompetent amateur.',
    media_urls: ['https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80'],
    author_id: 'user_sand_gardener',
    author_name: 'Liam Dunes',
    author_username: 'liam_soil',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    author_badge: 'Soil Analyst',
    reported_by_id: 'user_elena',
    reported_by_name: 'Dr. Elena Rostova',
    reported_by_username: 'elena_perma',
    reason: 'Harassment & Hostile Conduct (Breach of Community Mutual Care Agreement)',
    severity: 'medium',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'pending'
  },
  {
    id: 'rep_4',
    content_type: 'feed_post',
    content_id: 'post_seed_water_tank',
    title: 'IBC Tote Gravity-Fed Drip Setup',
    content_snippet: 'Flagged by competitor alleging trademark infringement on food-grade IBC tank fittings.',
    media_urls: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80'],
    author_id: 'user_rain_steward',
    author_name: 'Marcus Vance',
    author_username: 'rainwater_marcus',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    author_badge: 'Hydrology Lead',
    reported_by_id: 'user_competitor',
    reported_by_name: 'HydroPlumb Corp',
    reported_by_username: 'hydroplumb_official',
    reason: 'False DMCA / Unfounded Copyright Complaint on Standard DIY Plumbing',
    severity: 'low',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'dismissed',
    admin_notes: 'Reviewed by Admin Danou: Standard open-source hardware build. No trademark violation detected. Dismissed.'
  },
  {
    id: 'rep_5',
    content_type: 'bush_tv_chat',
    content_id: 'msg_seed_toxic_1',
    content_snippet: 'Selling illegal untreated greywater piping bypass schematics for city zoning evasion.',
    author_id: 'user_rogue_plumber',
    author_name: 'Zoning Rebel',
    author_username: 'greywater_bandit',
    author_avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    author_badge: 'Guest',
    reported_by_id: 'user_danou',
    reported_by_name: 'Danou van Rensburg',
    reported_by_username: 'danou_van_rensburg',
    reason: 'Safety Hazard / Promotion of Contaminating Greywater Practices',
    severity: 'high',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'removed',
    admin_notes: 'Content deleted from Bush TV chat; message wiped.'
  },
  {
    id: 'rep_6',
    content_type: 'feed_post',
    content_id: 'post_seed_quackery',
    title: 'Miracle Magnetic Seed Enhancer 1000x Yields',
    content_snippet: 'Promoting unverified pseudo-scientific magnetic coils with affiliate links.',
    author_id: 'user_fringe_magnet',
    author_name: 'Quantum Farm Lab',
    author_username: 'quantum_farmer',
    author_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    author_badge: 'Member',
    reported_by_id: 'user_willow',
    reported_by_name: 'Willow Sage',
    reported_by_username: 'willow_permaculture',
    reason: 'Inappropriate / Misleading Pseudo-Science & Affiliate Spam',
    severity: 'medium',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'warned',
    admin_notes: 'First warning issued to Quantum Farm Lab. Affiliate links removed.'
  }
];

export const DEFAULT_NOTIFICATIONS: PermacultureNotification[] = [
  {
    id: 'notif_1',
    type: 'tip',
    actor: {
      id: 'user_elena',
      username: 'elena_biochar',
      full_name: 'Dr. Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Soil Doctor'
    },
    title: 'Rain Drops Planted 🌧️',
    description: 'Planted 60 Rain Drops on your Keyline Swale & Microclimate post!',
    amount_drops: 60,
    target_route: 'profile/danou_van_rensburg',
    created_at: '12m ago',
    is_read: false
  },
  {
    id: 'notif_2',
    type: 'comment',
    actor: {
      id: 'user_geoff',
      username: 'geoff_earthworks',
      full_name: 'Geoff Calder',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Keyline Surveyor'
    },
    title: 'New Comment 💬',
    description: 'Commented: "What contour spacing did you calculate for the vetiver grass hedge along the ridge?"',
    target_route: 'feed',
    created_at: '45m ago',
    is_read: false
  },
  {
    id: 'notif_3',
    type: 'mention',
    actor: {
      id: 'user_kai',
      username: 'kai_offgrid',
      full_name: 'Kai Fernandez',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Off-Grid Tech'
    },
    title: 'Bush TV Mention 🔥',
    description: 'Mentioned you in #soil-building: "@danou check out this compost tea aerator schematic"',
    target_route: 'bush-tv',
    created_at: '2h ago',
    is_read: false
  },
  {
    id: 'notif_4',
    type: 'follow',
    actor: {
      id: 'user_willow',
      username: 'willow_herbs',
      full_name: 'Willow Sage',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Guild Herbalist'
    },
    title: 'New Follower 🌱',
    description: 'Started following your regenerative food forest and swale builds.',
    target_route: 'profile/willow_herbs',
    created_at: '5h ago',
    is_read: true
  },
  {
    id: 'notif_5',
    type: 'tip',
    actor: {
      id: 'user_marcus',
      username: 'marcus_foodforest',
      full_name: 'Marcus Thorne',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Food Forest Mentor'
    },
    title: 'Water Bucket Planted 🪣',
    description: 'Sent 500 Rain Drops (1 Water Bucket) to stoke your deep mulch guild project!',
    amount_drops: 500,
    target_route: 'profile/danou_van_rensburg',
    created_at: '1d ago',
    is_read: true
  }
];

export const INITIAL_COMMENTS: PostComment[] = [
  // Post 1 comments & nested replies
  {
    id: 'cmt_1',
    post_id: 'post_1',
    parent_id: null,
    author: {
      id: 'user_willow',
      username: 'willow_permaculture',
      full_name: 'Willow & Oak Homestead',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      badge: 'Zone 1 Specialist'
    },
    content: 'How deep did you grade the level sill spillway to handle high-intensity cloudbursts?',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    drops_received: 150,
    total_drops_received: 150
  },
  {
    id: 'cmt_1_1',
    post_id: 'post_1',
    parent_id: 'cmt_1',
    author: {
      id: 'user_danou',
      username: 'danou_van_rensburg',
      full_name: 'Danou van Rensburg',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      badge: 'Earthworks Lead'
    },
    content: 'We set the sill at 15cm below the berm crest, packed with dense vetiver roots to dissipate velocity without eroding.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    drops_received: 50,
    total_drops_received: 50
  },
  {
    id: 'cmt_1_1_1',
    post_id: 'post_1',
    parent_id: 'cmt_1_1',
    author: {
      id: 'user_willow',
      username: 'willow_permaculture',
      full_name: 'Willow & Oak Homestead',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      badge: 'Zone 1 Specialist'
    },
    content: 'Brilliant! Vetiver tensile strength is unmatched for broadacre water retention.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    drops_received: 30,
    total_drops_received: 30
  },
  {
    id: 'cmt_2',
    post_id: 'post_1',
    parent_id: null,
    author: {
      id: 'user_morag',
      username: 'morag_gamble',
      full_name: 'Morag Gamble',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      badge: 'Master Teacher'
    },
    content: 'Beautiful demonstration of Principle 2: Catch and Store Energy. The subsoil hydration will feed trees all summer.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    drops_received: 100,
    total_drops_received: 100
  },

  // Post 2 comments & nested replies
  {
    id: 'cmt_3',
    post_id: 'post_2',
    parent_id: null,
    author: {
      id: 'user_geoff',
      username: 'geoff_lawton',
      full_name: 'Geoff Lawton',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badge: 'Greening the Desert'
    },
    content: 'Are you inoculating with fungal spores during the quenching phase?',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    drops_received: 70,
    total_drops_received: 70
  },
  {
    id: 'cmt_3_1',
    post_id: 'post_2',
    parent_id: 'cmt_3',
    author: {
      id: 'user_willow',
      username: 'willow_permaculture',
      full_name: 'Willow & Oak Homestead',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      badge: 'Zone 1 Specialist'
    },
    content: 'Yes Geoff! Quenching with aerated compost tea mixed with mycorrhizae and fish hydrolysate. Biochar pore space charges instantly.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    drops_received: 40,
    total_drops_received: 40
  },

  // Bush TV chat message comments
  {
    id: 'cmt_msg_1',
    post_id: 'msg_1',
    parent_id: null,
    author: {
      id: 'user_danou',
      username: 'danou_van_rensburg',
      full_name: 'Danou van Rensburg',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      badge: 'Earthworks Lead'
    },
    content: 'Welcome everyone around the fireside! Drop your questions and local climate zones below.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    drops_received: 120,
    total_drops_received: 120
  },
  {
    id: 'cmt_msg_1_1',
    post_id: 'msg_1',
    parent_id: 'cmt_msg_1',
    author: {
      id: 'user_morag',
      username: 'morag_gamble',
      full_name: 'Morag Gamble',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      badge: 'Master Teacher'
    },
    content: 'Subtropical zone 10 here in Crystal Waters! Loving the audio crackle integration.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    drops_received: 60,
    total_drops_received: 60
  }
];

export const PermacultureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('perma_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProfile);
        }
      } catch {
        // ignore
      }
    }
    return SEED_PROFILES.map(sanitizeProfile);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('perma_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return sanitizeProfile(parsed);
      } catch {
        // ignore
      }
    }
    return sanitizeProfile(SEED_PROFILES[0]);
  });

  const [momentsBalance, setMomentsBalance] = useState<number>(() => {
    const saved = localStorage.getItem('perma_moments_balance');
    return saved ? parseInt(saved, 10) : 500;
  });

  const [earningsBalanceUsd, setEarningsBalanceUsd] = useState<number>(() => {
    const saved = localStorage.getItem('perma_earnings_usd_' + currentUser.id);
    if (saved) return parseFloat(saved);
    return currentUser.earnings_usd !== undefined ? currentUser.earnings_usd : 118.75;
  });

  const [channels, setChannels] = useState<BushTVChannel[]>(() => {
    const saved = localStorage.getItem('perma_channels');
    return saved ? JSON.parse(saved) : SEED_CHANNELS;
  });

  const [currentChannel, setCurrentChannelState] = useState<BushTVChannel>(() => {
    const saved = localStorage.getItem('perma_current_channel_id');
    if (saved) {
      const match = SEED_CHANNELS.find(c => c.id === saved);
      if (match) return match;
    }
    return SEED_CHANNELS[0];
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('perma_messages');
    return saved ? JSON.parse(saved) : SEED_MESSAGES;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('perma_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize author_id if legacy 'user_current' was saved
          return parsed.map((p: CommunityPost) => {
            if (p.author_id === 'user_current') {
              return { ...p, author_id: 'user_danou' };
            }
            return p;
          });
        }
      } catch {}
    }
    return SEED_POSTS;
  });

  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('perma_followed_creators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return ['user_geoff', 'user_elena', 'user_kai'];
  });

  const [transactions, setTransactions] = useState<MomentsTransaction[]>(() => {
    const saved = localStorage.getItem('perma_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [unlockedChannelIds, setUnlockedChannelIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('perma_unlocked_channels');
    return saved ? JSON.parse(saved) : ['ch_general_fireside', 'ch_soil_building', 'ch_food_forests', 'ch_seed_exchange', 'ch_offgrid_tech'];
  });

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isTxHistoryOpen, setTxHistoryOpen] = useState(false);
  const [isSchemaModalOpen, setSchemaModalOpen] = useState(false);
  const [tipFeedbackList, setTipFeedbackList] = useState<TipFeedback[]>([]);
  const [isFiresideAudioPlaying, setIsFiresideAudioPlaying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('perma_is_logged_in');
    return saved !== null ? saved === 'true' : true;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirectRoute, setPendingRedirectRoute] = useState<string | null>(null);

  const login = (user?: UserProfile) => {
    if (user) {
      setCurrentUser(sanitizeProfile(user));
    }
    setIsLoggedIn(true);
    localStorage.setItem('perma_is_logged_in', 'true');
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('perma_is_logged_in', 'false');
  };

  const openAuthModal = (targetRoute?: string) => {
    if (targetRoute) {
      setPendingRedirectRoute(targetRoute);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('perma_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  // Sync theme to <html> tag and localStorage
  useEffect(() => {
    localStorage.setItem('perma_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('perma_users', JSON.stringify(users));
  }, [users]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('perma_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('perma_moments_balance', momentsBalance.toString());
  }, [momentsBalance]);

  useEffect(() => {
    localStorage.setItem('perma_earnings_usd_' + currentUser.id, earningsBalanceUsd.toString());
  }, [earningsBalanceUsd, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('perma_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('perma_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('perma_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('perma_followed_creators', JSON.stringify(followedCreatorIds));
  }, [followedCreatorIds]);

  const toggleFollowCreator = (creatorId: string) => {
    setFollowedCreatorIds(prev => {
      const isFollowing = prev.includes(creatorId);
      const next = isFollowing ? prev.filter(id => id !== creatorId) : [...prev, creatorId];
      // Sync follower_count on creator in user state
      setUsers(usersList =>
        usersList.map(u => {
          if (u.id === creatorId) {
            const delta = isFollowing ? -1 : 1;
            return {
              ...u,
              follower_count: Math.max(0, (u.follower_count || 0) + delta)
            };
          }
          return u;
        })
      );
      return next;
    });
  };

  const isFollowingCreator = (creatorId: string) => followedCreatorIds.includes(creatorId);

  useEffect(() => {
    localStorage.setItem('perma_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('perma_unlocked_channels', JSON.stringify(unlockedChannelIds));
  }, [unlockedChannelIds]);

  const setCurrentChannel = (channel: BushTVChannel) => {
    setCurrentChannelState(channel);
    localStorage.setItem('perma_current_channel_id', channel.id);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId) || SEED_PROFILES.find(u => u.id === userId);
    if (target) {
      const sanitized = sanitizeProfile(target);
      setCurrentUser(sanitized);
      setMomentsBalance(target.moments_balance);
      const savedEarnings = localStorage.getItem('perma_earnings_usd_' + target.id);
      if (savedEarnings) {
        setEarningsBalanceUsd(parseFloat(savedEarnings));
      } else {
        setEarningsBalanceUsd(target.earnings_usd !== undefined ? target.earnings_usd : 118.75);
      }
    }
  };

  const triggerTipAnimation = (amount: number, recipientName: string) => {
    const feedback: TipFeedback = {
      id: Math.random().toString(36).substring(2, 9),
      amount,
      recipientName
    };
    setTipFeedbackList(prev => [...prev, feedback]);
    setTimeout(() => {
      setTipFeedbackList(prev => prev.filter(f => f.id !== feedback.id));
    }, 2800);
  };

  const tipMessage = (messageId: string, amount: number): boolean => {
    // Enforce 20 Rain Drops minimum and multiples of 20
    const tipAmount = Math.max(20, Math.ceil(amount / 20) * 20);

    if (momentsBalance < tipAmount) {
      setIsTopUpModalOpen(true);
      return false;
    }

    let targetUser = 'Bush TV Member';
    let targetUserId = '';
    let targetMsgContent = 'Bush TV Message';

    // 5% platform fee exact calculation:
    // e.g. at 20 Drops ($0.20), platform receives 1 Drop ($0.01) and creator receives 19 Drops ($0.19)
    const platformFeeDrops = Math.round(tipAmount * 0.05);
    const creatorDrops = tipAmount - platformFeeDrops;
    const platformFeeUsd = platformFeeDrops / 100;
    const netEarningsUsd = creatorDrops / 100;

    // Update message tipped count
    setMessages(prev => {
      const updated: Record<string, ChatMessage[]> = {};
      for (const [chId, msgList] of Object.entries(prev)) {
        updated[chId] = msgList.map(msg => {
          if (msg.id === messageId) {
            targetUser = msg.user.full_name;
            targetUserId = msg.user_id;
            targetMsgContent = msg.content.substring(0, 30) + '...';
            return {
              ...msg,
              moments_tipped: msg.moments_tipped + tipAmount
            };
          }
          return msg;
        });
      }
      return updated;
    });

    // Credit recipient earnings if in users list or active user
    if (targetUserId) {
      setUsers(prev =>
        prev.map(u => {
          if (u.id === targetUserId) {
            return {
              ...u,
              earnings_usd: Number(((u.earnings_usd || 0) + netEarningsUsd).toFixed(2))
            };
          }
          return u;
        })
      );
      if (currentUser.id === targetUserId) {
        setEarningsBalanceUsd(prev => Number((prev + netEarningsUsd).toFixed(2)));
      }
    }

    // Deduct balance
    setMomentsBalance(prev => Math.max(0, prev - tipAmount));

    // Record Transaction
    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: currentUser.id,
      type: 'tip_sent',
      amount: -tipAmount,
      counterparty_name: targetUser,
      reference_title: `Plant the Rain 🌧️: ${tipAmount} Rain Drops 💧 tip on Bush TV ("${targetMsgContent}")`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      fee_amount: platformFeeUsd,
      net_usd: netEarningsUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    triggerTipAnimation(tipAmount, `${targetUser} (+$${netEarningsUsd.toFixed(2)})`);
    return true;
  };

  const tipPost = (postId: string, amount: number): boolean => {
    // Enforce 20 Rain Drops minimum and multiples of 20
    const tipAmount = Math.max(20, Math.ceil(amount / 20) * 20);

    let authorName = 'Creator';
    let authorId = '';
    let postTitle = 'Permaculture Post';

    // 5% platform fee exact calculation
    const platformFeeDrops = Math.round(tipAmount * 0.05);
    const creatorDrops = tipAmount - platformFeeDrops;
    const platformFeeUsd = platformFeeDrops / 100;
    const netEarningsUsd = creatorDrops / 100;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          authorName = p.author.full_name;
          authorId = p.author_id;
          postTitle = p.title || p.content.slice(0, 30) || 'Moment';
          const newDrops = (p.moments_harvested || 0) + tipAmount;
          return {
            ...p,
            moments_harvested: newDrops,
            totalReceivedDrops: newDrops
          };
        }
        return p;
      })
    );

    // Credit author's earnings wallet
    if (authorId) {
      setUsers(prev =>
        prev.map(u => {
          if (u.id === authorId) {
            return {
              ...u,
              earnings_usd: Number(((u.earnings_usd || 0) + netEarningsUsd).toFixed(2)),
              moments_harvested: (u.moments_harvested || 0) + tipAmount
            };
          }
          return u;
        })
      );
      if (currentUser.id === authorId) {
        setEarningsBalanceUsd(prev => Number((prev + netEarningsUsd).toFixed(2)));
      }
    }

    setMomentsBalance(prev => Math.max(0, prev - tipAmount));

    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: currentUser.id,
      type: 'tip_sent',
      amount: -tipAmount,
      counterparty_name: authorName,
      reference_title: `Plant the Rain 🌧️: ${tipAmount} Rain Drops 💧 tip on post "${postTitle}"`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      fee_amount: platformFeeUsd,
      net_usd: netEarningsUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    triggerTipAnimation(tipAmount, `${authorName} (+$${netEarningsUsd.toFixed(2)})`);
    return true;
  };

  const plantTheRain = (
    creatorId: string,
    rainDrops: number,
    message?: string,
    isMonthly?: boolean,
    isPrivate?: boolean
  ): { success: boolean; message?: string } => {
    // Enforce 20 drops minimum
    if (rainDrops < 20) {
      return { success: false, message: 'Minimum donation is 20 Rain Drops 💧 ($0.20 USD).' };
    }
    // Enforce multiples of 20
    if (rainDrops % 20 !== 0) {
      return { success: false, message: 'Rain Drops must be gifted in multiples of 20 (e.g. 20, 40, 60, 100, 500).' };
    }

    if (momentsBalance < rainDrops) {
      setIsTopUpModalOpen(true);
      return { success: false, message: 'Insufficient Rain Drops balance. Please top up your wallet.' };
    }

    const creator = users.find(u => u.id === creatorId);
    const creatorName = creator ? creator.full_name : 'Permaculture Creator';

    // Deduct user's Rain Drops balance
    setMomentsBalance(prev => Math.max(0, prev - rainDrops));

    // Exact 5% platform fee calculation:
    // At 20 Drops ($0.20), platform receives 1 Drop ($0.01) and creator receives 19 Drops ($0.19)
    const platformFeeDrops = Math.round(rainDrops * 0.05);
    const creatorEarnedDrops = rainDrops - platformFeeDrops;
    const platformFeeUsd = platformFeeDrops / 100;
    const netEarningsUsd = creatorEarnedDrops / 100;

    // If active user is the recipient creator, credit their earnings wallet immediately
    if (currentUser.id === creatorId) {
      setEarningsBalanceUsd(prev => Number((prev + netEarningsUsd).toFixed(2)));
    }

    const bucketsEquivalent = rainDrops / 500;
    const bucketLabel = bucketsEquivalent >= 1 ? ` (${bucketsEquivalent >= 2 ? bucketsEquivalent + ' Water Buckets 🪣' : '1 Water Bucket 🪣'})` : '';

    // Update Creator profile in state
    const newNote = {
      id: `supp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      supporter_name: isPrivate ? 'Generous Steward' : currentUser.full_name,
      supporter_avatar: isPrivate
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        : currentUser.avatar_url,
      water_drops: rainDrops,
      rain_drops: rainDrops,
      moments_amount: rainDrops,
      buckets_count: bucketsEquivalent,
      message: message?.trim() || undefined,
      created_at: new Date().toISOString(),
      is_monthly: isMonthly,
      is_private: isPrivate
    };

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === creatorId) {
          const updatedGoal = u.goal
            ? { ...u.goal, current_water: u.goal.current_water + rainDrops }
            : undefined;
          const updatedEarnings = Number(((u.earnings_usd || 0) + netEarningsUsd).toFixed(2));
          return {
            ...u,
            moments_harvested: (u.moments_harvested || 0) + rainDrops,
            supporter_count: (u.supporter_count || 0) + 1,
            earnings_usd: updatedEarnings,
            goal: updatedGoal,
            recent_supporters: [newNote, ...(u.recent_supporters || [])]
          };
        }
        return u;
      })
    );

    // Record in transaction ledger
    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_raindrops`,
      user_id: currentUser.id,
      type: 'tip_sent',
      amount: -rainDrops,
      counterparty_name: creatorName,
      reference_title: `Planted ${rainDrops.toLocaleString()} Rain Drops 💧${bucketLabel}${isMonthly ? ' (Monthly)' : ''}${message ? `: "${message}"` : ''}`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      fee_amount: platformFeeUsd,
      net_usd: netEarningsUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    // Visual animation feedback
    triggerTipAnimation(rainDrops, `${creatorName} (+$${netEarningsUsd.toFixed(2)} earnings)`);
    return { success: true };
  };

  const waterCreator = (
    creatorId: string,
    waterDrops: number,
    _momentsPerDrop: number = 1,
    message?: string,
    isMonthly?: boolean,
    isPrivate?: boolean
  ): boolean => {
    const res = plantTheRain(creatorId, waterDrops, message, isMonthly, isPrivate);
    return res.success;
  };

  const updateUserGoal = (userId: string, goal: CreatorGoal) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            goal
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        goal
      }));
    }

    try {
      localStorage.setItem(`perma_goal_${userId}`, JSON.stringify(goal));
    } catch (e) {
      console.error('Failed to save goal to localStorage', e);
    }
  };

  const updateUserMembershipTiers = (userId: string, tiers: CreatorMembershipTier[]) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            membership_tiers: tiers
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        membership_tiers: tiers
      }));
    }

    try {
      localStorage.setItem(`perma_tiers_${userId}`, JSON.stringify(tiers));
    } catch (e) {
      console.error('Failed to save membership tiers to localStorage', e);
    }
  };

  const updateUserProfileImages = (
    userId: string,
    images: { avatar_url?: string; cover_url?: string }
  ) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ...(images.avatar_url !== undefined ? { avatar_url: images.avatar_url } : {}),
            ...(images.cover_url !== undefined ? { cover_url: images.cover_url } : {})
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        ...(images.avatar_url !== undefined ? { avatar_url: images.avatar_url } : {}),
        ...(images.cover_url !== undefined ? { cover_url: images.cover_url } : {})
      }));
    }

    try {
      if (images.avatar_url !== undefined) {
        localStorage.setItem(`perma_avatar_${userId}`, images.avatar_url);
      }
      if (images.cover_url !== undefined) {
        localStorage.setItem(`perma_cover_${userId}`, images.cover_url);
      }
    } catch (e) {
      console.error('Failed to save profile images to localStorage', e);
    }
  };

  const updateUserClimate = (userId: string, climate_zone: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            climate_zone
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        climate_zone
      }));
    }

    try {
      localStorage.setItem(`perma_climate_${userId}`, climate_zone);
    } catch (e) {
      console.error('Failed to save climate zone to localStorage', e);
    }
  };

  const updateUserProfileDetails = (
    userId: string,
    details: {
      location?: string;
      bio?: string;
      full_name?: string;
      headline?: string;
      permaculture_focus?: string;
    }
  ) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ...details
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        ...details
      }));
    }

    // Also update any posts created by this user so author.location and author details update across all feeds
    if (details.location !== undefined || details.full_name !== undefined) {
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.author_id === userId || p.author.id === userId) {
            return {
              ...p,
              author: {
                ...p.author,
                ...(details.location !== undefined ? { location: details.location } : {}),
                ...(details.full_name !== undefined ? { full_name: details.full_name } : {})
              },
              location_tag: details.location || p.location_tag
            };
          }
          return p;
        })
      );
    }

    try {
      if (details.location !== undefined) {
        localStorage.setItem(`perma_location_${userId}`, details.location);
      }
      if (details.bio !== undefined) {
        localStorage.setItem(`perma_bio_${userId}`, details.bio);
      }
    } catch (e) {
      console.error('Failed to save profile details to localStorage', e);
    }
  };

  const cashOutEarnings = (
    amountUsd: number,
    payoutMethod: string,
    destinationDetails?: string
  ): { success: boolean; message: string } => {
    if (amountUsd < 100) {
      return {
        success: false,
        message: 'Minimum cash out threshold is $100.00 USD.'
      };
    }

    if (earningsBalanceUsd < amountUsd) {
      return {
        success: false,
        message: `Insufficient earnings balance. You currently have $${earningsBalanceUsd.toFixed(2)} USD.`
      };
    }

    const updatedEarnings = Number((earningsBalanceUsd - amountUsd).toFixed(2));
    setEarningsBalanceUsd(updatedEarnings);

    // Update in users state
    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            earnings_usd: updatedEarnings,
            total_cashed_out_usd: Number(((u.total_cashed_out_usd || 0) + amountUsd).toFixed(2))
          };
        }
        return u;
      })
    );

    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_cashout`,
      user_id: currentUser.id,
      type: 'cash_out',
      amount: -Math.round(amountUsd * 100),
      counterparty_name: `${payoutMethod} (${destinationDetails || 'Stripe Connect Payout'})`,
      reference_title: `Earnings Payout: $${amountUsd.toFixed(2)} USD`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      net_usd: amountUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    return {
      success: true,
      message: `Successfully requested payout of $${amountUsd.toFixed(2)} USD via ${payoutMethod}. Funds will arrive in 1-2 business days.`
    };
  };

  const convertEarningsToWater = (
    amountUsd: number
  ): { success: boolean; message: string; waterReceived: number } => {
    if (amountUsd <= 0) {
      return { success: false, message: 'Please enter an amount greater than $0.', waterReceived: 0 };
    }

    if (earningsBalanceUsd < amountUsd) {
      return {
        success: false,
        message: `Insufficient earnings balance. You currently have $${earningsBalanceUsd.toFixed(2)} USD.`,
        waterReceived: 0
      };
    }

    // Free conversion: 1 USD = 100 Water Drops (0% conversion fee!)
    const waterDropsToAdd = Math.floor(amountUsd * 100);
    const updatedEarnings = Number((earningsBalanceUsd - amountUsd).toFixed(2));

    setEarningsBalanceUsd(updatedEarnings);
    setMomentsBalance(prev => prev + waterDropsToAdd);

    // Update in users state
    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            earnings_usd: updatedEarnings,
            moments_balance: u.moments_balance + waterDropsToAdd
          };
        }
        return u;
      })
    );

    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_convert`,
      user_id: currentUser.id,
      type: 'convert_earnings_to_water',
      amount: waterDropsToAdd,
      counterparty_name: 'Water Wallet (Self Conversion)',
      reference_title: `Converted $${amountUsd.toFixed(2)} USD Earnings to ${waterDropsToAdd.toLocaleString()} Water Drops (0% fee)`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      net_usd: -amountUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    triggerTipAnimation(waterDropsToAdd, 'Water Wallet');

    return {
      success: true,
      message: `Successfully converted $${amountUsd.toFixed(2)} USD into ${waterDropsToAdd.toLocaleString()} Rain Drops 💧!`,
      waterReceived: waterDropsToAdd
    };
  };

  const convertEarningsToRainDrops = (
    amountUsd: number
  ): { success: boolean; message: string; dropsReceived: number } => {
    const res = convertEarningsToWater(amountUsd);
    return {
      success: res.success,
      message: res.message,
      dropsReceived: res.waterReceived
    };
  };

  const topUpMoments = (packageId: string, isTestMode: boolean) => {
    const pkg = TOP_UP_PACKAGES.find(p => p.id === packageId) || TOP_UP_PACKAGES[1];
    setMomentsBalance(prev => prev + pkg.moments);

    const buckets = pkg.buckets || Math.floor(pkg.moments / 500);

    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_topup`,
      user_id: currentUser.id,
      type: 'topup_purchase',
      amount: pkg.moments,
      counterparty_name: `${pkg.name} (${isTestMode ? 'Demo / Test Mode' : 'Stripe Live'})`,
      reference_title: `Rain Drops Top-Up: ${pkg.moments.toLocaleString()} Rain Drops 💧 (${buckets} Bucket${buckets > 1 ? 's 🪣' : ' 🪣'}) ($${pkg.price_usd.toFixed(2)})`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: isTestMode,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`
    };
    setTransactions(prev => [newTx, ...prev]);
    setIsTopUpModalOpen(false);
    triggerTipAnimation(pkg.moments, 'Your Rain Drops Wallet 💧');
  };

  const topUpRainDrops = topUpMoments;

  const unlockChannel = (channelId: string): boolean => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return false;
    const cost = channel.min_moments_unlock || 200;

    if (momentsBalance < cost) {
      setIsTopUpModalOpen(true);
      return false;
    }

    setMomentsBalance(prev => prev - cost);
    setUnlockedChannelIds(prev => [...prev, channelId]);

    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_unlock`,
      user_id: currentUser.id,
      type: 'channel_unlock',
      amount: -cost,
      counterparty_name: channel.name,
      reference_title: `Unlocked Tier Channel: ${channel.name}`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`
    };
    setTransactions(prev => [newTx, ...prev]);
    return true;
  };

  const extractYoutubeId = (text: string): string | undefined => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = text.match(regExp);
    return match ? match[1] : undefined;
  };

  const sendMessage = (channelId: string, content: string, media?: { imageUrl?: string; youtubeId?: string }) => {
    const detectedYoutube = media?.youtubeId || extractYoutubeId(content);

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channel_id: channelId,
      user_id: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
        badge: currentUser.badge,
        tier: currentUser.tier
      },
      content,
      created_at: new Date().toISOString(),
      moments_tipped: 0,
      youtube_id: detectedYoutube,
      image_url: media?.imageUrl,
      reactions: { '🔥': 1 }
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));
  };

  const createPost = (data: {
    title?: string;
    content: string;
    tags?: string[];
    mediaUrls?: string[];
    youtubeUrl?: string;
    videoUrl?: string;
    principle?: string;
    location?: string;
  }) => {
    const detectedYoutube = data.youtubeUrl || (data.videoUrl ? extractYoutubeId(data.videoUrl) : undefined);
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      author_id: currentUser.id,
      author: currentUser,
      title: data.title || '',
      content: data.content,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Moment', 'Permaculture'],
      media_urls: data.mediaUrls || [],
      youtube_url: detectedYoutube,
      video_url: data.videoUrl || data.youtubeUrl,
      created_at: new Date().toISOString(),
      moments_harvested: 0,
      likes_count: 1,
      comments_count: 0,
      location_tag: data.location || currentUser.location,
      permaculture_principle: data.principle
    };

    setPosts(prev => [newPost, ...prev]);
  };

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('perma_saved_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('perma_saved_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  const toggleSavePost = (postId: string): boolean => {
    let willSave = false;
    setSavedPostIds(prev => {
      const exists = prev.includes(postId);
      willSave = !exists;
      return exists ? prev.filter(id => id !== postId) : [...prev, postId];
    });
    return willSave;
  };

  const isPostSaved = (postId: string): boolean => savedPostIds.includes(postId);

  const editPost = (postId: string, newContent: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, content: newContent, is_edited: true } : p))
    );
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const togglePinPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, is_pinned: !p.is_pinned } : p))
    );
  };

  const editMessage = (channelId: string, messageId: string, newContent: string) => {
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map(m =>
          m.id === messageId ? { ...m, content: newContent, is_edited: true } : m
        )
      };
    });
  };

  const deleteMessage = (channelId: string, messageId: string) => {
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.filter(m => m.id !== messageId)
      };
    });
  };

  const pinChannelMessage = (channelId: string, noticeText: string | null) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId ? { ...c, pinned_notice: noticeText || undefined } : c))
    );
    setCurrentChannelState(prev => {
      if (prev.id === channelId) {
        return { ...prev, pinned_notice: noticeText || undefined };
      }
      return prev;
    });
  };

  const likePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes_count: p.likes_count + 1 };
        }
        return p;
      })
    );
  };

  const toggleFiresideAudio = () => {
    if (isFiresideAudioPlaying) {
      fireAudioEngine.stop();
      setIsFiresideAudioPlaying(false);
    } else {
      fireAudioEngine.start();
      setIsFiresideAudioPlaying(true);
    }
  };

  // ------------------------------------------------------------
  // CONTENT MODERATION QUEUE & ACTIONS
  // ------------------------------------------------------------
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem('perma_moderation_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MODERATION_REPORTS;
  });

  useEffect(() => {
    localStorage.setItem('perma_moderation_reports', JSON.stringify(moderationReports));
  }, [moderationReports]);

  const submitReport = (reportData: Omit<ModerationReport, 'id' | 'created_at' | 'status'>) => {
    const newReport: ModerationReport = {
      ...reportData,
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    setModerationReports(prev => [newReport, ...prev]);
  };

  const dismissReport = (reportId: string, adminNotes?: string) => {
    setModerationReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: 'dismissed',
              resolved_at: new Date().toISOString(),
              admin_notes: adminNotes || 'Report dismissed as non-violating. Content remains active.',
              action_by: currentUser.username
            }
          : r
      )
    );
  };

  const removeReportedContent = (reportId: string, adminNotes?: string) => {
    const report = moderationReports.find(r => r.id === reportId);
    if (report) {
      if (report.content_type === 'feed_post' || report.content_type === 'profile_post') {
        deletePost(report.content_id);
      } else if (report.content_type === 'bush_tv_chat') {
        channels.forEach(ch => {
          deleteMessage(ch.id, report.content_id);
        });
      }
    }
    setModerationReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: 'removed',
              resolved_at: new Date().toISOString(),
              admin_notes: adminNotes || 'Content soft-deleted across all feeds and channels.',
              action_by: currentUser.username
            }
          : r
      )
    );
  };

  const warnReportedUser = (reportId: string, warningText?: string) => {
    const report = moderationReports.find(r => r.id === reportId);
    setModerationReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: 'warned',
              warning_issued_at: new Date().toISOString(),
              admin_notes: warningText || `Automated warning dispatch issued to @${report?.author_username || 'user'}.`,
              action_by: currentUser.username
            }
          : r
      )
    );
  };

  const suspendUserAccount = (userId: string, reportId?: string, reason?: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, status: 'suspended' }));
    }
    if (reportId) {
      setModerationReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? {
                ...r,
                status: 'suspended',
                resolved_at: new Date().toISOString(),
                admin_notes: reason || `Account suspended and wallet frozen by Admin @${currentUser.username}.`,
                action_by: currentUser.username
              }
            : r
        )
      );
    }
    // Soft delete or hide posts by the suspended author
    setPosts(prev => prev.filter(p => p.author_id !== userId && p.author.id !== userId));
  };

  // --- Comments & Nested Reply State ---
  const [comments, setComments] = useState<PostComment[]>(() => {
    try {
      const saved = localStorage.getItem('perma_comments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_COMMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('perma_comments', JSON.stringify(comments));
    } catch {
      // ignore
    }
  }, [comments]);

  const addComment = (postId: string, content: string, parentId?: string | null): PostComment => {
    const newComment: PostComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      post_id: postId,
      parent_id: parentId || null,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
        badge: currentUser.badge
      },
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    // Also update comments_count on post if target is a community post
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      )
    );

    return newComment;
  };

  const editComment = (commentId: string, content: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, content: content.trim(), is_edited: true } : c
      )
    );
  };

  const deleteComment = (commentId: string) => {
    let targetPostId = '';
    const toDeleteIds = new Set<string>();

    const collectDescendants = (id: string) => {
      toDeleteIds.add(id);
      comments.filter(c => c.parent_id === id).forEach(child => collectDescendants(child.id));
    };
    collectDescendants(commentId);

    const targetComment = comments.find(c => c.id === commentId);
    if (targetComment) {
      targetPostId = targetComment.post_id;
    }

    setComments(prev => prev.filter(c => !toDeleteIds.has(c.id)));

    if (targetPostId) {
      const countRemoved = toDeleteIds.size;
      setPosts(prev =>
        prev.map(p =>
          p.id === targetPostId ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - countRemoved) } : p
        )
      );
    }
  };

  const getCommentsForPost = (postId: string): PostComment[] => {
    return comments.filter(c => c.post_id === postId);
  };

  // --- Notifications State ---
  const [notifications, setNotifications] = useState<PermacultureNotification[]>(() => {
    try {
      const saved = localStorage.getItem('permaculture_notifications_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('permaculture_notifications_v1', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const addNotification = (notif: Omit<PermacultureNotification, 'id' | 'created_at'>) => {
    const newNotif: PermacultureNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  // --- Rain Drops Comment Tipping ---
  const tipComment = (commentId: string, amount: number): { success: boolean; message: string } => {
    // Enforce 20 Rain Drops minimum and multiples of 20
    const tipAmount = Math.max(20, Math.ceil(amount / 20) * 20);

    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) {
      return {
        success: false,
        message: 'Comment not found.'
      };
    }

    // Revenue split: 95% to comment author's Earnings Wallet, 5% platform fee
    const platformFeeDrops = Math.round(tipAmount * 0.05);
    const authorEarnedDrops = tipAmount - platformFeeDrops;
    const platformFeeUsd = Number((platformFeeDrops / 100).toFixed(2));
    const authorEarningsUsd = Number((authorEarnedDrops / 100).toFixed(2));

    // Deduct tipper's Giving Wallet
    setMomentsBalance(prev => Math.max(0, prev - tipAmount));

    // Update comment's received drops
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const prevTotal = c.drops_received || c.total_drops_received || c.totalReceivedDrops || 0;
          const newTotal = prevTotal + tipAmount;
          return {
            ...c,
            drops_received: newTotal,
            total_drops_received: newTotal,
            totalReceivedDrops: newTotal
          };
        }
        return c;
      })
    );

    // Credit author's Earnings Wallet
    const authorId = targetComment.author.id;
    if (authorId) {
      setUsers(prev =>
        prev.map(u => {
          if (u.id === authorId || u.username === targetComment.author.username) {
            return {
              ...u,
              earnings_usd: Number(((u.earnings_usd || 0) + authorEarningsUsd).toFixed(2)),
              moments_harvested: (u.moments_harvested || 0) + tipAmount
            };
          }
          return u;
        })
      );
      if (currentUser.id === authorId || currentUser.username === targetComment.author.username) {
        setEarningsBalanceUsd(prev => Number((prev + authorEarningsUsd).toFixed(2)));
      }
    }

    // Record transaction in ledger
    const newTx: MomentsTransaction = {
      id: `tx_${Date.now()}_comment_tip`,
      user_id: currentUser.id,
      type: 'tip_sent',
      amount: -tipAmount,
      counterparty_name: targetComment.author.full_name,
      reference_title: `Rain Drops 💧 tip on comment: "${targetComment.content.slice(0, 30)}..."`,
      created_at: new Date().toISOString(),
      status: 'completed',
      test_mode: false,
      tx_hash: `0x${Math.random().toString(16).substring(2, 12)}`,
      fee_amount: platformFeeUsd,
      net_usd: authorEarningsUsd
    };
    setTransactions(prev => [newTx, ...prev]);

    // Visual tip feedback animation
    triggerTipAnimation(tipAmount, `${targetComment.author.full_name} (+$${authorEarningsUsd.toFixed(2)})`);

    // Real-time alert to notification bell system for comment author
    addNotification({
      type: 'tip',
      actor: {
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
        badge: currentUser.badge
      },
      title: 'Rain Drops Received 💧',
      description: `${currentUser.full_name} tipped you ${tipAmount} Rain Drops on your comment!`,
      amount_drops: tipAmount,
      target_id: targetComment.id,
      target_route: 'feed',
      is_read: false
    });

    return {
      success: true,
      message: `Tipped ${tipAmount} Rain Drops 💧 to @${targetComment.author.username}!`
    };
  };

  return (
    <PermacultureContext.Provider
      value={{
        currentUser,
        allUsers: users,
        switchUser,
        momentsBalance,
        waterBalance: momentsBalance,
        rainDropsBalance: momentsBalance,
        givingWalletBalance: momentsBalance,
        waterBucketsCount: Number((momentsBalance / 500).toFixed(1)),
        earningsBalanceUsd,
        earningsWalletBalance: earningsBalanceUsd,
        cashOutEarnings,
        convertEarningsToWater,
        convertEarningsToRainDrops,
        channels,
        currentChannel,
        setCurrentChannel,
        messages,
        posts,
        transactions,
        unlockedChannelIds,
        isTopUpModalOpen,
        openTopUpModal: () => setIsTopUpModalOpen(true),
        closeTopUpModal: () => setIsTopUpModalOpen(false),
        isTxHistoryOpen,
        setTxHistoryOpen,
        isSchemaModalOpen,
        setSchemaModalOpen,
        tipFeedbackList,
        tipMessage,
        tipPost,
        plantTheRain,
        waterCreator,
        updateUserGoal,
        updateUserMembershipTiers,
        updateUserProfileImages,
        updateUserClimate,
        updateUserProfileDetails,
        topUpMoments,
        topUpRainDrops,
        unlockChannel,
        sendMessage,
        createPost,
        likePost,
        editPost,
        deletePost,
        togglePinPost,
        toggleSavePost,
        isPostSaved,
        savedPostIds,
        editMessage,
        deleteMessage,
        pinChannelMessage,
        followedCreatorIds,
        toggleFollowCreator,
        isFollowingCreator,
        isFiresideAudioPlaying,
        toggleFiresideAudio,
        theme,
        toggleTheme,
        isLoggedIn,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        pendingRedirectRoute,
        setPendingRedirectRoute,
        moderationReports,
        submitReport,
        dismissReport,
        removeReportedContent,
        warnReportedUser,
        suspendUserAccount,
        comments,
        addComment,
        editComment,
        deleteComment,
        getCommentsForPost,
        tipComment,
        notifications,
        unreadNotificationCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification
      }}
    >
      {children}
    </PermacultureContext.Provider>
  );
};

export const usePermaculture = () => {
  const context = useContext(PermacultureContext);
  if (!context) {
    throw new Error('usePermaculture must be used within a PermacultureProvider');
  }
  return context;
};
