/**
 * PRP-038: Speed Test Component
 *
 * A unified speed test that:
 * 1. Detects keyboard layout through typing (replaces "press Z/Y" detection)
 * 2. Measures baseline WPM for progress tracking
 *
 * Adaptive flow:
 * - Phase 1: English text with y/z (detects QWERTY vs QWERTZ vs AZERTY)
 * - Phase 2 (QWERTZ only): German text with öäüß (detects DE vs CH)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeyboardLayout, getVariantForFamily } from '../providers/KeyboardLayoutProvider';
import { KeyboardWithHands } from './KeyboardWithHands';
import { KEYBOARD_LAYOUTS, type KeyboardLayoutType } from '../data/keyboardLayouts';
import { useAuth, useClerk } from '@clerk/clerk-react';

// ==================== TEST SENTENCES ====================

// Phase 1: English sentences with y/z for family detection
const PHASE1_SENTENCES = [
  "the lazy yellow fox jumps quickly over frozen zones",
  "crazy wizards make toxic brew for the evil queen and jack",
  "yellow jazz music plays while lazy cats nap in cozy beds",
  "fizzy drinks and pizza are my favorite snacks every day",
  "the quick brown fox jumps over the lazy sleeping dog",
];

// Phase 2: German sentences with öäüß for QWERTZ variant detection
const PHASE2_GERMAN = [
  "größe und maße über die straße führen zum ziel",
  "süße äpfel und große birnen wachsen im garten",
  "mäuse können größer als käfer sein manchmal",
  "schöne grüße aus zürich an alle freunde überall",
];

const TEST_DURATION_MS = 30000; // 30 seconds
const DETECTION_THRESHOLD_MS = 12000; // Start checking for Phase 2 after 12s

type TestPhase = 'intro' | 'countdown' | 'testing' | 'results';
type LayoutFamily = 'qwerty' | 'qwertz' | 'azerty' | null;

interface KeystrokeEvent {
  expectedChar: string;
  actualKey: string;
  physicalCode: string;
  timestamp: number;
  correct: boolean;
}

interface SpeedTestResults {
  wpm: number;
  accuracy: number;
  charactersTyped: number;
  errors: number;
  detectedLayout: KeyboardLayoutType;
  detectedFamily: LayoutFamily;
  testDurationMs: number;
}

interface SpeedTestProps {
  onComplete: (results: SpeedTestResults, confirmed: boolean) => void;
  onSkip?: () => void;
}

export function SpeedTest({ onComplete, onSkip }: SpeedTestProps) {
  const { t } = useTranslation();
  const { layout, pauseDetection, resumeDetection } = useKeyboardLayout();
  const { isSignedIn } = useAuth();
  const { openSignUp } = useClerk();

  // Test state
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentSentence, setCurrentSentence] = useState('');
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS / 1000);
  const [isPhase2, setIsPhase2] = useState(false);

  // Detection state
  const [detectedFamily, setDetectedFamily] = useState<LayoutFamily>(null);
  const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [pendingPhase2, setPendingPhase2] = useState(false); // Wait for sentence completion before switching

  // Results state
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<KeyboardLayoutType | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sentenceIndexRef = useRef(0);
  const pendingKeyCodeRef = useRef<string>(''); // Store keydown code for detection

  // Get random sentence from pool
  const getNextSentence = useCallback((isGerman: boolean) => {
    const pool = isGerman ? PHASE2_GERMAN : PHASE1_SENTENCES;
    const idx = sentenceIndexRef.current % pool.length;
    sentenceIndexRef.current++;
    return pool[idx];
  }, []);

  // Initialize first sentence
  useEffect(() => {
    setCurrentSentence(getNextSentence(false));
  }, [getNextSentence]);

  // Analyze keystrokes to detect layout family
  const analyzeKeystrokes = useCallback((strokes: KeystrokeEvent[]): LayoutFamily => {
    // Count physical key positions for y/z detection
    const yKeystrokes = strokes.filter(k => k.expectedChar.toLowerCase() === 'y');
    const zKeystrokes = strokes.filter(k => k.expectedChar.toLowerCase() === 'z');

    let qwertyScore = 0;
    let qwertzScore = 0;
    let azertyScore = 0;

    // Check Y keystrokes - if typed on KeyZ position, it's QWERTZ
    yKeystrokes.forEach(k => {
      if (k.physicalCode === 'KeyZ') qwertzScore += 2;
      else if (k.physicalCode === 'KeyY') qwertyScore += 2;
    });

    // Check Z keystrokes - if typed on KeyY position, it's QWERTZ
    zKeystrokes.forEach(k => {
      if (k.physicalCode === 'KeyY') qwertzScore += 2;
      else if (k.physicalCode === 'KeyZ') qwertyScore += 2;
      else if (k.physicalCode === 'KeyW') azertyScore += 2;
    });

    // Check for German umlauts (definitive QWERTZ)
    const umlauts = strokes.filter(k =>
      ['ö', 'ä', 'ü', 'ß'].includes(k.expectedChar.toLowerCase()) && k.correct
    );
    if (umlauts.length > 0) qwertzScore += 10;

    // Check AZERTY indicators
    const aKeystrokes = strokes.filter(k => k.expectedChar.toLowerCase() === 'a');
    aKeystrokes.forEach(k => {
      if (k.physicalCode === 'KeyQ') azertyScore += 2;
    });

    // Determine winner
    if (azertyScore > qwertyScore && azertyScore > qwertzScore) return 'azerty';
    if (qwertzScore > qwertyScore) return 'qwertz';
    if (qwertyScore > 0) return 'qwerty';
    return null;
  }, []);

  // Detect QWERTZ variant (DE vs CH) based on ß handling
  const detectQwertzVariant = useCallback((strokes: KeystrokeEvent[]): 'qwertz-de' | 'qwertz-ch' => {
    // Check ß keystrokes - Swiss keyboards don't have native ß key
    const eszettStrokes = strokes.filter(k => k.expectedChar === 'ß');

    if (eszettStrokes.length > 0) {
      // Count how many ß were typed correctly vs incorrectly
      const correctEszett = eszettStrokes.filter(k => k.correct).length;
      const wrongEszett = eszettStrokes.filter(k => !k.correct).length;

      // If user got ß wrong more than right, likely Swiss (no native ß key)
      if (wrongEszett > correctEszett) {
        return 'qwertz-ch';
      }
      // If user typed ß correctly, likely German (has native ß key)
      if (correctEszett > 0) {
        return 'qwertz-de';
      }
    }

    // Fall back to browser locale
    const locale = navigator.language.toLowerCase();
    if (locale.includes('ch') || locale === 'de-ch' || locale === 'fr-ch' || locale === 'it-ch') {
      return 'qwertz-ch';
    }

    return 'qwertz-de';
  }, []);

  // Calculate WPM and accuracy
  const calculateResults = useCallback((): SpeedTestResults => {
    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedMinutes = elapsedMs / 60000;

    // Count correct characters and words (5 chars = 1 word)
    const correctChars = keystrokes.filter(k => k.correct).length;
    const words = correctChars / 5;
    const wpm = Math.round(words / elapsedMinutes);

    // Calculate accuracy
    const totalChars = keystrokes.length;
    const errors = keystrokes.filter(k => !k.correct).length;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    // Determine layout family first
    const family = analyzeKeystrokes(keystrokes) || 'qwerty';

    // For QWERTZ, use smart variant detection based on ß handling
    let detectedLayout: KeyboardLayoutType;
    if (family === 'qwertz') {
      detectedLayout = detectQwertzVariant(keystrokes);
    } else {
      detectedLayout = getVariantForFamily(family);
    }

    return {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      charactersTyped: correctChars,
      errors,
      detectedLayout,
      detectedFamily: family,
      testDurationMs: elapsedMs,
    };
  }, [keystrokes, analyzeKeystrokes, detectQwertzVariant]);

  // Handle countdown
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Start test
      setPhase('testing');
      startTimeRef.current = Date.now();
      inputRef.current?.focus();
    }
  }, [phase, countdown]);

  // Focus input when testing starts
  useEffect(() => {
    if (phase === 'testing') {
      // Small delay to ensure DOM is ready
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [phase]);

  // Pause global layout detection during speed test (we do our own detection)
  useEffect(() => {
    if (phase === 'countdown' || phase === 'testing') {
      pauseDetection();
    }
    return () => {
      // Resume when component unmounts or phase changes
      if (phase === 'results' || phase === 'intro') {
        resumeDetection();
      }
    };
  }, [phase, pauseDetection, resumeDetection]);

  // Resume detection when test completes or is skipped
  useEffect(() => {
    return () => {
      resumeDetection();
    };
  }, [resumeDetection]);

  // Handle test timer
  useEffect(() => {
    if (phase !== 'testing') return;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, Math.ceil((TEST_DURATION_MS - elapsed) / 1000));
      setTimeLeft(remaining);

      // Check if we should prepare for Phase 2 (German text for QWERTZ variant detection)
      if (!isPhase2 && !pendingPhase2 && elapsed > DETECTION_THRESHOLD_MS) {
        const family = analyzeKeystrokes(keystrokes);
        if (family === 'qwertz') {
          // Mark as pending - will switch when current sentence is completed
          setPendingPhase2(true);
          setDetectedFamily('qwertz');
        } else if (family) {
          setDetectedFamily(family);
        }
      }

      // End test
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        const testResults = calculateResults();
        setResults(testResults);
        setSelectedLayout(testResults.detectedLayout); // Pre-select detected layout
        setPhase('results');
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPhase2, pendingPhase2, keystrokes, analyzeKeystrokes, calculateResults, getNextSentence]);

  // Handle input
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== 'testing') return;

    const value = e.target.value;
    const expectedChar = currentSentence[inputText.length];
    const typedChar = value[value.length - 1];

    if (typedChar && expectedChar) {
      // Record keystroke with the physical key code from keydown event
      const event: KeystrokeEvent = {
        expectedChar,
        actualKey: typedChar,
        physicalCode: pendingKeyCodeRef.current, // Use stored keycode from keydown
        timestamp: Date.now(),
        correct: typedChar === expectedChar,
      };
      setKeystrokes(prev => [...prev, event]);
      pendingKeyCodeRef.current = ''; // Clear for next keystroke
    }

    setInputText(value);

    // Check if sentence completed
    if (value === currentSentence) {
      // Check if we should transition to Phase 2 (German text)
      if (pendingPhase2 && !isPhase2) {
        setIsPhase2(true);
        setPendingPhase2(false);
        setCurrentSentence(getNextSentence(true)); // German sentence
      } else {
        setCurrentSentence(getNextSentence(isPhase2));
      }
      setInputText('');
    }
  }, [phase, currentSentence, inputText, isPhase2, pendingPhase2, getNextSentence]);

  // Store physical key code before input event fires
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'testing') return;
    // Store the physical key code - will be used by handleInput
    pendingKeyCodeRef.current = e.code;
  }, [phase]);

  // Handle confirmation - uses selectedLayout (user may have changed it)
  // NOTE: Don't call lockLayout here - let App.tsx handle it to control state update order
  const handleConfirm = useCallback(() => {
    if (!results || !selectedLayout) return;
    onComplete({ ...results, detectedLayout: selectedLayout }, true);
  }, [results, selectedLayout, onComplete]);

  // Handle retake
  const handleRetake = useCallback(() => {
    setPhase('intro');
    setCountdown(3);
    setInputText('');
    setTimeLeft(TEST_DURATION_MS / 1000);
    setKeystrokes([]);
    setResults(null);
    setSelectedLayout(null);
    setIsPhase2(false);
    setPendingPhase2(false);
    setDetectedFamily(null);
    sentenceIndexRef.current = 0;
    setCurrentSentence(getNextSentence(false));
  }, [getNextSentence]);


  // Calculate real-time stats
  const currentStats = useMemo(() => {
    if (phase !== 'testing' || keystrokes.length === 0) {
      return { wpm: 0, accuracy: 100 };
    }

    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const correctChars = keystrokes.filter(k => k.correct).length;
    const wpm = Math.round((correctChars / 5) / elapsed);
    const accuracy = Math.round((correctChars / keystrokes.length) * 100);

    return { wpm: Math.max(0, wpm), accuracy };
  }, [phase, keystrokes]);

  // Render typed text with highlighting
  const renderTypedText = useMemo(() => {
    const chars = currentSentence.split('');
    return chars.map((char, idx) => {
      let className = 'text-[#4a4a6e]'; // untyped
      if (idx < inputText.length) {
        className = inputText[idx] === char ? 'text-[#0ead69]' : 'text-[#ff6b6b] underline';
      } else if (idx === inputText.length) {
        className = 'text-[#ffd93d] bg-[#ffd93d]/20';
      }
      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });
  }, [currentSentence, inputText]);

  // ==================== RENDER ====================

  // Intro screen
  if (phase === 'intro') {
    return (
      <section className="p-8 text-center max-w-2xl mx-auto">
        <div className="pixel-box p-8">
          <div className="text-5xl mb-6">⌨️</div>
          <h2
            style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }}
            className="mb-4 text-glow-yellow"
          >
            {t('speedTest.title')}
          </h2>
          <p
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}
            className="mb-8"
          >
            {t('speedTest.subtitle')}
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.detectKeyboard')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.measureSpeed')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.trackProgress')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPhase('countdown')}
            className="px-8 py-4 text-[#0f0f1b] transition-transform hover:scale-105"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              background: 'linear-gradient(180deg, #ffd93d, #f4a261)',
              border: 'none',
              boxShadow: '0 4px 0 #c9a227',
            }}
          >
            {t('speedTest.startTest')}
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="block mx-auto mt-6"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('speedTest.skipForNow')}
            </button>
          )}
        </div>
      </section>
    );
  }

  // Countdown
  if (phase === 'countdown') {
    return (
      <section className="p-8 text-center max-w-2xl mx-auto">
        <div className="pixel-box p-12">
          <div
            className="text-glow-yellow animate-pulse"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '72px', color: '#ffd93d' }}
          >
            {countdown}
          </div>
          <p
            style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#3bceac' }}
            className="mt-4"
          >
            {t('speedTest.getReady')}
          </p>
        </div>
      </section>
    );
  }

  // Testing
  if (phase === 'testing') {
    return (
      <section className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="pixel-box p-6">
          {/* Detection indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: detectedFamily ? '#0ead69' : '#ffd93d' }}
            />
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: detectedFamily ? '#0ead69' : '#ffd93d' }}>
              {detectedFamily
                ? `${t('speedTest.detected', { layout: detectedFamily.toUpperCase() })}${isPhase2 ? ` - ${t('speedTest.checkingVariant')}` : ''}`
                : t('speedTest.detecting')
              }
            </span>
          </div>

          {/* Typing area with overlaid input */}
          <div
            className="relative p-4 mb-4 text-left cursor-text"
            onClick={() => inputRef.current?.focus()}
            style={{
              background: '#0d0d1a',
              border: `2px solid ${isPhase2 ? '#ffd93d' : '#3bceac'}`,
              borderRadius: '8px',
            }}
          >
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', lineHeight: '2.5' }}>
              {renderTypedText}
            </p>
            {/* Invisible input overlaying the typing area */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'transparent',
                color: 'transparent',
                caretColor: 'transparent',
                outline: 'none',
                border: 'none',
              }}
            />
          </div>

          {/* Click to focus hint */}
          <p
            onClick={() => inputRef.current?.focus()}
            className="text-center mb-4 cursor-pointer"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#4a4a6e' }}
          >
            {isPhase2 ? t('speedTest.phase2German') : t('speedTest.clickToFocus')}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div
                className="text-glow-cyan"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#3bceac' }}
              >
                {currentStats.wpm}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.wpm')}
              </div>
            </div>
            <div className="text-center">
              <div
                style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#0ead69' }}
              >
                {currentStats.accuracy}%
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.accuracy')}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-glow-yellow"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ffd93d' }}
              >
                {timeLeft}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.seconds')}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#0d0d1a] border border-[#2a2a3e] overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${((TEST_DURATION_MS / 1000 - timeLeft) / (TEST_DURATION_MS / 1000)) * 100}%`,
                background: 'linear-gradient(90deg, #3bceac, #ffd93d)',
              }}
            />
          </div>

          {/* Keyboard visualization */}
          <div className="mt-6">
            <KeyboardWithHands
              layout={layout}
              showHands={true}
              showFingerColors={true}
              showDetectionStatus={false}
              activeKey={inputText.slice(-1)}
              highlightKeys={[]}
            />
          </div>
        </div>
      </section>
    );
  }

  // Results
  if (phase === 'results' && results) {
    return (
      <section className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="pixel-box p-8 text-center">
          <h2
            style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#0ead69' }}
            className="mb-6"
          >
            {t('speedTest.testComplete')}
          </h2>

          {/* Main results */}
          <div
            className="p-6 mb-6"
            style={{ background: '#0d0d1a', border: '3px solid #ffd93d' }}
          >
            <div
              className="text-glow-yellow"
              style={{ fontFamily: "'Press Start 2P'", fontSize: '48px', color: '#ffd93d' }}
            >
              {results.wpm}
            </div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}>
              {t('speedTest.wordsPerMinute')}
            </div>
            <div
              className="mt-4"
              style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#eef5db' }}
            >
              ACCURACY: {results.accuracy}%
            </div>
          </div>

          {/* Keyboard Selection */}
          <div
            className="p-4 mb-6"
            style={{ background: 'rgba(255, 217, 61, 0.1)', border: '2px solid #ffd93d' }}
          >
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#4a4a6e', marginBottom: '8px' }}>
              {t('speedTest.selectLayout')}
            </p>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', marginBottom: '16px' }}>
              {t('speedTest.detectedLayout', { layout: results.detectedLayout.toUpperCase().replace('-', ' ') })}
            </p>

            {/* All keyboard options */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {Object.values(KEYBOARD_LAYOUTS).map((layoutConfig) => (
                <button
                  key={layoutConfig.id}
                  onClick={() => setSelectedLayout(layoutConfig.id as KeyboardLayoutType)}
                  className="px-3 py-2 transition-all hover:brightness-125"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    background: selectedLayout === layoutConfig.id ? '#ffd93d' : 'transparent',
                    border: `2px solid ${selectedLayout === layoutConfig.id ? '#ffd93d' : '#3bceac'}`,
                    borderRadius: '4px',
                    color: selectedLayout === layoutConfig.id ? '#0f0f1b' : '#eef5db',
                    cursor: 'pointer',
                  }}
                >
                  {layoutConfig.name}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirm}
                className="px-6 py-3"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  background: 'linear-gradient(180deg, #0ead69, #0a8a54)',
                  color: '#0f0f1b',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #0a8a54',
                }}
              >
                ✓ {t('speedTest.confirm')}
              </button>
              <button
                onClick={handleRetake}
                className="px-4 py-3"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  background: 'transparent',
                  color: '#3bceac',
                  border: '2px solid #3bceac',
                  cursor: 'pointer',
                }}
              >
                ↻ {t('speedTest.retake')}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#3bceac' }}>
                {results.charactersTyped}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.charsTyped')}
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#ff6b6b' }}>
                {results.errors}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}>
                {t('speedTest.errors')}
              </div>
            </div>
          </div>

          {/* Sign-up CTA for guests */}
          {!isSignedIn && (
            <div
              className="mt-6 p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 206, 172, 0.15), rgba(255, 217, 61, 0.15))',
                border: '2px solid #3bceac',
                borderRadius: '8px',
              }}
            >
              <p
                style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}
                className="mb-3"
              >
                {t('speedTest.createFreeAccount')}
              </p>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#eef5db', lineHeight: '2' }}>
                {t('speedTest.trackOverTime')}
              </p>
              <button
                onClick={() => openSignUp()}
                className="mt-4 px-6 py-3"
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
                {t('speedTest.signUpFree')}
              </button>
            </div>
          )}

          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e', marginTop: '12px' }}>
            {isSignedIn ? t('speedTest.baselineSaved') : t('speedTest.signUpToSave')}
          </p>

        </div>
      </section>
    );
  }

  return null;
}
