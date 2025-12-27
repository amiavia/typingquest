import { useState, useCallback, useEffect } from 'react';
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
import { DailyChallengeView } from './components/DailyChallengeView';
import { Shop } from './components/Shop';
import { PremiumPage } from './components/PremiumPage';
import { CoinBalance } from './components/CoinBalance';
import { StreakDisplay } from './components/StreakDisplay';
import { PremiumBadge } from './components/PremiumBadge';
import { MobileLanding } from './components/MobileLanding';
import { useGameState } from './hooks/useGameState';
import { useLessonProgress } from './hooks/useLessonProgress';
import { usePremium } from './hooks/usePremium';
import { useDeviceDetection, shouldShowMobileLanding } from './hooks/useDeviceDetection';
import { LEVEL_TIERS, levels, type LevelTier } from './data/levels';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth, useClerk } from '@clerk/clerk-react';

type View = 'home' | 'lesson' | 'legal' | 'shop' | 'premium' | 'daily-challenge';
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
};

function App() {
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

  // Get layout from global context
  const { layout: keyboardLayout, isLocked: keyboardLocked, lockLayout } = useKeyboardLayout();

  const { userId, isSignedIn } = useAuth();
  const { openSignUp } = useClerk();
  const gameState = useGameState();
  const { isPremium } = usePremium();

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

  // Premium level gating: levels 10-30 require premium
  const PREMIUM_LEVEL_START = 10;
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
      <PremiumPage onClose={() => navigateTo('home')} />
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
            style={{ background: 'rgba(14, 14, 18, 0.95)' }}
            onClick={() => setShowSignUpModal(false)}
          />

          {/* Modal */}
          <div
            className="relative pixel-box p-8 max-w-md w-full text-center"
            style={{
              background: '#1a1a2e',
              border: '4px solid #3bceac',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSignUpModal(false)}
              className="absolute top-4 right-4"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#4a4a6e',
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
                color: '#ffd93d',
                marginBottom: '16px',
              }}
              className="text-glow-yellow"
            >
              UNLOCK MORE LEVELS!
            </h2>

            {/* Description */}
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db',
                lineHeight: '2.2',
                marginBottom: '24px',
              }}
            >
              CREATE A FREE ACCOUNT TO<br />
              CONTINUE YOUR TYPING JOURNEY
            </p>

            {/* Benefits */}
            <div
              className="p-4 mb-6"
              style={{
                background: 'rgba(59, 206, 172, 0.1)',
                border: '2px solid rgba(59, 206, 172, 0.3)',
                borderRadius: '4px',
              }}
            >
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                    30 LEVELS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                    TRACK PROGRESS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                    LEADERBOARDS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                    DAILY STREAKS
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
                background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                color: '#0f0f1b',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #0a8a54',
              }}
            >
              SIGN UP FREE
            </button>

            {/* Guest note */}
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                color: '#4a4a6e',
              }}
            >
              GUEST ACCESS: LEVELS 1-2 ONLY
            </p>
          </div>
        </div>
      )}

      {/* Header HUD */}
      <header className="pixel-box m-2 p-2 md:m-4 md:p-4 overflow-hidden">
        <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div
              className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#ffd93d] bg-[#1a1a2e] flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '4px 4px 0 #0f0f1b, 0 0 15px rgba(255, 217, 61, 0.3)' }}
            >
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }} className="md:text-xl">⌨</span>
            </div>
            <div className="hidden sm:block">
              <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }} className="text-glow-yellow">
                TYPEBIT8
              </h1>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                MASTER THE KEYBOARD
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
                className="hidden md:block px-3 py-2 border-2 border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#ffd93d' }}
              >
                👑 PREMIUM
              </button>
            )}

            {/* Level - compact on mobile */}
            <div className="text-center">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }} className="hidden md:block">LEVEL</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }} className="text-glow-yellow md:text-xl">
                {gameState.level}
              </div>
            </div>

            {/* XP Bar - hidden on mobile */}
            <div className="hidden md:block w-24 md:w-32">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', marginBottom: '4px' }}>
                XP: {gameState.xp}/{gameState.XP_PER_LEVEL}
              </div>
              <div className="pixel-bar h-4">
                <div
                  className="pixel-bar-fill"
                  style={{
                    width: `${gameState.getXpProgress()}%`,
                    background: 'linear-gradient(90deg, #3bceac, #0ead69)',
                  }}
                />
              </div>
            </div>

            {/* User Button (includes Avatar) */}
            <UserButton userLevel={gameState.level} onOpenShop={() => navigateTo('shop')} />
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
                  style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#eef5db', lineHeight: '2' }}
                  className="mb-4"
                >
                  LEARN TO TYPE WITH
                </h2>
                <h2
                  style={{ fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#3bceac', lineHeight: '1.5' }}
                  className="text-glow-cyan"
                >
                  ALL 10 FINGERS
                </h2>
              </div>

              {/* Stats boxes */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ffd93d' }} className="text-glow-yellow">
                    {lessons.length}
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>LEVELS</div>
                </div>
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#0ead69' }} className="text-glow-green">
                    {totalCompleted}
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>CLEARED</div>
                </div>
                <div className="pixel-box p-4 text-center">
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ff6b9d' }}>
                    {gameState.maxCombo}x
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>BEST COMBO</div>
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
                background: 'linear-gradient(135deg, rgba(59, 206, 172, 0.15), rgba(255, 217, 61, 0.1))',
                border: '4px solid #3bceac',
              }}
            >
              {/* Keyboard Confirmed Badge */}
              <div
                className="inline-block px-4 py-2 mb-6"
                style={{
                  background: 'rgba(14, 173, 105, 0.2)',
                  border: '2px solid #0ead69',
                  borderRadius: '4px',
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#0ead69' }}>
                  ✓ KEYBOARD SETUP COMPLETE
                </span>
              </div>

              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#ffd93d' }}
                className="mb-4 text-glow-yellow"
              >
                CREATE FREE ACCOUNT
              </h2>

              <p
                style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db', lineHeight: '2.2' }}
                className="mb-8"
              >
                UNLOCK THE FULL TYPING EXPERIENCE!
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'rgba(59, 206, 172, 0.2)',
                    border: '3px solid rgba(59, 206, 172, 0.5)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">📊</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '8px' }}>
                    TRACK YOUR<br />PROGRESS
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'rgba(255, 217, 61, 0.2)',
                    border: '3px solid rgba(255, 217, 61, 0.5)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🎮</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffd93d', marginTop: '8px' }}>
                    30 LEVELS<br />UNLOCKED
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'rgba(14, 173, 105, 0.2)',
                    border: '3px solid rgba(14, 173, 105, 0.5)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🏆</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#0ead69', marginTop: '8px' }}>
                    COMPETE ON<br />LEADERBOARDS
                  </p>
                </div>
                <div
                  className="p-4 text-center"
                  style={{
                    background: 'rgba(255, 107, 157, 0.2)',
                    border: '3px solid rgba(255, 107, 157, 0.5)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-3xl">🔥</span>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ff6b9d', marginTop: '8px' }}>
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
                  background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                  color: '#0f0f1b',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 0 #0a8a54',
                }}
              >
                SIGN UP FREE
              </button>

              {/* Guest Option */}
              <div className="pt-4 border-t-2 border-[#2a2a4e]">
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#4a4a6e', marginBottom: '12px' }}>
                  WANT TO TRY FIRST?
                </p>
                <button
                  onClick={() => setShowGuestOnboarding(false)}
                  className="px-6 py-3 transition-all hover:brightness-125"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#4a4a6e',
                    background: 'transparent',
                    border: '2px solid #4a4a6e',
                    cursor: 'pointer',
                  }}
                >
                  CONTINUE AS GUEST
                </button>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e', marginTop: '8px' }}>
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
                    background: 'linear-gradient(135deg, rgba(59, 206, 172, 0.1), rgba(255, 217, 61, 0.05))',
                    border: '2px solid #3bceac',
                  }}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <h3
                        style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ffd93d' }}
                        className="mb-2"
                      >
                        SIGN UP TO UNLOCK ALL LEVELS
                      </h3>
                      <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                        GUEST ACCESS: LEVELS 1-2 ONLY
                      </p>
                    </div>
                    <button
                      onClick={() => openSignUp()}
                      className="px-6 py-3 transition-transform hover:scale-105 whitespace-nowrap"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                        color: '#0f0f1b',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 0 #0a8a54',
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
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 206, 172, 0.1))',
                  border: '4px solid #8b5cf6',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
                }}
              >
                {/* Title */}
                <h2
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '16px',
                    color: '#ffd93d',
                    marginBottom: '24px',
                    lineHeight: '1.8',
                  }}
                  className="text-glow-yellow"
                >
                  LEARN TWO SKILLS AT ONCE
                </h2>

                {/* Subtitle */}
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#eef5db',
                    marginBottom: '24px',
                  }}
                >
                  MASTER TYPING SPEED WHILE LEARNING:
                </p>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div
                    className="p-4"
                    style={{
                      background: 'rgba(59, 206, 172, 0.1)',
                      border: '2px solid rgba(59, 206, 172, 0.4)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">🤖</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#3bceac', lineHeight: '2' }}>
                      EXPERT AI PROMPTING<br />TECHNIQUES
                    </p>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: 'rgba(255, 217, 61, 0.1)',
                      border: '2px solid rgba(255, 217, 61, 0.4)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">💻</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffd93d', lineHeight: '2' }}>
                      PROFESSIONAL CODING<br />PATTERNS
                    </p>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '2px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-3xl mb-2">📧</div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#8b5cf6', lineHeight: '2' }}>
                      BUSINESS<br />COMMUNICATION
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#3bceac',
                    marginBottom: '24px',
                    fontStyle: 'italic',
                  }}
                >
                  "TYPE IT. LEARN IT. NEVER FORGET IT."
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => navigateTo('premium')}
                  className="px-8 py-4 transition-transform hover:scale-105"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    background: 'linear-gradient(180deg, #8b5cf6, #6d28d9)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #4c1d95, 0 0 20px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  ⚡ UNLOCK SPEED OF THOUGHT TYPING
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
              style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d', marginBottom: '24px' }}
              className="text-center"
            >
              HOW TO PLAY
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="pixel-box p-6 text-center">
                <div className="text-4xl mb-4">📖</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db', marginBottom: '8px' }}>
                  1. LEARN
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', lineHeight: '2' }}>
                  EACH LEVEL TEACHES NEW KEYS AND FINGER POSITIONS
                </p>
              </div>

              <div className="pixel-box pixel-box-yellow p-6 text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db', marginBottom: '8px' }}>
                  2. BATTLE
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', lineHeight: '2' }}>
                  TYPE FAST AND BUILD COMBOS TO DEFEAT THE BOSS
                </p>
              </div>

              <div className="pixel-box pixel-box-green p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h4 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db', marginBottom: '8px' }}>
                  3. VICTORY
                </h4>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', lineHeight: '2' }}>
                  EARN XP, COINS AND UNLOCK NEW LEVELS
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
            <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
              SELECT LEVEL
            </h3>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}>
              {totalCompleted}/{lessons.length} COMPLETE
            </span>
          </div>

          {/* Tier Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-2 border-2 transition-colors ${
                selectedTier === 'all'
                  ? 'border-[#3bceac] bg-[#3bceac] text-[#1a1a2e]'
                  : 'border-[#4a4a6e] hover:border-[#3bceac]'
              }`}
              style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: selectedTier === 'all' ? '#1a1a2e' : '#eef5db' }}
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
                  className={`px-3 py-2 border-2 transition-colors ${
                    !unlocked
                      ? 'border-[#2a2a3e] opacity-50 cursor-not-allowed'
                      : selectedTier === tier.id
                        ? 'bg-opacity-100'
                        : 'hover:brightness-125'
                  }`}
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '6px',
                    borderColor: unlocked ? tier.color : '#2a2a3e',
                    backgroundColor: selectedTier === tier.id ? tier.color : 'transparent',
                    color: selectedTier === tier.id ? '#1a1a2e' : (unlocked ? tier.color : '#4a4a6e'),
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
                borderColor: LEVEL_TIERS.find(t => t.id === selectedTier)?.color ?? '#4a4a6e',
                backgroundColor: 'rgba(26, 26, 46, 0.8)',
              }}
            >
              <h4
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: LEVEL_TIERS.find(t => t.id === selectedTier)?.color ?? '#eef5db',
                  marginBottom: '8px',
                }}
              >
                TIER {selectedTier}: {LEVEL_TIERS.find(t => t.id === selectedTier)?.name}
              </h4>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                {LEVEL_TIERS.find(t => t.id === selectedTier)?.description.toUpperCase()}
              </p>
            </div>
          )}

          {/* PRP-041: Grouped Level View */}
          {selectedTier === 'all' ? (
            <div className="space-y-6">
              {/* Free Levels (1-9) */}
              <div>
                <h4
                  className="mb-4 flex items-center gap-2"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#22c55e',
                  }}
                >
                  <span>🎮</span> FREE BASICS (1-9)
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.filter(l => l.id <= 9).map(lesson => (
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

              {/* Premium Levels (10-30) - Collapsed or Expanded */}
              {!expandPremiumLevels ? (
                <LevelGroupCollapsed
                  type="premium"
                  isUnlocked={isPremium}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('premium')}
                  onExpand={() => setExpandPremiumLevels(true)}
                  levelRange="10-30"
                  totalLevels={21}
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className="flex items-center gap-2"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: '#ffd93d',
                      }}
                    >
                      <span>⭐</span> PREMIUM LEVELS (10-30)
                    </h4>
                    <button
                      onClick={() => setExpandPremiumLevels(false)}
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '7px',
                        color: '#4a4a6e',
                        background: 'transparent',
                        border: '1px solid #4a4a6e',
                        padding: '6px 12px',
                      }}
                    >
                      ▲ COLLAPSE
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.filter(l => l.id >= 10 && l.id <= 30).map(lesson => (
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
                  isUnlocked={isPremium}
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
                        color: '#8b5cf6',
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
                        color: '#4a4a6e',
                        background: 'transparent',
                        border: '1px solid #4a4a6e',
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
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#4a4a6e' }}>
          TYPEBIT8 © 2025
        </p>
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e', marginTop: '8px' }}>
          PRACTICE DAILY FOR BEST RESULTS
        </p>

        {/* Legal Links */}
        <div className="mt-6 flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => handleLegalPage('impressum')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            IMPRESSUM
          </button>
          <button
            onClick={() => handleLegalPage('privacy')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            PRIVACY POLICY
          </button>
          <button
            onClick={() => handleLegalPage('terms')}
            style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}
            className="hover:underline cursor-pointer bg-transparent border-none"
          >
            TERMS OF SERVICE
          </button>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 pixel-box p-4 max-w-md mx-auto">
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffd93d', marginBottom: '12px' }}>
            GOT FEEDBACK OR IDEAS?
          </p>
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#eef5db', lineHeight: '2', marginBottom: '12px' }}>
            WE'D LOVE TO HEAR FROM YOU! SEND US YOUR SUGGESTIONS, BUG REPORTS, OR FEATURE REQUESTS.
          </p>
          <a
            href="mailto:info@typebit8.com"
            className="inline-block px-4 py-3 border-2 border-[#3bceac] hover:bg-[#3bceac] hover:text-[#1a1a2e] transition-colors"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}
          >
            ✉ INFO@TYPEBIT8.COM
          </a>
        </div>

        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '5px', color: '#4a4a6e', marginTop: '16px' }}>
          OPERATED BY STEININGER AG, ZUG, SWITZERLAND
        </p>
      </footer>
    </div>
  );
}

export default App;
