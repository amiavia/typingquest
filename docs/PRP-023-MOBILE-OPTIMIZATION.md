# PRP-023: Mobile Device Optimization

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~35 tasks

---

## Executive Summary

This PRP introduces comprehensive mobile optimization for TypeBit8, transforming it from a desktop-only typing game into a fully responsive mobile experience. The implementation includes responsive layouts, touch-friendly controls, virtual keyboard integration, portrait/landscape support, mobile-specific gesture controls, performance optimizations, and a dedicated mobile onboarding flow. This ensures TypeBit8 is accessible and enjoyable on smartphones and tablets, significantly expanding the potential user base.

---

## Problem Statement

### Current State

1. **Desktop-only Design**: UI optimized exclusively for desktop screens (1024px+)
2. **Keyboard Dependency**: Requires physical keyboard for gameplay
3. **No Touch Support**: Click-based interactions don't translate to mobile
4. **Fixed Layout**: Components break on small screens
5. **Performance Issues**: Heavy animations may lag on mobile devices
6. **Poor Mobile UX**: No mobile-specific onboarding or tutorial

### Impact

| Issue | User Impact |
|-------|-------------|
| Desktop-only layout | Unusable on phones/tablets (50%+ of web traffic) |
| No virtual keyboard | Cannot play typing game on mobile devices |
| Click-only interactions | Frustrating touch experience |
| Fixed dimensions | Content overflow, horizontal scrolling |
| Heavy animations | Battery drain, frame drops, overheating |
| No mobile onboarding | Confused users, high bounce rate |

### Success Criteria

- [ ] Responsive layouts work flawlessly on 320px - 1920px screens
- [ ] Touch interactions feel native and responsive
- [ ] Virtual keyboard option available for touchscreen devices
- [ ] Portrait and landscape modes both supported
- [ ] Mobile-specific gestures (swipe, pinch, tap) implemented
- [ ] Smooth 60fps performance on mid-range mobile devices
- [ ] Mobile onboarding flow guides new users
- [ ] 90+ Lighthouse mobile score

---

## Phase 1: Responsive Layout Foundation

### 1.1 Breakpoint System

**Modify: `src/index.css` (or create `src/styles/breakpoints.css`)**

Define consistent breakpoint system:

```css
/* Mobile Breakpoints */
:root {
  --breakpoint-xs: 320px;  /* Small phones */
  --breakpoint-sm: 640px;  /* Large phones */
  --breakpoint-md: 768px;  /* Tablets portrait */
  --breakpoint-lg: 1024px; /* Tablets landscape */
  --breakpoint-xl: 1280px; /* Desktop */
  --breakpoint-2xl: 1536px; /* Large desktop */
}

/* Utility classes for responsive spacing */
.mobile-padding {
  padding: 16px;
}

@media (min-width: 768px) {
  .mobile-padding {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .mobile-padding {
    padding: 32px;
  }
}
```

### 1.2 Viewport Meta Tag

**Modify: `index.html`**

Ensure proper mobile viewport configuration:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 1.3 Responsive Container System

**New file: `src/components/ResponsiveContainer.tsx`**

```typescript
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`
      w-full
      max-w-[100vw]
      mx-auto
      px-4 sm:px-6 md:px-8 lg:px-12
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### 1.4 Update Main App Layout

**Modify: `src/App.tsx`**

Make main game container responsive:

```typescript
// Replace fixed-width layouts with responsive flex
<div className="min-h-screen flex flex-col bg-[#1a1a2e]">
  {/* Header: responsive height and padding */}
  <header className="
    h-16 md:h-20
    px-4 md:px-6 lg:px-8
    border-b-4 border-[#ffd93d]
  ">
    {/* Header content */}
  </header>

  {/* Main content: responsive padding */}
  <main className="
    flex-1
    p-4 md:p-6 lg:p-8
    overflow-y-auto
  ">
    <ResponsiveContainer>
      {/* Game content */}
    </ResponsiveContainer>
  </main>
</div>
```

### 1.5 Responsive Typography

**Modify: `src/index.css`**

Add responsive font sizes:

```css
/* Base font sizing with fluid typography */
.text-retro-xs {
  font-size: clamp(6px, 1.5vw, 8px);
}

.text-retro-sm {
  font-size: clamp(8px, 2vw, 10px);
}

.text-retro-base {
  font-size: clamp(10px, 2.5vw, 12px);
}

.text-retro-lg {
  font-size: clamp(12px, 3vw, 16px);
}

.text-retro-xl {
  font-size: clamp(14px, 3.5vw, 20px);
}

.text-retro-2xl {
  font-size: clamp(16px, 4vw, 24px);
}
```

---

## Phase 2: Touch-Friendly UI

### 2.1 Touch Target Sizing

**New file: `src/styles/touch.css`**

```css
/* Ensure all interactive elements meet 44x44px minimum */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.touch-target-lg {
  min-width: 56px;
  min-height: 56px;
}

/* Add touch feedback */
.touch-feedback {
  -webkit-tap-highlight-color: rgba(255, 217, 61, 0.3);
  tap-highlight-color: rgba(255, 217, 61, 0.3);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.touch-feedback:active {
  transform: scale(0.95);
  opacity: 0.8;
}
```

### 2.2 Mobile Button Component

**New file: `src/components/MobileButton.tsx`**

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: MobileButtonProps) {
  const baseStyles = 'touch-target touch-feedback transition-all duration-100';

  const variantStyles = {
    primary: 'bg-[#ffd93d] text-[#1a1a2e] border-4 border-[#1a1a2e]',
    secondary: 'bg-[#3bceac] text-[#1a1a2e] border-4 border-[#1a1a2e]',
    danger: 'bg-[#ff6b9d] text-white border-4 border-[#1a1a2e]',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-retro-sm',
    md: 'px-4 py-3 text-retro-base',
    lg: 'px-6 py-4 text-retro-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={{ fontFamily: "'Press Start 2P'" }}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2.3 Mobile Navigation

**New file: `src/components/MobileNav.tsx`**

```typescript
import { useState } from 'react';
import { Home, Trophy, Settings, Menu, X } from 'lucide-react';
import { MobileButton } from './MobileButton';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="md:hidden">
        <button
          className="touch-target touch-feedback p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Slide-out menu */}
      {isOpen && (
        <div className="
          fixed inset-0 z-50
          bg-black/80
          md:hidden
        ">
          <div className="
            absolute right-0 top-0 bottom-0
            w-64
            bg-[#1a1a2e]
            border-l-4 border-[#ffd93d]
            p-6
            overflow-y-auto
          ">
            <button
              className="touch-target touch-feedback mb-8 ml-auto"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} color="#ffd93d" />
            </button>

            <nav className="flex flex-col gap-4">
              <MobileButton variant="primary" size="lg">
                <Home size={16} className="mr-2" />
                Home
              </MobileButton>
              <MobileButton variant="secondary" size="lg">
                <Trophy size={16} className="mr-2" />
                Leaderboard
              </MobileButton>
              <MobileButton variant="secondary" size="lg">
                <Settings size={16} className="mr-2" />
                Settings
              </MobileButton>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
```

### 2.4 Touch Gesture Support

**New file: `src/hooks/useSwipe.ts`**

```typescript
import { useEffect, useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
    }
    // Vertical swipe
    else if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0 && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      } else if (deltaY < 0 && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
    }

    touchStart.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
}
```

---

## Phase 3: Virtual Keyboard & Mobile Input

### 3.1 Virtual Keyboard Component

**New file: `src/components/VirtualKeyboard.tsx`**

```typescript
import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';

const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  highlightKey?: string;
  disabled?: boolean;
}

export function VirtualKeyboard({
  onKeyPress,
  highlightKey,
  disabled = false,
}: VirtualKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKeyPress = (key: string) => {
    if (disabled) return;

    setPressedKey(key);
    onKeyPress(key);

    // Visual feedback
    setTimeout(() => setPressedKey(null), 150);
  };

  return (
    <div className="
      w-full
      max-w-2xl
      mx-auto
      p-2
      bg-[#1a1a2e]
      border-4 border-[#ffd93d]
      rounded-lg
    ">
      <div className="flex flex-col gap-1">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1"
            style={{
              paddingLeft: rowIndex === 1 ? '5%' : rowIndex === 2 ? '10%' : '0',
            }}
          >
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={disabled}
                className={`
                  flex-1
                  min-w-[32px]
                  max-w-[48px]
                  h-12 sm:h-14
                  touch-target
                  touch-feedback
                  font-bold
                  text-sm sm:text-base
                  uppercase
                  rounded
                  transition-all
                  duration-100
                  ${highlightKey === key
                    ? 'bg-[#ffd93d] text-[#1a1a2e] border-2 border-white scale-110'
                    : pressedKey === key
                    ? 'bg-[#3bceac] text-[#1a1a2e] border-2 border-[#0ead69]'
                    : 'bg-[#eef5db] text-[#1a1a2e] border-2 border-[#1a1a2e]'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{ fontFamily: "'Press Start 2P'" }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Space bar */}
      <div className="flex justify-center mt-1">
        <button
          onClick={() => handleKeyPress(' ')}
          disabled={disabled}
          className={`
            w-3/4
            h-12 sm:h-14
            touch-target
            touch-feedback
            font-bold
            text-xs sm:text-sm
            rounded
            transition-all
            ${highlightKey === ' '
              ? 'bg-[#ffd93d] text-[#1a1a2e] border-2 border-white'
              : pressedKey === ' '
              ? 'bg-[#3bceac] text-[#1a1a2e] border-2 border-[#0ead69]'
              : 'bg-[#eef5db] text-[#1a1a2e] border-2 border-[#1a1a2e]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ fontFamily: "'Press Start 2P'" }}
        >
          SPACE
        </button>
      </div>
    </div>
  );
}
```

### 3.2 Keyboard Toggle Hook

**New file: `src/hooks/useKeyboardMode.ts`**

```typescript
import { useState, useEffect } from 'react';

export type KeyboardMode = 'physical' | 'virtual';

export function useKeyboardMode() {
  const [mode, setMode] = useState<KeyboardMode>('physical');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;

      setIsMobile(isMobileDevice);

      // Auto-enable virtual keyboard on mobile
      if (isMobileDevice) {
        setMode('virtual');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === 'physical' ? 'virtual' : 'physical'));
  };

  return { mode, setMode, toggleMode, isMobile };
}
```

### 3.3 Integrate Virtual Keyboard into Game

**Modify: `src/components/TypingGame.tsx`**

```typescript
import { VirtualKeyboard } from './VirtualKeyboard';
import { useKeyboardMode } from '../hooks/useKeyboardMode';

export function TypingGame() {
  const { mode, toggleMode, isMobile } = useKeyboardMode();
  const [currentText, setCurrentText] = useState('');
  const [targetText, setTargetText] = useState('the quick brown fox');

  // Handle virtual keyboard input
  const handleVirtualKeyPress = (key: string) => {
    setCurrentText((prev) => prev + key);
  };

  // Handle physical keyboard input
  useEffect(() => {
    if (mode !== 'physical') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1) {
        setCurrentText((prev) => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  return (
    <div className="flex flex-col gap-4">
      {/* Target text display */}
      <div className="text-center text-retro-lg p-4 bg-[#1a1a2e] border-4 border-[#ffd93d]">
        {targetText}
      </div>

      {/* Current input display */}
      <div className="text-center text-retro-base p-3 bg-[#eef5db]">
        {currentText}
      </div>

      {/* Keyboard mode toggle */}
      {isMobile && (
        <button
          onClick={toggleMode}
          className="self-center px-4 py-2 text-retro-sm bg-[#3bceac] touch-target"
        >
          {mode === 'virtual' ? 'Use Physical Keyboard' : 'Use Virtual Keyboard'}
        </button>
      )}

      {/* Virtual keyboard */}
      {mode === 'virtual' && (
        <VirtualKeyboard
          onKeyPress={handleVirtualKeyPress}
          highlightKey={targetText[currentText.length]}
        />
      )}
    </div>
  );
}
```

---

## Phase 4: Orientation, Performance & Onboarding

### 4.1 Orientation Support

**New file: `src/hooks/useOrientation.ts`**

```typescript
import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}
```

### 4.2 Orientation-Specific Layouts

**Modify: `src/components/TypingGame.tsx`**

```typescript
import { useOrientation } from '../hooks/useOrientation';

export function TypingGame() {
  const orientation = useOrientation();

  return (
    <div className={`
      flex
      ${orientation === 'portrait' ? 'flex-col' : 'flex-row'}
      gap-4
    `}>
      {/* Game content adjusts based on orientation */}
      <div className={`
        ${orientation === 'portrait' ? 'w-full' : 'w-1/2'}
      `}>
        {/* Text display */}
      </div>

      <div className={`
        ${orientation === 'portrait' ? 'w-full' : 'w-1/2'}
      `}>
        {/* Virtual keyboard */}
      </div>
    </div>
  );
}
```

### 4.3 Performance Optimizations

**New file: `src/hooks/useReducedMotion.ts`**

```typescript
import { useState, useEffect } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**Modify: Animation components to respect reduced motion**

```typescript
import { useReducedMotion } from '../hooks/useReducedMotion';

export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`
        transition-all
        ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
      `}
    >
      {/* Content */}
    </div>
  );
}
```

### 4.4 Lazy Loading for Mobile

**Modify: `src/App.tsx`**

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const AvatarSelector = lazy(() => import('./components/AvatarSelector'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* App content */}
    </Suspense>
  );
}
```

### 4.5 Mobile Onboarding

**New file: `src/components/MobileOnboarding.tsx`**

```typescript
import { useState } from 'react';
import { MobileButton } from './MobileButton';
import { Smartphone, Keyboard, Hand, Zap } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to TypeBit8!',
    description: 'Learn to type faster with our retro 8-bit typing game.',
    icon: <Smartphone size={48} color="#ffd93d" />,
  },
  {
    title: 'Choose Your Keyboard',
    description: 'Use the virtual keyboard or connect a physical one.',
    icon: <Keyboard size={48} color="#3bceac" />,
  },
  {
    title: 'Touch-Friendly Controls',
    description: 'Tap, swipe, and gesture your way through lessons.',
    icon: <Hand size={48} color="#ff6b9d" />,
  },
  {
    title: 'Optimized Performance',
    description: 'Smooth animations and fast loading on mobile devices.',
    icon: <Zap size={48} color="#0ead69" />,
  },
];

export function MobileOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="
      fixed inset-0 z-50
      bg-[#1a1a2e]
      flex items-center justify-center
      p-6
    ">
      <div className="
        max-w-md w-full
        bg-[#eef5db]
        border-4 border-[#ffd93d]
        rounded-lg
        p-8
        text-center
      ">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {step.icon}
        </div>

        {/* Title */}
        <h2
          className="text-retro-xl mb-4"
          style={{ fontFamily: "'Press Start 2P'", color: '#1a1a2e' }}
        >
          {step.title}
        </h2>

        {/* Description */}
        <p
          className="text-retro-sm mb-8 leading-relaxed"
          style={{ fontFamily: "'Press Start 2P'", color: '#4a4a6e' }}
        >
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full
                ${index === currentStep ? 'bg-[#ffd93d]' : 'bg-[#4a4a6e]'}
              `}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <MobileButton
              variant="secondary"
              size="lg"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex-1"
            >
              Back
            </MobileButton>
          )}
          <MobileButton
            variant="primary"
            size="lg"
            onClick={handleNext}
            className="flex-1"
          >
            {isLastStep ? 'Get Started!' : 'Next'}
          </MobileButton>
        </div>
      </div>
    </div>
  );
}
```

### 4.6 Onboarding State Management

**New file: `src/hooks/useMobileOnboarding.ts`**

```typescript
import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'typebit8_mobile_onboarding_complete';

export function useMobileOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    const isMobile = window.innerWidth < 768;

    // Show onboarding if mobile and not completed
    setShowOnboarding(isMobile && !completed);
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
```

---

## File Structure (New/Modified)

```
typingquest/
├── index.html                              (modify) - Mobile viewport meta tags
├── src/
│   ├── index.css                           (modify) - Responsive typography, breakpoints
│   ├── App.tsx                             (modify) - Responsive layout, lazy loading
│   ├── styles/
│   │   ├── breakpoints.css                 (new) - Breakpoint system
│   │   └── touch.css                       (new) - Touch interaction styles
│   ├── components/
│   │   ├── ResponsiveContainer.tsx         (new) - Responsive wrapper
│   │   ├── MobileButton.tsx                (new) - Touch-friendly buttons
│   │   ├── MobileNav.tsx                   (new) - Mobile navigation menu
│   │   ├── VirtualKeyboard.tsx             (new) - On-screen keyboard
│   │   ├── MobileOnboarding.tsx            (new) - Mobile tutorial flow
│   │   ├── TypingGame.tsx                  (modify) - Virtual keyboard integration
│   │   └── Leaderboard.tsx                 (modify) - Responsive table layout
│   └── hooks/
│       ├── useSwipe.ts                     (new) - Swipe gesture detection
│       ├── useKeyboardMode.ts              (new) - Physical vs virtual keyboard
│       ├── useOrientation.ts               (new) - Portrait/landscape detection
│       ├── useReducedMotion.ts             (new) - Performance optimization
│       └── useMobileOnboarding.ts          (new) - Onboarding state
└── tailwind.config.js                      (modify) - Add mobile breakpoints
```

---

## Implementation Order

1. **Foundation** - Add viewport meta tags, breakpoint system
2. **Responsive Layouts** - Update App.tsx, create ResponsiveContainer
3. **Typography** - Implement fluid responsive font sizing
4. **Touch UI** - Create touch.css, MobileButton, touch targets
5. **Mobile Nav** - Build MobileNav component with hamburger menu
6. **Virtual Keyboard** - Build VirtualKeyboard component
7. **Keyboard Mode** - Implement useKeyboardMode hook
8. **Game Integration** - Integrate virtual keyboard into TypingGame
9. **Gestures** - Add useSwipe hook for gesture support
10. **Orientation** - Implement orientation detection and layouts
11. **Performance** - Add reduced motion support, lazy loading
12. **Onboarding** - Build MobileOnboarding flow
13. **Testing** - Test on real devices (iOS Safari, Chrome Android)
14. **Lighthouse** - Run mobile performance audit, optimize
15. **Polish** - Fix edge cases, improve animations

---

## Future Enhancements

### Phase 5 (Future)

- **Progressive Web App (PWA)**: Service worker, offline mode, install prompt
- **Haptic Feedback**: Vibration on key press (navigator.vibrate())
- **Mobile-Specific Achievements**: Bonus points for mobile play
- **Adaptive Difficulty**: Adjust based on device performance
- **Mobile Leaderboard**: Separate rankings for mobile vs desktop
- **Voice Commands**: "Start lesson", "Next level" via Web Speech API
- **Split Screen Support**: Android multi-window optimization
- **Mobile Analytics**: Track mobile-specific metrics (touch vs keyboard)

---

## Notes

- **Touch Target Minimum**: All interactive elements must be at least 44x44px
- **Font Size Minimum**: Never go below 8px for readability
- **Test on Real Devices**: Chrome DevTools mobile emulation is not enough
- **iOS Safari Quirks**: Test viewport height (100vh issues), input focus zoom
- **Android Chrome**: Test virtual keyboard overlays, back button handling
- **Performance Budget**: Target 60fps on mid-range devices (iPhone 12, Galaxy S21)
- **Reduced Motion**: Always respect `prefers-reduced-motion` for accessibility
- **Lighthouse Targets**: 90+ Performance, 100 Accessibility, 100 Best Practices
- **Network Conditions**: Test on 3G/4G, not just WiFi
- **Battery Impact**: Monitor battery drain during extended play sessions
