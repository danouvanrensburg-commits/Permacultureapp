import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Flag,
  Users,
  ShieldAlert,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Sparkles,
  ExternalLink,
  Clock,
  Check,
  X,
  RefreshCw,
  Eye,
  FileText,
  MessageCircle,
  Layers,
  ChevronRight,
  User as UserIcon,
  Ban,
  Send,
  Mail,
  Lock,
  AlertCircle,
  Tv,
  Newspaper,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { usePermaculture, INITIAL_MODERATION_REPORTS } from '../context/PermacultureContext';
import {
  UserProfile,
  CommunityPost,
  ChatMessage,
  PLATFORM_FEE_RATE,
  ModerationReport,
  ModerationContentType,
  ModerationStatus,
  ModerationSeverity
} from '../types';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

export type AdminTab = 'financials' | 'payouts' | 'moderation' | 'users';

export interface PayoutRequest {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_username: string;
  creator_avatar: string;
  amount_usd: number;
  rain_drops_deducted: number;
  payment_method: 'Stripe Connect' | 'Wise Direct' | 'PayPal Payout' | 'Direct IBAN';
  account_identifier: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
}

// Role guard check: returns true if user is authorized platform administrator
export const isUserAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  if (user.is_admin === true) return true;
  if (
    user.email &&
    (user.email.toLowerCase() === 'danou@onshow.properties' ||
      user.email.toLowerCase().includes('admin') ||
      user.email.toLowerCase() === 'admin@permacultureapp.com')
  ) {
    return true;
  }
  if (
    user.id === 'user_danou' ||
    user.username === 'danou_van_rensburg' ||
    user.id === 'user_current'
  ) {
    return true;
  }
  return false;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const {
    currentUser,
    allUsers,
    posts,
    messages,
    channels,
    transactions,
    deletePost,
    deleteMessage,
    moderationReports,
    dismissReport,
    removeReportedContent,
    warnReportedUser,
    suspendUserAccount
  } = usePermaculture();

  // Admin Role Guard: redirect non-admin accounts immediately back to /feed
  useEffect(() => {
    if (!isUserAdmin(currentUser)) {
      navigate('feed');
    }
  }, [currentUser, navigate]);

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('financials');

  // Notification toast
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // ------------------------------------------------------------
  // TAB 1: FINANCIALS & FEES (Fixed 5.0% Ecosystem Standard Rate)
  // ------------------------------------------------------------
  const FIXED_PLATFORM_FEE_RATE = 0.05; // Fixed 5.0% Ecosystem Standard Rate ($0.01 per 20 Rain Drops)

  // Calculate high-level financial metrics from live context
  // Gross Circulating Rain Drops: total unspent Rain Drops in system
  const totalCirculatingRainDrops = allUsers.reduce(
    (sum, u) => sum + (u.moments_balance || 0),
    0
  );
  
  // Total transaction gross volume (Rain Drops & USD)
  const completedTxs = transactions.filter(t => t.status === 'completed');
  const grossUsdVolume = completedTxs.reduce((sum, t) => {
    if (t.type === 'topup_purchase') return sum + t.amount / 100;
    return sum;
  }, 1450.0);

  // Platform Fee Net Cut: locked strictly at 5.0% ($0.01 per 20 Rain Drops)
  const totalFeeCollectedUsd = Number((grossUsdVolume * FIXED_PLATFORM_FEE_RATE).toFixed(2));
  
  // Creator Payouts Processed: net creator payouts delivered (95.0%)
  const creatorPayoutsProcessedUsd = Number((grossUsdVolume * (1 - FIXED_PLATFORM_FEE_RATE)).toFixed(2));
  
  // Reserve Treasury Backing: total backing solvency in ecosystem reserve
  const reserveTreasuryUsd = Number(((totalCirculatingRainDrops / 100) + totalFeeCollectedUsd).toFixed(2));

  // ------------------------------------------------------------
  // TAB 2: PAYOUT APPROVALS STATE
  // ------------------------------------------------------------
  const [payoutList, setPayoutList] = useState<PayoutRequest[]>([
    {
      id: 'po_req_101',
      creator_id: 'user_geoff',
      creator_name: 'Geoff Lawton',
      creator_username: 'geoff_lawton',
      creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      amount_usd: 285.0,
      rain_drops_deducted: 30000,
      payment_method: 'Stripe Connect',
      account_identifier: 'acct_1NZgeoffL9382',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'pending'
    },
    {
      id: 'po_req_102',
      creator_id: 'user_elena',
      creator_name: 'Dr. Elena Rostova',
      creator_username: 'elena_perma',
      creator_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      amount_usd: 142.5,
      rain_drops_deducted: 15000,
      payment_method: 'Wise Direct',
      account_identifier: 'elena.rostova@mycelium.edu',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'pending'
    },
    {
      id: 'po_req_103',
      creator_id: 'user_kai',
      creator_name: 'Kai Tanaka',
      creator_username: 'kai_syntropic',
      creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      amount_usd: 95.0,
      rain_drops_deducted: 10000,
      payment_method: 'PayPal Payout',
      account_identifier: 'tanaka.agroforestry@gmail.com',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: 'approved',
      approved_by: 'Danou (Admin)'
    },
    {
      id: 'po_req_104',
      creator_id: 'user_willow',
      creator_name: 'Willow Sage',
      creator_username: 'willow_permaculture',
      creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      amount_usd: 190.0,
      rain_drops_deducted: 20000,
      payment_method: 'Direct IBAN',
      account_identifier: 'NL91ABNA0417283921',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'approved',
      approved_by: 'Danou (Admin)'
    }
  ]);

  const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pendingPayoutsUsd = payoutList
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount_usd, 0);
  const pendingPayoutsCount = payoutList.filter(p => p.status === 'pending').length;

  const handleApprovePayout = (id: string) => {
    setPayoutList(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: 'approved', approved_by: `${currentUser.full_name} (Admin)` }
          : p
      )
    );
    showNotice('✅ Payout request approved and scheduled for automated batch disbursement.');
  };

  const handleRejectPayout = (id: string) => {
    setPayoutList(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: 'rejected', rejection_reason: 'Hold flagged for KYC compliance re-check' }
          : p
      )
    );
    showNotice('⚠️ Payout placed on hold. Creator notified for compliance check.');
  };

  // ------------------------------------------------------------
  // TAB 3: CONTENT MODERATION STATE & ACTIONS
  // ------------------------------------------------------------
  // Live reports from context with fallback to INITIAL_MODERATION_REPORTS
  const reportsList: ModerationReport[] =
    moderationReports && moderationReports.length > 0
      ? moderationReports
      : INITIAL_MODERATION_REPORTS;

  // Filter states
  const [moderationFilter, setModerationFilter] = useState<'pending' | 'dismissed' | 'actioned' | 'all'>('pending');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'feed_post' | 'profile_post' | 'bush_tv_chat'>('all');
  const [moderationSearch, setModerationSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Modals for admin actions
  const [banModalReport, setBanModalReport] = useState<ModerationReport | null>(null);
  const [banReasonPreset, setBanReasonPreset] = useState<string>('Spam, unsolicited affiliate marketing, or commercial product shilling');
  const [banCustomNotes, setBanCustomNotes] = useState<string>('');

  const [warnModalReport, setWarnModalReport] = useState<ModerationReport | null>(null);
  const [warnMessageText, setWarnMessageText] = useState<string>('');

  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // Quick Action: Dismiss Report
  const handleDismissReport = (id: string) => {
    dismissReport(id, 'Report reviewed and dismissed as non-violating. Content remains active in feeds.');
    showNotice('✓ Report dismissed as non-violating. Content remains active in feeds.');
  };

  // Quick Action: Remove Content
  const handleRemoveReportedContent = (report: ModerationReport) => {
    removeReportedContent(report.id, 'Content soft-deleted across all platform feeds and channels.');
    showNotice('🗑️ Content soft-deleted permanently from community discovery.');
  };

  // Quick Action: Warn User (Open Modal)
  const handleOpenWarnModal = (report: ModerationReport) => {
    setWarnModalReport(report);
    const contentLabel =
      report.content_type === 'feed_post'
        ? 'Feed Post'
        : report.content_type === 'profile_post'
        ? 'Profile Post'
        : 'Bush TV Chat Message';

    setWarnMessageText(
      `Hello ${report.author_name},\n\nYour ${contentLabel} has been reviewed by platform administrators following community reports. It was confirmed to breach our Permaculture Community Standards:\n\n• Infraction Claim: ${report.reason}\n• Flagged Content Excerpt: "${report.content_snippet}"\n\nThis message serves as your official automated administrative warning. Further violations will result in immediate account suspension and freezing of your Rain Drops wallet balance.\n\n— Platform Stewardship Team`
    );
  };

  const handleConfirmWarn = () => {
    if (!warnModalReport) return;
    warnReportedUser(warnModalReport.id, warnMessageText);
    showNotice(`⚠️ Automated official warning dispatched to @${warnModalReport.author_username}.`);
    setWarnModalReport(null);
  };

  // Quick Action: Ban / Suspend Account (Open Modal)
  const handleOpenBanModal = (report: ModerationReport) => {
    setBanModalReport(report);
    setBanReasonPreset(
      report.reason.toLowerCase().includes('spam')
        ? 'Spam, unsolicited affiliate marketing, or commercial product shilling'
        : report.reason.toLowerCase().includes('harass') || report.reason.toLowerCase().includes('abuse')
        ? 'Hostile conduct, harassment, or abusive language'
        : report.reason.toLowerCase().includes('crypto') || report.reason.toLowerCase().includes('bot')
        ? 'Cryptocurrency, token pump, or financial scam bot'
        : 'Severe platform Terms of Service violation'
    );
    setBanCustomNotes('');
  };

  const handleConfirmBan = () => {
    if (!banModalReport) return;
    const finalReason = `${banReasonPreset}${banCustomNotes.trim() ? ` — Notes: ${banCustomNotes.trim()}` : ''}`;
    suspendUserAccount(banModalReport.author_id, banModalReport.id, finalReason);
    setUserList(prev =>
      prev.map(u => (u.id === banModalReport.author_id ? { ...u, status: 'suspended' } : u))
    );
    showNotice(`🚫 Account @${banModalReport.author_username} suspended and wallet frozen.`);
    setBanModalReport(null);
  };

  // ------------------------------------------------------------
  // TAB 4: USER MANAGEMENT STATE
  // ------------------------------------------------------------
  const [userList, setUserList] = useState<UserProfile[]>(() => {
    return allUsers.map(u => ({
      ...u,
      email: u.email || `${u.username}@permacultureapp.com`,
      is_admin: isUserAdmin(u),
      status: u.status || 'active'
    }));
  });

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'creators' | 'admins' | 'vip'>('all');

  const handleToggleAdminStatus = (targetUserId: string) => {
    setUserList(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          const newAdmin = !u.is_admin;
          showNotice(
            newAdmin
              ? `👑 Platform Admin privileges granted to @${u.username}`
              : `Admin privileges revoked for @${u.username}`
          );
          return { ...u, is_admin: newAdmin };
        }
        return u;
      })
    );
  };

  const handleToggleUserSuspension = (targetUserId: string) => {
    setUserList(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
          showNotice(
            newStatus === 'suspended'
              ? `🚫 Account @${u.username} has been suspended.`
              : `Account @${u.username} has been re-activated.`
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleInjectRainDropsBonus = (targetUserId: string, drops: number) => {
    setUserList(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          return { ...u, moments_balance: (u.moments_balance || 0) + drops };
        }
        return u;
      })
    );
    showNotice(`💧 Granted +${drops.toLocaleString()} Rain Drops bonus to user balance!`);
  };

  const filteredUsers = userList.filter(u => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.location && u.location.toLowerCase().includes(userSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (userRoleFilter === 'creators') return u.is_creator;
    if (userRoleFilter === 'admins') return u.is_admin;
    if (userRoleFilter === 'vip') return u.tier === 'vip';
    return true;
  });

  // Guard view while redirecting if not admin
  if (!isUserAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-[#070b09] flex flex-col items-center justify-center p-6 text-center text-stone-200">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-stone-100">Restricted Admin Area</h2>
        <p className="text-xs text-stone-400 mt-1 max-w-sm">
          Redirecting authorized stewards back to the community feed...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b09] text-stone-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors select-none">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Floating Feedback Notice */}
        {toastNotice && (
          <div className="fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-[#0f1714] border border-amber-500/60 shadow-2xl text-stone-100 text-xs font-semibold animate-in slide-in-from-top duration-200">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* CLEAN HEADER DISPLAY                                         */}
        {/* ============================================================ */}
        <header className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-950/40">
                <Crown className="h-5 w-5 fill-stone-950/30" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight flex items-center space-x-2.5">
                  <span>Platform Command Center</span>
                </h1>
                <p className="text-xs text-stone-400">
                  Global supervision, monetary policy, creator disbursements, and ecosystem integrity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center">
            {/* Active Platform Admin Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono shadow-sm">
              <ShieldAlert className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>Platform Admin</span>
            </div>

            {/* Quick Link back to Main App Feed */}
            <button
              onClick={() => navigate('feed')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#15231e] hover:bg-emerald-500 hover:text-stone-950 border border-[#243a31] text-stone-200 text-xs font-bold transition-all cursor-pointer group"
              title="Return to Community Feed"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Feed</span>
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* SLEEK SUB-TAB NAVIGATION BAR (4 SECTION TOGGLES)             */}
        {/* ============================================================ */}
        <div className="w-full overflow-x-auto scrollbar-none pb-1">
          <nav className="flex flex-nowrap items-center gap-2 p-1.5 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-lg min-w-max sm:min-w-0 sm:w-full">
            {/* 1. 📊 Financials & Fees */}
            <button
              type="button"
              onClick={() => setActiveTab('financials')}
              className={`flex-1 min-w-[160px] sm:min-w-0 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'financials'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>📊 Financials & Fees</span>
            </button>

            {/* 2. 🛡️ Payout Approvals */}
            <button
              type="button"
              onClick={() => setActiveTab('payouts')}
              className={`flex-1 min-w-[170px] sm:min-w-0 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer relative shrink-0 whitespace-nowrap ${
                activeTab === 'payouts'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>🛡️ Payout Approvals</span>
              {payoutList.filter(p => p.status === 'pending').length > 0 && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-1 ${
                  activeTab === 'payouts' ? 'bg-stone-950 text-emerald-300' : 'bg-amber-500 text-stone-950'
                }`}>
                  {payoutList.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>

            {/* 3. 🚩 Content Moderation */}
            <button
              type="button"
              onClick={() => setActiveTab('moderation')}
              className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer relative shrink-0 whitespace-nowrap ${
                activeTab === 'moderation'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
              }`}
            >
              <Flag className="h-4 w-4 shrink-0" />
              <span>🚩 Content Moderation</span>
              {reportsList.filter(r => r.status === 'pending').length > 0 && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-1 ${
                  activeTab === 'moderation' ? 'bg-stone-950 text-emerald-300' : 'bg-red-500 text-white animate-pulse'
                }`}>
                  {reportsList.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

            {/* 4. 👥 User Management */}
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex-1 min-w-[160px] sm:min-w-0 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>👥 User Management</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-1 ${
                activeTab === 'users' ? 'bg-stone-950/30 text-stone-950' : 'bg-[#1b2b24] text-stone-400'
              }`}>
                {userList.length}
              </span>
            </button>
          </nav>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: 📊 FINANCIALS & FEES (ACTIVE BY DEFAULT)              */}
        {/* ============================================================ */}
        {activeTab === 'financials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Refined Financial Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gross Circulating Rain Drops */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">Gross Circulating Rain Drops</span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Droplets className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-cyan-300">
                  {totalCirculatingRainDrops.toLocaleString()} 💧
                </p>
                <div className="flex items-center text-[11px] text-stone-400 space-x-1 font-mono">
                  <span className="text-stone-300 font-semibold">≈ ${(totalCirculatingRainDrops / 100).toFixed(2)} USD</span>
                  <span>·</span>
                  <span className="text-stone-500">(100 Drops = $1.00 USD)</span>
                </div>
              </div>

              {/* Card 2: Platform Fee Net Cut (5%) */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">Platform Fee Net Cut (5%)</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-emerald-400">
                  ${totalFeeCollectedUsd.toFixed(2)} USD
                </p>
                <div className="flex items-center text-[11px] text-stone-400 space-x-1 font-mono">
                  <span className="text-emerald-400 font-bold">5.0% Standard Rate</span>
                  <span>·</span>
                  <span className="text-stone-500">($0.01 per 20 💧)</span>
                </div>
              </div>

              {/* Card 3: Creator Payouts Processed (95%) */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">Creator Payouts Processed (95%)</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-amber-300">
                  ${creatorPayoutsProcessedUsd.toFixed(2)} USD
                </p>
                <div className="flex items-center text-[11px] text-stone-400 space-x-1 font-mono">
                  <span className="text-amber-400 font-bold">95.0% Net Delivered</span>
                  <span>·</span>
                  <span className="text-stone-500">($4.75 per 🪣 Bucket)</span>
                </div>
              </div>

              {/* Card 4: Reserve Treasury Backing */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">Reserve Treasury Backing</span>
                  <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-teal-300">
                  ${reserveTreasuryUsd.toFixed(2)} USD
                </p>
                <div className="flex items-center text-[11px] text-stone-400 space-x-1 font-mono">
                  <span className="text-teal-400 font-bold">100% Solvency Backed</span>
                  <span>·</span>
                  <span className="text-stone-500">Ecosystem reserve</span>
                </div>
              </div>
            </div>

            {/* Fixed Platform Fee Policy Banner */}
            <div className="rounded-2xl bg-[#0f1714] border border-[#1b2b24] p-4.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-100 text-sm flex items-center space-x-2">
                    <span>Fixed 5.0% Ecosystem Standard Rate</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PERMANENT POLICY
                    </span>
                  </h4>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Platform fees are locked permanently to a fixed 5.0% Ecosystem Standard Rate ($0.01 per 20 Rain Drops • $0.25 per Water Bucket 🪣). Creators receive 95.0% direct net proceeds with no hidden deductions.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono shrink-0 pl-12 sm:pl-0">
                <div className="text-left sm:text-right">
                  <span className="text-stone-500 block text-[10px] uppercase font-sans font-semibold">Creator Share</span>
                  <span className="text-emerald-400 font-bold text-sm">95.0%</span>
                </div>
                <div className="text-left sm:text-right border-l border-[#1b2b24] pl-4">
                  <span className="text-stone-500 block text-[10px] uppercase font-sans font-semibold">Platform Fee</span>
                  <span className="text-cyan-400 font-bold text-sm">5.0%</span>
                </div>
              </div>
            </div>

            {/* Clean Platform Monetary Ledger Table */}
            <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b24] pb-4">
                <div className="flex items-center space-x-2.5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-stone-100 text-sm">
                    Platform Monetary Ledger (Recent Transactions)
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
                  <span>Fee Model: <strong className="text-emerald-400">5.0% Fixed Rate</strong></span>
                  <span>·</span>
                  <span>{transactions.length} Total Entries</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b2b24] text-stone-400 text-[11px] uppercase font-semibold tracking-wider font-mono">
                      <th className="pb-3 pr-4">TX Hash / ID</th>
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Counterparty</th>
                      <th className="pb-3 px-3 text-right">Gross Drops</th>
                      <th className="pb-3 px-3 text-right text-emerald-400">Net Creator (95%)</th>
                      <th className="pb-3 px-3 text-right text-cyan-400">Platform Fee (5%)</th>
                      <th className="pb-3 px-3 text-center">Status</th>
                      <th className="pb-3 pl-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15231e]">
                    {transactions.slice(0, 8).map(tx => {
                      const grossDrops = tx.amount;
                      const netDrops = Math.round(grossDrops * 0.95);
                      const netUsd = ((grossDrops * 0.95) / 100).toFixed(2);
                      const feeUsd = ((grossDrops * 0.05) / 100).toFixed(2);
                      const grossUsd = (grossDrops / 100).toFixed(2);

                      return (
                        <tr key={tx.id} className="hover:bg-[#121c18] transition-colors">
                          <td className="py-3.5 pr-4 font-mono text-[11px] text-stone-400">
                            <span className="text-stone-300 font-semibold">{tx.tx_hash.slice(0, 14)}...</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-stone-200 capitalize">
                              {tx.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-stone-300 font-medium">
                            {tx.counterparty_name}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono">
                            <div className="font-bold text-cyan-300">
                              {grossDrops.toLocaleString()} 💧
                            </div>
                            <div className="text-[10px] text-stone-500">
                              ${grossUsd} USD
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono">
                            <div className="font-bold text-emerald-400">
                              ${netUsd} USD
                            </div>
                            <div className="text-[10px] text-emerald-500/80">
                              {netDrops.toLocaleString()} 💧 (95%)
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono">
                            <div className="font-bold text-cyan-400">
                              ${feeUsd} USD
                            </div>
                            <div className="text-[10px] text-cyan-500/80">
                              {(grossDrops * 0.05).toFixed(0)} 💧 (5%)
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 pl-3 text-right font-mono text-[11px] text-stone-400">
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 🛡️ PAYOUT APPROVALS                                   */}
        {/* ============================================================ */}
        {activeTab === 'payouts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-stone-400">Filter Requests:</span>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPayoutFilter(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      payoutFilter === tab
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
                    }`}
                  >
                    {tab} ({tab === 'all' ? payoutList.length : payoutList.filter(p => p.status === tab).length})
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-400 font-mono">
                Pending Volume:{' '}
                <strong className="text-amber-400">
                  ${payoutList.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount_usd, 0).toFixed(2)} USD
                </strong>
              </div>
            </div>

            {/* Payout Requests Cards */}
            <div className="space-y-3.5">
              {payoutList
                .filter(p => payoutFilter === 'all' || p.status === payoutFilter)
                .map(payout => (
                  <div
                    key={payout.id}
                    className="p-5 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={payout.creator_avatar}
                        alt={payout.creator_name}
                        className="h-12 w-12 rounded-2xl object-cover ring-1 ring-amber-500/40"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-stone-100 text-sm">
                            {payout.creator_name}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-mono">
                            @{payout.creator_username}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5 flex items-center space-x-2 font-mono">
                          <span>{payout.payment_method}: <strong className="text-stone-300">{payout.account_identifier}</strong></span>
                          <span>·</span>
                          <span>{new Date(payout.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-[#1b2b24]">
                      <div className="text-left md:text-right">
                        <p className="text-base font-extrabold font-mono text-emerald-400">
                          ${payout.amount_usd.toFixed(2)} USD
                        </p>
                        <p className="text-[11px] text-cyan-400 font-mono">
                          -{payout.rain_drops_deducted.toLocaleString()} 💧 burned
                        </p>
                      </div>

                      {payout.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRejectPayout(payout.id)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/40 hover:bg-red-500/15 text-red-400 text-xs font-bold transition-all cursor-pointer"
                          >
                            Hold / Reject
                          </button>
                          <button
                            onClick={() => handleApprovePayout(payout.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve & Pay</span>
                          </button>
                        </div>
                      ) : payout.status === 'approved' ? (
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approved ({payout.approved_by || 'Admin'})</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/30">
                          <XCircle className="h-4 w-4" />
                          <span>On Hold / Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: 🚩 CONTENT MODERATION                                 */}
        {/* ============================================================ */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-md flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Pending Review</span>
                  </div>
                  <div className="text-2xl font-black text-stone-100 font-mono mt-1">
                    {reportsList.filter(r => r.status === 'pending').length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-md flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-400/90 flex items-center space-x-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Content Removed</span>
                  </div>
                  <div className="text-2xl font-black text-stone-100 font-mono mt-1">
                    {reportsList.filter(r => r.status === 'removed').length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-md flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-400/90 flex items-center space-x-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>User Warnings</span>
                  </div>
                  <div className="text-2xl font-black text-stone-100 font-mono mt-1">
                    {reportsList.filter(r => r.status === 'warned').length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-md flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400/90 flex items-center space-x-1.5">
                    <Ban className="h-3.5 w-3.5" />
                    <span>Accounts Suspended</span>
                  </div>
                  <div className="text-2xl font-black text-stone-100 font-mono mt-1">
                    {reportsList.filter(r => r.status === 'suspended').length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="p-4 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4">
              {/* Primary Quick Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2b24] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-stone-400 mr-1">Queue Filter:</span>
                  {[
                    {
                      id: 'pending',
                      label: 'Pending Review ⏳',
                      count: reportsList.filter(r => r.status === 'pending').length,
                      color: 'bg-amber-500 text-stone-950 font-black'
                    },
                    {
                      id: 'dismissed',
                      label: 'Dismissed ✓',
                      count: reportsList.filter(r => r.status === 'dismissed').length,
                      color: 'bg-emerald-500 text-stone-950 font-black'
                    },
                    {
                      id: 'actioned',
                      label: 'Actioned / Removed 🛡️',
                      count: reportsList.filter(r => ['removed', 'warned', 'suspended'].includes(r.status)).length,
                      color: 'bg-red-500 text-white font-bold'
                    },
                    {
                      id: 'all',
                      label: 'All Reports 📑',
                      count: reportsList.length,
                      color: 'bg-stone-200 text-stone-900 font-black'
                    }
                  ].map(tab => {
                    const isActive = moderationFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setModerationFilter(tab.id as any)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? `${tab.color} shadow-md`
                            : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isActive ? 'bg-black/25 text-inherit' : 'bg-[#1b2b24] text-stone-400'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  Displaying {reportsList.filter(r => {
                    if (moderationFilter === 'pending') return r.status === 'pending';
                    if (moderationFilter === 'dismissed') return r.status === 'dismissed';
                    if (moderationFilter === 'actioned') return ['removed', 'warned', 'suspended'].includes(r.status);
                    return true;
                  }).filter(r => {
                    if (contentTypeFilter !== 'all' && r.content_type !== contentTypeFilter) return false;
                    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
                    if (moderationSearch.trim()) {
                      const q = moderationSearch.toLowerCase();
                      const matchAuthor = r.author_name?.toLowerCase().includes(q) || r.author_username?.toLowerCase().includes(q);
                      const matchReporter = r.reported_by_name?.toLowerCase().includes(q) || r.reported_by_username?.toLowerCase().includes(q);
                      const matchSnippet = r.content_snippet?.toLowerCase().includes(q) || (r.title && r.title.toLowerCase().includes(q));
                      const matchReason = r.reason?.toLowerCase().includes(q);
                      if (!matchAuthor && !matchReporter && !matchSnippet && !matchReason) return false;
                    }
                    return true;
                  }).length} items
                </div>
              </div>

              {/* Secondary Filters: Search, Content Type, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <Search className="h-4 w-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={moderationSearch}
                    onChange={(e) => setModerationSearch(e.target.value)}
                    placeholder="Search by author, reporter, excerpt, reason..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs focus:outline-none focus:border-emerald-500 placeholder-stone-600"
                  />
                  {moderationSearch && (
                    <button
                      type="button"
                      onClick={() => setModerationSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="md:col-span-4 flex items-center space-x-1.5">
                  <span className="text-[11px] text-stone-400 font-semibold shrink-0">Content Type:</span>
                  <select
                    value={contentTypeFilter}
                    onChange={(e) => setContentTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Content Sources ({reportsList.length})</option>
                    <option value="feed_post">📰 Feed Posts ({reportsList.filter(r => r.content_type === 'feed_post').length})</option>
                    <option value="profile_post">👤 Profile Posts ({reportsList.filter(r => r.content_type === 'profile_post').length})</option>
                    <option value="bush_tv_chat">📺 Bush TV Chat ({reportsList.filter(r => r.content_type === 'bush_tv_chat').length})</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex items-center space-x-1.5">
                  <span className="text-[11px] text-stone-400 font-semibold shrink-0">Severity:</span>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">🚨 High Priority</option>
                    <option value="medium">⚠️ Medium Priority</option>
                    <option value="low">ℹ️ Low Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Cards Queue */}
            {reportsList
              .filter(r => {
                if (moderationFilter === 'pending') return r.status === 'pending';
                if (moderationFilter === 'dismissed') return r.status === 'dismissed';
                if (moderationFilter === 'actioned') return ['removed', 'warned', 'suspended'].includes(r.status);
                return true;
              })
              .filter(r => {
                if (contentTypeFilter !== 'all' && r.content_type !== contentTypeFilter) return false;
                if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
                if (moderationSearch.trim()) {
                  const q = moderationSearch.toLowerCase();
                  const matchAuthor = r.author_name?.toLowerCase().includes(q) || r.author_username?.toLowerCase().includes(q);
                  const matchReporter = r.reported_by_name?.toLowerCase().includes(q) || r.reported_by_username?.toLowerCase().includes(q);
                  const matchSnippet = r.content_snippet?.toLowerCase().includes(q) || (r.title && r.title.toLowerCase().includes(q));
                  const matchReason = r.reason?.toLowerCase().includes(q);
                  if (!matchAuthor && !matchReporter && !matchSnippet && !matchReason) return false;
                }
                return true;
              }).length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0f1714] border border-[#1b2b24] space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-stone-100">Moderation Queue Clear</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  {moderationFilter === 'pending'
                    ? 'No pending reports currently require administrative review. All community content is in good standing!'
                    : 'No reports match the selected filters.'}
                </p>
                {(moderationFilter !== 'pending' || contentTypeFilter !== 'all' || severityFilter !== 'all' || moderationSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setModerationFilter('pending');
                      setContentTypeFilter('all');
                      setSeverityFilter('all');
                      setModerationSearch('');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reportsList
                  .filter(r => {
                    if (moderationFilter === 'pending') return r.status === 'pending';
                    if (moderationFilter === 'dismissed') return r.status === 'dismissed';
                    if (moderationFilter === 'actioned') return ['removed', 'warned', 'suspended'].includes(r.status);
                    return true;
                  })
                  .filter(r => {
                    if (contentTypeFilter !== 'all' && r.content_type !== contentTypeFilter) return false;
                    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
                    if (moderationSearch.trim()) {
                      const q = moderationSearch.toLowerCase();
                      const matchAuthor = r.author_name?.toLowerCase().includes(q) || r.author_username?.toLowerCase().includes(q);
                      const matchReporter = r.reported_by_name?.toLowerCase().includes(q) || r.reported_by_username?.toLowerCase().includes(q);
                      const matchSnippet = r.content_snippet?.toLowerCase().includes(q) || (r.title && r.title.toLowerCase().includes(q));
                      const matchReason = r.reason?.toLowerCase().includes(q);
                      if (!matchAuthor && !matchReporter && !matchSnippet && !matchReason) return false;
                    }
                    return true;
                  })
                  .map(report => {
                    const isPending = report.status === 'pending';
                    const isRemoved = report.status === 'removed';
                    const isWarned = report.status === 'warned';
                    const isSuspended = report.status === 'suspended';
                    const isDismissed = report.status === 'dismissed';

                    return (
                      <div
                        key={report.id}
                        className="p-5 sm:p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4 hover:border-[#284136] transition-all"
                      >
                        {/* Top Meta Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2b24] pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Priority Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center space-x-1 ${
                                report.severity === 'high'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : report.severity === 'medium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-stone-500/20 text-stone-400 border border-stone-500/30'
                              }`}
                            >
                              {report.severity === 'high' ? (
                                <AlertCircle className="h-3 w-3 shrink-0" />
                              ) : report.severity === 'medium' ? (
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                              ) : (
                                <Info className="h-3 w-3 shrink-0" />
                              )}
                              <span>{report.severity} Priority</span>
                            </span>

                            {/* Content Type Badge */}
                            {report.content_type === 'feed_post' ? (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                                <Newspaper className="h-3 w-3" />
                                <span>Feed Post</span>
                              </span>
                            ) : report.content_type === 'profile_post' ? (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
                                <UserIcon className="h-3 w-3" />
                                <span>Profile Post</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                                <Tv className="h-3 w-3" />
                                <span>Bush TV Chat</span>
                              </span>
                            )}

                            {/* Content ID Chip */}
                            <span className="text-[10px] text-stone-500 font-mono px-2 py-0.5 rounded bg-[#090d0b] border border-[#1b2b24]">
                              Ref ID: {report.content_id}
                            </span>
                          </div>

                          {/* Status Badge & Timestamp */}
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center space-x-1 ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : isDismissed
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isRemoved
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isWarned
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              <span>
                                {isPending && '⏳ Pending Review'}
                                {isDismissed && '✓ Dismissed (Active)'}
                                {isRemoved && '🗑️ Content Removed'}
                                {isWarned && '⚠️ User Warned'}
                                {isSuspended && '🚫 Account Suspended'}
                              </span>
                            </span>

                            <span className="text-[11px] text-stone-500 font-mono flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-stone-500" />
                              <span>
                                {new Date(report.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Author & Reporter Details Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090d0b] border border-[#16231d]">
                          {/* Reported Author */}
                          <div className="flex items-center space-x-3">
                            <img
                              src={report.author_avatar}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-stone-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-stone-100 text-sm">
                                  {report.author_name}
                                </span>
                                <span className="text-xs text-stone-400 font-mono">
                                  @{report.author_username}
                                </span>
                                {report.author_badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {report.author_badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-500 font-mono flex items-center space-x-2">
                                <span>UID: {report.author_id}</span>
                                <span>·</span>
                                <span className={isSuspended ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                                  {isSuspended ? 'Status: Account Suspended 🔒' : 'Status: Active Steward'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Reporter Details */}
                          <div className="flex items-center space-x-2 text-xs text-stone-400 border-t sm:border-t-0 sm:border-l border-[#1b2b24] pt-2 sm:pt-0 sm:pl-4">
                            <Flag className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>
                              Reported by:{' '}
                              <strong className="text-stone-200">@{report.reported_by_username}</strong>{' '}
                              <span className="text-stone-500">({report.reported_by_name})</span>
                            </span>
                          </div>
                        </div>

                        {/* Violation Reason Strip */}
                        <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs font-semibold">
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                          <div>
                            <span className="text-red-400 font-bold">Violation Claim:</span>{' '}
                            <span className="text-stone-200">{report.reason}</span>
                          </div>
                        </div>

                        {/* Post Text & Media Preview */}
                        <div className="space-y-2">
                          {report.title && (
                            <h4 className="font-bold text-stone-100 text-sm flex items-center space-x-2">
                              <span>{report.title}</span>
                            </h4>
                          )}

                          <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-[#1b2b24] space-y-2.5">
                            <p className="text-xs text-stone-300 italic leading-relaxed">
                              "{report.content_snippet}"
                            </p>

                            {/* Media Preview Thumbnail */}
                            {report.media_urls && report.media_urls.length > 0 && (
                              <div className="pt-2 border-t border-[#1b2b24]/60">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center space-x-1">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>Reported Media Preview ({report.media_urls.length})</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {report.media_urls.map((url, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => setPreviewMediaUrl(url)}
                                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#23382d] max-w-xs"
                                    >
                                      <img
                                        src={url}
                                        alt="Reported content attachment"
                                        className="h-28 w-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                                        <Eye className="h-4 w-4" />
                                        <span>Inspect Media</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Resolution Notes (if actioned) */}
                        {report.admin_notes && (
                          <div className="p-3 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-xs space-y-1">
                            <div className="flex items-center space-x-1.5 text-stone-400 font-bold">
                              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Administrative Action Record</span>
                              {report.action_by && (
                                <span className="text-stone-500 font-normal">
                                  · by @{report.action_by}
                                </span>
                              )}
                            </div>
                            <p className="text-stone-300 text-[11px] font-mono">
                              {report.admin_notes}
                            </p>
                          </div>
                        )}

                        {/* Admin Quick Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1b2b24]">
                          <div className="text-[11px] text-stone-500 font-mono">
                            Ecosystem Enforcement: Quick Actions
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* [Dismiss Report]: Clears report flag and leaves post active */}
                            <button
                              type="button"
                              onClick={() => handleDismissReport(report.id)}
                              className="px-3.5 py-1.5 rounded-xl border border-stone-600 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 hover:border-stone-500"
                              title="Clears the report flag and leaves the post active"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Dismiss Report</span>
                            </button>

                            {/* [Remove Content]: Soft-deletes/removes post from feeds and Bush TV */}
                            <button
                              type="button"
                              onClick={() => handleRemoveReportedContent(report)}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                              title="Soft-deletes/removes the post from feeds and Bush TV"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove Content</span>
                            </button>

                            {/* [Warn User]: Sends automated warning notification/email to creator */}
                            <button
                              type="button"
                              onClick={() => handleOpenWarnModal(report)}
                              className="px-3.5 py-1.5 rounded-xl border border-amber-500/50 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                              title="Sends an automated warning notification/email to the creator"
                            >
                              <Mail className="h-3.5 w-3.5 text-amber-400" />
                              <span>Warn User</span>
                            </button>

                            {/* [Ban / Suspend Account]: Opens confirmation modal to suspend offending user account and freeze wallet */}
                            <button
                              type="button"
                              onClick={() => handleOpenBanModal(report)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-900 to-red-900 hover:from-rose-800 hover:to-red-800 text-rose-100 border border-red-500/40 text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                              title="Opens a confirmation modal to suspend the offending user's account and freeze their wallet"
                            >
                              <Ban className="h-3.5 w-3.5 text-red-300" />
                              <span>Ban / Suspend Account</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: 👥 USER MANAGEMENT                                    */}
        {/* ============================================================ */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search & Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-[#0f1714] border border-[#1b2b24] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, @username, or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[#090d0b] border border-[#243a31] pl-9 pr-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-400 font-semibold">Role:</span>
                {(['all', 'creators', 'admins', 'vip'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      userRoleFilter === role
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-[#15231e]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-5 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1b2b24] text-stone-400 text-[11px] uppercase font-semibold tracking-wider font-mono">
                    <th className="pb-3 pr-3">Steward</th>
                    <th className="pb-3 px-3">Email Address</th>
                    <th className="pb-3 px-3">Role & Badges</th>
                    <th className="pb-3 px-3 text-right">Balance 💧</th>
                    <th className="pb-3 px-3 text-center">Status</th>
                    <th className="pb-3 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15231e]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#121c18] transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="h-9 w-9 rounded-xl object-cover ring-1 ring-emerald-500/30"
                          />
                          <div>
                            <p className="font-bold text-stone-100">{user.full_name}</p>
                            <p className="text-[11px] text-stone-400 font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-stone-300">
                        {user.email || `${user.username}@permacultureapp.com`}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {user.is_admin && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Admin
                            </span>
                          )}
                          {user.badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {user.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-500 font-mono uppercase">
                            {user.tier}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-300">
                        {(user.moments_balance || 0).toLocaleString()} 💧
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          user.status === 'suspended'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3.5 pl-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleInjectRainDropsBonus(user.id, 500)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Inject +500 Rain Drops Bonus (Admin Gift)"
                          >
                            <Droplets className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAdminStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.is_admin
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'hover:bg-amber-500/10 text-stone-400 hover:text-amber-400'
                            }`}
                            title={user.is_admin ? 'Revoke Admin' : 'Make Platform Admin'}
                          >
                            <Crown className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserSuspension(user.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'suspended'
                                ? 'bg-red-500/20 text-red-400'
                                : 'hover:bg-red-500/10 text-stone-400 hover:text-red-400'
                            }`}
                            title={user.status === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                          >
                            {user.status === 'suspended' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: BAN / SUSPEND ACCOUNT & FREEZE WALLET                 */}
        {/* ============================================================ */}
        {banModalReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-[#0f1714] border border-red-500/40 p-6 shadow-2xl space-y-5 text-stone-100 relative">
              <button
                type="button"
                onClick={() => setBanModalReport(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-[#1b2b24] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Ban className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-100">
                    Suspend User Account & Freeze Wallet
                  </h3>
                  <p className="text-xs text-red-300/80">
                    Strict administrative enforcement action
                  </p>
                </div>
              </div>

              {/* Target Account Summary */}
              <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-[#1b2b24] flex items-center space-x-3">
                <img
                  src={banModalReport.author_avatar}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-red-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-stone-100 truncate">
                    {banModalReport.author_name}
                  </div>
                  <div className="text-xs text-stone-400 font-mono">
                    @{banModalReport.author_username}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate">
                    UID: {banModalReport.author_id}
                  </div>
                </div>
              </div>

              {/* Penalties Notice */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-red-950/20 border border-red-900/40 text-xs">
                <div className="font-bold text-red-400 flex items-center space-x-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Enforcement Penalties Applied Upon Confirmation:</span>
                </div>
                <ul className="space-y-1.5 text-stone-300 pl-5 list-disc text-[11px]">
                  <li>
                    <strong className="text-stone-100">Freeze Rain Drops & Moments Wallet:</strong> Offending user cannot cash out, tip, convert, or withdraw funds.
                  </li>
                  <li>
                    <strong className="text-stone-100">Revoke Community Access:</strong> Account login suspended and profile hidden from community discovery.
                  </li>
                  <li>
                    <strong className="text-stone-100">Soft-Delete Violating Content:</strong> The reported content will be permanently removed from feeds and live chat.
                  </li>
                </ul>
              </div>

              {/* Ban Reason Preset */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  Primary Violation Reason:
                </label>
                <select
                  value={banReasonPreset}
                  onChange={(e) => setBanReasonPreset(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Spam, unsolicited affiliate marketing, or commercial product shilling">
                    Spam, unsolicited affiliate marketing, or commercial product shilling
                  </option>
                  <option value="Hostile conduct, harassment, or abusive language">
                    Hostile conduct, harassment, or abusive language
                  </option>
                  <option value="Cryptocurrency, token pump, or financial scam bot">
                    Cryptocurrency, token pump, or financial scam bot
                  </option>
                  <option value="Counter-regenerative misinformation & intentional damage">
                    Counter-regenerative misinformation & intentional damage
                  </option>
                  <option value="Severe platform Terms of Service violation">
                    Severe platform Terms of Service violation
                  </option>
                </select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  Administrative Audit Notes (Optional):
                </label>
                <textarea
                  value={banCustomNotes}
                  onChange={(e) => setBanCustomNotes(e.target.value)}
                  placeholder="Internal rationale or reference ticket number..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs focus:outline-none focus:border-red-500 placeholder-stone-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBanModalReport(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-600 hover:bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBan}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-950/50 flex items-center space-x-2 cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  <span>Confirm Ban & Freeze Wallet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: WARN USER (AUTOMATED OFFICIAL WARNING DISPATCH)       */}
        {/* ============================================================ */}
        {warnModalReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-[#0f1714] border border-amber-500/40 p-6 shadow-2xl space-y-5 text-stone-100 relative">
              <button
                type="button"
                onClick={() => setWarnModalReport(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-[#1b2b24] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-100">
                    Issue Automated Official Warning
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Dispatches official notice to creator account
                  </p>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-[#1b2b24] flex items-center space-x-3">
                <img
                  src={warnModalReport.author_avatar}
                  alt=""
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-amber-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-stone-100 truncate">
                    Recipient: {warnModalReport.author_name}
                  </div>
                  <div className="text-xs text-stone-400 font-mono">
                    @{warnModalReport.author_username}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-mono truncate">
                    Claim: {warnModalReport.reason}
                  </div>
                </div>
              </div>

              {/* Warning Message Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  Warning Notification Dispatch Content:
                </label>
                <textarea
                  value={warnMessageText}
                  onChange={(e) => setWarnMessageText(e.target.value)}
                  rows={6}
                  className="w-full p-3.5 rounded-2xl bg-[#090d0b] border border-[#1b2b24] text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                />
                <p className="text-[10px] text-stone-500">
                  * An automated copy will be transmitted to the user's notification mailbox and logged in security audits.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWarnModalReport(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-600 hover:bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWarn}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-950/50 flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Warning Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: MEDIA PREVIEW LIGHTBOX                                */}
        {/* ============================================================ */}
        {previewMediaUrl && (
          <div
            onClick={() => setPreviewMediaUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden bg-[#0f1714] border border-[#1b2b24] p-3 shadow-2xl flex flex-col items-center cursor-default"
            >
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewMediaUrl}
                alt="Reported content attachment"
                className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-lg"
              />
              <div className="py-2 px-4 text-xs font-mono text-stone-400 text-center truncate max-w-full">
                {previewMediaUrl}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
