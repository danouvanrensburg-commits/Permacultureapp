import React, { useState } from 'react';
import {
  Wallet,
  Droplets,
  DollarSign,
  ArrowRightLeft,
  ArrowUpRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  History,
  Building2,
  CreditCard,
  Send,
  Lock,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  Users,
  Flame,
  Download,
  Calendar,
  Layers,
  Sprout,
  Activity,
  Award,
  Compass,
  ArrowDownRight,
  Radio,
  ExternalLink
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

interface CreatorDashboardProps {
  navigate: (route: string) => void;
  initialTab?: 'growth' | 'wallets';
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ navigate, initialTab = 'growth' }) => {
  const {
    currentUser,
    waterBalance,
    earningsBalanceUsd,
    cashOutEarnings,
    convertEarningsToWater,
    openTopUpModal,
    transactions,
    channels,
    posts
  } = usePermaculture();

  // Tab State: 'growth' (Growth & Yield Analytics) vs 'wallets' (Two-Wallet Accounting & Cash Out)
  const [activeTab, setActiveTab] = useState<'growth' | 'wallets'>(initialTab);

  // Growth Analytics Filter States
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [currencyMetric, setCurrencyMetric] = useState<'drops' | 'usd'>('drops');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Cash Out Modal State (Stripe Connect Only)
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState<string>('100');
  const [stripeAccountId, setStripeAccountId] = useState<string>(
    currentUser.username ? `${currentUser.username}@stripe.connect` : 'danou@onshow.properties'
  );
  const [payoutStatusMessage, setPayoutStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Stripe fee calculation: 0.25% + $0.25 standard Stripe Connect payout fee
  const parsedWithdrawal = parseFloat(cashOutAmount) || 0;
  const stripePayoutFee = parsedWithdrawal > 0 ? Number((parsedWithdrawal * 0.0025 + 0.25).toFixed(2)) : 0;
  const netStripeTakeHome = Number(Math.max(0, parsedWithdrawal - stripePayoutFee).toFixed(2));

  // Convert Earnings -> Water State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertAmountUsd, setConvertAmountUsd] = useState<string>('10');
  const [convertStatusMessage, setConvertStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  const minCashOutThreshold = 100.00;
  const isEligibleToCashOut = earningsBalanceUsd >= minCashOutThreshold;
  const cashOutProgressPercent = Math.min(100, Math.round((earningsBalanceUsd / minCashOutThreshold) * 100));

  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashOutAmount);
    if (isNaN(amount) || amount <= 0) return;

    const result = cashOutEarnings(
      amount,
      'Stripe Connect',
      `Account: ${stripeAccountId} (Stripe Fee: -$${stripePayoutFee.toFixed(2)})`
    );
    setPayoutStatusMessage({ success: result.success, text: result.message });

    if (result.success) {
      setTimeout(() => {
        setIsCashOutModalOpen(false);
        setPayoutStatusMessage(null);
      }, 2500);
    }
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(convertAmountUsd);
    if (isNaN(amount) || amount <= 0) return;

    const result = convertEarningsToWater(amount);
    setConvertStatusMessage({ success: result.success, text: result.message });

    if (result.success) {
      setTimeout(() => {
        setIsConvertModalOpen(false);
        setConvertStatusMessage(null);
      }, 2500);
    }
  };

  // Filter transactions related to earnings and water conversions
  const relevantTransactions = transactions.filter(
    tx => tx.type === 'tip_sent' || tx.type === 'cash_out' || tx.type === 'convert_earnings_to_water' || tx.type === 'topup_purchase'
  );

  // Time Range Dataset for Growth Dashboard
  const timeRangeData = {
    '7d': {
      periodLabel: 'Last 7 Days',
      dateRange: 'Sep 26 - Oct 3, 2026',
      totalHarvestedDrops: 3420,
      totalHarvestedUsd: 34.20,
      growthPercent: '+18.4%',
      mrrUsd: 410,
      mrrDrops: 41000,
      mrrGrowth: '+8.2%',
      newSubscribers: 4,
      totalSubscribers: 48,
      liveFiresideViewers: 480,
      liveTipDrops: 1140,
      points: [
        { label: 'Sep 27', drops: 320, usd: 3.20 },
        { label: 'Sep 28', drops: 480, usd: 4.80 },
        { label: 'Sep 29', drops: 410, usd: 4.10 },
        { label: 'Sep 30', drops: 620, usd: 6.20 },
        { label: 'Oct 01', drops: 490, usd: 4.90 },
        { label: 'Oct 02', drops: 540, usd: 5.40 },
        { label: 'Oct 03', drops: 560, usd: 5.60 }
      ],
      breakdown: {
        subscriptions: { percent: 46, amountDrops: 1573, amountUsd: 15.73 },
        firesides: { percent: 34, amountDrops: 1162, amountUsd: 11.62 },
        feedMoments: { percent: 14, amountDrops: 479, amountUsd: 4.79 },
        channelTolls: { percent: 6, amountDrops: 206, amountUsd: 2.06 }
      }
    },
    '30d': {
      periodLabel: 'Last 30 Days',
      dateRange: 'Sep 3 - Oct 3, 2026',
      totalHarvestedDrops: 14850,
      totalHarvestedUsd: 148.50,
      growthPercent: '+24.2%',
      mrrUsd: 410,
      mrrDrops: 41000,
      mrrGrowth: '+12.5%',
      newSubscribers: 6,
      totalSubscribers: 48,
      liveFiresideViewers: 1420,
      liveTipDrops: 4850,
      points: [
        { label: 'Sep 05', drops: 1800, usd: 18.00 },
        { label: 'Sep 10', drops: 2200, usd: 22.00 },
        { label: 'Sep 15', drops: 2100, usd: 21.00 },
        { label: 'Sep 20', drops: 2900, usd: 29.00 },
        { label: 'Sep 25', drops: 2650, usd: 26.50 },
        { label: 'Sep 30', drops: 3200, usd: 32.00 }
      ],
      breakdown: {
        subscriptions: { percent: 48, amountDrops: 7128, amountUsd: 71.28 },
        firesides: { percent: 32, amountDrops: 4752, amountUsd: 47.52 },
        feedMoments: { percent: 14, amountDrops: 2079, amountUsd: 20.79 },
        channelTolls: { percent: 6, amountDrops: 891, amountUsd: 8.91 }
      }
    },
    '90d': {
      periodLabel: 'Last 90 Days',
      dateRange: 'Jul 5 - Oct 3, 2026',
      totalHarvestedDrops: 42600,
      totalHarvestedUsd: 426.00,
      growthPercent: '+31.5%',
      mrrUsd: 410,
      mrrDrops: 41000,
      mrrGrowth: '+28.0%',
      newSubscribers: 18,
      totalSubscribers: 48,
      liveFiresideViewers: 3950,
      liveTipDrops: 13800,
      points: [
        { label: 'Jul', drops: 9500, usd: 95.00 },
        { label: 'Aug', drops: 14200, usd: 142.00 },
        { label: 'Sep', drops: 18900, usd: 189.00 }
      ],
      breakdown: {
        subscriptions: { percent: 50, amountDrops: 21300, amountUsd: 213.00 },
        firesides: { percent: 31, amountDrops: 13206, amountUsd: 132.06 },
        feedMoments: { percent: 13, amountDrops: 5538, amountUsd: 55.38 },
        channelTolls: { percent: 6, amountDrops: 2556, amountUsd: 25.56 }
      }
    },
    'all': {
      periodLabel: 'All Time',
      dateRange: 'Jan 2025 - Present',
      totalHarvestedDrops: 98200,
      totalHarvestedUsd: 982.00,
      growthPercent: '+44.0%',
      mrrUsd: 410,
      mrrDrops: 41000,
      mrrGrowth: 'All time',
      newSubscribers: 48,
      totalSubscribers: 48,
      liveFiresideViewers: 9400,
      liveTipDrops: 31500,
      points: [
        { label: 'Q1 25', drops: 12000, usd: 120.00 },
        { label: 'Q2 25', drops: 21000, usd: 210.00 },
        { label: 'Q3 25', drops: 29000, usd: 290.00 },
        { label: 'Q4 25', drops: 36200, usd: 362.00 }
      ],
      breakdown: {
        subscriptions: { percent: 52, amountDrops: 51064, amountUsd: 510.64 },
        firesides: { percent: 30, amountDrops: 29460, amountUsd: 294.60 },
        feedMoments: { percent: 12, amountDrops: 11784, amountUsd: 117.84 },
        channelTolls: { percent: 6, amountDrops: 5892, amountUsd: 58.92 }
      }
    }
  };

  const currentData = timeRangeData[timeRange];

  // CSV Export Function
  const handleExportCSV = () => {
    const rows = [
      ['Permaculture App - Creator Growth & Stewardship Harvest Report'],
      ['Creator Name', currentUser.full_name],
      ['Creator Handle', `@${currentUser.username}`],
      ['Time Window', currentData.periodLabel, currentData.dateRange],
      ['Generated On', new Date().toISOString()],
      [],
      ['Metric', 'Value (Drops)', 'Value (USD)', 'Context / Equivalents'],
      ['Total Rain Harvested', currentData.totalHarvestedDrops, `$${currentData.totalHarvestedUsd.toFixed(2)}`, `${(currentData.totalHarvestedDrops / 500).toFixed(1)} Buckets`],
      ['Monthly Recurring Rain (MRR)', currentData.mrrDrops, `$${currentData.mrrUsd.toFixed(2)}`, `${currentData.totalSubscribers} Active Guild Members`],
      ['Bush TV Live Fireside Tip Drops', currentData.breakdown.firesides.amountDrops, `$${currentData.breakdown.firesides.amountUsd.toFixed(2)}`, `${currentData.liveFiresideViewers} Live Viewers`],
      ['Guild Subscriptions Yield', currentData.breakdown.subscriptions.amountDrops, `$${currentData.breakdown.subscriptions.amountUsd.toFixed(2)}`, `${currentData.breakdown.subscriptions.percent}% of total`],
      ['Community Feed Moments Yield', currentData.breakdown.feedMoments.amountDrops, `$${currentData.breakdown.feedMoments.amountUsd.toFixed(2)}`, `${currentData.breakdown.feedMoments.percent}% of total`],
      ['Channel Entry Tolls Yield', currentData.breakdown.channelTolls.amountDrops, `$${currentData.breakdown.channelTolls.amountUsd.toFixed(2)}`, `${currentData.breakdown.channelTolls.percent}% of total`],
      [],
      ['Timeline Point', 'Harvested Drops', 'Harvested USD'],
      ...currentData.points.map(p => [p.label, p.drops, `$${p.usd.toFixed(2)}`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `permaculture_growth_${timeRange}_${currentUser.username || 'creator'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Area Chart Coordinate Generator
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = currentData.points;
  const maxDrops = Math.max(...points.map(p => p.drops), 100);
  const minDrops = 0;

  const coordinates = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (p.drops - minDrops) / (maxDrops - minDrops || 1);
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, ...p };
  });

  const pathD = coordinates.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = coordinates[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1]?.x || 0} ${chartHeight - paddingY} L ${coordinates[0]?.x || 0} ${chartHeight - paddingY} Z`;

  // Channels hosted by current user
  const hostedChannels = channels.filter(
    ch => ch.owner_id === currentUser.id || ch.host.id === currentUser.id || ch.host.username === currentUser.username
  );

  return (
    <div className="min-h-screen bg-[#070b09] text-stone-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-7">
        
        {/* TOP HEADER & DASHBOARD SWITCHER TABS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#15221d] gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator Ecosystem &amp; Stewardship Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans flex items-center space-x-3">
              <span>{activeTab === 'growth' ? 'Growth & Yield Dashboard' : 'Creator Two-Wallet Accounting'}</span>
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              {activeTab === 'growth'
                ? 'Comprehensive hydrological analytics, guild retention, fireside activity, and regenerative revenue.'
                : 'Track in-app Rain Drops 💧 spending, 95% creator net yields, payout cash outs, and free drop reinvestment.'}
            </p>
          </div>

          {/* Right Action: Tab Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tab Segmented Control */}
            <div className="flex items-center p-1 rounded-2xl bg-[#0f1714] border border-[#1b2b24] shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('growth')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'growth'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 shadow-md shadow-emerald-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Growth Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallets')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'wallets'
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-stone-950 shadow-md shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Wallets &amp; Payouts</span>
              </button>
            </div>

            {activeTab === 'growth' && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#15231e] hover:bg-[#1e342c] border border-[#213b30] text-stone-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Download CSV analytics report"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: GROWTH & YIELD ANALYTICS DASHBOARD                   */}
        {/* ============================================================ */}
        {activeTab === 'growth' && (
          <div className="space-y-7 animate-in fade-in duration-200">
            
            {/* TIME RANGE SELECTOR BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0f1714] border border-[#1b2b24]">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-emerald-400 ml-1 shrink-0" />
                <span className="text-xs text-stone-400 font-medium">Viewing Window:</span>
                <span className="text-xs text-white font-mono font-semibold">{currentData.dateRange}</span>
              </div>

              <div className="flex items-center space-x-1 bg-[#070b09] p-1 rounded-xl border border-[#172520]">
                {(['7d', '30d', '90d', 'all'] as const).map(rangeKey => (
                  <button
                    key={rangeKey}
                    type="button"
                    onClick={() => setTimeRange(rangeKey)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timeRange === rangeKey
                        ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {rangeKey === '7d' && '7 Days'}
                    {rangeKey === '30d' && '30 Days'}
                    {rangeKey === '90d' && '90 Days'}
                    {rangeKey === 'all' && 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 CORE HYDROLOGICAL & STEWARDSHIP KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Rain Harvested */}
              <div className="p-5 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Net Water Harvested</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                    {currentData.growthPercent}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {currencyMetric === 'drops'
                        ? currentData.totalHarvestedDrops.toLocaleString()
                        : `$${currentData.totalHarvestedUsd.toFixed(2)}`}
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {currencyMetric === 'drops' ? '💧 Drops' : 'USD'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono pt-1">
                    <span className="text-emerald-400">🪣 {(currentData.totalHarvestedDrops / 500).toFixed(1)} Buckets</span>
                    <span>${currentData.totalHarvestedUsd.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Monthly Recurring Rain (MRR) */}
              <div className="p-5 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Monthly Recurring Rain</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20">
                    {currentData.mrrGrowth}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ${currentData.mrrUsd.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-stone-400">/ mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono pt-1">
                    <span className="text-cyan-400 font-semibold">{currentData.mrrDrops.toLocaleString()} 💧/mo</span>
                    <span>{currentData.totalSubscribers} Guild Stewards</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Bush TV Fireside Footfall */}
              <div className="p-5 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Bush TV Firesides</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20">
                    Active
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {currentData.liveFiresideViewers.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-stone-400">Viewers</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono pt-1">
                    <span className="text-cyan-400 font-semibold">💧 {currentData.liveTipDrops.toLocaleString()} Tipped</span>
                    <span>{hostedChannels.length || 2} Circles Hosted</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Community Footprint & Followers */}
              <div className="p-5 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Follower Base</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/20">
                    +{currentData.newSubscribers * 4} New
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {(currentUser.follower_count || 1250).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-stone-400">Stewards</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono pt-1">
                    <span className="text-emerald-400 font-semibold">{posts.length} Moments Shared</span>
                    <span>94.2% Retention</span>
                  </div>
                </div>
              </div>

            </div>

            {/* HARVEST TRAJECTORY AREA CHART & REVENUE STREAMS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left (2 cols): Interactive SVG Area Chart */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#15221d]">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span>Water Harvest Trajectory</span>
                    </h3>
                    <p className="text-xs text-stone-400">Cumulative and periodic Rain Drop velocity</p>
                  </div>

                  {/* Currency Toggle */}
                  <div className="flex items-center space-x-1 bg-[#070b09] p-1 rounded-xl border border-[#172520]">
                    <button
                      type="button"
                      onClick={() => setCurrencyMetric('drops')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        currencyMetric === 'drops'
                          ? 'bg-cyan-500 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      💧 Drops
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrencyMetric('usd')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        currencyMetric === 'usd'
                          ? 'bg-emerald-500 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      $ USD
                    </button>
                  </div>
                </div>

                {/* SVG Area Chart Container */}
                <div className="relative pt-2">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-48 sm:h-56 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="harvestGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0.25, 0.5, 0.75].map(ratio => {
                      const y = paddingY + ratio * (chartHeight - paddingY * 2);
                      return (
                        <line
                          key={ratio}
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#15231e"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Gradient Area Fill */}
                    <path d={areaD} fill="url(#harvestGradient)" />

                    {/* Smooth Stroke Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Interactive Coordinate Points */}
                    {coordinates.map((pt, idx) => (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPointIndex === idx ? 6 : 4}
                          fill="#070b09"
                          stroke={hoveredPointIndex === idx ? '#34d399' : '#10b981'}
                          strokeWidth={hoveredPointIndex === idx ? 3 : 2}
                          className="transition-all"
                        />
                        {/* X-axis date labels */}
                        <text
                          x={pt.x}
                          y={chartHeight - 4}
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-stone-500"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Hover Tooltip Overlay */}
                  {hoveredPointIndex !== null && coordinates[hoveredPointIndex] && (
                    <div
                      className="absolute -top-3 z-20 pointer-events-none p-2 rounded-xl bg-stone-900 border border-emerald-500/50 shadow-xl text-xs font-mono text-center animate-in fade-in duration-100"
                      style={{
                        left: `${(coordinates[hoveredPointIndex].x / chartWidth) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <p className="text-[10px] text-stone-400">{coordinates[hoveredPointIndex].label}</p>
                      <p className="font-bold text-emerald-400">
                        {currencyMetric === 'drops'
                          ? `💧 ${coordinates[hoveredPointIndex].drops.toLocaleString()} Drops`
                          : `$${coordinates[hoveredPointIndex].usd.toFixed(2)} USD`}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        ({(coordinates[hoveredPointIndex].drops / 500).toFixed(2)} 🪣)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-[#15221d] font-mono">
                  <span>Velocity: ~{Math.round(currentData.totalHarvestedDrops / points.length)} 💧/period</span>
                  <span className="text-emerald-400 font-semibold">Peak: {maxDrops.toLocaleString()} 💧</span>
                </div>
              </div>

              {/* Right (1 col): Revenue Streams Breakdown */}
              <div className="p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center space-x-2 pb-2 border-b border-[#15221d]">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    <span>Hydrological Inflow</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 mb-4">Revenue stream contribution</p>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-[#15231e] overflow-hidden flex mb-4">
                    <div
                      style={{ width: `${currentData.breakdown.subscriptions.percent}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Subscriptions: ${currentData.breakdown.subscriptions.percent}%`}
                    />
                    <div
                      style={{ width: `${currentData.breakdown.firesides.percent}%` }}
                      className="bg-amber-500 h-full"
                      title={`Bush TV: ${currentData.breakdown.firesides.percent}%`}
                    />
                    <div
                      style={{ width: `${currentData.breakdown.feedMoments.percent}%` }}
                      className="bg-cyan-500 h-full"
                      title={`Feed Moments: ${currentData.breakdown.feedMoments.percent}%`}
                    />
                    <div
                      style={{ width: `${currentData.breakdown.channelTolls.percent}%` }}
                      className="bg-purple-500 h-full"
                      title={`Channel Tolls: ${currentData.breakdown.channelTolls.percent}%`}
                    />
                  </div>

                  {/* Legend & Breakdown Items */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#070b09] border border-[#172520]">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-stone-300 font-semibold">Guild Memberships</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">${currentData.breakdown.subscriptions.amountUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5">({currentData.breakdown.subscriptions.percent}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#070b09] border border-[#172520]">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-stone-300 font-semibold">Bush TV Chat Tips</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">${currentData.breakdown.firesides.amountUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5">({currentData.breakdown.firesides.percent}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#070b09] border border-[#172520]">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                        <span className="text-stone-300 font-semibold">Feed Moment Tips</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">${currentData.breakdown.feedMoments.amountUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5">({currentData.breakdown.feedMoments.percent}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#070b09] border border-[#172520]">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                        <span className="text-stone-300 font-semibold">Channel Entry Tolls</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">${currentData.breakdown.channelTolls.amountUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5">({currentData.breakdown.channelTolls.percent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>95% of all rain harvested is credited directly to your Earnings Wallet!</span>
                </div>
              </div>

            </div>

            {/* GUILD TIERS HEALTH & BUSH TV CIRCLE METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Guild Membership Tiers Breakdown */}
              <div className="p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
                  <div className="flex items-center space-x-2">
                    <Sprout className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-base">Guild Membership Tiers</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`profile/${currentUser.username}`)}
                    className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Manage Tiers</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: 'Seedling Tier',
                      price: '$5.00/mo',
                      subscribers: 28,
                      mrr: '$140.00',
                      badge: 'Seedling',
                      retention: '96%'
                    },
                    {
                      name: 'Canopy Steward',
                      price: '$15.00/mo',
                      subscribers: 14,
                      mrr: '$210.00',
                      badge: 'Canopy Steward',
                      retention: '92%'
                    },
                    {
                      name: 'Earth Steward VIP',
                      price: '$25.00/mo',
                      subscribers: 6,
                      mrr: '$150.00',
                      badge: 'Earth Steward',
                      retention: '98%'
                    }
                  ].map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#070b09] border border-[#172520] flex items-center justify-between hover:border-emerald-500/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{tier.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {tier.price}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-mono">
                          {tier.subscribers} Active Stewards • {tier.retention} Retention
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-white font-mono">{tier.mrr}</span>
                        <span className="text-[10px] text-stone-500 block">per month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bush TV Channels Performance */}
              <div className="p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <h3 className="font-bold text-white text-base">Bush TV Fireside Circles</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('bush-tv')}
                    className="text-xs font-semibold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Circles</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: '#general-fireside',
                      type: 'Public Fire',
                      footfall: '840 Viewers',
                      tips: '2,840 💧',
                      status: 'Free Circle'
                    },
                    {
                      name: '#soil-building',
                      type: 'Guild Exclusive',
                      footfall: '380 Viewers',
                      tips: '1,420 💧',
                      status: '40 💧 Toll / Mo'
                    },
                    {
                      name: '#keyline-waterworks',
                      type: 'Guild Exclusive',
                      footfall: '200 Viewers',
                      tips: '590 💧',
                      status: 'Canopy Tier Req'
                    }
                  ].map((circle, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#070b09] border border-[#172520] flex items-center justify-between hover:border-amber-500/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white font-mono">{circle.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {circle.type}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-mono">
                          {circle.footfall} • {circle.status}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-cyan-400 font-mono">{circle.tips}</span>
                        <span className="text-[10px] text-stone-500 block">Live Chat Tips</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* TOP RAIN PLANTERS & ACTIVE EARTHWORK GOAL FORECAST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Rain Planters Leaderboard */}
              <div className="p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#15221d]">
                  <Award className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Top Rain Planters</h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'Willow Sage',
                      username: 'willow_permaculture',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                      badge: 'Canopy Member',
                      totalDrops: 2500,
                      isMonthly: true
                    },
                    {
                      name: 'Finn Redwood',
                      username: 'finn_redwood',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                      badge: 'Seedling Steward',
                      totalDrops: 1200,
                      isMonthly: true
                    },
                    {
                      name: 'Elena Rostova',
                      username: 'elena_agroforestry',
                      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                      badge: 'Earth Steward VIP',
                      totalDrops: 3500,
                      isMonthly: true
                    }
                  ].map((supporter, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#070b09] border border-[#172520] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={supporter.avatar}
                          alt={supporter.name}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-cyan-500/30"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{supporter.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono">@{supporter.username}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="flex items-center justify-end space-x-1 font-bold text-cyan-400 text-xs">
                          <span>💧</span>
                          <span>{supporter.totalDrops.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {supporter.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Earthworks Goal Milestone Progress */}
              <div className="p-6 rounded-3xl bg-[#0f1714] border border-[#1b2b24] shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 pb-3 border-b border-[#15221d]">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-base">Active Earthworks Milestone</h3>
                  </div>

                  <div className="pt-2 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-white">Swale Contour Excavation &amp; Nursery Shelter</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">24% Complete</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#15231e] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500"
                          style={{ width: '24%' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-stone-400 pt-1">
                      <span>Harvested: 1,200 💧 (2.4 🪣)</span>
                      <span>Target: 5,000 💧 (10 🪣)</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#070b09] border border-[#172520] space-y-1">
                      <p className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <Activity className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Milestone Velocity Forecast</span>
                      </p>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        At your current 30-day velocity of <strong>~495 💧/day</strong>, you are projected to fully fund this swale contour project in approximately <strong>~28 days</strong>!
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`profile/${currentUser.username}`)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 text-stone-950 font-bold text-xs shadow-md cursor-pointer hover:opacity-95 transition-all text-center"
                >
                  Update Project Goals on Profile
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: TWO-WALLET ACCOUNTING & CASH OUT (EXISTING ENGINE)   */}
        {/* ============================================================ */}
        {activeTab === 'wallets' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. THE MATH EXPLANATION BANNER (EXACT USER SPECIFICATION) */}
            <div className="rounded-3xl bg-gradient-to-r from-[#0f1a15] via-[#101c17] to-[#0d1713] border border-cyan-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-xl font-extrabold text-white">
                      How The Rain Drops 💧 &amp; Water Buckets 🪣 Math Works
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs leading-relaxed text-stone-300">
                    <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#080d0b] border border-[#1a2d24]">
                      <p className="font-bold text-cyan-400 flex items-center space-x-1.5">
                        <span>💧</span>
                        <span>Rain Drops Wallet (In-App Currency)</span>
                      </p>
                      <p className="text-stone-400">
                        Standard rate: <strong>100 Rain Drops = $1.00 USD</strong>. Macro unit: <strong>1 Water Bucket 🪣 = 500 Rain Drops ($5.00 USD)</strong>. Minimum gift is <strong>20 Rain Drops ($0.20 USD)</strong>.
                      </p>
                      <p className="text-amber-400/90 text-[11px] font-semibold">
                        ⚠️ Rain Drops can only be planted/given away — when you plant rain for a creator, it turns into cash earnings in their Earnings Wallet (95% net).
                      </p>
                    </div>

                    <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#080d0b] border border-[#1a2d24]">
                      <p className="font-bold text-emerald-400 flex items-center space-x-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span>Earnings Wallet (Cash Out)</span>
                      </p>
                      <p className="text-stone-400">
                        Exact 5% platform fee: at <strong>20 Drops ($0.20)</strong>, the platform receives <strong>1 Drop ($0.01)</strong> and the creator receives <strong>19 Drops ($0.19)</strong>.
                      </p>
                      <p className="text-emerald-400/90 text-[11px] font-semibold">
                        ✓ Cash out via Stripe Connect above $100.00 USD. Freely convert earnings back into Rain Drops 💧 anytime with 0% fee!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stat Pill */}
                <div className="bg-[#090e0c] rounded-2xl border border-[#1c3026] p-4 text-center min-w-[200px] flex flex-col justify-center space-y-1">
                  <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">Creator Net Yield</span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">95%</span>
                  <span className="text-[10px] text-stone-500 font-mono">5% platform fee ($0.01 per 20 drops)</span>
                </div>
              </div>
            </div>

            {/* 2. THE TWO WALLETS HERO DISPLAY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* WALLET 1: RAIN DROPS WALLET */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                        <span className="text-2xl">💧</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Rain Drops Wallet</h2>
                        <p className="text-xs text-stone-400">In-App Community Currency</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#172d24] text-cyan-300 border border-cyan-500/30">
                      Spending Currency
                    </span>
                  </div>

                  {/* Rain Drops Balance Numbers & Macro Buckets */}
                  <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-stone-400">Current Balance:</span>
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
                          {waterBalance.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-stone-400 ml-1.5">Rain Drops 💧</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500 font-mono border-t border-[#15221d] pt-2">
                      <span className="text-emerald-400 font-semibold">
                        🪣 Macro Units: {(waterBalance / 500).toFixed(1)} Water Buckets
                      </span>
                      <span>${(waterBalance / 100).toFixed(2)} USD (100 Drops = $1)</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start space-x-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                    <p className="leading-relaxed">
                      Planting rain for creators turns into cash earnings in the recipient&apos;s wallet (95% net after exact 5% fee). 1 Water Bucket 🪣 = 500 Drops ($5.00). Minimum gift is 20 Drops ($0.20).
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={openTopUpModal}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 hover:opacity-95 active:scale-98 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🌧️</span>
                    <span>+ Buy Rain Drops &amp; Water Buckets (100 💧 = $1.00 USD)</span>
                  </button>
                </div>
              </div>

              {/* WALLET 2: CREATOR EARNINGS WALLET */}
              <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Earnings Wallet</h2>
                        <p className="text-xs text-stone-400">Withdrawable USD Cash (95% Net)</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      isEligibleToCashOut
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isEligibleToCashOut ? '✓ Ready for Cash Out' : 'Progress to $100.00'}
                    </span>
                  </div>

                  {/* Earnings Balance Numbers */}
                  <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-stone-400">Available to Cash Out:</span>
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                          ${earningsBalanceUsd.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-stone-400 ml-1">USD</span>
                      </div>
                    </div>

                    {/* Cash Out Threshold Progress Bar */}
                    <div className="space-y-1.5 border-t border-[#15221d] pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-400">Cash Out Threshold ($100.00 min):</span>
                        <span className={isEligibleToCashOut ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {cashOutProgressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#15231e] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEligibleToCashOut ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                          }`}
                          style={{ width: `${cashOutProgressPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {isEligibleToCashOut
                          ? '✓ You have reached the $100 minimum and can cash out via Stripe anytime!'
                          : `Earn $${(minCashOutThreshold - earningsBalanceUsd).toFixed(2)} more to unlock Stripe payout.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: Cash Out or Convert to Rain Drops */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    disabled={!isEligibleToCashOut}
                    onClick={() => setIsCashOutModalOpen(true)}
                    className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                      isEligibleToCashOut
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-950/40 cursor-pointer active:scale-98'
                        : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Cash Out via Stripe (Above $100)</span>
                  </button>

                  <button
                    onClick={() => setIsConvertModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-[#15231e] hover:bg-[#1c322a] border border-[#213b30] text-cyan-400 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Convert to Rain Drops 💧 (0% Fee)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. RECENT WALLET TRANSACTIONS LEDGER */}
            <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Wallet &amp; Payout Activity</h3>
                </div>
                <span className="text-xs font-mono text-stone-400">
                  {relevantTransactions.length} Events Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#15221d] text-stone-400 font-mono text-[11px] uppercase">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Wallet Impact</th>
                      <th className="pb-3 font-semibold">Platform Fee (5%)</th>
                      <th className="pb-3 font-semibold">Net USD / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15221d]">
                    {relevantTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#15231e]/50 transition-colors">
                        <td className="py-3 text-stone-400 font-mono">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-stone-200">
                          <div className="font-medium text-white">{tx.reference_title}</div>
                          <div className="text-[11px] text-stone-400">{tx.counterparty_name}</div>
                        </td>
                        <td className="py-3 font-mono">
                          {tx.type === 'tip_sent' && (
                            <span className="text-emerald-400 font-bold">
                              {tx.amount} Drops (Water Wallet)
                            </span>
                          )}
                          {tx.type === 'cash_out' && (
                            <span className="text-amber-400 font-bold">
                              -${tx.net_usd?.toFixed(2)} (Earnings Wallet)
                            </span>
                          )}
                          {tx.type === 'convert_earnings_to_water' && (
                            <span className="text-emerald-400 font-bold">
                              +{tx.amount} Drops (Converted)
                            </span>
                          )}
                          {tx.type === 'topup_purchase' && (
                            <span className="text-emerald-400 font-bold">
                              +{tx.amount} Drops (Bought)
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-mono text-stone-400">
                          {tx.fee_amount ? `-$${tx.fee_amount.toFixed(2)}` : '0%'}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#172d24] text-emerald-400 border border-emerald-500/20">
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* CASH OUT MODAL (WITHDRAW ABOVE $100)                         */}
      {/* ============================================================ */}
      {isCashOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#1b2b24] bg-[#0c120f] p-6 sm:p-7 shadow-2xl text-stone-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cash Out via Stripe</h3>
                  <p className="text-xs text-stone-400">Withdraw your creator revenue directly to your connected Stripe account</p>
                </div>
              </div>
              <button
                onClick={() => setIsCashOutModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {payoutStatusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                payoutStatusMessage.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
              }`}>
                {payoutStatusMessage.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{payoutStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span>Withdrawal Amount (USD):</span>
                  <span className="text-stone-500 font-mono">Available: ${earningsBalanceUsd.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="100"
                    max={earningsBalanceUsd}
                    step="0.01"
                    value={cashOutAmount}
                    onChange={e => setCashOutAmount(e.target.value)}
                    className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-stone-500 font-mono mt-1">
                  Minimum cash out threshold is $100.00 USD.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">Payout Method (Stripe Only):</label>
                <div className="p-3.5 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 to-[#0e1613] flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-sm">
                      S
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">Stripe Connect</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active &amp; Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">Exclusive creator payout partner</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              {/* STRIPE PROCESSING & PAYOUT FEE BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Gross Withdrawal:</span>
                  <span className="font-mono font-bold text-white">${parsedWithdrawal.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span>Stripe Payout Fee (0.25% + $0.25):</span>
                  <span className="font-mono font-bold">-${stripePayoutFee.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#15221d]">
                  <span className="text-white">Net Deposited into Stripe:</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    +${netStripeTakeHome.toFixed(2)} USD
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-mono pt-1">
                  Stripe transfer fees apply to all payouts. Funds clear within 1-2 business days.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Connected Stripe Account Email or ID:
                </label>
                <input
                  type="text"
                  required
                  value={stripeAccountId}
                  onChange={e => setStripeAccountId(e.target.value)}
                  placeholder="e.g. danou@onshow.properties or acct_1N..."
                  className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-[#15221d] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCashOutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-950/40 cursor-pointer"
                >
                  Confirm Stripe Payout (${parsedWithdrawal.toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONVERT EARNINGS TO WATER MODAL (REINVESTMENT)                */}
      {/* ============================================================ */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#1b2b24] bg-[#0c120f] p-6 sm:p-7 shadow-2xl text-stone-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#15221d]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Convert Earnings to Rain Drops 💧</h3>
                  <p className="text-xs text-stone-400">Reinvest in the community at 100 Rain Drops per $1 USD (0% fee)</p>
                </div>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {convertStatusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                convertStatusMessage.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
              }`}>
                {convertStatusMessage.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{convertStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span>Amount to Convert from Earnings (USD):</span>
                  <span className="text-stone-500 font-mono">Available: ${earningsBalanceUsd.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    max={earningsBalanceUsd}
                    step="1"
                    value={convertAmountUsd}
                    onChange={e => setConvertAmountUsd(e.target.value)}
                    className="w-full bg-[#15231e] border border-[#1e342c] rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Instant conversion preview */}
              <div className="p-4 rounded-2xl bg-[#070b09] border border-[#172520] space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Conversion Rate:</span>
                  <span className="font-mono font-bold text-white">1 USD = 100 Rain Drops 💧 (1 Water Bucket 🪣 = 500 💧)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Platform Conversion Fee:</span>
                  <span className="font-mono font-bold text-emerald-400">0% (Completely Free)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-[#15221d]">
                  <span className="text-white">Rain Drops You Will Receive:</span>
                  <div className="text-right">
                    <span className="text-lg font-mono font-extrabold text-emerald-400">
                      +{(parseFloat(convertAmountUsd || '0') * 100).toLocaleString()} 💧
                    </span>
                    <span className="text-xs text-stone-400 font-mono ml-1.5">
                      ({((parseFloat(convertAmountUsd || '0') * 100) / 500).toFixed(1)} 🪣)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#15221d] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Convert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
