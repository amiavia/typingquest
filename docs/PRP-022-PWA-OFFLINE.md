# PRP-022: Progressive Web App with Offline Support

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 7 phases, ~45 tasks

---

## Executive Summary

Transform TypeBit8 into a fully-featured Progressive Web App (PWA) with comprehensive offline support. This includes service worker implementation for offline caching, installability with Add to Home Screen, offline practice mode with local word database, background sync for progress and scores, push notifications for engagement, and optimized asset caching using Workbox.

## Problem Statement

TypeBit8 currently requires an active internet connection to function. Users lose access to the app when offline, cannot install it as a native-like app on their devices, and experience slower load times on repeat visits. This creates friction for users who want to practice typing on the go, during commutes, or in areas with poor connectivity.

**Key Issues:**
- No offline functionality - app fails completely without internet
- Cannot be installed to home screen/desktop
- No asset caching - slower repeat visits
- Progress lost if connection drops during practice
- No re-engagement mechanism for returning users
- Missed opportunity for native app-like experience

**Expected Benefits:**
- Instant loading on repeat visits (cached assets)
- Full typing practice functionality while offline
- Native app-like experience on mobile and desktop
- Background sync ensures no data loss
- Push notifications re-engage users
- Improved performance and user retention

---

## Phase 1: PWA Foundation Setup

### 1.1 Install Workbox

```bash
npm install workbox-webpack-plugin workbox-window
npm install -D vite-plugin-pwa
```

### 1.2 Configure Vite PWA Plugin

Create/update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TypeBit8 - Learn Touch Typing',
        short_name: 'TypeBit8',
        description: 'Master touch typing with all 10 fingers through gamified lessons',
        theme_color: '#1a1a1a',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

### 1.3 Create PWA Icons

Generate required icon sizes:
- `pwa-64x64.png` (64x64)
- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `maskable-icon-512x512.png` (512x512 with safe zone)
- `apple-touch-icon.png` (180x180)
- `favicon.ico` (32x32)

Place in `/public` directory.

### 1.4 Update HTML Meta Tags

Update `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1a1a1a" />
  <meta name="description" content="Master touch typing with all 10 fingers through gamified lessons" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <title>TypeBit8 - Learn Touch Typing</title>
</head>
```

---

## Phase 2: Service Worker Implementation

### 2.1 Create Service Worker Register Component

Create `src/components/ServiceWorkerRegister.tsx`:

```typescript
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function ServiceWorkerRegister() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50">
          <div className="flex flex-col gap-2">
            {offlineReady ? (
              <span className="text-green-400 text-sm">App ready to work offline</span>
            ) : (
              <span className="text-blue-400 text-sm">New content available, click to refresh</span>
            )}
            <div className="flex gap-2">
              {needRefresh && (
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                  onClick={() => updateServiceWorker(true)}
                >
                  Reload
                </button>
              )}
              <button
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                onClick={() => close()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### 2.2 Integrate Service Worker Register

Update `App.tsx`:

```typescript
import { ServiceWorkerRegister } from './components/ServiceWorkerRegister';

function App() {
  return (
    <>
      <ServiceWorkerRegister />
      {/* existing app content */}
    </>
  );
}
```

### 2.3 Advanced Caching Strategies

Configure different caching strategies for different resource types:

- **Static Assets** (JS, CSS, fonts): CacheFirst
- **Images**: CacheFirst with 30-day expiration
- **API Calls**: NetworkFirst with fallback to cache
- **HTML Pages**: NetworkFirst
- **Word Databases**: CacheFirst (critical for offline)

---

## Phase 3: Offline Data Management

### 3.1 Local Word Database Cache

Create `src/utils/offlineWordDatabase.ts`:

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface WordDB extends DBSchema {
  words: {
    key: string; // language code
    value: {
      language: string;
      words: string[];
      lastUpdated: number;
    };
  };
  progress: {
    key: number; // lesson ID
    value: {
      lessonId: number;
      completed: boolean;
      score: number;
      wpm: number;
      accuracy: number;
      lastPlayed: number;
      syncStatus: 'pending' | 'synced';
    };
  };
  scores: {
    key: string; // composite: `${lessonId}-${timestamp}`
    value: {
      lessonId: number;
      score: number;
      wpm: number;
      accuracy: number;
      timestamp: number;
      syncStatus: 'pending' | 'synced';
    };
  };
}

class OfflineDatabase {
  private db: IDBPDatabase<WordDB> | null = null;

  async init() {
    this.db = await openDB<WordDB>('typebit8-offline', 1, {
      upgrade(db) {
        // Words store
        if (!db.objectStoreNames.contains('words')) {
          db.createObjectStore('words', { keyPath: 'language' });
        }

        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'lessonId' });
          progressStore.createIndex('syncStatus', 'syncStatus');
        }

        // Scores store
        if (!db.objectStoreNames.contains('scores')) {
          const scoresStore = db.createObjectStore('scores', { keyPath: 'id' });
          scoresStore.createIndex('syncStatus', 'syncStatus');
          scoresStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async cacheWords(language: string, words: string[]) {
    if (!this.db) await this.init();
    await this.db!.put('words', {
      language,
      words,
      lastUpdated: Date.now(),
    });
  }

  async getWords(language: string): Promise<string[] | null> {
    if (!this.db) await this.init();
    const data = await this.db!.get('words', language);
    return data ? data.words : null;
  }

  async saveProgress(progress: WordDB['progress']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('progress', progress);
  }

  async getProgress(lessonId: number) {
    if (!this.db) await this.init();
    return await this.db!.get('progress', lessonId);
  }

  async getPendingProgress() {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('progress', 'readonly');
    const index = tx.store.index('syncStatus');
    return await index.getAll('pending');
  }

  async saveScore(score: Omit<WordDB['scores']['value'], 'id'>) {
    if (!this.db) await this.init();
    const id = `${score.lessonId}-${score.timestamp}`;
    await this.db!.put('scores', { ...score, id } as any);
  }

  async getPendingScores() {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('scores', 'readonly');
    const index = tx.store.index('syncStatus');
    return await index.getAll('pending');
  }

  async markSynced(store: 'progress' | 'scores', key: any) {
    if (!this.db) await this.init();
    const item = await this.db!.get(store, key);
    if (item) {
      item.syncStatus = 'synced';
      await this.db!.put(store, item);
    }
  }
}

export const offlineDB = new OfflineDatabase();
```

### 3.2 Install IndexedDB Library

```bash
npm install idb
```

### 3.3 Offline Mode Hook

Create `src/hooks/useOfflineMode.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger background sync
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in registration) {
            registration.sync.register('sync-data');
          }
        });
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
```

### 3.4 Offline Indicator Component

Create `src/components/OfflineIndicator.tsx`:

```typescript
import { useOfflineMode } from '../hooks/useOfflineMode';

export function OfflineIndicator() {
  const { isOnline } = useOfflineMode();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white text-center py-2 z-50">
      <span className="text-sm font-bold">OFFLINE MODE</span>
      <span className="text-xs ml-2">Your progress will sync when you're back online</span>
    </div>
  );
}
```

---

## Phase 4: Install Prompt & App Lifecycle

### 4.1 Install Prompt Component

Create `src/components/InstallPrompt.tsx`:

```typescript
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show after user has been on site for 30 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900 border border-blue-600 rounded-lg p-4 shadow-xl z-50 max-w-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">📱</span>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Install TypeBit8</h3>
            <p className="text-gray-300 text-xs">
              Add to your home screen for quick access and offline practice
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-bold"
            onClick={handleInstall}
          >
            Install
          </button>
          <button
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            onClick={handleDismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4.2 App Update Handler

Create `src/components/AppUpdateHandler.tsx`:

```typescript
import { useEffect, useState } from 'react';

export function AppUpdateHandler() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!window.location.hash.includes('update')) {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-900 border border-green-600 rounded-lg p-4 shadow-xl z-50">
      <div className="flex flex-col gap-2">
        <span className="text-white text-sm font-bold">Update Available!</span>
        <p className="text-gray-300 text-xs">A new version of TypeBit8 is ready</p>
        <button
          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-bold"
          onClick={handleUpdate}
        >
          Update Now
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 5: Background Sync

### 5.1 Configure Background Sync in Service Worker

Add to workbox configuration:

```typescript
// In vite.config.ts PWA plugin config
{
  workbox: {
    // ... existing config
    cleanupOutdatedCaches: true,
    sourcemap: true,
  },
  devOptions: {
    enabled: true,
    type: 'module'
  }
}
```

### 5.2 Background Sync Manager

Create `src/utils/backgroundSync.ts`:

```typescript
import { offlineDB } from './offlineWordDatabase';

export class BackgroundSyncManager {
  async registerSync() {
    if ('serviceWorker' in navigator && 'sync' in (await navigator.serviceWorker.ready)) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-data');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback: sync immediately
        await this.syncNow();
      }
    } else {
      // Fallback for browsers without background sync
      await this.syncNow();
    }
  }

  async syncNow() {
    try {
      // Sync pending progress
      const pendingProgress = await offlineDB.getPendingProgress();
      for (const progress of pendingProgress) {
        await this.syncProgress(progress);
      }

      // Sync pending scores
      const pendingScores = await offlineDB.getPendingScores();
      for (const score of pendingScores) {
        await this.syncScore(score);
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncProgress(progress: any) {
    // Send to your backend API
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });

    if (response.ok) {
      await offlineDB.markSynced('progress', progress.lessonId);
    }
  }

  private async syncScore(score: any) {
    // Send to your backend API
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score),
    });

    if (response.ok) {
      await offlineDB.markSynced('scores', score.id);
    }
  }
}

export const syncManager = new BackgroundSyncManager();
```

### 5.3 Integrate Background Sync

Update game logic to save offline and trigger sync:

```typescript
// In Quiz.tsx or wherever scores are saved
import { offlineDB } from '../utils/offlineWordDatabase';
import { syncManager } from '../utils/backgroundSync';
import { useOfflineMode } from '../hooks/useOfflineMode';

function Quiz() {
  const { isOnline } = useOfflineMode();

  const saveScore = async (score: ScoreData) => {
    if (isOnline) {
      // Save directly to backend
      await fetch('/api/scores', { /* ... */ });
    } else {
      // Save to IndexedDB for later sync
      await offlineDB.saveScore({
        ...score,
        syncStatus: 'pending',
      });
    }

    // Register background sync
    await syncManager.registerSync();
  };

  // ... rest of component
}
```

---

## Phase 6: Push Notifications

### 6.1 Request Notification Permission

Create `src/utils/notifications.ts`:

```typescript
export class NotificationManager {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Replace with your VAPID public key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to your backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        ...options,
      });
    }
  }
}

export const notificationManager = new NotificationManager();
```

### 6.2 Notification Opt-in Component

Create `src/components/NotificationOptIn.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { notificationManager } from '../utils/notifications';

export function NotificationOptIn() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);

      // Show prompt after user completes first lesson
      const hasCompletedLesson = localStorage.getItem('completed-first-lesson');
      const hasAsked = localStorage.getItem('notification-prompt-shown');

      if (hasCompletedLesson && !hasAsked && Notification.permission === 'default') {
        setTimeout(() => setShow(true), 2000);
      }
    }
  }, []);

  const handleEnable = async () => {
    const granted = await notificationManager.requestPermission();
    if (granted) {
      await notificationManager.subscribeToPush();
      setPermission('granted');
    }
    setShow(false);
    localStorage.setItem('notification-prompt-shown', 'true');
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notification-prompt-shown', 'true');
  };

  if (!show || permission !== 'default') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-purple-900 border border-purple-600 rounded-lg p-4 shadow-xl z-50 max-w-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🔔</span>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Stay on Track!</h3>
            <p className="text-gray-300 text-xs">
              Get reminders to practice daily and celebrate your milestones
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm font-bold"
            onClick={handleEnable}
          >
            Enable Notifications
          </button>
          <button
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
            onClick={handleDismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Notification Use Cases

**Daily Practice Reminder:**
- Trigger: User hasn't practiced in 24 hours
- Message: "Your keyboard misses you! Complete today's typing challenge"

**Streak Milestone:**
- Trigger: User reaches 7, 30, 100 day streak
- Message: "Amazing! You've practiced for {X} days in a row!"

**New Level Unlocked:**
- Trigger: User unlocks new lesson
- Message: "Level {X} unlocked! Ready to master new keys?"

**Personal Best:**
- Trigger: User beats their WPM record
- Message: "New record! You just typed at {X} WPM!"

---

## Phase 7: Testing & Optimization

### 7.1 PWA Checklist

- [ ] App installs on mobile (Android & iOS)
- [ ] App installs on desktop (Chrome, Edge, Safari)
- [ ] Service worker registers successfully
- [ ] Offline mode works (disconnect network)
- [ ] Cache updates properly on new deployment
- [ ] Background sync triggers when back online
- [ ] Push notifications deliver successfully
- [ ] App manifest is valid (Lighthouse audit)
- [ ] Icons display correctly on all platforms
- [ ] Splash screen appears on launch
- [ ] Theme color matches app design
- [ ] App works in standalone mode (no browser UI)

### 7.2 Performance Optimization

**Lighthouse PWA Audit Targets:**
- PWA Score: 100/100
- Performance: 90+/100
- Accessibility: 90+/100
- Best Practices: 90+/100
- SEO: 90+/100

**Key Metrics:**
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Speed Index: < 3.4s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 200ms

### 7.3 Cache Storage Management

Monitor cache size and implement cleanup:

```typescript
// Check cache storage quota
navigator.storage.estimate().then((estimate) => {
  const percentUsed = (estimate.usage! / estimate.quota!) * 100;
  console.log(`Using ${percentUsed.toFixed(2)}% of storage quota`);

  if (percentUsed > 80) {
    // Clean old caches
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.includes('old-') || name.includes('v1-')) {
          caches.delete(name);
        }
      });
    });
  }
});
```

### 7.4 Browser Compatibility Testing

Test on:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome Android, Safari iOS, Samsung Internet
- **Features**:
  - Service Worker support
  - IndexedDB support
  - Push API support
  - Background Sync API support
  - Install prompt support

### 7.5 Offline Fallback Testing

Test scenarios:
1. Load app online, go offline, continue practicing
2. Complete lesson offline, verify sync when online
3. Submit score offline, verify it syncs to leaderboard
4. App update available while offline
5. Push notification while app is closed
6. Reinstall app and verify data persistence

---

## Implementation Order

1. **Phase 1** - Install dependencies and configure Vite PWA plugin
2. **Phase 1** - Create PWA icons and update manifest
3. **Phase 2** - Implement service worker registration and update UI
4. **Phase 3** - Set up IndexedDB for offline data storage
5. **Phase 3** - Implement offline mode detection and indicator
6. **Phase 4** - Add install prompt with proper timing
7. **Phase 5** - Implement background sync for progress/scores
8. **Phase 3** - Cache word databases for offline practice
9. **Phase 6** - Add push notification support (optional)
10. **Phase 6** - Create notification opt-in flow
11. **Phase 7** - Run Lighthouse audits and optimize
12. **Phase 7** - Test across browsers and devices
13. **Phase 7** - Deploy and monitor cache performance

---

## File Structure

```
src/
├── components/
│   ├── ServiceWorkerRegister.tsx    # SW registration + update UI
│   ├── OfflineIndicator.tsx         # Offline mode banner
│   ├── InstallPrompt.tsx            # PWA install prompt
│   ├── AppUpdateHandler.tsx         # App update notification
│   └── NotificationOptIn.tsx        # Push notification opt-in
├── hooks/
│   └── useOfflineMode.ts            # Online/offline detection
├── utils/
│   ├── offlineWordDatabase.ts       # IndexedDB wrapper
│   ├── backgroundSync.ts            # Background sync manager
│   └── notifications.ts             # Push notification manager
└── types/
    └── pwa.d.ts                     # TypeScript definitions for PWA APIs

public/
├── pwa-64x64.png                    # Small icon
├── pwa-192x192.png                  # Medium icon
├── pwa-512x512.png                  # Large icon
├── maskable-icon-512x512.png        # Maskable icon
├── apple-touch-icon.png             # iOS icon
├── favicon.ico                      # Browser favicon
└── robots.txt                       # SEO robots file

vite.config.ts                       # Updated with PWA plugin config
```

---

## Notes

### Browser Support

- **Service Workers**: Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+
- **Push API**: Chrome 42+, Firefox 44+, Safari 16+ (macOS only), Edge 17+
- **Background Sync**: Chrome 49+, Edge 79+ (not in Firefox/Safari - use fallback)
- **Install Prompt**: Chrome/Edge only (iOS Safari has different UX)

### iOS Safari Limitations

- Push notifications only work on iOS 16.4+ and macOS 13+
- Install prompt works differently (Share → Add to Home Screen)
- Background sync not supported (fallback to immediate sync)
- Service worker scope limitations

### Data Sync Strategy

- **Optimistic UI**: Show success immediately, sync in background
- **Retry Logic**: Exponential backoff for failed syncs
- **Conflict Resolution**: Last write wins (or implement custom logic)
- **Data Validation**: Validate data before syncing to prevent corruption

### Security Considerations

- Service workers require HTTPS (except localhost)
- Push notifications require user permission
- Background sync requires service worker
- IndexedDB data is per-origin (isolated)

### Future Enhancements

- **Web Share API**: Share progress with friends
- **Periodic Background Sync**: Update leaderboard daily
- **File System Access API**: Export/import progress
- **Badging API**: Show unread achievements on app icon
- **Shortcuts API**: Quick actions from home screen icon
- **Screen Wake Lock**: Prevent sleep during practice sessions

### Analytics & Monitoring

Track PWA-specific metrics:
- Install conversion rate
- Offline usage percentage
- Background sync success rate
- Push notification engagement
- Cache hit ratio
- Service worker update frequency

### A/B Testing Opportunities

- Install prompt timing (immediate vs. delayed)
- Notification opt-in copy
- Offline indicator design
- Update prompt urgency
- Cache strategy (aggressive vs. conservative)
