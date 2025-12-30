# PRP-047: Internationalization (i18n) Strategy

**Status:** Draft
**Created:** 2025-12-31
**Author:** Claude + Anton
**Priority:** High
**Estimated Effort:** Medium-Large

---

## 1. Executive Summary

TypeBit8 will expand to 6 languages to capture European and Latin American markets. This PRP outlines the complete internationalization strategy including technical implementation, content translation, SEO optimization, and keyboard layout support.

### Target Languages

| Language | Code | Markets | Speakers | Priority |
|----------|------|---------|----------|----------|
| German | `de` | Germany, Austria, Switzerland | 100M+ | P0 (Home market) |
| French | `fr` | France, Belgium, Switzerland, Quebec, Africa | 300M+ | P0 (Home market) |
| Italian | `it` | Italy, Switzerland | 65M+ | P1 (Home market) |
| Spanish | `es` | Spain, Latin America | 500M+ | P1 (Huge market) |
| Portuguese | `pt` | Brazil, Portugal | 260M+ | P2 (Large market) |
| English | `en` | Global (default) | 1.5B+ | P0 (Current) |

---

## 2. Business Case

### 2.1 Why Internationalization?

**Current Problem:**
- Traffic from India (price-sensitive, low conversion)
- Paid ads with 0% retention
- Based in Switzerland but only serving English speakers

**Opportunity:**
- Switzerland alone has 4 official languages - untapped home market
- European markets have high purchasing power
- Spanish/Portuguese opens Latin America (500M+ potential users)
- Typing tutors are language-specific - huge SEO opportunity

### 2.2 Expected Impact

| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| Organic traffic | ~300/month | 2,000+/month |
| Markets served | 1 | 6 |
| Conversion rate | 0% | 2-4% |
| Swiss market share | ~0% | 5-10% |

### 2.3 Competitive Advantage

Most typing tutors are English-only or have poor localization. TypeBit8 can dominate non-English markets by offering:
- Native language UI
- Proper keyboard layout support (QWERTZ, AZERTY, etc.)
- Culturally relevant typing content
- Regional pricing

---

## 3. Technical Architecture

### 3.1 URL Structure

**Recommended: Subdirectory approach**

```
typebit8.com/          → English (default)
typebit8.com/de/       → German
typebit8.com/fr/       → French
typebit8.com/it/       → Italian
typebit8.com/es/       → Spanish
typebit8.com/pt/       → Portuguese
```

**Why subdirectories over subdomains:**
- Single domain authority (better SEO)
- Easier to manage
- Shared analytics
- One SSL certificate
- Simpler deployment

### 3.2 i18n Library Setup

**Recommended: react-i18next**

```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Directory Structure:**
```
src/
├── locales/
│   ├── en/
│   │   ├── common.json      # Shared UI strings
│   │   ├── landing.json     # Landing page
│   │   ├── app.json         # App UI
│   │   ├── lessons.json     # Lesson metadata
│   │   └── emails.json      # Email templates
│   ├── de/
│   │   └── ... (same structure)
│   ├── fr/
│   ├── it/
│   ├── es/
│   └── pt/
├── i18n/
│   └── config.ts            # i18n configuration
```

**i18n Configuration:**
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const supportedLanguages = ['en', 'de', 'fr', 'it', 'es', 'pt'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,

    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

### 3.3 Routing Setup

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { supportedLanguages } from './i18n/config';

// Generate routes for all languages
const languageRoutes = supportedLanguages.flatMap((lang) => [
  {
    path: lang === 'en' ? '/' : `/${lang}`,
    element: <LandingPage />,
  },
  {
    path: lang === 'en' ? '/premium' : `/${lang}/premium`,
    element: <PremiumPage />,
  },
  {
    path: lang === 'en' ? '/app/*' : `/${lang}/app/*`,
    element: <AppRoutes />,
  },
]);

export const router = createBrowserRouter(languageRoutes);
```

### 3.4 Language Switcher Component

```typescript
// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { supportedLanguages } from '../i18n/config';

const languageNames: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (newLang: string) => {
    const currentLang = i18n.language;
    let newPath = location.pathname;

    // Remove current language prefix
    if (currentLang !== 'en') {
      newPath = newPath.replace(`/${currentLang}`, '');
    }

    // Add new language prefix
    if (newLang !== 'en') {
      newPath = `/${newLang}${newPath || '/'}`;
    }

    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="language-switcher"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {languageNames[lang]}
        </option>
      ))}
    </select>
  );
}
```

---

## 4. SEO Implementation

### 4.1 Hreflang Tags

**Critical for avoiding duplicate content penalties:**

```typescript
// src/components/SEOHead.tsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n/config';

export function SEOHead({ pagePath }: { pagePath: string }) {
  const { i18n } = useTranslation();
  const baseUrl = 'https://typebit8.com';

  return (
    <Helmet>
      {/* Current page language */}
      <html lang={i18n.language} />

      {/* Hreflang tags for all languages */}
      {supportedLanguages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}${lang === 'en' ? '' : `/${lang}`}${pagePath}`}
        />
      ))}

      {/* x-default for language selection page */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}${pagePath}`}
      />
    </Helmet>
  );
}
```

### 4.2 Localized Meta Tags

```typescript
// src/locales/de/landing.json
{
  "meta": {
    "title": "TypeBit8 - Kostenloser Schreibtrainer mit Retro-Gaming Feeling",
    "description": "Lerne Tippen mit TypeBit8! Unser gamifizierter Schreibtrainer macht das 10-Finger-System lernen zum Spiel. Kostenlos starten!",
    "keywords": "Schreibtrainer, Tippen lernen, 10-Finger-System, Tastaturkurs, kostenlos"
  }
}
```

### 4.3 Target Keywords by Language

| Language | Primary Keywords | Search Volume |
|----------|-----------------|---------------|
| **German** | Schreibtrainer, Tippen lernen, 10-Finger-System, Tastaturkurs | 30K+/month |
| **French** | Apprendre à taper, Cours de dactylographie, Clavier AZERTY | 20K+/month |
| **Spanish** | Mecanografía, Aprender a escribir rápido, Curso de teclado | 50K+/month |
| **Italian** | Corso di dattilografia, Imparare a scrivere veloce | 10K+/month |
| **Portuguese** | Curso de digitação, Aprender a digitar, Datilografia | 40K+/month |

---

## 5. Keyboard Layout Support

### 5.1 Overview

**Critical for a typing tutor - each language has different keyboard layouts!**

| Language | Layout | Key Differences |
|----------|--------|-----------------|
| English | QWERTY | Standard |
| German | QWERTZ | Z/Y swapped, ä ö ü ß |
| French | AZERTY | A/Q, Z/W swapped, accents |
| Italian | QWERTY | Similar to English, accents |
| Spanish | QWERTY | ñ, accents |
| Portuguese | QWERTY | ç, accents |

### 5.2 Keyboard Layout Configuration

```typescript
// src/config/keyboards.ts
export type KeyboardLayout = 'qwerty' | 'qwertz' | 'azerty';

export interface KeyboardConfig {
  layout: KeyboardLayout;
  specialChars: string[];
  accentChars: string[];
}

export const keyboardConfigs: Record<string, KeyboardConfig> = {
  en: {
    layout: 'qwerty',
    specialChars: [],
    accentChars: [],
  },
  de: {
    layout: 'qwertz',
    specialChars: ['ä', 'ö', 'ü', 'ß'],
    accentChars: [],
  },
  fr: {
    layout: 'azerty',
    specialChars: ['ç'],
    accentChars: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'î', 'ï', 'ô'],
  },
  it: {
    layout: 'qwerty',
    specialChars: [],
    accentChars: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
  },
  es: {
    layout: 'qwerty',
    specialChars: ['ñ', '¿', '¡'],
    accentChars: ['á', 'é', 'í', 'ó', 'ú', 'ü'],
  },
  pt: {
    layout: 'qwerty',
    specialChars: ['ç'],
    accentChars: ['á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'],
  },
};
```

### 5.3 Visual Keyboard Component Update

The on-screen keyboard must display the correct layout:

```typescript
// src/components/Keyboard/layouts/qwertz.ts
export const qwertzLayout = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß'],
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
  ['y', 'x', 'c', 'v', 'b', 'n', 'm'],
];

// src/components/Keyboard/layouts/azerty.ts
export const azertyLayout = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
  ['w', 'x', 'c', 'v', 'b', 'n'],
];
```

### 5.4 Keyboard Detection

```typescript
// src/hooks/useKeyboardLayout.ts
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keyboardConfigs, KeyboardLayout } from '../config/keyboards';

export function useKeyboardLayout() {
  const { i18n } = useTranslation();
  const [detectedLayout, setDetectedLayout] = useState<KeyboardLayout>('qwerty');

  // Get layout from language preference
  const preferredLayout = keyboardConfigs[i18n.language]?.layout || 'qwerty';

  // Optional: Detect from browser keyboard API
  useEffect(() => {
    if ('keyboard' in navigator && 'getLayoutMap' in (navigator as any).keyboard) {
      (navigator as any).keyboard.getLayoutMap().then((layoutMap: any) => {
        // Check key positions to detect layout
        const keyY = layoutMap.get('KeyY');
        const keyZ = layoutMap.get('KeyZ');

        if (keyY === 'z' && keyZ === 'y') {
          setDetectedLayout('qwertz');
        } else if (keyY === 'y' && layoutMap.get('KeyQ') === 'a') {
          setDetectedLayout('azerty');
        }
      });
    }
  }, []);

  return {
    layout: detectedLayout || preferredLayout,
    config: keyboardConfigs[i18n.language],
  };
}
```

---

## 6. Content Translation

### 6.1 Translation Scope

| Content Type | Word Count (est.) | Priority | Notes |
|--------------|-------------------|----------|-------|
| UI Strings | ~500 words | P0 | Buttons, menus, notifications |
| Landing Page | ~800 words | P0 | Marketing copy |
| Pricing Page | ~300 words | P0 | Critical for conversion |
| About Page | ~400 words | P1 | Brand story |
| Lesson Titles/Descriptions | ~1,000 words | P0 | Lesson metadata |
| Lesson Content | ~10,000 words | P1 | Typing exercises |
| Email Templates | ~600 words | P1 | Welcome, referral, etc. |
| Help/FAQ | ~1,500 words | P2 | Support content |
| **Total** | ~15,000 words | | Per language |

### 6.2 Translation Approach

**Phase 1: Machine Translation + Human Review (Fast)**
1. Use DeepL API for initial translation (best quality for European languages)
2. Native speaker review for marketing copy
3. Cost: ~$50-100/language for machine translation

**Phase 2: Professional Translation (Quality)**
1. Hire native translators for marketing copy
2. Use translation memory for consistency
3. Cost: ~$0.10-0.15/word = ~$1,500/language

**Recommended Hybrid Approach:**
- P0 content: Professional translation
- P1-P2 content: Machine translation with review

### 6.3 Translation File Structure

```json
// src/locales/de/common.json
{
  "nav": {
    "home": "Startseite",
    "lessons": "Lektionen",
    "premium": "Premium",
    "profile": "Profil",
    "settings": "Einstellungen"
  },
  "buttons": {
    "start": "Starten",
    "continue": "Weiter",
    "retry": "Nochmal",
    "next": "Nächste",
    "back": "Zurück",
    "save": "Speichern"
  },
  "stats": {
    "wpm": "WPM",
    "accuracy": "Genauigkeit",
    "time": "Zeit",
    "level": "Level",
    "xp": "XP",
    "coins": "Münzen"
  },
  "messages": {
    "levelComplete": "Level abgeschlossen!",
    "newHighScore": "Neuer Highscore!",
    "streakBonus": "Streak-Bonus!",
    "perfectAccuracy": "Perfekte Genauigkeit!"
  }
}
```

### 6.4 Lesson Content Adaptation

Typing lessons need cultural adaptation, not just translation:

```json
// src/locales/de/lessons.json
{
  "beginner": {
    "level1": {
      "title": "Die Grundstellung",
      "description": "Lerne die Grundstellung: A S D F - J K L Ö",
      "exercises": [
        "asdf jklö asdf jklö",
        "das das das das",
        "falls falls falls",
        "als als als als"
      ]
    }
  }
}
```

**Key adaptations:**
- German: Include ä, ö, ü, ß from early levels
- French: AZERTY positioning, accents
- Spanish: ñ character, accent marks
- Use common words from each language

---

## 7. Regional Pricing

### 7.1 Pricing Strategy

| Region | Monthly | Yearly | Currency | PPP Adjustment |
|--------|---------|--------|----------|----------------|
| USA/UK | $4.99 | $39.99 | USD | Baseline |
| EU (DE/FR/IT) | €4.99 | €39.99 | EUR | ~Same |
| Switzerland | CHF 4.90 | CHF 39.90 | CHF | ~Same |
| Spain | €3.99 | €29.99 | EUR | -20% |
| Brazil | R$19.90 | R$149.90 | BRL | -60% |
| Portugal | €3.99 | €29.99 | EUR | -20% |
| Mexico | MX$79 | MX$599 | MXN | -65% |

### 7.2 Implementation with Clerk Billing

```typescript
// src/config/pricing.ts
export const regionalPricing: Record<string, {
  monthly: { amount: number; currency: string; priceId: string };
  yearly: { amount: number; currency: string; priceId: string };
}> = {
  'en-US': {
    monthly: { amount: 4.99, currency: 'USD', priceId: 'price_us_monthly' },
    yearly: { amount: 39.99, currency: 'USD', priceId: 'price_us_yearly' },
  },
  'de': {
    monthly: { amount: 4.99, currency: 'EUR', priceId: 'price_eu_monthly' },
    yearly: { amount: 39.99, currency: 'EUR', priceId: 'price_eu_yearly' },
  },
  'de-CH': {
    monthly: { amount: 4.90, currency: 'CHF', priceId: 'price_ch_monthly' },
    yearly: { amount: 39.90, currency: 'CHF', priceId: 'price_ch_yearly' },
  },
  'pt-BR': {
    monthly: { amount: 19.90, currency: 'BRL', priceId: 'price_br_monthly' },
    yearly: { amount: 149.90, currency: 'BRL', priceId: 'price_br_yearly' },
  },
  // ... other regions
};
```

---

## 8. Implementation Phases

### Phase 0: Foundation (Week 1)

**Tasks:**
- [ ] Install and configure react-i18next
- [ ] Set up locale directory structure
- [ ] Create i18n configuration
- [ ] Add language detection
- [ ] Implement hreflang tags
- [ ] Create language switcher component

**Deliverables:**
- i18n infrastructure ready
- English strings extracted to JSON files

### Phase 1: German Launch (Week 2-3)

**Why German First:**
- Home market (Switzerland)
- High purchasing power
- Tests QWERTZ keyboard support
- Validates translation workflow

**Tasks:**
- [ ] Translate UI strings to German
- [ ] Translate landing page
- [ ] Translate pricing page
- [ ] Implement QWERTZ keyboard layout
- [ ] Adapt beginner lessons for German
- [ ] Add German SEO meta tags
- [ ] Update sitemap with /de/ URLs
- [ ] Test keyboard input handling

**Deliverables:**
- Fully functional German version
- typebit8.com/de/ live

### Phase 2: French + Italian (Week 4-5)

**Tasks:**
- [ ] Translate UI strings to French & Italian
- [ ] Translate marketing pages
- [ ] Implement AZERTY keyboard for French
- [ ] Adapt lessons for French (AZERTY focus)
- [ ] Adapt lessons for Italian
- [ ] Add SEO for both languages

**Deliverables:**
- typebit8.com/fr/ live
- typebit8.com/it/ live
- Full Swiss market coverage

### Phase 3: Spanish (Week 6-7)

**Tasks:**
- [ ] Translate all content to Spanish
- [ ] Add ñ and accent support
- [ ] Create Spanish-specific lesson content
- [ ] Regional pricing for Spain/LatAm
- [ ] Spanish SEO optimization

**Deliverables:**
- typebit8.com/es/ live
- Spanish market entry

### Phase 4: Portuguese (Week 8-9)

**Tasks:**
- [ ] Translate all content to Portuguese
- [ ] Brazilian Portuguese variant support
- [ ] Add ç and accent support
- [ ] Regional pricing for Brazil
- [ ] Portuguese/Brazilian SEO

**Deliverables:**
- typebit8.com/pt/ live
- Brazilian market entry

### Phase 5: Optimization (Week 10+)

**Tasks:**
- [ ] A/B test landing pages per language
- [ ] Optimize conversion per market
- [ ] Add language-specific testimonials
- [ ] Localize email sequences
- [ ] Monitor and fix translation issues
- [ ] Add more lesson content per language

---

## 9. Success Metrics

### 9.1 Traffic Metrics

| Metric | Baseline | 3-Month Target | 6-Month Target |
|--------|----------|----------------|----------------|
| German organic traffic | 0 | 500/month | 1,500/month |
| French organic traffic | 0 | 300/month | 800/month |
| Spanish organic traffic | 0 | 400/month | 1,200/month |
| Portuguese organic traffic | 0 | 300/month | 1,000/month |
| Italian organic traffic | 0 | 200/month | 500/month |

### 9.2 Conversion Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Overall conversion rate | 0% | 2-4% |
| German conversion rate | N/A | 3-5% |
| Swiss conversion rate | N/A | 4-6% |
| LatAm conversion rate | N/A | 1-2% |

### 9.3 SEO Metrics

| Metric | Target |
|--------|--------|
| Indexed pages per language | 20+ |
| Ranking keywords per language | 50+ |
| Top 10 rankings for "Schreibtrainer" | Yes |
| Top 10 rankings for "apprendre à taper" | Yes |

---

## 10. Technical Checklist

### 10.1 Infrastructure
- [ ] react-i18next installed and configured
- [ ] Locale files structured correctly
- [ ] Language detection working (path > localStorage > browser)
- [ ] Language switcher component
- [ ] URL routing for all languages
- [ ] 404 page localized

### 10.2 SEO
- [ ] Hreflang tags on all pages
- [ ] Localized meta titles and descriptions
- [ ] Sitemap includes all language URLs
- [ ] robots.txt allows all language paths
- [ ] Google Search Console set up per language
- [ ] Structured data localized

### 10.3 Keyboards
- [ ] QWERTZ layout implemented
- [ ] AZERTY layout implemented
- [ ] Special characters supported (ä, ö, ü, ß, ñ, ç, etc.)
- [ ] Accent input working
- [ ] Keyboard detection hook
- [ ] Layout selector in settings

### 10.4 Content
- [ ] UI strings translated (all languages)
- [ ] Landing page translated
- [ ] Pricing page translated
- [ ] Beginner lessons adapted
- [ ] Email templates translated
- [ ] Error messages localized

### 10.5 Testing
- [ ] RTL support (future: Arabic)
- [ ] Font rendering for special characters
- [ ] Keyboard input tested per layout
- [ ] SEO tags validated
- [ ] Mobile responsive for all languages
- [ ] Performance (lazy load locales)

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Poor translation quality | High | Professional review for marketing copy |
| Keyboard layout bugs | High | Extensive testing with native speakers |
| SEO cannibalization | Medium | Proper hreflang implementation |
| Maintenance overhead | Medium | Translation memory, consistent keys |
| Cultural insensitivity | Medium | Native speaker review |
| Increased bundle size | Low | Lazy load locale files |

---

## 12. Resources Required

### 12.1 Development
- 2-3 weeks developer time for infrastructure
- 1 week per language for content integration

### 12.2 Translation
- Machine translation: ~$50-100/language
- Professional review: ~$500-1,000/language
- Native speaker testing: ~$100-200/language

### 12.3 Ongoing
- Translation updates for new features
- SEO monitoring per language
- Customer support in major languages (or clear English fallback)

---

## 13. Swiss German Note

Swiss German (Schweizerdeutsch) is a **spoken dialect**, not a written language.

**Do NOT create a Swiss German version because:**
- Written Swiss German has no standardized spelling
- Swiss schools teach Standard German (Hochdeutsch)
- Professional/business communication uses Standard German
- A typing tutor must teach proper written language

**What to do instead:**
- Use Standard German (de) for Swiss German speakers
- Add Swiss flavor to UI (e.g., "Grüezi!" greeting)
- Include CHF pricing for Swiss users
- Consider Swiss keyboard layout (same as German QWERTZ)

---

## 14. Next Steps

1. **Approve this PRP** - Confirm scope and priority
2. **Set up i18n infrastructure** - Phase 0 tasks
3. **Extract English strings** - Prepare for translation
4. **Get German translations** - Either machine or professional
5. **Launch /de/** - First international version
6. **Iterate** - Add remaining languages

---

## Appendix A: Sample Translation Keys

```json
// Full example of common.json structure
{
  "brand": {
    "name": "TypeBit8",
    "tagline": "Level Up Your Typing"
  },
  "nav": {
    "home": "Home",
    "lessons": "Lessons",
    "premium": "Premium",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Log Out"
  },
  "cta": {
    "startFree": "Start Free",
    "getPremium": "Get Premium",
    "continueLearning": "Continue Learning",
    "tryAgain": "Try Again"
  },
  "lesson": {
    "complete": "Lesson Complete!",
    "accuracy": "Accuracy",
    "speed": "Speed",
    "time": "Time",
    "xpEarned": "XP Earned",
    "coinsEarned": "Coins Earned",
    "newRecord": "New Record!"
  },
  "premium": {
    "title": "Go Premium",
    "subtitle": "Unlock your full typing potential",
    "features": {
      "allLevels": "All 50 Levels",
      "doubleCoins": "2X Coins",
      "xpBoost": "1.5X XP",
      "noAds": "Ad-Free",
      "support": "Priority Support"
    },
    "monthly": "Monthly",
    "yearly": "Yearly",
    "save": "Save {{percent}}%"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "network": "Connection error. Check your internet.",
    "notFound": "Page not found"
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
