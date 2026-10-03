import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  User,
  Radio,
  FileText,
  Flame,
  Droplets,
  Sprout,
  ArrowRight,
  Sparkles,
  Lock,
  Tag,
  Compass,
  CornerDownLeft
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { UserProfile, BushTVChannel, CommunityPost } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  initialQuery?: string;
}

type SearchTab = 'all' | 'creators' | 'channels' | 'posts';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  navigate,
  initialQuery = ''
}) => {
  const { allUsers, channels, posts, setCurrentChannel } = usePermaculture();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Creators
  const matchingCreators = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allUsers.slice(0, 4);
    return allUsers.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.headline?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      u.permaculture_focus?.toLowerCase().includes(q) ||
      u.climate_zone?.toLowerCase().includes(q) ||
      u.badge?.toLowerCase().includes(q)
    );
  }, [allUsers, query]);

  // Filtered Bush TV Channels / Sessions
  const matchingChannels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels.slice(0, 4);
    return channels.filter(ch =>
      ch.name.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q) ||
      ch.host.full_name.toLowerCase().includes(q) ||
      ch.host.username.toLowerCase().includes(q) ||
      ch.pinned_notice?.toLowerCase().includes(q) ||
      ch.topic_tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [channels, query]);

  // Filtered Community Posts / Field Logs
  const matchingPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts.slice(0, 4);
    return posts.filter(p =>
      (p.title ? p.title.toLowerCase().includes(q) : false) ||
      p.content.toLowerCase().includes(q) ||
      p.author.full_name.toLowerCase().includes(q) ||
      p.author.username.toLowerCase().includes(q) ||
      p.permaculture_principle?.toLowerCase().includes(q) ||
      p.location_tag?.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [posts, query]);

  // Flattened items for keyboard navigation
  const flatResults = useMemo(() => {
    const items: Array<{
      type: 'creator' | 'channel' | 'post';
      data: UserProfile | BushTVChannel | CommunityPost;
    }> = [];

    if (activeTab === 'all' || activeTab === 'creators') {
      matchingCreators.forEach(c => items.push({ type: 'creator', data: c }));
    }
    if (activeTab === 'all' || activeTab === 'channels') {
      matchingChannels.forEach(ch => items.push({ type: 'channel', data: ch }));
    }
    if (activeTab === 'all' || activeTab === 'posts') {
      matchingPosts.forEach(p => items.push({ type: 'post', data: p }));
    }

    return items;
  }, [activeTab, matchingCreators, matchingChannels, matchingPosts]);

  // Handle keyboard navigation between results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < flatResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatResults[selectedIndex];
      if (current) {
        handleSelectItem(current.type, current.data);
      }
    }
  };

  const handleSelectItem = (
    type: 'creator' | 'channel' | 'post',
    item: UserProfile | BushTVChannel | CommunityPost
  ) => {
    if (type === 'creator') {
      const creator = item as UserProfile;
      navigate(`profile/${creator.username}`);
    } else if (type === 'channel') {
      const channel = item as BushTVChannel;
      setCurrentChannel(channel);
      navigate('bush-tv');
    } else if (type === 'post') {
      navigate('feed');
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalResults = matchingCreators.length + matchingChannels.length + matchingPosts.length;
  const isSearchEmpty = query.trim() === '';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 pb-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#090d0b] border border-[#1b2b24] rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden flex flex-col max-h-[85vh] text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* TOP SEARCH INPUT BAR */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-[#15221d] gap-3 bg-[#0a0f0d]">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Search className="h-4 w-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search creators, Bush TV campfires, field logs..."
            className="flex-1 bg-transparent border-0 text-sm sm:text-base text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-0"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-[#15231e] transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-[#1b2b24] text-[10px] font-mono text-stone-400">
            <kbd className="px-1.5 py-0.5 rounded bg-[#121c17] border border-[#1e342c] text-stone-400">ESC</kbd>
            <span>to close</span>
          </div>

          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-stone-400 hover:text-white"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 border-b border-[#15221d] bg-[#070b09] overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#0f1714]'
            }`}
          >
            <span>All Results</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'all' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-[#15221d] text-stone-400'}`}>
              {totalResults}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('creators');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'creators'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#0f1714]'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Creators</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'creators' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-[#15221d] text-stone-400'}`}>
              {matchingCreators.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('channels');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#0f1714]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Bush TV</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'channels' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-[#15221d] text-stone-400'}`}>
              {matchingChannels.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('posts');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#0f1714]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Field Logs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'posts' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-[#15221d] text-stone-400'}`}>
              {matchingPosts.length}
            </span>
          </button>
        </div>

        {/* RESULTS SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* EMPTY QUERY: SUGGESTIONS & POPULAR TAGS */}
          {isSearchEmpty && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Popular Discoveries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Keyline Swales',
                  'Biochar',
                  'Comfrey Guild',
                  'Dr. Elena',
                  'Bush TV Live',
                  'Off-Grid Tech',
                  'Rain Drops Economy'
                ].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1714] border border-[#1b2b24] hover:border-emerald-500/50 text-xs text-stone-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Tag className="h-3 w-3 text-emerald-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS FOUND */}
          {!isSearchEmpty && totalResults === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">No results matching "{query}"</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                Try searching for creator handles (e.g. <code>@willow_permaculture</code>), channel topics like <code>#soil</code>, or permaculture methods.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setQuery('')}
                  className="px-3 py-1.5 rounded-xl bg-[#15231e] border border-[#1e342c] text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  Clear search query
                </button>
              </div>
            </div>
          )}

          {/* 1. CREATORS SECTION */}
          {(activeTab === 'all' || activeTab === 'creators') && matchingCreators.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <User className="h-3.5 w-3.5" />
                  <span>Creators & Stewards ({matchingCreators.length})</span>
                </div>
                {activeTab === 'all' && matchingCreators.length > 3 && (
                  <button
                    onClick={() => setActiveTab('creators')}
                    className="text-[11px] text-stone-400 hover:text-emerald-400 font-medium"
                  >
                    View all {matchingCreators.length} →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchingCreators.slice(0, activeTab === 'all' ? 4 : 20).map(creator => (
                  <div
                    key={creator.id}
                    onClick={() => handleSelectItem('creator', creator)}
                    className="p-3 rounded-2xl bg-[#0f1714] border border-[#1b2b24] hover:border-emerald-500/50 hover:bg-[#13201a] transition-all cursor-pointer group flex items-center space-x-3 text-left"
                  >
                    <img
                      src={creator.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={creator.full_name}
                      className="h-11 w-11 rounded-xl object-cover ring-1 ring-emerald-500/30 group-hover:scale-105 group-hover:ring-emerald-400 transition-all shrink-0"
                    />
                    <div className="truncate flex-1">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                          {creator.full_name}
                        </span>
                        {creator.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 shrink-0">
                            {creator.badge.includes('TIME KEEPER') ? 'TIME KEEPER' : 'STEWARD'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 font-mono truncate">
                        @{creator.username}
                      </p>
                      {creator.permaculture_focus && (
                        <p className="text-[10px] text-emerald-400/90 truncate mt-0.5">
                          {creator.permaculture_focus}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. BUSH TV SESSIONS SECTION */}
          {(activeTab === 'all' || activeTab === 'channels') && matchingChannels.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Radio className="h-3.5 w-3.5" />
                  <span>Bush TV Firesides ({matchingChannels.length})</span>
                </div>
                {activeTab === 'all' && matchingChannels.length > 3 && (
                  <button
                    onClick={() => setActiveTab('channels')}
                    className="text-[11px] text-stone-400 hover:text-amber-400 font-medium"
                  >
                    View all {matchingChannels.length} →
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {matchingChannels.slice(0, activeTab === 'all' ? 3 : 20).map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => handleSelectItem('channel', channel)}
                    className="p-3.5 rounded-2xl bg-[#0f1714] border border-[#1b2b24] hover:border-amber-500/50 hover:bg-[#161d18] transition-all cursor-pointer group flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Flame className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                            {channel.name}
                          </span>
                          {channel.category !== 'public' ? (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300">
                              <Lock className="h-2.5 w-2.5" />
                              <span>{channel.category === 'vip_10' ? '$10 VIP' : '$5 Supporter'}</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400">
                              Open Campfire
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                          {channel.description}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono mt-0.5">
                          <span>Host: @{channel.host.username}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1 text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{channel.active_viewers_count} live</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-[#15231e] text-[10px] font-bold text-amber-300">
                        Join Fireside →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. COMMUNITY POSTS & FIELD LOGS */}
          {(activeTab === 'all' || activeTab === 'posts') && matchingPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Community Field Logs ({matchingPosts.length})</span>
                </div>
                {activeTab === 'all' && matchingPosts.length > 3 && (
                  <button
                    onClick={() => setActiveTab('posts')}
                    className="text-[11px] text-stone-400 hover:text-emerald-400 font-medium"
                  >
                    View all {matchingPosts.length} →
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {matchingPosts.slice(0, activeTab === 'all' ? 3 : 20).map(post => (
                  <div
                    key={post.id}
                    onClick={() => handleSelectItem('post', post)}
                    className="p-3.5 rounded-2xl bg-[#0f1714] border border-[#1b2b24] hover:border-emerald-500/50 hover:bg-[#13201a] transition-all cursor-pointer group text-left space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {post.title}
                      </h4>
                      {post.permaculture_principle && (
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 shrink-0">
                          {post.permaculture_principle}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 font-mono">
                      <div className="flex items-center space-x-2">
                        <span>By {post.author.full_name}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-cyan-400">
                        <span>💧</span>
                        <span>{post.moments_harvested.toLocaleString()} Rain Drops</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM HELPER FOOTER */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#15221d] bg-[#070b09] flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0f1714] border border-[#1b2b24] text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#0f1714] border border-[#1b2b24] text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0f1714] border border-[#1b2b24] text-[10px]">↵</kbd>
              <span>select</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-cyan-400">
            <span>💧</span>
            <span>Rain Drops Economy Global Search</span>
          </div>
        </div>

      </div>
    </div>
  );
};
