import React from 'react';
import { FileText, GraduationCap, Flame, User, MessageCircle } from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { useMessenger } from '../context/MessengerContext';

interface BottomNavBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentRoute, navigate }) => {
  const { currentUser } = usePermaculture();
  const { isMessengerOpen, toggleMessenger, totalUnreadCount } = useMessenger();

  const isFeedActive = currentRoute === 'feed' || currentRoute === '' || currentRoute === 'home';
  const isLearnActive = currentRoute === 'learn' || currentRoute.startsWith('learn');
  const isBushTVActive = currentRoute === 'bush-tv';
  const isProfileActive = currentRoute === 'profile' || currentRoute.startsWith('profile/');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090d0b]/95 backdrop-blur-xl border-t border-neutral-200/80 dark:border-neutral-800/80 px-2 py-1 shadow-lg shadow-black/10 transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Feed / Home */}
        <button
          type="button"
          onClick={() => navigate('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            isFeedActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Community Feed"
        >
          <div className="relative">
            <FileText className={`h-5 w-5 ${isFeedActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isFeedActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Feed</span>
        </button>

        {/* 2. Learn (Course Marketplace & LMS) */}
        <button
          type="button"
          onClick={() => navigate('learn')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            isLearnActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Learn: Course Marketplace & LMS"
        >
          <div className="relative">
            <GraduationCap className={`h-5 w-5 ${isLearnActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isLearnActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Learn</span>
        </button>

        {/* 3. Bush TV Live Firesides */}
        <button
          type="button"
          onClick={() => navigate('bush-tv')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            isBushTVActive
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Bush TV Live Fireside Rooms"
        >
          <div className="relative">
            <Flame className={`h-5 w-5 ${isBushTVActive ? 'stroke-[2.5] fill-amber-500/20 animate-pulse' : 'stroke-[1.8]'}`} />
            {isBushTVActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Bush TV</span>
        </button>

        {/* 4. Messenger Drawer Trigger */}
        <button
          type="button"
          onClick={toggleMessenger}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            isMessengerOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Community Messenger"
        >
          <div className="relative">
            <MessageCircle className={`h-5 w-5 ${isMessengerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-stone-900">
                {totalUnreadCount}
              </span>
            )}
            {isMessengerOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Chat</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => navigate(`profile/${currentUser.username || 'danou_van_rensburg'}`)}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            isProfileActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="My Creator Profile"
        >
          <div className="relative">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className={`h-5 w-5 rounded-full object-cover transition-all ${
                  isProfileActive ? 'ring-2 ring-emerald-500' : 'ring-1 ring-stone-400/40'
                }`}
              />
            ) : (
              <User className={`h-5 w-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            )}
            {isProfileActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
