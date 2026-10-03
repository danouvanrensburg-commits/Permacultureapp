import React, { useState } from 'react';
import {
  X,
  Droplets,
  Sprout,
  Flame,
  ArrowRight,
  Shield,
  User,
  Sparkles,
  Lock,
  Mail,
  Check
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, navigate }) => {
  const {
    allUsers,
    login,
    pendingRedirectRoute,
    setPendingRedirectRoute
  } = usePermaculture();

  const [selectedUser, setSelectedUser] = useState<UserProfile>(allUsers[0]);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [mode, setMode] = useState<'profiles' | 'custom'>('profiles');

  if (!isOpen) return null;

  // Check if there is a pending link destination
  const targetUsername = pendingRedirectRoute?.startsWith('profile/')
    ? pendingRedirectRoute.replace('profile/', '')
    : null;

  const targetProfile = targetUsername
    ? allUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase())
    : null;

  const handleCompleteLogin = (userToLogin: UserProfile) => {
    login(userToLogin);
    onClose();

    if (pendingRedirectRoute && pendingRedirectRoute !== 'home') {
      const destination = pendingRedirectRoute;
      setPendingRedirectRoute(null);
      navigate(destination);
    } else {
      navigate('feed');
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const usernameGenerated = customName.toLowerCase().replace(/\s+/g, '_');
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      username: usernameGenerated,
      full_name: customName.trim(),
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Permaculture steward & regenerative practitioner.',
      permaculture_focus: 'Regenerative Agriculture',
      climate_zone: 'Temperate / Zone 7',
      location: 'Earth',
      tier: 'free',
      is_creator: false,
      supporter_count: 0,
      follower_count: 0,
      moments_balance: 500,
      moments_harvested: 0,
      created_at: new Date().toISOString()
    };

    handleCompleteLogin(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090d0b] border border-[#1b2b24] rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#15221d] flex items-start justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-stone-950 shadow-lg shadow-emerald-950/40">
              <Droplets className="h-6 w-6 fill-stone-950/30" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Steward Sign In</h3>
              <p className="text-[11px] text-stone-400 font-mono">Permaculture App</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-[#15231e] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* INVITATION LINK NOTICE (If user was sent a link) */}
        {targetProfile ? (
          <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3">
            <img
              src={targetProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={targetProfile.full_name}
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-emerald-500/50 shrink-0"
            />
            <div className="truncate flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Shared Link Destination
              </span>
              <p className="text-xs font-bold text-white truncate">
                {targetProfile.full_name} (@{targetProfile.username})
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                You will land here immediately after logging in.
              </p>
            </div>
          </div>
        ) : pendingRedirectRoute && (
          <div className="mx-6 mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <span className="font-bold">Destination link saved:</span> #{pendingRedirectRoute}
          </div>
        )}

        {/* TAB TOGGLE: Demo Steward Profiles vs Custom Sign In */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0f1714] border border-[#1b2b24] text-xs font-semibold">
            <button
              onClick={() => setMode('profiles')}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'profiles'
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Demo Stewards
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'custom'
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Custom Login
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 pt-4 space-y-4">
          {mode === 'profiles' ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                Choose a permaculture steward profile to sign in:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${
                      selectedUser.id === u.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                        : 'bg-[#0f1714] border-[#1b2b24] text-stone-300 hover:border-emerald-500/40 hover:bg-[#13201a]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={u.full_name}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-emerald-500/30 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{u.full_name}</p>
                        <p className="text-[10px] text-stone-400 font-mono truncate">@{u.username}</p>
                      </div>
                    </div>

                    {selectedUser.id === u.id && (
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCompleteLogin(selectedUser)}
                className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue as {selectedUser.full_name.split(' ')[0]}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Full Name / Steward Handle
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f1714] border border-[#1b2b24] text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="steward@permacultureapp.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f1714] border border-[#1b2b24] text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-stone-400 font-mono">
            <span>Powered by Permaculture App • Watering Economy</span>
          </div>
        </div>

      </div>
    </div>
  );
};
