import React, { useState } from 'react';
import {
  Droplets,
  History,
  ChevronDown,
  ExternalLink,
  Search,
  Menu,
  Bell,
  MessageCircle
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { useMessenger } from '../context/MessengerContext';
import { PermacultureNotification } from '../types';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDropdown } from './NotificationDropdown';

export interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNotificationSettings,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    momentsBalance,
    openTopUpModal,
    setTxHistoryOpen,
    isLoggedIn,
    logout,
    openAuthModal,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification
  } = usePermaculture();

  const {
    isMessengerOpen,
    toggleMessenger,
    totalUnreadCount
  } = useMessenger();

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
    <header className="sticky top-0 z-50 w-full bg-[#FBF9F5]/95 dark:bg-[#070b09]/95 backdrop-blur-md border-b border-[#E7E1D8] dark:border-stone-800 shadow-xs shadow-stone-900/5 transition-all text-stone-900 dark:text-stone-100">
      {/* 1. TOP MAIN HEADER: PA, Search, Rain Drops balance, Profile Avatar */}
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Hamburger Menu & Brand Logo */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl bg-[#F4EFEA] dark:bg-stone-800/80 border border-[#E7E1D8] dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white md:hidden transition-colors cursor-pointer"
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
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 shadow-md shadow-emerald-950/20 text-stone-950 group-hover:scale-105 transition-all shrink-0">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 fill-stone-950/30 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold tracking-tight text-sm sm:text-lg text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center">
                  <span className="hidden min-[420px]:inline">Permaculture</span>
                  <span className="hidden min-[420px]:inline text-emerald-700 dark:text-emerald-400 ml-1">App</span>
                  <span className="min-[420px]:hidden font-black">PA</span>
                </span>
              </div>
              <p className="hidden sm:block text-[10px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Regenerative Economy
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Clean Search Input, Notifications, Live Drops, Avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Clean Search Input Bar (No shortcut symbol badge) */}
          <div
            onClick={handleSearchClick}
            className="relative flex items-center cursor-pointer group"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors pointer-events-none" />
            <input
              type="text"
              readOnly
              onClick={handleSearchClick}
              placeholder="Search Permaculture App..."
              className="w-36 sm:w-52 md:w-64 lg:w-80 pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-[#F4EFEA] dark:bg-stone-800/90 hover:bg-[#EBE5DC] dark:hover:bg-stone-800 border border-[#E7E1D8] dark:border-stone-700/80 hover:border-emerald-600/40 focus:border-emerald-600 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 shadow-2xs transition-all cursor-pointer select-none"
            />
          </div>

          {/* Notification Bell with Red Badge Counter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title={unreadCount > 0 ? `${unreadCount} unread alerts` : 'Notifications'}
              className={`relative flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                isNotificationOpen
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'border-[#E7E1D8] dark:border-stone-700/80 bg-[#F4EFEA] dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-[#EBE5DC] dark:hover:bg-stone-800'
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 ring-2 ring-white dark:ring-neutral-900 animate-pulse">
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
                onOpenSettings={onOpenNotificationSettings}
              />
            )}
          </div>

          {/* Facebook-Style Messenger Button with Unread Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleMessenger}
              title={totalUnreadCount > 0 ? `${totalUnreadCount} unread direct messages` : 'Community Messenger'}
              className={`relative flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                isMessengerOpen
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                  : 'border-[#E7E1D8] dark:border-stone-700/80 bg-[#F4EFEA] dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-[#EBE5DC] dark:hover:bg-stone-800'
              }`}
              aria-label="Messenger"
            >
              <MessageCircle className="h-4 w-4" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-lg shadow-emerald-600/50 ring-2 ring-white dark:ring-neutral-900 animate-pulse">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Live Rain Drops Wallet Counter */}
          <button
            type="button"
            onClick={openTopUpModal}
            title="Click to open Rain Drops Wallet & Top Up (100 Drops = $1.00 USD • 1 Water Bucket 🪣 = 500 Drops)"
            className="hidden xs:flex items-center space-x-1.5 rounded-xl border border-emerald-300/80 dark:border-cyan-500/30 bg-emerald-50/90 dark:bg-cyan-500/10 px-2 sm:px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-cyan-300 hover:border-emerald-400 hover:bg-emerald-100 transition-all shadow-2xs cursor-pointer"
          >
            <span className="text-xs sm:text-sm">💧</span>
            <span className="font-mono text-emerald-950 dark:text-cyan-100 font-bold tabular-nums">{momentsBalance.toLocaleString()}</span>
            <span className="text-emerald-700/80 dark:text-cyan-400/80 text-[10px] font-mono hidden sm:inline tabular-nums">
              ({(momentsBalance / 500).toFixed(1)} 🪣)
            </span>
          </button>

          {/* User Profile Quick Button & Account Switcher / Sign In */}
          {isLoggedIn ? (
            <div className="relative flex items-center space-x-1 flex-shrink-0 shrink-0">
              <button
                type="button"
                onClick={() => navigate(`profile/${currentUser.username}`)}
                className="flex items-center space-x-2 p-1 sm:p-1.5 pr-2 sm:pr-2.5 rounded-2xl hover:bg-[#F4EFEA] dark:hover:bg-stone-800 border border-[#E7E1D8] dark:border-stone-700/80 transition-colors group cursor-pointer flex-shrink-0 shrink-0"
                title={`Go to @${currentUser.username}'s Profile`}
              >
                {/* Avatar Parent Wrapper with flex-shrink-0, fixed dimensions, and rounded-full */}
                <div className="relative flex-shrink-0 shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-emerald-600/30 group-hover:ring-emerald-500 transition-all bg-[#F4EFEA] dark:bg-stone-800">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.full_name}
                    className="w-full h-full rounded-full object-cover flex-shrink-0 shrink-0 aspect-square"
                  />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-200 leading-none truncate max-w-[90px]">
                    {currentUser.full_name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    My Profile
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-stone-800 transition-colors cursor-pointer flex-shrink-0 shrink-0"
                title="Switch user account"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#E7E1D8] dark:border-stone-700 bg-[#FBF9F5]/98 dark:bg-stone-900/98 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs text-stone-900 dark:text-stone-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E7E1D8] dark:border-stone-800">
                    <p className="font-semibold text-stone-900 dark:text-stone-200">{currentUser.full_name}</p>
                    <p className="text-stone-500 dark:text-stone-400 text-[11px]">@{currentUser.username}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-mono text-[10px]">
                      {currentUser.badge || 'Community Member'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => navigate(`profile/${currentUser.username}`)}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-stone-800 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span>View My Creator Hub</span>
                      <ExternalLink className="h-3 w-3 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxHistoryOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-stone-800 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <History className="h-3.5 w-3.5 text-emerald-600 dark:text-cyan-400" />
                        <span>Rain Drops Ledger</span>
                      </span>
                    </button>
                    {onOpenNotificationSettings && (
                      <button
                        type="button"
                        onClick={onOpenNotificationSettings}
                        className="w-full text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-stone-800 flex items-center justify-between font-semibold cursor-pointer"
                      >
                        <span className="flex items-center space-x-2">
                          <Bell className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Notification Settings</span>
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate('terms')}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-stone-800 flex items-center justify-between font-semibold cursor-pointer"
                    >
                      <span>Terms &amp; Trust Center</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#E7E1D8] dark:border-stone-800">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      Switch Test Profile:
                    </p>
                    {allUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => switchUser(user.id)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          currentUser.id === user.id ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-stone-800'
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

                  <div className="pt-2 border-t border-[#E7E1D8] dark:border-stone-800">
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-between font-semibold cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex-shrink-0 shrink-0"
            >
              Sign In
            </button>
          )}
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

