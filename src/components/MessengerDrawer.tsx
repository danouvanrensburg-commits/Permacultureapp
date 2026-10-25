import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Send,
  Image as ImageIcon,
  Users,
  MessageCircle,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  Paperclip,
  Trash2,
  Maximize2,
  Sparkles,
  Phone,
  Video,
  Info,
  ChevronRight
} from 'lucide-react';
import { useMessenger } from '../context/MessengerContext';
import { usePermaculture } from '../context/PermacultureContext';
import { QUICK_PHOTO_ATTACHMENTS } from '../lib/messenger';
import { MessengerParticipant, MessengerAttachment } from '../types/messenger';

type FilterTab = 'all' | 'direct' | 'group';

export const MessengerDrawer: React.FC = () => {
  const {
    isMessengerOpen,
    closeMessenger,
    threads,
    activeThreadId,
    activeThread,
    activeMessages,
    setActiveThreadId,
    sendMessage,
    createGroupThread,
    createDirectThread,
    deleteThread,
    availableContacts
  } = useMessenger();

  const { currentUser } = usePermaculture();

  // Navigation & View State
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [createMode, setCreateMode] = useState<'direct' | 'group'>('direct');
  
  // Group creation form state
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Composer State
  const [messageText, setMessageText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<MessengerAttachment | null>(null);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeThreadId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, activeMessages]);

  // Reset composer on thread switch
  useEffect(() => {
    setMessageText('');
    setSelectedAttachment(null);
    setIsAttachmentPickerOpen(false);
    setShowThreadInfo(false);
  }, [activeThreadId]);

  if (!isMessengerOpen) return null;

  // Filtered threads
  const filteredThreads = threads.filter(thread => {
    const matchesFilter =
      filterTab === 'all' ||
      (filterTab === 'direct' && thread.type === 'direct') ||
      (filterTab === 'group' && thread.type === 'group');

    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAttachment({
        url: reader.result as string,
        name: file.name,
        type: 'image',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      });
      setIsAttachmentPickerOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Send
  const handleSend = () => {
    if (!activeThreadId) return;
    if (!messageText.trim() && !selectedAttachment) return;

    sendMessage(
      activeThreadId,
      messageText,
      selectedAttachment || undefined
    );

    setMessageText('');
    setSelectedAttachment(null);
    setIsAttachmentPickerOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group creation handler
  const handleCreateGroup = () => {
    if (selectedContactIds.length === 0) return;
    const newId = createGroupThread(
      groupTitle || 'New Study Guild',
      selectedContactIds,
      groupDescription
    );
    setIsCreatingChat(false);
    setGroupTitle('');
    setGroupDescription('');
    setSelectedContactIds([]);
    setActiveThreadId(newId);
  };

  const handleSelectDirectUser = (contact: MessengerParticipant) => {
    const newId = createDirectThread(contact);
    setIsCreatingChat(false);
    setActiveThreadId(newId);
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Dark backdrop overlay */}
      <div
        onClick={closeMessenger}
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Main Slide-over Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] md:w-[520px] bg-[#FBF9F5] dark:bg-[#090e0b] border-l border-[#E7E1D8] dark:border-stone-800 shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 animate-in slide-in-from-right duration-300"
        aria-label="Messenger Drawer"
      >
        {/* ==================================================================== */}
        {/* 1. TOP HEADER */}
        {/* ==================================================================== */}
        <header className="px-4 py-3.5 border-b border-[#E7E1D8] dark:border-stone-800 bg-[#F4EFEA] dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
          {activeThread ? (
            /* Active Thread Header */
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                title="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative shrink-0">
                {activeThread.type === 'group' ? (
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <Users className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={activeThread.avatar || activeThread.participants[0]?.avatar}
                      alt={activeThread.title}
                      className="h-10 w-10 rounded-full object-cover border border-[#E7E1D8] dark:border-stone-700"
                    />
                    {activeThread.participants[0]?.isOnline && (
                      <span
                        className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#090e0b]"
                        title="Online now"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold truncate text-stone-900 dark:text-stone-100">
                  {activeThread.title}
                </h2>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate flex items-center gap-1.5">
                  {activeThread.type === 'group' ? (
                    <span>{activeThread.participants.length} guild members</span>
                  ) : (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {activeThread.participants[0]?.isOnline ? 'Active now' : activeThread.participants[0]?.lastSeen || 'Offline'}
                      </span>
                      {activeThread.participants[0]?.badge && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{activeThread.participants[0].badge}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Thread Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowThreadInfo(!showThreadInfo)}
                  className={`p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors ${
                    showThreadInfo ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white' : ''
                  }`}
                  title="Thread Details & Members"
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeMessenger}
                  className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                  aria-label="Close Messenger"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Threads List Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-stone-950 shadow-xs">
                  <MessageCircle className="h-4 w-4 fill-stone-950/20" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                    Messenger
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingChat(true);
                    setCreateMode('direct');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={closeMessenger}
                  className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                  aria-label="Close Messenger"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ==================================================================== */}
        {/* 2. BODY CONTENT: LIST VIEW vs CHAT VIEW vs CREATION MODAL */}
        {/* ==================================================================== */}
        {isCreatingChat ? (
          /* ================= CREATE NEW CHAT / GROUP VIEW ================= */
          <div className="flex-1 flex flex-col overflow-y-auto p-4 bg-[#FBF9F5] dark:bg-[#090e0b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D8] dark:border-stone-800 mb-4">
              <button
                type="button"
                onClick={() => setIsCreatingChat(false)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <span className="text-sm font-bold">
                {createMode === 'direct' ? 'New Direct Message' : 'Create Guild Group Chat'}
              </span>
              <div className="w-12" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-[#F4EFEA] dark:bg-stone-900 rounded-xl mb-4 border border-[#E7E1D8] dark:border-stone-800">
              <button
                type="button"
                onClick={() => setCreateMode('direct')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  createMode === 'direct'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                1-on-1 Direct Message
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('group')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  createMode === 'group'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Private Group Chat
              </button>
            </div>

            {createMode === 'group' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Group Title
                  </label>
                  <input
                    type="text"
                    value={groupTitle}
                    onChange={e => setGroupTitle(e.target.value)}
                    placeholder="e.g. Swale Earthworks Working Group"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-[#E7E1D8] dark:border-stone-800 focus:outline-none focus:border-emerald-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Topic / Focus (Optional)
                  </label>
                  <input
                    type="text"
                    value={groupDescription}
                    onChange={e => setGroupDescription(e.target.value)}
                    placeholder="e.g. Broadacre soil and keyline swale contour planning"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-[#E7E1D8] dark:border-stone-800 focus:outline-none focus:border-emerald-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            )}

            {/* Contact Selection */}
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                {createMode === 'direct' ? 'Select Member to Message' : 'Select Group Members'}
              </span>

              <div className="space-y-1.5 overflow-y-auto pr-1">
                {availableContacts.map(contact => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        if (createMode === 'direct') {
                          handleSelectDirectUser(contact);
                        } else {
                          setSelectedContactIds(prev =>
                            isSelected ? prev.filter(id => id !== contact.id) : [...prev, contact.id]
                          );
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'border-[#E7E1D8] dark:border-stone-800/80 bg-white dark:bg-stone-900/60 hover:bg-[#F4EFEA] dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="h-9 w-9 rounded-full object-cover border border-[#E7E1D8] dark:border-stone-700"
                          />
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                            {contact.name}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                            {contact.role || contact.badge || `@${contact.username}`}
                          </p>
                        </div>
                      </div>

                      {createMode === 'group' ? (
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-stone-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {createMode === 'group' && (
              <div className="pt-4 border-t border-[#E7E1D8] dark:border-stone-800 mt-4">
                <button
                  type="button"
                  disabled={selectedContactIds.length === 0}
                  onClick={handleCreateGroup}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                >
                  Create Group ({selectedContactIds.length} members)
                </button>
              </div>
            )}
          </div>
        ) : activeThread ? (
          /* ================= 2. ACTIVE CHAT VIEW ================= */
          <div className="flex-1 flex flex-col min-h-0 bg-[#FBF9F5] dark:bg-[#090e0b]">
            
            {/* Thread Info Sidebar / Dropdown */}
            {showThreadInfo && (
              <div className="p-4 bg-[#F4EFEA] dark:bg-stone-900 border-b border-[#E7E1D8] dark:border-stone-800 text-xs space-y-3">
                <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
                  <span>Conversation Details</span>
                  <button
                    type="button"
                    onClick={() => deleteThread(activeThread.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Thread</span>
                  </button>
                </div>

                {activeThread.description && (
                  <p className="text-stone-600 dark:text-stone-400">
                    {activeThread.description}
                  </p>
                )}

                <div>
                  <span className="font-semibold block mb-1 text-stone-700 dark:text-stone-300">
                    Participants ({activeThread.participants.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {activeThread.participants.map(p => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-stone-800 dark:text-stone-200">{p.name}</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          {p.isOnline ? 'Online' : p.lastSeen || 'Offline'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Introduction Banner */}
              <div className="text-center py-4 border-b border-[#E7E1D8]/60 dark:border-stone-800/60 mb-2">
                <div className="inline-flex p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mb-2">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {activeThread.title}
                  </h3>
                  {activeThread.title.includes('Dan') && (
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 font-mono">
                      PERMACULTURE ELDER
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto mt-0.5">
                  {activeThread.title.includes('Dan')
                    ? 'Ask me anything about your garden, soil, or swales—or attach photos for field observations!'
                    : 'End-to-end community fireside messaging. Share field notes, swale diagrams, and soil tests.'}
                </p>

                {/* Quick Permaculture Starter Questions for Dan */}
                {activeThread.title.includes('Dan') && activeMessages.length <= 3 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setMessageText('How do I build a companion planting guild around an apple tree?')}
                      className="text-[10px] bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E7E1D8] dark:border-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      🍎 Apple Tree Guild
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageText('What slope angle do I need for broadacre keyline swales?')}
                      className="text-[10px] bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E7E1D8] dark:border-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      💧 Swale Slope Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageText('How do I balance carbon-to-nitrogen ratios for thermal compost?')}
                      className="text-[10px] bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E7E1D8] dark:border-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      🍂 Compost C:N Ratio
                    </button>
                  </div>
                )}
              </div>

              {activeMessages.map((msg, index) => {
                const isMe = msg.senderId === currentUser.id || msg.senderId === 'user_current';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="h-7 w-7 rounded-full object-cover shrink-0 mb-1 border border-[#E7E1D8] dark:border-stone-700"
                        title={msg.senderName}
                      />
                    )}

                    <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender label in group chats */}
                      {!isMe && activeThread.type === 'group' && (
                        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5 ml-1">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                          isMe
                            ? 'bg-emerald-700 text-white rounded-br-xs'
                            : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-[#E7E1D8] dark:border-stone-800 rounded-bl-xs'
                        }`}
                      >
                        {/* Attached Image */}
                        {msg.attachment && msg.attachment.type === 'image' && (
                          <div className="mb-2 overflow-hidden rounded-xl group relative cursor-pointer">
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.name}
                              className="max-h-56 w-full object-cover rounded-xl transition-transform group-hover:scale-102"
                              onClick={() =>
                                setLightboxImage({
                                  url: msg.attachment!.url,
                                  title: msg.attachment!.name
                                })
                              }
                            />
                            <div
                              onClick={() =>
                                setLightboxImage({
                                  url: msg.attachment!.url,
                                  title: msg.attachment!.name
                                })
                              }
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-stone-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Click to view full photo"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        )}

                        {/* Text */}
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>

                      {/* Time and Read Status */}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 dark:text-stone-500 px-1">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="h-3 w-3 text-emerald-600 inline" />
                            ) : (
                              <Check className="h-3 w-3 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Photo Attachment Picker Drawer / Tray */}
            {isAttachmentPickerOpen && (
              <div className="p-3 bg-[#F4EFEA] dark:bg-stone-900 border-t border-[#E7E1D8] dark:border-stone-800 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                    Attach Photo or Diagram
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAttachmentPickerOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {QUICK_PHOTO_ATTACHMENTS.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedAttachment({
                          url: item.url,
                          name: item.name,
                          type: 'image'
                        });
                        setIsAttachmentPickerOpen(false);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-[#E7E1D8] dark:border-stone-700 text-left hover:border-emerald-600 transition-all cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="h-16 w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-1 bg-stone-900/80 text-white text-[10px] font-medium truncate">
                        {item.title}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Upload from Device */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-dashed border-[#E7E1D8] dark:border-stone-700 hover:border-emerald-600 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Upload Image from Device</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Selected Attachment Preview */}
            {selectedAttachment && (
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={selectedAttachment.url}
                    alt={selectedAttachment.name}
                    className="h-10 w-10 rounded-lg object-cover border border-emerald-300 dark:border-emerald-700"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                      {selectedAttachment.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Ready to send · {selectedAttachment.size || 'Image'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="p-1 text-emerald-700 dark:text-emerald-400 hover:text-red-600"
                  title="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Composer Input Area */}
            <div className="p-3 bg-[#F4EFEA] dark:bg-stone-900 border-t border-[#E7E1D8] dark:border-stone-800">
              <div className="flex items-end gap-2 bg-white dark:bg-stone-950 rounded-2xl border border-[#E7E1D8] dark:border-stone-800 p-2 focus-within:border-emerald-600 transition-colors shadow-2xs">
                {/* Attachment Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAttachmentPickerOpen(!isAttachmentPickerOpen)}
                  className={`p-2 rounded-xl transition-colors ${
                    isAttachmentPickerOpen || selectedAttachment
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'
                  }`}
                  title="Attach photo or swale diagram"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeThread.title}...`}
                  rows={1}
                  className="flex-1 max-h-32 min-h-[36px] py-1.5 px-1 text-xs sm:text-sm bg-transparent resize-none focus:outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!messageText.trim() && !selectedAttachment}
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:hover:bg-emerald-700 disabled:cursor-not-allowed shadow-2xs transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= 3. THREAD LIST VIEW ================= */
          <div className="flex-1 flex flex-col min-h-0 bg-[#FBF9F5] dark:bg-[#090e0b]">
            
            {/* Search & Filter Tabs */}
            <div className="p-3 border-b border-[#E7E1D8] dark:border-stone-800 space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search direct chats and guild members..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-[#E7E1D8] dark:border-stone-800 focus:outline-none focus:border-emerald-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 shadow-2xs"
                />
              </div>

              {/* Segmented Filter Buttons (Zero-pill discipline) */}
              <div className="flex p-0.5 bg-[#F4EFEA] dark:bg-stone-900/80 rounded-xl border border-[#E7E1D8] dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  All Chats
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('direct')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterTab === 'direct'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  1-on-1 Direct
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('group')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterTab === 'group'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Guild Groups
                </button>
              </div>
            </div>

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E7E1D8]/60 dark:divide-stone-800/60">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-stone-400">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    No conversations found
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Start a new direct chat or create a group to begin messaging.
                  </p>
                </div>
              ) : (
                filteredThreads.map(thread => {
                  const hasUnread = thread.unreadCount > 0;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`flex items-center gap-3 p-3.5 hover:bg-[#F4EFEA] dark:hover:bg-stone-900 cursor-pointer transition-colors ${
                        hasUnread ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Avatar with Online Presence Dot */}
                      <div className="relative shrink-0">
                        {thread.type === 'group' ? (
                          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold">
                            <Users className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={thread.avatar || thread.participants[0]?.avatar}
                              alt={thread.title}
                              className="h-12 w-12 rounded-full object-cover border border-[#E7E1D8] dark:border-stone-700"
                            />
                            {thread.participants[0]?.isOnline && (
                              <span
                                className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#090e0b]"
                                title="Online now"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-xs sm:text-sm truncate ${
                              hasUnread
                                ? 'font-extrabold text-stone-950 dark:text-white'
                                : 'font-semibold text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {thread.title}
                          </h4>
                          {thread.lastMessage && (
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {formatMessageTime(thread.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs truncate ${
                              hasUnread
                                ? 'font-semibold text-stone-900 dark:text-stone-100'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {thread.lastMessage?.hasAttachment && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mr-1">
                                <ImageIcon className="h-3 w-3" />
                                Photo ·
                              </span>
                            )}
                            {thread.lastMessage ? thread.lastMessage.text : 'No messages yet'}
                          </p>

                          {hasUnread && (
                            <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shrink-0">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Quick-Start Row */}
            <div className="p-3 bg-[#F4EFEA] dark:bg-stone-900/70 border-t border-[#E7E1D8] dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">
                {availableContacts.filter(c => c.isOnline).length} community members online
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingChat(true);
                  setCreateMode('group');
                }}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Create Guild Group</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Lightbox Photo Preview Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                title="Close photo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
            <div className="p-3 bg-stone-900/90 text-white text-xs font-semibold text-center border-t border-stone-800">
              {lightboxImage.title}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
