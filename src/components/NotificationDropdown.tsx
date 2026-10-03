import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Droplets,
  MessageCircle,
  UserPlus,
  Flame,
  Check,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PermacultureNotification } from '../types';

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  notifications: PermacultureNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  navigate,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = (item: PermacultureNotification) => {
    if (!item.is_read) {
      onMarkAsRead(item.id);
    }
    if (item.target_route) {
      navigate(item.target_route);
      onClose();
    }
  };

  const getItemIcon = (type: PermacultureNotification['type']) => {
    switch (type) {
      case 'tip':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Droplets className="h-3.5 w-3.5" />
          </div>
        );
      case 'comment':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <MessageCircle className="h-3.5 w-3.5" />
          </div>
        );
      case 'follow':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
            <UserPlus className="h-3.5 w-3.5" />
          </div>
        );
      case 'mention':
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Flame className="h-3.5 w-3.5" />
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< sm) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
      />

      {/* Main Dropdown Panel (Responsive centered modal on mobile, anchored right-0 on desktop) */}
      <div
        ref={dropdownRef}
        className="fixed sm:absolute inset-x-3 xs:inset-x-4 sm:inset-x-auto top-16 sm:top-full sm:right-0 mt-0 sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-md mx-auto sm:mx-0 rounded-2xl border border-neutral-800 sm:border-neutral-700 bg-neutral-900 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 sm:origin-top-right duration-150"
      >
        {/* Header */}
        <div className="p-3 sm:p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/95 gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-stone-100 flex items-center space-x-1.5 truncate">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-[10px] font-mono font-bold text-white shadow-sm shrink-0">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-stone-400 font-mono truncate">Fireside alerts & rain economy</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-neutral-800 shrink-0"
                title="Mark all notifications as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Mark all read</span>
              </button>
            )}

            {/* Close button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1 text-stone-400 hover:text-stone-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 px-3 py-2 border-b border-neutral-800/80 bg-neutral-950/40 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-800 text-stone-100 shadow-sm border border-neutral-700/80'
                : 'text-stone-400 hover:text-stone-200 hover:bg-neutral-800/40'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filter === 'unread'
                ? 'bg-neutral-800 text-stone-100 shadow-sm border border-neutral-700/80'
                : 'text-stone-400 hover:text-stone-200 hover:bg-neutral-800/40'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="font-mono text-[11px]">({unreadCount})</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[min(380px,calc(100vh-14rem))] overflow-y-auto divide-y divide-neutral-800/60">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800/80 border border-neutral-700 text-stone-400">
                <Sparkles className="h-6 w-6 text-amber-400/80" />
              </div>
              <p className="text-sm font-bold text-stone-200">No new notifications yet.</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {filter === 'unread'
                  ? "You've caught up with all your recent fireside alerts and rain droplets!"
                  : 'Activity such as rain tips, comments on posts, new followers, and Bush TV mentions will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 sm:p-3.5 transition-colors flex items-start space-x-2.5 sm:space-x-3 cursor-pointer group relative ${
                  item.is_read
                    ? 'hover:bg-neutral-800/50 bg-neutral-900/40 opacity-80 hover:opacity-100'
                    : 'bg-emerald-950/20 hover:bg-emerald-950/35 border-l-2 border-emerald-500'
                }`}
              >
                {/* Type Icon Badge */}
                {getItemIcon(item.type)}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5 min-w-0 truncate">
                      <img
                        src={item.actor.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={item.actor.full_name}
                        className="h-5 w-5 rounded-full object-cover ring-1 ring-neutral-700 shrink-0"
                      />
                      <span className="font-bold text-xs text-stone-200 group-hover:text-emerald-300 transition-colors truncate">
                        {item.actor.full_name}
                      </span>
                      {item.actor.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-neutral-800 text-stone-400 hidden xs:inline-block shrink-0">
                          {item.actor.badge}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 font-mono shrink-0 whitespace-nowrap ml-1">
                      {item.created_at}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 mt-1 leading-relaxed break-words">
                    {item.description}
                  </p>

                  {item.amount_drops && (
                    <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-mono text-cyan-300 font-bold max-w-full truncate">
                      <span>💧</span>
                      <span>+{item.amount_drops.toLocaleString()} Rain Drops</span>
                      {item.amount_drops >= 500 && (
                        <span className="text-[9px] text-emerald-400 font-normal">
                          ({(item.amount_drops / 500).toFixed(1)} 🪣)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Read / Unread Indicator & Dismiss Action */}
                <div className="flex flex-col items-end space-y-1.5 shrink-0 pl-1">
                  {!item.is_read ? (
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30 animate-pulse"
                      title="Unread alert"
                    />
                  ) : (
                    <Check className="h-3 w-3 text-stone-400" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-300 hover:bg-neutral-800 rounded transition-all cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-stone-400 gap-2">
          <span className="font-mono truncate">Permaculture Alerts</span>
          <button
            type="button"
            onClick={() => {
              navigate('feed');
              onClose();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
          >
            <span>View Feed Activity</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </>
  );
};
