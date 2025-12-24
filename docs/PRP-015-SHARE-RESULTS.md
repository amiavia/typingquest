# PRP-015: Social Sharing Features with Pixel Art Result Cards

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 5 phases, ~45 tasks

---

## Executive Summary

This PRP adds social sharing capabilities to TypeBit8, allowing users to share their typing achievements on social media platforms with branded, pixel-art-styled result cards. Users can share to Twitter, Facebook, and LinkedIn, or copy a shareable link to clipboard. The feature generates visually appealing result cards using HTML5 Canvas that include key metrics (WPM, accuracy, level), user avatar, and TypeBit8 branding. Open Graph meta tags ensure rich link previews when shared.

---

## Problem Statement

### Current State

1. **No sharing mechanism**: Users complete lessons and quizzes but have no way to share achievements
2. **Missing social proof**: No viral growth mechanism through user-generated content
3. **No external engagement**: Users can't showcase progress to friends or social networks
4. **Limited branding**: TypeBit8 lacks shareable branded content for awareness

### Impact

| Issue | User Impact |
|-------|-------------|
| No sharing | Missed opportunity for user engagement and retention |
| No social proof | Reduced viral growth and organic discovery |
| No celebration | Users can't celebrate achievements publicly |
| Limited reach | Reduced brand awareness and user acquisition |

### Success Criteria

- [ ] Users can generate shareable result cards after completing lessons/quizzes
- [ ] Result cards display in pixel art style matching TypeBit8 aesthetic
- [ ] One-click sharing to Twitter, Facebook, and LinkedIn
- [ ] Copy-to-clipboard functionality for sharing links
- [ ] Result cards include: WPM, accuracy, level completed, user avatar
- [ ] TypeBit8 watermark/branding visible on all cards
- [ ] OG meta tags generate rich previews when links are shared
- [ ] Canvas-based image generation works across all browsers
- [ ] Shareable URLs route to result display page
- [ ] Mobile-responsive sharing UI

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SOCIAL SHARING ARCHITECTURE                                                │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Lesson/Quiz  │    │   Result     │    │   Canvas     │                  │
│  │  Complete    │ → │   Data       │ → │   Generator  │                  │
│  │   Event      │    │  (WPM, acc)  │    │ (pixel art)  │                  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                  │                           │
│                                                  ▼                           │
│                                         ┌──────────────────┐                 │
│                                         │  Result Card     │                 │
│                                         │  - Avatar        │                 │
│                                         │  - Stats         │                 │
│                                         │  - Watermark     │                 │
│                                         └────────┬─────────┘                 │
│                                                  │                           │
│                 ┌────────────────────────────────┼────────────────┐          │
│                 ▼                ▼               ▼                ▼          │
│        ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│        │  Twitter   │  │  Facebook  │  │  LinkedIn  │  │  Copy Link │      │
│        │   Share    │  │   Share    │  │   Share    │  │  Clipboard │      │
│        └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                             │
│                              ┌──────────────────┐                           │
│                              │  OG Meta Tags    │                           │
│                              │  - Title         │                           │
│                              │  - Description   │                           │
│                              │  - Image URL     │                           │
│                              └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Result Data Structure

```typescript
// src/types/sharing.ts

export interface ShareableResult {
  id: string;                    // Unique result ID
  userId: string;                // User identifier (guest or authenticated)
  timestamp: number;             // Unix timestamp
  lessonId?: number;             // Lesson completed (optional)
  quizId?: number;               // Quiz completed (optional)
  wpm: number;                   // Words per minute
  accuracy: number;              // Percentage (0-100)
  level: number;                 // Lesson/quiz level number
  avatarId: string;              // User's selected avatar
  username?: string;             // Display name (if authenticated)
}

export interface ShareOptions {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'clipboard';
  includeStats: boolean;         // Include detailed stats in share text
  customMessage?: string;        // User-provided message
}
```

#### 2. Canvas-Based Image Generation

```typescript
// src/utils/resultCardGenerator.ts

export interface CardDimensions {
  width: number;                 // 1200px (optimal for social)
  height: number;                // 630px (optimal OG image size)
  padding: number;               // 40px
}

export interface CardTheme {
  background: string;            // Pixel art background pattern
  primaryColor: string;          // Main brand color
  secondaryColor: string;        // Accent color
  textColor: string;             // Text color
  pixelSize: number;             // Pixel art grid size (8px)
}

export async function generateResultCard(
  result: ShareableResult,
  theme: CardTheme
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = 1200;
  canvas.height = 630;

  // 1. Draw pixel art background
  drawPixelBackground(ctx, theme);

  // 2. Draw TypeBit8 logo/watermark
  drawWatermark(ctx, theme);

  // 3. Draw user avatar (pixel art style)
  await drawAvatar(ctx, result.avatarId, { x: 100, y: 150 });

  // 4. Draw stats (WPM, accuracy, level)
  drawStats(ctx, result, theme);

  // 5. Draw decorative elements (borders, icons)
  drawDecorations(ctx, theme);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function drawPixelBackground(ctx: CanvasRenderingContext2D, theme: CardTheme): void {
  // Create retro pixel art background pattern
  const pixelSize = theme.pixelSize;

  for (let y = 0; y < 630; y += pixelSize) {
    for (let x = 0; x < 1200; x += pixelSize) {
      const shade = Math.random() > 0.7 ? theme.secondaryColor : theme.background;
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}

function drawStats(
  ctx: CanvasRenderingContext2D,
  result: ShareableResult,
  theme: CardTheme
): void {
  ctx.font = 'bold 72px "Press Start 2P", monospace'; // Pixel art font
  ctx.fillStyle = theme.primaryColor;
  ctx.textAlign = 'center';

  // WPM display
  ctx.fillText(`${result.wpm} WPM`, 600, 200);

  // Accuracy display
  ctx.font = 'bold 48px "Press Start 2P", monospace';
  ctx.fillStyle = theme.textColor;
  ctx.fillText(`${result.accuracy}% ACCURACY`, 600, 300);

  // Level completed
  ctx.font = 'bold 36px "Press Start 2P", monospace';
  ctx.fillText(`LEVEL ${result.level} COMPLETE`, 600, 400);
}

async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  avatarId: string,
  position: { x: number; y: number }
): Promise<void> {
  // Load and draw user's pixel art avatar
  const avatar = await loadAvatar(avatarId);
  ctx.drawImage(avatar, position.x, position.y, 150, 150);
}

function drawWatermark(ctx: CanvasRenderingContext2D, theme: CardTheme): void {
  // TypeBit8 logo in bottom-right corner
  ctx.font = 'bold 24px "Press Start 2P", monospace';
  ctx.fillStyle = theme.secondaryColor;
  ctx.textAlign = 'right';
  ctx.fillText('TYPEBIT8', 1150, 590);

  // Small pixel art icon
  drawPixelIcon(ctx, { x: 1000, y: 560 });
}
```

#### 3. Social Platform Integration

```typescript
// src/utils/socialShare.ts

export interface ShareURLs {
  twitter: string;
  facebook: string;
  linkedin: string;
  resultPage: string;
}

export function generateShareURLs(result: ShareableResult): ShareURLs {
  const baseUrl = window.location.origin;
  const resultUrl = `${baseUrl}/result/${result.id}`;

  const shareText = `I just achieved ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeBit8! 🎮⌨️`;

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultUrl)}`,
    resultPage: resultUrl,
  };
}

export async function shareToClipboard(resultUrl: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(resultUrl);
  } else {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = resultUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}

export function openShareWindow(url: string, platform: string): void {
  const width = 600;
  const height = 500;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
  );
}
```

#### 4. Result Storage & Retrieval

```typescript
// src/services/resultStorage.ts

export interface ResultStorage {
  saveResult(result: ShareableResult): Promise<string>; // Returns result ID
  getResult(id: string): Promise<ShareableResult | null>;
  getUserResults(userId: string): Promise<ShareableResult[]>;
}

// Convex implementation
export class ConvexResultStorage implements ResultStorage {
  async saveResult(result: ShareableResult): Promise<string> {
    const id = await convex.mutation('results:create', {
      userId: result.userId,
      timestamp: result.timestamp,
      lessonId: result.lessonId,
      quizId: result.quizId,
      wpm: result.wpm,
      accuracy: result.accuracy,
      level: result.level,
      avatarId: result.avatarId,
      username: result.username,
    });
    return id;
  }

  async getResult(id: string): Promise<ShareableResult | null> {
    return await convex.query('results:get', { id });
  }

  async getUserResults(userId: string): Promise<ShareableResult[]> {
    return await convex.query('results:listByUser', { userId });
  }
}

// LocalStorage fallback for guests
export class LocalResultStorage implements ResultStorage {
  private readonly STORAGE_KEY = 'typebit8_results';

  async saveResult(result: ShareableResult): Promise<string> {
    const results = this.getAllResults();
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    results.push({ ...result, id });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results));
    return id;
  }

  async getResult(id: string): Promise<ShareableResult | null> {
    const results = this.getAllResults();
    return results.find(r => r.id === id) || null;
  }

  async getUserResults(userId: string): Promise<ShareableResult[]> {
    const results = this.getAllResults();
    return results.filter(r => r.userId === userId);
  }

  private getAllResults(): ShareableResult[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
```

#### 5. Share Modal Component

```typescript
// src/components/ShareModal.tsx

import { useState } from 'react';
import { ShareableResult, ShareOptions } from '../types/sharing';
import { generateResultCard } from '../utils/resultCardGenerator';
import { generateShareURLs, openShareWindow, shareToClipboard } from '../utils/socialShare';

interface ShareModalProps {
  result: ShareableResult;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ result, isOpen, onClose }: ShareModalProps) {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrls = generateShareURLs(result);

  useEffect(() => {
    if (isOpen && !cardImage) {
      // Generate result card image
      generateResultCard(result, DEFAULT_THEME).then(blob => {
        setCardImage(URL.createObjectURL(blob));
      });
    }
  }, [isOpen, result]);

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = shareUrls[platform];
    openShareWindow(url, platform);
  };

  const handleCopyLink = async () => {
    await shareToClipboard(shareUrls.resultPage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="share-modal pixel-card">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>🎉 Share Your Achievement!</h2>

        {/* Result Card Preview */}
        <div className="result-card-preview">
          {cardImage && <img src={cardImage} alt="Result card" />}
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <button
            className="share-btn twitter"
            onClick={() => handleShare('twitter')}
          >
            <TwitterIcon /> Share on Twitter
          </button>

          <button
            className="share-btn facebook"
            onClick={() => handleShare('facebook')}
          >
            <FacebookIcon /> Share on Facebook
          </button>

          <button
            className="share-btn linkedin"
            onClick={() => handleShare('linkedin')}
          >
            <LinkedInIcon /> Share on LinkedIn
          </button>

          <button
            className="share-btn copy"
            onClick={handleCopyLink}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat">
            <span className="label">WPM</span>
            <span className="value">{result.wpm}</span>
          </div>
          <div className="stat">
            <span className="label">Accuracy</span>
            <span className="value">{result.accuracy}%</span>
          </div>
          <div className="stat">
            <span className="label">Level</span>
            <span className="value">{result.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 6. Result Display Page

```typescript
// src/pages/ResultPage.tsx

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShareableResult } from '../types/sharing';
import { resultStorage } from '../services/resultStorage';

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<ShareableResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      resultStorage.getResult(id).then(r => {
        setResult(r);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!result) return <div>Result not found</div>;

  return (
    <div className="result-page">
      <div className="result-display pixel-card">
        <h1>TypeBit8 Result</h1>

        <div className="result-avatar">
          <AvatarDisplay avatarId={result.avatarId} size="large" />
          {result.username && <p className="username">{result.username}</p>}
        </div>

        <div className="result-stats">
          <div className="stat-large">
            <span className="value">{result.wpm}</span>
            <span className="label">WPM</span>
          </div>
          <div className="stat-large">
            <span className="value">{result.accuracy}%</span>
            <span className="label">Accuracy</span>
          </div>
          <div className="stat-large">
            <span className="value">Level {result.level}</span>
            <span className="label">Completed</span>
          </div>
        </div>

        <div className="cta">
          <a href="/" className="btn-primary">Try TypeBit8 Yourself!</a>
        </div>
      </div>
    </div>
  );
}
```

#### 7. Open Graph Meta Tags

```html
<!-- index.html - Dynamic meta tags -->
<head>
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="TypeBit8" />
  <meta property="og:title" content="TypeBit8 - Retro Typing Practice Game" />
  <meta property="og:description" content="Master touch typing with TypeBit8's pixel-art styled lessons and challenges!" />
  <meta property="og:image" content="/og-default.png" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="TypeBit8 - Retro Typing Practice Game" />
  <meta property="twitter:description" content="Master touch typing with TypeBit8's pixel-art styled lessons and challenges!" />
  <meta property="twitter:image" content="/og-default.png" />
</head>
```

```typescript
// src/utils/metaTags.ts

export function updateMetaTags(result: ShareableResult): void {
  const title = `${result.username || 'Someone'} achieved ${result.wpm} WPM on TypeBit8!`;
  const description = `${result.accuracy}% accuracy on Level ${result.level}. Can you beat this score?`;
  const imageUrl = `/api/result-card/${result.id}.png`;

  // Update Open Graph tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', imageUrl);

  // Update Twitter Card tags
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', imageUrl);

  // Update page title
  document.title = title;
}

function updateMetaTag(property: string, content: string): void {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.querySelector(`meta[name="${property}"]`);
  }
  if (tag) {
    tag.setAttribute('content', content);
  }
}
```

### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/sharing.ts` | CREATE | Type definitions for sharing |
| `src/utils/resultCardGenerator.ts` | CREATE | Canvas-based card generation |
| `src/utils/socialShare.ts` | CREATE | Social platform integration |
| `src/utils/metaTags.ts` | CREATE | Dynamic OG meta tag updates |
| `src/services/resultStorage.ts` | CREATE | Result persistence (Convex + localStorage) |
| `src/components/ShareModal.tsx` | CREATE | Share modal UI component |
| `src/pages/ResultPage.tsx` | CREATE | Public result display page |
| `src/components/ShareButton.tsx` | CREATE | Trigger button component |
| `src/hooks/useShareResult.ts` | CREATE | Hook for sharing logic |
| `src/assets/fonts/PressStart2P.woff2` | ADD | Pixel art font for canvas |
| `public/og-default.png` | ADD | Default OG image (1200x630) |
| `convex/results.ts` | CREATE | Convex schema for results |
| `src/App.tsx` | MODIFY | Add result page route |
| `src/components/LessonView.tsx` | MODIFY | Trigger share modal on completion |
| `src/components/Quiz.tsx` | MODIFY | Trigger share modal on completion |
| `src/styles/ShareModal.css` | CREATE | Share modal styles |
| `index.html` | MODIFY | Add default OG meta tags |

---

## Documentation Requirements

### Documentation Checklist
- [ ] **D.1** Add README section for social sharing
- [ ] **D.2** Document OG meta tag strategy
- [ ] **D.3** Add changelog entry for social features
- [ ] **D.4** Document result card customization options

### README Updates
| File | Action | Scope |
|------|--------|-------|
| `README.md` | UPDATE | Add social sharing section |
| `docs/SOCIAL-SHARING.md` | CREATE | Technical documentation |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (baseline)
- [ ] `npm run dev` runs without errors
- [ ] Convex backend is configured and running
- [ ] No TypeScript errors in codebase
- [ ] Canvas API is available in target browsers

---

## Implementation Tasks

### Phase 1: Core Data Structures & Types

**Objective**: Create foundational types and data structures for sharing.

#### Tasks
- [ ] **1.1** Create `src/types/sharing.ts` with `ShareableResult`, `ShareOptions` interfaces
- [ ] **1.2** Create `src/types/sharing.ts` with `CardDimensions`, `CardTheme` interfaces
- [ ] **1.3** Add `ShareableResult` fields: id, userId, timestamp, wpm, accuracy, level, avatarId
- [ ] **1.4** Create `src/services/resultStorage.ts` with `ResultStorage` interface
- [ ] **1.5** Implement `ConvexResultStorage` class for authenticated users
- [ ] **1.6** Implement `LocalResultStorage` class for guest fallback
- [ ] **1.7** Create `convex/results.ts` with Convex schema for results table
- [ ] **1.8** Add Convex mutations: `results:create`, queries: `results:get`, `results:listByUser`
- [ ] **1.9** Test Convex integration: create and retrieve test result
- [ ] **1.10** Test localStorage fallback: create and retrieve test result

#### Build Gate
```bash
npm run build
npm run test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-015 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Canvas Result Card Generation

**Objective**: Implement pixel-art styled result card image generation.

#### Tasks
- [ ] **2.1** Create `src/utils/resultCardGenerator.ts` with `generateResultCard()` function
- [ ] **2.2** Implement `drawPixelBackground()` - create retro pixel art background
- [ ] **2.3** Implement `drawWatermark()` - TypeBit8 branding in corner
- [ ] **2.4** Implement `drawStats()` - display WPM, accuracy, level with pixel font
- [ ] **2.5** Implement `drawAvatar()` - render user's pixel art avatar
- [ ] **2.6** Implement `drawDecorations()` - borders and pixel art icons
- [ ] **2.7** Add Press Start 2P font loading for canvas text rendering
- [ ] **2.8** Download and add `src/assets/fonts/PressStart2P.woff2`
- [ ] **2.9** Create default card theme with TypeBit8 brand colors
- [ ] **2.10** Test card generation with sample result data
- [ ] **2.11** Verify canvas output is 1200x630px (optimal for OG images)
- [ ] **2.12** Test image blob export as PNG format
- [ ] **2.13** Verify pixel art style matches TypeBit8 aesthetic
- [ ] **2.14** Test with different avatars and stat combinations

#### Build Gate
```bash
npm run build
npm run test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-015 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Social Platform Integration

**Objective**: Create sharing functionality for social platforms.

#### Tasks
- [ ] **3.1** Create `src/utils/socialShare.ts` with `generateShareURLs()` function
- [ ] **3.2** Implement Twitter share URL generation with intent API
- [ ] **3.3** Implement Facebook share URL generation with sharer API
- [ ] **3.4** Implement LinkedIn share URL generation
- [ ] **3.5** Create `openShareWindow()` function for popup sharing
- [ ] **3.6** Implement `shareToClipboard()` with modern Clipboard API
- [ ] **3.7** Add fallback clipboard method for older browsers (execCommand)
- [ ] **3.8** Create `src/utils/metaTags.ts` with `updateMetaTags()` function
- [ ] **3.9** Implement dynamic OG tag updates for result pages
- [ ] **3.10** Update `index.html` with default OG meta tags
- [ ] **3.11** Create default OG image at `public/og-default.png` (1200x630)
- [ ] **3.12** Test Twitter share URL format and preview
- [ ] **3.13** Test Facebook share URL format and preview
- [ ] **3.14** Test LinkedIn share URL format and preview
- [ ] **3.15** Test clipboard copy functionality across browsers

#### Build Gate
```bash
npm run build
npm run test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-015 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: UI Components

**Objective**: Build share modal and result display components.

#### Tasks
- [ ] **4.1** Create `src/components/ShareModal.tsx` component
- [ ] **4.2** Add result card image preview in modal
- [ ] **4.3** Add Twitter share button with icon
- [ ] **4.4** Add Facebook share button with icon
- [ ] **4.5** Add LinkedIn share button with icon
- [ ] **4.6** Add "Copy Link" button with clipboard functionality
- [ ] **4.7** Add copied confirmation state (checkmark feedback)
- [ ] **4.8** Add stats summary section (WPM, accuracy, level)
- [ ] **4.9** Create `src/styles/ShareModal.css` with pixel art styles
- [ ] **4.10** Style modal with retro/pixel aesthetic matching TypeBit8
- [ ] **4.11** Make share modal responsive for mobile devices
- [ ] **4.12** Create `src/components/ShareButton.tsx` trigger button
- [ ] **4.13** Create `src/pages/ResultPage.tsx` for public result display
- [ ] **4.14** Add avatar display on result page
- [ ] **4.15** Add large stats display on result page
- [ ] **4.16** Add "Try TypeBit8 Yourself!" CTA button
- [ ] **4.17** Style result page with pixel art aesthetic
- [ ] **4.18** Add loading and error states to ResultPage
- [ ] **4.19** Create `src/hooks/useShareResult.ts` custom hook
- [ ] **4.20** Test modal open/close functionality
- [ ] **4.21** Test all share buttons trigger correct actions
- [ ] **4.22** Test mobile responsiveness of share UI

#### Build Gate
```bash
npm run build
npm run test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-015 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: Integration & Testing

**Objective**: Integrate sharing into app flow and verify end-to-end.

#### Tasks
- [ ] **5.1** Update `src/App.tsx` to add `/result/:id` route
- [ ] **5.2** Update `src/components/LessonView.tsx` to trigger share modal on completion
- [ ] **5.3** Update `src/components/Quiz.tsx` to trigger share modal on completion
- [ ] **5.4** Add share button to lesson/quiz completion screens
- [ ] **5.5** Store result data when lesson/quiz completes
- [ ] **5.6** Generate unique result ID for each completion
- [ ] **5.7** Pass result data to share modal
- [ ] **5.8** Test end-to-end: complete lesson → see share modal → share to Twitter
- [ ] **5.9** Test end-to-end: complete quiz → see share modal → copy link
- [ ] **5.10** Test result page loads correctly from shared link
- [ ] **5.11** Verify OG meta tags update dynamically on result page
- [ ] **5.12** Test Twitter Card Validator with result page URL
- [ ] **5.13** Test Facebook Sharing Debugger with result page URL
- [ ] **5.14** Test LinkedIn Post Inspector with result page URL
- [ ] **5.15** Verify result card image displays in social previews
- [ ] **5.16** Test guest user sharing (localStorage)
- [ ] **5.17** Test authenticated user sharing (Convex)
- [ ] **5.18** Test sharing same result multiple times
- [ ] **5.19** Test share modal on mobile devices
- [ ] **5.20** Verify no TypeScript errors
- [ ] **5.21** Verify no console errors in browser
- [ ] **5.22** Take screenshots of share modal and result page
- [ ] **5.23** Document any browser compatibility issues

#### Build Gate
```bash
npm run build
npm run test
# All social platform validators pass
# No TypeScript errors
# No console errors
```

#### Phase Completion
```
<promise>PRP-015 PHASE 5 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-5)
- [ ] `npm run build` passes
- [ ] `npm run test` passes (if tests exist)
- [ ] Integration testing completed
- [ ] Twitter Card Validator passes
- [ ] Facebook Sharing Debugger passes
- [ ] LinkedIn Post Inspector passes
- [ ] Screenshots captured for documentation
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Mobile responsive design verified
- [ ] Code follows project patterns
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-015 COMPLETE</promise>
```

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Disable share buttons in UI
# Remove share button triggers from LessonView and Quiz components

# 2. Revert sharing routes
# Remove /result/:id route from App.tsx

# 3. User data: Results stored separately from progress
# Safe to remove without affecting user progress

# 4. Full revert
git revert HEAD~N  # revert commits from this PRP
```

---

## Open Questions & Decisions

### Q1: Should result cards be customizable?

**Options:**
- A) Single fixed design (simpler, consistent branding)
- B) Theme variants (light/dark, seasonal)
- C) User customization (color schemes, layouts)

**Recommendation:** Option A for v1, Option B for future iterations

### Q2: How long should results be stored?

**Options:**
- A) Forever (unlimited storage, potential costs)
- B) 30 days (reasonable for sharing window)
- C) 90 days (balance of accessibility and storage)

**Recommendation:** Option C - 90 days with archive option for authenticated users

### Q3: Should we support image download?

**Options:**
- A) Share links only (simpler, drives traffic)
- B) Image download option (user convenience, less traffic)
- C) Both (best UX, more complex)

**Recommendation:** Option A for v1 (prioritize traffic), Option C for v2

### Q4: Rate limiting for result generation?

**Options:**
- A) No limits (potential abuse)
- B) Per-user limits (5 shares/hour)
- C) Authenticated users unlimited, guests limited

**Recommendation:** Option C - balances UX and abuse prevention

---

## Notes

### Browser Compatibility

- Canvas API: Supported in all modern browsers
- Clipboard API: Fallback provided for older browsers
- Share popup: Works across all platforms
- OG meta tags: Universal support

### Performance Considerations

- Canvas generation: ~200ms average (acceptable)
- Image size: ~150KB PNG (optimal for social)
- Lazy load result images on public pages
- Cache generated cards (avoid regeneration)

### Social Platform Requirements

| Platform | Image Size | Aspect Ratio | Notes |
|----------|-----------|--------------|-------|
| Twitter | 1200x675 | 16:9 | Summary Large Card |
| Facebook | 1200x630 | 1.91:1 | Recommended OG size |
| LinkedIn | 1200x627 | 1.91:1 | Similar to Facebook |

Our 1200x630 cards work optimally for all platforms.

---

## References

- Open Graph Protocol: https://ogp.me/
- Twitter Card Documentation: https://developer.twitter.com/en/docs/twitter-for-websites/cards
- Facebook Sharing Best Practices: https://developers.facebook.com/docs/sharing/best-practices
- LinkedIn Share URL: https://www.linkedin.com/sharing/share-offsite/
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Press Start 2P Font: https://fonts.google.com/specimen/Press+Start+2P

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---

<!--
WIGGUM EXECUTION COMMAND:
/ralph-loop "Execute PRP-015 per docs/PRP-015-SHARE-RESULTS.md. Work through all unchecked tasks sequentially including pre-flight checks and integration testing. Mark each [x] when done. Run build gates after each phase. Output phase promises after each phase. Output <promise>PRP-015 COMPLETE</promise> when all tasks are done. Do NOT ask for confirmation between tasks." --completion-promise "PRP-015 COMPLETE" --max-iterations 100
-->
