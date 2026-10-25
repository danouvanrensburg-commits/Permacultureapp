import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  CornerDownRight,
  Check,
  Sparkles
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { PostComment, ModerationSeverity } from '../types';
import { TipCommentModal } from './TipCommentModal';
import { moderationService } from '../services/moderationService';
import { ReportContentModal } from './ReportContentModal';

interface CommentSectionProps {
  targetId: string; // post.id or message.id
  targetType: 'post' | 'message';
  targetAuthorUsername?: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetId,
  targetType,
  targetAuthorUsername,
  onCommentCountChange
}) => {
  const {
    currentUser,
    comments,
    addComment,
    editComment,
    deleteComment,
    submitReport,
    openAuthModal,
    isLoggedIn
  } = usePermaculture();

  // New comment input
  const [newCommentText, setNewCommentText] = useState('');
  
  // Tipping state: comment being tipped
  const [tippingComment, setTippingComment] = useState<PostComment | null>(null);

  // Replying state: commentId being replied to
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Editing state: commentId being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Reporting & automated moderation state
  const [reportingComment, setReportingComment] = useState<PostComment | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Active three-dots menu
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null);

  // Notification toast inside comment section
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Close context menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuCommentId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Filter all comments belonging to this target post or message
  const targetComments = comments.filter(c => c.post_id === targetId);
  const topLevelComments = targetComments.filter(c => !c.parent_id);

  // Handle adding top-level comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const cleanText = newCommentText.trim();
    if (!cleanText) return;

    // Automated moderation safety check
    const safetyCheck = moderationService.evaluateText(cleanText);
    if (safetyCheck.action === 'block') {
      setModerationError(safetyCheck.reason || 'This comment violates community standards and cannot be published.');
      return;
    }
    setModerationError(null);

    // If warning trigger, log automatic moderation flag
    if (safetyCheck.action === 'warn') {
      submitReport({
        content_type: targetType === 'message' ? 'bush_tv_chat' : 'feed_post',
        content_id: `auto-${Date.now()}`,
        title: `Automated Shield: Comment flagged`,
        content_snippet: cleanText,
        author_id: currentUser.id,
        author_username: currentUser.username,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        author_badge: currentUser.badge,
        reported_by_id: 'system_shield',
        reported_by_name: 'Automated Shield',
        reported_by_username: 'shield',
        reason: safetyCheck.reason || 'Flagged by automated filter',
        severity: safetyCheck.autoReport?.severity || 'medium'
      });
    }

    addComment(targetId, cleanText, null);
    setNewCommentText('');
    showToast('💬 Comment posted!');
    if (onCommentCountChange) {
      onCommentCountChange(targetComments.length + 1);
    }
  };

  // Handle adding nested reply (Level 1 or Level 2)
  const handleAddReply = (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const cleanReply = replyText.trim();
    if (!cleanReply) return;

    // Automated moderation safety check
    const safetyCheck = moderationService.evaluateText(cleanReply);
    if (safetyCheck.action === 'block') {
      showToast(`⚠️ Blocked: ${safetyCheck.reason || 'Violates community guidelines'}`);
      return;
    }

    if (safetyCheck.action === 'warn') {
      submitReport({
        content_type: targetType === 'message' ? 'bush_tv_chat' : 'feed_post',
        content_id: `auto-${Date.now()}`,
        title: `Automated Shield: Reply flagged`,
        content_snippet: cleanReply,
        author_id: currentUser.id,
        author_username: currentUser.username,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        author_badge: currentUser.badge,
        reported_by_id: 'system_shield',
        reported_by_name: 'Automated Shield',
        reported_by_username: 'shield',
        reason: safetyCheck.reason || 'Flagged by automated filter',
        severity: safetyCheck.autoReport?.severity || 'medium'
      });
    }

    addComment(targetId, cleanReply, parentId);
    setReplyText('');
    setReplyingToCommentId(null);
    showToast('💬 Reply posted!');
    if (onCommentCountChange) {
      onCommentCountChange(targetComments.length + 1);
    }
  };

  // Handle saving edit
  const handleSaveEdit = (commentId: string) => {
    if (!editText.trim()) return;
    editComment(commentId, editText.trim());
    setEditingCommentId(null);
    setEditText('');
    showToast('✏️ Comment updated!');
  };

  // Handle deleting comment
  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    setActiveMenuCommentId(null);
    showToast('🗑️ Comment deleted');
    if (onCommentCountChange) {
      onCommentCountChange(Math.max(0, targetComments.length - 1));
    }
  };

  // Handle reporting comment - opens community report modal
  const handleReportComment = (comment: PostComment) => {
    setActiveMenuCommentId(null);
    setReportingComment(comment);
  };

  // Handle submitting comment report from modal
  const handleSubmitCommentReport = (details: {
    category: string;
    reason: string;
    severity: ModerationSeverity;
    additionalNotes?: string;
  }) => {
    if (!reportingComment) return;
    submitReport({
      content_type: targetType === 'message' ? 'bush_tv_chat' : 'feed_post',
      content_id: reportingComment.id,
      title: `Comment by @${reportingComment.author.username}`,
      content_snippet: reportingComment.content,
      author_id: reportingComment.author.id,
      author_username: reportingComment.author.username,
      author_name: reportingComment.author.full_name,
      author_avatar: reportingComment.author.avatar_url,
      author_badge: reportingComment.author.badge,
      reported_by_id: currentUser.id,
      reported_by_name: currentUser.full_name,
      reported_by_username: currentUser.username,
      reason: details.additionalNotes ? `${details.reason} - Note: ${details.additionalNotes}` : details.reason,
      severity: details.severity
    });
    showToast('🚩 Report submitted to community moderators. Thank you!');
  };

  // Get direct replies for any comment
  const getReplies = (parentId: string) => {
    return targetComments.filter(c => c.parent_id === parentId);
  };

  // Format relative or concise timestamp
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Check if current user is author of comment
  const isCommentAuthor = (comment: PostComment) => {
    if (currentUser.id === comment.author.id) return true;
    if (currentUser.username && comment.author.username && currentUser.username.toLowerCase() === comment.author.username.toLowerCase()) return true;
    if ((currentUser.id === 'user_current' || currentUser.id === 'user_danou') && (comment.author.id === 'user_current' || comment.author.id === 'user_danou')) return true;
    return false;
  };

  // Recursive or level-aware single comment card renderer
  const renderCommentCard = (comment: PostComment, level: number = 0) => {
    const isAuthor = isCommentAuthor(comment);
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToCommentId === comment.id;
    const childReplies = getReplies(comment.id);
    const maxLevel = 2; // Support top-level (0), Level 1 (1), and Level 2 (2)

    const isTipComment = comment.is_tip_comment || comment.content.startsWith('💧') || Boolean(comment.tip_amount);

    return (
      <div key={comment.id} className="group/cmt space-y-2 w-full min-w-0 max-w-full">
        <div
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all w-full min-w-0 max-w-full overflow-hidden ${
            isTipComment
              ? 'bg-gradient-to-r from-cyan-50/90 via-emerald-50/60 to-white dark:from-cyan-950/40 dark:via-emerald-950/20 dark:to-neutral-900 border border-cyan-400/50 dark:border-cyan-700/60 shadow-xs'
              : 'bg-stone-50/90 dark:bg-neutral-900/80 border border-stone-200 dark:border-neutral-800 hover:border-stone-300 dark:hover:border-neutral-700/80 shadow-2xs'
          }`}
        >
          {/* Comment Header: Author Info, Tip Pill, Time, Options Menu */}
          <div className="flex items-start justify-between gap-1.5 min-w-0">
            <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
              <img
                src={comment.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt=""
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-xl object-cover ring-1 ring-emerald-500/30 shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm truncate max-w-[110px] sm:max-w-[180px]">
                    {comment.author.full_name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono truncate max-w-[80px] sm:max-w-[130px]">
                    @{comment.author.username}
                  </span>
                  {comment.author.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 font-semibold truncate max-w-[90px] sm:max-w-[120px]">
                      {comment.author.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono min-w-0">
                  {isTipComment && (
                    <span className="inline-flex items-center space-x-1 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 font-bold shrink-0">
                      <span>💧</span>
                      <span>{comment.tip_amount ? `${comment.tip_amount} Drops` : 'Donation'}</span>
                    </span>
                  )}
                  <span className="shrink-0">{formatTime(comment.created_at)}</span>
                  {comment.is_edited && <span className="italic shrink-0">(edited)</span>}
                </div>
              </div>
            </div>

            {/* Context Menu (...) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuCommentId(activeMenuCommentId === comment.id ? null : comment.id);
                }}
                className="p-1 sm:p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Comment options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {activeMenuCommentId === comment.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-40 sm:w-44 max-w-[calc(100vw-3rem)] rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700/80 p-1.5 shadow-2xl z-30 text-xs animate-in fade-in zoom-in-95 duration-150"
                >
                  {isAuthor ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditText(comment.content);
                          setActiveMenuCommentId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                      >
                        <Pencil className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>Edit Comment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400 shrink-0" />
                        <span>Delete Comment</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReportComment(comment)}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer text-left"
                    >
                      <Flag className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span>Report Comment</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment Body or Inline Editor */}
          {isEditing ? (
            <div className="mt-2.5 space-y-2 w-full min-w-0">
              <textarea
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-w-0 rounded-xl bg-white dark:bg-neutral-950 border border-stone-300 dark:border-neutral-700 px-3.5 py-2.5 text-stone-900 dark:text-stone-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditText('');
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={!editText.trim()}
                  className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : isTipComment ? (
            <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/25 flex items-start space-x-2 sm:space-x-2.5 w-full min-w-0 max-w-full overflow-hidden">
              <span className="text-base sm:text-lg shrink-0 mt-0.5">🌧️</span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-semibold text-cyan-950 dark:text-cyan-100 text-xs sm:text-[13px] md:text-sm leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                  {comment.content}
                </p>
                <p className="text-[10px] text-cyan-700/80 dark:text-cyan-400/80 font-mono break-words [overflow-wrap:anywhere] leading-snug">
                  Watered directly to creator&apos;s earnings wallet • 95% net creator split
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-stone-800 dark:text-stone-200 text-xs sm:text-[13px] md:text-sm leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Action Row: Reply Toggle & Rain Drops Tipping */}
          {!isEditing && (
            <div className="mt-2.5 pt-1.5 border-t border-stone-200/50 dark:border-neutral-800/60 flex flex-wrap items-center gap-2 sm:gap-4 text-xs min-w-0">
              {level < maxLevel && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      openAuthModal();
                      return;
                    }
                    setReplyingToCommentId(isReplying ? null : comment.id);
                    setReplyText('');
                  }}
                  className="flex items-center space-x-1.5 text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
                >
                  <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
                  <span>{isReplying ? 'Cancel Reply' : 'Reply'}</span>
                </button>
              )}

              {/* Rain Drops Tipping Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoggedIn) {
                    openAuthModal();
                    return;
                  }
                  setTippingComment(comment);
                }}
                className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/40 font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 text-[11px] sm:text-xs shrink-0"
                title={`💧 Tip Rain Drops to @${comment.author.username}`}
              >
                <span>💧</span>
                <span>Tip Drops</span>
              </button>

              {/* Display author's current total received drops on this comment */}
              {(comment.drops_received || comment.total_drops_received || 0) > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 font-mono text-[10px] sm:text-[11px] font-semibold border border-cyan-500/25 shadow-2xs shrink-0">
                  <span>💧</span>
                  <span>{(comment.drops_received || comment.total_drops_received || 0).toLocaleString()} Drops</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Inline Reply Input Box */}
        {isReplying && (
          <form
            onSubmit={(e) => handleAddReply(comment.id, e)}
            className="w-full min-w-0 max-w-full p-2.5 sm:p-3 rounded-2xl bg-stone-100/90 dark:bg-neutral-950/80 border border-stone-200 dark:border-neutral-800 space-y-2 animate-in fade-in duration-150"
          >
            <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono min-w-0">
              <CornerDownRight className="h-3 w-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Replying to <strong className="text-emerald-700 dark:text-emerald-300">@{comment.author.username}</strong></span>
            </div>
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              autoFocus
              className="w-full min-w-0 rounded-xl bg-white dark:bg-neutral-900 border border-stone-300 dark:border-neutral-700/80 px-3 py-2 text-stone-900 dark:text-stone-200 text-xs focus:outline-none focus:border-emerald-500 placeholder-stone-400 dark:placeholder-stone-500 transition-colors resize-none"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setReplyingToCommentId(null);
                  setReplyText('');
                }}
                className="px-2.5 py-1 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-neutral-800 text-[11px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-stone-950 font-bold text-[11px] cursor-pointer disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="h-3 w-3" />
                <span>Post Reply</span>
              </button>
            </div>
          </form>
        )}

        {/* Nested Replies Thread: indented nicely with a clean line, responsive on mobile */}
        {childReplies.length > 0 && (
          <div className="pl-2 sm:pl-4 md:pl-5 border-l-2 border-stone-300 dark:border-neutral-800 space-y-2.5 mt-2.5 w-full min-w-0 max-w-full">
            {childReplies.map(reply => renderCommentCard(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden mt-4 pt-4 border-t border-stone-200 dark:border-neutral-800/80 space-y-4 text-left">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-stone-100 dark:bg-neutral-900 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center space-x-2 shadow-lg animate-in fade-in duration-200 max-w-full">
          <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{toastNotice}</span>
        </div>
      )}

      {/* Main Comment Input Box - Optimized for Laptop & Mobile */}
      <form onSubmit={handleAddComment} className="w-full min-w-0 max-w-full p-2.5 sm:p-4 md:p-5 rounded-2xl bg-stone-100/90 dark:bg-neutral-900/90 border border-stone-200 dark:border-neutral-800 space-y-3 shadow-inner">
        <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt=""
            className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl object-cover ring-1 ring-emerald-500/30 shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0 space-y-2.5">
            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={isLoggedIn ? "Write a comment or share observations... (Tag @dan for advice)" : "Sign in to join the discussion..."}
              className="w-full min-w-0 rounded-xl bg-white dark:bg-neutral-950 border border-stone-300 dark:border-neutral-800 px-3 sm:px-4 py-2 sm:py-2.5 text-stone-900 dark:text-stone-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/80 placeholder-stone-400 dark:placeholder-stone-500 transition-colors resize-none leading-relaxed"
            />
            {moderationError && (
              <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-between">
                <span>{moderationError}</span>
                <button
                  type="button"
                  onClick={() => setModerationError(null)}
                  className="text-red-500 font-semibold hover:underline text-[11px] ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {targetComments.length} {targetComments.length === 1 ? 'comment' : 'comments'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!newCommentText.includes('@dan')) {
                      setNewCommentText(prev => prev ? `${prev} @dan ` : '@dan ');
                    }
                  }}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                  title="Tag Dan (Permaculture Elder)"
                >
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  <span>@dan</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white dark:text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 cursor-pointer shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Add Comment</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 w-full min-w-0 max-w-full">
        {topLevelComments.length === 0 ? (
          <div className="p-5 sm:p-6 text-center rounded-2xl bg-stone-50/50 dark:bg-neutral-900/40 border border-stone-200/60 dark:border-neutral-800/60 space-y-1.5">
            <MessageCircle className="h-6 w-6 text-stone-400 dark:text-stone-600 mx-auto" />
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          topLevelComments.map(comment => renderCommentCard(comment, 0))
        )}
      </div>

      {/* Quick-Tip Modal / Dropdown */}
      {tippingComment && (
        <TipCommentModal
          comment={tippingComment}
          isOpen={!!tippingComment}
          onClose={() => setTippingComment(null)}
          targetType={targetType}
        />
      )}

      {/* Community Content Report Modal */}
      {reportingComment && (
        <ReportContentModal
          isOpen={!!reportingComment}
          onClose={() => setReportingComment(null)}
          onSubmit={handleSubmitCommentReport}
          contentType={targetType === 'message' ? 'bush_tv_chat' : 'feed_post'}
          contentSnippet={reportingComment.content}
          authorUsername={reportingComment.author.username}
        />
      )}
    </div>
  );
};
