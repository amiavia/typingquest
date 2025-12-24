import { useState, useEffect, useMemo } from 'react';
import { useMutation } from 'convex/react';
import type { Lesson, TypingStats } from '../types';
import { TypingArea } from './TypingArea';
import { Keyboard } from './Keyboard';
import { Quiz } from './Quiz';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { getLessonKeysForLayout } from '../data/keyboardLayouts';
import { useAuthContext } from '../contexts/AuthContext';

// Try to import Convex API
let api: typeof import('../../convex/_generated/api').api | null = null;
try {
  api = require('../../convex/_generated/api').api;
} catch {
  // Convex not configured
}

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
  const submitScore = useMutation(api?.leaderboard?.submitScore ?? 'skip');

  // Transform lesson content for the selected keyboard layout
  const layoutKeys = useMemo(
    () => getLessonKeysForLayout(lesson.keys, keyboardLayout),
    [lesson.keys, keyboardLayout]
  );

  // Don't transform exercise text - users should type actual English words
  // The layout mapping only affects keyboard key highlighting, not practice content
  const layoutExercises = lesson.exercises;

  const layoutQuizWords = lesson.quizWords;

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
    if (passed && isAuthenticated && userId && api) {
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

        <Keyboard
          highlightKeys={layoutKeys}
          showFingerColors={true}
          layout={keyboardLayout}
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

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
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
        </div>

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
            NEXT LEVEL →
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

      <Keyboard
        highlightKeys={layoutKeys}
        activeKey={activeKey}
        pressedKey={pressedKey}
        incorrectKey={!isCorrect}
        showFingerColors={true}
        layout={keyboardLayout}
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
