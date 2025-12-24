import { useState, useEffect } from 'react';
import type { Lesson, TypingStats } from './types';
import { LessonCard } from './components/LessonCard';
import { LessonView } from './components/LessonView';
import { Keyboard } from './components/Keyboard';
import { LayoutSelector } from './components/LayoutSelector';
import { LayoutDetector } from './components/LayoutDetector';
import { UserButton } from './components/UserButton';
import { GuestBanner } from './components/GuestBanner';
import { MigrationModal } from './components/MigrationModal';
import { Leaderboard } from './components/Leaderboard';
import { LegalPage } from './components/LegalPage';
import { DailyChallengeSection } from './components/DailyChallengeSection';
import { StreakSection } from './components/StreakSection';
import { Shop } from './components/Shop';
import { PremiumPage } from './components/PremiumPage';
import { CoinBalance } from './components/CoinBalance';
import { StreakDisplay } from './components/StreakDisplay';
import { PremiumBadge } from './components/PremiumBadge';
import { useGameState } from './hooks/useGameState';
import { useLessonProgress } from './hooks/useLessonProgress';
import type { KeyboardLayoutType } from './data/keyboardLayouts';
import { getHomeRowKeys } from './data/keyboardLayouts';
import { LEVEL_TIERS, levels, type LevelTier } from './data/levels';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '@clerk/clerk-react';

type View = 'home' | 'lesson' | 'legal' | 'shop' | 'premium';
type LegalPageType = 'impressum' | 'privacy' | 'terms';

function App() {
  const [view, setView] = useState<View>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType>('impressum');
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showLayoutDetector, setShowLayoutDetector] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutType>(() => {
    const saved = localStorage.getItem('typingQuestLayout');
    return (saved as KeyboardLayoutType) || 'qwerty-us';
  });

  const { userId } = useAuth();
  const gameState = useGameState();

  // Convex queries for new features
  const coinBalance = useQuery(
    api.coins.getCoinBalance,
    userId ? { clerkId: userId } : "skip"
  );
  const streak = useQuery(
    api.streaks.getStreak,
    userId ? { clerkId: userId } : "skip"
  );
  const isPremium = useQuery(
    api.premium.isPremium,
    userId ? { clerkId: userId } : "skip"
  );
  const { progress, updateProgress, getCompletedCount, isLessonUnlocked } = useLessonProgress();

  // Use static 30 levels from levels.ts (PRP-027)
  const lessons = levels;

  // Show layout detector on first launch if no layout was previously set
  useEffect(() => {
    const hasSetLayout = localStorage.getItem('typingQuestLayout');
    if (!hasSetLayout) {
      setShowLayoutDetector(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('typingQuestLayout', keyboardLayout);
  }, [keyboardLayout]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView('lesson');
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
    setView('home');
    setSelectedLesson(null);
  };

  const handleLegalPage = (page: LegalPageType) => {
    setSelectedLegalPage(page);
    setView('legal');
  };

  const totalCompleted = getCompletedCount();
  const homeRowKeys = getHomeRowKeys(keyboardLayout);

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

  // Shop and Premium views
  if (view === 'shop') {
    return (
      <Shop
        onClose={() => setView('home')}
        onUpgrade={() => setView('premium')}
      />
    );
  }

  if (view === 'premium') {
    return (
      <PremiumPage onClose={() => setView('home')} />
    );
  }

  if (view === 'legal') {
    return (
      <LegalPage
        page={selectedLegalPage}
        onBack={() => setView('home')}
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

      {/* Layout Selector Modal */}
      <LayoutSelector
        currentLayout={keyboardLayout}
        onLayoutChange={setKeyboardLayout}
        isOpen={showLayoutSelector}
        onClose={() => setShowLayoutSelector(false)}
        onDetect={() => setShowLayoutDetector(true)}
      />

      {/* Layout Detector Modal */}
      {showLayoutDetector && (
        <LayoutDetector
          onLayoutDetected={(layout) => {
            setKeyboardLayout(layout);
            setShowLayoutDetector(false);
          }}
          onCancel={() => setShowLayoutDetector(false)}
        />
      )}

      {/* Header HUD */}
      <header className="pixel-box m-4 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 border-4 border-[#ffd93d] bg-[#1a1a2e] flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0 #0f0f1b, 0 0 15px rgba(255, 217, 61, 0.3)' }}
            >
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#ffd93d' }}>⌨</span>
            </div>
            <div>
              <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }} className="text-glow-yellow">
                TYPEBIT8
              </h1>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>
                MASTER THE KEYBOARD
              </p>
            </div>
            {/* Premium Badge */}
            {isPremium && <PremiumBadge />}
          </div>

          {/* Player Stats */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Streak Display */}
            {userId && streak && (
              <StreakDisplay
                streak={streak.currentStreak}
                freezeCount={streak.streakFreezeCount}
                longestStreak={streak.longestStreak}
                showDetails={true}
              />
            )}

            {/* Coins with Shop Link */}
            <button
              onClick={() => setView('shop')}
              className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              title="Open Shop"
            >
              <CoinBalance balance={coinBalance ?? gameState.coins} size="lg" />
            </button>

            {/* Premium/Upgrade Button */}
            {!isPremium && (
              <button
                onClick={() => setView('premium')}
                className="px-3 py-2 border-2 border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#ffd93d' }}
              >
                👑 PREMIUM
              </button>
            )}

            {/* Level */}
            <div className="text-center">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac' }}>LEVEL</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#ffd93d' }} className="text-glow-yellow">
                {gameState.level}
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-24 md:w-32">
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
            <UserButton userLevel={gameState.level} />

            {/* Settings Button */}
            <button
              onClick={() => setShowLayoutSelector(true)}
              className="pixel-btn"
              style={{ fontSize: '12px', padding: '8px 12px' }}
              title="Keyboard Layout"
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

          {/* Keyboard preview */}
          <Keyboard
            highlightKeys={homeRowKeys}
            showFingerColors={true}
            layout={keyboardLayout}
          />

          <p
            style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#4a4a6e', marginTop: '16px' }}
            className="animate-blink"
          >
            {'>>> PLACE FINGERS ON HOME ROW TO BEGIN <<<'}
          </p>
        </div>
      </section>

      {/* How to Play */}
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

      {/* Leaderboard Section */}
      <section className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Leaderboard showGlobal={true} limit={5} />
        </div>
      </section>

      {/* Daily Challenge & Streak Section */}
      <section className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <DailyChallengeSection onStartChallenge={() => {}} />
          {userId && <StreakSection />}
        </div>
      </section>

      {/* Level Select */}
      <section className="p-4 md:p-8">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={progress[lesson.id]}
                isLocked={!isLessonUnlocked(lesson.id)}
                onClick={() => isLessonUnlocked(lesson.id) && handleLessonSelect(lesson)}
              />
            ))}
          </div>
        </div>
      </section>

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

        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '5px', color: '#4a4a6e', marginTop: '16px' }}>
          OPERATED BY STEININGER AG, ZUG, SWITZERLAND
        </p>
      </footer>
    </div>
  );
}

export default App;
