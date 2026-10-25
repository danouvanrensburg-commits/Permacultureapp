import { MessengerThread, MessengerMessage, MessengerParticipant } from '../types/messenger';
import { DAN_MESSENGER_PARTICIPANT } from '../services/danService';

export const SEED_MESSENGER_PARTICIPANTS: MessengerParticipant[] = [
  DAN_MESSENGER_PARTICIPANT,
  {
    id: 'user_danou',
    name: 'Danou van Rensburg',
    username: 'danou_van_rensburg',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    badge: 'TIME KEEPER',
    role: 'Water Steward & Keyline Designer',
    isOnline: true,
    lastSeen: 'Active now'
  },
  {
    id: 'user_elaine',
    name: 'Dr. Elaine Ingham',
    username: 'elaine_soil_food_web',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    badge: 'Soil Pioneer',
    role: 'Soil Food Web Institute Founder',
    isOnline: true,
    lastSeen: 'Active now'
  },
  {
    id: 'user_geoff',
    name: 'Geoff Calder',
    username: 'geoff_calder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    badge: 'Guild Master',
    role: 'Broadacre Earthworks Mentor',
    isOnline: false,
    lastSeen: 'Active 20m ago'
  },
  {
    id: 'user_maya',
    name: 'Maya Lin',
    username: 'maya_agroforestry',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    badge: 'Syntropic Forester',
    role: 'Multi-Strata Canopy Architect',
    isOnline: true,
    lastSeen: 'Active now'
  },
  {
    id: 'user_liam',
    name: 'Liam O’Connor',
    username: 'liam_biochar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    badge: 'Biochar Specialist',
    role: 'Soil Pyrolysis & Inoculation',
    isOnline: false,
    lastSeen: 'Active 2h ago'
  }
];

export const INITIAL_MESSENGER_THREADS: MessengerThread[] = [
  {
    id: 'thread_dan_bot',
    type: 'direct',
    title: 'Dan · Permaculture Elder',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    participants: [
      SEED_MESSENGER_PARTICIPANTS[0] // Dan
    ],
    unreadCount: 1,
    lastMessage: {
      text: 'Greetings! I am Dan. Ask me anything about your garden, soil, or swales—or send me a photo anytime! 🌿',
      senderName: 'Dan · Permaculture Elder',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      hasAttachment: false
    },
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'thread_danou',
    type: 'direct',
    title: 'Danou van Rensburg',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    participants: [
      SEED_MESSENGER_PARTICIPANTS[1] // Danou
    ],
    unreadCount: 1,
    lastMessage: {
      text: 'Broadacre swale contours are marked! Check the slope elevations in Section 3.',
      senderName: 'Danou van Rensburg',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      hasAttachment: true
    },
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'thread_group_soil',
    type: 'group',
    title: 'Pacific Northwest Soil Guild',
    description: 'Active testing of cold-climate microbial inoculation and mycorrhizal fungal teas.',
    participants: [
      SEED_MESSENGER_PARTICIPANTS[2], // Dr. Elaine
      SEED_MESSENGER_PARTICIPANTS[5], // Liam
      SEED_MESSENGER_PARTICIPANTS[1]  // Danou
    ],
    unreadCount: 2,
    lastMessage: {
      text: 'Have you tested the compost tea fungal-to-bacterial ratio under 400x magnification yet?',
      senderName: 'Dr. Elaine Ingham',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      hasAttachment: false
    },
    createdAt: '2026-10-08T12:00:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'thread_maya',
    type: 'direct',
    title: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    participants: [
      SEED_MESSENGER_PARTICIPANTS[3]
    ],
    unreadCount: 0,
    lastMessage: {
      text: 'The syntropic pruning cycle was a huge success. The understory elderberries are thriving.',
      senderName: 'Maya Lin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      hasAttachment: false
    },
    createdAt: '2026-10-05T14:30:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'thread_group_canopy',
    type: 'group',
    title: 'Food Forest Guild Builders',
    description: 'Collaborative designs for companion planting guilds and multi-canopy windbreaks.',
    participants: [
      SEED_MESSENGER_PARTICIPANTS[0],
      SEED_MESSENGER_PARTICIPANTS[2],
      SEED_MESSENGER_PARTICIPANTS[3]
    ],
    unreadCount: 0,
    lastMessage: {
      text: 'Uploaded the root guild schematics for the autumn grafting workshop.',
      senderName: 'Geoff Calder',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      hasAttachment: true
    },
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const INITIAL_MESSENGER_MESSAGES: Record<string, MessengerMessage[]> = {
  thread_dan_bot: [
    {
      id: 'msg_dan_1',
      threadId: 'thread_dan_bot',
      senderId: 'bot_dan',
      senderName: 'Dan · Permaculture Elder',
      senderAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      text: 'Greetings, steward! I am Dan. Ask me anything about your garden, soil, or swales—or send me a photo anytime! 🌿',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'delivered'
    }
  ],
  thread_danou: [
    {
      id: 'msg_d1',
      threadId: 'thread_danou',
      senderId: 'user_current',
      senderName: 'Willow Sage',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      text: 'Hi Danou! I reviewed your broadacre swale prototype. How did the A-frame survey go on the eastern slope?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'read'
    },
    {
      id: 'msg_d2',
      threadId: 'thread_danou',
      senderId: 'user_danou',
      senderName: 'Danou van Rensburg',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      text: 'We pegged out 320 meters of level contour. The overflow spillways look rock-solid with rip-rap stone.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'read'
    },
    {
      id: 'msg_d3',
      threadId: 'thread_danou',
      senderId: 'user_danou',
      senderName: 'Danou van Rensburg',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      text: 'Broadacre swale contours are marked! Check the slope elevations in Section 3.',
      attachment: {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
        name: 'swale_contour_elevation.jpg',
        type: 'image',
        size: '1.4 MB'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: 'delivered'
    }
  ],
  thread_group_soil: [
    {
      id: 'msg_s1',
      threadId: 'thread_group_soil',
      senderId: 'user_liam',
      senderName: 'Liam O’Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      text: 'Just finished charging 200kg of horticultural biochar with worm casting slurry and fish hydrolysate.',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      status: 'read'
    },
    {
      id: 'msg_s2',
      threadId: 'thread_group_soil',
      senderId: 'user_elaine',
      senderName: 'Dr. Elaine Ingham',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      text: 'Make sure the temperature stays below 140°F during the aerobic maturation stage to protect amoebic cysts.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'read'
    },
    {
      id: 'msg_s3',
      threadId: 'thread_group_soil',
      senderId: 'user_elaine',
      senderName: 'Dr. Elaine Ingham',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      text: 'Have you tested the compost tea fungal-to-bacterial ratio under 400x magnification yet?',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'delivered'
    }
  ],
  thread_maya: [
    {
      id: 'msg_m1',
      threadId: 'thread_maya',
      senderId: 'user_maya',
      senderName: 'Maya Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      text: 'The syntropic pruning cycle was a huge success. The understory elderberries are thriving.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'read'
    }
  ],
  thread_group_canopy: [
    {
      id: 'msg_c1',
      threadId: 'thread_group_canopy',
      senderId: 'user_geoff',
      senderName: 'Geoff Calder',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      text: 'Uploaded the root guild schematics for the autumn grafting workshop.',
      attachment: {
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
        name: 'canopy_guild_schematic.jpg',
        type: 'image',
        size: '2.1 MB'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'read'
    }
  ]
};

export const QUICK_PHOTO_ATTACHMENTS = [
  {
    title: 'Earthworks & Swale Map',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    name: 'swale_contour_survey.jpg'
  },
  {
    title: 'Food Forest Canopy',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
    name: 'permaculture_guild_strata.jpg'
  },
  {
    title: 'Compost Soil Microbes',
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80',
    name: 'aerobic_compost_microbiology.jpg'
  },
  {
    title: 'Nursery Seedlings',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80',
    name: 'companion_seedlings.jpg'
  }
];
