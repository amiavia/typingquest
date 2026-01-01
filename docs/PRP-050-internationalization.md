# PRP-050: Internationalization (i18n) & Language-Aware Lessons

## Overview

Localize the entire typebit8 UI and lesson content for German (DE), French (FR), Italian (IT), Spanish (ES), and Portuguese (PT), while maintaining English (EN) as the default language.

## Goals

1. **UI Localization**: All interface text available in 6 languages
2. **Language-Aware Lessons**: Typing content appropriate for each language
3. **Keyboard Layout Integration**: Lessons respect language-specific keyboard layouts
4. **Seamless UX**: Easy language switching with persistent preferences
5. **SEO-Friendly**: Proper URL structure and meta tags for each language

---

## Part 1: Architecture Overview

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| UI Translations | `react-i18next` | Industry standard, namespaces, lazy loading |
| Language Detection | `i18next-browser-languagedetector` | Auto-detect from browser/localStorage |
| Translation Files | JSON | Simple, tooling support, easy to edit |
| Lesson Content | TypeScript modules | Type safety, dynamic imports |

### Supported Languages

```typescript
type SupportedLanguage = 'en' | 'de' | 'fr' | 'it' | 'es' | 'pt';

const LANGUAGES: Record<SupportedLanguage, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
};
```

---

## Part 2: Directory Structure

```
src/
├── i18n/
│   ├── index.ts                    # i18n configuration
│   ├── LanguageProvider.tsx        # Language context & persistence
│   ├── useLanguage.ts              # Custom hook for language access
│   └── constants.ts                # Language definitions
│
├── locales/
│   ├── en/
│   │   ├── common.json             # Shared UI strings
│   │   ├── lessons.json            # Lesson titles, descriptions
│   │   ├── marketing.json          # Landing page, CTAs
│   │   ├── achievements.json       # Badge names, descriptions
│   │   └── errors.json             # Error messages
│   ├── de/
│   │   └── ... (same structure)
│   ├── fr/
│   ├── it/
│   ├── es/
│   └── pt/
│
├── data/
│   ├── lessons/
│   │   ├── index.ts                # Lesson loader/router
│   │   ├── types.ts                # LocalizedLesson types
│   │   ├── en/
│   │   │   ├── beginner.ts         # Levels 1-10
│   │   │   ├── intermediate.ts     # Levels 11-20
│   │   │   ├── advanced.ts         # Levels 21-30
│   │   │   └── themed.ts           # Levels 31-50 (AI, Dev, Business)
│   │   ├── de/
│   │   │   └── ... (same structure)
│   │   └── ...
│   │
│   └── wordLists/
│       ├── en.ts                   # English word frequency list
│       ├── de.ts                   # German word frequency list
│       ├── fr.ts                   # French word frequency list
│       └── ...
```

---

## Part 3: UI Localization

### 3.1 Translation File Format

**`locales/en/common.json`**
```json
{
  "header": {
    "title": "TYPEBIT8",
    "subtitle": "Master the Keyboard",
    "challenge": "Challenge",
    "premium": "Premium",
    "level": "Level",
    "xp": "XP"
  },
  "navigation": {
    "home": "Home",
    "lessons": "Lessons",
    "leaderboard": "Leaderboard",
    "shop": "Shop",
    "settings": "Settings"
  },
  "actions": {
    "startPracticing": "Start Practicing",
    "continue": "Continue",
    "retry": "Retry",
    "signUp": "Sign Up",
    "signIn": "Sign In",
    "upgrade": "Upgrade to Premium"
  },
  "stats": {
    "wpm": "{{count}} WPM",
    "accuracy": "{{count}}% Accuracy",
    "streak": "{{count}} Day Streak",
    "complete": "{{current}}/{{total}} Complete"
  },
  "messages": {
    "levelComplete": "Level Complete!",
    "newRecord": "New Personal Record!",
    "keepPracticing": "Keep practicing to improve"
  }
}
```

**`locales/de/common.json`**
```json
{
  "header": {
    "title": "TYPEBIT8",
    "subtitle": "Meistere die Tastatur",
    "challenge": "Herausforderung",
    "premium": "Premium",
    "level": "Stufe",
    "xp": "EP"
  },
  "navigation": {
    "home": "Startseite",
    "lessons": "Lektionen",
    "leaderboard": "Rangliste",
    "shop": "Shop",
    "settings": "Einstellungen"
  },
  "actions": {
    "startPracticing": "Übung starten",
    "continue": "Fortfahren",
    "retry": "Erneut versuchen",
    "signUp": "Registrieren",
    "signIn": "Anmelden",
    "upgrade": "Auf Premium upgraden"
  },
  "stats": {
    "wpm": "{{count}} WPM",
    "accuracy": "{{count}}% Genauigkeit",
    "streak": "{{count}} Tage Serie",
    "complete": "{{current}}/{{total}} Abgeschlossen"
  },
  "messages": {
    "levelComplete": "Level abgeschlossen!",
    "newRecord": "Neuer persönlicher Rekord!",
    "keepPracticing": "Weiter üben, um dich zu verbessern"
  }
}
```

### 3.2 i18n Configuration

**`src/i18n/index.ts`**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,

    // Namespaces for code splitting
    ns: ['common', 'lessons', 'marketing', 'achievements', 'errors'],
    defaultNS: 'common',

    // Load translations from /locales
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection order
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'typebit8-language',
      caches: ['localStorage'],
    },

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React specific
    react: {
      useSuspense: true,
    },
  });

export default i18n;
```

### 3.3 Language Provider

**`src/i18n/LanguageProvider.tsx`**
```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { SupportedLanguage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's saved language preference
  const userProfile = useQuery(
    api.users.getProfile,
    userId ? { clerkId: userId } : 'skip'
  );
  const updateLanguage = useMutation(api.users.updateLanguage);

  // Sync language with user profile
  useEffect(() => {
    if (userProfile?.language) {
      i18n.changeLanguage(userProfile.language);
    }
    setIsLoading(false);
  }, [userProfile?.language, i18n]);

  const setLanguage = async (lang: SupportedLanguage) => {
    // Change UI language immediately
    await i18n.changeLanguage(lang);

    // Persist to localStorage (for guests)
    localStorage.setItem('typebit8-language', lang);

    // Persist to database (for authenticated users)
    if (userId) {
      await updateLanguage({ clerkId: userId, language: lang });
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language: i18n.language as SupportedLanguage,
        setLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

### 3.4 Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

function LevelCard({ lesson, progress }) {
  const { t } = useTranslation();

  return (
    <div className="pixel-box">
      <h3>{t('lessons:level', { number: lesson.id })}</h3>
      <p>{t(`lessons:titles.level${lesson.id}`)}</p>

      <div className="stats">
        <span>{t('stats.wpm', { count: lesson.minWPM })}</span>
        <span>{t('stats.accuracy', { count: lesson.minAccuracy })}</span>
      </div>

      {progress?.completed && (
        <span>{t('messages.levelComplete')}</span>
      )}
    </div>
  );
}
```

---

## Part 4: Language-Aware Lessons

### 4.1 The Challenge

Typing lessons must account for:

1. **Language-Specific Characters**
   - German: ä, ö, ü, ß
   - French: é, è, ê, ë, à, ç
   - Spanish: ñ, ¿, ¡, á, é, í, ó, ú
   - Portuguese: ã, õ, ç, á, é, í, ó, ú
   - Italian: à, è, é, ì, ò, ù

2. **Keyboard Layout Differences**
   - German: QWERTZ (Y and Z swapped)
   - French: AZERTY (completely different layout)
   - Others: QWERTY variants with special character positions

3. **Word Frequency & Difficulty**
   - Each language has different common words
   - German compound words are longer
   - Romance languages have more accented characters

4. **Natural Typing Flow**
   - Translated sentences may not flow well
   - Native content feels more natural

### 4.2 Hybrid Approach (Recommended)

| Lesson Type | Localization Strategy |
|-------------|----------------------|
| Beginner (1-10) | **Fully language-specific** - Different words, key sequences |
| Intermediate (11-20) | **Adapted** - Translated sentences, adjusted for length |
| Advanced (21-30) | **Translated** - Professional translations with review |
| Themed: AI Prompts | **Shared** - English prompts are universal |
| Themed: Developer | **Shared** - Code syntax is language-agnostic |
| Themed: Business | **Translated** - Locale-specific business phrases |

### 4.3 Localized Lesson Type Definition

**`src/data/lessons/types.ts`**
```typescript
import { SupportedLanguage } from '../../i18n/constants';

export interface LocalizedLesson {
  id: number;
  tier: 'basics' | 'intermediate' | 'advanced' | 'expert' | 'themed';

  // Keys to practice (may vary by language/layout)
  keys: string[];

  // Requirements (shared across languages)
  minWPM: number;
  minAccuracy: number;

  // Localized metadata
  metadata: {
    [lang in SupportedLanguage]: {
      title: string;
      description: string;
      focusArea: string;
    };
  };

  // Localized typing content
  content: {
    [lang in SupportedLanguage]: LessonContent;
  };

  // Optional: Keyboard layout requirement
  requiredLayout?: KeyboardLayoutType;
}

export interface LessonContent {
  // Word bank for this lesson
  words: string[];

  // Practice sentences (ordered by difficulty)
  sentences: string[];

  // Paragraph practice (advanced)
  paragraphs?: string[];

  // Special characters to introduce
  specialChars?: string[];
}

// Example: Word frequency tiers
export interface WordList {
  tier1: string[];  // Most common 100 words
  tier2: string[];  // 101-500 most common
  tier3: string[];  // 501-1000 most common
  tier4: string[];  // 1001-2500 most common
  tier5: string[];  // 2501-5000 most common
}
```

### 4.4 Example: Beginner Lessons (Language-Specific)

**`src/data/lessons/en/beginner.ts`**
```typescript
import { LocalizedLesson } from '../types';

export const beginnerLessons: LocalizedLesson[] = [
  {
    id: 1,
    tier: 'basics',
    keys: ['a', 's', 'd', 'f'],
    minWPM: 8,
    minAccuracy: 80,
    metadata: {
      en: {
        title: 'Home Row Left',
        description: 'Master the left hand home row keys',
        focusArea: 'Left hand positioning',
      },
      de: {
        title: 'Grundstellung Links',
        description: 'Meistere die linke Grundstellungstasten',
        focusArea: 'Linke Hand Position',
      },
      // ... other languages
    },
    content: {
      en: {
        words: ['as', 'sad', 'dad', 'fad', 'add', 'ads', 'sass', 'dads', 'fads'],
        sentences: [
          'a sad dad',
          'add a fad',
          'sass and ads',
          'dad adds sass',
        ],
      },
      de: {
        words: ['da', 'das', 'dass', 'lass', 'sass', 'aas', 'fass', 'fad'],
        sentences: [
          'das da lass',
          'fass das fad',
          'sass da das',
          'lass das aas',
        ],
      },
      fr: {
        words: ['sa', 'as', 'fa', 'da', 'ça', 'la', 'las', 'das'],
        sentences: [
          'sa fa la',
          'as sa da',
          'la la fa',
          'das las sa',
        ],
      },
      // ... other languages
    },
  },
  // More beginner lessons...
];
```

**`src/data/lessons/de/beginner.ts`** (German-specific with QWERTZ focus)
```typescript
export const germanBeginnerLessons: LocalizedLesson[] = [
  {
    id: 1,
    tier: 'basics',
    keys: ['a', 's', 'd', 'f'],  // Same home row
    minWPM: 8,
    minAccuracy: 80,
    requiredLayout: 'qwertz-de',  // Require German QWERTZ
    metadata: {
      de: {
        title: 'Grundstellung Links',
        description: 'Lerne die linken Grundstellungstasten',
        focusArea: 'Linke Hand auf ASDF',
      },
    },
    content: {
      de: {
        words: [
          // Common German words using only ASDF
          'das', 'da', 'lass', 'sass', 'fass', 'aas', 'dass', 'fad',
        ],
        sentences: [
          'das da',
          'lass das',
          'fass das fad',
          'da sass das aas',
        ],
      },
    },
  },
  {
    id: 6,  // QWERTZ specific - Z is where Y is on QWERTY
    tier: 'basics',
    keys: ['a', 's', 'd', 'f', 'z'],  // Z is accessible in QWERTZ
    minWPM: 12,
    minAccuracy: 82,
    requiredLayout: 'qwertz-de',
    metadata: {
      de: {
        title: 'Mit Z erweitert',
        description: 'Füge das Z zur Grundstellung hinzu',
        focusArea: 'Z-Taste (QWERTZ Layout)',
      },
    },
    content: {
      de: {
        words: ['zda', 'zaz', 'zass', 'satz', 'salz', 'zahl'],
        sentences: [
          'das salz',
          'zahl das',
          'satz da',
        ],
      },
    },
  },
];
```

### 4.5 Word Frequency Lists

**`src/data/wordLists/de.ts`**
```typescript
export const germanWordList = {
  // Most common German words by frequency
  tier1: [
    'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich',
    'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als',
    'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach',
    'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über',
    // ... 100 words
  ],
  tier2: [
    'diese', 'können', 'dieser', 'andere', 'seinem', 'selbst', 'gegen',
    'schon', 'seinen', 'wenn', 'unter', 'ihrem', 'immer', 'wieder', 'wir',
    // ... 400 words
  ],
  // ... more tiers

  // Words containing special characters
  umlauts: {
    ä: ['für', 'wäre', 'hätte', 'während', 'später', 'Länder', 'Männer'],
    ö: ['können', 'möglich', 'schön', 'größer', 'hören', 'König'],
    ü: ['für', 'über', 'würde', 'müssen', 'führen', 'natürlich', 'Glück'],
    ß: ['dass', 'groß', 'weiß', 'heißt', 'Straße', 'schließen'],
  },
};
```

**`src/data/wordLists/fr.ts`**
```typescript
export const frenchWordList = {
  tier1: [
    'de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une',
    'que', 'est', 'pour', 'qui', 'dans', 'ce', 'il', 'pas', 'plus', 'par',
    'sur', 'ne', 'se', 'son', 'au', 'avec', 'tout', 'mais', 'nous', 'sa',
    // ... 100 words
  ],

  // Words with accented characters
  accents: {
    é: ['été', 'même', 'après', 'première', 'années', 'général'],
    è: ['père', 'mère', 'très', 'après', 'problème', 'système'],
    ê: ['être', 'même', 'tête', 'fête', 'forêt', 'fenêtre'],
    à: ['à', 'là', 'déjà', 'voilà', 'au-delà'],
    ç: ['ça', 'français', 'façon', 'reçu', 'leçon', 'garçon'],
    ù: ['où', 'coût', 'goût', 'août'],
  },
};
```

### 4.6 Lesson Loader

**`src/data/lessons/index.ts`**
```typescript
import { SupportedLanguage } from '../../i18n/constants';
import { LocalizedLesson } from './types';

// Dynamic import for code splitting
const lessonModules: Record<SupportedLanguage, () => Promise<{ default: LocalizedLesson[] }>> = {
  en: () => import('./en'),
  de: () => import('./de'),
  fr: () => import('./fr'),
  it: () => import('./it'),
  es: () => import('./es'),
  pt: () => import('./pt'),
};

let cachedLessons: Map<SupportedLanguage, LocalizedLesson[]> = new Map();

export async function loadLessonsForLanguage(
  language: SupportedLanguage
): Promise<LocalizedLesson[]> {
  // Return cached if available
  if (cachedLessons.has(language)) {
    return cachedLessons.get(language)!;
  }

  try {
    const module = await lessonModules[language]();
    cachedLessons.set(language, module.default);
    return module.default;
  } catch (error) {
    console.error(`Failed to load lessons for ${language}, falling back to English`);
    return loadLessonsForLanguage('en');
  }
}

export function getLessonContent(
  lesson: LocalizedLesson,
  language: SupportedLanguage
): LessonContent {
  // Try requested language first
  if (lesson.content[language]) {
    return lesson.content[language];
  }

  // Fallback to English
  if (lesson.content.en) {
    return lesson.content.en;
  }

  throw new Error(`No content available for lesson ${lesson.id}`);
}

export function getLessonMetadata(
  lesson: LocalizedLesson,
  language: SupportedLanguage
) {
  return lesson.metadata[language] || lesson.metadata.en;
}
```

---

## Part 5: Keyboard Layout Integration

### 5.1 Extended Keyboard Layouts

Update `KeyboardLayoutProvider` to support language-specific layouts:

```typescript
export const KEYBOARD_LAYOUTS = {
  // English layouts
  'qwerty-us': { name: 'QWERTY (US)', language: 'en', ... },
  'qwerty-uk': { name: 'QWERTY (UK)', language: 'en', ... },

  // German layouts
  'qwertz-de': { name: 'QWERTZ (German)', language: 'de', ... },
  'qwertz-ch': { name: 'QWERTZ (Swiss)', language: 'de', ... },

  // French layouts
  'azerty-fr': { name: 'AZERTY (French)', language: 'fr', ... },
  'azerty-be': { name: 'AZERTY (Belgian)', language: 'fr', ... },

  // Spanish layouts
  'qwerty-es': { name: 'QWERTY (Spanish)', language: 'es', ... },
  'qwerty-latam': { name: 'QWERTY (Latin American)', language: 'es', ... },

  // Portuguese layouts
  'qwerty-pt': { name: 'QWERTY (Portuguese)', language: 'pt', ... },
  'qwerty-br': { name: 'QWERTY (Brazilian)', language: 'pt', ... },

  // Italian layouts
  'qwerty-it': { name: 'QWERTY (Italian)', language: 'it', ... },
};
```

### 5.2 Auto-Suggest Layout Based on Language

```typescript
function suggestLayoutForLanguage(language: SupportedLanguage): KeyboardLayoutType {
  const suggestions: Record<SupportedLanguage, KeyboardLayoutType> = {
    en: 'qwerty-us',
    de: 'qwertz-de',
    fr: 'azerty-fr',
    es: 'qwerty-es',
    pt: 'qwerty-pt',
    it: 'qwerty-it',
  };
  return suggestions[language];
}
```

---

## Part 6: Database Schema Updates

### 6.1 Convex Schema Changes

**`convex/schema.ts`**
```typescript
// Users table
users: defineTable({
  clerkId: v.string(),
  email: v.optional(v.string()),
  nickname: v.optional(v.string()),

  // NEW: Language preferences
  language: v.optional(v.string()),  // 'en' | 'de' | 'fr' | 'it' | 'es' | 'pt'
  keyboardLayout: v.optional(v.string()),

  // Existing fields...
  isPremium: v.optional(v.boolean()),
  premiumSince: v.optional(v.number()),
})

// Lesson progress - add language context
lessonProgress: defineTable({
  clerkId: v.string(),
  lessonId: v.number(),

  // NEW: Language context for this progress
  language: v.optional(v.string()),  // Defaults to 'en' for existing records

  // Existing fields...
  completed: v.boolean(),
  quizPassed: v.boolean(),
  bestWPM: v.number(),
  bestAccuracy: v.number(),
})
```

### 6.2 Progress Strategy: Per-Language

Progress is tracked **separately per language** because:
- Difficulty varies by language
- Users may have different skill levels in different languages
- Provides accurate per-language statistics

```typescript
// Query progress for specific language
export const getLessonProgress = query({
  args: {
    clerkId: v.string(),
    lessonId: v.number(),
    language: v.string(),
  },
  handler: async (ctx, { clerkId, lessonId, language }) => {
    return await ctx.db
      .query('lessonProgress')
      .withIndex('by_user_lesson', (q) =>
        q.eq('clerkId', clerkId).eq('lessonId', lessonId)
      )
      .filter((q) => q.eq(q.field('language'), language))
      .first();
  },
});

// Aggregate stats across all languages
export const getTotalStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const allProgress = await ctx.db
      .query('lessonProgress')
      .withIndex('by_user', (q) => q.eq('clerkId', clerkId))
      .collect();

    return {
      totalLessonsCompleted: allProgress.filter(p => p.completed).length,
      byLanguage: groupBy(allProgress, 'language'),
      bestOverallWPM: Math.max(...allProgress.map(p => p.bestWPM)),
    };
  },
});
```

---

## Part 7: URL Strategy & SEO

### 7.1 URL Structure

Use **path prefix** for SEO benefits:

```
typebit8.com/           → English (default)
typebit8.com/de/        → German
typebit8.com/fr/        → French
typebit8.com/it/        → Italian
typebit8.com/es/        → Spanish
typebit8.com/pt/        → Portuguese
```

### 7.2 Router Configuration

**`src/router.tsx`**
```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'lessons', element: <Lessons /> },
      { path: 'lessons/:id', element: <LessonPlayer /> },
      // ... other routes
    ],
  },
  {
    path: '/:lang',
    element: <LanguageWrapper />,
    children: [
      { index: true, element: <Home /> },
      { path: 'lessons', element: <Lessons /> },
      { path: 'lessons/:id', element: <LessonPlayer /> },
      // ... mirror all routes
    ],
  },
]);

function LanguageWrapper() {
  const { lang } = useParams();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguage(lang as SupportedLanguage);
    }
  }, [lang]);

  return <Outlet />;
}
```

### 7.3 SEO Meta Tags

```tsx
function SEOHead({ language }: { language: SupportedLanguage }) {
  const { t } = useTranslation('marketing');

  return (
    <Helmet>
      <html lang={language} />
      <title>{t('seo.title')}</title>
      <meta name="description" content={t('seo.description')} />

      {/* Hreflang for language alternatives */}
      <link rel="alternate" hreflang="en" href="https://typebit8.com/" />
      <link rel="alternate" hreflang="de" href="https://typebit8.com/de/" />
      <link rel="alternate" hreflang="fr" href="https://typebit8.com/fr/" />
      <link rel="alternate" hreflang="it" href="https://typebit8.com/it/" />
      <link rel="alternate" hreflang="es" href="https://typebit8.com/es/" />
      <link rel="alternate" hreflang="pt" href="https://typebit8.com/pt/" />
      <link rel="alternate" hreflang="x-default" href="https://typebit8.com/" />
    </Helmet>
  );
}
```

---

## Part 8: Translation Workflow

### 8.1 Process

1. **Extract Strings**
   - Use i18next-parser to extract strings from code
   - Generate base JSON files with all keys

2. **Initial Translation**
   - Use AI (Claude/GPT) for initial draft
   - Mark as "needs review"

3. **Professional Review**
   - Native speakers review and refine
   - Focus on natural phrasing for typing

4. **Lesson Content**
   - Source word frequency lists from linguistic databases
   - Create natural sentences using common words
   - Test typing flow with native speakers

5. **QA Testing**
   - Test each language end-to-end
   - Verify special characters work
   - Check keyboard layout integration

### 8.2 Translation File Management

Consider using:
- **Lokalise** or **Crowdin** for team translation management
- **Git-based workflow** for developer-friendly process
- **JSON format** for simplicity

---

## Part 9: Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up react-i18next configuration
- [ ] Create LanguageProvider
- [ ] Extract all hardcoded strings from UI
- [ ] Create English translation files (as baseline)
- [ ] Add language switcher component

### Phase 2: German Pilot (Week 3-4)
- [ ] Complete German UI translations
- [ ] Create German beginner lessons (1-10)
- [ ] Add QWERTZ keyboard layout support
- [ ] Create German word frequency lists
- [ ] Test end-to-end in German

### Phase 3: Romance Languages (Week 5-8)
- [ ] French UI + AZERTY support
- [ ] Spanish UI + Spanish keyboard
- [ ] Italian UI + Italian keyboard
- [ ] Portuguese UI + PT/BR keyboards
- [ ] Create beginner lessons for each

### Phase 4: Full Content (Week 9-12)
- [ ] Intermediate lessons for all languages
- [ ] Advanced lessons for all languages
- [ ] Localize themed content (Business)
- [ ] Professional review of all translations

### Phase 5: Polish & Launch (Week 13-14)
- [ ] SEO implementation (hreflang, meta)
- [ ] URL routing finalization
- [ ] Performance optimization (lazy loading)
- [ ] Documentation and handoff

---

## Part 10: Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Language adoption | 30% non-English within 6 months | Analytics: language param |
| Completion rate | Same as English baseline | Lesson completion by language |
| Translation quality | <5% reported issues | User feedback, support tickets |
| SEO traffic | +20% organic from EU | Google Analytics by country |
| Retention | Equal across languages | Cohort analysis by language |

---

## Appendix A: Special Character Reference

| Language | Special Characters | Keyboard Notes |
|----------|-------------------|----------------|
| German | ä ö ü ß Ä Ö Ü | ß is unique to German |
| French | é è ê ë à â ç ù û ô î ï | Accents on vowels + ç |
| Spanish | ñ á é í ó ú ü ¿ ¡ | ñ is unique, inverted punctuation |
| Portuguese | ã õ á é í ó ú â ê ô ç | Tildes (ã, õ) are unique |
| Italian | à è é ì ò ù | Grave accents predominant |

---

## Appendix B: Keyboard Layout Keys

### QWERTZ (German)
```
Q W E R T Z U I O P Ü
A S D F G H J K L Ö Ä
Y X C V B N M
```

### AZERTY (French)
```
A Z E R T Y U I O P
Q S D F G H J K L M
W X C V B N
```

---

## Appendix C: Example Language Switcher Component

```tsx
function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pixel-btn"
      >
        {LANGUAGES[language].flag} {LANGUAGES[language].nativeName}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 pixel-box">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 ${
                lang === language ? 'bg-accent-cyan' : ''
              }`}
            >
              {LANGUAGES[lang].flag} {LANGUAGES[lang].nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Summary

This PRP outlines a comprehensive internationalization strategy that:

1. **Separates concerns**: UI strings vs. lesson content vs. word lists
2. **Respects language nuances**: Native content for beginners, adapted content for advanced
3. **Integrates with existing systems**: Keyboard layouts, user profiles, progress tracking
4. **Scales progressively**: Start with German, expand to others
5. **Maintains quality**: AI-assisted drafts + professional review
6. **Optimizes for SEO**: Proper URL structure and meta tags

The hybrid approach for lessons ensures users get a native typing experience while minimizing the content creation burden for themed/advanced lessons.
