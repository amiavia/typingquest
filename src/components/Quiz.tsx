import { useState, useEffect } from 'react';
import type { Lesson, TypingStats } from '../types';
import { TypingArea } from './TypingArea';
import { KeyboardWithHands } from './KeyboardWithHands';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';

interface QuizProps {
  lesson: Lesson;
  quizWords: string[];
  layoutKeys: string[];
  onComplete: (passed: boolean, stats: TypingStats) => void;
  onCancel: () => void;
  keyboardLayout: KeyboardLayoutType;
}

export function Quiz({ lesson, quizWords, layoutKeys, onComplete, onCancel, keyboardLayout }: QuizProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [totalStats, setTotalStats] = useState({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    timeElapsed: 0,
  });
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [pressedKey, setPressedKey] = useState<string | undefined>();
  const [isCorrect, setIsCorrect] = useState(true);

  const currentWord = quizWords[currentWordIndex];

  const handleKeyPress = (key: string, correct: boolean) => {
    setPressedKey(key);
    setIsCorrect(correct);
    setTimeout(() => setPressedKey(undefined), 150);
  };

  const handleWordComplete = (stats: TypingStats) => {
    setTotalStats(prev => ({
      wpm: Math.round((prev.wpm * currentWordIndex + stats.wpm) / (currentWordIndex + 1)),
      accuracy: Math.round((prev.accuracy * currentWordIndex + stats.accuracy) / (currentWordIndex + 1)),
      correctChars: prev.correctChars + stats.correctChars,
      incorrectChars: prev.incorrectChars + stats.incorrectChars,
      totalChars: prev.totalChars + stats.totalChars,
      timeElapsed: prev.timeElapsed + stats.timeElapsed,
    }));

    if (currentWordIndex < quizWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      const finalStats = {
        ...totalStats,
        wpm: Math.round((totalStats.wpm * currentWordIndex + stats.wpm) / (currentWordIndex + 1)),
        accuracy: Math.round((totalStats.accuracy * currentWordIndex + stats.accuracy) / (currentWordIndex + 1)),
        correctChars: totalStats.correctChars + stats.correctChars,
        incorrectChars: totalStats.incorrectChars + stats.incorrectChars,
      };
      const passed = finalStats.wpm >= lesson.minWPM && finalStats.accuracy >= lesson.minAccuracy;
      onComplete(passed, finalStats);
    }
  };

  useEffect(() => {
    if (currentWord) {
      setActiveKey(currentWord[0]);
    }
  }, [currentWord]);

  return (
    <div className="space-y-6">
      {/* Boss battle header */}
      <div className="text-center">
        <div
          className="inline-block pixel-box pixel-box-yellow px-6 py-3 mb-4"
          style={{ fontFamily: "'Press Start 2P'", fontSize: '12px' }}
        >
          <span className="animate-blink" style={{ color: '#ffd93d' }}>!! BOSS BATTLE !!</span>
        </div>
        <h2
          style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#eef5db' }}
          className="mb-2 text-glow-cyan"
        >
          LEVEL {lesson.id} QUIZ
        </h2>
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>
          DEFEAT THE BOSS: {lesson.minWPM} WPM + {lesson.minAccuracy}% ACC
        </p>
      </div>

      {/* Boss HP bar */}
      <div className="pixel-box p-4">
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#e63946' }}>
            BOSS HP
          </span>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db' }}>
            {currentWordIndex}/{quizWords.length}
          </span>
        </div>
        <div className="pixel-bar">
          <div
            className="pixel-bar-fill"
            style={{
              width: `${100 - ((currentWordIndex) / quizWords.length) * 100}%`,
              background: 'linear-gradient(90deg, #e63946, #ff6b6b)',
            }}
          />
        </div>
      </div>

      {/* Words to defeat */}
      <div className="pixel-box p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {quizWords.map((word, index) => (
            <span
              key={index}
              className={`px-3 py-2 border-2 ${
                index < currentWordIndex
                  ? 'border-[#0ead69] bg-[#0ead69]/20'
                  : index === currentWordIndex
                  ? 'border-[#ffd93d] bg-[#ffd93d]/20 animate-pulse'
                  : 'border-[#4a4a6e] bg-transparent'
              }`}
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: index < currentWordIndex ? '#0ead69' : index === currentWordIndex ? '#ffd93d' : '#4a4a6e'
              }}
            >
              {index < currentWordIndex ? '✓' : word}
            </span>
          ))}
        </div>
      </div>

      {/* Your stats */}
      <div className="flex gap-4 justify-center">
        <div className="pixel-box p-3 text-center">
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>YOUR WPM</div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }}>{totalStats.wpm}</div>
        </div>
        <div className="pixel-box p-3 text-center">
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>ACCURACY</div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#0ead69' }}>{totalStats.accuracy}%</div>
        </div>
      </div>

      <TypingArea
        text={currentWord}
        onComplete={handleWordComplete}
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

      <div className="flex justify-center">
        <button
          onClick={onCancel}
          className="pixel-btn pixel-btn-red"
        >
          RETREAT
        </button>
      </div>
    </div>
  );
}
