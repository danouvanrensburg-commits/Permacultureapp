import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  Droplets,
  ExternalLink,
  Award,
  ArrowRight
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

interface RightSidebarProps {
  navigate: (route: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ navigate }) => {
  const {
    allUsers,
    currentUser,
    openTopUpModal,
    waterCreator,
    earningsBalanceUsd,
    waterBalance,
    isFollowingCreator,
    toggleFollowCreator
  } = usePermaculture();

  // Creators to suggest
  const suggestedCreators = allUsers.filter(u => u.id !== currentUser.id).slice(0, 3);

  const trendingTopics = [
    { tag: 'digitalart', count: '12.4K posts' },
    { tag: 'permaculture', count: '9.8K posts' },
    { tag: 'soilmicrobiology', count: '5.1K posts' },
    { tag: 'foodforest', count: '3.8K posts' }
  ];

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:flex flex-col space-y-6 p-4 sticky top-0 h-screen overflow-y-auto scrollbar-none border-l border-[#15221d] bg-[#090d0b] text-stone-200">
      
      {/* 1. SUGGESTED CREATORS */}
      <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-4.5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-stone-100 font-bold text-sm">
          <Users className="h-4 w-4 text-emerald-400" />
          <span>Suggested Creators</span>
        </div>

        <div className="space-y-3.5">
          {suggestedCreators.map(creator => {
            const isFollowing = isFollowingCreator(creator.id);

            return (
              <div
                key={creator.id}
                className="flex items-center justify-between gap-2.5 group"
              >
                <div
                  onClick={() => navigate(`profile/${creator.username}`)}
                  className="flex items-center space-x-2.5 truncate cursor-pointer flex-1"
                >
                  <img
                    src={creator.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={creator.full_name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all flex-shrink-0"
                  />
                  <div className="truncate">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-bold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                        {creator.full_name}
                      </span>
                      {creator.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                          {creator.badge.includes('TIME KEEPER') ? 'TIME KEEPER' : 'STEWARD'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono">
                      {(creator.follower_count || 1200).toLocaleString()} followers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFollowCreator(creator.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-[#1b2b24] text-stone-300 border border-stone-600'
                        : 'bg-[#182620] hover:bg-emerald-500 hover:text-stone-950 text-stone-200 border border-[#243a31]'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. YOUR EARNINGS & WALLETS */}
      <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-4.5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-stone-100">Your Wallets & Earnings</h3>
          <button
            onClick={() => navigate('dashboard')}
            className="text-[11px] text-emerald-400 hover:underline font-semibold"
          >
            Dashboard →
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Earnings (USD)</span>
            </span>
            <div className="text-right">
              <span className="font-mono font-extrabold text-white text-sm">
                ${earningsBalanceUsd.toFixed(2)}
              </span>
              {earningsBalanceUsd >= 100 && (
                <span className="block text-[9px] text-emerald-400 font-bold">✓ Cash out ready</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-400 flex items-center space-x-2">
              <span className="text-sm">💧</span>
              <span>Rain Drops</span>
            </span>
            <div className="text-right">
              <span className="font-mono font-extrabold text-white text-sm">
                {waterBalance.toLocaleString()} 💧
              </span>
              <span className="block text-[10px] text-emerald-400 font-mono">
                {(waterBalance / 500).toFixed(1)} Water Buckets 🪣
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#15221d] text-[11px] text-stone-400">
            <span>Platform fee: 5%</span>
            <span className="text-emerald-400 font-bold">95% net creator yield</span>
          </div>
        </div>
      </div>

      {/* 3. TRENDING NOW */}
      <div className="rounded-3xl bg-[#0f1714] border border-[#1b2b24] p-4.5 space-y-3.5 shadow-xl">
        <div className="flex items-center space-x-2 text-stone-100 font-bold text-sm">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>Trending Now</span>
        </div>

        <div className="space-y-3">
          {trendingTopics.map(t => (
            <div
              key={t.tag}
              onClick={() => navigate('feed')}
              className="cursor-pointer group flex flex-col"
            >
              <span className="text-xs font-bold text-stone-200 group-hover:text-emerald-400 transition-colors">
                #{t.tag}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BECOME A RAIN MAKER CARD */}
      <div className="rounded-3xl bg-gradient-to-b from-[#10201a] to-[#0a1410] border border-emerald-500/30 p-4.5 space-y-3 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
          <Sparkles className="h-4 w-4 animate-spin-slow" />
          <span>Become a Rain Maker</span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Start earning from your regenerative content today. $9.90/mo.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172d24] text-emerald-400 border border-emerald-500/20">
            Tips
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172d24] text-emerald-400 border border-emerald-500/20">
            Paywalls
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172d24] text-emerald-400 border border-emerald-500/20">
            Referrals
          </span>
        </div>

        <button
          onClick={openTopUpModal}
          className="w-full mt-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
        >
          Become a Rain Maker
        </button>
      </div>

    </aside>
  );
};
