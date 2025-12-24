# PRP-007: Standard Typing Tests

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~30 tasks

---

## Executive Summary

This PRP introduces standard typing tests to TypeBit8, mirroring the functionality of established typing practice platforms like Monkeytype and TypeRacer. Users will be able to take timed tests (1, 2, or 5 minutes), receive WPM and accuracy metrics, generate shareable pixel art certificates, and compare their performance against global averages. This feature positions TypeBit8 as a complete typing practice solution alongside its gamified lesson system.

---

## Problem Statement

### Current State

1. **Lesson-only practice**: TypeBit8 currently only offers structured lessons, not standardized tests
2. **No performance benchmarking**: Users cannot measure their true typing speed against industry standards
3. **Missing competitive element**: No way to compare performance with global typing community
4. **Limited shareability**: No certificates or shareable achievements to showcase progress
5. **Incomplete platform**: Competitors (Monkeytype, TypeRacer, 10FastFingers) all offer typing tests

### Impact

| Issue | User Impact |
|-------|-------------|
| No standardized tests | Cannot benchmark skills against industry standards (e.g., job requirements) |
| Missing WPM metrics | No way to track improvement in consistent, comparable way |
| No certificates | Cannot share achievements or prove typing speed to employers |
| Incomplete feature set | Users must use competitor sites for typing tests |
| Limited engagement | Miss out on competitive test-taking community |

### Success Criteria

- [ ] 1-minute, 2-minute, and 5-minute test modes available
- [ ] Standard word lists ensure fair comparison across users
- [ ] Accurate WPM and accuracy calculations
- [ ] Pixel art certificate generation with shareable PNG export
- [ ] Historical test results tracking (last 10 tests minimum)
- [ ] Global average comparisons displayed
- [ ] Integration with existing leaderboard system
- [ ] Mobile-responsive test interface

---

## Core Requirements

### Test Durations

Support three standard test lengths:
- **1 minute**: Quick assessment, casual testing
- **2 minutes**: Balanced endurance test (most common)
- **5 minutes**: Stamina test, shows consistency over time

### Word Lists

Use standardized word lists for fair comparison:
- **Common English words**: Top 1000 most frequent English words
- **No proper nouns**: Avoid names, places, brands
- **Random order**: Shuffle on each test to prevent memorization
- **Consistent difficulty**: Same word pool for all users at same time

### Metrics Calculation

#### WPM (Words Per Minute)
```
WPM = (Characters Typed / 5) / (Time in Minutes)
```
- Standard: 5 characters = 1 word
- Count all typed characters (including spaces)
- Round to 1 decimal place

#### Accuracy
```
Accuracy = (Correct Characters / Total Characters) × 100
```
- Count character-level accuracy
- Mistakes reduce accuracy
- Round to 1 decimal place

#### Additional Metrics
- **Raw WPM**: Speed without accuracy penalty
- **Net WPM**: Speed with accuracy penalty (Raw WPM × Accuracy)
- **Error rate**: Percentage of characters typed incorrectly
- **Consistency**: WPM variance over time segments

---

## Phase 1: Test Engine & UI

### 1.1 Word List Data

**New file: `src/data/testWords.ts`**

```typescript
// Top 1000 most common English words for typing tests
export const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  // ... (expand to 1000 words)
];

export function generateTestText(durationSeconds: number): string {
  // Estimate words needed (assuming 40 WPM average)
  const estimatedWords = Math.ceil((durationSeconds / 60) * 40 * 1.5);

  const shuffled = [...COMMON_WORDS].sort(() => Math.random() - 0.5);
  const words: string[] = [];

  for (let i = 0; i < estimatedWords; i++) {
    words.push(shuffled[i % shuffled.length]);
  }

  return words.join(' ');
}
```

### 1.2 Test Types & State

**New file: `src/types/typingTest.ts`**

```typescript
export type TestDuration = 15 | 30 | 60 | 120; // seconds (15s, 30s, 1m, 2m)

export interface TestConfig {
  duration: TestDuration;
  textContent: string;
}

export interface TestState {
  status: 'idle' | 'countdown' | 'active' | 'completed';
  config: TestConfig;
  startTime: number | null;
  endTime: number | null;
  currentInput: string;
  correctCharacters: number;
  totalCharacters: number;
  errors: number;
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorRate: number;
  duration: TestDuration;
  timestamp: number;
  textSample: string; // First 50 chars of test text
}

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}
```

### 1.3 Test Logic Hook

**New file: `src/hooks/useTypingTest.ts`**

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { TestConfig, TestState, TestResult, TestStats } from '../types/typingTest';

export function useTypingTest(config: TestConfig) {
  const [state, setState] = useState<TestState>({
    status: 'idle',
    config,
    startTime: null,
    endTime: null,
    currentInput: '',
    correctCharacters: 0,
    totalCharacters: 0,
    errors: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'countdown',
    }));

    // 3-2-1 countdown
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'active',
        startTime: Date.now(),
        currentInput: '',
        correctCharacters: 0,
        totalCharacters: 0,
        errors: 0,
      }));
    }, 3000);
  }, []);

  const endTest = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'completed',
      endTime: Date.now(),
    }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const handleInput = useCallback((input: string) => {
    if (state.status !== 'active') return;

    const expectedText = state.config.textContent.slice(0, input.length);
    let correct = 0;
    let errors = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === expectedText[i]) {
        correct++;
      } else {
        errors++;
      }
    }

    setState(prev => ({
      ...prev,
      currentInput: input,
      correctCharacters: correct,
      totalCharacters: input.length,
      errors,
    }));

    // Check if test is complete (all text typed)
    if (input.length >= state.config.textContent.length) {
      endTest();
    }
  }, [state.status, state.config.textContent, endTest]);

  const resetTest = useCallback(() => {
    setState({
      status: 'idle',
      config,
      startTime: null,
      endTime: null,
      currentInput: '',
      correctCharacters: 0,
      totalCharacters: 0,
      errors: 0,
    });
  }, [config]);

  const calculateStats = useCallback((): TestStats | null => {
    if (!state.startTime) return null;

    const endTime = state.endTime || Date.now();
    const timeElapsed = (endTime - state.startTime) / 1000; // seconds
    const timeInMinutes = timeElapsed / 60;

    const rawWpm = (state.totalCharacters / 5) / timeInMinutes;
    const accuracy = state.totalCharacters > 0
      ? (state.correctCharacters / state.totalCharacters) * 100
      : 0;
    const wpm = rawWpm * (accuracy / 100);

    return {
      wpm: Math.round(wpm * 10) / 10,
      rawWpm: Math.round(rawWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      correctChars: state.correctCharacters,
      incorrectChars: state.errors,
      totalChars: state.totalCharacters,
      timeElapsed: Math.round(timeElapsed * 10) / 10,
    };
  }, [state]);

  // Timer to auto-end test after duration
  useEffect(() => {
    if (state.status === 'active' && state.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - state.startTime!;
        if (elapsed >= config.duration * 1000) {
          endTest();
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [state.status, state.startTime, config.duration, endTest]);

  return {
    state,
    startTest,
    endTest,
    handleInput,
    resetTest,
    calculateStats,
  };
}
```

### 1.4 Test UI Component

**New file: `src/components/TypingTest.tsx`**

```typescript
import { useState, useRef, useEffect } from 'react';
import { useTypingTest } from '../hooks/useTypingTest';
import { generateTestText } from '../data/testWords';
import { TestDuration } from '../types/typingTest';

interface TypingTestProps {
  duration: TestDuration;
  onComplete: (result: TestResult) => void;
}

export function TypingTest({ duration, onComplete }: TypingTestProps) {
  const textContent = useState(() => generateTestText(duration))[0];
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { state, startTest, handleInput, resetTest, calculateStats } = useTypingTest({
    duration,
    textContent,
  });

  useEffect(() => {
    if (state.status === 'active' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'completed') {
      const stats = calculateStats();
      if (stats) {
        onComplete({
          wpm: stats.wpm,
          rawWpm: stats.rawWpm,
          accuracy: stats.accuracy,
          errorRate: (stats.incorrectChars / stats.totalChars) * 100,
          duration,
          timestamp: Date.now(),
          textSample: textContent.slice(0, 50),
        });
      }
    }
  }, [state.status, calculateStats, duration, textContent, onComplete]);

  const renderText = () => {
    const chars = textContent.split('');
    const input = state.currentInput;

    return (
      <div className="test-text" style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '24px',
        lineHeight: '1.6',
        letterSpacing: '1px',
        padding: '20px',
        background: '#1a1a2e',
        color: '#666',
        borderRadius: '8px',
        minHeight: '200px',
      }}>
        {chars.map((char, idx) => {
          let className = 'char-pending';
          let color = '#666';

          if (idx < input.length) {
            if (input[idx] === char) {
              className = 'char-correct';
              color = '#0ead69';
            } else {
              className = 'char-incorrect';
              color = '#ff6b9d';
            }
          } else if (idx === input.length) {
            className = 'char-current';
            color = '#ffd93d';
          }

          return (
            <span
              key={idx}
              className={className}
              style={{
                color,
                backgroundColor: idx === input.length ? '#ffd93d22' : 'transparent',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  if (state.status === 'idle') {
    return (
      <div className="test-start p-8 text-center">
        <h2 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '20px',
          color: '#ffd93d',
          marginBottom: '24px',
        }}>
          {duration}s TYPING TEST
        </h2>
        <button
          onClick={startTest}
          className="pixel-btn"
          style={{
            fontSize: '14px',
            padding: '12px 24px',
            background: '#0ead69',
          }}
        >
          START TEST
        </button>
      </div>
    );
  }

  if (state.status === 'countdown') {
    return (
      <div className="test-countdown p-8 text-center">
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '48px',
          color: '#ffd93d',
        }}>
          3... 2... 1...
        </p>
      </div>
    );
  }

  if (state.status === 'active') {
    const stats = calculateStats();
    const timeRemaining = duration - (stats?.timeElapsed || 0);

    return (
      <div className="test-active">
        {/* Stats Bar */}
        <div className="stats-bar flex justify-between mb-4 p-4 bg-[#1a1a2e] rounded">
          <div>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#666' }}>
              WPM
            </span>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }}>
              {stats?.wpm || 0}
            </p>
          </div>
          <div>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#666' }}>
              ACC
            </span>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#3bceac' }}>
              {stats?.accuracy || 0}%
            </p>
          </div>
          <div>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#666' }}>
              TIME
            </span>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ff6b9d' }}>
              {Math.ceil(timeRemaining)}s
            </p>
          </div>
        </div>

        {/* Text Display */}
        {renderText()}

        {/* Hidden Input */}
        <textarea
          ref={inputRef}
          value={state.currentInput}
          onChange={(e) => handleInput(e.target.value)}
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    );
  }

  // Completed state handled by parent via onComplete
  return null;
}
```

---

## Phase 2: Results & Certificates

### 2.1 Test Results Component

**New file: `src/components/TestResults.tsx`**

```typescript
import { TestResult } from '../types/typingTest';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface TestResultsProps {
  result: TestResult;
  onRetry: () => void;
  onNewTest: () => void;
}

export function TestResults({ result, onRetry, onNewTest }: TestResultsProps) {
  const saveResult = useMutation(api.typingTests.saveTestResult);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) {
      saveResult({
        wpm: result.wpm,
        rawWpm: result.rawWpm,
        accuracy: result.accuracy,
        duration: result.duration,
        timestamp: result.timestamp,
      }).then(() => setSaved(true));
    }
  }, [saved, result, saveResult]);

  return (
    <div className="test-results p-8">
      {/* Main Stats */}
      <div className="pixel-box p-6 mb-6">
        <h2 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          TEST COMPLETE!
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
            }}>
              WPM
            </p>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '32px',
              color: '#ffd93d',
            }}>
              {result.wpm}
            </p>
          </div>
          <div className="text-center">
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
            }}>
              ACCURACY
            </p>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '32px',
              color: '#3bceac',
            }}>
              {result.accuracy}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#666' }}>
              RAW WPM
            </p>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#eef5db' }}>
              {result.rawWpm}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#666' }}>
              ERRORS
            </p>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ff6b9d' }}>
              {result.errorRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Global Comparison */}
      <GlobalComparison wpm={result.wpm} duration={result.duration} />

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={onRetry}
          className="pixel-btn flex-1"
          style={{ background: '#3bceac' }}
        >
          TRY AGAIN
        </button>
        <button
          onClick={() => {/* Share certificate */}}
          className="pixel-btn flex-1"
          style={{ background: '#ffd93d', color: '#1a1a2e' }}
        >
          CERTIFICATE
        </button>
        <button
          onClick={onNewTest}
          className="pixel-btn flex-1"
          style={{ background: '#0ead69' }}
        >
          NEW TEST
        </button>
      </div>
    </div>
  );
}
```

### 2.2 Certificate Generator

**New file: `src/components/TestCertificate.tsx`**

```typescript
import { useRef } from 'react';
import { TestResult } from '../types/typingTest';
import html2canvas from 'html2canvas';

interface TestCertificateProps {
  result: TestResult;
  username: string;
  onClose: () => void;
}

export function TestCertificate({ result, username, onClose }: TestCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      backgroundColor: '#1a1a2e',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `typebit8-certificate-${result.wpm}wpm.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareCertificate = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      backgroundColor: '#1a1a2e',
      scale: 2,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'certificate.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `I typed ${result.wpm} WPM on TypeBit8!`,
          text: `Check out my typing speed: ${result.wpm} WPM with ${result.accuracy}% accuracy!`,
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full">
        {/* Certificate Display */}
        <div
          ref={certificateRef}
          className="pixel-box p-12"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
            border: '8px solid #ffd93d',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '24px',
              color: '#ffd93d',
              marginBottom: '16px',
            }}>
              TYPEBIT8
            </h1>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: '#3bceac',
            }}>
              TYPING CERTIFICATE
            </p>
          </div>

          {/* Pixel Art Border */}
          <div className="border-4 border-[#3bceac] p-8 mb-6">
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              THIS CERTIFIES THAT
            </p>

            <h2 style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '20px',
              color: '#ffd93d',
              textAlign: 'center',
              marginBottom: '32px',
            }}>
              {username.toUpperCase()}
            </h2>

            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              ACHIEVED A TYPING SPEED OF
            </p>

            <div className="text-center mb-8">
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '48px',
                color: '#ffd93d',
                lineHeight: '1.2',
              }}>
                {result.wpm}
              </p>
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '16px',
                color: '#3bceac',
              }}>
                WPM
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  ACCURACY
                </p>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '20px',
                  color: '#0ead69',
                }}>
                  {result.accuracy}%
                </p>
              </div>
              <div>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  DURATION
                </p>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '20px',
                  color: '#ff6b9d',
                }}>
                  {result.duration}s
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#666',
            textAlign: 'center',
          }}>
            {new Date(result.timestamp).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={downloadCertificate}
            className="pixel-btn flex-1"
            style={{ background: '#0ead69' }}
          >
            DOWNLOAD
          </button>
          <button
            onClick={shareCertificate}
            className="pixel-btn flex-1"
            style={{ background: '#3bceac' }}
          >
            SHARE
          </button>
          <button
            onClick={onClose}
            className="pixel-btn flex-1"
            style={{ background: '#666' }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 3: Historical Data & Analytics

### 3.1 Convex Schema

**Modify: `convex/schema.ts`**

```typescript
typingTests: defineTable({
  userId: v.id("users"),
  wpm: v.number(),
  rawWpm: v.number(),
  accuracy: v.number(),
  duration: v.number(), // seconds: 15, 30, 60, 120
  timestamp: v.number(),
  textSample: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_user_and_duration", ["userId", "duration"])
  .index("by_timestamp", ["timestamp"]),
```

### 3.2 Convex Functions

**New file: `convex/typingTests.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveTestResult = mutation({
  args: {
    wpm: v.number(),
    rawWpm: v.number(),
    accuracy: v.number(),
    duration: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const testId = await ctx.db.insert("typingTests", {
      userId: user._id,
      wpm: args.wpm,
      rawWpm: args.rawWpm,
      accuracy: args.accuracy,
      duration: args.duration,
      timestamp: args.timestamp,
    });

    return { testId };
  },
});

export const getUserTests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const tests = await ctx.db
      .query("typingTests")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);

    return tests;
  },
});

export const getBestScore = query({
  args: { duration: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const tests = await ctx.db
      .query("typingTests")
      .withIndex("by_user_and_duration", q =>
        q.eq("userId", user._id).eq("duration", args.duration)
      )
      .collect();

    if (tests.length === 0) return null;

    return tests.reduce((best, current) =>
      current.wpm > best.wpm ? current : best
    );
  },
});

export const getGlobalAverage = query({
  args: { duration: v.number() },
  handler: async (ctx, args) => {
    // Get all tests for this duration (limit to recent for performance)
    const tests = await ctx.db
      .query("typingTests")
      .withIndex("by_timestamp")
      .order("desc")
      .filter(q => q.eq(q.field("duration"), args.duration))
      .take(1000);

    if (tests.length === 0) {
      return { avgWpm: 0, avgAccuracy: 0, count: 0 };
    }

    const totalWpm = tests.reduce((sum, t) => sum + t.wpm, 0);
    const totalAccuracy = tests.reduce((sum, t) => sum + t.accuracy, 0);

    return {
      avgWpm: Math.round(totalWpm / tests.length),
      avgAccuracy: Math.round(totalAccuracy / tests.length),
      count: tests.length,
    };
  },
});
```

### 3.3 Test History Component

**New file: `src/components/TestHistory.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Line } from 'react-chartjs-2';

export function TestHistory() {
  const tests = useQuery(api.typingTests.getUserTests, { limit: 20 });

  if (!tests || tests.length === 0) {
    return (
      <div className="pixel-box p-6">
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
        }}>
          NO TEST HISTORY YET
        </p>
      </div>
    );
  }

  const chartData = {
    labels: tests.reverse().map((_, idx) => `Test ${idx + 1}`),
    datasets: [
      {
        label: 'WPM',
        data: tests.map(t => t.wpm),
        borderColor: '#ffd93d',
        backgroundColor: '#ffd93d33',
        tension: 0.3,
      },
      {
        label: 'Accuracy',
        data: tests.map(t => t.accuracy),
        borderColor: '#3bceac',
        backgroundColor: '#3bceac33',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="pixel-box p-6">
      <h3 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '12px',
        color: '#ffd93d',
        marginBottom: '16px',
      }}>
        TEST HISTORY
      </h3>

      <div className="mb-6">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                labels: {
                  font: { family: "'Press Start 2P'", size: 8 },
                  color: '#eef5db',
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  font: { family: "'Press Start 2P'", size: 8 },
                  color: '#666',
                },
              },
              x: {
                ticks: {
                  font: { family: "'Press Start 2P'", size: 6 },
                  color: '#666',
                },
              },
            },
          }}
        />
      </div>

      <div className="space-y-2">
        {tests.slice(0, 5).map((test, idx) => (
          <div
            key={idx}
            className="flex justify-between p-2 bg-[#1a1a2e] rounded"
          >
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
            }}>
              {new Date(test.timestamp).toLocaleDateString()}
            </span>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#ffd93d',
            }}>
              {test.wpm} WPM
            </span>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#3bceac',
            }}>
              {test.accuracy}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 Global Comparison Component

**New file: `src/components/GlobalComparison.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface GlobalComparisonProps {
  wpm: number;
  duration: number;
}

export function GlobalComparison({ wpm, duration }: GlobalComparisonProps) {
  const globalStats = useQuery(api.typingTests.getGlobalAverage, { duration });

  if (!globalStats) return null;

  const percentile = calculatePercentile(wpm, globalStats.avgWpm);
  const message = getPerformanceMessage(percentile);

  return (
    <div className="pixel-box p-6 bg-[#1a1a2e]">
      <h3 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '10px',
        color: '#ffd93d',
        marginBottom: '16px',
      }}>
        GLOBAL COMPARISON
      </h3>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#666',
            marginBottom: '4px',
          }}>
            YOUR WPM
          </p>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffd93d',
          }}>
            {wpm}
          </p>
        </div>

        <div style={{
          fontSize: '24px',
          color: wpm > globalStats.avgWpm ? '#0ead69' : '#ff6b9d',
        }}>
          {wpm > globalStats.avgWpm ? '▲' : '▼'}
        </div>

        <div>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#666',
            marginBottom: '4px',
          }}>
            GLOBAL AVG
          </p>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#3bceac',
          }}>
            {globalStats.avgWpm}
          </p>
        </div>
      </div>

      <div className="w-full bg-[#2d2d4a] rounded-full h-4 mb-2">
        <div
          className="h-4 rounded-full"
          style={{
            width: `${percentile}%`,
            background: 'linear-gradient(90deg, #ff6b9d 0%, #ffd93d 50%, #0ead69 100%)',
          }}
        />
      </div>

      <p style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '8px',
        color: '#eef5db',
        textAlign: 'center',
      }}>
        {message}
      </p>
    </div>
  );
}

function calculatePercentile(userWpm: number, avgWpm: number): number {
  // Simple percentile estimate (would be better with full distribution)
  const ratio = userWpm / avgWpm;
  if (ratio >= 1.5) return 95;
  if (ratio >= 1.3) return 85;
  if (ratio >= 1.1) return 70;
  if (ratio >= 0.9) return 50;
  if (ratio >= 0.7) return 30;
  return 15;
}

function getPerformanceMessage(percentile: number): string {
  if (percentile >= 90) return "ELITE PERFORMANCE!";
  if (percentile >= 70) return "ABOVE AVERAGE!";
  if (percentile >= 40) return "AVERAGE PERFORMANCE";
  return "KEEP PRACTICING!";
}
```

---

## Phase 4: Leaderboard Integration

### 4.1 Test Leaderboard

**Modify: `convex/typingTests.ts`**

Add leaderboard query:

```typescript
export const getLeaderboard = query({
  args: {
    duration: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allTests = await ctx.db
      .query("typingTests")
      .withIndex("by_timestamp")
      .filter(q => q.eq(q.field("duration"), args.duration))
      .collect();

    // Group by user, keep best score
    const userBestScores = new Map();

    for (const test of allTests) {
      const user = await ctx.db.get(test.userId);
      if (!user) continue;

      const existing = userBestScores.get(test.userId);
      if (!existing || test.wpm > existing.wpm) {
        userBestScores.set(test.userId, {
          ...test,
          username: user.username || 'Anonymous',
          avatarId: user.avatarId,
        });
      }
    }

    // Sort by WPM descending
    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, args.limit || 100);

    return leaderboard;
  },
});
```

### 4.2 Leaderboard Component

**New file: `src/components/TestLeaderboard.tsx`**

```typescript
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './Avatar';

export function TestLeaderboard() {
  const [duration, setDuration] = useState(60);
  const leaderboard = useQuery(api.typingTests.getLeaderboard, {
    duration,
    limit: 50,
  });

  return (
    <div className="pixel-box p-6">
      <h2 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '14px',
        color: '#ffd93d',
        marginBottom: '16px',
      }}>
        LEADERBOARD
      </h2>

      {/* Duration Tabs */}
      <div className="flex gap-2 mb-6">
        {[15, 30, 60, 120].map(d => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className="pixel-btn"
            style={{
              fontSize: '8px',
              padding: '8px 12px',
              background: duration === d ? '#ffd93d' : '#666',
              color: duration === d ? '#1a1a2e' : '#eef5db',
            }}
          >
            {d}s
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard?.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded"
          >
            <div className="flex items-center gap-4">
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: idx < 3 ? '#ffd93d' : '#666',
                minWidth: '32px',
              }}>
                #{idx + 1}
              </span>
              <Avatar avatarId={entry.avatarId} size="sm" />
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#eef5db',
              }}>
                {entry.username}
              </span>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#666',
                }}>
                  WPM
                </p>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '14px',
                  color: '#ffd93d',
                }}>
                  {entry.wpm}
                </p>
              </div>
              <div className="text-right">
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#666',
                }}>
                  ACC
                </p>
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '14px',
                  color: '#3bceac',
                }}>
                  {entry.accuracy}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## File Structure

```
typingquest/
├── src/
│   ├── data/
│   │   └── testWords.ts               (new) - Word list generation
│   ├── types/
│   │   └── typingTest.ts              (new) - Test types & interfaces
│   ├── hooks/
│   │   └── useTypingTest.ts           (new) - Test logic hook
│   ├── components/
│   │   ├── TypingTest.tsx             (new) - Main test interface
│   │   ├── TestResults.tsx            (new) - Results screen
│   │   ├── TestCertificate.tsx        (new) - Certificate generator
│   │   ├── TestHistory.tsx            (new) - User test history
│   │   ├── GlobalComparison.tsx       (new) - Performance comparison
│   │   └── TestLeaderboard.tsx        (new) - Test leaderboard
│   └── pages/
│       └── TypingTestsPage.tsx        (new) - Main tests page
├── convex/
│   ├── schema.ts                      (modify) - Add typingTests table
│   └── typingTests.ts                 (new) - Test queries/mutations
└── public/
    └── test-backgrounds/              (new) - Certificate backgrounds
```

---

## Implementation Order

1. **Word Lists** - Create testWords.ts with common word list
2. **Types** - Define TypeScript interfaces in typingTest.ts
3. **Test Hook** - Implement useTypingTest.ts logic
4. **Test UI** - Build TypingTest.tsx component
5. **Schema** - Add typingTests table to Convex schema
6. **Backend** - Create typingTests.ts Convex functions
7. **Results** - Build TestResults.tsx component
8. **Certificate** - Implement TestCertificate.tsx with html2canvas
9. **History** - Create TestHistory.tsx with chart visualization
10. **Comparison** - Build GlobalComparison.tsx component
11. **Leaderboard** - Add TestLeaderboard.tsx
12. **Page** - Create TypingTestsPage.tsx to tie everything together
13. **Navigation** - Add "Tests" link to main navigation
14. **Testing** - Test all durations, edge cases, certificate generation
15. **Polish** - Add animations, sound effects, responsive design

---

## Dependencies

Add to package.json:

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  }
}
```

---

## Notes

### Word List Source
- Use Monkeytype's open-source English 1k word list for consistency
- Alternative: Google's 10,000 most common words (subset to 1000)
- Ensure no profanity, slurs, or controversial terms

### WPM Calculation Standards
- 5 characters = 1 word (industry standard)
- Count all characters including spaces
- Net WPM = Raw WPM × (Accuracy / 100)
- Round to 1 decimal place for display

### Certificate Design
- Pixel art border with TypeBit8 branding
- High resolution (1200×900) for social media sharing
- Include QR code linking back to TypeBit8 (optional)
- Watermark with timestamp for authenticity

### Performance Optimization
- Limit global leaderboard queries to top 100
- Cache global averages (update every 5 minutes)
- Implement pagination for test history (show 10, load more)
- Use Convex indexes for efficient querying

### Mobile Considerations
- Touch-friendly test interface
- Virtual keyboard auto-focus on test start
- Responsive certificate layout for mobile sharing
- Swipe gestures for history navigation

### Future Enhancements
- **Quote mode**: Type famous quotes instead of random words
- **Code mode**: Type code snippets (JavaScript, Python, etc.)
- **Zen mode**: Untimed, unlimited text practice
- **Multiplayer races**: Real-time typing races against other users
- **Daily challenges**: Special tests with unique word lists
- **Achievements**: Badges for milestones (100 WPM, 99% accuracy, etc.)
- **Streak tracking**: Consecutive days of testing
- **Advanced stats**: Heatmap of problem keys, speed per word position

---

## Success Metrics

Track these metrics to measure feature success:

- **Adoption**: % of users who complete at least one test
- **Engagement**: Average tests per user per week
- **Retention**: Do users who take tests return more often?
- **Social**: Number of certificates shared
- **Competition**: Leaderboard view rate
- **Progression**: WPM improvement over time

Target Goals:
- 60% of active users complete at least 1 test per week
- Average 3+ tests per user per session
- 20% certificate share rate
- 5% average WPM improvement over 30 days
