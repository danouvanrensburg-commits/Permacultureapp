import React, { useState, useEffect } from 'react';
import { PermacultureProvider, usePermaculture } from './context/PermacultureContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { BushTVChat } from './components/BushTVChat';
import { CommunityFeed } from './components/CommunityFeed';
import { ExploreHub } from './components/ExploreHub';
import { CreatorProfile } from './components/CreatorProfile';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TopUpModal } from './components/TopUpModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { FloatingDropletToast } from './components/FloatingDropletToast';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Menu, X, Droplets, Sparkles, User as UserIcon, Search } from 'lucide-react';

const getInitialRouteInfo = (): { route: string; isSentLink: boolean } => {
  // 1. Hash based deep link (e.g. #/profile/willow_permaculture or #profile/willow_permaculture)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash && hash !== 'home') {
    return { route: hash, isSentLink: hash !== 'feed' };
  }

  // 2. Query param based deep link (e.g. ?profile=willow_permaculture or ?redirect=profile/willow_permaculture)
  const searchParams = new URLSearchParams(window.location.search);
  const profileParam = searchParams.get('profile');
  if (profileParam) {
    return { route: `profile/${profileParam.replace(/^@/, '')}`, isSentLink: true };
  }
  const redirectParam = searchParams.get('redirect') || searchParams.get('route');
  if (redirectParam && redirectParam !== 'home') {
    return { route: redirectParam.replace(/^\//, ''), isSentLink: true };
  }

  // 3. Pathname based deep link (e.g. /profile/willow_permaculture)
  const pathname = window.location.pathname.replace(/^\//, '').trim();
  if (pathname && pathname !== 'home' && pathname !== 'index.html' && pathname !== '') {
    return { route: pathname, isSentLink: pathname !== 'feed' };
  }

  // Default app launch without link: feed page
  return { route: 'feed', isSentLink: false };
};

function AppContent() {
  const {
    currentUser,
    momentsBalance,
    openTopUpModal,
    isLoggedIn,
    isAuthModalOpen,
    closeAuthModal,
    openAuthModal,
    setPendingRedirectRoute
  } = usePermaculture();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const info = getInitialRouteInfo();
    return info.route;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // If user was sent a direct link (e.g. to a creator profile) and is not logged in, prompt sign in and save target
  useEffect(() => {
    const info = getInitialRouteInfo();
    if (info.isSentLink && info.route !== 'feed') {
      if (!isLoggedIn) {
        setPendingRedirectRoute(info.route);
        openAuthModal(info.route);
      }
    }
  }, [isLoggedIn, openAuthModal, setPendingRedirectRoute]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash || hash === 'home') {
        setCurrentRoute('feed');
      } else {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (route: string) => {
    const cleanRoute = (route === 'home' || !route) ? 'feed' : route;
    setCurrentRoute(cleanRoute);
    window.location.hash = `#/${cleanRoute}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileSidebarOpen(false);
  };

  // Extract route parameters
  const renderCurrentView = () => {
    if (currentRoute === 'bush-tv') {
      return <BushTVChat navigate={navigate} />;
    }
    if (currentRoute === 'dashboard') {
      return <CreatorDashboard navigate={navigate} />;
    }
    if (currentRoute === 'admin') {
      return <AdminDashboard navigate={navigate} />;
    }
    if (currentRoute === 'explore') {
      return <ExploreHub navigate={navigate} />;
    }
    if (currentRoute.startsWith('profile/')) {
      const username = currentRoute.replace('profile/', '');
      return <CreatorProfile username={username} navigate={navigate} />;
    }
    if (currentRoute === 'profile') {
      return <CreatorProfile username={currentUser.username || 'danou_van_rensburg'} navigate={navigate} />;
    }

    // Default to Feed page
    return <CommunityFeed navigate={navigate} />;
  };

  const showRightSidebar = currentRoute === 'feed' || currentRoute === 'explore';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b09] text-neutral-900 dark:text-stone-100 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-200 antialiased transition-colors">
      
      {/* 1. DESKTOP FIXED LEFT SIDEBAR */}
      <div className="hidden md:block flex-shrink-0 z-30">
        <Sidebar currentRoute={currentRoute} navigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />
      </div>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex-1 max-w-[280px]">
            <Sidebar currentRoute={currentRoute} navigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-4 text-stone-300 hover:text-white self-start"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* 3. CENTER MAIN CONTENT & RIGHT SIDEBAR */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* FIXED / STICKY TOP NAVIGATION HEADER (Anchored with backdrop blur and shadow) */}
        <Header
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* MAIN BODY: Content Column + Right Sidebar Column */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0">
            {renderCurrentView()}
          </main>

          {/* Right Sidebar on wide screens for feed/explore */}
          {showRightSidebar && (
            <RightSidebar navigate={navigate} />
          )}
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        navigate={navigate}
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        navigate={navigate}
      />
      <TopUpModal />
      <TransactionHistoryModal />
      <SqlSchemaModal />
      <FloatingDropletToast />
    </div>
  );
}

export default function App() {
  return (
    <PermacultureProvider>
      <AppContent />
    </PermacultureProvider>
  );
}
