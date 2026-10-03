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
    channels,
    currentChannel,
    setCurrentChannel,
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

  // Host verification for Bush TV pinning: ONLY the Channel Host / Stream Owner can pin messages
  const isChannelHost =
    currentUser.id === currentChannel.host.id ||
    (Boolean(currentUser.username && currentChannel.host.username) &&
      currentUser.username.toLowerCase() === currentChannel.host.username.toLowerCase()) ||
    (currentChannel.host.id === 'user_danou' && (currentUser.id === 'user_current' || currentUser.username === 'danou_van_rensburg'));

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
    if (!isChannelHost) {
      showNotice('Only the Channel Host can pin messages in Bush TV');
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

  const isChannelUnlocked =
    currentChannel.category === 'public' ||
    unlockedChannelIds.includes(currentChannel.id) ||
    (currentChannel.category === 'followers' && currentUser.tier !== 'free') ||
    (currentChannel.category === 'supporter_5' && (currentUser.tier === 'supporter' || currentUser.tier === 'vip')) ||
    (currentChannel.category === 'vip_10' && currentUser.tier === 'vip');

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
    { key: 'followers', label: '🌿 Followers Only', subtitle: 'Community inner circle' },
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
                    const isLocked =
                      ch.category !== 'public' &&
                      !unlockedChannelIds.includes(ch.id) &&
                      !(ch.category === 'followers' && currentUser.tier !== 'free') &&
                      !(ch.category === 'supporter_5' && (currentUser.tier === 'supporter' || currentUser.tier === 'vip')) &&
                      !(ch.category === 'vip_10' && currentUser.tier === 'vip');

                    return (
                      <div
                        key={ch.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setCurrentChannel(ch)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setCurrentChannel(ch);
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

            {/* Drawer Search */}
            <div className="p-3 border-b border-neutral-200 dark:border-stone-800">
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
                        const isLocked =
                          ch.category !== 'public' &&
                          !unlockedChannelIds.includes(ch.id) &&
                          !(ch.category === 'followers' && currentUser.tier !== 'free') &&
                          !(ch.category === 'supporter_5' && (currentUser.tier === 'supporter' || currentUser.tier === 'vip')) &&
                          !(ch.category === 'vip_10' && currentUser.tier === 'vip');

                        return (
                          <div
                            key={ch.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setCurrentChannel(ch);
                              setIsMobileChannelDrawerOpen(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setCurrentChannel(ch);
                                setIsMobileChannelDrawerOpen(false);
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
                {currentChannel.category === 'followers' && 'FOLLOWERS'}
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
                Locked Tier Channel
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                <strong className="text-amber-600 dark:text-amber-300 font-semibold">{currentChannel.name}</strong> is restricted to {currentChannel.category === 'supporter_5' ? '$5 Supporter Tier' : '$10 VIP Circle'} members.
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
                  <span>Access full CAD designs & site contour masterclasses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>
                    Direct Q&A with{' '}
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
                  <span>Downloadable seed lists & engineering schematics</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={openTopUpModal}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-sm shadow-xl shadow-emerald-950/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>🌧️</span>
                  <span>Plant the Rain - 1 Water Bucket 🪣 (500 💧)</span>
                </button>

                {momentsBalance >= (currentChannel.min_moments_unlock || 200) ? (
                  <button
                    onClick={() => unlockChannel(currentChannel.id)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <span>
                      Unlock With {(currentChannel.min_moments_unlock || 200)} Rain Drops 💧 ({(((currentChannel.min_moments_unlock || 200)) / 500).toFixed(1)} 🪣)
                    </span>
                  </button>
                ) : (
                  <p className="text-[11px] text-stone-500">
                    Unlock requires {(currentChannel.min_moments_unlock || 200)} Rain Drops 💧 (Your balance: {momentsBalance.toLocaleString()} 💧 • {(momentsBalance / 500).toFixed(1)} 🪣)
                  </p>
                )}
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
                  </div>
                </div>

                {/* Pinned Notice if present */}
                {currentChannel.pinned_notice && (
                  <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-neutral-800 dark:text-stone-200 shadow-sm flex items-center justify-between gap-2 animate-in fade-in duration-200 min-w-0 flex-1 sm:max-w-md">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      <Pin className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 shrink-0" />
                      <div className="min-w-0 text-left truncate">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 mr-1 text-[11px]">Notice:</span>
                        <span className="text-[11px] text-neutral-800 dark:text-stone-200 truncate">{currentChannel.pinned_notice}</span>
                      </div>
                    </div>
                    {isChannelHost && (
                      <button
                        type="button"
                        onClick={() => {
                          pinChannelMessage(currentChannel.id, null);
                          showNotice('📌 Pinned notice removed from header');
                        }}
                        className="text-stone-400 hover:text-red-500 p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                        title="Unpin notice (Channel Host)"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
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
                              {/* Bush TV Rule: ONLY the Channel Host / Stream Owner can pin messages */}
                              {isChannelHost && (
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

                              {/* Author options (for regular users in Bush TV: Edit, Delete) */}
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
                                /* Viewer options (for other members' messages: Copy Link, Report) */
                                <>
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
    </div>
  );
};
