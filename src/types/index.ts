export type AccessTier = 'public' | 'followers' | 'supporter' | 'vip';

// Currency & Math Constants
export const RAINDROPS_PER_USD = 100;
export const RAINDROPS_PER_BUCKET = 500; // 1 Water Bucket 🪣 = 500 Rain Drops ($5.00 USD)
export const BUCKET_USD = 5.0;
export const MIN_RAINDROP_TIP = 20; // Minimum 20 Rain Drops ($0.20 USD)
export const RAINDROP_INCREMENT = 20; // Multiples of 20 Rain Drops
export const PLATFORM_FEE_RATE = 0.05; // 5% platform fee

export interface CreatorSupporterNote {
  id: string;
  supporter_name: string;
  supporter_avatar: string;
  water_drops?: number;
  rain_drops?: number;
  moments_amount: number;
  buckets_count?: number;
  message?: string;
  created_at: string;
  is_monthly?: boolean;
  is_private?: boolean;
}

export interface CreatorGoal {
  title: string;
  description: string;
  current_water: number;
  current_raindrops?: number;
  target_water: number;
  target_raindrops?: number;
  unit_label?: string;
  target_amount_usd?: number;
  starting_amount?: number;
  include_shop_sales?: boolean;
  include_commission_sales?: boolean;
  show_target_publicly?: boolean;
}

export interface CreatorMembershipTier {
  id: string;
  name: string;
  water_drops_per_month: number;
  rain_drops_per_month?: number;
  price_usd: number;
  badge: string;
  description: string;
  perks: string[];
  popular?: boolean;
  image_url?: string;
  welcome_message?: string;
  discord_role?: boolean;
  request_address?: boolean;
  limit_members?: boolean;
  max_members?: number;
  is_published?: boolean;
}

export interface CreatorBlueprintItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
  water_cost?: number;
  raindrop_cost?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  is_admin?: boolean;
  status?: 'active' | 'suspended';
  avatar_url: string;
  cover_url?: string;
  bio: string;
  headline?: string;
  permaculture_focus: string;
  climate_zone: string;
  location: string;
  tier: 'free' | 'supporter' | 'vip';
  is_creator: boolean;
  supporter_count: number;
  follower_count: number;
  moments_balance: number;
  moments_harvested: number;
  earnings_usd?: number;
  total_cashed_out_usd?: number;
  created_at: string;
  badge?: string;
  channels_hosted?: string[];
  social_links?: {
    website?: string;
    youtube?: string;
    instagram?: string;
  };
  goal?: CreatorGoal;
  membership_tiers?: CreatorMembershipTier[];
  recent_supporters?: CreatorSupporterNote[];
  blueprints?: CreatorBlueprintItem[];
}

export interface BushTVChannel {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'public' | 'followers' | 'supporter_5' | 'vip_10';
  tier_required: AccessTier;
  min_moments_unlock?: number;
  is_locked: boolean;
  active_viewers_count: number;
  topic_tags: string[];
  host: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge: string;
  };
  pinned_notice?: string;
  live_stream_url?: string;
  live_stream_type?: 'youtube' | 'ambient_fire' | 'audio_fireside';
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge?: string;
    tier: 'free' | 'supporter' | 'vip';
  };
  content: string;
  created_at: string;
  moments_tipped: number;
  youtube_id?: string;
  image_url?: string;
  reactions?: Record<string, number>;
  is_pinned?: boolean;
  is_edited?: boolean;
  totalReceivedDrops?: number;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author: UserProfile;
  title?: string;
  content: string;
  tags: string[];
  media_urls: string[];
  youtube_url?: string;
  video_url?: string;
  created_at: string;
  moments_harvested: number;
  likes_count: number;
  comments_count: number;
  location_tag?: string;
  permaculture_principle?: string;
  is_pinned?: boolean;
  is_edited?: boolean;
  totalReceivedDrops?: number;
}

export interface MomentsTransaction {
  id: string;
  user_id: string;
  type: 'tip_sent' | 'tip_received' | 'topup_purchase' | 'channel_unlock' | 'cash_out' | 'convert_earnings_to_water';
  amount: number;
  counterparty_name: string;
  reference_title: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  test_mode: boolean;
  tx_hash: string;
  fee_amount?: number;
  net_usd?: number;
}

export interface TopUpPackage {
  id: string;
  name: string;
  moments: number;
  raindrops?: number;
  buckets?: number;
  price_usd: number;
  bonus?: string;
  popular?: boolean;
  description: string;
  iconName: string;
}

export type ModerationContentType = 'feed_post' | 'profile_post' | 'bush_tv_chat';
export type ModerationStatus = 'pending' | 'dismissed' | 'removed' | 'warned' | 'suspended';
export type ModerationSeverity = 'low' | 'medium' | 'high';

export interface ModerationReport {
  id: string;
  content_type: ModerationContentType;
  content_id: string;
  title?: string;
  content_snippet: string;
  media_urls?: string[];
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  author_badge?: string;
  reported_by_id?: string;
  reported_by_name: string;
  reported_by_username: string;
  reason: string;
  severity: ModerationSeverity;
  created_at: string;
  status: ModerationStatus;
  admin_notes?: string;
  warning_issued_at?: string;
  resolved_at?: string;
  action_by?: string;
}

export interface PostComment {
  id: string;
  post_id: string; // post_id or chat message id
  parent_id?: string | null; // null for top-level, comment.id for nested reply
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge?: string;
  };
  content: string;
  created_at: string;
  is_edited?: boolean;
  drops_received?: number;
  total_drops_received?: number;
  totalReceivedDrops?: number;
}

export type NotificationType = 'tip' | 'comment' | 'follow' | 'mention';

export interface PermacultureNotification {
  id: string;
  type: NotificationType;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge?: string;
  };
  title: string;
  description: string;
  target_id?: string;
  target_route?: string;
  amount_drops?: number;
  created_at: string;
  is_read: boolean;
}

