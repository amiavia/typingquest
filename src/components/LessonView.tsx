import { useState, useEffect, useMemo } from 'react';
import { useMutation } from 'convex/react';
import type { Lesson, TypingStats } from '../types';
import { TypingArea } from './TypingArea';
import { KeyboardWithHands } from './KeyboardWithHands';
import { Quiz } from './Quiz';
import { RewardPopup } from './RewardPopup';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { getLessonKeysForLayout, getExercisesForLayout, getQuizWordsForLayout } from '../data/keyboardLayouts';
import { useAuthContext } from '../contexts/AuthContext';
import { usePremium } from '../hooks/usePremium';

import { api } from '../../convex/_generated/api';

interface LessonViewProps {
  lesson: Lesson;
  onComplete: (stats: TypingStats) => void;
  onQuizComplete: (passed: boolean, stats: TypingStats) => void;
  onBack: () => void;
  keyboardLayout: KeyboardLayoutType;
}

type LessonPhase = 'intro' | 'practice' | 'quiz' | 'complete';

export function LessonView({ lesson, onComplete, onQuizComplete, onBack, keyboardLayout }: LessonViewProps) {
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseStats, setExerciseStats] = useState<TypingStats[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [pressedKey, setPressedKey] = useState<string | undefined>();
  const [isCorrect, setIsCorrect] = useState(true);

  // Auth and leaderboard
  const { isAuthenticated, userId } = useAuthContext();
  const submitScore = useMutation(api.leaderboard.submitScore);

  // Coin and streak integration
  const awardCoins = useMutation(api.coins.awardCoins);
  const recordActivity = useMutation(api.streaks.recordActivity);
  const { isPremium } = usePremium();

  // Reward popup state
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{ coins: number; xp: number; streak?: number }>({
    coins: 0,
    xp: 0,
  });

  // Transform lesson content for the selected keyboard layout
  const layoutKeys = useMemo(
    () => getLessonKeysForLayout(lesson.keys, keyboardLayout),
    [lesson.keys, keyboardLayout]
  );

  // Transform exercises and quiz words for the selected keyboard layout
  // This ensures key drills match the user's actual keyboard (e.g., "jklö" for QWERTZ Swiss)
  const layoutExercises = useMemo(
    () => getExercisesForLayout(lesson.exercises, keyboardLayout),
    [lesson.exercises, keyboardLayout]
  );

  const layoutQuizWords = useMemo(
    () => getQuizWordsForLayout(lesson.quizWords, keyboardLayout),
    [lesson.quizWords, keyboardLayout]
  );

  const currentText = layoutExercises[currentExercise];

  useEffect(() => {
    setPhase('intro');
    setCurrentExercise(0);
    setExerciseStats([]);
  }, [lesson.id]);

  useEffect(() => {
    if (currentText) {
      setActiveKey(currentText[0]);
    }
  }, [currentText]);

  const handleKeyPress = (key: string, correct: boolean) => {
    setPressedKey(key);
    setIsCorrect(correct);
    setTimeout(() => setPressedKey(undefined), 150);
  };

  const handleExerciseComplete = (stats: TypingStats) => {
    const newStats = [...exerciseStats, stats];
    setExerciseStats(newStats);

    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
    } else {
      const avgStats: TypingStats = {
        wpm: Math.round(newStats.reduce((sum, s) => sum + s.wpm, 0) / newStats.length),
        accuracy: Math.round(newStats.reduce((sum, s) => sum + s.accuracy, 0) / newStats.length),
        correctChars: newStats.reduce((sum, s) => sum + s.correctChars, 0),
        incorrectChars: newStats.reduce((sum, s) => sum + s.incorrectChars, 0),
        totalChars: newStats.reduce((sum, s) => sum + s.totalChars, 0),
        timeElapsed: newStats.reduce((sum, s) => sum + s.timeElapsed, 0),
      };
      onComplete(avgStats);
      setPhase('quiz');
    }
  };

  const handleQuizComplete = async (passed: boolean, stats: TypingStats) => {
    onQuizComplete(passed, stats);

    // Submit to leaderboard if authenticated and quiz passed
    if (passed && isAuthenticated && userId) {
      try {
        await submitScore({
          userId,
          lessonId: lesson.id,
          score: stats.wpm,
          accuracy: stats.accuracy,
        });
      } catch (error) {
        console.error('Failed to submit score to leaderboard:', error);
      }

      // Award coins for quiz completion
      try {
        // Base: 50 coins, Perfect: +25, Speed bonus: +25, Premium: 2x
        let coins = 50;
        if (stats.accuracy >= 100) coins += 25;
        if (stats.wpm >= lesson.minWPM * 1.2) coins += 25;
        if (isPremium) coins *= 2;

        await awardCoins({
          clerkId: userId,
          amount: coins,
          source: "quiz_complete",
          metadata: { lessonId: lesson.id, wpm: stats.wpm, accuracy: stats.accuracy },
        });

        // Record activity for streak
        const streakResult = await recordActivity({ clerkId: userId });

        // Show reward popup
        setRewardData({
          coins,
          xp: 100, // Quiz XP bonus
          streak: streakResult?.streak,
        });
        setShowReward(true);
      } catch (error) {
        console.error('Failed to award coins or record activity:', error);
      }
    }

    setPhase('complete');
  };

  if (phase === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={onBack}
          className="pixel-btn"
          style={{ fontSize: '10px' }}
        >
          ← BACK
        </button>

        <div className="text-center">
          <div
            className="inline-block pixel-box px-8 py-4 mb-6"
            style={{ fontFamily: "'Press Start 2P'" }}
          >
            <span style={{ fontSize: '12px', color: '#3bceac' }}>LEVEL</span>
            <span
              style={{ fontSize: '32px', color: '#ffd93d', display: 'block', marginTop: '8px' }}
              className="text-glow-yellow"
            >
              {lesson.id}
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#eef5db', lineHeight: '2' }}
            className="mb-4"
          >
            {lesson.title.toUpperCase()}
          </h1>
        </div>

        {/* Mission briefing */}
        <div className="pixel-box p-6">
          <h2
            style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#ffd93d', marginBottom: '16px' }}
          >
            ▶ MISSION BRIEFING
          </h2>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
              lineHeight: '2.5',
              whiteSpace: 'pre-line'
            }}
          >
            {lesson.concept}
          </p>
        </div>

        {/* Keys to master */}
        <div className="pixel-box pixel-box-yellow p-6">
          <h2
            style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#ffd93d', marginBottom: '16px' }}
          >
            ▶ KEYS TO MASTER
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {layoutKeys.map(key => (
              <div
                key={key}
                className="w-10 h-10 flex items-center justify-center border-4 border-[#3bceac] bg-[#1a1a2e]"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '14px',
                  color: '#eef5db',
                  boxShadow: '4px 4px 0 #0f0f1b, 0 0 10px rgba(59, 206, 172, 0.3)'
                }}
              >
                {key === ' ' ? '⎵' : key.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Targets */}
        <div className="grid grid-cols-3 gap-4">
          <div className="pixel-box p-4 text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>TARGET WPM</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ffd93d' }} className="text-glow-yellow">
              {lesson.minWPM}
            </div>
          </div>
          <div className="pixel-box p-4 text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>ACCURACY</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#0ead69' }} className="text-glow-green">
              {lesson.minAccuracy}%
            </div>
          </div>
          <div className="pixel-box p-4 text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>STAGES</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ff6b9d' }}>
              {lesson.exercises.length}
            </div>
          </div>
        </div>

        <KeyboardWithHands
          layout={keyboardLayout}
          highlightKeys={layoutKeys}
          showFingerColors={true}
          showHands={true}
          compact={false}
        />

        <div className="flex justify-center">
          <button
            onClick={() => setPhase('practice')}
            className="pixel-btn pixel-btn-yellow"
            style={{ fontSize: '12px', padding: '16px 32px' }}
          >
            ▶ START MISSION
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <div className="max-w-4xl mx-auto">
        <Quiz
          lesson={lesson}
          quizWords={layoutQuizWords}
          layoutKeys={layoutKeys}
          onComplete={handleQuizComplete}
          onCancel={() => setPhase('practice')}
          keyboardLayout={keyboardLayout}
        />
      </div>
    );
  }

  if (phase === 'complete') {
    const avgStats = exerciseStats.length > 0 ? {
      wpm: Math.round(exerciseStats.reduce((sum, s) => sum + s.wpm, 0) / exerciseStats.length),
      accuracy: Math.round(exerciseStats.reduce((sum, s) => sum + s.accuracy, 0) / exerciseStats.length),
    } : { wpm: 0, accuracy: 0 };

    // PRP-046: Show premium teaser when completing the last free level (level 6)
    const LAST_FREE_LEVEL = 6;
    const showPremiumTeaser = lesson.id === LAST_FREE_LEVEL && !isPremium;

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Reward Popup */}
        {showReward && (
          <RewardPopup
            coins={rewardData.coins}
            xp={rewardData.xp}
            streak={rewardData.streak}
            onClose={() => setShowReward(false)}
          />
        )}

        <div
          className="pixel-box pixel-box-green p-8"
          style={{ fontFamily: "'Press Start 2P'" }}
        >
          <div className="text-6xl mb-4 animate-float">★</div>
          <h1 style={{ fontSize: '20px', color: '#0ead69', marginBottom: '16px' }} className="text-glow-green">
            LEVEL COMPLETE!
          </h1>
          <p style={{ fontSize: '10px', color: '#eef5db' }}>
            +{avgStats.wpm * 10} XP EARNED
          </p>
          {rewardData.coins > 0 && (
            <p style={{ fontSize: '10px', color: '#ffd93d', marginTop: '8px' }}>
              +{rewardData.coins} COINS
            </p>
          )}
        </div>

        {/* PRP-046: Premium Teaser after completing last free level */}
        {showPremiumTeaser && (
          <div
            className="pixel-box p-6"
            style={{
              fontFamily: "'Press Start 2P'",
              borderColor: '#ffd93d',
              background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            }}
          >
            <div style={{ fontSize: '10px', color: '#ffd93d', marginBottom: '12px' }}>
              👑 YOU'VE COMPLETED ALL FREE LEVELS!
            </div>
            <div style={{ fontSize: '8px', color: '#eef5db', lineHeight: '2', marginBottom: '16px' }}>
              Unlock 44 more levels including:
            </div>
            <div style={{ fontSize: '7px', color: '#3bceac', lineHeight: '2.2', textAlign: 'left', maxWidth: '280px', margin: '0 auto' }}>
              <div>• Bottom Row Mastery (Levels 11-15)</div>
              <div>• Numbers & Symbols (Levels 16-20)</div>
              <div>• Advanced Techniques (Levels 21-25)</div>
              <div>• AI Prompts Theme (Levels 31-35)</div>
              <div>• Developer Patterns (Levels 36-40)</div>
              <div>• Business Communication (Levels 41-45)</div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <a
                href="/premium"
                className="pixel-btn pixel-btn-yellow"
                style={{ fontSize: '10px', display: 'inline-block', textDecoration: 'none' }}
              >
                UNLOCK PREMIUM →
              </a>
            </div>
            <div style={{ fontSize: '6px', color: '#4a4a6e', marginTop: '12px' }}>
              Only $4.99/month • Cancel anytime
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="pixel-box p-6 text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}>SPEED</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#ffd93d' }} className="text-glow-yellow">
              {avgStats.wpm}
            </div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>WPM</div>
          </div>
          <div className="pixel-box p-6 text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}>ACCURACY</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#0ead69' }} className="text-glow-green">
              {avgStats.accuracy}%
            </div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>HIT RATE</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setPhase('practice');
              setCurrentExercise(0);
              setExerciseStats([]);
            }}
            className="pixel-btn"
            style={{ fontSize: '10px' }}
          >
            RETRY LEVEL
          </button>
          <button
            onClick={onBack}
            className="pixel-btn pixel-btn-green"
            style={{ fontSize: '10px' }}
          >
            {showPremiumTeaser ? 'VIEW LEVELS' : 'NEXT LEVEL →'}
          </button>
        </div>
      </div>
    );
  }

  // Practice phase
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="pixel-btn"
          style={{ fontSize: '8px' }}
        >
          ← BACK
        </button>

        <div className="pixel-box px-4 py-2">
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}>
            STAGE {currentExercise + 1}/{lesson.exercises.length}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2
          style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#eef5db' }}
          className="mb-2"
        >
          LEVEL {lesson.id}: {lesson.title.toUpperCase()}
        </h2>
      </div>

      <TypingArea
        text={currentText}
        onComplete={handleExerciseComplete}
        onKeyPress={handleKeyPress}
        isActive={true}
      />

      <KeyboardWithHands
        layout={keyboardLayout}
        highlightKeys={layoutKeys}
        activeKey={activeKey}
        pressedKey={pressedKey}
        incorrectKey={!isCorrect}
        showFingerColors={true}
        showHands={true}
        compact={true}
      />

      {/* Stage progress */}
      <div className="flex justify-center gap-2">
        {lesson.exercises.map((_, index) => (
          <div
            key={index}
            className="w-4 h-4 border-2"
            style={{
              borderColor: index < currentExercise ? '#0ead69' : index === currentExercise ? '#ffd93d' : '#4a4a6e',
              backgroundColor: index < currentExercise ? '#0ead69' : 'transparent',
              boxShadow: index === currentExercise ? '0 0 10px #ffd93d' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
}
