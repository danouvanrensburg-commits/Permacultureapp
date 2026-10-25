import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import {
  Flame,
  Droplets,
  Sprout,
  Radio,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
  Heart,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Award,
  TreePine,
  Layers,
  Zap,
  Info,
  Globe,
  Pencil,
  Plus,
  Camera,
  Play,
  Image as ImageIcon,
  MessageCircle,
  X,
  Loader2,
  Send,
  MoreHorizontal,
  Pin,
  Trash2,
  Bookmark,
  Flag,
  AlertTriangle
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { useMessenger } from '../context/MessengerContext';
import { UserProfile, BushTVChannel, CreatorGoal, CreatorMembershipTier, CommunityPost } from '../types';
import { WaterGrowthOverlay } from './WaterGrowthOverlay';
import { EditGoalModal } from './EditGoalModal';
import { EditTierModal } from './EditTierModal';
import { EditProfileMediaModal } from './EditProfileMediaModal';
import { EditClimateModal } from './EditClimateModal';
import { EditProfileModal } from './EditProfileModal';
import { CommentSection } from './CommentSection';
import { TipPostModal } from './TipPostModal';

interface CreatorProfileProps {
  username: string;
  navigate: (route: string) => void;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({ username, navigate }) => {
  const {
    allUsers,
    currentUser,
    channels,
    setCurrentChannel,
    posts,
    openTopUpModal,
    tipPost,
    likePost,
    createPost,
    plantTheRain,
    waterCreator,
    momentsBalance,
    updateUserGoal,
    updateUserMembershipTiers,
    updateUserProfileImages,
    updateUserClimate,
    updateUserProfileDetails,
    isFollowingCreator,
    toggleFollowCreator,
    isLoggedIn,
    editPost,
    deletePost,
    togglePinPost,
    toggleSavePost,
    isPostSaved,
    submitReport,
    comments
  } = usePermaculture();

  const { startChatWithUser } = useMessenger();

  // Track open comment sections per post
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Set<string>>(new Set());

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

  // Active navigation tab on the creator page - default to posts timeline (standard social media profile)
  type ProfileTab = 'posts' | 'water' | 'memberships' | 'firesides' | 'blueprints' | 'field_logs';
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<CreatorMembershipTier | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalInitialTab, setMediaModalInitialTab] = useState<'avatar' | 'cover'>('avatar');
  const [isClimateModalOpen, setIsClimateModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Simplified Post Modal & Timeline Composer state
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);

  // Profile timeline inline composer
  const [profileInlineCaption, setProfileInlineCaption] = useState('');
  const [profileInlineImageUrl, setProfileInlineImageUrl] = useState<string | null>(null);
  const [profileInlineVideoUrl, setProfileInlineVideoUrl] = useState('');
  const [isProfileInlineVideoOpen, setIsProfileInlineVideoOpen] = useState(false);
  const [isProfileInlineCompressing, setIsProfileInlineCompressing] = useState(false);
  const [profileInlineCompressionInfo, setProfileInlineCompressionInfo] = useState<string | null>(null);
  const profileInlineFileInputRef = useRef<HTMLInputElement>(null);

  // Profile Modal composer
  const [modalCaption, setModalCaption] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalVideoUrl, setModalVideoUrl] = useState('');
  const [isModalVideoOpen, setIsModalVideoOpen] = useState(false);
  const [isModalCompressing, setIsModalCompressing] = useState(false);
  const [modalCompressionInfo, setModalCompressionInfo] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Three-dots menu & Action states
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuPostId(null);
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Water Bucket Tipping State: Bucket increments (1 Water Bucket 🪣 = 500 Rain Drops = $5.00 USD)
  const [bucketCount, setBucketCount] = useState<number>(1);
  const [customBucketsInput, setCustomBucketsInput] = useState<string>('1');
  const [isCustomBuckets, setIsCustomBuckets] = useState<boolean>(false);
  const [goalBuckets, setGoalBuckets] = useState<number>(1);
  const [inputError, setInputError] = useState<string | null>(null);
  const [cheerMessage, setCheerMessage] = useState<string>('');
  const [isMonthlyWatering, setIsMonthlyWatering] = useState<boolean>(false);
  const [isPrivateNote, setIsPrivateNote] = useState<boolean>(false);
  const [waterSuccessNotice, setWaterSuccessNotice] = useState<string | null>(null);
  const [selectedPostForTip, setSelectedPostForTip] = useState<CommunityPost | null>(null);

  // Watering Economy growth animation states
  const [isMainWaterGrowing, setIsMainWaterGrowing] = useState<boolean>(false);
  const [isGoalWaterGrowing, setIsGoalWaterGrowing] = useState<boolean>(false);
  const [growingPostTipKey, setGrowingPostTipKey] = useState<string | null>(null);
  const [growingTierId, setGrowingTierId] = useState<string | null>(null);
  const [quickBucketGrowing, setQuickBucketGrowing] = useState<number | null>(null);

  const handleTipPostWithGrowth = (postId: string, amount: number) => {
    tipPost(postId, amount);
    const key = `${postId}-${amount}`;
    setGrowingPostTipKey(key);
    setTimeout(() => {
      setGrowingPostTipKey(prev => (prev === key ? null : prev));
    }, 1400);
  };

  // Find creator or fallback
  const profile: UserProfile =
    (currentUser.username === username ? currentUser : allUsers.find(u => u.username === username)) || allUsers[0];

  const isOwnProfile =
    isLoggedIn &&
    (currentUser.id === profile.id ||
      currentUser.username.toLowerCase() === profile.username.toLowerCase() ||
      currentUser.username.toLowerCase() === (username || '').toLowerCase());

  const hostedChannels = channels.filter(
    c => c.host.id === profile.id || (profile.channels_hosted && profile.channels_hosted.includes(c.id))
  );

  // Creator Profile Timeline: STRICTLY filter so it ONLY displays posts created by that specific profile user (author_id === profile.id)
  const creatorPosts = posts
    .filter(post => {
      // 1. Direct author_id match
      if (post.author_id === profile.id) return true;

      // 2. Direct author object ID match
      if (post.author?.id === profile.id) return true;

      // 3. Match author username
      if (
        post.author?.username &&
        profile.username &&
        post.author.username.toLowerCase() === profile.username.toLowerCase()
      ) {
        return true;
      }

      // 4. Handle default/current user alias 'user_current' / 'user_danou'
      const isProfileDanouOrCurrent =
        profile.id === 'user_danou' ||
        profile.id === currentUser.id ||
        profile.username === 'danou_van_rensburg' ||
        profile.username === currentUser.username;

      if (
        isProfileDanouOrCurrent &&
        (post.author_id === 'user_current' || post.author_id === 'user_danou' || post.author_id === currentUser.id)
      ) {
        return true;
      }

      return false;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Video parser for YouTube, Vimeo, and direct links
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

  const extractYoutubeId = (url?: string): string | undefined => {
    if (!url) return undefined;
    const parsed = parseVideoUrl(url);
    return parsed?.type === 'youtube' ? parsed.id : undefined;
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

  // Handle Profile Timeline Inline Post Submission
  const handleProfileInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInlineCaption.trim() && !profileInlineImageUrl && !profileInlineVideoUrl.trim()) return;

    createPost({
      content: profileInlineCaption.trim(),
      mediaUrls: profileInlineImageUrl ? [profileInlineImageUrl] : [],
      videoUrl: profileInlineVideoUrl.trim() || undefined,
      youtubeUrl: parseVideoUrl(profileInlineVideoUrl)?.type === 'youtube' ? profileInlineVideoUrl.trim() : undefined,
      location: profile.location || 'Demonstration Site'
    });

    setProfileInlineCaption('');
    setProfileInlineImageUrl(null);
    setProfileInlineVideoUrl('');
    setIsProfileInlineVideoOpen(false);
    setProfileInlineCompressionInfo(null);
    setWaterSuccessNotice('Moment posted! It is live on your profile timeline and community feed.');
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  // Handle Modal Post Submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCaption.trim() && !modalImageUrl && !modalVideoUrl.trim()) return;

    createPost({
      content: modalCaption.trim(),
      mediaUrls: modalImageUrl ? [modalImageUrl] : [],
      videoUrl: modalVideoUrl.trim() || undefined,
      youtubeUrl: parseVideoUrl(modalVideoUrl)?.type === 'youtube' ? modalVideoUrl.trim() : undefined,
      location: profile.location || 'Demonstration Site'
    });

    setModalCaption('');
    setModalImageUrl(null);
    setModalVideoUrl('');
    setIsModalVideoOpen(false);
    setModalCompressionInfo(null);
    setIsPostComposerOpen(false);
    setWaterSuccessNotice('Moment posted! It is live on your profile timeline and community feed.');
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  // Handlers for Three-Dots Option Menu
  const handleTogglePin = (post: CommunityPost) => {
    togglePinPost(post.id);
    setActiveMenuPostId(null);
    setWaterSuccessNotice(post.is_pinned ? 'Post unpinned' : '📌 Post pinned to profile timeline');
    setTimeout(() => setWaterSuccessNotice(null), 3500);
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
    setWaterSuccessNotice('✏️ Post updated successfully');
    setTimeout(() => setWaterSuccessNotice(null), 3500);
  };

  const handleStartDelete = (postId: string) => {
    setDeletingPostId(postId);
    setActiveMenuPostId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingPostId) {
      deletePost(deletingPostId);
      setDeletingPostId(null);
      setWaterSuccessNotice('🗑️ Post deleted');
      setTimeout(() => setWaterSuccessNotice(null), 3500);
    }
  };

  const handleToggleSave = (post: CommunityPost) => {
    const saved = toggleSavePost(post.id);
    setActiveMenuPostId(null);
    setWaterSuccessNotice(saved ? '🔖 Post saved to your bookmarks' : 'Post removed from saved bookmarks');
    setTimeout(() => setWaterSuccessNotice(null), 3500);
  };

  const handleCopyLink = (post: CommunityPost) => {
    const url = `${window.location.origin}/#post_${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setActiveMenuPostId(null);
    setWaterSuccessNotice('🔗 Post link copied to clipboard!');
    setTimeout(() => setWaterSuccessNotice(null), 3500);
  };

  const handleReportPost = (post: CommunityPost) => {
    submitReport({
      content_type: 'profile_post',
      content_id: post.id,
      title: post.title || 'Creator Profile Post',
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
      reason: 'Reported by profile visitor: Inappropriate content or harassment',
      severity: 'medium'
    });
    setActiveMenuPostId(null);
    setWaterSuccessNotice('🚩 Post reported to community moderators. Thank you!');
    setTimeout(() => setWaterSuccessNotice(null), 3500);
  };

  // 1 Water Bucket 🪣 = 500 Rain Drops = $5.00 USD
  const rawBuckets = isCustomBuckets
    ? parseInt(customBucketsInput || '0', 10)
    : bucketCount;
  const currentBucketsSelected = isNaN(rawBuckets) ? 0 : rawBuckets;
  const isValidBucketAmount = currentBucketsSelected >= 1 && Number.isInteger(currentBucketsSelected);
  const currentDropsSelected = currentBucketsSelected * 500;

  // Exact 5% platform fee calculation:
  // At 1 Bucket ($5.00 / 500 Drops), platform receives 25 Drops ($0.25) and creator receives 475 Drops ($4.75)
  const platformFeeDrops = currentBucketsSelected * 25;
  const creatorEarnedDrops = currentBucketsSelected * 475;
  const totalCostUsd = (currentBucketsSelected * 5.0).toFixed(2);
  const platformFeeUsd = (currentBucketsSelected * 0.25).toFixed(2);
  const creatorEarnedUsd = (currentBucketsSelected * 4.75).toFixed(2);
  const hasEnoughBalance = momentsBalance >= currentDropsSelected;

  const handleQuickBucketSelect = (count: number) => {
    setIsCustomBuckets(false);
    setBucketCount(count);
    setCustomBucketsInput(count.toString());
    setInputError(null);
    setQuickBucketGrowing(count);
    setTimeout(() => setQuickBucketGrowing(null), 900);
  };

  const handleStepBucket = (delta: number) => {
    const current = isCustomBuckets ? (parseInt(customBucketsInput, 10) || 1) : bucketCount;
    const next = Math.max(1, current + delta);
    handleQuickBucketSelect(next);
  };

  const handleCustomBucketsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomBuckets(true);
    const val = e.target.value.replace(/\D/g, '');
    setCustomBucketsInput(val);
    const num = parseInt(val, 10);
    if (!val || isNaN(num) || num < 1) {
      setInputError('Minimum is 1 Water Bucket 🪣 ($5.00 USD • 500 Rain Drops).');
    } else {
      setInputError(null);
    }
  };

  const handlePlantTheRain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBucketAmount || currentBucketsSelected < 1) {
      setInputError('Please select at least 1 Water Bucket 🪣 ($5.00 USD).');
      return;
    }

    const res = plantTheRain(
      profile.id,
      currentDropsSelected,
      cheerMessage,
      isMonthlyWatering,
      isPrivateNote
    );

    if (res.success) {
      setIsMainWaterGrowing(true);
      setTimeout(() => setIsMainWaterGrowing(false), 2000);
      setWaterSuccessNotice(
        `Planted ${currentBucketsSelected} Water Bucket${currentBucketsSelected > 1 ? 's' : ''} 🪣 (${currentDropsSelected.toLocaleString()} Rain Drops 💧 • $${totalCostUsd} USD) for ${profile.full_name}! Creator receives $${creatorEarnedUsd} USD (95% net).`
      );
      setCheerMessage('');
      setInputError(null);
      setTimeout(() => setWaterSuccessNotice(null), 5000);
    } else if (res.message) {
      setInputError(res.message);
    }
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/#/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleJoinFireside = (channel: BushTVChannel) => {
    setCurrentChannel(channel);
    navigate('bush-tv');
  };

  const goal: CreatorGoal = profile.goal || {
    title: 'Help Us Expand Our Permaculture Project & Unlocks New Funding',
    description: "We've been given an incredible opportunity to take part in a major fundraising event for our permaculture project! To participate and receive funds, we need to register a U.S. LLC, which costs $450.",
    current_water: profile.moments_harvested || 2400,
    target_water: 45000,
    target_amount_usd: 450.00,
    starting_amount: 0,
    include_shop_sales: true,
    include_commission_sales: true,
    show_target_publicly: true,
    unit_label: 'Drops'
  };

  const goalTargetDrops = goal.target_water || (goal.target_amount_usd ? Math.round(goal.target_amount_usd * 100) : 45000);
  const goalPercent = Math.min(100, Math.round(((goal.current_water || 0) / Math.max(1, goalTargetDrops)) * 100));

  const handleSaveGoal = (updatedGoal: CreatorGoal) => {
    updateUserGoal(profile.id, updatedGoal);
    setWaterSuccessNotice('Stewardship goal updated successfully! 🌿');
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  const handleOpenCreateTier = () => {
    setEditingTier(null);
    setIsTierModalOpen(true);
  };

  const handleOpenEditTier = (tier: CreatorMembershipTier) => {
    setEditingTier(tier);
    setIsTierModalOpen(true);
  };

  const handleSaveTier = (savedTier: CreatorMembershipTier) => {
    const existingTiers = profile.membership_tiers || [];
    let updatedTiers: CreatorMembershipTier[];
    const exists = existingTiers.some(t => t.id === savedTier.id);
    if (exists) {
      updatedTiers = existingTiers.map(t => (t.id === savedTier.id ? savedTier : t));
    } else {
      updatedTiers = [...existingTiers, savedTier];
    }
    updateUserMembershipTiers(profile.id, updatedTiers);
    setWaterSuccessNotice(`Membership tier "${savedTier.name}" saved! 🌿`);
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  const handleDeleteTier = (tierId: string) => {
    const existingTiers = profile.membership_tiers || [];
    const updatedTiers = existingTiers.filter(t => t.id !== tierId);
    updateUserMembershipTiers(profile.id, updatedTiers);
    setIsTierModalOpen(false);
    setWaterSuccessNotice('Membership tier removed. 🌿');
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  const handleSaveMedia = (images: { avatar_url: string; cover_url?: string }) => {
    updateUserProfileImages(profile.id, images);
    setWaterSuccessNotice('Profile photos updated successfully! 🌿');
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  const handleSaveClimate = (climate: string) => {
    updateUserClimate(profile.id, climate);
    setWaterSuccessNotice(
      climate ? `Climate zone updated to "${climate}"! 🌿` : 'Climate zone cleared (left blank). 🌿'
    );
    setTimeout(() => setWaterSuccessNotice(null), 4000);
  };

  const supporters = profile.recent_supporters || [
    {
      id: 'supp_default_1',
      supporter_name: 'Dr. Elena Rostova',
      supporter_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      water_drops: 5,
      moments_amount: 500,
      message: 'Great fungal inoculation in your latest swale update! Keep watering the movement.',
      created_at: '2026-09-28T14:00:00Z',
      is_monthly: true
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {waterSuccessNotice && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
            <span>{waterSuccessNotice}</span>
          </div>
        )}
        
        {/* ============================================================ */}
        {/* 1. KO-FI STYLE CREATOR HERO PROFILE CARD                    */}
        {/* ============================================================ */}
        <div className="relative rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xl transition-colors">
          {/* Cover Photo */}
          <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-stone-800 group">
            {profile.cover_url && profile.cover_url.trim() !== '' ? (
              <img
                src={profile.cover_url}
                alt="Creator Permaculture Site Cover"
                className="w-full h-full object-cover brightness-95 dark:brightness-90 hover:scale-101 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-900 via-stone-900 to-amber-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-black/20 pointer-events-none" />

            {/* Quick Climate Zone & Permaculture Tag */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              {profile.climate_zone && profile.climate_zone.trim() !== '' ? (
                isLoggedIn ? (
                  <button
                    onClick={() => setIsClimateModalOpen(true)}
                    className="group px-3 py-1 rounded-full text-xs font-mono font-semibold bg-stone-950/85 hover:bg-stone-950 backdrop-blur-md text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-lg cursor-pointer transition-all flex items-center space-x-1.5 hover:scale-102 active:scale-95"
                    title="Click to change your climate zone"
                  >
                    <span>{profile.climate_zone}</span>
                    <Pencil className="h-3 w-3 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow">
                    {profile.climate_zone}
                  </span>
                )
              ) : (
                isLoggedIn ? (
                  <button
                    onClick={() => setIsClimateModalOpen(true)}
                    className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-stone-950/75 hover:bg-stone-950 backdrop-blur-md text-amber-300/80 hover:text-amber-200 border border-dashed border-amber-500/50 hover:border-amber-400 shadow cursor-pointer transition-all flex items-center space-x-1 hover:scale-102 active:scale-95"
                    title="Choose your climate zone"
                  >
                    <span>+ Add Climate Zone</span>
                  </button>
                ) : null
              )}
            </div>

            {/* Edit Banner Button for Logged in Creator */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setMediaModalInitialTab('cover');
                  setIsMediaModalOpen(true);
                }}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-stone-950/75 hover:bg-stone-950 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Edit cover banner"
              >
                <Camera className="h-3.5 w-3.5 text-emerald-400" />
                <span>Edit Banner</span>
              </button>
            )}
          </div>

          {/* Profile Header Details */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-20 gap-4 mb-6">
              {/* Creator Avatar & Basic Info */}
              <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative self-start group">
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={profile.full_name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl object-cover ring-4 ring-white dark:ring-stone-900 border-2 border-emerald-500/50 shadow-2xl"
                  />
                  
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setMediaModalInitialTab('avatar');
                        setIsMediaModalOpen(true);
                      }}
                      className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 rounded-3xl flex flex-col items-center justify-center text-white text-[11px] font-extrabold transition-all cursor-pointer backdrop-blur-[2px]"
                      title="Edit profile picture"
                    >
                      <Camera className="h-5 w-5 mb-1 text-emerald-400" />
                      <span>Edit Photo</span>
                    </button>
                  )}

                  {/* Camera icon badge for quick mobile tap */}
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setMediaModalInitialTab('avatar');
                        setIsMediaModalOpen(true);
                      }}
                      className="absolute -top-1.5 -left-1.5 p-1.5 rounded-full bg-stone-900/90 text-white hover:text-emerald-400 border border-white/30 shadow-md cursor-pointer transition-all hover:scale-110 sm:hidden"
                      title="Edit profile picture"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-stone-950 shadow-lg" title="Water Verified Creator">
                    <Droplets className="h-4 w-4" />
                  </div>
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                      {profile.full_name}
                    </h1>
                    {profile.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {profile.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                    permacultureapp.com/{profile.username}
                  </p>
                </div>
              </div>

              {/* Creator Action Buttons: Follow, Share, Top-Up */}
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
                {isOwnProfile ? (
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    ✓ Your Public Profile
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => toggleFollowCreator(profile.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                        isFollowingCreator(profile.id)
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold'
                      }`}
                    >
                      {isFollowingCreator(profile.id) ? '✓ Following Steward' : '+ Follow Steward'}
                    </button>

                    <button
                      type="button"
                      onClick={() => startChatWithUser(profile.id)}
                      className="px-3.5 py-2 rounded-xl border border-emerald-300/80 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                      title={`Message ${profile.full_name}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Message</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleCopyProfileLink}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  title="Copy Ko-fi style permaculture link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                {isLoggedIn && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      title="Edit creator profile details, location, and bio"
                    >
                      <Pencil className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Edit Profile ✏️</span>
                    </button>

                    <button
                      onClick={() => setIsEditGoalModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      title="Edit your stewardship goal"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#00aeef]" />
                      <span>Edit Goal</span>
                    </button>

                    <button
                      onClick={handleOpenCreateTier}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      title="Create a new monthly membership tier"
                    >
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>+ Tier</span>
                    </button>

                    <button
                      onClick={() => {
                        setMediaModalInitialTab('avatar');
                        setIsMediaModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      title="Edit profile picture and cover banner"
                    >
                      <Camera className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Edit Photos</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveTab('water')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>🌧️</span>
                  <span>Plant the Rain (🪣 $5 USD)</span>
                </button>
              </div>
            </div>

            {/* Headline, Bio & Location */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-stone-200 dark:border-stone-800/80">
              <div className="lg:col-span-2 space-y-3">
                {profile.headline && (
                  <p className="font-semibold text-stone-900 dark:text-stone-200 text-sm">
                    {profile.headline}
                  </p>
                )}
                <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                  {profile.bio}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Focus: <strong className="text-stone-800 dark:text-stone-200">{profile.permaculture_focus}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{profile.location || 'Location Not Set'}</span>
                    {isLoggedIn && isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditProfileModalOpen(true)}
                        className="ml-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                        title="Edit location"
                      >
                        (edit)
                      </button>
                    )}
                  </span>
                </div>
              </div>

              {/* Ko-fi Community Stats Box: Rain Donated in Last 30 Days */}
              <div className="bg-stone-50 dark:bg-stone-950/70 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-around space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Rain Donated in Last 30 Days</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-end space-x-1 text-sm">
                      <span>💧 {(profile.moments_harvested || 0).toLocaleString()} Rain Drops</span>
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono block">
                      ({((profile.moments_harvested || 0) / 500).toFixed(1)} Water Buckets 🪣)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Supporters</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {profile.supporter_count || 0} Stewards
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Followers</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {(profile.follower_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. PROMINENT BUSH TV CHANNEL BANNER: "JOIN FIRESIDE"         */}
        {/* ============================================================ */}
        {hostedChannels.length > 0 && (
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-50 via-white to-amber-100/40 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/40 p-6 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  <span>Creator Bush TV Circles</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                  Step Around {profile.full_name.split(' ')[0]}'s Bush Fire
                </h2>
                <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Join live fireside chats, open micro-tipping discussions, and real-time site observations hosted directly by {profile.full_name}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
                {hostedChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleJoinFireside(channel)}
                    className="flex items-center space-x-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-950/30 transition-all active:scale-95 group"
                  >
                    <Flame className="h-4 w-4 animate-flame" />
                    <span>Join Fireside: {channel.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. PROFILE TAB NAVIGATION (POSTS / WATER / TIERS / FIRESIDES)  */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-2 overflow-x-auto border-b border-stone-200 dark:border-stone-800 pb-2 text-xs sm:text-sm font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'posts' || activeTab === 'field_logs'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900'
            }`}
          >
            <Sprout className="h-4 w-4" />
            <span>Posts ({creatorPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'water'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900'
            }`}
          >
            <span>🌧️</span>
            <span>Plant the Rain & Supporters ({supporters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('memberships')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'memberships'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Monthly Memberships ({profile.membership_tiers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('firesides')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'firesides'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-950/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>Bush TV Firesides ({hostedChannels.length})</span>
          </button>

          {profile.blueprints && profile.blueprints.length > 0 && (
            <button
              onClick={() => setActiveTab('blueprints')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'blueprints'
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-950/20'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Blueprints ({profile.blueprints.length})</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: POSTS & TIMELINE (STANDARD SOCIAL MEDIA PROFILE WALL)   */}
        {/* ============================================================ */}
        {(activeTab === 'posts' || activeTab === 'field_logs') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (5 cols on lg): Creator Intro, Goal & Quick Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* INTRO CARD */}
              <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base flex items-center space-x-2">
                    <Sprout className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Steward Intro</span>
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsClimateModalOpen(true)}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {profile.climate_zone && (
                    <div className="flex items-center space-x-2 text-stone-700 dark:text-stone-300">
                      <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Climate: <strong className="text-stone-900 dark:text-stone-100 font-bold">{profile.climate_zone}</strong></span>
                    </div>
                  )}

                  {profile.location && (
                    <div className="flex items-center space-x-2 text-stone-700 dark:text-stone-300">
                      <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                      <span>Location: <strong className="text-stone-900 dark:text-stone-100">{profile.location}</strong></span>
                    </div>
                  )}

                  {profile.permaculture_focus && (
                    <div className="flex items-center space-x-2 text-stone-700 dark:text-stone-300">
                      <TreePine className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Focus: <strong className="text-stone-900 dark:text-stone-100">{profile.permaculture_focus}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-stone-700 dark:text-stone-300">
                    <Users className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Followers: <strong className="text-stone-900 dark:text-stone-100 font-mono">{(profile.follower_count || 0).toLocaleString()}</strong></span>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-800 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* STEWARDSHIP GOAL SUMMARY CARD */}
              {profile.goal && (
                <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Droplets className="h-4 w-4" />
                      </span>
                      <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        Stewardship Goal
                      </h3>
                    </div>

                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditGoalModalOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                        title="Edit goal"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#00aeef]" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                      {profile.goal.title}
                    </h4>
                    {profile.goal.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {profile.goal.description}
                      </p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {Math.min(100, Math.round(((profile.goal.current_water || 0) / (profile.goal.target_water || 1)) * 100))}% reached
                      </span>
                      <span className="text-stone-500">
                        ${((profile.goal.current_water || 0) / 100).toFixed(2)} / ${((profile.goal.target_water || 1) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round(((profile.goal.current_water || 0) / (profile.goal.target_water || 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PLANT THE RAIN QUICK WATERING CARD */}
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-white dark:via-stone-900 to-emerald-500/5 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🌧️</span>
                    <div>
                      <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        Plant the Rain
                      </h4>
                      <p className="text-[11px] text-stone-500">Support this steward's food forest</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('water')}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      plantTheRain(profile.id, 500, 'Keep planting the rain! 💧');
                      setWaterSuccessNotice('Watered 1 Bucket 🪣 (500 Rain Drops) for ' + profile.full_name);
                      setTimeout(() => setWaterSuccessNotice(null), 4000);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 border border-cyan-500/40 hover:border-cyan-400 text-stone-800 dark:text-stone-100 text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>1 Bucket 🪣</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">$5</span>
                  </button>

                  <button
                    onClick={() => {
                      plantTheRain(profile.id, 1000, 'Double bucket boost! 💧💧');
                      setWaterSuccessNotice('Watered 2 Buckets 🪣 (1,000 Rain Drops) for ' + profile.full_name);
                      setTimeout(() => setWaterSuccessNotice(null), 4000);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 border border-cyan-500/40 hover:border-cyan-400 text-stone-800 dark:text-stone-100 text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>2 Buckets 🪣</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">$10</span>
                  </button>
                </div>
              </div>

              {/* MONTHLY MEMBERSHIPS SUMMARY CARD */}
              {profile.membership_tiers && profile.membership_tiers.length > 0 && (
                <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4.5 w-4.5 text-amber-500" />
                      <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                        Memberships ({profile.membership_tiers.length})
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('memberships')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Explore →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {profile.membership_tiers.slice(0, 2).map(tier => (
                      <div
                        key={tier.id}
                        onClick={() => setActiveTab('memberships')}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800/80 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100">{tier.name}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">{tier.description}</div>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                          ${tier.price_usd}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT / MAIN COLUMN (7 cols on lg): Timeline Feed of Creator Posts */}
            <div className="lg:col-span-7 space-y-6">

              {/* SIMPLIFIED INLINE COMPOSER (When visiting own profile) */}
              {isOwnProfile && (
                <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 space-y-3.5 shadow-xl transition-all">
                  <form onSubmit={handleProfileInlineSubmit} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={currentUser.full_name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={profileInlineCaption}
                          onChange={e => setProfileInlineCaption(e.target.value)}
                          placeholder="Share a thought or a moment of your day..."
                          className="w-full bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Attached Photo Preview with Compression Info */}
                    {profileInlineImageUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-stone-950 max-h-60 group">
                        <img
                          src={profileInlineImageUrl}
                          alt="Attachment preview"
                          className="w-full h-48 object-cover rounded-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileInlineImageUrl(null);
                            setProfileInlineCompressionInfo(null);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-stone-900/80 hover:bg-red-500 text-stone-200 hover:text-white transition-colors cursor-pointer shadow-lg"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {profileInlineCompressionInfo && (
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-sm border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center space-x-1.5">
                            <Sparkles className="h-3 w-3 text-emerald-400" />
                            <span>{profileInlineCompressionInfo}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paste Video Link Input */}
                    {isProfileInlineVideoOpen && (
                      <div className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs">
                        <Play className="h-4 w-4 text-emerald-500 shrink-0" />
                        <input
                          type="url"
                          value={profileInlineVideoUrl}
                          onChange={e => setProfileInlineVideoUrl(e.target.value)}
                          placeholder="Paste video link (YouTube, Vimeo, or direct link)..."
                          className="flex-1 bg-transparent text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none text-xs"
                        />
                        {profileInlineVideoUrl && (
                          <button
                            type="button"
                            onClick={() => setProfileInlineVideoUrl('')}
                            className="text-stone-400 hover:text-stone-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Hidden File Input with browser-image-compression */}
                    <input
                      type="file"
                      ref={profileInlineFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          compressImageFile(
                            file,
                            (url, info) => {
                              setProfileInlineImageUrl(url);
                              setProfileInlineCompressionInfo(info);
                            },
                            setIsProfileInlineCompressing
                          );
                        }
                      }}
                    />

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center space-x-3 sm:space-x-5">
                        <button
                          type="button"
                          onClick={() => profileInlineFileInputRef.current?.click()}
                          disabled={isProfileInlineCompressing}
                          className="flex items-center space-x-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-500 transition-colors cursor-pointer disabled:opacity-50"
                          title="Upload compressed photo"
                        >
                          {isProfileInlineCompressing ? (
                            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-emerald-500" />
                          )}
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            {isProfileInlineCompressing ? 'Compressing...' : 'Upload Photo'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsProfileInlineVideoOpen(prev => !prev)}
                          className={`flex items-center space-x-1.5 transition-colors cursor-pointer ${
                            isProfileInlineVideoOpen ? 'text-emerald-500 font-bold' : 'text-stone-600 dark:text-stone-300 hover:text-emerald-500'
                          }`}
                          title="Paste video link"
                        >
                          <Play className="h-4 w-4 text-emerald-500" />
                          <span className="font-semibold text-stone-700 dark:text-stone-300">Paste Video Link</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={(!profileInlineCaption.trim() && !profileInlineImageUrl && !profileInlineVideoUrl.trim()) || isProfileInlineCompressing}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Send className="h-3 w-3 stroke-[2.5]" />
                        <span>Post Moment</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TIMELINE HEADER */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {profile.full_name}'s Posts
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold">
                    {creatorPosts.length}
                  </span>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Chronological timeline
                </span>
              </div>

              {/* CREATOR POSTS LIST */}
              {creatorPosts.length === 0 ? (
                <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-8 sm:p-12 text-center space-y-4 shadow-xl">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Sprout className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      No posts on this profile yet
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "You haven't posted any field logs or updates to your profile yet. Document your site observations or water systems above!"
                        : `${profile.full_name} hasn't published any field logs yet. Check back soon for updates!`}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsPostComposerOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      + Post Moment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {creatorPosts.map(post => {
                    return (
                      <article
                        key={post.id}
                        className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-3.5 sm:p-6 md:p-7 w-full min-w-0 max-w-full overflow-hidden shadow-xl hover:border-stone-300 dark:hover:border-stone-700/80 transition-all space-y-4"
                      >
                        {/* Author Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                              alt={profile.full_name}
                              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-emerald-500/40"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-stone-900 dark:text-stone-100">
                                  {profile.full_name}
                                </span>
                                {profile.badge && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold">
                                    {profile.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{post.location_tag || post.author?.location || profile.location || 'Global'}</span>
                                </span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Header Actions: Principle, Pinned badge, Three-dots Menu */}
                          <div className="flex items-center space-x-2">
                            {post.permaculture_principle && (
                              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium">
                                {post.permaculture_principle}
                              </span>
                            )}
                          {post.is_pinned && (
                            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-500">
                              <Pin className="h-3 w-3 fill-amber-500 rotate-45" />
                              <span>Pinned</span>
                            </span>
                          )}

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                              }}
                              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                              title="More options"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>

                            {activeMenuPostId === post.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1.5 shadow-2xl text-xs z-30 animate-in fade-in zoom-in-95 duration-150"
                              >
                                {isOwnProfile ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePin(post)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-amber-500 fill-amber-500' : 'text-amber-500'}`} />
                                      <span>{post.is_pinned ? 'Unpin Post' : 'Pin Post'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(post)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Pencil className="h-4 w-4 text-emerald-500" />
                                      <span>Edit Post</span>
                                    </button>
                                    <div className="my-1 border-t border-stone-200 dark:border-stone-800" />
                                    <button
                                      type="button"
                                      onClick={() => handleStartDelete(post.id)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                      <span>Delete Post</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSave(post)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Bookmark className={`h-4 w-4 ${isPostSaved(post.id) ? 'text-emerald-500 fill-emerald-500' : 'text-emerald-500'}`} />
                                      <span>{isPostSaved(post.id) ? 'Saved' : 'Save Post'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyLink(post)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Copy className="h-4 w-4 text-stone-400" />
                                      <span>Copy Link</span>
                                    </button>
                                    <div className="my-1 border-t border-stone-200 dark:border-stone-800" />
                                    <button
                                      type="button"
                                      onClick={() => handleReportPost(post)}
                                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer font-medium text-left"
                                    >
                                      <Flag className="h-4 w-4 text-amber-500" />
                                      <span>Report Post</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                        {/* Title & Body */}
                        <div>
                          {post.title && post.title.trim() && post.title.trim() !== post.content.trim() && (
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </div>

                        {/* Media Images */}
                        {post.media_urls && post.media_urls.filter(u => Boolean(u && u.trim())).length > 0 && (
                          <div className={`grid gap-3 rounded-2xl overflow-hidden ${
                            post.media_urls.filter(u => Boolean(u && u.trim())).length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                          }`}>
                            {post.media_urls.filter(u => Boolean(u && u.trim())).map((img, i) => (
                              <div key={i} className="relative aspect-video bg-stone-100 dark:bg-stone-950 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                                <img
                                  src={img}
                                  alt="Yield"
                                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Video Player Embed (YouTube, Vimeo, Direct) */}
                        {(() => {
                          const video = parseVideoUrl(post.video_url || post.youtube_url);
                          if (!video) return null;

                          if (video.type === 'youtube') {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-video bg-black shadow-lg">
                                <iframe
                                  className="w-full h-full"
                                  src={video.embedUrl}
                                  title="YouTube Video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }

                          if (video.type === 'vimeo') {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-video bg-black shadow-lg">
                                <iframe
                                  className="w-full h-full"
                                  src={video.embedUrl}
                                  title="Vimeo Video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }

                          if (video.type === 'direct') {
                            return (
                              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-black shadow-lg">
                                <video
                                  controls
                                  className="w-full max-h-96 object-contain"
                                  src={video.url}
                                />
                              </div>
                            );
                          }

                          return null;
                        })()}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tags.map(t => (
                              <span
                                key={t}
                                className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 text-xs font-mono border border-stone-200 dark:border-stone-800"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Engagement Bar */}
                        <div className="pt-3 border-t border-stone-200 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                          {/* Micro tipping */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
                            <span className="text-xs text-stone-500 font-medium shrink-0">Plant the Rain 🌧️:</span>
                            <button
                              type="button"
                              onClick={() => handleTipPostWithGrowth(post.id, 20)}
                              className={`relative overflow-visible px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                                growingPostTipKey === `${post.id}-20` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                              }`}
                              title="Plant 20 Rain Drops"
                            >
                              <WaterGrowthOverlay active={growingPostTipKey === `${post.id}-20`} amount={20} />
                              <span>+20 💧</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTipPostWithGrowth(post.id, 60)}
                              className={`relative overflow-visible px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                                growingPostTipKey === `${post.id}-60` ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                              }`}
                              title="Plant 60 Rain Drops"
                            >
                              <WaterGrowthOverlay active={growingPostTipKey === `${post.id}-60`} amount={60} />
                              <span>+60 💧</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTipPostWithGrowth(post.id, 500)}
                              className={`relative overflow-visible px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                                growingPostTipKey === `${post.id}-500` ? 'animate-growth-button-pulse ring-2 ring-amber-400/80 shadow-md shadow-amber-500/30' : ''
                              }`}
                              title="Plant 1 Water Bucket (500 Rain Drops)"
                            >
                              <WaterGrowthOverlay active={growingPostTipKey === `${post.id}-500`} amount={500} label="+1 🪣 Planted!" />
                              <span>+1 🪣</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedPostForTip(post)}
                              className="px-2 py-0.5 rounded-lg text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 flex items-center space-x-1 cursor-pointer shadow-xs shrink-0"
                              title="Open tip dialog for this post"
                            >
                              <span>💧</span>
                              <span className="hidden sm:inline">Tip</span>
                              <span>+</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                            <div className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-400 font-mono font-bold shrink-0">
                              <span>💧</span>
                              <span>{((post.totalReceivedDrops ?? post.moments_harvested) || 0).toLocaleString()}</span>
                            </div>

                            <button
                              onClick={() => likePost(post.id)}
                              className="flex items-center space-x-1 text-stone-500 hover:text-amber-500 transition-colors cursor-pointer shrink-0"
                            >
                              <Heart className="h-4 w-4" />
                              <span>{post.likes_count}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleComments(post.id)}
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                openCommentPostIds.has(post.id)
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-neutral-800/80'
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
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: WATER & SUPPORTERS (THE ICONIC KO-FI EXPERIENCE)      */}
        {/* ============================================================ */}
        {activeTab === 'water' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / MAIN COLUMN (7 cols): The Ko-fi "Water [Creator]" Card */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* THE WATER WIDGET */}
              <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Widget Header */}
                <div className="flex items-center justify-between pb-5 border-b border-stone-200 dark:border-stone-800/80">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      <span className="text-2xl">🌧️</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                        Plant the Rain for {profile.full_name.split(' ')[0]} 🌧️
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Fuel regenerative earthworks with Rain Drops 💧 and Water Buckets 🪣
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-semibold px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hidden sm:inline-block">
                    100 💧 = $1.00 • 1 🪣 = 500 💧 ($5)
                  </span>
                </div>

                {/* Success Banner */}
                {waterSuccessNotice && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{waterSuccessNotice}</span>
                  </div>
                )}

                <form onSubmit={handlePlantTheRain} className="mt-6 space-y-5">
                  {/* Water Bucket Increment Selector: [1 🪣 ($5)] [2 🪣 ($10)] [3 🪣 ($15)] [5 🪣 ($25)] [Custom] */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                        Select Water Buckets ($5.00 USD Increments):
                      </label>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        1 Water Bucket 🪣 = 500 Rain Drops ($5.00 USD)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { buckets: 1, label: '1 Bucket 🪣', sub: '$5.00 (500 💧)' },
                        { buckets: 2, label: '2 Buckets 🪣', sub: '$10.00 (1k 💧)' },
                        { buckets: 3, label: '3 Buckets 🪣', sub: '$15.00 (1.5k 💧)' },
                        { buckets: 5, label: '5 Buckets 🪣', sub: '$25.00 (2.5k 💧)' }
                      ].map(item => (
                        <button
                          key={item.buckets}
                          type="button"
                          onClick={() => handleQuickBucketSelect(item.buckets)}
                          className={`relative overflow-visible py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                            !isCustomBuckets && bucketCount === item.buckets
                              ? 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 shadow-md ring-1 ring-cyan-500 font-bold'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-stone-700 dark:text-stone-300 hover:border-cyan-500/40'
                          } ${quickBucketGrowing === item.buckets ? 'animate-growth-button-pulse ring-2 ring-emerald-400' : ''}`}
                        >
                          <WaterGrowthOverlay active={quickBucketGrowing === item.buckets} label={`${item.label} 🌱`} size="sm" />
                          <span className="text-xs font-extrabold">{item.label}</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            {item.sub}
                          </span>
                        </button>
                      ))}

                      {/* Custom Buckets Stepper Input */}
                      <div
                        onClick={() => setIsCustomBuckets(true)}
                        className={`rounded-2xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isCustomBuckets
                            ? 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 ring-1 ring-cyan-500'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-stone-500">Custom Buckets</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStepBucket(-1);
                            }}
                            className="h-5 w-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="1"
                            value={customBucketsInput}
                            onChange={handleCustomBucketsChange}
                            onFocus={() => setIsCustomBuckets(true)}
                            className="w-8 text-center bg-transparent border-b border-stone-300 dark:border-stone-700 text-sm font-bold font-mono focus:outline-none focus:border-cyan-500 text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStepBucket(1);
                            }}
                            className="h-5 w-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-xs">🪣</span>
                        </div>
                      </div>
                    </div>

                    {/* Input Validation Error */}
                    {inputError && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{inputError}</span>
                      </p>
                    )}
                  </div>

                  {/* Tip Summary: User Giving Wallet Balance and Selected Tip Amount */}
                  <div className="rounded-2xl bg-cyan-500/5 dark:bg-stone-950/80 border border-cyan-500/20 p-3.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                      <span className="font-semibold flex items-center space-x-1 font-sans">
                        <span>🌧️</span>
                        <span>Total to Plant:</span>
                      </span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {currentBucketsSelected} Water Bucket{currentBucketsSelected > 1 ? 's' : ''} 🪣 ({currentDropsSelected.toLocaleString()} Rain Drops)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                      <span>Giving Wallet Balance:</span>
                      <span className={momentsBalance >= currentDropsSelected ? 'text-stone-700 dark:text-stone-200 font-mono font-semibold' : 'text-amber-500 font-mono font-bold'}>
                        💧 {momentsBalance.toLocaleString()} Drops
                      </span>
                    </div>
                  </div>

                  {/* Encouraging Message Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Encouraging Field Note or Question:
                    </label>
                    <textarea
                      rows={3}
                      value={cheerMessage}
                      onChange={e => setCheerMessage(e.target.value)}
                      placeholder={`Say something nice to ${profile.full_name.split(' ')[0]} or ask about their site design...`}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Ko-fi Style Toggles: Monthly watering & Private Note */}
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center space-x-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMonthlyWatering}
                        onChange={e => setIsMonthlyWatering(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Plant the rain monthly ({currentBucketsSelected} Bucket{currentBucketsSelected > 1 ? 's' : ''}/mo)</span>
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivateNote}
                        onChange={e => setIsPrivateNote(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Keep note private (only visible to {profile.full_name.split(' ')[0]})</span>
                    </label>
                  </div>

                  {/* Total and Submit Button */}
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <span>Your Rain Drops Balance:</span>
                      <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 flex items-center space-x-1">
                        <span>💧</span>
                        <span>{momentsBalance.toLocaleString()} Rain Drops</span>
                        <span className="text-[11px] font-normal text-stone-400">
                          ({(momentsBalance / 500).toFixed(1)} 🪣)
                        </span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={!isValidBucketAmount}
                      className={`relative overflow-visible w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 hover:opacity-95 active:scale-98 text-stone-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-950/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 ${
                        isMainWaterGrowing ? 'animate-growth-button-pulse ring-4 ring-emerald-400/90 shadow-2xl shadow-emerald-500/50' : ''
                      }`}
                    >
                      <WaterGrowthOverlay
                        active={isMainWaterGrowing}
                        amount={currentDropsSelected}
                        label={`+${currentBucketsSelected} 🪣 Planted & Sprouting! 🌱`}
                        size="lg"
                      />
                      <span>🌧️</span>
                      <span>
                        Plant the Rain ({currentBucketsSelected} Bucket{currentBucketsSelected > 1 ? 's' : ''} 🪣 • ${totalCostUsd} USD)
                      </span>
                    </button>

                    {!hasEnoughBalance && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                        <span className="text-amber-800 dark:text-amber-300">
                          Need {(currentDropsSelected - momentsBalance).toLocaleString()} more Rain Drops ({((currentDropsSelected - momentsBalance) / 500).toFixed(1)} 🪣)?
                        </span>
                        <button
                          type="button"
                          onClick={openTopUpModal}
                          className="font-bold underline text-amber-700 dark:text-amber-400 hover:text-amber-500 cursor-pointer"
                        >
                          Top Up Rain Drops
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* KO-FI SUPPORTERS WALL FEED */}
              <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Heart className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                    <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100">
                      Supporter Wall & Notes
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    {supporters.length} Stewards Planted the Rain
                  </span>
                </div>

                <div className="space-y-4">
                  {supporters.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      Be the first to plant the rain for {profile.full_name}'s garden!
                    </div>
                  ) : (
                    supporters.map(sup => (
                      <div
                        key={sup.id}
                        className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700/80 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={sup.supporter_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                              alt={sup.supporter_name}
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-cyan-500/40"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                  {sup.supporter_name}
                                </span>
                                {sup.is_monthly && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                    Monthly Member
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                                {new Date(sup.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold">
                            <span>💧</span>
                            <span>+{(sup.rain_drops || sup.water_drops || 20).toLocaleString()} Drops</span>
                          </div>
                        </div>

                        {sup.message && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                            "{sup.message}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR (5 cols): Goal Card & Guild Perks & Quick Links */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. KO-FI ACTIVE GOAL CARD */}
              <div className="rounded-3xl border border-emerald-500/40 bg-white dark:bg-stone-900/90 p-6 shadow-xl relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <Compass className="h-4 w-4" />
                    <span>Active Stewardship Goal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isLoggedIn && (
                      <button
                        onClick={() => setIsEditGoalModalOpen(true)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                        title="Edit stewardship goal"
                      >
                        <Pencil className="h-3 w-3 text-[#00aeef]" />
                        <span>Edit</span>
                      </button>
                    )}
                    <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400">
                      {goalPercent}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  {goal.title}
                </h3>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                  {goal.description}
                </p>

                {/* Visual Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${goalPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>{goal.current_water.toLocaleString()} 💧 ({((goal.current_water) / 500).toFixed(1)} 🪣)</span>
                    {goal.show_target_publicly !== false ? (
                      <span>Target: {goal.target_water.toLocaleString()} 💧 (${((goal.target_amount_usd !== undefined ? goal.target_amount_usd : goal.target_water / 100)).toFixed(2)})</span>
                    ) : (
                      <span className="italic text-stone-400">Target: Private</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      Plant Water Buckets for Goal:
                    </span>
                    <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                      $5.00 USD / Bucket 🪣
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 5].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setGoalBuckets(b)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                          goalBuckets === b
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 ring-1 ring-cyan-500'
                            : 'bg-stone-100 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-cyan-500/40'
                        }`}
                      >
                        +{b} 🪣 (${b * 5})
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const res = plantTheRain(
                        profile.id,
                        goalBuckets * 500,
                        `Contributed ${goalBuckets} Water Bucket${goalBuckets > 1 ? 's' : ''} towards goal: "${goal.title}"`,
                        false,
                        false
                      );
                      if (res.success) {
                        setIsGoalWaterGrowing(true);
                        setTimeout(() => setIsGoalWaterGrowing(false), 2000);
                        setWaterSuccessNotice(
                          `Planted ${goalBuckets} Water Bucket${goalBuckets > 1 ? 's' : ''} 🪣 ($${(goalBuckets * 5).toFixed(2)} USD • ${(goalBuckets * 500).toLocaleString()} Rain Drops) for ${goal.title}!`
                        );
                        setTimeout(() => setWaterSuccessNotice(null), 5000);
                      }
                    }}
                    className={`relative overflow-visible w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 hover:opacity-95 active:scale-98 text-stone-950 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer ${
                      isGoalWaterGrowing ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                    }`}
                  >
                    <WaterGrowthOverlay
                      active={isGoalWaterGrowing}
                      amount={goalBuckets * 500}
                      label={`+${goalBuckets} 🪣 Goal Planted! 🌱`}
                      size="md"
                    />
                    <span>🌧️</span>
                    <span>
                      Plant the Rain for This Goal ({goalBuckets} Bucket{goalBuckets > 1 ? 's' : ''} 🪣 • ${(goalBuckets * 5).toFixed(2)} USD)
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. MEMBERSHIP TIERS TEASER */}
              {profile.membership_tiers && profile.membership_tiers.length > 0 && (
                <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-6 shadow-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base flex items-center space-x-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Monthly Memberships</span>
                    </h3>
                    <div className="flex items-center space-x-2.5">
                      {isLoggedIn && (
                        <button
                          onClick={handleOpenCreateTier}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
                          title="Add a new tier"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Tier</span>
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab('memberships')}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {profile.membership_tiers.map(tier => (
                      <div
                        key={tier.id}
                        className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{tier.name}</span>
                          <div className="flex items-center space-x-2">
                            {isLoggedIn && (
                              <button
                                onClick={() => handleOpenEditTier(tier)}
                                className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
                                title="Edit this tier"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            )}
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              ${tier.price_usd.toFixed(2)}/mo
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                          {tier.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            waterCreator(profile.id, tier.water_drops_per_month, 1, `Joined ${tier.name}!`, true);
                            setGrowingTierId(tier.id);
                            setTimeout(() => setGrowingTierId(null), 2000);
                          }}
                          className={`relative overflow-visible w-full py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-emerald-500 hover:text-stone-950 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            growingTierId === tier.id ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                          }`}
                        >
                          <WaterGrowthOverlay
                            active={growingTierId === tier.id}
                            amount={tier.water_drops_per_month}
                            label="Joined & Planted! 🌱"
                            size="md"
                          />
                          <span>🌧️</span>
                          <span>
                            Plant the Rain: Join for {tier.water_drops_per_month} Drops/mo ({((tier.water_drops_per_month) / 500).toFixed(1)} 🪣)
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CREATOR SOCIAL LINKS */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 space-y-2">
                <p className="font-semibold text-stone-700 dark:text-stone-300">Regenerative Network:</p>
                <div className="flex flex-col space-y-1 text-stone-600 dark:text-stone-400 font-mono">
                  <a href={`https://permacultureapp.com/${profile.username}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 truncate flex items-center space-x-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    <span>permacultureapp.com/{profile.username}</span>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>YouTube Field Broadcasts</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: FIRESIDE CHANNELS                                     */}
        {/* ============================================================ */}
        {activeTab === 'firesides' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostedChannels.map(ch => (
              <div
                key={ch.id}
                className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">{ch.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                      {ch.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{ch.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {ch.topic_tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-stone-950 rounded text-stone-600 dark:text-stone-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-xs text-stone-500 font-mono">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{ch.active_viewers_count} active stewards</span>
                  </span>

                  <button
                    onClick={() => handleJoinFireside(ch)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Enter Channel</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: MONTHLY MEMBERSHIPS */}
        {activeTab === 'memberships' && (
          <div className="space-y-6">
            {/* Header bar with Add Tier button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Award className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                    <span>Monthly Memberships</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      {profile.membership_tiers?.length || 0} active
                    </span>
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Recurring monthly stewardship for seed preservation, food forest cultivation, and field logs.
                </p>
              </div>

              {isLoggedIn && (
                <button
                  onClick={handleOpenCreateTier}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add New Tier</span>
                </button>
              )}
            </div>

            {/* Grid of Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(profile.membership_tiers || []).map(tier => (
                <div
                  key={tier.id}
                  className={`rounded-3xl border relative flex flex-col justify-between shadow-2xl transition-all overflow-hidden ${
                    tier.popular
                      ? 'border-emerald-500 bg-white dark:bg-stone-900 ring-2 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90'
                  }`}
                >
                  {/* Optional Tier Banner Artwork */}
                  {tier.image_url && (
                    <div className="h-36 w-full relative overflow-hidden bg-stone-950">
                      <img
                        src={tier.image_url}
                        alt={tier.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-4 text-[11px] font-mono text-white/90">
                        {tier.badge}
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges and Edit Button */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {tier.popular && (
                            <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-950 shadow-md">
                              Most Popular
                            </span>
                          )}
                          {tier.is_published === false && (
                            <span className="rounded-full bg-stone-500/20 text-stone-400 px-2.5 py-0.5 text-[10px] font-bold">
                              Draft
                            </span>
                          )}
                          {tier.limit_members && tier.max_members && (
                            <span className="rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                              Max {tier.max_members} Stewards
                            </span>
                          )}
                          {tier.request_address && (
                            <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                              📦 Seed Shipping
                            </span>
                          )}
                        </div>

                        {isLoggedIn && (
                          <button
                            onClick={() => handleOpenEditTier(tier)}
                            className="p-1.5 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold border border-stone-200 dark:border-stone-700 flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                            title="Edit this membership tier"
                          >
                            <Pencil className="h-3 w-3 text-emerald-500" />
                            <span>Edit Tier</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{tier.name}</h3>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">{tier.badge}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                            ${tier.price_usd.toFixed(2)}
                          </span>
                          <span className="block text-[11px] text-stone-500">per month</span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                        {tier.description}
                      </p>

                      <div className="mt-5 space-y-2">
                        <p className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">Perks Included:</p>
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-stone-700 dark:text-stone-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          waterCreator(profile.id, tier.water_drops_per_month, 1, `Joined ${tier.name}!`, true);
                          setGrowingTierId(tier.id);
                          setTimeout(() => setGrowingTierId(null), 2000);
                        }}
                        className={`relative overflow-visible w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                          growingTierId === tier.id ? 'animate-growth-button-pulse ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/30' : ''
                        }`}
                      >
                        <WaterGrowthOverlay
                          active={growingTierId === tier.id}
                          amount={tier.water_drops_per_month}
                          label="Joined & Planted! 🌱"
                          size="md"
                        />
                        <span>🌧️</span>
                        <span>
                          Plant the Rain: Join for {tier.water_drops_per_month} Drops/mo ({((tier.water_drops_per_month) / 500).toFixed(1)} 🪣)
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: BLUEPRINTS GALLERY (SEED/CAD SCHEMATICS)              */}
        {/* ============================================================ */}
        {activeTab === 'blueprints' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(profile.blueprints || []).map(bp => (
              <div
                key={bp.id}
                className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xl"
              >
                <div className="h-48 w-full bg-stone-950 relative overflow-hidden">
                  <img
                    src={bp.image_url}
                    alt={bp.title}
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-stone-950/80 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    {bp.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">{bp.title}</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{bp.description}</p>

                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {bp.water_cost || 100} Rain Drops 💧 ({((bp.water_cost || 100) / 500).toFixed(1)} 🪣)
                    </span>

                    <button
                      onClick={() => waterCreator(profile.id, bp.water_cost || 100, 1, `Downloaded blueprint: ${bp.title}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 text-stone-950 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1"
                    >
                      <span>Plant the Rain & Unlock</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Edit Stewardship Goal Modal */}
      <EditGoalModal
        isOpen={isEditGoalModalOpen}
        onClose={() => setIsEditGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={goal}
      />

      {/* Edit Membership Tier Modal */}
      <EditTierModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        onSave={handleSaveTier}
        onDelete={handleDeleteTier}
        initialTier={editingTier}
      />

      {/* Edit Profile Media Modal */}
      <EditProfileMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSave={handleSaveMedia}
        currentAvatar={profile.avatar_url}
        currentCover={profile.cover_url}
        fullName={profile.full_name}
        username={profile.username}
        initialTab={mediaModalInitialTab}
      />

      {/* Edit Climate Zone Modal */}
      <EditClimateModal
        isOpen={isClimateModalOpen}
        onClose={() => setIsClimateModalOpen(false)}
        onSave={handleSaveClimate}
        currentClimate={profile.climate_zone}
      />

      {/* Edit Profile & Location Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        onSave={(details) => {
          updateUserProfileDetails(profile.id, details);
        }}
      />

      {/* Simplified Post Creation Modal on Profile */}
      {isPostComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPostComposerOpen(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Create a Moment</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Share with followers & your profile timeline</p>
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Single clean Text Area for caption */}
              <div>
                <textarea
                  rows={4}
                  required
                  value={modalCaption}
                  onChange={e => setModalCaption(e.target.value)}
                  placeholder="Share a thought or a moment of your day..."
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                />
              </div>

              {/* Attached Photo Preview with Compression Info */}
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
                <div className="flex items-center space-x-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs">
                  <Play className="h-4 w-4 text-emerald-500 shrink-0" />
                  <input
                    type="url"
                    value={modalVideoUrl}
                    onChange={e => setModalVideoUrl(e.target.value)}
                    placeholder="Paste video link (YouTube, Vimeo, or direct link)..."
                    className="flex-1 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none text-xs"
                  />
                  {modalVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setModalVideoUrl('')}
                      className="text-stone-400 hover:text-stone-200"
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
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    disabled={isModalCompressing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-emerald-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isModalCompressing ? (
                      <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-emerald-500" />
                    )}
                    <span>{isModalCompressing ? 'Compressing...' : 'Upload Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalVideoOpen(prev => !prev)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      isModalVideoOpen
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-emerald-500'
                    }`}
                  >
                    <Play className="h-4 w-4 text-emerald-500" />
                    <span>Paste Video Link</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPostComposerOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl text-stone-900 dark:text-stone-100">
            <button
              onClick={() => setEditingPost(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Edit Moment</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Update your caption or observations</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <textarea
                rows={4}
                required
                value={editingPost.content}
                onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-red-500/30 bg-white dark:bg-stone-900 p-6 shadow-2xl text-stone-900 dark:text-stone-100 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Delete this Moment?</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">This will permanently remove the moment from your timeline and feed.</p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
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
