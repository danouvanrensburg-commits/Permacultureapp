import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Sprout,
  Lock,
  Plus,
  Send,
  User,
  Share2,
  Compass,
  Shield,
  Radio,
  Search,
  Users,
  Image,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Eye,
  ExternalLink,
  Smile,
  X,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Copy,
  Flag,
  MessageCircle,
  AlertCircle,
  Check
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { BushTVChannel, ChatMessage } from '../types';
import { WaterGrowthOverlay } from './WaterGrowthOverlay';
import { CommentSection } from './CommentSection';

interface BushTVChatProps {
  navigate: (route: string) => void;
}

export const BushTVChat: React.FC<BushTVChatProps> = ({ navigate }) => {
  const {
    currentUser,
    allUsers,
    channels,
    currentChannel,
    setCurrentChannel,
    createChannel,
    messages,
    momentsBalance,
    givingWalletBalance,
    openTopUpModal,
    tipMessage,
    sendMessage,
    unlockedChannelIds,
    unlockChannel,
    editMessage,
    deleteMessage,
    pinChannelMessage,
    submitReport,
    comments,
    isLoggedIn,
    openAuthModal
  } = usePermaculture();

  // Channel creation modal state
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState<boolean>(false);
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newChannelAccessLevel, setNewChannelAccessLevel] = useState<'public' | 'followers'>('public');
  const [newChannelDescription, setNewChannelDescription] = useState<string>('');
  const [selectedModeratorIds, setSelectedModeratorIds] = useState<string[]>([]);
  const [moderatorSearchQuery, setModeratorSearchQuery] = useState<string>('');

  // Guild Exclusive access requirement state for channel creation
  const [accessRequirementType, setAccessRequirementType] = useState<'guild_tier' | 'monthly_drops'>('guild_tier');
  const [selectedTierId, setSelectedTierId] = useState<string>('tier_seedling');
  const [monthlyDropsCost, setMonthlyDropsCost] = useState<number>(40);

  // Channel access verification prompt modal state
  const [channelUnlockPrompt, setChannelUnlockPrompt] = useState<BushTVChannel | null>(null);

  // Available Guild Tiers for creator selection
  const defaultGuildTiers = [
    { id: 'tier_seedling', name: 'Seedling Tier ($5.00/mo)', price_usd: 5, badge: 'Seedling' },
    { id: 'tier_canopy', name: 'Canopy Tier ($15.00/mo)', price_usd: 15, badge: 'Canopy Steward' },
    { id: 'tier_earth_steward', name: 'Earth Steward VIP ($25.00/mo)', price_usd: 25, badge: 'Earth Steward' }
  ];

  const availableGuildTiers = [
    ...(currentUser.membership_tiers || []).map(t => ({
      id: t.id,
      name: `${t.name} ($${t.price_usd.toFixed(2)}/mo)`,
      price_usd: t.price_usd,
      badge: t.badge
    })),
    ...defaultGuildTiers
  ].filter((tier, index, self) => index === self.findIndex(t => t.id === tier.id));

  // Pinned notice editor modal state
  const [isNoticeEditorOpen, setIsNoticeEditorOpen] = useState<boolean>(false);
  const [noticeEditorText, setNoticeEditorText] = useState<string>('');

  // Helper to format channel slug
  const formatSlug = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Message tipping modal state
  const [tippingMessage, setTippingMessage] = useState<ChatMessage | null>(null);
  const [msgTipAmount, setMsgTipAmount] = useState<number>(60);
  const [isMsgCustomTip, setIsMsgCustomTip] = useState<boolean>(false);
  const [msgCustomInput, setMsgCustomInput] = useState<string>('40');
  const [msgTipSuccess, setMsgTipSuccess] = useState<string | null>(null);
  const [msgTipError, setMsgTipError] = useState<string | null>(null);

  // Track open comment and nested replies per chat message in Bush TV
  const [openCommentMessageIds, setOpenCommentMessageIds] = useState<Set<string>>(new Set());

  const toggleComments = (msgId: string) => {
    setOpenCommentMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const [messageText, setMessageText] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showPresenceSidebar, setShowPresenceSidebar] = useState(false);
  const [isMobileChannelDrawerOpen, setIsMobileChannelDrawerOpen] = useState(false);

  // Three-dots menu and message interaction state
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Watering Economy growth animation state
  const [growingTipKey, setGrowingTipKey] = useState<string | null>(null);

  const handleTipMessageWithGrowth = (messageId: string, amount: number) => {
    tipMessage(messageId, amount);
    const key = `${messageId}-${amount}`;
    setGrowingTipKey(key);
    setTimeout(() => {
      setGrowingTipKey(prev => (prev === key ? null : prev));
    }, 1400);
  };

  const handleConfirmMessageTip = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!tippingMessage) return;

    const raw = isMsgCustomTip
      ? (parseInt(msgCustomInput, 10) || msgTipAmount)
      : msgTipAmount;
    const tipAmount = Math.max(20, Math.ceil(raw / 20) * 20);

    // Deduct amount from current user's givingWalletBalance,
    // add 95% to recipient's earningsWalletBalance,
    // increment message drops counter
    tipMessage(tippingMessage.id, tipAmount);

    setTippingMessage(null);
    setMsgTipSuccess(null);
    setMsgTipError(null);
  };

  // Close menus and drawer on outside click / escape
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuMessageId(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuMessageId(null);
        setIsMobileChannelDrawerOpen(false);
        setShowPresenceSidebar(false);
        setIsCreateChannelModalOpen(false);
        setIsNoticeEditorOpen(false);
      }
    };
    window.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Channel owner and appointed moderator verification
  const isChannelOwner =
    (Boolean(currentChannel.owner_id) && currentUser.id === currentChannel.owner_id) ||
    currentUser.id === currentChannel.host.id ||
    (Boolean(currentUser.username && currentChannel.host.username) &&
      currentUser.username.toLowerCase() === currentChannel.host.username.toLowerCase()) ||
    (currentChannel.host.id === 'user_danou' && (currentUser.id === 'user_current' || currentUser.username === 'danou_van_rensburg'));

  const isChannelModerator =
    Boolean(
      currentChannel.moderator_ids &&
      (currentChannel.moderator_ids.includes(currentUser.id) ||
       (currentUser.username && currentChannel.moderator_ids.some(m => m.toLowerCase() === currentUser.username.toLowerCase())))
    );

  const canModerateChannel = isChannelOwner || isChannelModerator || Boolean(currentUser.is_admin);

  // Backward compatibility alias for host check
  const isChannelHost = isChannelOwner;

  // Handler to create a new channel with access requirements
  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formatSlug(newChannelName);
    if (!slug) {
      showNotice('Please enter a valid channel name');
      return;
    }

    const tierObj = availableGuildTiers.find(t => t.id === selectedTierId);

    try {
      const created = createChannel({
        name: `#${slug}`,
        description: newChannelDescription.trim() || 'Regenerative fireside circle',
        category: newChannelAccessLevel,
        moderator_ids: selectedModeratorIds,
        access_requirement_type: newChannelAccessLevel === 'followers' ? accessRequirementType : undefined,
        required_tier_id: newChannelAccessLevel === 'followers' && accessRequirementType === 'guild_tier' ? selectedTierId : undefined,
        required_tier_name: newChannelAccessLevel === 'followers' && accessRequirementType === 'guild_tier' ? (tierObj?.name || 'Guild Member Tier') : undefined,
        monthly_drops_cost: newChannelAccessLevel === 'followers' && accessRequirementType === 'monthly_drops' ? monthlyDropsCost : undefined
      });

      setIsCreateChannelModalOpen(false);
      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelAccessLevel('public');
      setSelectedModeratorIds([]);
      setModeratorSearchQuery('');
      setAccessRequirementType('guild_tier');
      setMonthlyDropsCost(40);
      showNotice(`🔥 Channel #${created.slug} created successfully! You are the owner.`);
    } catch {
      showNotice('Failed to create channel. Please try again.');
    }
  };

  // Check if channel is unlocked for user according to access requirements
  const checkIsChannelUnlocked = (ch: BushTVChannel): boolean => {
    if (ch.category === 'public') return true;
    if (unlockedChannelIds.includes(ch.id)) return true;
    if (ch.owner_id === currentUser.id || ch.host.id === currentUser.id) return true;
    if (ch.moderator_ids && ch.moderator_ids.includes(currentUser.id)) return true;
    if (currentUser.is_admin) return true;

    // Custom GUILD EXCLUSIVE requirements
    if (ch.category === 'followers') {
      if (ch.access_requirement_type === 'monthly_drops') {
        return unlockedChannelIds.includes(ch.id);
      }
      if (ch.access_requirement_type === 'guild_tier') {
        return currentUser.tier === 'vip' || currentUser.tier === 'supporter';
      }
      return currentUser.tier !== 'free' || unlockedChannelIds.includes(ch.id);
    }

    if (ch.category === 'supporter_5') {
      return currentUser.tier === 'supporter' || currentUser.tier === 'vip' || unlockedChannelIds.includes(ch.id);
    }

    if (ch.category === 'vip_10') {
      return currentUser.tier === 'vip' || unlockedChannelIds.includes(ch.id);
    }

    return false;
  };

  // Handle channel selection with access verification
  const handleSelectChannel = (ch: BushTVChannel) => {
    if (checkIsChannelUnlocked(ch)) {
      setCurrentChannel(ch);
      setIsMobileChannelDrawerOpen(false);
    } else {
      // Show clean prompt / modal asking to join the tier or pay required drops
      setChannelUnlockPrompt(ch);
    }
  };

  // Unlock channel from prompt using Rain Drops
  const handleUnlockFromPrompt = (ch: BushTVChannel) => {
    const cost = ch.monthly_drops_cost || ch.min_moments_unlock || (ch.category === 'followers' ? 40 : 200);
    if (momentsBalance < cost) {
      openTopUpModal();
      return;
    }
    const success = unlockChannel(ch.id);
    if (success) {
      setCurrentChannel(ch);
      setChannelUnlockPrompt(null);
      setIsMobileChannelDrawerOpen(false);
      showNotice(`💧 Unlocked ${ch.name}! Welcome to the circle.`);
    }
  };

  // Direct user to join creator tier
  const handleJoinTierFromPrompt = (ch: BushTVChannel) => {
    setChannelUnlockPrompt(null);
    setIsMobileChannelDrawerOpen(false);
    navigate(`profile/${ch.host.username || 'danou_van_rensburg'}`);
    showNotice(`Redirecting to @${ch.host.username} guild membership tiers`);
  };

  // Handler to open and save pinned notice
  const handleOpenNoticeEditor = () => {
    if (!canModerateChannel) {
      showNotice('Only channel owners and appointed moderators can update pinned notices');
      return;
    }
    setNoticeEditorText(currentChannel.pinned_notice || '');
    setIsNoticeEditorOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModerateChannel) return;
    pinChannelMessage(currentChannel.id, noticeEditorText.trim() || null);
    setIsNoticeEditorOpen(false);
    showNotice(noticeEditorText.trim() ? '📌 Pinned notice updated!' : '📌 Pinned notice cleared');
  };

  // Message author check
  const isMessageAuthor = (msg: ChatMessage) => {
    if (msg.user_id === currentUser.id) return true;
    if (msg.user?.id === currentUser.id) return true;
    if (
      msg.user?.username &&
      currentUser.username &&
      msg.user.username.toLowerCase() === currentUser.username.toLowerCase()
    ) {
      return true;
    }
    if (
      (currentUser.id === 'user_danou' || currentUser.username === 'danou_van_rensburg') &&
      (msg.user_id === 'user_current' || msg.user_id === 'user_danou' || msg.user?.id === 'user_current' || msg.user?.id === 'user_danou')
    ) {
      return true;
    }
    return false;
  };

  const isMessagePinnedToHeader = (msg: ChatMessage) => {
    if (!currentChannel.pinned_notice) return false;
    const cleanContent = msg.content.trim().slice(0, 30);
    return currentChannel.pinned_notice.includes(cleanContent);
  };

  const handleTogglePinMessage = (msg: ChatMessage) => {
    if (!canModerateChannel) {
      showNotice('Only channel owners and appointed moderators can pin messages');
      return;
    }
    const isPinned = isMessagePinnedToHeader(msg);
    if (isPinned) {
      pinChannelMessage(currentChannel.id, null);
      showNotice('📌 Message unpinned from channel header');
    } else {
      pinChannelMessage(currentChannel.id, `${msg.user.full_name}: "${msg.content}"`);
      showNotice('📌 Message pinned to the top of Bush TV stream header!');
    }
    setActiveMenuMessageId(null);
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessage({ id: msg.id, content: msg.content });
    setActiveMenuMessageId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage || !editingMessage.content.trim()) return;
    editMessage(currentChannel.id, editingMessage.id, editingMessage.content.trim());
    setEditingMessage(null);
    showNotice('✏️ Message updated successfully');
  };

  const handleStartDelete = (messageId: string) => {
    setDeletingMessageId(messageId);
    setActiveMenuMessageId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingMessageId) {
      const msgToDelete = (messages[currentChannel.id] || []).find(m => m.id === deletingMessageId);
      if (msgToDelete && isMessagePinnedToHeader(msgToDelete)) {
        pinChannelMessage(currentChannel.id, null);
      }
      deleteMessage(currentChannel.id, deletingMessageId);
      setDeletingMessageId(null);
      showNotice('🗑️ Message deleted');
    }
  };

  const handleCopyLink = (msg: ChatMessage) => {
    const url = `${window.location.origin}/#bushtv_${currentChannel.id}_msg_${msg.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setActiveMenuMessageId(null);
    showNotice('🔗 Message link copied to clipboard!');
  };

  const handleReportMessage = (msg: ChatMessage) => {
    submitReport({
      content_type: 'bush_tv_chat',
      content_id: msg.id,
      title: `Bush TV Live Chat #${currentChannel.name}`,
      content_snippet: msg.content,
      media_urls: msg.image_url ? [msg.image_url] : undefined,
      author_id: msg.user.id,
      author_name: msg.user.full_name,
      author_username: msg.user.username,
      author_avatar: msg.user.avatar_url,
      author_badge: msg.user.badge,
      reported_by_id: currentUser.id,
      reported_by_name: currentUser.full_name,
      reported_by_username: currentUser.username,
      reason: 'Reported by live viewer: Unsolicited spam, offensive language, or stream disruption',
      severity: 'high'
    });
    setActiveMenuMessageId(null);
    showNotice('🚩 Message reported to stream moderators. Thank you!');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessages = messages[currentChannel.id] || [];

  const isChannelUnlocked = checkIsChannelUnlocked(currentChannel);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, currentChannel.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedImage) return;

    sendMessage(currentChannel.id, messageText.trim(), {
      imageUrl: attachedImage || undefined
    });

    setMessageText('');
    setAttachedImage(null);
  };

  const handleInsertEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  const handleAddSampleImage = (url: string) => {
    setAttachedImage(url);
    setShowImagePrompt(false);
  };

  const categories = [
    { key: 'public', label: '🪵 Public Firesides', subtitle: 'Open to all earth stewards' },
    { key: 'followers', label: '🌿 Guild Exclusive', subtitle: 'Followers & guild circle' },
    { key: 'supporter_5', label: '🔥 $5 Supporter Tier', subtitle: 'CAD diagrams & technical schematics' },
    { key: 'vip_10', label: '⭐ $10 VIP Tier', subtitle: 'Direct site design mentorship' }
  ];

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-108px)] sm:min-h-[calc(100vh-116px)] w-full bg-neutral-50 dark:bg-[#070b09] text-neutral-900 dark:text-stone-100 transition-colors">
      {/* 1. LEFT SIDEBAR: CATEGORIZED CHANNELS (Desktop view, hidden on mobile by default) */}
      <aside className="hidden md:flex md:w-80 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c120f] flex-col sticky top-[108px] sm:top-[116px] h-[calc(100vh-108px)] sm:h-[calc(100vh-116px)] transition-colors">
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Flame className="h-4 w-4 animate-flame" />
              </div>
              <h2 className="font-bold text-neutral-900 dark:text-stone-100 text-sm tracking-tight">Bush TV Circles</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-stone-800 text-neutral-600 dark:text-stone-400 border border-neutral-200 dark:border-stone-700">
              {channels.length} Rooms
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Search fireside channels..."
              value={channelSearch}
              onChange={e => setChannelSearch(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-stone-200 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Create Channel Action Button */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                openAuthModal();
                return;
              }
              setIsCreateChannelModalOpen(true);
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 active:scale-[0.98] text-stone-950 font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create Channel</span>
          </button>
        </div>

        {/* Channel Category Lists */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {categories.map(cat => {
            const catChannels = filteredChannels.filter(c => c.category === cat.key);
            if (catChannels.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="px-2 pb-1">
                  <p className="text-xs font-bold text-neutral-800 dark:text-stone-300 tracking-wide">{cat.label}</p>
                  <p className="text-[10px] text-stone-500">{cat.subtitle}</p>
                </div>

                <div className="space-y-0.5">
                  {catChannels.map(ch => {
                    const isSelected = ch.id === currentChannel.id;
                    const isLocked = !checkIsChannelUnlocked(ch);

                    return (
                      <div
                        key={ch.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectChannel(ch)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectChannel(ch);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 shadow-sm font-semibold'
                            : 'text-neutral-700 dark:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800/80 hover:text-neutral-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`profile/${ch.host.username}`);
                            }}
                            className="shrink-0 p-0.5 rounded-md hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer"
                            title={`Host: @${ch.host.username}`}
                          >
                            <img
                              src={ch.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                              alt={ch.host.full_name}
                              className="h-4 w-4 rounded-full object-cover ring-1 ring-amber-500/30"
                            />
                          </button>
                          <span className={`text-sm ${isSelected ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-stone-400 dark:text-stone-500'}`}>
                            #
                          </span>
                          <span className="truncate text-xs font-medium">{ch.name.replace('#', '')}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isLocked ? (
                            <span className="flex items-center text-amber-500" title="Locked Tier Channel">
                              <Lock className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-[10px] text-stone-500 dark:text-stone-400 group-hover:text-amber-500 font-mono">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{ch.active_viewers_count}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Rain Drops quick balance & plant the rain trigger */}
        <div className="p-3 border-t border-neutral-200 dark:border-stone-800 bg-neutral-100/80 dark:bg-stone-950/60">
          <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Rain Drops 💧</p>
              <div className="flex items-center space-x-1.5 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm">
                <span>💧</span>
                <span>{momentsBalance.toLocaleString()}</span>
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                  ({(momentsBalance / 500).toFixed(1)} 🪣)
                </span>
              </div>
            </div>

            <button
              onClick={openTopUpModal}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 text-xs font-bold shadow hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1"
            >
              <span>🌧️</span>
              <span>Plant the Rain</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE CHANNEL SELECTOR DRAWER / MODAL OVERLAY */}
      {isMobileChannelDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileChannelDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-stone-900 border-r border-neutral-200 dark:border-stone-800 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-stone-800 flex items-center justify-between bg-neutral-100/90 dark:bg-stone-950/90">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Flame className="h-4 w-4 animate-flame" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900 dark:text-stone-100 text-sm tracking-tight">Bush TV Circles</h2>
                  <p className="text-[10px] text-stone-500 font-mono">{channels.length} Live Fireside Rooms</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileChannelDrawerOpen(false)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 hover:bg-neutral-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close channel selector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Search & Create Channel Action */}
            <div className="p-3 border-b border-neutral-200 dark:border-stone-800 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  placeholder="Search fireside channels..."
                  value={channelSearch}
                  onChange={e => setChannelSearch(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-stone-200 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthModal();
                    return;
                  }
                  setIsMobileChannelDrawerOpen(false);
                  setIsCreateChannelModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 active:scale-[0.98] text-stone-950 font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Create Channel</span>
              </button>
            </div>

            {/* Drawer Channel List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              {categories.map(cat => {
                const catChannels = filteredChannels.filter(c => c.category === cat.key);
                if (catChannels.length === 0) return null;

                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="px-2 pb-1">
                      <p className="text-xs font-bold text-neutral-800 dark:text-stone-300 tracking-wide">{cat.label}</p>
                      <p className="text-[10px] text-stone-500">{cat.subtitle}</p>
                    </div>

                    <div className="space-y-1">
                      {catChannels.map(ch => {
                        const isSelected = ch.id === currentChannel.id;
                        const isLocked = !checkIsChannelUnlocked(ch);

                        return (
                          <div
                            key={ch.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectChannel(ch)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectChannel(ch);
                              }
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-sm font-semibold'
                                : 'text-neutral-700 dark:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800/80 hover:text-neutral-900 dark:hover:text-stone-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsMobileChannelDrawerOpen(false);
                                  navigate(`profile/${ch.host.username}`);
                                }}
                                className="shrink-0 p-0.5 rounded-md hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer"
                                title={`Host: @${ch.host.username}`}
                              >
                                <img
                                  src={ch.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                  alt={ch.host.full_name}
                                  className="h-5 w-5 rounded-full object-cover ring-1 ring-amber-500/30"
                                />
                              </button>
                              <span className={`text-sm ${isSelected ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-stone-400 dark:text-stone-500'}`}>
                                #
                              </span>
                              <span className="truncate text-xs font-semibold">{ch.name.replace('#', '')}</span>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                              {isLocked ? (
                                <span className="flex items-center text-amber-500" title="Locked Tier Channel">
                                  <Lock className="h-3 w-3" />
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1 text-[10px] text-stone-500 dark:text-stone-400 group-hover:text-amber-500 font-mono">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>{ch.active_viewers_count}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer: Rain Drops quick balance */}
            <div className="p-3 border-t border-neutral-200 dark:border-stone-800 bg-neutral-100/90 dark:bg-stone-950/80">
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-500">Rain Drops 💧</p>
                  <div className="flex items-center space-x-1.5 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs">
                    <span>💧</span>
                    <span>{momentsBalance.toLocaleString()}</span>
                    <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                      ({(momentsBalance / 500).toFixed(1)} 🪣)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileChannelDrawerOpen(false);
                    openTopUpModal();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 text-xs font-bold shadow hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>🌧️</span>
                  <span>Plant Rain</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN FIRESIDE CHAT VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-[#070b09] relative transition-colors">
        {/* Full-Width 100% Solid & Opaque Sticky Channel Header */}
        <header className="sticky top-[108px] sm:top-[116px] z-30 w-full bg-neutral-100 dark:bg-neutral-950 py-2 px-3 border-b border-neutral-200 dark:border-neutral-800 shadow-md flex items-center justify-between shrink-0 gap-2 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 overflow-hidden">
            {/* Sleek Channel Switcher: '💬 Switch Channel' */}
            <button
              type="button"
              onClick={() => setIsMobileChannelDrawerOpen(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-[0.98] border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              title="Open channel drawer to switch circles"
            >
              <span>💬</span>
              <span className="hidden xs:inline">Switch Channel</span>
              <span className="xs:hidden">Switch</span>
            </button>

            <div className="min-w-0 flex items-center space-x-1.5 sm:space-x-2 overflow-hidden">
              {/* Active Channel Tag e.g. #soil-building with truncation for narrow widths */}
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-neutral-900 dark:text-white max-w-[120px] sm:max-w-xs md:max-w-md truncate flex items-center space-x-0.5 font-mono tracking-tight shrink-0">
                <span className="text-amber-500 dark:text-amber-400">#</span>
                <span className="truncate">{currentChannel.name.replace(/^#/, '')}</span>
              </h1>

              {/* Category Badge with truncation */}
              <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono uppercase font-semibold shrink-0 truncate max-w-[90px] sm:max-w-none ${
                currentChannel.category === 'public'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                  : currentChannel.category === 'followers'
                  ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/40'
                  : currentChannel.category === 'supporter_5'
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                  : 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40'
              }`}>
                {currentChannel.category === 'public' && 'PUBLIC FIRE'}
                {currentChannel.category === 'followers' && 'GUILD EXCLUSIVE'}
                {currentChannel.category === 'supporter_5' && '$5 SUPPORTER'}
                {currentChannel.category === 'vip_10' && '$10 VIP'}
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {/* Active Member Count: 👥 28 */}
            <button
              onClick={() => setShowPresenceSidebar(!showPresenceSidebar)}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                showPresenceSidebar
                  ? 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white'
                  : 'border-neutral-300 dark:border-neutral-800 text-stone-700 dark:text-stone-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70'
              }`}
              title="View Stewards Present"
            >
              <span className="text-amber-500 dark:text-amber-400 text-xs">👥</span>
              <span className="font-mono text-neutral-800 dark:text-stone-200 font-semibold">{currentChannel.active_viewers_count}</span>
            </button>
          </div>
        </header>

        {/* LOCKED CHANNEL OVERLAY vs REAL-TIME MESSAGE FEED */}
        {!isChannelUnlocked ? (
          <div className="flex-1 overflow-y-auto pt-3 px-3 sm:px-6 pb-6 flex items-center justify-center bg-stone-100/95 dark:bg-[#070b09]/95 backdrop-blur-sm">
            <div className="max-w-md w-full rounded-3xl border border-amber-500/40 bg-white/95 dark:bg-neutral-900/90 p-8 text-center shadow-xl dark:shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl" />
              
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 mb-4">
                <Lock className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-stone-100">
                {currentChannel.category === 'followers' ? 'Guild Exclusive Circle' : 'Locked Tier Channel'}
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                <strong className="text-amber-600 dark:text-amber-300 font-semibold">{currentChannel.name}</strong>{' '}
                {currentChannel.category === 'followers' ? (
                  currentChannel.access_requirement_type === 'monthly_drops' ? (
                    <>requires a monthly toll of <strong className="text-cyan-600 dark:text-cyan-400 font-bold">💧 {currentChannel.monthly_drops_cost || 40} Rain Drops</strong> to participate.</>
                  ) : (
                    <>is exclusive to active <strong className="text-amber-700 dark:text-amber-400 font-bold">{currentChannel.required_tier_name || 'Guild Member Tier'}</strong> subscribers.</>
                  )
                ) : (
                  <>is restricted to {currentChannel.category === 'supporter_5' ? '$5 Supporter Tier' : '$10 VIP Circle'} members.</>
                )}
              </p>

              {/* Creator Card on Locked Screen */}
              <div className="mt-4 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-inner">
                <div className="flex items-center space-x-3 text-left">
                  <button
                    type="button"
                    onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                    className="shrink-0 cursor-pointer group"
                    title={`View @${currentChannel.host.username}`}
                  >
                    <img
                      src={currentChannel.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={currentChannel.host.full_name}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-amber-500/40 group-hover:scale-105 group-hover:ring-amber-500 transition-all"
                    />
                  </button>
                  <div className="truncate">
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-xs font-bold text-neutral-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left block cursor-pointer truncate"
                    >
                      {currentChannel.host.full_name}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 font-mono hover:underline cursor-pointer block text-left"
                    >
                      @{currentChannel.host.username}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow transition-all cursor-pointer shrink-0"
                >
                  View Profile
                </button>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-stone-300 space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>Access full CAD designs &amp; site contour masterclasses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>
                    Direct Q&amp;A with{' '}
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      {currentChannel.host.full_name}
                    </button>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>Downloadable seed lists &amp; engineering schematics</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 space-y-3">
                {currentChannel.category === 'followers' && currentChannel.access_requirement_type === 'guild_tier' ? (
                  <button
                    onClick={() => handleJoinTierFromPrompt(currentChannel)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-950/20 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🌿</span>
                    <span>Join {currentChannel.required_tier_name || 'Guild Tier'}</span>
                  </button>
                ) : (
                  <button
                    onClick={openTopUpModal}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-sm shadow-xl shadow-emerald-950/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🌧️</span>
                    <span>Plant the Rain - 1 Water Bucket 🪣 (500 💧)</span>
                  </button>
                )}

                {(() => {
                  const unlockCost = currentChannel.monthly_drops_cost || currentChannel.min_moments_unlock || (currentChannel.category === 'followers' ? 40 : 200);
                  const hasEnough = momentsBalance >= unlockCost;

                  return hasEnough ? (
                    <button
                      onClick={() => handleUnlockFromPrompt(currentChannel)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                      <span>
                        Unlock With {unlockCost} Rain Drops 💧 ({((unlockCost) / 500).toFixed(2)} 🪣)
                      </span>
                    </button>
                  ) : (
                    <p className="text-[11px] text-stone-500">
                      Unlock requires {unlockCost} Rain Drops 💧 (Your balance: {momentsBalance.toLocaleString()} 💧 • {(momentsBalance / 500).toFixed(1)} 🪣)
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* UNLOCKED: CHAT MESSAGE FEED & PINNED HEADER STRIP */
          <div className="flex-1 pt-3 px-3 sm:px-6 pb-6 space-y-3.5 w-full">
            {/* Compact Host Info & Pinned Channel Announcement Strip */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 sm:px-5 py-2.5 w-full shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-6xl">
                {/* Host Info */}
                <div className="flex items-center space-x-2.5 text-left min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                    className="shrink-0 group cursor-pointer"
                    title={`View @${currentChannel.host.username}`}
                  >
                    <img
                      src={currentChannel.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={currentChannel.host.full_name}
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl object-cover ring-1 ring-amber-500/50 group-hover:ring-amber-400 group-hover:scale-105 transition-all shadow-sm"
                    />
                  </button>

                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden xs:inline">Host:</span>
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer truncate"
                    >
                      {currentChannel.host.full_name}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 font-mono hover:underline cursor-pointer truncate"
                    >
                      @{currentChannel.host.username}
                    </button>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 hidden sm:inline-block">
                      {currentChannel.host.badge}
                    </span>
                    <span className="text-stone-400 dark:text-stone-600 text-xs hidden sm:inline">•</span>
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer hidden sm:inline"
                    >
                      View Profile →
                    </button>
                    {currentChannel.moderator_ids && currentChannel.moderator_ids.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 hidden sm:inline-flex items-center space-x-1">
                        <span>🛡️</span>
                        <span>{currentChannel.moderator_ids.length} Mod{currentChannel.moderator_ids.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Pinned Notice Display & Moderator Actions */}
                <div className="flex items-center space-x-2">
                  {currentChannel.pinned_notice ? (
                    <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-neutral-800 dark:text-stone-200 shadow-sm flex items-center justify-between gap-2 animate-in fade-in duration-200 min-w-0 flex-1 sm:max-w-md">
                      <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        <Pin className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 shrink-0" />
                        <div className="min-w-0 text-left truncate">
                          <span className="font-semibold text-amber-700 dark:text-amber-400 mr-1 text-[11px]">Notice:</span>
                          <span className="text-[11px] text-neutral-800 dark:text-stone-200 truncate">{currentChannel.pinned_notice}</span>
                        </div>
                      </div>
                      {canModerateChannel && (
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={handleOpenNoticeEditor}
                            className="text-stone-400 hover:text-amber-500 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Edit Notice (Owner/Mod)"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              pinChannelMessage(currentChannel.id, null);
                              showNotice('📌 Pinned notice removed from header');
                            }}
                            className="text-stone-400 hover:text-red-500 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                            title="Unpin Notice (Owner/Mod)"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : canModerateChannel ? (
                    <button
                      type="button"
                      onClick={handleOpenNoticeEditor}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                      title="Set a pinned notice for this channel"
                    >
                      <Pin className="h-3 w-3" />
                      <span>+ Pin Notice</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400 dark:text-stone-500">
                <Flame className="h-10 w-10 text-amber-500/50 mb-3" />
                <p className="text-base font-semibold text-neutral-800 dark:text-stone-300">The fire has just been stoked!</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mt-1">
                  Be the first to share an observation, yield photo, or question in {currentChannel.name}.
                </p>
              </div>
            ) : (
              currentMessages.map(msg => {
                return (
                  <div
                    key={msg.id}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all max-w-3xl shadow-sm"
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 text-left">
                        {/* Clickable Avatar Image */}
                        <button
                          type="button"
                          onClick={() => navigate(`profile/${msg.user.username || 'danou_van_rensburg'}`)}
                          className="shrink-0 cursor-pointer group/avatar"
                          title={`View @${msg.user.username || 'danou_van_rensburg'}`}
                        >
                          <img
                            src={msg.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt={msg.user.full_name}
                            className="h-9 w-9 rounded-xl object-cover ring-1 ring-amber-500/30 group-hover/avatar:ring-amber-500 group-hover/avatar:scale-105 transition-all shadow-sm"
                          />
                        </button>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {/* Clickable Full Name */}
                            <button
                              type="button"
                              onClick={() => navigate(`profile/${msg.user.username || 'danou_van_rensburg'}`)}
                              className="font-bold text-neutral-900 dark:text-stone-100 text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left cursor-pointer"
                            >
                              {msg.user.full_name}
                            </button>
                            {/* Clickable Username */}
                            <button
                              type="button"
                              onClick={() => navigate(`profile/${msg.user.username || 'danou_van_rensburg'}`)}
                              className="text-[11px] text-stone-500 dark:text-stone-400 font-mono hover:text-amber-600 dark:hover:text-amber-400 hover:underline cursor-pointer"
                            >
                              @{msg.user.username}
                            </button>
                            {msg.user.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300">
                                {msg.user.badge}
                              </span>
                            )}
                            {/* Appointed Moderator or Channel Owner Shield Badge */}
                            {(() => {
                              const isOwner =
                                (Boolean(currentChannel.owner_id) && (msg.user_id === currentChannel.owner_id || msg.user?.id === currentChannel.owner_id)) ||
                                msg.user_id === currentChannel.host.id ||
                                msg.user?.id === currentChannel.host.id ||
                                (Boolean(currentChannel.host.username && msg.user?.username) &&
                                  currentChannel.host.username.toLowerCase() === msg.user.username.toLowerCase());

                              const isMod =
                                Boolean(
                                  currentChannel.moderator_ids &&
                                  (currentChannel.moderator_ids.includes(msg.user_id) ||
                                   currentChannel.moderator_ids.includes(msg.user?.id) ||
                                   (msg.user?.username && currentChannel.moderator_ids.some(m => m.toLowerCase() === msg.user.username.toLowerCase())))
                                );

                              if (isOwner) {
                                return (
                                  <span
                                    className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-xs"
                                    title="Channel Owner / Host"
                                  >
                                    <span className="text-xs">🛡️</span>
                                    <span>Owner</span>
                                  </span>
                                );
                              }

                              if (isMod) {
                                return (
                                  <span
                                    className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 shadow-xs"
                                    title="Appointed Moderator"
                                  >
                                    <span className="text-xs">🛡️</span>
                                    <span>Mod</span>
                                  </span>
                                );
                              }

                              return null;
                            })()}
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <p className="text-[11px] text-stone-500 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {msg.is_edited && (
                              <span className="text-[10px] text-stone-400 italic font-mono">(edited)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions: Pinned badge + Clean Three-Dots Option Menu (...) */}
                      <div className="flex items-center space-x-2">
                        {isMessagePinnedToHeader(msg) && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                            <Pin className="h-3 w-3 fill-amber-500" />
                            <span>Pinned</span>
                          </span>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id);
                            }}
                            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                            title="Message options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {activeMenuMessageId === msg.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-1.5 shadow-2xl text-xs z-30 animate-in fade-in zoom-in-95 duration-150"
                            >
                              {/* Channel Owner or Appointed Moderator can pin/unpin notices */}
                              {canModerateChannel && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePinMessage(msg)}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                  >
                                    <Pin className={`h-4 w-4 ${isMessagePinnedToHeader(msg) ? 'text-amber-500 fill-amber-500' : 'text-amber-500'}`} />
                                    <span>{isMessagePinnedToHeader(msg) ? 'Unpin from Header' : 'Pin Message'}</span>
                                  </button>
                                  <div className="my-1 border-t border-neutral-200 dark:border-stone-800" />
                                </>
                              )}

                              {/* Author options (Edit, Delete) */}
                              {isMessageAuthor(msg) ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(msg)}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                  >
                                    <Pencil className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                    <span>Edit Message</span>
                                  </button>
                                  <div className="my-1 border-t border-neutral-200 dark:border-stone-800" />
                                  <button
                                    type="button"
                                    onClick={() => handleStartDelete(msg.id)}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-medium text-left"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span>Delete Message</span>
                                  </button>
                                </>
                              ) : (
                                /* Non-author options: Moderator Delete, Copy Link, Report */
                                <>
                                  {canModerateChannel && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStartDelete(msg.id)}
                                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-medium text-left"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                        <span>Delete (Mod)</span>
                                      </button>
                                      <div className="my-1 border-t border-neutral-200 dark:border-stone-800" />
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(msg)}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-neutral-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                  >
                                    <Copy className="h-4 w-4 text-stone-400" />
                                    <span>Copy Link</span>
                                  </button>
                                  <div className="my-1 border-t border-neutral-200 dark:border-stone-800" />
                                  <button
                                    type="button"
                                    onClick={() => handleReportMessage(msg)}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer font-medium text-left"
                                  >
                                    <Flag className="h-4 w-4 text-amber-500" />
                                    <span>Report Message</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message Body Content */}
                    <div className="mt-3 text-sm text-neutral-900 dark:text-stone-300 leading-relaxed break-words whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Attached Image Preview */}
                    {msg.image_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-stone-800 max-w-md bg-neutral-100 dark:bg-stone-950">
                        <img
                          src={msg.image_url}
                          alt="Permaculture attachment"
                          className="w-full max-h-72 object-cover hover:scale-102 transition-transform"
                        />
                      </div>
                    )}

                    {/* MICRO-TIPPING SYSTEM: 3 INSTANT BUTTONS (+20, +60, +100 Rain Drops) */}
                    <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Plant the Rain 🌧️:</span>
                        <button
                          type="button"
                          onClick={() => handleTipMessageWithGrowth(msg.id, 20)}
                          className={`relative flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 shadow-sm overflow-visible cursor-pointer ${
                            growingTipKey === `${msg.id}-20` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                          }`}
                          title="Plant 20 Rain Drops ($0.20 min)"
                        >
                          <WaterGrowthOverlay active={growingTipKey === `${msg.id}-20`} amount={20} />
                          <span>+20</span>
                          <span>💧</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTipMessageWithGrowth(msg.id, 60)}
                          className={`relative flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 shadow-sm overflow-visible cursor-pointer ${
                            growingTipKey === `${msg.id}-60` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                          }`}
                          title="Plant 60 Rain Drops ($0.60)"
                        >
                          <WaterGrowthOverlay active={growingTipKey === `${msg.id}-60`} amount={60} />
                          <span>+60</span>
                          <span>💧</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTipMessageWithGrowth(msg.id, 100)}
                          className={`relative flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 shadow-sm overflow-visible cursor-pointer ${
                            growingTipKey === `${msg.id}-100` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                          }`}
                          title="Plant 100 Rain Drops ($1.00)"
                        >
                          <WaterGrowthOverlay active={growingTipKey === `${msg.id}-100`} amount={100} />
                          <span>+100</span>
                          <span>💧</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTippingMessage(msg);
                            setMsgTipAmount(60);
                            setIsMsgCustomTip(false);
                            setMsgTipSuccess(null);
                            setMsgTipError(null);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Open simplified tip dialog for this message"
                        >
                          <span>💧</span>
                          <span className="hidden sm:inline">Tip</span>
                          <span>+</span>
                        </button>
                      </div>

                      {/* Instant Total Updates & Comments Action */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 text-cyan-800 dark:text-cyan-400 font-mono text-xs font-bold">
                          <span>💧</span>
                          <span>{msg.moments_tipped.toLocaleString()} Drops</span>
                          {msg.moments_tipped >= 500 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-normal">
                              ({(msg.moments_tipped / 500).toFixed(1)} 🪣)
                            </span>
                          )}
                        </div>

                        {/* Comment Action & Counter */}
                        <button
                          type="button"
                          onClick={() => toggleComments(msg.id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            openCommentMessageIds.has(msg.id)
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                              : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800/80 border border-transparent'
                          }`}
                          title="View and post replies to this message"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>💬 Comments ({comments.filter(c => c.post_id === msg.id).length || 0})</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Comment & Nested Reply System for Bush TV chat message */}
                    {openCommentMessageIds.has(msg.id) && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-stone-800/80">
                        <CommentSection
                          targetId={msg.id}
                          targetType="message"
                          targetAuthorUsername={msg.user?.username}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* 3. MESSAGE COMPOSER */}
        {isChannelUnlocked && (
          <div className="sticky bottom-0 z-20 p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors">
            {/* Attached media banner preview */}
            {attachedImage && (
              <div className="mb-2 p-2 rounded-xl bg-neutral-100 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 flex items-center justify-between max-w-sm">
                <div className="flex items-center space-x-2 truncate">
                  <Image className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs text-neutral-700 dark:text-stone-300 truncate">{attachedImage}</span>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-2">
              <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-stone-950 border border-neutral-300 dark:border-stone-800 rounded-2xl p-2 focus-within:border-amber-500/80 transition-colors">
                <input
                  type="text"
                  placeholder={`Speak into ${currentChannel.name}... (YouTube & image links auto-detected)`}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none"
                />

                {/* Quick Permaculture Emoji Tray */}
                <div className="hidden sm:flex items-center space-x-1 text-stone-500 dark:text-stone-400 pr-1">
                  {['💧', '🌱', '🪵', '🔥', '🍄', '🐝', '🌿'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-stone-850 rounded text-xs hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Attach Image Button */}
                <button
                  type="button"
                  onClick={() => setShowImagePrompt(!showImagePrompt)}
                  className="p-2 text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-neutral-200 dark:hover:bg-stone-900 transition-colors"
                  title="Attach Photo or Diagram"
                >
                  <Image className="h-4 w-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!messageText.trim() && !attachedImage}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shadow-md cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Image URL Picker Modal / Tray */}
              {showImagePrompt && (
                <div className="p-3 rounded-2xl bg-white dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 text-xs space-y-2 animate-in fade-in duration-150 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-stone-300">Attach Permaculture Photo:</span>
                    <button onClick={() => setShowImagePrompt(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL (https://...)"
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      className="flex-1 bg-neutral-50 dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 rounded-lg px-2.5 py-1 text-xs text-neutral-900 dark:text-stone-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          handleAddSampleImage(customImageUrl.trim());
                          setCustomImageUrl('');
                        }
                      }}
                      className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
                    >
                      Attach
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80')}
                      className="text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Soil Fungi
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80')}
                      className="text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Guild Harvest
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80')}
                      className="text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Ram Pump Setup
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      {/* 4. RIGHT SIDEBAR: "AROUND THE FIRE" PRESENCE & GUILD PINBOARD */}
      {showPresenceSidebar && (
        <>
          {/* Backdrop on mobile */}
          <div
            onClick={() => setShowPresenceSidebar(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <aside className="fixed md:static inset-y-0 right-0 z-50 md:z-auto w-72 md:w-64 border-l border-neutral-200 dark:border-stone-800 bg-white dark:bg-stone-900/95 flex flex-col shrink-0 animate-in slide-in-from-right duration-200 transition-colors shadow-2xl md:shadow-none">
            <div className="p-4 border-b border-neutral-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-stone-200">
                Around The Fire
              </h3>
            </div>
            <button
              onClick={() => setShowPresenceSidebar(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-4">
            {/* Host Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 mb-2">
                Fireside Host
              </p>
              <div className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800/80 flex items-center space-x-3 shadow-sm text-left">
                {/* Host Clickable Avatar */}
                <button
                  type="button"
                  onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                  className="shrink-0 cursor-pointer group/avatar"
                  title={`View @${currentChannel.host.username}`}
                >
                  <img
                    src={currentChannel.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentChannel.host.full_name}
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-amber-500/50 group-hover/avatar:ring-amber-400 group-hover/avatar:scale-105 transition-all shadow-sm"
                  />
                </button>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-xs font-bold text-neutral-900 dark:text-stone-200 truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left block cursor-pointer"
                    >
                      {currentChannel.host.full_name}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer ml-1 shrink-0"
                    >
                      Profile →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`profile/${currentChannel.host.username}`)}
                    className="text-[10px] text-stone-500 dark:text-stone-400 font-mono hover:text-amber-500 transition-colors text-left block cursor-pointer truncate"
                  >
                    @{currentChannel.host.username}
                  </button>
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">{currentChannel.host.badge}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 mb-2">
                Stewards Present ({currentChannel.active_viewers_count})
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    name: currentUser.full_name,
                    username: currentUser.username,
                    avatar: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    badge: currentUser.badge || 'You',
                    isMe: true
                  },
                  {
                    name: 'Dr. Elena Rostova',
                    username: 'elena_biochar',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
                    badge: 'Soil Doctor'
                  },
                  {
                    name: 'Kai Fernandez',
                    username: 'kai_offgrid',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                    badge: 'Off-Grid Tech'
                  },
                  {
                    name: 'Geoff & Nadia Calder',
                    username: 'geoff_earthworks',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                    badge: 'Keyline Surveyor'
                  },
                  {
                    name: 'Willow Sage',
                    username: 'willow_permaculture',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    badge: 'Guild Builder'
                  }
                ].map((steward, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-200/80 dark:hover:bg-stone-800/80 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {/* Clickable Participant Avatar */}
                      <button
                        type="button"
                        onClick={() => navigate(`profile/${steward.username}`)}
                        className="relative shrink-0 cursor-pointer group/avatar"
                        title={`View @${steward.username}`}
                      >
                        <img
                          src={steward.avatar}
                          alt={steward.name}
                          className="h-7 w-7 rounded-lg object-cover ring-1 ring-stone-300 dark:ring-stone-700 group-hover/avatar:ring-amber-500 transition-all shadow-sm"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-stone-900" />
                      </button>

                      {/* Clickable Participant Name and Username */}
                      <div className="truncate">
                        <button
                          type="button"
                          onClick={() => navigate(`profile/${steward.username}`)}
                          className={`text-xs font-bold truncate block text-left cursor-pointer hover:text-amber-500 transition-colors ${
                            steward.isMe ? 'text-amber-700 dark:text-amber-300' : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {steward.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`profile/${steward.username}`)}
                          className="text-[10px] text-stone-500 dark:text-stone-400 font-mono hover:text-amber-500 hover:underline block text-left cursor-pointer"
                        >
                          @{steward.username}
                        </button>
                      </div>
                    </div>

                    <span className="text-[9px] text-stone-500 dark:text-stone-400 font-mono bg-stone-100 dark:bg-stone-950 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-800 shrink-0">
                      {steward.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Tags & Guild Resources */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 mb-2">
                Channel Topics
              </p>
              <div className="flex flex-wrap gap-1 px-1">
                {currentChannel.topic_tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400 text-[10px] border border-stone-200 dark:border-stone-800 shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
        </>
      )}

      {/* Floating Toast Notice */}
      {toastNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-500/50 shadow-2xl text-stone-900 dark:text-stone-100 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Pencil className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">Edit Message</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <textarea
                value={editingMessage.content}
                onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                rows={4}
                className="w-full rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                placeholder="Update your message..."
                autoFocus
              />
              <div className="flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingMessage.content.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {deletingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full rounded-3xl bg-white dark:bg-stone-900 border border-red-500/30 p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">Delete Message</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Are you sure you want to delete this message from {currentChannel.name}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMessageId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Message Tip Modal (No fee split breakdown, clean action buttons) */}
      {tippingMessage && (
        <div
          onClick={() => setTippingMessage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-5 shadow-2xl text-neutral-900 dark:text-stone-100 text-left space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-lg shadow-inner">
                  💧
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-sm flex items-center space-x-1.5">
                    <span>Plant Rain Drops</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                      Message
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-stone-400 font-mono">
                    To <span className="text-cyan-600 dark:text-cyan-300 font-semibold">@{tippingMessage.user?.username || 'member'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTippingMessage(null)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Snippet */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-stone-950/80 border border-neutral-200 dark:border-stone-800/80 space-y-1.5">
              <p className="text-xs text-neutral-700 dark:text-stone-300 italic line-clamp-2">
                &ldquo;{tippingMessage.content}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-200 dark:border-stone-800/60 font-mono">
                <span className="text-neutral-500 dark:text-stone-400">Total drops on message:</span>
                <span className="inline-flex items-center space-x-1 font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800/50">
                  <span>💧</span>
                  <span>{(tippingMessage.moments_tipped || 0).toLocaleString()} Drops</span>
                </span>
              </div>
            </div>

            {/* Preset Amount Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-stone-300 block">
                Select Tip Amount (Min 20 Drops)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[20, 40, 100].map((amt) => {
                  const isSelected = !isMsgCustomTip && msgTipAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setMsgTipAmount(amt);
                        setIsMsgCustomTip(false);
                        setMsgTipError(null);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                          : 'bg-neutral-100 dark:bg-stone-800/80 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-800 dark:text-stone-200 border border-neutral-200 dark:border-stone-700/80'
                      }`}
                    >
                      <span className="text-xs">💧</span>
                      <span>{amt}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setIsMsgCustomTip(true);
                    setMsgTipError(null);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isMsgCustomTip
                      ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                      : 'bg-neutral-100 dark:bg-stone-800/80 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-800 dark:text-stone-200 border border-neutral-200 dark:border-stone-700/80'
                  }`}
                >
                  <span className="text-xs">✏️</span>
                  <span className="text-[11px]">Custom</span>
                </button>
              </div>

              {/* Custom Input */}
              {isMsgCustomTip && (
                <div className="pt-1 space-y-1.5 animate-in fade-in duration-150">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs">💧</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={msgCustomInput}
                      onChange={(e) => {
                        setMsgCustomInput(e.target.value.replace(/[^0-9]/g, ''));
                        setMsgTipError(null);
                      }}
                      placeholder="Enter amount (e.g. 60, 80, 120)"
                      autoFocus
                      className="w-full pl-8 pr-16 py-2 rounded-xl bg-white dark:bg-stone-950 border border-cyan-500/50 text-neutral-900 dark:text-stone-100 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-neutral-400 dark:text-stone-400 font-mono">
                      Drops
                    </span>
                  </div>

                  {(() => {
                    const parsed = parseInt(msgCustomInput, 10);
                    if (!msgCustomInput.trim() || isNaN(parsed)) {
                      return (
                        <div className="flex items-center space-x-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1.5 rounded-xl font-mono">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>Please enter an amount in multiples of 20 (e.g. 20, 40, 60)</span>
                        </div>
                      );
                    }
                    if (parsed < 20) {
                      return (
                        <div className="flex items-center space-x-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1.5 rounded-xl font-mono">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>Minimum tip is 20 Rain Drops ($0.20 USD)</span>
                        </div>
                      );
                    }
                    if (parsed % 20 !== 0) {
                      const rounded = Math.max(20, Math.round(parsed / 20) * 20);
                      return (
                        <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1.5 rounded-xl font-mono">
                          <div className="flex items-center space-x-1.5 truncate pr-2">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span className="truncate">Tips must be in multiples of 20 Rain Drops (e.g. 20, 40, 60)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMsgCustomInput(rounded.toString());
                              setMsgTipError(null);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-[10px] hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                          >
                            Round to {rounded}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            {/* Tip Summary: User Giving Wallet Balance and Selected Tip Amount Only */}
            {(() => {
              const parsed = parseInt(msgCustomInput, 10);
              const effectiveAmount = isMsgCustomTip
                ? (!isNaN(parsed) ? parsed : 0)
                : msgTipAmount;
              const userBalance = givingWalletBalance ?? momentsBalance;
              const hasEnoughBalance = userBalance >= effectiveAmount;

              return (
                <>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-stone-950/70 border border-neutral-200 dark:border-stone-800/70 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-800 dark:text-stone-300">
                      <span className="text-neutral-500 dark:text-stone-400 font-sans">Tip Amount:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-300 text-sm">
                        💧 {effectiveAmount.toLocaleString()} Drops
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500 dark:text-stone-400 pt-1 border-t border-neutral-200 dark:border-stone-800/60 text-[11px]">
                      <span className="font-sans">Giving Wallet Balance:</span>
                      <div className="flex items-center space-x-2">
                        <span className={hasEnoughBalance ? 'text-neutral-800 dark:text-stone-200' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                          💧 {userBalance.toLocaleString()} Drops
                        </span>
                        {!hasEnoughBalance && (
                          <button
                            type="button"
                            onClick={() => {
                              setTippingMessage(null);
                              openTopUpModal();
                            }}
                            className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            Top up
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {msgTipError && (
                    <div className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-2 rounded-xl">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{msgTipError}</span>
                    </div>
                  )}

                  {msgTipSuccess && (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-2 rounded-xl animate-in fade-in duration-150">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="font-bold">{msgTipSuccess}</span>
                    </div>
                  )}

                  {/* Actions: Primary Action & Simple Cancel */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setTippingMessage(null)}
                      className="flex-1 py-2 rounded-xl bg-neutral-100 dark:bg-stone-800 hover:bg-neutral-200 dark:hover:bg-stone-700 text-neutral-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={false}
                      onClick={handleConfirmMessageTip}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                    >
                      <span>💧</span>
                      <span>Tip {effectiveAmount} Drops</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      {/* Pinned Notice Editor Modal (Owner & Appointed Moderators) */}
      {isNoticeEditorOpen && (
        <div
          onClick={() => setIsNoticeEditorOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Pin className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-base">Channel Pinned Notice</h3>
                  <p className="text-[11px] text-stone-500">Visible to all stewards at the top of {currentChannel.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoticeEditorOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-stone-300 mb-1.5">
                  Announcement / Notice Text
                </label>
                <textarea
                  value={noticeEditorText}
                  onChange={(e) => setNoticeEditorText(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 p-3 text-xs text-neutral-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  placeholder="e.g. Live swale teardown stream starting at 4 PM UTC. Bring your contour maps!"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {currentChannel.pinned_notice ? (
                  <button
                    type="button"
                    onClick={() => {
                      pinChannelMessage(currentChannel.id, null);
                      setIsNoticeEditorOpen(false);
                      showNotice('📌 Pinned notice cleared');
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Clear Notice
                  </button>
                ) : <div />}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNoticeEditorOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer shadow-sm"
                  >
                    Save Notice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Channel Creation Modal */}
      {isCreateChannelModalOpen && (
        <div
          onClick={() => setIsCreateChannelModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <Flame className="h-5 w-5 animate-flame" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-base">Create New Channel</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Stoke a new fireside room for your permaculture guild or project
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateChannelModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              {/* Channel Name & Slug Formatter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200">
                  Channel Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. Soil Health, Compost Microbes, Water Swales"
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
                />
                {/* Real-time slug formatter preview */}
                <div className="flex items-center space-x-2 text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <span className="text-stone-500">Preview:</span>
                  <strong className="font-bold">
                    {formatSlug(newChannelName) ? `#${formatSlug(newChannelName)}` : '#soil-health'}
                  </strong>
                </div>
              </div>

              {/* Access Level Toggle: PUBLIC FIRE vs GUILD EXCLUSIVE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewChannelAccessLevel('public')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newChannelAccessLevel === 'public'
                        ? 'bg-emerald-500/15 border-emerald-500 text-neutral-900 dark:text-stone-100 shadow-sm'
                        : 'bg-neutral-50 dark:bg-stone-950 border-neutral-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-neutral-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">PUBLIC FIRE</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Free
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                      Open to all community stewards &amp; visitors
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewChannelAccessLevel('followers')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newChannelAccessLevel === 'followers'
                        ? 'bg-amber-500/15 border-amber-500 text-neutral-900 dark:text-stone-100 shadow-sm'
                        : 'bg-neutral-50 dark:bg-stone-950 border-neutral-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-neutral-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">GUILD EXCLUSIVE</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold">
                        Guild
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                      Restricted to followers &amp; active guild members
                    </p>
                  </button>
                </div>

                {/* Conditional Access Settings Panel when GUILD EXCLUSIVE is selected */}
                {newChannelAccessLevel === 'followers' && (
                  <div className="p-4 mt-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                          Guild Exclusive Access Requirements
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Configure who can enter and participate in this fireside circle
                        </p>
                      </div>
                    </div>

                    {/* Access Requirement Type: Radio/Toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-stone-300">
                        Access Requirement Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAccessRequirementType('guild_tier')}
                          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all text-left ${
                            accessRequirementType === 'guild_tier'
                              ? 'bg-amber-500/20 border-amber-500 text-neutral-900 dark:text-stone-100 font-bold shadow-xs'
                              : 'bg-white dark:bg-stone-900 border-neutral-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-neutral-300'
                          }`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            accessRequirementType === 'guild_tier' ? 'border-amber-500 bg-amber-500' : 'border-stone-400'
                          }`}>
                            {accessRequirementType === 'guild_tier' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span>Required Guild Tier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAccessRequirementType('monthly_drops')}
                          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all text-left ${
                            accessRequirementType === 'monthly_drops'
                              ? 'bg-cyan-500/20 border-cyan-500 text-neutral-900 dark:text-stone-100 font-bold shadow-xs'
                              : 'bg-white dark:bg-stone-900 border-neutral-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-neutral-300'
                          }`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            accessRequirementType === 'monthly_drops' ? 'border-cyan-500 bg-cyan-500' : 'border-stone-400'
                          }`}>
                            {accessRequirementType === 'monthly_drops' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span>Monthly Drops Toll</span>
                        </button>
                      </div>
                    </div>

                    {/* Option A: Required Guild Tier */}
                    {accessRequirementType === 'guild_tier' && (
                      <div className="space-y-1.5 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-stone-300">
                          Select Required Active Tier
                        </label>
                        <select
                          value={selectedTierId}
                          onChange={(e) => setSelectedTierId(e.target.value)}
                          className="w-full rounded-xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 px-3 py-2 text-xs text-neutral-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
                        >
                          {availableGuildTiers.map(tier => (
                            <option key={tier.id} value={tier.id}>
                              {tier.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-stone-500">
                          Stewards must hold this active tier subscription to enter the circle.
                        </p>
                      </div>
                    )}

                    {/* Option B: Monthly Rain Drops Toll */}
                    {accessRequirementType === 'monthly_drops' && (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-neutral-700 dark:text-stone-300">
                            Monthly Rain Drops Toll (Multiples of 20)
                          </label>
                          <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            💧 {monthlyDropsCost} Drops ({((monthlyDropsCost) / 500).toFixed(2)} 🪣)
                          </span>
                        </div>

                        {/* Multiples-of-20 Presets */}
                        <div className="flex flex-wrap gap-1.5">
                          {[20, 40, 60, 100, 200].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setMonthlyDropsCost(amt)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                monthlyDropsCost === amt
                                  ? 'bg-cyan-500 text-stone-950 ring-2 ring-cyan-400 shadow-xs'
                                  : 'bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 text-neutral-700 dark:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800'
                              }`}
                            >
                              {amt} Drops
                            </button>
                          ))}
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            min={20}
                            step={20}
                            value={monthlyDropsCost}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 20;
                              setMonthlyDropsCost(Math.max(20, Math.ceil(val / 20) * 20));
                            }}
                            className="w-full rounded-xl bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 px-3 py-2 text-xs text-neutral-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                            placeholder="e.g. 40"
                          />
                          <span className="absolute right-3 top-2 text-xs font-mono text-stone-400">Drops / mo</span>
                        </div>
                        <p className="text-[10px] text-stone-500">
                          Stewards must pay this recurring Rain Drop toll to participate in this circle.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description / Topic Guidelines */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200">
                  Description / Topic Guidelines
                </label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  rows={2}
                  placeholder="Share what this room is for, discussion topics, and ground rules..."
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 p-3 text-xs text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-medium"
                />
              </div>

              {/* Add Moderators Search & Select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200">
                    Appoint Moderators
                  </label>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {selectedModeratorIds.length} Appointed
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Appointed moderators receive a shield badge (🛡️) and can delete messages or update channel notices.
                </p>

                {/* Selected Moderators Chips */}
                {selectedModeratorIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-neutral-100 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800">
                    {selectedModeratorIds.map(modId => {
                      const modUser = (allUsers || []).find(u => u.id === modId);
                      if (!modUser) return null;
                      return (
                        <span
                          key={modId}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-cyan-500/40 text-neutral-900 dark:text-stone-100 text-xs shadow-xs"
                        >
                          <img
                            src={modUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span className="font-semibold text-[11px] font-mono">@{modUser.username}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedModeratorIds(prev => prev.filter(id => id !== modId))}
                            className="text-stone-400 hover:text-red-500 ml-1 cursor-pointer"
                            title="Remove moderator"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* User Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    value={moderatorSearchQuery}
                    onChange={(e) => setModeratorSearchQuery(e.target.value)}
                    placeholder="Search active members to tag as moderator..."
                    className="w-full bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-stone-200 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Search Candidates List */}
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-2xl border border-neutral-200 dark:border-stone-800 p-1.5 bg-neutral-50/50 dark:bg-stone-950/50">
                  {(() => {
                    const candidates = (allUsers || [])
                      .filter(u => u.id !== currentUser.id && (
                        u.full_name.toLowerCase().includes(moderatorSearchQuery.toLowerCase()) ||
                        u.username.toLowerCase().includes(moderatorSearchQuery.toLowerCase()) ||
                        (u.badge && u.badge.toLowerCase().includes(moderatorSearchQuery.toLowerCase()))
                      ))
                      .slice(0, 5);

                    if (candidates.length === 0) {
                      return (
                        <p className="text-[11px] text-stone-400 text-center py-2">
                          No matching active members found.
                        </p>
                      );
                    }

                    return candidates.map(member => {
                      const isSelected = selectedModeratorIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => {
                            setSelectedModeratorIds(prev =>
                              isSelected ? prev.filter(id => id !== member.id) : [...prev, member.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/15 border border-cyan-500/40 text-neutral-900 dark:text-stone-100'
                              : 'hover:bg-neutral-100 dark:hover:bg-stone-800 text-neutral-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <img
                              src={member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                              alt=""
                              className="h-6 w-6 rounded-lg object-cover"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate leading-tight">{member.full_name}</p>
                              <p className="text-[10px] text-stone-500 font-mono truncate leading-tight">@{member.username}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {member.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                {member.badge}
                              </span>
                            )}
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-cyan-500 text-stone-950'
                                  : 'bg-neutral-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-neutral-300'
                              }`}
                            >
                              {isSelected ? '✓ Appointed' : '+ Mod'}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Creator info reminder */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[11px]">
                  You (<strong className="font-semibold">@{currentUser.username}</strong>) will be assigned as channel <strong className="font-semibold">owner_id</strong> with full moderation privileges.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-neutral-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateChannelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formatSlug(newChannelName)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 active:scale-[0.98] text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Create Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Access Verification & Unlock Prompt Modal */}
      {channelUnlockPrompt && (
        <div
          onClick={() => setChannelUnlockPrompt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-amber-500/40 p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xl shadow-inner">
                  <Lock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-stone-100 text-base flex items-center space-x-1.5">
                    <span>{channelUnlockPrompt.name}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                    {channelUnlockPrompt.category === 'followers' ? 'GUILD EXCLUSIVE' : 'TIER RESTRICTED'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChannelUnlockPrompt(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Channel Info & Host Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-stone-950 border border-neutral-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <img
                  src={channelUnlockPrompt.host.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt=""
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-amber-500/40"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-neutral-900 dark:text-stone-100 truncate">{channelUnlockPrompt.host.full_name}</p>
                  <p className="text-[10px] text-stone-500 font-mono truncate">Host: @{channelUnlockPrompt.host.username}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                {channelUnlockPrompt.host.badge}
              </span>
            </div>

            {/* Requirement Explanation */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
              <p className="text-neutral-800 dark:text-stone-200">
                {channelUnlockPrompt.category === 'followers' ? (
                  channelUnlockPrompt.access_requirement_type === 'monthly_drops' ? (
                    <>
                      This circle requires a monthly contribution of{' '}
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">
                        💧 {channelUnlockPrompt.monthly_drops_cost || 40} Rain Drops
                      </strong>{' '}
                      to participate.
                    </>
                  ) : (
                    <>
                      This circle is exclusive to active{' '}
                      <strong className="text-amber-700 dark:text-amber-400 font-bold">
                        {channelUnlockPrompt.required_tier_name || 'Guild Member Tier'}
                      </strong>{' '}
                      subscribers.
                    </>
                  )
                ) : (
                  <>
                    This circle is restricted to{' '}
                    <strong className="text-amber-700 dark:text-amber-400 font-bold">
                      {channelUnlockPrompt.category === 'supporter_5' ? '$5 Supporter Tier' : '$10 VIP Circle'}
                    </strong>{' '}
                    members.
                  </>
                )}
              </p>

              {channelUnlockPrompt.description && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                  &ldquo;{channelUnlockPrompt.description}&rdquo;
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {channelUnlockPrompt.access_requirement_type === 'monthly_drops' || channelUnlockPrompt.category !== 'followers' ? (
                (() => {
                  const cost = channelUnlockPrompt.monthly_drops_cost || channelUnlockPrompt.min_moments_unlock || 40;
                  const hasEnough = momentsBalance >= cost;

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUnlockFromPrompt(channelUnlockPrompt)}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>💧</span>
                        <span>
                          Pay {cost} Rain Drops to Unlock ({((cost) / 500).toFixed(2)} 🪣)
                        </span>
                      </button>

                      {!hasEnough && (
                        <div className="flex items-center justify-between text-[11px] px-2 text-stone-500">
                          <span>Your balance: 💧 {momentsBalance} Drops</span>
                          <button
                            type="button"
                            onClick={() => {
                              setChannelUnlockPrompt(null);
                              openTopUpModal();
                            }}
                            className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                          >
                            + Top Up Rain Drops
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleJoinTierFromPrompt(channelUnlockPrompt)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 active:scale-[0.98] text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🌿</span>
                    <span>
                      Join {channelUnlockPrompt.required_tier_name || 'Guild Tier'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnlockFromPrompt(channelUnlockPrompt)}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-stone-800 hover:bg-neutral-200 dark:hover:bg-stone-700 text-neutral-800 dark:text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>💧</span>
                    <span>Or Unlock with {(channelUnlockPrompt.min_moments_unlock || 200)} Rain Drops</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setChannelUnlockPrompt(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
