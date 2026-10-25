import React, { createContext, useContext, useState, useEffect } from 'react';
import { MessengerThread, MessengerMessage, MessengerParticipant, MessengerAttachment } from '../types/messenger';
import {
  INITIAL_MESSENGER_THREADS,
  INITIAL_MESSENGER_MESSAGES,
  SEED_MESSENGER_PARTICIPANTS
} from '../lib/messenger';
import { usePermaculture } from './PermacultureContext';
import { askDan, containsDanMention, DAN_BOT_ID, DAN_MESSENGER_PARTICIPANT } from '../services/danService';

interface MessengerContextType {
  isMessengerOpen: boolean;
  openMessenger: (threadId?: string, recipientUserId?: string) => void;
  closeMessenger: () => void;
  toggleMessenger: () => void;
  threads: MessengerThread[];
  activeThreadId: string | null;
  activeThread: MessengerThread | null;
  messages: Record<string, MessengerMessage[]>;
  activeMessages: MessengerMessage[];
  totalUnreadCount: number;
  setActiveThreadId: (threadId: string | null) => void;
  sendMessage: (
    threadId: string,
    text: string,
    attachment?: MessengerAttachment
  ) => void;
  createDirectThread: (recipient: MessengerParticipant) => string;
  createGroupThread: (title: string, participantIds: string[], description?: string) => string;
  markThreadAsRead: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  startChatWithUser: (userId: string) => void;
  availableContacts: MessengerParticipant[];
}

const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

const STORAGE_KEY_THREADS = 'permaculture_messenger_threads_v2';
const STORAGE_KEY_MESSAGES = 'permaculture_messenger_messages_v2';

export const MessengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = usePermaculture();

  // Load threads from local storage or fallback to seed
  const [threads, setThreads] = useState<MessengerThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THREADS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load messenger threads from storage', e);
    }
    return INITIAL_MESSENGER_THREADS;
  });

  // Load messages from local storage or fallback to seed
  const [messages, setMessages] = useState<Record<string, MessengerMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load messenger messages from storage', e);
    }
    return INITIAL_MESSENGER_MESSAGES;
  });

  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
    } catch (e) {
      console.error('Failed to persist threads', e);
    }
  }, [threads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to persist messages', e);
    }
  }, [messages]);

  // Total unread calculation across all threads
  const totalUnreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;
  const activeMessages = (activeThreadId && messages[activeThreadId]) ? messages[activeThreadId] : [];

  // Available contacts merged from seed and all app users
  const availableContacts: MessengerParticipant[] = React.useMemo(() => {
    const contactsMap = new Map<string, MessengerParticipant>();

    // Seed participants
    SEED_MESSENGER_PARTICIPANTS.forEach(p => {
      if (p.id !== currentUser.id) {
        contactsMap.set(p.id, p);
      }
    });

    // App users
    allUsers.forEach(u => {
      if (u.id !== currentUser.id && !contactsMap.has(u.id)) {
        contactsMap.set(u.id, {
          id: u.id,
          name: u.full_name || u.username,
          username: u.username,
          avatar: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          badge: u.badge || 'Regenerative Member',
          role: u.permaculture_focus || 'Permaculture Designer',
          isOnline: true,
          lastSeen: 'Active now'
        });
      }
    });

    return Array.from(contactsMap.values());
  }, [allUsers, currentUser.id]);

  const markThreadAsRead = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId && t.unreadCount > 0) {
          return { ...t, unreadCount: 0 };
        }
        return t;
      })
    );
  };

  const openMessenger = (threadId?: string, recipientUserId?: string) => {
    setIsMessengerOpen(true);
    if (threadId) {
      setActiveThreadId(threadId);
      markThreadAsRead(threadId);
    } else if (recipientUserId) {
      startChatWithUser(recipientUserId);
    }
  };

  const closeMessenger = () => {
    setIsMessengerOpen(false);
  };

  const toggleMessenger = () => {
    setIsMessengerOpen(prev => !prev);
  };

  const selectActiveThread = (threadId: string | null) => {
    setActiveThreadId(threadId);
    if (threadId) {
      markThreadAsRead(threadId);
    }
  };

  // Find or create direct thread with a specific user ID
  const startChatWithUser = (userId: string) => {
    setIsMessengerOpen(true);

    // Look for existing direct thread with this user
    const existing = threads.find(
      t => t.type === 'direct' && t.participants.some(p => p.id === userId)
    );

    if (existing) {
      setActiveThreadId(existing.id);
      markThreadAsRead(existing.id);
      return;
    }

    // Look up contact details
    const contact = availableContacts.find(c => c.id === userId) || {
      id: userId,
      name: 'Community Member',
      username: userId,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      badge: 'Gardener',
      role: 'Permaculture Member',
      isOnline: true,
      lastSeen: 'Active now'
    };

    createDirectThread(contact);
  };

  const createDirectThread = (recipient: MessengerParticipant): string => {
    // Check if one already exists
    const existing = threads.find(
      t => t.type === 'direct' && t.participants.some(p => p.id === recipient.id)
    );
    if (existing) {
      setActiveThreadId(existing.id);
      markThreadAsRead(existing.id);
      return existing.id;
    }

    const newThreadId = `thread_${recipient.id}_${Date.now()}`;
    const newThread: MessengerThread = {
      id: newThreadId,
      type: 'direct',
      title: recipient.name,
      avatar: recipient.avatar,
      participants: [recipient],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    return newThreadId;
  };

  const createGroupThread = (title: string, participantIds: string[], description?: string): string => {
    const selectedParticipants = availableContacts.filter(c => participantIds.includes(c.id));
    const newThreadId = `group_${Date.now()}`;
    const newThread: MessengerThread = {
      id: newThreadId,
      type: 'group',
      title: title.trim() || 'New Group Chat',
      description: description?.trim() || `Group with ${selectedParticipants.map(p => p.name.split(' ')[0]).join(', ')}`,
      participants: selectedParticipants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: {
        text: 'Group created. Welcome everyone! 🌿',
        senderName: currentUser.full_name || 'You',
        createdAt: new Date().toISOString(),
        hasAttachment: false
      }
    };

    const initialWelcomeMsg: MessengerMessage = {
      id: `msg_welcome_${Date.now()}`,
      threadId: newThreadId,
      senderId: currentUser.id || 'user_current',
      senderName: currentUser.full_name || 'You',
      senderAvatar: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      text: `Created group "${title}". Welcome everyone! 🌿`,
      createdAt: new Date().toISOString(),
      status: 'read'
    };

    setThreads(prev => [newThread, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newThreadId]: [initialWelcomeMsg]
    }));
    setActiveThreadId(newThreadId);
    return newThreadId;
  };

  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setMessages(prev => {
      const next = { ...prev };
      delete next[threadId];
      return next;
    });
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  };

  const sendMessage = (
    threadId: string,
    text: string,
    attachment?: MessengerAttachment
  ) => {
    if (!text.trim() && !attachment) return;

    const newMessage: MessengerMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      threadId,
      senderId: currentUser.id || 'user_current',
      senderName: currentUser.full_name || 'You',
      senderAvatar: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      text: text.trim(),
      attachment,
      createdAt: new Date().toISOString(),
      status: 'delivered'
    };

    // Update message log
    setMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMessage]
    }));

    // Update thread snippet and move to top
    setThreads(prev => {
      const target = prev.find(t => t.id === threadId);
      if (!target) return prev;

      const updatedTarget: MessengerThread = {
        ...target,
        updatedAt: new Date().toISOString(),
        lastMessage: {
          text: text.trim() || (attachment ? `Sent an attachment (${attachment.name})` : ''),
          senderName: 'You',
          createdAt: new Date().toISOString(),
          hasAttachment: !!attachment
        }
      };

      return [updatedTarget, ...prev.filter(t => t.id !== threadId)];
    });

    // Helpful automated reply companion if chatting with active mentors
    const targetThread = threads.find(t => t.id === threadId);
    if (targetThread && targetThread.participants.length > 0) {
      const partner = targetThread.participants[0];
      const partnerReplies: Record<string, string[]> = {
        user_danou: [
          'Received! I will verify those contour lines with the A-frame level before the next rain event.',
          'Great notes. We are setting up the next broadacre earthworks demonstration in Bush TV soon.',
          'Love this observation. Let me know if you want to collaborate on the keyline water plan.'
        ],
        user_elaine: [
          'Keep an eye on the fungal hyphae density. A good thermal compost should have rich brown humic coloration.',
          'Fascinating observation! Remember that nematodes need adequate moisture to remain active in the rhizosphere.',
          'Excellent! Aerate the tea for 24 hours and apply it in the early morning before peak UV rays.'
        ],
        user_maya: [
          'The stratification looks balanced! High-density syntropic pruning is definitely the secret here.',
          'Thank you for sharing! The biomass return from that chop-and-drop will build serious fungal soil.'
        ],
        user_geoff: [
          'Solid permaculture design! You always want water stored as high up in the landscape as safely possible.',
          'That swale spillway looks textbook! Happy growing.'
        ]
      };

      // If chatting with Dan (or mentioning @dan in any chat)
      if (partner.id === DAN_BOT_ID || containsDanMention(text) || targetThread.participants.some(p => p.id === DAN_BOT_ID)) {
        askDan({
          prompt: text,
          imageUrl: attachment?.type === 'image' ? attachment.url : undefined,
          base64Image: attachment?.type === 'image' && attachment.url.startsWith('data:') ? attachment.url : undefined
        }).then(result => {
          const danReply: MessengerMessage = {
            id: `msg_dan_${Date.now()}`,
            threadId,
            senderId: DAN_BOT_ID,
            senderName: 'Dan · Permaculture Elder',
            senderAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
            text: result.reply,
            createdAt: new Date().toISOString(),
            status: 'read'
          };

          setMessages(prev => ({
            ...prev,
            [threadId]: [...(prev[threadId] || []), danReply]
          }));

          setThreads(prev => {
            const current = prev.find(t => t.id === threadId);
            if (!current) return prev;
            return [
              {
                ...current,
                updatedAt: new Date().toISOString(),
                unreadCount: isMessengerOpen && activeThreadId === threadId ? 0 : current.unreadCount + 1,
                lastMessage: {
                  text: result.reply,
                  senderName: 'Dan · Permaculture Elder',
                  createdAt: new Date().toISOString(),
                  hasAttachment: false
                }
              },
              ...prev.filter(t => t.id !== threadId)
            ];
          });
        });

        return;
      }

      const replies = partnerReplies[partner.id];
      if (replies && replies.length > 0) {
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyTimeout = setTimeout(() => {
          const autoReply: MessengerMessage = {
            id: `msg_reply_${Date.now()}`,
            threadId,
            senderId: partner.id,
            senderName: partner.name,
            senderAvatar: partner.avatar,
            text: randomReply,
            createdAt: new Date().toISOString(),
            status: 'read'
          };

          setMessages(prev => ({
            ...prev,
            [threadId]: [...(prev[threadId] || []), autoReply]
          }));

          setThreads(prev => {
            const current = prev.find(t => t.id === threadId);
            if (!current) return prev;
            return [
              {
                ...current,
                updatedAt: new Date().toISOString(),
                unreadCount: isMessengerOpen && activeThreadId === threadId ? 0 : current.unreadCount + 1,
                lastMessage: {
                  text: randomReply,
                  senderName: partner.name,
                  createdAt: new Date().toISOString(),
                  hasAttachment: false
                }
              },
              ...prev.filter(t => t.id !== threadId)
            ];
          });
        }, 1200);

        return () => clearTimeout(replyTimeout);
      }
    }
  };

  return (
    <MessengerContext.Provider
      value={{
        isMessengerOpen,
        openMessenger,
        closeMessenger,
        toggleMessenger,
        threads,
        activeThreadId,
        activeThread,
        messages,
        activeMessages,
        totalUnreadCount,
        setActiveThreadId: selectActiveThread,
        sendMessage,
        createDirectThread,
        createGroupThread,
        markThreadAsRead,
        deleteThread,
        startChatWithUser,
        availableContacts
      }}
    >
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => {
  const context = useContext(MessengerContext);
  if (!context) {
    throw new Error('useMessenger must be used within a MessengerProvider');
  }
  return context;
};
