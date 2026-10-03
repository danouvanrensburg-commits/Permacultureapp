import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Sprout,
  Compass,
  Radio,
  FileText,
  History,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  User,
  Search,
  Menu,
  Bell
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { PermacultureNotification } from '../types';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDropdown } from './NotificationDropdown';

export interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  onOpenMobileMenu,
  onOpenSearch
}) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    momentsBalance,
    openTopUpModal,
    setTxHistoryOpen,
    isFiresideAudioPlaying,
    toggleFiresideAudio,
    theme,
    toggleTheme,
    isLoggedIn,
    logout,
    openAuthModal,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification
  } = usePermaculture();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = unreadNotificationCount;

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-md shadow-black/5 dark:shadow-black/20 transition-all text-neutral-900 dark:text-stone-100">
      {/* 1. TOP MAIN HEADER: PA, Search, Rain Drops balance, Profile Avatar */}
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Hamburger Menu & Brand Logo */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white md:hidden transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('feed')}
            className="group flex items-center space-x-2.5 sm:space-x-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-md shadow-emerald-950/40 text-stone-950 group-hover:scale-105 transition-all shrink-0">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 fill-stone-950/30 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold tracking-tight text-sm sm:text-lg text-neutral-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center">
                  <span className="hidden min-[420px]:inline">Permaculture</span>
                  <span className="hidden min-[420px]:inline text-emerald-500 ml-1">App</span>
                  <span className="min-[420px]:hidden font-black">PA</span>
                </span>
              </div>
              <p className="hidden sm:block text-[10px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Regenerative Economy
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Audio, Theme Toggle, Live Wallet, Water Garden CTA, Profiles */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Global Search Trigger */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 hover:border-emerald-500/50 text-stone-300 hover:text-white transition-all text-xs group cursor-pointer"
            title="Search creators, posts, Bush TV (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-medium">Search...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono text-stone-400 bg-neutral-900 rounded border border-neutral-700">
              ⌘K
            </kbd>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Sunlit Light Mode' : 'Switch to Fireside Dark Mode'}
            className="flex items-center justify-center p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/80 text-stone-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-stone-300" />
            )}
          </button>

          {/* Ambient Campfire Audio Toggle */}
          <button
            type="button"
            onClick={toggleFiresideAudio}
            title={isFiresideAudioPlaying ? 'Mute Fireside Crackle' : 'Play Ambient Fireside Crackle'}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isFiresideAudioPlaying
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'border-neutral-700/80 bg-neutral-800/80 text-stone-400 hover:text-stone-200 hover:bg-neutral-800'
            }`}
          >
            {isFiresideAudioPlaying ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden lg:inline">Fire Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-stone-400" />
                <span className="hidden lg:inline">Fire Audio</span>
              </>
            )}
          </button>

          {/* Notification Bell with Red Badge Counter & Dropdown Panel */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title={unreadCount > 0 ? `${unreadCount} unread alerts` : 'Notifications'}
              className={`relative flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                isNotificationOpen
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-neutral-700/80 bg-neutral-800/80 text-stone-300 hover:text-emerald-400 hover:bg-neutral-800'
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 ring-2 ring-neutral-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                navigate={navigate}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onClearNotification={clearNotification}
              />
            )}
          </div>

          {/* Live Rain Drops Wallet Counter */}
          <button
            type="button"
            onClick={openTopUpModal}
            title="Click to open Rain Drops Wallet & Top Up (100 Drops = $1.00 USD • 1 Water Bucket 🪣 = 500 Drops)"
            className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all shadow-sm cursor-pointer"
          >
            <span className="text-sm">💧</span>
            <span className="font-mono text-cyan-100">{momentsBalance.toLocaleString()}</span>
            <span className="text-cyan-400/80 text-[11px] font-mono hidden sm:inline">
              ({(momentsBalance / 500).toFixed(1)} 🪣)
            </span>
          </button>

          {/* User Profile Quick Button & Account Switcher / Sign In */}
          {isLoggedIn ? (
            <div className="relative flex items-center space-x-1">
              <button
                type="button"
                onClick={() => navigate(`profile/${currentUser.username}`)}
                className="flex items-center space-x-2 p-1.5 pr-2 sm:pr-2.5 rounded-xl hover:bg-neutral-800 border border-neutral-700/80 transition-colors group cursor-pointer"
                title={`Go to @${currentUser.username}'s Profile`}
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={currentUser.full_name}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover ring-1 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all shrink-0"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-200 leading-none truncate max-w-[90px]">
                    {currentUser.full_name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    My Profile
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Switch user account"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-neutral-700 bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-800">
                    <p className="font-semibold text-stone-200">{currentUser.full_name}</p>
                    <p className="text-stone-400 text-[11px]">@{currentUser.username}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      {currentUser.badge || 'Community Member'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentUser.username}`)}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-300 hover:bg-neutral-800 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span>View My Creator Hub</span>
                      <ExternalLink className="h-3 w-3 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxHistoryOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-300 hover:bg-neutral-800 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <History className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Rain Drops Ledger</span>
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      Switch Test Profile:
                    </p>
                    {allUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => switchUser(user.id)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          currentUser.id === user.id ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'text-stone-300 hover:bg-neutral-800'
                        }`}
                      >
                        <img
                          src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                          alt=""
                          className="h-5 w-5 rounded-md object-cover shrink-0"
                        />
                        <div className="truncate">
                          <div className="truncate font-medium">{user.full_name}</div>
                          <div className="text-[10px] text-stone-500">{user.tier.toUpperCase()} Tier</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* 2. NAVIGATION SUB-BAR: Feed, Bush TV, Explore, Profile */}
      <div className="border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-100/90 dark:bg-neutral-900/90 px-3 sm:px-6 py-2 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-around sm:justify-start sm:space-x-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => navigate('feed')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentRoute === 'feed' || currentRoute === '' || currentRoute === 'home'
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Feed</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('bush-tv')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentRoute === 'bush-tv'
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>Bush TV</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('explore')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentRoute === 'explore'
                ? 'bg-neutral-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold border border-neutral-300 dark:border-neutral-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Explore</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`profile/${currentUser.username}`)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentRoute === 'profile' || currentRoute.startsWith('profile/')
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        navigate={navigate}
      />
    </header>
  );
};

