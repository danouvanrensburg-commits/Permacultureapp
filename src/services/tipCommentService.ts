import { PostComment, UserProfile } from '../types';
import { numberToWords } from '../lib/numberWords';

export interface TipDonationPayload {
  postId: string;
  donor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    badge?: string;
  };
  amount: number;
  message?: string;
  parentId?: string | null;
  isPrivate?: boolean;
}

export interface TipCommentInterceptorOptions {
  includeWords?: boolean;
  prefixEmoji?: string;
}

type TipInterceptorListener = (comment: PostComment, payload: TipDonationPayload) => void;

class TipCommentService {
  private listeners: Set<TipInterceptorListener> = new Set();

  /**
   * Subscribe a listener that executes whenever a tip donation is intercepted.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: TipInterceptorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Generates formatted text for the public tip comment.
   * Format: '[Username] donated [Amount] drops'
   * e.g. '💧 Danou donated 20 drops' or '💧 Danou donated twenty drops (20 drops)'
   */
  public formatTipText(
    username: string,
    amount: number,
    message?: string,
    options: TipCommentInterceptorOptions = {}
  ): string {
    const { includeWords = true, prefixEmoji = '💧' } = options;
    const words = numberToWords(amount);
    
    // Base wording: '[Username] donated [Amount] drops'
    const amountLabel = includeWords && words !== amount.toString()
      ? `${amount} drops (${words} drops)`
      : `${amount} drops`;

    const baseText = `${prefixEmoji} ${username} donated ${amountLabel}`;

    if (message && message.trim()) {
      return `${baseText}: "${message.trim()}"`;
    }

    return baseText;
  }

  /**
   * Intercepts a successful tip donation and generates a public PostComment.
   * Also notifies any active subscribers/interceptors.
   */
  public interceptTipDonation(
    payload: TipDonationPayload,
    options?: TipCommentInterceptorOptions
  ): PostComment {
    const { postId, donor, amount, message, parentId, isPrivate } = payload;
    
    const displayName = isPrivate
      ? 'A generous steward'
      : (donor.full_name || donor.username || 'Steward');

    const commentContent = this.formatTipText(displayName, amount, message, options);

    const generatedComment: PostComment = {
      id: `cmt_tip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      post_id: postId,
      parent_id: parentId || null,
      author: {
        id: donor.id,
        username: isPrivate ? 'generous_steward' : donor.username,
        full_name: displayName,
        avatar_url: isPrivate
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          : (donor.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'),
        badge: donor.badge
      },
      content: commentContent,
      created_at: new Date().toISOString(),
      drops_received: amount,
      total_drops_received: amount,
      totalReceivedDrops: amount,
      is_tip_comment: true,
      tip_amount: amount
    };

    // Dispatch to any registered external interceptors/listeners
    this.listeners.forEach(listener => {
      try {
        listener(generatedComment, payload);
      } catch (err) {
        console.error('Error in tip interceptor listener:', err);
      }
    });

    return generatedComment;
  }
}

// Export singleton service instance and convenience helper function
export const tipCommentService = new TipCommentService();

/**
 * Convenience service function to intercept a tip donation and generate a public comment.
 * E.g.: generateTipComment({ postId: 'post_1', donor: currentUser, amount: 20 })
 */
export const interceptTipDonation = (
  payload: TipDonationPayload,
  options?: TipCommentInterceptorOptions
): PostComment => {
  return tipCommentService.interceptTipDonation(payload, options);
};

export const formatTipComment = (
  username: string,
  amount: number,
  message?: string,
  options?: TipCommentInterceptorOptions
): string => {
  return tipCommentService.formatTipText(username, amount, message, options);
};
