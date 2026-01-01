import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TypingStats } from '../types';

interface TypingAreaProps {
  text: string;
  onComplete: (stats: TypingStats) => void;
  onKeyPress?: (key: string, correct: boolean) => void;
  onComboChange?: (combo: number) => void;
  isActive?: boolean;
}

export function TypingArea({ text: rawText, onComplete, onKeyPress, onComboChange, isActive = true }: TypingAreaProps) {
  const { t } = useTranslation();
  // Normalize text to ensure consistent Unicode handling (important for special chars like ö, ñ, ç)
  const text = useMemo(() => rawText.normalize('NFC'), [rawText]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [currentErrors, setCurrentErrors] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState(0);
  const [showComboEffect, setShowComboEffect] = useState(false);
  const [shake, setShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput('');
    setStartTime(null);
    setCorrectChars(0);
    setIncorrectChars(0);
    setCurrentErrors(new Set());
    setCombo(0);
  }, [text]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    onComboChange?.(combo);
  }, [combo, onComboChange]);

  const calculateStats = useCallback((): TypingStats => {
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
    const words = correctChars / 5;
    const wpm = timeElapsed > 0 ? Math.round(words / timeElapsed) : 0;
    const totalTyped = correctChars + incorrectChars;
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: text.length,
      timeElapsed: startTime ? (Date.now() - startTime) / 1000 : 0,
    };
  }, [startTime, correctChars, incorrectChars, text.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isActive) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (input.length > 0) {
        const newInput = input.slice(0, -1);
        setInput(newInput);
        const newErrors = new Set(currentErrors);
        newErrors.delete(input.length - 1);
        setCurrentErrors(newErrors);
      }
      return;
    }

    if (e.key.length !== 1) return;

    e.preventDefault();

    if (!startTime) {
      setStartTime(Date.now());
    }

    const currentIndex = input.length;
    const expectedChar = text[currentIndex];
    const typedChar = e.key.normalize('NFC');
    const isCorrect = typedChar === expectedChar;

    onKeyPress?.(typedChar, isCorrect);

    if (isCorrect) {
      setCorrectChars(prev => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Show combo effect at milestones
      if (newCombo > 0 && newCombo % 10 === 0) {
        setShowComboEffect(true);
        setTimeout(() => setShowComboEffect(false), 500);
      }
    } else {
      setIncorrectChars(prev => prev + 1);
      setCurrentErrors(prev => new Set(prev).add(currentIndex));
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }

    const newInput = input + typedChar;
    setInput(newInput);

    if (newInput.length >= text.length) {
      const stats = calculateStats();
      setTimeout(() => {
        onComplete({
          ...stats,
          correctChars: correctChars + (isCorrect ? 1 : 0),
          incorrectChars: incorrectChars + (isCorrect ? 0 : 1),
        });
      }, 100);
    }
  }, [input, text, startTime, isActive, onKeyPress, correctChars, incorrectChars, currentErrors, calculateStats, onComplete, combo]);

  const renderText = () => {
    return text.split('').map((char, index) => {
      let style: React.CSSProperties = {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '36px',
        padding: '6px 3px',
        transition: 'all 0.1s',
      };

      if (index < input.length) {
        if (currentErrors.has(index)) {
          style.color = '#e63946';
          style.backgroundColor = 'rgba(230, 57, 70, 0.3)';
          style.textShadow = '0 0 10px #e63946';
        } else {
          style.color = '#0ead69';
          style.textShadow = '0 0 5px #0ead69';
        }
      } else if (index === input.length) {
        style.backgroundColor = '#ffd93d';
        style.color = '#0f0f1b';
        style.boxShadow = '0 0 15px #ffd93d';
      } else {
        style.color = '#4a4a6e';
      }

      if (char === ' ') {
        return (
          <span key={index} style={{ ...style, display: 'inline-block', width: '30px' }}>
            {'\u00A0'}
          </span>
        );
      }

      return (
        <span key={index} style={style}>
          {char}
        </span>
      );
    });
  };

  const stats = calculateStats();
  const progress = (input.length / text.length) * 100;

  return (
    <div className="space-y-4">
      {/* Stats HUD */}
      <div className="flex justify-between items-center pixel-box p-3">
        <div className="flex gap-6">
          <div className="text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>{t('typing.speed')}</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }} className="text-glow-yellow">
              {stats.wpm}
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>{t('typing.accuracy')}</div>
            <div
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '16px',
                color: stats.accuracy >= 90 ? '#0ead69' : stats.accuracy >= 70 ? '#ffd93d' : '#e63946'
              }}
            >
              {stats.accuracy}%
            </div>
          </div>
        </div>

        {/* Combo display */}
        <div className={`text-center ${showComboEffect ? 'animate-combo' : ''}`}>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ff6b9d' }}>{t('typing.combo')}</div>
          <div
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: combo >= 10 ? '20px' : '16px',
              color: combo >= 20 ? '#ffd93d' : combo >= 10 ? '#ff6b35' : '#ff6b9d',
              textShadow: combo >= 10 ? `0 0 20px ${combo >= 20 ? '#ffd93d' : '#ff6b35'}` : 'none',
            }}
          >
            {combo}x
          </div>
        </div>
      </div>

      {/* Typing area */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`
          pixel-box p-6 cursor-text focus:outline-none
          ${isActive ? 'pixel-box-yellow' : 'opacity-50'}
          ${shake ? 'animate-shake' : ''}
        `}
        style={{
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p className="break-words text-center" style={{ lineHeight: '2.4' }}>
          {renderText()}
        </p>
        {isActive && input.length === 0 && (
          <p
            className="mt-4 text-center animate-blink"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#4a4a6e' }}
          >
            {t('typing.pressAnyKey')}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="pixel-bar">
        <div
          className="pixel-bar-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0ead69, #3bceac)',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
