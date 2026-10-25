import { UserProfile } from '../types';
import { MessengerParticipant } from '../types/messenger';

export const DAN_BOT_ID = 'bot_dan';

export const DAN_BOT_PROFILE: UserProfile = {
  id: DAN_BOT_ID,
  username: 'dan',
  full_name: 'Dan · Permaculture Elder',
  avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
  cover_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
  headline: 'Permaculture Elder · Tag me with @dan or ask me in direct chat 🌿',
  bio: 'Lifelong ecological systems designer and soil food web elder. Tag me with @dan in any community post, comment, or fireside chat, or message me directly with garden photos for practical field advice.',
  permaculture_focus: 'Keyline Hydrology, Living Soils & Forest Guilds',
  climate_zone: 'Universal Global Biomes',
  location: 'Permaculture Commons Living Lab',
  tier: 'vip',
  is_creator: true,
  supporter_count: 890,
  follower_count: 4200,
  moments_balance: 99999,
  moments_harvested: 15400,
  badge: 'PERMACULTURE ELDER',
  created_at: '2026-01-01T00:00:00Z',
  channels_hosted: ['ch_general_fireside', 'ch_soil_building']
};

export const DAN_MESSENGER_PARTICIPANT: MessengerParticipant = {
  id: DAN_BOT_ID,
  name: 'Dan · Permaculture Elder',
  username: 'dan',
  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
  badge: 'PERMACULTURE ELDER',
  role: 'Permaculture Elder (Tag @dan)',
  isOnline: true,
  lastSeen: 'Active now'
};

export const containsDanMention = (text: string): boolean => {
  if (!text) return false;
  // Matches @dan or @bill with word boundary, case-insensitive
  return /@(dan|bill)\b/i.test(text);
};

export interface DanAskOptions {
  prompt: string;
  imageUrl?: string;
  base64Image?: string;
}

export const askDan = async (options: DanAskOptions): Promise<{ reply: string; source: string }> => {
  try {
    const response = await fetch('/api/dan/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || 'Nature is the greatest teacher. Please try asking again shortly.',
      source: data.source || 'gemini'
    };
  } catch (error) {
    console.error('Failed to get answer from Dan:', error);
    return {
      reply: `🌿 **Dan's Field Note**:
Observing your inquiry about permaculture and regenerative design:
1. **Soil Grounding**: Check your organic matter layer—aim for at least 3 inches of carbon-rich mulch.
2. **Water Retention**: Ensure all irrigation or runoff is captured on contour with swales or uncompacted beds.
3. **Biological Guilds**: Integrate companion dynamic accumulators like comfrey and yarrow to confuse pests and cycle subsoil nutrients.
*Nature never wastes a drop or a leaf.*`,
      source: 'offline_safety_cache'
    };
  }
};
