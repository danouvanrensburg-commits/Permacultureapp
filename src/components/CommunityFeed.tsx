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
  Camera,
  SlidersHorizontal,
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
import { useMessenger } from '../context/MessengerContext';
import { CommunityPost, ModerationSeverity } from '../types';
import { WaterGrowthOverlay } from './WaterGrowthOverlay';
import { CommentSection } from './CommentSection';
import { TipPostModal } from './TipPostModal';
import { ReportContentModal } from './ReportContentModal';
import { moderationService } from '../services/moderationService';

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

  const { startChatWithUser } = useMessenger();

  const [feedScope, setFeedScope] = useState<'following' | 'all'>('following');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<'all' | 'paywalled' | 'supporter'>('all');
  
  // Track open comment sections per post
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Set<string>>(new Set());
  const [selectedPostForTip, setSelectedPostForTip] = useState<CommunityPost | null>(null);
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);

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
  const [modalAccessTier, setModalAccessTier] = useState<'free' | 'supporter' | 'vip'>('free');

  // Filter Drawer state (replacing multi-row stacked filter bars)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  // Handle Modal Post Submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCaption.trim() && !modalImageUrl && !modalVideoUrl.trim()) return;

    // Automated content moderation check
    const safetyCheck = moderationService.evaluateText(modalCaption);
    if (!safetyCheck.isSafe && safetyCheck.action === 'block') {
      showNotice(`⚠️ Content Blocked: ${safetyCheck.reason}`);
      return;
    }
    if (safetyCheck.autoReport) {
      submitReport({
        content_type: 'feed_post',
        content_id: `post_auto_${Date.now()}`,
        title: 'Automated Shield Review',
        content_snippet: modalCaption.slice(0, 100),
        author_id: currentUser.id,
        author_name: currentUser.full_name,
        author_username: currentUser.username,
        author_avatar: currentUser.avatar_url,
        reported_by_name: 'Automated Shield',
        reported_by_username: 'system_shield',
        reason: safetyCheck.autoReport.reason,
        severity: safetyCheck.autoReport.severity
      });
    }

    createPost({
      content: modalCaption.trim(),
      mediaUrls: modalImageUrl ? [modalImageUrl] : [],
      videoUrl: modalVideoUrl.trim() || undefined,
      youtubeUrl: parseVideoUrl(modalVideoUrl)?.type === 'youtube' ? modalVideoUrl.trim() : undefined,
      tags: modalAccessTier === 'vip' ? ['vip', 'paywall'] : modalAccessTier === 'supporter' ? ['supporter'] : undefined
    });

    setModalCaption('');
    setModalImageUrl(null);
    setModalVideoUrl('');
    setIsModalVideoOpen(false);
    setModalCompressionInfo(null);
    setModalAccessTier('free');
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
    setActiveMenuPostId(null);
    setReportingPost(post);
  };

  const handleSubmitReport = (details: {
    category: string;
    reason: string;
    severity: ModerationSeverity;
    additionalNotes?: string;
  }) => {
    if (!reportingPost) return;
    submitReport({
      content_type: 'feed_post',
      content_id: reportingPost.id,
      title: reportingPost.title || 'Community Feed Post',
      content_snippet: reportingPost.content,
      media_urls: reportingPost.media_urls,
      author_id: reportingPost.author.id,
      author_name: reportingPost.author.full_name,
      author_username: reportingPost.author.username,
      author_avatar: reportingPost.author.avatar_url,
      author_badge: reportingPost.author.badge,
      reported_by_id: currentUser.id,
      reported_by_name: currentUser.full_name,
      reported_by_username: currentUser.username,
      reason: `${details.reason}${details.additionalNotes ? `: ${details.additionalNotes}` : ''}`,
      severity: details.severity
    });
    setReportingPost(null);
    showNotice('🛡️ Report submitted to community stewards for review.');
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

        {/* ============================================================ */}
        {/* BOTANICAL COMMONS HERO BANNER                                */}
        {/* ============================================================ */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E1D8] dark:border-[#1b2b24] shadow-md group">
          <img
            src="/src/assets/images/hero_food_forest_canopy_1792051977298.jpg"
            alt="Permaculture Food Forest Canopy"
            className="w-full h-44 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sprout className="h-4 w-4" />
              <span>Regenerative Commons</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-sans drop-shadow-sm">
              Cultivate Resilient Ecosystems
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl line-clamp-2">
              Share field observations, water creators with rain drops, and learn regenerative living practices.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STREAMLINED FACEBOOK-STYLE POST COMPOSER                     */}
        {/* ============================================================ */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              type="button"
              onClick={() => navigate(`profile/${currentUser.username}`)}
              className="shrink-0 cursor-pointer group"
              title={`View @${currentUser.username}`}
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt={currentUser.full_name}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-1 ring-emerald-600/30 group-hover:ring-emerald-500 transition-all"
              />
            </button>

            {/* Quick Input Bar that opens full creation modal */}
            <button
              type="button"
              onClick={() => setIsPostComposerOpen(true)}
              className="flex-1 text-left bg-[#F4EFEA] hover:bg-[#EBE5DC] dark:bg-[#15231e] dark:hover:bg-[#1c3228] text-stone-600 dark:text-stone-400 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-[#E7E1D8] dark:border-[#1e342c] transition-all cursor-pointer font-normal truncate"
            >
              Share a thought or moment...
            </button>

            {/* Quick Camera / Photo Button */}
            <button
              type="button"
              onClick={() => {
                setIsPostComposerOpen(true);
                setTimeout(() => modalFileInputRef.current?.click(), 150);
              }}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer shrink-0"
              title="Add photo"
            >
              <Camera className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Photo</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STREAMLINED SINGLE-ROW FILTER SUMMARY & "FILTER TOPICS" CTA  */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between py-1 px-1">
          {/* Active Filter Chips Preview */}
          <div className="flex items-center space-x-1.5 truncate text-xs">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
              <span>{feedScope === 'following' ? '🌿 Following' : '🌎 Explore All'}</span>
            </span>

            {filterMode !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium text-[11px]">
                {filterMode === 'paywalled' ? '⭐ Paywalled' : '💧 Supporter'}
              </span>
            )}

            {selectedTag !== 'All' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-neutral-200 dark:bg-[#1b2b24] text-neutral-800 dark:text-stone-200 font-medium text-[11px] truncate max-w-[120px]">
                #{selectedTag}
              </span>
            )}

            <span className="text-[11px] text-stone-400 font-mono hidden sm:inline ml-1">
              ({filteredPosts.length} moments)
            </span>
          </div>

          {/* Single "Filter Topics" Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f1714] hover:bg-neutral-100 dark:hover:bg-[#15231e] border border-neutral-200/80 dark:border-[#1b2b24] text-neutral-800 dark:text-stone-200 font-semibold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
            <span>Filter Topics</span>
            {(selectedTag !== 'All' || filterMode !== 'all' || feedScope !== 'following') && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
        </div>

        {/* ============================================================ */}
        {/* FILTER TOPICS BOTTOM DRAWER (MOBILE) / MODAL (DESKTOP)       */}
        {/* ============================================================ */}
        {isFilterDrawerOpen && (
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-[#1e342c] bg-white dark:bg-[#0f1714] p-5 sm:p-6 shadow-2xl text-neutral-900 dark:text-stone-100 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 space-y-5"
            >
              {/* Drawer Pull Bar (mobile) */}
              <div className="flex sm:hidden justify-center -mt-2 pb-2">
                <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#1b2b24]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-stone-100">Filter Moments Feed</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Tune your community feed view</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 1. Feed Scope */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200 uppercase tracking-wider">
                  Feed Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedScope('following')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      feedScope === 'following'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-neutral-50 dark:bg-[#15231e] border-neutral-200 dark:border-[#1b2b24] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🌿 Following ({followedCreatorIds.length} Stewards)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedScope('all')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      feedScope === 'all'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-neutral-50 dark:bg-[#15231e] border-neutral-200 dark:border-[#1b2b24] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🌎 Explore All
                  </button>
                </div>
              </div>

              {/* 2. Access Tier */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200 uppercase tracking-wider">
                  Access Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-neutral-50 dark:bg-[#15231e] border-neutral-200 dark:border-[#1b2b24] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('paywalled')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      filterMode === 'paywalled'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                        : 'bg-neutral-50 dark:bg-[#15231e] border-neutral-200 dark:border-[#1b2b24] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    ⭐ Paywalled
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('supporter')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      filterMode === 'supporter'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'bg-neutral-50 dark:bg-[#15231e] border-neutral-200 dark:border-[#1b2b24] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    💧 Supporter
                  </button>
                </div>
              </div>

              {/* 3. Topic Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-800 dark:text-stone-200 uppercase tracking-wider">
                  Permaculture Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {filterTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-emerald-500 text-stone-950 font-bold shadow-xs'
                          : 'bg-neutral-100 dark:bg-[#15231e] border border-neutral-200 dark:border-[#1b2b24] text-neutral-700 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-[#1b2b24]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTag('All');
                    setFilterMode('all');
                    setFeedScope('following');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    required
                    value={modalCaption}
                    onChange={e => setModalCaption(e.target.value)}
                    placeholder="Share a thought or a moment... (Tip: Tag @dan with a photo to ask for field guidance!)"
                    className="w-full bg-neutral-50 dark:bg-[#15231e] border border-neutral-300 dark:border-[#1e342c] rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-stone-100 placeholder-neutral-400 dark:placeholder-stone-400 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (!modalCaption.includes('@dan')) {
                          setModalCaption(prev => prev ? `${prev} @dan ` : '@dan ');
                        }
                      }}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      <span>Tag @dan (Ask Dan Elder)</span>
                    </button>
                    <span className="text-[11px] text-stone-400">Dan reviews photos, swales & soil</span>
                  </div>
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

                {/* Audience & Paywall Access Tier Selector */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#15231e] border border-neutral-200 dark:border-[#1e342c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 dark:text-stone-200 flex items-center space-x-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Audience &amp; Access Tier</span>
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {modalAccessTier === 'free' ? 'Public Feed' : modalAccessTier === 'supporter' ? '$5 Supporter Tier' : '$10 VIP Paywall'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalAccessTier('free')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        modalAccessTier === 'free'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#0f1714] border-neutral-200 dark:border-[#1b2b24] text-stone-500'
                      }`}
                    >
                      Free for All
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAccessTier('supporter')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        modalAccessTier === 'supporter'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#0f1714] border-neutral-200 dark:border-[#1b2b24] text-stone-500'
                      }`}
                    >
                      🌿 $5 Supporter
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAccessTier('vip')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        modalAccessTier === 'vip'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#0f1714] border-neutral-200 dark:border-[#1b2b24] text-stone-500'
                      }`}
                    >
                      ⭐ $10 VIP Paywall
                    </button>
                  </div>
                </div>

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
                      ? 'border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/15'
                      : 'border-[#E7E1D8] dark:border-stone-800 bg-white dark:bg-[#0f1714]'
                  } p-3.5 sm:p-5 md:p-6 w-full min-w-0 max-w-full overflow-hidden shadow-2xs hover:shadow-xs transition-all`}
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
                        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-emerald-600/30 group-hover:ring-emerald-500 transition-all"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {post.author?.full_name || 'Regenerative Steward'}
                          </span>
                          {post.author?.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold">
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

                      {/* Quick Message Author Button */}
                      {!isPostAuthor && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startChatWithUser(post.author_id);
                          }}
                          className="p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                          title={`Message ${post.author?.full_name || 'Author'}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
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
                                  onClick={() => {
                                    setActiveMenuPostId(null);
                                    startChatWithUser(post.author_id);
                                  }}
                                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-[#15231e] transition-colors cursor-pointer font-medium text-left"
                                >
                                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Message Author</span>
                                </button>
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
                  <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
                    {/* Micro-Tipping System for Creator Wallet */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium shrink-0">Plant the Rain 🌧️:</span>
                      <button
                        type="button"
                        onClick={() => handleTipWithGrowth(post.id, 20)}
                        className={`relative px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible shrink-0 ${
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
                        className={`relative px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible shrink-0 ${
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
                        className={`relative px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer overflow-visible shrink-0 ${
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
                        className={`relative hidden sm:flex px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all active:scale-95 items-center space-x-1 cursor-pointer overflow-visible shrink-0 ${
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
                        className="px-2 sm:px-2.5 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer shadow-xs shrink-0"
                        title="Open simplified tip dialog for this post"
                      >
                        <span>💧</span>
                        <span className="hidden sm:inline">Tip</span>
                        <span>+</span>
                      </button>
                    </div>

                    {/* Harvested Count & Social Metrics */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                      <div className="flex items-center space-x-1.5 text-cyan-800 dark:text-cyan-300 font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-500/30 px-2.5 sm:px-3 py-1 rounded-xl shrink-0">
                        <span>💧</span>
                        <span>{((post.totalReceivedDrops ?? post.moments_harvested) || 0).toLocaleString()} Drops</span>
                        {((post.totalReceivedDrops ?? post.moments_harvested) || 0) >= 500 && (
                          <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                            ({(((post.totalReceivedDrops ?? post.moments_harvested) || 0) / 500).toFixed(1)} 🪣)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center space-x-1.5 text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{post.likes_count}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
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
                  </div>

                  {/* Expandable Comment & Nested Reply System - Full width on laptop & mobile */}
                  {openCommentPostIds.has(post.id) && (
                    <div className="w-full min-w-0 max-w-full overflow-hidden mt-2 pt-1 animate-in fade-in duration-200">
                      <CommentSection
                        targetId={post.id}
                        targetType="post"
                        targetAuthorUsername={post.author.username}
                      />
                    </div>
                  )}
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

      {/* Categorized Content Moderation Report Modal */}
      {reportingPost && (
        <ReportContentModal
          isOpen={!!reportingPost}
          onClose={() => setReportingPost(null)}
          onSubmit={handleSubmitReport}
          contentType="feed_post"
          contentSnippet={reportingPost.content}
          authorUsername={reportingPost.author.username}
        />
      )}
    </div>
  );
};
