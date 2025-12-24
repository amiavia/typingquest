# PRP-002: Full App Localization

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 6 phases, ~50 tasks

---

## Executive Summary

Fully localize TypeBit8 into 5 languages: English (en), German (de), French (fr), Italian (it), and Spanish (es). This includes UI translations, legal pages, and ensuring word databases exist for all supported languages.

## Current State
- i18next and react-i18next already installed
- Partial locale files exist for en, de, fr (~238 keys each)
- Many UI strings are still hardcoded in components
- Missing: Italian and Spanish locale files
- Missing: Legal pages, auth UI, home page, leaderboard translations

## Languages & Locales

| Language | Code | Keyboard Layout | Word Database |
|----------|------|-----------------|---------------|
| English | en | qwerty-us, qwerty-uk | en |
| German | de | qwertz-de, qwertz-ch | de |
| French | fr | azerty-fr, azerty-be | fr |
| Italian | it | qwerty-it | it |
| Spanish | es | qwerty-es | es |

---

## Phase 1: Complete Existing Translations

### 1.1 Add Missing Keys to en.json (source of truth)

**Auth & User UI:**
```json
"auth": {
  "signIn": "Sign In",
  "signOut": "Sign Out",
  "signUp": "Sign Up",
  "guest": "Guest",
  "manageAccount": "Manage Account",
  "guestBanner": {
    "title": "Playing as Guest",
    "message": "Sign in to save your progress and compete on leaderboards",
    "signInButton": "Sign In to Save Progress"
  },
  "migration": {
    "title": "Save Data Found!",
    "message": "We found existing progress on this device. Would you like to sync it to your account?",
    "syncButton": "Sync It",
    "startFresh": "Start Fresh",
    "level": "Level",
    "cleared": "Cleared",
    "coins": "Coins"
  }
}
```

**Home Page:**
```json
"home": {
  "hero": {
    "title1": "LEARN TO TYPE WITH",
    "title2": "ALL 10 FINGERS"
  },
  "stats": {
    "levels": "LEVELS",
    "cleared": "CLEARED",
    "bestCombo": "BEST COMBO",
    "complete": "COMPLETE"
  },
  "keyboard": {
    "placeFingers": "PLACE FINGERS ON HOME ROW TO BEGIN"
  },
  "howToPlay": {
    "title": "HOW TO PLAY",
    "step1Title": "LEARN",
    "step1Desc": "EACH LEVEL TEACHES NEW KEYS AND FINGER POSITIONS",
    "step2Title": "BATTLE",
    "step2Desc": "TYPE FAST AND BUILD COMBOS TO DEFEAT THE BOSS",
    "step3Title": "VICTORY",
    "step3Desc": "EARN XP, COINS AND UNLOCK NEW LEVELS"
  },
  "levelSelect": {
    "title": "SELECT LEVEL"
  }
}
```

**Header/HUD:**
```json
"hud": {
  "level": "LEVEL",
  "xp": "XP",
  "coins": "Coins",
  "masterTheKeyboard": "MASTER THE KEYBOARD"
}
```

**Leaderboard:**
```json
"leaderboard": {
  "title": "LEADERBOARD",
  "global": "GLOBAL",
  "level": "LEVEL",
  "players": "PLAYERS",
  "noScores": "NO SCORES YET",
  "beFirst": "BE THE FIRST TO SET A RECORD!",
  "you": "YOU",
  "wpm": "WPM",
  "signInCta": "SIGN IN TO JOIN THE LEADERBOARD"
}
```

**Legal Pages:**
```json
"legal": {
  "impressum": {
    "title": "IMPRESSUM",
    "contactAddress": "CONTACT ADDRESS",
    "tradeRegister": "TRADE REGISTER ENTRY",
    "registeredCompany": "Registered Company",
    "registerOffice": "Commercial Register Office",
    "copyright": "COPYRIGHT",
    "copyrightText": "The copyright and all other rights...",
    "disclaimer": "DISCLAIMER",
    "disclaimerText": "All information on our website..."
  },
  "privacy": {
    "title": "PRIVACY POLICY",
    "lastUpdated": "Last updated",
    "sections": {
      "introduction": "INTRODUCTION",
      "dataCollection": "INFORMATION WE COLLECT",
      "dataUsage": "HOW WE USE YOUR INFORMATION",
      "dataSecurity": "DATA STORAGE AND SECURITY",
      "dataSharing": "DATA SHARING",
      "yourRights": "YOUR RIGHTS",
      "cookies": "COOKIES AND LOCAL STORAGE",
      "children": "CHILDREN'S PRIVACY",
      "changes": "CHANGES TO THIS POLICY",
      "contact": "CONTACT US"
    }
  },
  "terms": {
    "title": "TERMS OF SERVICE",
    "sections": {
      "acceptance": "ACCEPTANCE OF TERMS",
      "description": "DESCRIPTION OF SERVICE",
      "accounts": "USER ACCOUNTS",
      "acceptableUse": "ACCEPTABLE USE",
      "ip": "INTELLECTUAL PROPERTY",
      "userContent": "USER CONTENT",
      "warranty": "DISCLAIMER OF WARRANTIES",
      "liability": "LIMITATION OF LIABILITY",
      "modifications": "MODIFICATIONS TO SERVICE",
      "law": "GOVERNING LAW",
      "contact": "CONTACT"
    }
  },
  "footer": {
    "copyright": "TYPEBIT8",
    "tagline": "PRACTICE DAILY FOR BEST RESULTS",
    "operator": "OPERATED BY STEININGER AG, ZUG, SWITZERLAND"
  }
}
```

**Lesson View:**
```json
"lessonView": {
  "back": "BACK",
  "missionBriefing": "MISSION BRIEFING",
  "keysToMaster": "KEYS TO MASTER",
  "targetWpm": "TARGET WPM",
  "accuracy": "ACCURACY",
  "stages": "STAGES",
  "startMission": "START MISSION",
  "stage": "STAGE",
  "levelComplete": "LEVEL COMPLETE!",
  "xpEarned": "XP EARNED",
  "speed": "SPEED",
  "hitRate": "HIT RATE",
  "retryLevel": "RETRY LEVEL",
  "nextLevel": "NEXT LEVEL"
}
```

**Quiz:**
```json
"quizView": {
  "bossApproaching": "BOSS APPROACHING",
  "bossName": "KEYBOARD GUARDIAN",
  "defeat": "DEFEAT THE BOSS BY TYPING ACCURATELY!",
  "bossHealth": "BOSS HP",
  "yourHealth": "YOUR HP",
  "victory": "VICTORY!",
  "defeat": "DEFEATED",
  "bossDefeated": "You defeated the",
  "tryAgain": "The boss was too strong. Keep practicing!",
  "rewards": "REWARDS",
  "backToPractice": "BACK TO PRACTICE",
  "claimRewards": "CLAIM REWARDS"
}
```

### 1.2 Update App Title
Change "Type Quest" to "TypeBit8" in all locale files.

---

## Phase 2: Create Italian & Spanish Locale Files

### 2.1 Create `src/i18n/locales/it.json`
Full Italian translation of all keys.

### 2.2 Create `src/i18n/locales/es.json`
Full Spanish translation of all keys.

### 2.3 Update i18n Configuration
```typescript
// src/i18n/index.ts
import it from './locales/it.json';
import es from './locales/es.json';

export const resources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  it: { translation: it },
  es: { translation: es },
} as const;
```

---

## Phase 3: Refactor Components to Use i18n

### 3.1 Components to Update

| Component | Hardcoded Strings | Priority |
|-----------|-------------------|----------|
| App.tsx | Header, footer, hero, how-to-play | High |
| LessonView.tsx | All lesson UI text | High |
| Quiz.tsx | Boss battle UI | High |
| LegalPage.tsx | All legal content | Medium |
| Leaderboard.tsx | Rankings, CTAs | Medium |
| GuestBanner.tsx | Guest mode messaging | Medium |
| MigrationModal.tsx | Migration prompts | Medium |
| UserButton.tsx | Sign in/out labels | Medium |
| LayoutSelector.tsx | Layout picker UI | Low |
| LayoutDetector.tsx | Detection prompts | Low |
| Keyboard.tsx | Finger labels | Low |

### 3.2 Pattern to Follow
```tsx
// Before
<h1>LEARN TO TYPE WITH</h1>

// After
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('home.hero.title1')}</h1>;
}
```

---

## Phase 4: Language Selector & Persistence

### 4.1 Add Language Selector to Header
- Dropdown with flag icons: 🇺🇸 🇩🇪 🇫🇷 🇮🇹 🇪🇸
- Persist selection to localStorage
- Auto-detect browser language on first visit

### 4.2 Update LanguageSelector Component
```tsx
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];
```

### 4.3 Browser Language Detection
```typescript
const browserLang = navigator.language.split('-')[0];
const supportedLangs = ['en', 'de', 'fr', 'it', 'es'];
const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
```

---

## Phase 5: Word Database Localization

### 5.1 Current State
Word databases exist for practice words in multiple languages.

### 5.2 Ensure Word Databases Exist
- `src/data/wordDatabases/en.ts` ✓
- `src/data/wordDatabases/de.ts` ✓
- `src/data/wordDatabases/fr.ts` ✓
- `src/data/wordDatabases/it.ts` (create if missing)
- `src/data/wordDatabases/es.ts` (create if missing)

### 5.3 Link UI Language to Word Language
Option in settings to either:
- Auto-match practice words to UI language
- Allow independent selection (current behavior)

---

## Phase 6: Legal Pages Localization

### 6.1 Restructure LegalPage Component
Move hardcoded legal text to translation files.

### 6.2 Legal Content by Language

| Section | Considerations |
|---------|----------------|
| Impressum | Same for all (company in Switzerland) |
| Privacy Policy | Translate, keep GDPR references |
| Terms of Service | Translate, Swiss law applies to all |

### 6.3 Date Formatting
Use locale-aware date formatting:
```typescript
new Date().toLocaleDateString(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

---

## Implementation Order

1. **Phase 1** - Add missing keys to en.json (source of truth)
2. **Phase 2** - Create it.json and es.json
3. **Phase 3** - Refactor high-priority components (App, LessonView, Quiz)
4. **Phase 4** - Add language selector to header
5. **Phase 3 cont.** - Refactor medium-priority components
6. **Phase 5** - Verify word databases
7. **Phase 6** - Localize legal pages
8. **Phase 3 cont.** - Refactor low-priority components
9. **Testing** - Test all languages end-to-end

---

## File Structure (After Implementation)

```
src/i18n/
├── index.ts                 # i18n configuration
└── locales/
    ├── en.json              # English (source of truth)
    ├── de.json              # German
    ├── fr.json              # French
    ├── it.json              # Italian (new)
    └── es.json              # Spanish (new)
```

---

## Translation Key Count Estimate

| Category | Keys | Notes |
|----------|------|-------|
| Existing | ~238 | Already translated (en, de, fr) |
| Auth/User | ~15 | New keys |
| Home Page | ~20 | New keys |
| Leaderboard | ~10 | New keys |
| Legal Pages | ~50 | New keys (long text) |
| Lesson View | ~15 | New keys |
| Quiz/Boss | ~15 | New keys |
| **Total** | **~363** | Per language |

---

## Quality Assurance

### Translation Review
- Native speaker review for each language
- Context-aware translations (gaming terminology)
- Consistent tone (retro/pixel art game feel)

### Testing Checklist
- [ ] All strings display correctly (no missing keys)
- [ ] Text fits in UI containers (German tends to be longer)
- [ ] Special characters render correctly (ä, ö, ü, é, è, ñ, etc.)
- [ ] Language persists across sessions
- [ ] Browser language auto-detection works
- [ ] Legal pages are complete in all languages
- [ ] Date/number formatting is locale-aware

---

## Notes

- **App name "TypeBit8"** stays the same in all languages (brand name)
- **Keyboard layout names** (QWERTY, AZERTY, etc.) are universal
- **Game terms** (XP, WPM, Level) can stay in English or be translated per preference
- **Swiss company address** in Impressum is the same for all languages
