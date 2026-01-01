import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lesson, TypingStats } from './types';
import { LessonCard } from './components/LessonCard';
import { LessonView } from './components/LessonView';
import { LevelGroupCollapsed } from './components/LevelGroupCollapsed';
import { SpeedTest } from './components/SpeedTest';
import { CollapsedHero } from './components/CollapsedHero';
import { DailyChallengeButton } from './components/DailyChallengeButton';
import { RetroLoadingScreen } from './components/RetroLoadingScreen';
import { useKeyboardLayout } from './providers/KeyboardLayoutProvider';
import { UserButton } from './components/UserButton';
import { GuestBanner } from './components/GuestBanner';
import { MigrationModal } from './components/MigrationModal';
import { Leaderboard } from './components/Leaderboard';
import { LegalPage } from './components/LegalPage';
import { UnsubscribePage } from './components/UnsubscribePage';
import { DailyChallengeView } from './components/DailyChallengeView';
import { Shop } from './components/Shop';
import { PremiumPage } from './components/PremiumPage';
import { CoinBalance } from './components/CoinBalance';
import { StreakDisplay } from './components/StreakDisplay';
import { PremiumBadge } from './components/PremiumBadge';
import { ColorModeToggleIcon } from './components/ColorModeToggle';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { MobileLanding } from './components/MobileLanding';
import { SEOHead, schemas } from './components/SEOHead';
import { CookieConsent } from './components/CookieConsent';
import { useGameState } from './hooks/useGameState';
import { useLessonProgress } from './hooks/useLessonProgress';
import { usePremium } from './hooks/usePremium';
import { useDeviceDetection, shouldShowMobileLanding } from './hooks/useDeviceDetection';
import { useReferral } from './hooks/useReferral';
import { LEVEL_TIERS, levels, type LevelTier } from './data/levels';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth, useClerk } from '@clerk/clerk-react';

type View = 'home' | 'lesson' | 'legal' | 'shop' | 'premium' | 'daily-challenge' | 'unsubscribe';
type LegalPageType = 'impressum' | 'privacy' | 'terms';

// Loading screen duration in ms
const LOADING_DURATION = 600;

// Guest users can only access levels 1-2
const GUEST_LEVEL_LIMIT = 2;

// Context-aware loading messages
const LOADING_MESSAGES: Record<View, string> = {
  'home': 'RETURNING TO BASE...',
  'lesson': 'LOADING LEVEL...',
  'legal': 'LOADING DOCS...',
  'shop': 'OPENING SHOP...',
  'premium': 'LOADING PREMIUM...',
  'daily-challenge': 'PREPARING CHALLENGE...',
  'unsubscribe': 'LOADING...',
};

function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType>('impressum');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [showSpeedTest, setShowSpeedTest] = useState(false); // For retaking speed test
  const [showSignUpModal, setShowSignUpModal] = useState(false); // For post-level-2 encouragement
  const [showGuestOnboarding, setShowGuestOnboarding] = useState(false); // For post-SpeedTest sign-up prompt
  const [expandPremiumLevels, setExpandPremiumLevels] = useState(false); // PRP-041: Collapsed premium levels
  const [expandThemedLevels, setExpandThemedLevels] = useState(false); // PRP-041: Collapsed themed levels

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // PRP-040: Mobile device detection and keyboard verification
  const deviceCapabilities = useDeviceDetection();
  const [mobileKeyboardVerified, setMobileKeyboardVerified] = useState(() => {
    // Check if keyboard was previously verified (persisted in localStorage)
    return localStorage.getItem('typebit8_keyboard_verified') === 'true';
  });

  // Persist keyboard verification
  useEffect(() => {
    if (mobileKeyboardVerified) {
      localStorage.setItem('typebit8_keyboard_verified', 'true');
    }
  }, [mobileKeyboardVerified]);

  // Handle URL-based routing for special pages
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/unsubscribe') {
      setView('unsubscribe');
    } else if (path === '/premium') {
      setView('premium');
    } else if (path === '/privacy') {
      setSelectedLegalPage('privacy');
      setView('legal');
    } else if (path === '/terms') {
      setSelectedLegalPage('terms');
      setView('legal');
    } else if (path === '/impressum') {
      setSelectedLegalPage('impressum');
      setView('legal');
    }
  }, []);

  // Get layout from global context
  const { layout: keyboardLayout, isLocked: keyboardLocked, lockLayout } = useKeyboardLayout();

  const { userId, isSignedIn } = useAuth();
  const { openSignUp } = useClerk();
  const gameState = useGameState();
  const { isPremium } = usePremium();
  const { hasDiscount, discountCode } = useReferral(); // PRP-046: Referral tracking

  // Convex queries for new features
  const coinBalance = useQuery(
    api.coins.getCoinBalance,
    userId ? { clerkId: userId } : "skip"
  );
  const streak = useQuery(
    api.streaks.getStreak,
    userId ? { clerkId: userId } : "skip"
  );
  const speedTestData = useQuery(
    api.users.getSpeedTestData,
    userId ? {} : "skip"
  );
  const saveInitialSpeedTest = useMutation(api.users.saveInitialSpeedTest);
  const { progress, updateProgress, getCompletedCount, isLessonUnlocked } = useLessonProgress();

  // Use static 30 levels from levels.ts (PRP-027)
  const lessons = levels;

  // Navigate with loading screen transition
  const navigateTo = useCallback((newView: View, message?: string) => {
    if (newView === view) return; // Don't transition to same view

    setLoadingMessage(message || LOADING_MESSAGES[newView]);
    setIsTransitioning(true);

    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
      setLoadingMessage(undefined);
    }, LOADING_DURATION);
  }, [view]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    navigateTo('lesson', `LOADING ${lesson.title.toUpperCase()}...`);
  };

  const handleLessonComplete = (stats: TypingStats) => {
    if (!selectedLesson) return;

    // Award XP based on WPM (matches display in LessonView)
    const baseXp = stats.wpm * 10;
    gameState.addXp(baseXp);

    updateProgress(selectedLesson.id, {
      lessonId: selectedLesson.id,
      completed: true,
      bestWPM: stats.wpm,
      bestAccuracy: stats.accuracy,
      attempts: (progress[selectedLesson.id]?.attempts || 0) + 1,
      quizPassed: progress[selectedLesson.id]?.quizPassed || false,
    });

    // Show sign-up modal after completing level 2 for guests
    if (!isSignedIn && selectedLesson.id === GUEST_LEVEL_LIMIT) {
      // Delay slightly so user sees the completion screen first
      setTimeout(() => setShowSignUpModal(true), 1500);
    }
  };

  const handleQuizComplete = (passed: boolean, stats: TypingStats) => {
    if (!selectedLesson) return;

    if (passed) {
      gameState.addXp(100);
      gameState.addCoins(50);
    }

    updateProgress(selectedLesson.id, {
      lessonId: selectedLesson.id,
      completed: true,
      bestWPM: stats.wpm,
      bestAccuracy: stats.accuracy,
      attempts: (progress[selectedLesson.id]?.attempts || 0) + 1,
      quizPassed: passed || progress[selectedLesson.id]?.quizPassed || false,
    });
  };

  const handleBack = () => {
    setSelectedLesson(null);
    navigateTo('home');
  };

  const handleLegalPage = (page: LegalPageType) => {
    setSelectedLegalPage(page);
    navigateTo('legal');
  };

  // PRP-038: Speed test handlers
  const handleSpeedTestComplete = useCallback(async (results: {
    wpm: number;
    accuracy: number;
    charactersTyped: number;
    errors: number;
    detectedLayout: string;
    testDurationMs: number;
  }, confirmed: boolean) => {
    if (confirmed) {
      // IMPORTANT: Order matters here to prevent race conditions with re-renders
      // 1. For guests, set up the onboarding screen FIRST (before lockLayout triggers re-render)
      if (!userId) {
        setShowGuestOnboarding(true);
      }

      // 2. Exit retake mode
      setShowSpeedTest(false);

      // 3. NOW lock the layout (this triggers context update and re-renders)
      lockLayout(results.detectedLayout as Parameters<typeof lockLayout>[0]);

      // 4. Save data to Convex or localStorage
      if (userId) {
        try {
          await saveInitialSpeedTest({
            wpm: results.wpm,
            accuracy: results.accuracy,
            keyboardLayout: results.detectedLayout,
            charactersTyped: results.charactersTyped,
            testDurationMs: results.testDurationMs,
          });
        } catch (err) {
          console.error('Failed to save speed test:', err);
        }
      } else {
        // Save to localStorage for guests
        localStorage.setItem('typebit8_speedtest', JSON.stringify({
          wpm: results.wpm,
          accuracy: results.accuracy,
          keyboardLayout: results.detectedLayout,
          timestamp: Date.now(),
        }));
      }
    }
  }, [userId, saveInitialSpeedTest, lockLayout]);

  const handleSpeedTestSkip = useCallback(() => {
    // Skip the speed test but still need to select keyboard manually
    // This will be handled by the existing layout picker
    setShowSpeedTest(false);
  }, []);

  const handleRetakeTest = useCallback(() => {
    setShowSpeedTest(true);
  }, []);

  const totalCompleted = getCompletedCount();

  // Filter lessons by tier
  const filteredLessons = selectedTier === 'all'
    ? lessons
    : lessons.filter(lesson => {
        const tier = LEVEL_TIERS.find(t => t.levels.includes(lesson.id));
        return tier?.id === selectedTier;
      });

  // Check if a tier is unlocked
  const isTierUnlocked = (tier: LevelTier): boolean => {
    if (!tier.unlockRequirement) return true;
    const { level, quizPassed } = tier.unlockRequirement;
    if (quizPassed && !progress[level]?.quizPassed) return false;
    return progress[level]?.completed ?? false;
  };

  // Premium level gating: levels 7+ require premium (levels 1-6 are free)
  // PRP-046: Changed from 10 to 7 to reduce free tier from 9 to 6 levels
  const PREMIUM_LEVEL_START = 7;
  const requiresPremium = (lessonId: number): boolean => lessonId >= PREMIUM_LEVEL_START;

  // Guest level gating: levels 3+ require sign-up
  const requiresSignUp = (lessonId: number): boolean => !isSignedIn && lessonId > GUEST_LEVEL_LIMIT;

  const isLevelAccessible = (lessonId: number): boolean => {
    // Guest users can only access levels 1-2
    if (requiresSignUp(lessonId)) return false;
    // Premium levels require premium
    if (requiresPremium(lessonId) && !isPremium) return false;
    return isLessonUnlocked(lessonId);
  };

  // Show loading screen during transitions
  if (isTransitioning) {
    return <RetroLoadingScreen message={loadingMessage} />;
  }

  // PRP-040: Show mobile landing page for touch devices without verified keyboard
  if (shouldShowMobileLanding(deviceCapabilities, mobileKeyboardVerified)) {
    return (
      <MobileLanding
        onKeyboardVerified={() => setMobileKeyboardVerified(true)}
      />
    );
  }

  // Shop and Premium views
  if (view === 'shop') {
    return (
      <Shop
        onClose={() => navigateTo('home')}
        onUpgrade={() => navigateTo('premium')}
      />
    );
  }

  if (view === 'premium') {
    return (
      <PremiumPage
        onClose={() => navigateTo('home')}
        referralDiscount={hasDiscount ? { code: discountCode, percent: 30 } : undefined}
      />
    );
  }

  if (view === 'daily-challenge') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <DailyChallengeView
          onBack={() => navigateTo('home')}
          keyboardLayout={keyboardLayout}
        />
      </div>
    );
  }

  if (view === 'legal') {
    return (
      <LegalPage
        page={selectedLegalPage}
        onBack={() => navigateTo('home')}
      />
    );
  }

  if (view === 'unsubscribe') {
    return (
      <UnsubscribePage
        onBack={() => {
          window.history.replaceState({}, '', '/');
          navigateTo('home');
        }}
      />
    );
  }

  if (view === 'lesson' && selectedLesson) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <LessonView
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onQuizComplete={handleQuizComplete}
          onBack={handleBack}
          keyboardLayout={keyboardLayout}
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="typebit8 - Master the Keyboard"
        description="Learn touch typing with all 10 fingers through fun, gamified lessons. Master the keyboard with typebit8 - the retro-style typing game."
        path="/"
        schema={[schemas.softwareApplication, schemas.organization]}
      />
      <div className="min-h-screen">
        {/* Guest Banner */}
        <GuestBanner />

      {/* Migration Modal */}
      <MigrationModal />

      {/* Sign Up Modal (shown after level 2 or when clicking locked levels) */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(var(--bg-primary-rgb, 15, 15, 27), 0.95)' }}
            onClick={() => setShowSignUpModal(false)}
          />

          {/* Modal */}
          <div
            className="relative pixel-box p-8 max-w-md w-full text-center"
            style={{
              background: 'var(--bg-secondary)',
              border: '4px solid var(--border-color)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSignUpModal(false)}
              className="absolute top-4 right-4"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            {/* Icon */}
            <div className="text-5xl mb-6">🎮</div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: 'var(--accent-yellow)',
                marginBottom: '16px',
              }}
              className="text-glow-yellow"
            >
              {t('signup.unlockLevels')}
            </h2>

            {/* Description */}
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: 'var(--text-primary)',
                lineHeight: '2.2',
                marginBottom: '24px',
              }}
            >
              {t('signup.createFree')}
            </p>

            {/* Benefits */}
            <div
              className="p-4 mb-6"
              style={{
                background: 'var(--gradient-cyan-box)',
                border: '2px solid var(--border-color-muted)',
                borderRadius: '4px',
              }}
            >
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                    {t('benefits.levels')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                    {t('benefits.trackProgress')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                    {t('benefits.leaderboards')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                    {t('benefits.dailyStreaks')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              onClick={() => {
                setShowSignUpModal(false);
                openSignUp();
              }}
              className="w-full px-6 py-4 mb-4 transition-transform hover:scale-105"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--shadow-color)',
              }}
            >
              {t('signup.signUpFree')}
            </button>

            {/* Guest note */}
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                color: 'var(--text-muted)',
              }}
            >
              {t('signup.guestAccess')}
            </p>
          </div>
        </div>
      )}

      {/* Header HUD */}
      <header className="pixel-box m-2 p-2 md:m-4 md:p-4 overflow-hidden md:overflow-visible">
        <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0"
              style={{
                border: '4px solid var(--accent-yellow)',
                background: 'var(--bg-secondary)',
                boxShadow: '4px 4px 0 var(--bg-primary), 0 0 15px var(--glow-yellow)',
              }}
            >
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: 'var(--accent-yellow)' }} className="md:text-xl">⌨</span>
            </div>
            <div className="hidden sm:block">
              <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--accent-yellow)' }} className="text-glow-yellow">
                {t('header.title')}
              </h1>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                {t('header.subtitle')}
              </p>
            </div>
            {/* Premium Badge - hidden on mobile */}
            {isPremium && <div className="hidden md:block"><PremiumBadge /></div>}
          </div>

          {/* Player Stats */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Streak Display - hidden on small mobile */}
            {userId && streak && (
              <div className="hidden sm:block">
                <StreakDisplay
                  streak={streak.currentStreak}
                  freezeCount={streak.streakFreezeCount}
                  longestStreak={streak.longestStreak}
                  showDetails={true}
                />
              </div>
            )}

            {/* Coins with Shop Link - responsive size */}
            <div className="hidden sm:block">
              <CoinBalance
                balance={coinBalance ?? gameState.coins}
                size="lg"
                onClick={() => navigateTo('shop')}
              />
            </div>
            <div className="sm:hidden">
              <CoinBalance
                balance={coinBalance ?? gameState.coins}
                size="sm"
                onClick={() => navigateTo('shop')}
              />
            </div>

            {/* Daily Challenge Button - hidden on mobile */}
            {keyboardLocked && (
              <div className="hidden md:block">
                <DailyChallengeButton onClick={() => navigateTo('daily-challenge')} />
              </div>
            )}

            {/* Premium/Upgrade Button - hidden on mobile */}
            {!isPremium && (
              <button
                onClick={() => navigateTo('premium')}
                className="hidden md:block px-3 py-2 border-2 transition-colors"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: 'var(--accent-yellow)',
                  borderColor: 'var(--accent-yellow)',
                }}
              >
                👑 PREMIUM
              </button>
            )}

            {/* Level - compact on mobile */}
            <div className="text-center">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }} className="hidden md:block">LEVEL</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: 'var(--accent-yellow)' }} className="text-glow-yellow md:text-xl">
                {gameState.level}
              </div>
            </div>

            {/* XP Bar - hidden on mobile */}
            <div className="hidden md:block w-24 md:w-32">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                XP: {gameState.xp}/{gameState.XP_PER_LEVEL}
              </div>
              <div className="pixel-bar h-4">
                <div
                  className="pixel-bar-fill"
                  style={{
                    width: `${gameState.getXpProgress()}%`,
                    background: 'var(--gradient-green-box)',
                  }}
                />
              </div>
            </div>

            {/* Language Switcher - PRP-050 */}
            <LanguageSwitcher compact />

            {/* Color Mode Toggle - PRP-049 */}
            <ColorModeToggleIcon />

            {/* User Button (includes Avatar) */}
            <UserButton userLevel={gameState.level} onOpenShop={() => navigateTo('shop')} onOpenPremium={() => navigateTo('premium')} />
          </div>
        </div>
      </header>

      {/* Conditional Layout Based on Keyboard Detection */}
      {(!keyboardLocked || showSpeedTest) ? (
        /* ========== NEW USER FLOW (Keyboard not set up) or RETAKE ========== */
        <>
          {/* Hero Section with full onboarding */}
          <section className="p-4 md:p-8 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <div className="mb-8">
                <h2
                  style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--text-primary)', lineHeight: '2' }}
                  className="mb-4"
                >
                  LEARN TO TYPE WITH
                </h2>
                <h2
                  style={{ fontFamily: "'Press Start 2P'", fontSize: '32px', color: 'var(--accent-cyan)', lineHeight: '1.5' }}
                  className="text-glow-cyan"
                >
                  ALL 10 FINGERS
                </h2>
              </div>

              {/* Stats boxes */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--accent-yellow)' }} className="text-glow-yellow">
                    {lessons.length}
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-cyan)' }}>LEVELS</div>
                </div>
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--accent-green)' }} className="text-glow-green">
                    {totalCompleted}
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-cyan)' }}>CLEARED</div>
                </div>
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--accent-pink)' }}>
                    {gameState.maxCombo}x
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-cyan)' }}>BEST COMBO</div>
                </div>
              </div>

              {/* PRP-038: Speed Test for keyboard detection + baseline measurement */}
              <SpeedTest
                onComplete={handleSpeedTestComplete}
                onSkip={showSpeedTest ? handleSpeedTestSkip : undefined}
              />
            </div>
          </section>
        </>
      ) : showGuestOnboarding ? (
        /* ========== GUEST ONBOARDING (Just completed SpeedTest) ========== */
        <section className="p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div
              className="pixel-box p-8 text-center"
              style={{
                background: 'var(--gradient-feature)',
                border: '4px solid var(--border-color)',
              }}
            >
              {/* Keyboard Confirmed Badge */}
              <div
                className="inline-block px-4 py-2 mb-6"
                style={{
                  background: 'var(--gradient-green-box)',
                  border: '2px solid var(--accent-green)',
                  borderRadius: '4px',
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-green)' }}>
                  ✓ KEYBOARD SETUP COMPLETE
                </span>
              </div>

              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '18px', color: 'var(--accent-yellow)' }}
                className="mb-4 text-glow-yellow"
              >
                CREATE FREE ACCOUNT
              </h2>

              <p
                style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2.2' }}
                className="mb-8"
              >
                UNLOCK THE FULL TYPING EXPERIENCE!
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'var(--gradient-cyan-box)',
                    border: '3px solid var(--border-color-muted)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">📊</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-cyan)', marginTop: '8px' }}>
                    TRACK YOUR<br />PROGRESS
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'var(--gradient-yellow-box)',
                    border: '3px solid var(--accent-yellow)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🎮</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-yellow)', marginTop: '8px' }}>
                    30 LEVELS<br />UNLOCKED
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'var(--gradient-green-box)',
                    border: '3px solid var(--accent-green)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🏆</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-green)', marginTop: '8px' }}>
                    COMPETE ON<br />LEADERBOARDS
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'rgba(var(--accent-pink-rgb, 255, 107, 157), 0.2)',
                    border: '3px solid var(--accent-pink)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🔥</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: 'var(--accent-pink)', marginTop: '8px' }}>
                    BUILD DAILY<br />STREAKS
                  </p>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                onClick={() => openSignUp()}
                className="w-full max-w-sm px-8 py-5 mb-6 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '14px',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 0 var(--shadow-color)',
                }}
              >
                SIGN UP FREE
              </button>

              {/* Guest Option */}
              <div className="pt-4" style={{ borderTop: '2px solid var(--bg-tertiary)' }}>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  WANT TO TRY FIRST?
                </p>
                <button
                  onClick={() => setShowGuestOnboarding(false)}
                  className="px-6 py-3 transition-all hover:brightness-125"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: '2px solid var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  CONTINUE AS GUEST
                </button>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  (LEVELS 1-2 ONLY)
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ========== RETURNING USER FLOW (Keyboard set up) ========== */
        <>
          {/* PRP-038: Collapsed Hero for returning users */}
          <section className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <CollapsedHero
                initialWpm={speedTestData?.initialSpeedTest?.wpm}
                onRetakeTest={handleRetakeTest}
                onStartPracticing={() => {
                  // Scroll to lessons section
                  document.getElementById('lessons-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </section>

          {/* Sign-up encouragement for returning guests */}
          {!isSignedIn && (
            <section className="p-4 md:p-8 pt-0">
              <div className="max-w-2xl mx-auto">
                <div
                  className="pixel-box p-6 text-center"
                  style={{
                    background: 'var(--gradient-feature)',
                    border: '2px solid var(--border-color)',
                  }}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <h3
                        style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-yellow)' }}
                        className="mb-2"
                      >
                        SIGN UP TO UNLOCK ALL LEVELS
                      </h3>
                      <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--text-muted)' }}>
                        GUEST ACCESS: LEVELS 1-2 ONLY
                      </p>
                    </div>
                    <button
                      onClick={() => openSignUp()}
                      className="px-6 py-3 transition-transform hover:scale-105 whitespace-nowrap"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        background: 'var(--btn-primary-bg)',
                        color: 'var(--btn-primary-text)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 0 var(--shadow-color)',
                      }}
                    >
                      SIGN UP FREE
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PRP-041: Dual Learning Advantage Marketing Section */}
          <section className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div
                className="pixel-box p-8 text-center"
                style={{
                  background: 'var(--gradient-premium)',
                  border: '4px solid var(--accent-purple)',
                  boxShadow: '0 0 30px rgba(var(--accent-purple-rgb, 139, 92, 246), 0.2)',
                }}
              >
                {/* Title */}
                <h2
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '16px',
                    color: 'var(--accent-yellow)',
                    marginBottom: '24px',
                    lineHeight: '1.8',
                  }}
                  className="text-glow-yellow"
                >
                  {t('marketing.learnTwoSkills')}
                </h2>

                {/* Subtitle */}
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                    marginBottom: '24px',
                  }}
                >
                  {t('marketing.masterTypingWhile')}
                </p>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div
                    className="p-4"
                    style={{
                      background: 'var(--gradient-cyan-box)',
                      border: '2px solid var(--border-color-muted)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">🤖</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: 'var(--accent-cyan)', lineHeight: '2' }}>
                      {t('marketing.aiPrompting')}
                    </p>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: 'var(--gradient-yellow-box)',
                      border: '2px solid var(--accent-yellow)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">💻</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: 'var(--accent-yellow)', lineHeight: '2' }}>
                      {t('marketing.codingPatterns')}
                    </p>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: 'rgba(var(--accent-purple-rgb, 139, 92, 246), 0.1)',
                      border: '2px solid var(--accent-purple)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">📧</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: 'var(--accent-purple)', lineHeight: '2' }}>
                      {t('marketing.businessComm')}
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: 'var(--accent-cyan)',
                    marginBottom: '24px',
                    fontStyle: 'italic',
                  }}
                >
                  "{t('marketing.tagline')}"
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => navigateTo('premium')}
                  className="px-8 py-4 transition-transform hover:scale-105"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    background: 'var(--btn-premium-bg)',
                    color: 'var(--text-on-accent)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 var(--shadow-color)',
                  }}
                >
                  ⚡ {t('marketing.unlockSpeed')}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* How to Play - Only for new users (not during retake) */}
      {(!keyboardLocked && !showSpeedTest) && (
        <section className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h3
              style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--accent-yellow)', marginBottom: '24px' }}
              className="text-center"
            >
              {t('howToPlay.title')}
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="pixel-box p-6 text-center">
                <div className="text-4xl mb-4">📖</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  1. {t('howToPlay.learn')}
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)', lineHeight: '2' }}>
                  {t('howToPlay.learnDesc')}
                </p>
              </div>

              <div className="pixel-box pixel-box-yellow p-6 text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  2. {t('howToPlay.battle')}
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)', lineHeight: '2' }}>
                  {t('howToPlay.battleDesc')}
                </p>
              </div>

              <div className="pixel-box pixel-box-green p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  3. {t('howToPlay.victory')}
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)', lineHeight: '2' }}>
                  {t('howToPlay.victoryDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Level Select - PROMOTED TO TOP for returning users */}
      <section id="lessons-section" className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--accent-yellow)' }}>
              {t('home.selectLevel')}
            </h3>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}>
              {totalCompleted}/{lessons.length} {t('home.complete')}
            </span>
          </div>

          {/* Tier Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTier('all')}
              className="px-3 py-2 border-2 transition-colors"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                borderColor: selectedTier === 'all' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                backgroundColor: selectedTier === 'all' ? 'var(--accent-cyan)' : 'transparent',
                color: selectedTier === 'all' ? 'var(--bg-secondary)' : 'var(--text-primary)',
              }}
            >
              ALL TIERS
            </button>
            {LEVEL_TIERS.map(tier => {
              const unlocked = isTierUnlocked(tier);
              return (
                <button
                  key={tier.id}
                  onClick={() => unlocked && setSelectedTier(tier.id)}
                  disabled={!unlocked}
                  className="px-3 py-2 border-2 transition-colors"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '6px',
                    borderColor: unlocked ? tier.color : 'var(--bg-tertiary)',
                    backgroundColor: selectedTier === tier.id ? tier.color : 'transparent',
                    color: selectedTier === tier.id ? 'var(--bg-secondary)' : (unlocked ? tier.color : 'var(--text-muted)'),
                    opacity: unlocked ? 1 : 0.5,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!unlocked && '🔒 '}{tier.name}
                </button>
              );
            })}
          </div>

          {/* Selected Tier Info */}
          {selectedTier !== 'all' && (
            <div
              className="mb-6 p-4 border-2"
              style={{
                borderColor: LEVEL_TIERS.find(t => t.id === selectedTier)?.color ?? 'var(--text-muted)',
                backgroundColor: 'var(--card-bg)',
              }}
            >
              <h4
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: LEVEL_TIERS.find(t => t.id === selectedTier)?.color ?? 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                TIER {selectedTier}: {LEVEL_TIERS.find(t => t.id === selectedTier)?.name}
              </h4>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: 'var(--accent-cyan)' }}>
                {LEVEL_TIERS.find(t => t.id === selectedTier)?.description.toUpperCase()}
              </p>
            </div>
          )}

          {/* PRP-046: Progress Bar with Locked Content Preview */}
          {selectedTier === 'all' && (
            <div
              className="mb-6 p-4"
              style={{
                background: 'var(--gradient-feature)',
                border: '3px solid var(--border-color)',
                fontFamily: "'Press Start 2P'",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '8px', color: 'var(--accent-cyan)' }}>YOUR PROGRESS</span>
                <span style={{ fontSize: '8px', color: 'var(--text-primary)' }}>
                  {Object.values(progress).filter(p => p?.completed && p?.quizPassed).length} / 50 LEVELS
                </span>
              </div>
              <div
                style={{
                  height: '12px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Completed progress */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(Object.values(progress).filter(p => p?.completed && p?.quizPassed).length / 50) * 100}%`,
                    background: 'var(--gradient-green-box)',
                    transition: 'width 0.3s ease',
                  }}
                />
                {/* Free tier marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${(6 / 50) * 100}%`,
                    top: 0,
                    height: '100%',
                    width: '2px',
                    background: 'var(--accent-yellow)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ fontSize: '6px', color: 'var(--accent-green)' }}>6 FREE</span>
                <span style={{ fontSize: '6px', color: 'var(--accent-yellow)' }}>
                  {isPremium ? '✓ PREMIUM UNLOCKED' : '+44 PREMIUM LEVELS'}
                </span>
              </div>
            </div>
          )}

          {/* PRP-041: Grouped Level View */}
          {selectedTier === 'all' ? (
            <div className="space-y-6">
              {/* Free Levels (1-6) - PRP-046: Updated from 1-9 */}
              <div>
                <h4
                  className="mb-4 flex items-center gap-2"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--accent-green)',
                  }}
                >
                  <span>🎮</span> FREE BASICS (1-6)
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.filter(l => l.id <= 6).map(lesson => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={progress[lesson.id]}
                      isLocked={!isLevelAccessible(lesson.id)}
                      isPremiumLocked={false}
                      isGuestLocked={requiresSignUp(lesson.id)}
                      onClick={() => {
                        if (requiresSignUp(lesson.id)) {
                          setShowSignUpModal(true);
                          return;
                        }
                        if (isLessonUnlocked(lesson.id)) {
                          handleLessonSelect(lesson);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Premium Levels (7-30) - PRP-046: Updated from 10-30 */}
              {!expandPremiumLevels ? (
                <LevelGroupCollapsed
                  type="premium"
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('premium')}
                  onExpand={() => setExpandPremiumLevels(true)}
                  levelRange="7-30"
                  totalLevels={24}
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className="flex items-center gap-2"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      <span>⭐</span> PREMIUM LEVELS (7-30)
                    </h4>
                    <button
                      onClick={() => setExpandPremiumLevels(false)}
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '7px',
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        border: '1px solid var(--text-muted)',
                        padding: '6px 12px',
                      }}
                    >
                      ▲ COLLAPSE
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.filter(l => l.id >= 7 && l.id <= 30).map(lesson => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        progress={progress[lesson.id]}
                        isLocked={!isLevelAccessible(lesson.id)}
                        isPremiumLocked={!isPremium}
                        isGuestLocked={requiresSignUp(lesson.id)}
                        onClick={() => {
                          if (requiresSignUp(lesson.id)) {
                            setShowSignUpModal(true);
                            return;
                          }
                          if (!isPremium) {
                            navigateTo('premium');
                            return;
                          }
                          if (isLessonUnlocked(lesson.id)) {
                            handleLessonSelect(lesson);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Themed Levels (31-50) - Collapsed or Expanded */}
              {!expandThemedLevels ? (
                <LevelGroupCollapsed
                  type="themed"
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('premium')}
                  onExpand={() => setExpandThemedLevels(true)}
                  levelRange="31-50"
                  totalLevels={20}
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className="flex items-center gap-2"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-purple)',
                      }}
                    >
                      <span>⚡</span> SPEED OF THOUGHT (31-50)
                    </h4>
                    <button
                      onClick={() => setExpandThemedLevels(false)}
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '7px',
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        border: '1px solid var(--text-muted)',
                        padding: '6px 12px',
                      }}
                    >
                      ▲ COLLAPSE
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.filter(l => l.id >= 31 && l.id <= 50).map(lesson => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        progress={progress[lesson.id]}
                        isLocked={!isLevelAccessible(lesson.id)}
                        isPremiumLocked={!isPremium}
                        isGuestLocked={requiresSignUp(lesson.id)}
                        onClick={() => {
                          if (requiresSignUp(lesson.id)) {
                            setShowSignUpModal(true);
                            return;
                          }
                          if (!isPremium) {
                            navigateTo('premium');
                            return;
                          }
                          if (isLessonUnlocked(lesson.id)) {
                            handleLessonSelect(lesson);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Filtered tier view - show all levels in selected tier */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map(lesson => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  progress={progress[lesson.id]}
                  isLocked={!isLevelAccessible(lesson.id)}
                  isPremiumLocked={requiresPremium(lesson.id) && !isPremium}
                  isGuestLocked={requiresSignUp(lesson.id)}
                  onClick={() => {
                    if (requiresSignUp(lesson.id)) {
                      setShowSignUpModal(true);
                      return;
                    }
                    if (requiresPremium(lesson.id) && !isPremium) {
                      navigateTo('premium');
                      return;
                    }
                    if (isLessonUnlocked(lesson.id)) {
                      handleLessonSelect(lesson);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard - Show for returning users */}
      {keyboardLocked && (
        <section className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Leaderboard showGlobal={true} limit={5} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="p-8 text-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-muted)' }}>
          {t('footer.copyright', { year: currentYear })}
        </p>
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {t('footer.practiceDaily')}
        </p>

        {/* Legal Links */}
        <div className="mt-6 flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => handleLegalPage('impressum')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            {t('footer.impressum')}
          </button>
          <button
            onClick={() => handleLegalPage('privacy')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            {t('footer.privacy')}
          </button>
          <button
            onClick={() => handleLegalPage('terms')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            {t('footer.terms')}
          </button>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 pixel-box p-4 max-w-md mx-auto">
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-yellow)', marginBottom: '12px' }}>
            {t('footer.feedback')}
          </p>
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2', marginBottom: '12px' }}>
            {t('footer.feedbackDesc')}
          </p>
          <a
            href="mailto:info@typebit8.com"
            className="inline-block px-4 py-3 border-2 transition-colors"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: 'var(--accent-cyan)',
              borderColor: 'var(--accent-cyan)',
            }}
          >
            ✉ INFO@TYPEBIT8.COM
          </a>
        </div>

        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-muted)', marginTop: '16px' }}>
          {t('footer.operator')}
        </p>
      </footer>
      </div>

      {/* PRP-046: Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}

export default App;
