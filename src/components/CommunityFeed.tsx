import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import {
  Sprout,
  Droplets,
  Heart,
  MessageCircle,
  Plus,
  Play,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Filter,
  X,
  Lock,
  Loader2,
  Video,
  Send,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Bookmark,
  Copy,
  Flag,
  Check,
  AlertTriangle
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { CommunityPost } from '../types';
import { WaterGrowthOverlay } from './WaterGrowthOverlay';
import { CommentSection } from './CommentSection';
import { TipPostModal } from './TipPostModal';

interface CommunityFeedProps {
  navigate: (route: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ navigate }) => {
  const {
    posts,
    currentUser,
    momentsBalance,
    openTopUpModal,
    tipPost,
    likePost,
    createPost,
    editPost,
    deletePost,
    togglePinPost,
    toggleSavePost,
    isPostSaved,
    followedCreatorIds,
    toggleFollowCreator,
    isFollowingCreator,
    submitReport,
    comments
  } = usePermaculture();

  const [feedScope, setFeedScope] = useState<'following' | 'all'>('following');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<'all' | 'paywalled' | 'supporter'>('all');
  
  // Track open comment sections per post
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Set<string>>(new Set());
  const [selectedPostForTip, setSelectedPostForTip] = useState<CommunityPost | null>(null);

  const toggleComments = (postId: string) => {
    setOpenCommentPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };
  
  // Three-dots menu & Action states
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Watering Economy growth animation state
  const [growingTipKey, setGrowingTipKey] = useState<string | null>(null);

  const handleTipWithGrowth = (postId: string, amount: number) => {
    tipPost(postId, amount);
    const key = `${postId}-${amount}`;
    setGrowingTipKey(key);
    setTimeout(() => {
      setGrowingTipKey(prev => (prev === key ? null : prev));
    }, 1400);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuPostId(null);
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  const showNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Modal state
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);

  // Inline Composer state
  const [inlineCaption, setInlineCaption] = useState('');
  const [inlineImageUrl, setInlineImageUrl] = useState<string | null>(null);
  const [inlineVideoUrl, setInlineVideoUrl] = useState('');
  const [isInlineVideoOpen, setIsInlineVideoOpen] = useState(false);
  const [isInlineCompressing, setIsInlineCompressing] = useState(false);
  const [inlineCompressionInfo, setInlineCompressionInfo] = useState<string | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Composer state
  const [modalCaption, setModalCaption] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalVideoUrl, setModalVideoUrl] = useState('');
  const [isModalVideoOpen, setIsModalVideoOpen] = useState(false);
  const [isModalCompressing, setIsModalCompressing] = useState(false);
  const [modalCompressionInfo, setModalCompressionInfo] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const filterTags = [
    'All',
    'Water Harvesting',
    'Guilds',
    'Composting',
    'Biochar',
    'Food Forest',
    'Off-Grid',
    'Earthworks'
  ];

  // Helper to determine if a post was created by current user
  const isPostFromCurrentUser = (post: CommunityPost) => {
    if (post.author_id === currentUser.id) return true;
    if (post.author?.id === currentUser.id) return true;
    if (
      post.author?.username &&
      currentUser.username &&
      post.author.username.toLowerCase() === currentUser.username.toLowerCase()
    ) {
      return true;
    }
    if (
      (currentUser.id === 'user_danou' || currentUser.username === 'danou_van_rensburg') &&
      (post.author_id === 'user_current' || post.author_id === 'user_danou')
    ) {
      return true;
    }
    return false;
  };

  // Helper to determine if a post was created by a creator the user follows
  const isPostFromFollowedCreator = (post: CommunityPost) => {
    if (followedCreatorIds.includes(post.author_id)) return true;
    if (post.author?.id && followedCreatorIds.includes(post.author.id)) return true;
    return false;
  };

  // Main Community Feed logic:
  // In standard social media feed ('following'), display posts created by current user PLUS followed creators
  const basePosts = feedScope === 'following'
    ? posts.filter(post => isPostFromCurrentUser(post) || isPostFromFollowedCreator(post))
    : posts;

  const filteredPosts = basePosts
    .filter(post => {
      if (filterMode === 'paywalled') {
        const isPaywalled = post.tags?.some(t => t.toLowerCase().includes('paywall') || t.toLowerCase().includes('vip')) || post.moments_harvested > 1000;
        if (!isPaywalled) return false;
      } else if (filterMode === 'supporter') {
        const isSupporter = post.tags?.some(t => t.toLowerCase().includes('supporter')) || post.moments_harvested > 500;
        if (!isSupporter) return false;
      }

      if (selectedTag === 'All') return true;
      return post.tags?.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Video URL parser for YouTube, Vimeo, and direct video links
  const parseVideoUrl = (url?: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // YouTube
    const ytMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return { type: 'youtube' as const, id: ytMatch[1], embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return { type: 'vimeo' as const, id: vimeoMatch[3], embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}` };
    }

    // Direct video file or generic URL
    if (cleanUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || cleanUrl.startsWith('http')) {
      return { type: 'direct' as const, url: cleanUrl };
    }

    return null;
  };

  // Image compression handler using browser-image-compression
  const compressImageFile = async (
    file: File,
    onSuccess: (dataUrl: string, info: string) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };

      const originalKb = (file.size / 1024).toFixed(0);
      const compressedBlob = await imageCompression(file, options);
      const compressedKb = (compressedBlob.size / 1024).toFixed(0);
      const savedPercent = Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100));

      const dataUrl = await imageCompression.getDataUrlFromFile(compressedBlob);
      onSuccess(dataUrl, `Photo compressed: ${originalKb} KB → ${compressedKb} KB (${savedPercent}% saved)`);
    } catch (err) {
      console.warn('Image compression fallback used:', err);
      const reader = new FileReader();
      reader.onload = () => {
        onSuccess(reader.result as string, 'Photo attached');
      };
      reader.readAsDataURL(file);
    } finally {
      setLoading(false);
    }
  };

  // Handle Inline Post Submission
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCaption.trim() && !inlineImageUrl && !inlineVideoUrl.trim()) return;

    createPost({
      content: inlineCaption.trim(),
      mediaUrls: inlineImageUrl ? [inlineImageUrl] : [],
      videoUrl: inlineVideoUrl.trim() || undefined,
      youtubeUrl: parseVideoUrl(inlineVideoUrl)?.type === 'youtube' ? inlineVideoUrl.trim() : undefined
    });

    setInlineCaption('');
    setInlineImageUrl(null);
    setInlineVideoUrl('');
    setIsInlineVideoOpen(false);
    setInlineCompressionInfo(null);
    showNotice('Moment shared to community feed!');
  };

  // Handle Modal Post Submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCaption.trim() && !modalImageUrl && !modalVideoUrl.trim()) return;

    createPost({
      content: modalCaption.trim(),
      mediaUrls: modalImageUrl ? [modalImageUrl] : [],
      videoUrl: modalVideoUrl.trim() || undefined,
      youtubeUrl: parseVideoUrl(modalVideoUrl)?.type === 'youtube' ? modalVideoUrl.trim() : undefined
    });

    setModalCaption('');
    setModalImageUrl(null);
    setModalVideoUrl('');
    setIsModalVideoOpen(false);
    setModalCompressionInfo(null);
    setIsPostComposerOpen(false);
    showNotice('Moment shared to community feed!');
  };

  // Handlers for Three-Dots Option Menu
  const handleTogglePin = (post: CommunityPost) => {
    togglePinPost(post.id);
    setActiveMenuPostId(null);
    showNotice(post.is_pinned ? 'Post unpinned' : '📌 Post pinned to top of profile');
  };

  const handleStartEdit = (post: CommunityPost) => {
    setEditingPost({ id: post.id, content: post.content });
    setActiveMenuPostId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.content.trim()) return;
    editPost(editingPost.id, editingPost.content.trim());
    setEditingPost(null);
    showNotice('✏️ Post updated successfully');
  };

  const handleStartDelete = (postId: string) => {
    setDeletingPostId(postId);
    setActiveMenuPostId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingPostId) {
      deletePost(deletingPostId);
      setDeletingPostId(null);
      showNotice('🗑️ Post deleted');
    }
  };

  const handleToggleSave = (post: CommunityPost) => {
    const saved = toggleSavePost(post.id);
    setActiveMenuPostId(null);
    showNotice(saved ? '🔖 Post saved to your bookmarks' : 'Post removed from saved bookmarks');
  };

  const handleCopyLink = (post: CommunityPost) => {
    const url = `${window.location.origin}/#post_${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setActiveMenuPostId(null);
    showNotice('🔗 Post link copied to clipboard!');
  };

  const handleReportPost = (post: CommunityPost) => {
    submitReport({
      content_type: 'feed_post',
      content_id: post.id,
      title: post.title || 'Community Feed Post',
      content_snippet: post.content,
      media_urls: post.media_urls,
      author_id: post.author.id,
      author_name: post.author.full_name,
      author_username: post.author.username,
      author_avatar: post.author.avatar_url,
      author_badge: post.author.badge,
      reported_by_id: currentUser.id,
      reported_by_name: currentUser.full_name,
      reported_by_username: currentUser.username,
      reason: 'Reported by community reader: Potential policy violation or spam',
      severity: 'medium'
    });
    setActiveMenuPostId(null);
    showNotice('🚩 Post reported to community moderators. Thank you!');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070b09] text-neutral-900 dark:text-stone-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Floating Toast Notice */}
        {toastNotice && (
          <div className="fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-[#0f1714] border border-emerald-500/50 shadow-2xl text-neutral-900 dark:text-stone-100 text-xs font-semibold animate-in slide-in-from-top duration-300">
            <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* TOP TITLE: Your Feed */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#15221d]">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans">
              Your Feed
            </h1>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIMPLIFIED INLINE POST COMPOSER                              */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200 dark:border-[#1b2b24] p-4 sm:p-5 space-y-3 shadow-sm dark:shadow-xl transition-all">
          <form onSubmit={handleInlineSubmit} className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-inner overflow-hidden ring-1 ring-emerald-500/30">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.full_name.charAt(0) || 'U'}</span>
                )}
              </div>

              {/* Single clean Text Area for post caption */}
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={inlineCaption}
                  onChange={e => setInlineCaption(e.target.value)}
                  placeholder="Share a thought or a moment of your day..."
                  className="w-full bg-neutral-50 dark:bg-[#15231e] border border-neutral-200 dark:border-[#1e342c] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-400 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                />
              </div>
            </div>

            {/* Attached Photo Preview with Compression Info */}
            {inlineImageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-stone-950 max-h-60 group">
                <img
                  src={inlineImageUrl}
                  alt="Attachment preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setInlineImageUrl(null);
                    setInlineCompressionInfo(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-stone-900/80 hover:bg-red-500 text-stone-200 hover:text-white transition-colors cursor-pointer shadow-lg"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                {inlineCompressionInfo && (
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-sm border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center space-x-1.5">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>{inlineCompressionInfo}</span>
                  </div>
                )}
              </div>
            )}

            {/* Paste Video Link Input */}
            {isInlineVideoOpen && (
              <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-[#15231e] border border-neutral-200 dark:border-[#1e342c] rounded-xl px-3.5 py-2 text-xs">
                <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input
                  type="url"
                  value={inlineVideoUrl}
                  onChange={e => setInlineVideoUrl(e.target.value)}
                  placeholder="Paste video link (YouTube, Vimeo, or direct link)..."
                  className="flex-1 bg-transparent text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none text-xs"
                />
                {inlineVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setInlineVideoUrl('')}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Hidden Photo File Input with browser-image-compression */}
            <input
              type="file"
              ref={inlineFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  compressImageFile(
                    file,
                    (url, info) => {
                      setInlineImageUrl(url);
                      setInlineCompressionInfo(info);
                    },
                    setIsInlineCompressing
                  );
                }
              }}
            />

            {/* Action Triggers & Publish Button */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-[#15221d]">
              <div className="flex items-center space-x-3 sm:space-x-5 text-xs">
                {/* Upload Photo Button (Compressed) */}
                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  disabled={isInlineCompressing}
                  className="flex items-center space-x-1.5 text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                  title="Upload compressed photo"
                >
                  {isInlineCompressing ? (
                    <Loader2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="font-semibold text-neutral-700 dark:text-stone-300">
                    {isInlineCompressing ? 'Compressing...' : 'Upload Photo'}
                  </span>
                </button>

                {/* Paste Video Link Button */}
                <button
                  type="button"
                  onClick={() => setIsInlineVideoOpen(prev => !prev)}
                  className={`flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isInlineVideoOpen ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                  title="Paste video link"
                >
                  <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-neutral-700 dark:text-stone-300">Paste Video Link</span>
                </button>
              </div>

              {/* Submit Button: Post Moment */}
              <button
                type="submit"
                disabled={(!inlineCaption.trim() && !inlineImageUrl && !inlineVideoUrl.trim()) || isInlineCompressing}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Send className="h-3 w-3 stroke-[2.5]" />
                <span>Post Moment</span>
              </button>
            </div>
          </form>
        </div>

        {/* FEED SCOPE TABS: Following (Current User + Followed Creators) vs Explore All */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#1b2b24] pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFeedScope('following')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                feedScope === 'following'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 shadow-md shadow-emerald-950/40'
                  : 'bg-white dark:bg-[#0f1714] text-neutral-700 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200 border border-neutral-200 dark:border-[#1b2b24]'
              }`}
            >
              <span>🌿 Following Feed</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                feedScope === 'following' ? 'bg-stone-950/20 text-stone-950 font-black' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
              }`}>
                You + {followedCreatorIds.length} Stewards
              </span>
            </button>

            <button
              onClick={() => setFeedScope('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                feedScope === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 shadow-md shadow-emerald-950/40'
                  : 'bg-white dark:bg-[#0f1714] text-neutral-700 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200 border border-neutral-200 dark:border-[#1b2b24]'
              }`}
            >
              <span>Explore All</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-stone-500 font-mono">
            <span>{filteredPosts.length} moments</span>
          </div>
        </div>

        {/* FEED FILTER TABS (All Posts, Paywalled, Supporter Only) */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#1b2b24] pb-2 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-[#15231e] text-emerald-600 dark:text-emerald-400 border border-neutral-200 dark:border-[#1e342c] shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
              }`}
            >
              All Moments
            </button>
            <button
              onClick={() => setFilterMode('paywalled')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                filterMode === 'paywalled'
                  ? 'bg-white dark:bg-[#15231e] text-amber-600 dark:text-amber-400 border border-neutral-200 dark:border-[#1e342c] shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
              }`}
            >
              Paywalled
            </button>
            <button
              onClick={() => setFilterMode('supporter')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                filterMode === 'supporter'
                  ? 'bg-white dark:bg-[#15231e] text-emerald-600 dark:text-emerald-400 border border-neutral-200 dark:border-[#1e342c] shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
              }`}
            >
              Supporter Only
            </button>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-stone-500 font-mono sm:hidden">
            <span>{filteredPosts.length} moments</span>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 shrink-0 mr-1" />
          {filterTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-950/40'
                  : 'bg-white dark:bg-[#0f1714] border border-neutral-200 dark:border-[#1b2b24] text-neutral-700 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* SIMPLIFIED POST CREATION MODAL                               */}
        {/* ============================================================ */}
        {isPostComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-[#1e342c] bg-white dark:bg-[#0f1714] p-6 shadow-2xl text-neutral-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsPostComposerOpen(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer rounded-xl hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-stone-100">Create a Moment</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Share with followers & your profile timeline</p>
                </div>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                {/* Single Text Area for Post Caption */}
                <div>
                  <textarea
                    rows={4}
                    required
                    value={modalCaption}
                    onChange={e => setModalCaption(e.target.value)}
                    placeholder="Share a thought or a moment of your day..."
                    className="w-full bg-neutral-50 dark:bg-[#15231e] border border-neutral-300 dark:border-[#1e342c] rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-400 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                  />
                </div>

                {/* Attached Photo Preview */}
                {modalImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-stone-950 group">
                    <img
                      src={modalImageUrl}
                      alt="Attachment preview"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setModalImageUrl(null);
                        setModalCompressionInfo(null);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-stone-900/80 hover:bg-red-500 text-stone-200 hover:text-white transition-colors cursor-pointer shadow-lg"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {modalCompressionInfo && (
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-sm border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center space-x-1.5">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        <span>{modalCompressionInfo}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste Video Link Toggle & Input */}
                {isModalVideoOpen && (
                  <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-[#15231e] border border-neutral-300 dark:border-[#1e342c] rounded-xl px-3.5 py-2.5 text-xs">
                    <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <input
                      type="url"
                      value={modalVideoUrl}
                      onChange={e => setModalVideoUrl(e.target.value)}
                      placeholder="Paste video link (YouTube, Vimeo, or direct link)..."
                      className="flex-1 bg-transparent text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-500 focus:outline-none text-xs"
                    />
                    {modalVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setModalVideoUrl('')}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Hidden File Input for Modal */}
                <input
                  type="file"
                  ref={modalFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      compressImageFile(
                        file,
                        (url, info) => {
                          setModalImageUrl(url);
                          setModalCompressionInfo(info);
                        },
                        setIsModalCompressing
                      );
                    }
                  }}
                />

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-neutral-200 dark:border-[#1b2b24] flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs">
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      disabled={isModalCompressing}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#15231e] hover:bg-neutral-200 dark:hover:bg-[#1a2d26] text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isModalCompressing ? (
                        <Loader2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>{isModalCompressing ? 'Compressing...' : 'Upload Photo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalVideoOpen(prev => !prev)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        isModalVideoOpen ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' : 'bg-neutral-100 dark:bg-[#15231e] hover:bg-neutral-200 dark:hover:bg-[#1a2d26] text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Paste Video Link</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsPostComposerOpen(false)}
                      className="px-4 py-2 rounded-xl text-neutral-600 dark:text-stone-400 hover:bg-neutral-100 dark:hover:bg-[#15231e] text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={(!modalCaption.trim() && !modalImageUrl && !modalVideoUrl.trim()) || isModalCompressing}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Post Moment
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* EDIT POST MODAL                                              */}
        {/* ============================================================ */}
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-[#1e342c] bg-white dark:bg-[#0f1714] p-6 shadow-2xl text-neutral-900 dark:text-stone-100">
              <button
                onClick={() => setEditingPost(null)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer rounded-xl hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100">Edit Moment</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Update your caption or field thoughts</p>
                </div>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <textarea
                  rows={4}
                  required
                  value={editingPost.content}
                  onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#15231e] border border-neutral-300 dark:border-[#1e342c] rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-400 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                />

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 rounded-xl text-neutral-600 dark:text-stone-400 hover:bg-neutral-100 dark:hover:bg-[#15231e] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editingPost.content.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DELETE CONFIRMATION DIALOG                                   */}
        {/* ============================================================ */}
        {deletingPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl border border-red-500/30 bg-white dark:bg-[#0f1714] p-6 shadow-2xl text-neutral-900 dark:text-stone-100 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-stone-100">Delete this Moment?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">This will permanently remove the moment from your timeline and feed.</p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPostId(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#15231e] dark:hover:bg-[#1a2d26] text-neutral-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Delete Moment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEED POSTS LIST */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 dark:border-[#1b2b24] bg-white dark:bg-[#0f1714] p-8 sm:p-10 text-center space-y-4 shadow-sm dark:shadow-xl">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sprout className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100">
                  {feedScope === 'following' ? 'No moments in your Following Feed yet' : 'No moments found matching filters'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  {feedScope === 'following'
                    ? 'Your feed displays your posts plus updates from creators you follow. Follow more regenerative stewards or share a new moment to start seeing updates here!'
                    : 'Try clearing the selected tag or switching filter options to see other moments.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsPostComposerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  + Post Moment
                </button>
                {feedScope === 'following' && (
                  <button
                    onClick={() => setFeedScope('all')}
                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#15231e] dark:hover:bg-[#1a2d26] border border-neutral-200 dark:border-[#1e342c] text-neutral-800 dark:text-stone-200 text-xs font-semibold cursor-pointer"
                  >
                    Explore All Moments
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredPosts.map(post => {
              const video = parseVideoUrl(post.video_url || post.youtube_url);
              const isPostAuthor = isPostFromCurrentUser(post);
              const postSaved = isPostSaved(post.id);

              return (
                <article
                  key={post.id}
                  className={`rounded-3xl border ${
                    post.is_pinned
                      ? 'border-amber-500/40 bg-amber-500/5 dark:bg-neutral-900'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  } p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all`}
                >
                  {/* Author Card Header */}
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => navigate(`profile/${post.author?.username || post.author_id}`)}
                      className="flex items-center space-x-3.5 cursor-pointer group"
                    >
                      <img
                        src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={post.author?.full_name || 'Creator'}
                        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-amber-500/40 group-hover:ring-amber-400 transition-all"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-neutral-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {post.author?.full_name || 'Regenerative Steward'}
                          </span>
                          {post.author?.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold">
                              {post.author.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {(post.location_tag || post.author?.location) && (
                            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>{post.location_tag || post.author?.location}</span>
                            </span>
                          )}
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.is_edited && (
                            <span className="text-[10px] text-stone-500 font-mono italic">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {post.is_pinned && (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                          <Pin className="h-3 w-3 fill-amber-500 dark:fill-amber-400 rotate-45" />
                          <span>Pinned</span>
                        </span>
                      )}

                      {post.permaculture_principle && (
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium">
                          {post.permaculture_principle}
                        </span>
                      )}

                      {/* Clean Three-Dots Option Menu (...) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                          }}
                          className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#15231e] text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {activeMenuPostId === post.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-[#0f1714] border border-neutral-200 dark:border-[#1e342c] p-1.5 shadow-2xl text-xs z-30 animate-in fade-in zoom-in-95 duration-150"
                          >
                            {/* Author options */}
                            {isPostAuthor ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePin(post)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : 'text-amber-500 dark:text-amber-400'}`} />
                                  <span>{post.is_pinned ? 'Unpin Post' : 'Pin Post'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(post)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Pencil className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Edit Post</span>
                                </button>
                                <div className="my-1 border-t border-neutral-200 dark:border-[#1b2b24]" />
                                <button
                                  type="button"
                                  onClick={() => handleStartDelete(post.id)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                  <span>Delete Post</span>
                                </button>
                              </>
                            ) : (
                              /* Viewer options */
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSave(post)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Bookmark className={`h-4 w-4 ${postSaved ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                  <span>{postSaved ? 'Saved' : 'Save Post'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(post)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-neutral-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Copy className="h-4 w-4 text-stone-400" />
                                  <span>Copy Link</span>
                                </button>
                                <div className="my-1 border-t border-neutral-200 dark:border-[#1b2b24]" />
                                <button
                                  type="button"
                                  onClick={() => handleReportPost(post)}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer font-medium text-left"
                                >
                                  <Flag className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                  <span>Report Post</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Caption / Content */}
                  <div className="mt-3.5">
                    {post.title && post.title.trim() && post.title.trim() !== post.content.trim() && (
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-stone-100 mb-1.5">
                        {post.title}
                      </h2>
                    )}
                    <p className="text-neutral-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Media Image Gallery */}
                  {post.media_urls && post.media_urls.filter(u => Boolean(u && u.trim())).length > 0 && (
                    <div className={`mt-4 grid gap-3 rounded-2xl overflow-hidden ${
                      post.media_urls.filter(u => Boolean(u && u.trim())).length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                    }`}>
                      {post.media_urls.filter(u => Boolean(u && u.trim())).map((imgUrl, i) => (
                        <div key={i} className="relative aspect-video bg-neutral-100 dark:bg-stone-950 rounded-2xl overflow-hidden border border-neutral-200 dark:border-stone-800">
                          <img
                            src={imgUrl}
                            alt="Attached moment"
                            className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video Player Embed (YouTube, Vimeo, Direct) */}
                  {video && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-200 dark:border-stone-800 aspect-video bg-black shadow-lg">
                      {video.type === 'youtube' && (
                        <iframe
                          className="w-full h-full"
                          src={video.embedUrl}
                          title="YouTube Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {video.type === 'vimeo' && (
                        <iframe
                          className="w-full h-full"
                          src={video.embedUrl}
                          title="Vimeo Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {video.type === 'direct' && (
                        <video
                          controls
                          className="w-full h-full object-contain"
                          src={video.url}
                        />
                      )}
                    </div>
                  )}

                  {/* Post Tags */}
                  {post.tags && post.tags.length > 0 && post.tags.filter(t => t !== 'Moment' && t !== 'Permaculture').length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-stone-950 text-neutral-700 dark:text-stone-400 text-xs font-mono border border-neutral-200 dark:border-stone-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* MICRO-TIPPING & ENGAGEMENT ACTIONS */}
                  <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Micro-Tipping System for Creator Wallet */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Plant the Rain 🌧️:</span>
                      <button
                        type="button"
                        onClick={() => handleTipWithGrowth(post.id, 20)}
                        className={`relative px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible ${
                          growingTipKey === `${post.id}-20` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                        }`}
                        title="Plant 20 Rain Drops ($0.20 min)"
                      >
                        <WaterGrowthOverlay active={growingTipKey === `${post.id}-20`} amount={20} />
                        <span>+20</span>
                        <span>💧</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTipWithGrowth(post.id, 60)}
                        className={`relative px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible ${
                          growingTipKey === `${post.id}-60` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                        }`}
                        title="Plant 60 Rain Drops ($0.60)"
                      >
                        <WaterGrowthOverlay active={growingTipKey === `${post.id}-60`} amount={60} />
                        <span>+60</span>
                        <span>💧</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTipWithGrowth(post.id, 100)}
                        className={`relative px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible ${
                          growingTipKey === `${post.id}-100` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                        }`}
                        title="Plant 100 Rain Drops ($1.00)"
                      >
                        <WaterGrowthOverlay active={growingTipKey === `${post.id}-100`} amount={100} />
                        <span>+100</span>
                        <span>💧</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTipWithGrowth(post.id, 500)}
                        className={`relative hidden sm:flex px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all active:scale-95 items-center space-x-1 cursor-pointer overflow-visible ${
                          growingTipKey === `${post.id}-500` ? 'animate-growth-button-pulse ring-2 ring-amber-400/80 shadow-md shadow-amber-500/30' : ''
                        }`}
                        title="Plant 1 Water Bucket 🪣 (500 Rain Drops)"
                      >
                        <WaterGrowthOverlay active={growingTipKey === `${post.id}-500`} amount={500} label="+1 🪣 Planted!" />
                        <span>+1 🪣</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPostForTip(post)}
                        className="px-2.5 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer shadow-xs"
                        title="Open simplified tip dialog for this post"
                      >
                        <span>💧</span>
                        <span className="hidden sm:inline">Tip</span>
                        <span>+</span>
                      </button>
                    </div>

                    {/* Harvested Count & Social Metrics */}
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1.5 text-cyan-800 dark:text-cyan-300 font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-xl">
                        <span>💧</span>
                        <span>{((post.totalReceivedDrops ?? post.moments_harvested) || 0).toLocaleString()} Rain Drops</span>
                        {((post.totalReceivedDrops ?? post.moments_harvested) || 0) >= 500 && (
                          <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                            ({(((post.totalReceivedDrops ?? post.moments_harvested) || 0) / 500).toFixed(1)} 🪣)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center space-x-1.5 text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{post.likes_count}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          openCommentPostIds.has(post.id)
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                        }`}
                        title="Toggle comments & nested replies"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>💬 Comments ({comments.filter(c => c.post_id === post.id).length || post.comments_count || 0})</span>
                      </button>
                    </div>

                    {/* Expandable Comment & Nested Reply System */}
                    {openCommentPostIds.has(post.id) && (
                      <CommentSection
                        targetId={post.id}
                        targetType="post"
                        targetAuthorUsername={post.author.username}
                      />
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Simplified Post Tipping Modal */}
      {selectedPostForTip && (
        <TipPostModal
          post={posts.find(p => p.id === selectedPostForTip.id) || selectedPostForTip}
          isOpen={!!selectedPostForTip}
          onClose={() => setSelectedPostForTip(null)}
        />
      )}
    </div>
  );
};
