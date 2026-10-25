import React, { useState, useEffect } from 'react';
import { PermacultureProvider, usePermaculture } from './context/PermacultureContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { BushTVChat } from './components/BushTVChat';
import { CommunityFeed } from './components/CommunityFeed';
import { ExploreHub } from './components/ExploreHub';
import { LearnHub } from './components/LearnHub';
import { CourseViewer } from './components/CourseViewer';
import { CourseCreator } from './components/CourseCreator';
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
import { BottomNavBar } from './components/BottomNavBar';
import { MessengerDrawer } from './components/MessengerDrawer';
import { MessengerProvider } from './context/MessengerContext';
import { LegalPageView } from './components/LegalPageView';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CommunityGuidelinesModal } from './components/CommunityGuidelinesModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

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
    if (currentRoute === 'learn') {
      return <LearnHub navigate={navigate} />;
    }
    if (currentRoute === 'learn/create') {
      return <CourseCreator navigate={navigate} />;
    }
    if (currentRoute.startsWith('learn/edit/')) {
      const courseId = currentRoute.replace('learn/edit/', '');
      return <CourseCreator navigate={navigate} existingCourseId={courseId} />;
    }
    if (currentRoute.startsWith('learn/')) {
      const courseId = currentRoute.replace('learn/', '');
      return <CourseViewer courseId={courseId} navigate={navigate} />;
    }
    if (currentRoute === 'explore') {
      return <LearnHub navigate={navigate} />;
    }
    if (currentRoute.startsWith('profile/')) {
      const username = currentRoute.replace('profile/', '');
      return <CreatorProfile username={username} navigate={navigate} />;
    }
    if (currentRoute === 'profile') {
      return <CreatorProfile username={currentUser.username || 'danou_van_rensburg'} navigate={navigate} />;
    }
    if (currentRoute === 'terms' || currentRoute === 'privacy' || currentRoute === 'guidelines' || currentRoute === 'standards') {
      const legalType = currentRoute === 'standards' ? 'guidelines' : (currentRoute as 'terms' | 'privacy' | 'guidelines');
      return <LegalPageView type={legalType} navigate={navigate} />;
    }

    // Default to Feed page
    return <CommunityFeed navigate={navigate} />;
  };

  const showRightSidebar = currentRoute === 'feed';

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#070b09] text-stone-900 dark:text-stone-100 flex font-sans selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:text-emerald-200 antialiased transition-colors">
      
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
          onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
          onOpenTerms={() => setIsTermsModalOpen(true)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        />

        {/* MAIN BODY: Content Column + Right Sidebar Column */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            {renderCurrentView()}
          </main>

          {/* Right Sidebar on wide screens for feed/explore */}
          {showRightSidebar && (
            <RightSidebar navigate={navigate} />
          )}
        </div>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <BottomNavBar currentRoute={currentRoute} navigate={navigate} />

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
      <MessengerDrawer />
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <CommunityGuidelinesModal
        isOpen={isGuidelinesModalOpen}
        onClose={() => setIsGuidelinesModalOpen(false)}
      />
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PermacultureProvider>
      <MessengerProvider>
        <AppContent />
      </MessengerProvider>
    </PermacultureProvider>
  );
}
