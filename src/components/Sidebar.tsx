import React from 'react';
import {
  Home,
  GraduationCap,
  Radio,
  FileText,
  User,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Flame,
  Droplets,
  Layers,
  ChevronRight,
  LayoutDashboard,
  Search,
  ShieldAlert,
  MessageCircle
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { useMessenger } from '../context/MessengerContext';
import { isUserAdmin } from './AdminDashboard';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate, onOpenSearch }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    momentsBalance,
    openTopUpModal,
    theme,
    toggleTheme,
    isLoggedIn,
    logout,
    openAuthModal
  } = usePermaculture();

  const {
    isMessengerOpen,
    toggleMessenger,
    totalUnreadCount
  } = useMessenger();

  const [isSwitchingUser, setIsSwitchingUser] = React.useState(false);
  const isAdmin = isUserAdmin(currentUser);

  const navItems = [
    {
      id: 'feed',
      label: 'Feed',
      icon: FileText,
      route: 'feed'
    },
    {
      id: 'bush-tv',
      label: 'Bush TV',
      icon: Flame,
      route: 'bush-tv'
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: GraduationCap,
      route: 'learn'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: 'dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      route: `profile/${currentUser.username}`
    }
  ];

  const isRouteActive = (item: typeof navItems[0]) => {
    if (item.id === 'feed') return currentRoute === 'feed' || currentRoute === '' || currentRoute === 'home';
    if (item.id === 'learn') return currentRoute === 'learn' || currentRoute.startsWith('learn');
    if (item.id === 'explore') return currentRoute === 'explore';
    if (item.id === 'bush-tv') return currentRoute === 'bush-tv';
    if (item.id === 'dashboard') return currentRoute === 'dashboard';
    if (item.id === 'profile') {
      return currentRoute === 'profile' || currentRoute.startsWith('profile/');
    }
    return false;
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-[#E7E1D8] dark:border-[#15221d] bg-[#FAF7F2] dark:bg-[#090d0b] text-stone-900 dark:text-stone-200 select-none min-h-screen sticky top-0 h-screen overflow-y-auto scrollbar-none z-30 transition-colors">
      <div className="flex flex-col flex-1">
        {/* BRAND LOGO HEADER */}
        <div className="p-5 pb-3 flex items-center space-x-3">
          <div
            onClick={() => navigate('feed')}
            className="cursor-pointer flex items-center space-x-3 group"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-stone-950 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Droplets className="h-6 w-6 fill-stone-950/30 text-stone-950" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-stone-900 dark:text-white font-sans leading-none flex items-center space-x-1">
                <span>Permaculture</span>
                <span className="text-emerald-700 dark:text-emerald-400">App</span>
              </h1>
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 tracking-wider uppercase mt-1">
                Regenerative Economy
              </p>
            </div>
          </div>
        </div>

        {/* RAIN DROPS & WATER BUCKETS WALLET CARD */}
        <div className="px-3 py-2">
          <div className="rounded-2xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-cyan-500/15 border border-emerald-200 dark:border-cyan-500/30 flex items-center justify-center text-emerald-700 dark:text-cyan-400">
                  <span className="text-sm">💧</span>
                </div>
                <div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Rain Drops 💧</p>
                  <p className="text-base font-extrabold font-mono text-emerald-950 dark:text-cyan-300 leading-tight tabular-nums">
                    {momentsBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={openTopUpModal}
                className="text-xs font-bold text-emerald-700 dark:text-cyan-400 hover:text-emerald-800 dark:hover:text-cyan-300 hover:bg-emerald-50 dark:hover:bg-cyan-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                + Top Up
              </button>
            </div>

            {/* Macro Unit: Water Buckets 🪣 (1 Bucket = 500 Rain Drops) */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#E7E1D8] dark:border-[#16251e] text-[11px]">
              <span className="text-stone-500 dark:text-stone-400 flex items-center space-x-1">
                <span>🪣</span>
                <span>Water Buckets:</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {(momentsBalance / 500).toFixed(1)} 🪣
              </span>
            </div>
          </div>
        </div>

        {/* GLOBAL SEARCH BAR */}
        <div className="px-3 py-1.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] hover:border-emerald-600/50 hover:bg-[#F4EFEA] dark:hover:bg-[#13201a] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all text-left text-xs cursor-pointer group shadow-2xs"
            title="Search creators, posts, Bush TV channels (⌘K)"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="h-4 w-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium group-hover:text-stone-900 dark:group-hover:text-stone-200">Search Permaculture App...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-[#F4EFEA] dark:bg-[#15231e] rounded-md border border-[#E7E1D8] dark:border-[#1e342c]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="px-3 py-2 space-y-1.5 flex-1">
          {navItems.map(item => {
            const active = isRouteActive(item);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-100/70 dark:bg-[#15231e] text-emerald-950 dark:text-emerald-400 shadow-2xs border border-emerald-300/60 dark:border-[#1e342c]'
                    : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-[#F4EFEA] dark:hover:bg-[#0f1714]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-5 w-5 ${
                      active ? 'text-emerald-700 dark:text-emerald-400 stroke-[2.2]' : 'text-stone-500 dark:text-stone-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {active && (
                  <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-xs shadow-emerald-600/80" />
                )}
              </button>
            );
          })}
          {/* Messenger Button with live unread badge */}
          <button
            type="button"
            onClick={toggleMessenger}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
              isMessengerOpen
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-[#F4EFEA] dark:hover:bg-[#0f1714]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MessageCircle
                className={`h-5 w-5 ${
                  isMessengerOpen ? 'text-white stroke-[2.2]' : 'text-stone-500 dark:text-stone-400'
                }`}
              />
              <span>Messenger</span>
            </div>

            {totalUnreadCount > 0 && (
              <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-stone-900">
                {totalUnreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* BOTTOM SIDEBAR ACTIONS */}
      <div className="p-3 pt-2 space-y-3 border-t border-[#E7E1D8] dark:border-[#15221d] bg-[#F4EFEA] dark:bg-[#070b09]">
        {/* BECOME A RAIN MAKER BUTTON */}
        <button
          onClick={openTopUpModal}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Become a Rain Maker</span>
        </button>

        {/* SECONDARY UTILITIES */}
        <div className="space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#EBE5DC] dark:hover:bg-[#15231e] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light Botanical Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-emerald-800" />
                <span>Dark Fireside Mode</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSwitchingUser(!isSwitchingUser)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#EBE5DC] dark:hover:bg-[#15231e] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-4 w-4 text-stone-500" />
              <span>Switch / Sign Out</span>
            </div>
            <ChevronRight className="h-3 w-3 text-stone-400" />
          </button>

          {/* USER SWITCHER FLYOUT */}
          {isSwitchingUser && (
            <div className="p-2 rounded-2xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] space-y-1 mb-2 shadow-xl animate-in fade-in duration-150">
              <p className="px-2 py-1 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Switch Identity:
              </p>
              {allUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsSwitchingUser(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    currentUser.id === user.id
                      ? 'bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300/60 dark:border-emerald-500/30'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-[#F4EFEA] dark:hover:bg-[#15231e]'
                  }`}
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="h-6 w-6 rounded-lg object-cover"
                  />
                  <div className="truncate">
                    <p className="truncate font-semibold">{user.full_name}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* USER PROFILE INFO PILL OR SIGN IN */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-2">
            <div
              onClick={() => navigate(`profile/${currentUser.username}`)}
              className="flex-1 flex items-center space-x-3 p-2 rounded-2xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] hover:border-emerald-600/50 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-xs ring-1 ring-emerald-500/30 overflow-hidden shrink-0">
                {currentUser.avatar_url && currentUser.avatar_url.trim() !== '' ? (
                  <img
                    src={currentUser.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.full_name[0]
                )}
              </div>

              <div className="flex-1 truncate">
                <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {currentUser.full_name}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-2.5 rounded-2xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-[#1b2b24] hover:border-red-500/40 text-stone-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal()}
            className="w-full py-2.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Sign In / Steward Login</span>
          </button>
        )}

        {/* DISCRETE ADMIN CONSOLE ITEM (Visible ONLY when user is an admin) */}
        {isAdmin && (
          <button
            onClick={() => navigate('admin')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentRoute === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-amber-300 hover:bg-[#0f1714] border border-transparent'
            }`}
            title="Admin Console"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Admin Console ⚙️</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
              ROOT
            </span>
          </button>
        )}

        {/* LEGAL & TRUST FOOTER */}
        <div className="pt-2 px-1 border-t border-[#E7E1D8] dark:border-[#1b2b24] text-[10px] text-stone-500 dark:text-stone-400 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <button
              type="button"
              onClick={() => navigate('terms')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Terms
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => navigate('privacy')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Privacy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => navigate('guidelines')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Standards
            </button>
          </div>
          <p className="text-[9px] text-stone-400 dark:text-stone-600">
            © 2026 Permaculture App • 95% Creator Split
          </p>
        </div>
      </div>
    </aside>
  );
};
