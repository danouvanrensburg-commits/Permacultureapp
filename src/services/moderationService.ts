/**
 * Automated Content Moderation & Community Safety Engine
 * Enforces regenerative community standards, automated scam/spam filtering,
 * and reporting workflows across feed posts, comments, and Bush TV messages.
 */

import { ModerationSeverity, ModerationContentType } from '../types';

export interface ContentSafetyResult {
  isSafe: boolean;
  action: 'allow' | 'warn' | 'block';
  flags: string[];
  reason?: string;
  suggestedRemedy?: string;
  autoReport?: {
    reason: string;
    severity: ModerationSeverity;
  };
}

export interface ReportCategoryOption {
  id: string;
  label: string;
  description: string;
  defaultSeverity: ModerationSeverity;
}

export const REPORT_CATEGORIES: ReportCategoryOption[] = [
  {
    id: 'spam_commercial',
    label: 'Unsolicited Spam / Commercial Ad',
    description: 'Repetitive advertising, affiliate spam, or irrelevant commercial promotion',
    defaultSeverity: 'low'
  },
  {
    id: 'harassment_abuse',
    label: 'Harassment or Hostile Conduct',
    description: 'Attacking, belittling, or intimidating other community stewards or creators',
    defaultSeverity: 'high'
  },
  {
    id: 'crypto_scam',
    label: 'Financial Scam or Phishing Link',
    description: 'Crypto airdrops, pyramid schemes, WhatsApp / Telegram investment groups',
    defaultSeverity: 'high'
  },
  {
    id: 'dangerous_ecological_advice',
    label: 'Ecological Hazard / Chemical Toxicity',
    description: 'Promoting hazardous toxic contamination of public waterways, soils, or wildlife',
    defaultSeverity: 'medium'
  },
  {
    id: 'copyright_impersonation',
    label: 'Impersonation or Copyright Infringement',
    description: 'Pretending to be another creator or re-uploading uncredited original works',
    defaultSeverity: 'medium'
  },
  {
    id: 'other',
    label: 'Other Community Guideline Breach',
    description: 'Content that disrupts harmonious permaculture learning or community safety',
    defaultSeverity: 'low'
  }
];

// Blocked keywords (Blatant scams, severe abuse, phishing)
const BLOCKED_PATTERNS = [
  /\b(t\.me\/[a-z0-9_]+|whatsapp\s*\+?[0-9\s-]{8,})/i,
  /\b(crypto\s*airdrop|free\s*tokens|binance\s*giveaway|wallet\s*drainer)\b/i,
  /\b(guaranteed\s*roi|double\s*your\s*money|pump\s*and\s*dump)\b/i,
  /\b(buy\s*followers|buy\s*likes|cheap\s*traffic)\b/i
];

// Flagged / Warning patterns (Borderline spam or prohibited chemical dumping in permaculture zones)
const FLAGGED_PATTERNS = [
  {
    pattern: /\b(dump\s*motor\s*oil|spray\s*neat\s*diesel\s*on\s*soil)\b/i,
    reason: 'Toxic soil contamination practice prohibited in regenerative community spaces',
    severity: 'high' as ModerationSeverity
  },
  {
    pattern: /\b(viagra|casino|slot\s*machine|poker\s*bonus)\b/i,
    reason: 'Unrelated commercial gambling or pharma spam detected',
    severity: 'high' as ModerationSeverity
  },
  {
    pattern: /\b(http[s]?:\/\/[^\s]+)/gi,
    threshold: 3, // 3+ links in a single post is considered link burst
    reason: 'Suspicious multiple external links in single message',
    severity: 'medium' as ModerationSeverity
  }
];

class ContentModerationService {
  /**
   * Scans text for spam, abuse, phishing, or safety violations.
   * Returns a recommendation (allow, warn, or block).
   */
  public evaluateText(text: string): ContentSafetyResult {
    if (!text || !text.trim()) {
      return { isSafe: true, action: 'allow', flags: [] };
    }

    const trimmed = text.trim();
    const flags: string[] = [];

    // 1. Check for immediate hard-block patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isSafe: false,
          action: 'block',
          flags: ['BLOCKED_KEYWORD_MATCH'],
          reason: 'This message contains prohibited links, spam keywords, or financial solicitation that violate community safety rules.',
          suggestedRemedy: 'Please remove external Telegram/WhatsApp links, crypto airdrop references, or unsolicited commercial promotion.'
        };
      }
    }

    // 2. Check for soft flags / warnings
    let autoReportSeverity: ModerationSeverity | undefined;
    let autoReportReason: string | undefined;

    for (const rule of FLAGGED_PATTERNS) {
      if (rule.threshold) {
        const matches = trimmed.match(rule.pattern);
        if (matches && matches.length >= rule.threshold) {
          flags.push('HIGH_LINK_DENSITY');
          autoReportSeverity = rule.severity;
          autoReportReason = rule.reason;
        }
      } else if (rule.pattern.test(trimmed)) {
        flags.push('POTENTIAL_GUIDELINE_BREACH');
        autoReportSeverity = rule.severity;
        autoReportReason = rule.reason;
      }
    }

    // 3. Repeated character / burst spam detection (e.g. 'AAAAAAA!!!!!!' or 'buy now buy now buy now')
    if (/(.)\1{12,}/i.test(trimmed)) {
      flags.push('CHARACTER_FLOOD');
    }

    if (flags.length > 0) {
      return {
        isSafe: true,
        action: 'warn',
        flags,
        reason: autoReportReason || 'Content triggered automated community review flags.',
        autoReport: autoReportReason && autoReportSeverity
          ? { reason: `Automated Shield: ${autoReportReason}`, severity: autoReportSeverity }
          : undefined
      };
    }

    return {
      isSafe: true,
      action: 'allow',
      flags: []
    };
  }

  /**
   * Helper to clean / sanitize user input before rendering
   */
  public sanitizeContent(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  }
}

export const moderationService = new ContentModerationService();
