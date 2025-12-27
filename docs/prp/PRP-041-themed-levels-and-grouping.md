# PRP-041: Themed Levels & Premium Grouping

## Status: Implemented

## Summary

Restructure TypeBit8's level system into three distinct tiers with visual grouping, adding themed typing content (AI prompts, coding, business) for advanced users. Premium and themed levels are collapsed into marketing-focused placeholders that drive conversion.

**Key Value Proposition**: The themed "Speed of Thought" levels (31-50) deliver a dual benefit:
1. **Master typing speed** through real-world content practice
2. **Learn expert prompting techniques** by typing proven prompt patterns

Users don't just get faster at typing - they internalize the structure and language of effective AI prompts, code patterns, and professional communication through muscle memory. Type it enough times, and you'll never forget how to write a great prompt.

## Problem Statement

Currently:
- 30 levels all displayed in a flat list
- Premium levels (10-30) shown individually with lock icons - cluttered
- No differentiated content themes - all generic typing exercises
- Missed opportunity to market premium value
- No "aspirational" content showing what advanced typing enables
- No connection to real-world typing use cases

## Goals

1. **Restructure levels** into clear tiers (Free → Premium → Themed)
2. **Collapse premium/themed sections** into compelling marketing placeholders
3. **Add themed content** relevant to real typing use cases
4. **Drive premium conversion** through visible value proposition
5. **Language-aware content** matching user's keyboard layout
6. **Position typing as a skill** that enables faster AI interaction
7. **Teach prompting through practice** - users learn expert prompt patterns by typing them repeatedly
8. **Ultimate efficiency gains** - faster typing + better prompts = 10x productivity with AI

## Non-Goals

- Changing the core typing mechanics
- Building a full content management system
- Real-time AI-generated content (static curated content)
- Mobile typing experience

## Level Structure

### Tier Overview

```
┌─────────────────────────────────────────────────────────────┐
│  LEVELS 1-9: FREE BASICS                                    │
│  ├── Home Row (1-3)                                         │
│  ├── Top Row (4-6)                                          │
│  ├── Bottom Row (7-8)                                       │
│  └── Numbers & Symbols (9)                                  │
├─────────────────────────────────────────────────────────────┤
│  LEVELS 10-30: PREMIUM MASTERY                    [LOCKED]  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔒 UNLOCK 21 ADVANCED LEVELS                           ││
│  │                                                          ││
│  │  • Advanced finger training                              ││
│  │  • Speed building exercises                              ││
│  │  • Accuracy challenges                                   ││
│  │  • Real-world text practice                              ││
│  │                                                          ││
│  │  [UPGRADE TO PREMIUM - $X/month]                         ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  LEVELS 31-50: THEMED MASTERY                     [LOCKED]  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ⚡ TYPE AT THE SPEED OF THOUGHT                        ││
│  │                                                          ││
│  │  Unlock the secrets of expert prompting while           ││
│  │  mastering lightning-fast typing. Learn by doing:       ││
│  │                                                          ││
│  │  • 🤖 AI Prompts - Master ChatGPT/Claude techniques     ││
│  │  • 💻 Developer - Code patterns & terminal fluency      ││
│  │  • 📧 Business - Professional communication             ││
│  │  • 🔮 More themes coming: Legal, Medical, Academic      ││
│  │                                                          ││
│  │  Type it. Learn it. Never forget it.                    ││
│  │                                                          ││
│  │  [INCLUDED WITH PREMIUM]                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Detailed Level Breakdown

| Range | Tier | Content | Access |
|-------|------|---------|--------|
| 1-9 | Free Basics | Current home/top/bottom row + numbers | Free (sign-up for 3-9) |
| 10-30 | Premium Mastery | Advanced patterns, speed building, mixed content | Premium |
| 31-35 | AI Prompts Theme | ChatGPT/Claude prompts, AI interactions | Premium |
| 36-40 | Developer Theme | Code snippets, terminal commands, configs | Premium |
| 41-45 | Business Theme | Emails, Slack messages, meeting notes | Premium |
| 46-50 | Mixed/Expert | Combined themes, speed challenges | Premium |

## Themed Content Examples

### AI Prompts Theme (Levels 31-35)

```
Level 31: Basic Prompts
- "Explain this concept in simple terms"
- "Write a summary of the following text"
- "Create a list of 5 ideas for"

Level 32: Advanced Prompts
- "Act as a senior software engineer and review this code"
- "Write a professional email declining the meeting politely"
- "Create a marketing plan for a B2B SaaS startup"

Level 33: System Prompts
- "You are a helpful assistant that specializes in"
- "Respond in JSON format with the following structure"
- "Think step by step and show your reasoning"

Level 34: Multi-turn Conversations
- "Based on our previous discussion about"
- "Can you modify the previous response to include"
- "Let me provide more context about the requirements"

Level 35: Power User Prompts
- "Generate a comprehensive analysis comparing"
- "Create a detailed implementation plan with milestones"
- "Write production-ready code with error handling for"
```

### Developer Theme (Levels 36-40)

```
Level 36: Variables & Functions
- "const handleSubmit = async (event) => {"
- "function calculateTotal(items: Item[]): number"
- "export default function HomePage() {"

Level 37: Terminal Commands
- "git commit -m 'feat: add user authentication'"
- "npm install --save-dev @types/react"
- "docker-compose up -d --build"

Level 38: Common Patterns
- "if (error) { console.error(error); return; }"
- "const [state, setState] = useState<T | null>(null)"
- "try { await fetchData() } catch (e) { handleError(e) }"

Level 39: API & Config
- '"Authorization": `Bearer ${token}`'
- "process.env.NEXT_PUBLIC_API_URL"
- "export const config = { runtime: 'edge' }"

Level 40: Code Reviews
- "// TODO: Refactor this to use a more efficient algorithm"
- "/* This handles the edge case where user is not authenticated */"
- "/** @param {string} userId - The unique identifier */"
```

### Business Theme (Levels 41-45)

```
Level 41: Email Openers
- "I hope this email finds you well."
- "Thank you for your prompt response."
- "Following up on our conversation yesterday,"

Level 42: Slack/Teams Messages
- "Hey team, quick update on the project status:"
- "@channel Please review the attached document by EOD"
- "Thanks for flagging this! I'll look into it right away."

Level 43: Meeting Notes
- "Action items from today's standup:"
- "Decision: We will proceed with Option B"
- "Next steps: John to provide estimates by Friday"

Level 44: Professional Requests
- "Would you be available for a quick sync this week?"
- "I'd appreciate your input on this proposal."
- "Please let me know if you need any additional information."

Level 45: Formal Communication
- "Per our agreement dated January 15th, 2025,"
- "We are pleased to inform you that your application"
- "This serves as official confirmation of"
```

## Language-Aware Content

Match content language to detected keyboard layout:

| Keyboard | Language | Content Adaptation |
|----------|----------|-------------------|
| QWERTY | English | Default English content |
| QWERTZ-DE | German | German sentences, ä ö ü ß practice |
| QWERTZ-CH | Swiss German | German + French loanwords |
| AZERTY | French | French sentences, é è ç à practice |

### German AI Prompts Example (QWERTZ)
```
"Erkläre mir dieses Konzept in einfachen Worten"
"Schreibe eine professionelle E-Mail auf Deutsch"
"Fasse den folgenden Text in drei Sätzen zusammen"
```

## UI Design

### Collapsed Premium Section

```
┌────────────────────────────────────────────────────────────────┐
│  ⭐ PREMIUM LEVELS 10-30                                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     🔒 UNLOCK 21 ADVANCED LEVELS                         │  │
│  │                                                          │  │
│  │     Master advanced typing patterns and                  │  │
│  │     build your speed to 80+ WPM                          │  │
│  │                                                          │  │
│  │     ✓ Advanced finger training                           │  │
│  │     ✓ Speed building exercises                           │  │
│  │     ✓ Real-world text practice                           │  │
│  │     ✓ Accuracy challenges                                │  │
│  │                                                          │  │
│  │     ┌──────────────────────────────────────────────┐     │  │
│  │     │  👑 UPGRADE TO PREMIUM                       │     │  │
│  │     │      $4.99/month                             │     │  │
│  │     └──────────────────────────────────────────────┘     │  │
│  │                                                          │  │
│  │     [Preview Levels ▼]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Collapsed Themed Section

```
┌────────────────────────────────────────────────────────────────┐
│  ⚡ THEMED LEVELS 31-50                                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     ⚡ TYPE AT THE SPEED OF THOUGHT                      │  │
│  │                                                          │  │
│  │     Unlock the secrets of outstanding prompting          │  │
│  │     while building lightning-fast typing skills.         │  │
│  │                                                          │  │
│  │     Learn expert techniques through muscle memory:       │  │
│  │                                                          │  │
│  │     🤖 AI PROMPTS        💻 DEVELOPER                    │  │
│  │     Master ChatGPT &     Code patterns,                  │  │
│  │     Claude techniques    terminal fluency                │  │
│  │                                                          │  │
│  │     📧 BUSINESS          🔮 COMING SOON                  │  │
│  │     Professional         Legal, Medical,                 │  │
│  │     communication        Academic themes                 │  │
│  │                                                          │  │
│  │     ─────────────────────────────────────────────        │  │
│  │     "Type it. Learn it. Never forget it."                │  │
│  │     Ultimate efficiency: Faster typing + Better prompts  │  │
│  │     ─────────────────────────────────────────────        │  │
│  │                                                          │  │
│  │     ┌──────────────────────────────────────────────┐     │  │
│  │     │  ⚡ INCLUDED WITH PREMIUM                    │     │  │
│  │     └──────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Expanded View (Premium Users)

Premium users see levels in a collapsible accordion:

```
▼ PREMIUM LEVELS 10-30
  ├── Level 10: Advanced Home Row
  ├── Level 11: Speed Drills I
  ├── Level 12: ...
  └── [Show More]

▼ THEMED: AI PROMPTS (31-35)
  ├── Level 31: Basic Prompts
  ├── Level 32: Advanced Prompts
  └── ...

▶ THEMED: DEVELOPER (36-40) [collapsed]

▶ THEMED: BUSINESS (41-45) [collapsed]
```

## The Dual Learning Advantage

### Why This Works

Traditional typing courses teach you to type random text. TypeBit8's themed levels teach you **two skills simultaneously**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DUAL LEARNING MODEL                          │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │  SKILL 1:       │         │  SKILL 2:       │              │
│   │  TYPING SPEED   │    +    │  DOMAIN         │              │
│   │  & ACCURACY     │         │  EXPERTISE      │              │
│   └────────┬────────┘         └────────┬────────┘              │
│            │                           │                        │
│            └───────────┬───────────────┘                        │
│                        ▼                                        │
│            ┌─────────────────────┐                              │
│            │  MUSCLE MEMORY      │                              │
│            │  Type it enough,    │                              │
│            │  you'll never       │                              │
│            │  forget it          │                              │
│            └─────────────────────┘                              │
│                        │                                        │
│                        ▼                                        │
│            ┌─────────────────────┐                              │
│            │  ULTIMATE           │                              │
│            │  EFFICIENCY         │                              │
│            │  10x productivity   │                              │
│            │  with AI tools      │                              │
│            └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Learning Outcomes by Theme

| Theme | Typing Benefit | Knowledge Benefit |
|-------|---------------|-------------------|
| **AI Prompts** | Fast prompt entry | Expert prompting patterns, chain-of-thought, system prompts |
| **Developer** | Code fluency, special chars | Common patterns, best practices, terminal mastery |
| **Business** | Professional speed | Email etiquette, meeting notes, Slack culture |

### The Science

- **Spaced repetition**: Each level repeats key phrases multiple times
- **Muscle memory**: Typing ingrains patterns deeper than reading
- **Active learning**: You're not passively consuming - you're doing
- **Context switching**: Themed content keeps practice engaging

## Marketing Integration

### Landing Page Updates

Add section after hero:

```
┌──────────────────────────────────────────────────────────┐
│       LEARN TWO SKILLS AT ONCE                           │
│                                                          │
│   Master typing speed WHILE learning:                    │
│                                                          │
│   🤖 Expert AI prompting techniques                      │
│   💻 Professional coding patterns                        │
│   📧 Business communication                              │
│                                                          │
│   "Type it. Learn it. Never forget it."                  │
│                                                          │
│   ┌────────────────────────────────────────────────┐     │
│   │  ⚡ UNLOCK SPEED OF THOUGHT TYPING             │     │
│   └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### Sign-Up Page

Show theme selector during onboarding:

```
WHAT DO YOU WANT TO MASTER?

[ ] 🤖 AI Prompting (Learn ChatGPT/Claude techniques while typing)
[ ] 💻 Developer Skills (Master code patterns through practice)
[ ] 📧 Professional Writing (Perfect business communication)
[ ] 📚 General Typing (Classic typing course)

→ We'll unlock the secrets of your chosen domain
  while building your typing speed to 80+ WPM
```

### Premium Checkout Page

Highlight themed content as premium value:

```
PREMIUM INCLUDES:

⚡ THE SPEED OF THOUGHT PACKAGE

✓ Levels 10-30: Advanced Typing Mastery
  Build speed to 80+ WPM with advanced exercises

✓ Levels 31-50: Themed Learning
  Unlock expert knowledge WHILE perfecting your typing:

  🤖 AI PROMPTS (Levels 31-35)
     • Master ChatGPT & Claude prompting techniques
     • Learn chain-of-thought, system prompts, few-shot
     • Type prompts at the speed of thought

  💻 DEVELOPER (Levels 36-40)
     • Code patterns burned into muscle memory
     • Terminal commands you'll never forget
     • Special characters & syntax fluency

  📧 BUSINESS (Levels 41-45)
     • Professional email templates
     • Slack & meeting note patterns
     • Executive communication style

  🔮 NEW THEMES MONTHLY
     • Legal, Medical, Academic coming soon

✓ Leaderboards & Achievements
✓ Custom Avatars & Skins
```

## Data Model Changes

### New Level Fields

```typescript
interface Level {
  id: number;
  title: string;
  tier: 'free' | 'premium' | 'themed';
  theme?: 'ai-prompts' | 'developer' | 'business' | 'legal' | 'medical';
  language: 'en' | 'de' | 'fr' | 'multi';
  sentences: string[];
  // ... existing fields
}
```

### User Preferences

```typescript
interface UserPreferences {
  preferredTheme?: string;  // From onboarding
  language: string;         // From keyboard detection
}
```

## Implementation Phases

### Phase 1: Level Grouping UI
- Implement collapsed/expanded level groups
- Add marketing placeholders for locked sections
- Update level select screen

### Phase 2: Premium Levels 10-30 Content
- Create/curate advanced typing content
- Add difficulty progression
- Speed building exercises

### Phase 3: Themed Content (31-50)
- AI Prompts theme (31-35)
- Developer theme (36-40)
- Business theme (41-45)
- Expert mixed (46-50)

### Phase 4: Language Localization
- German content for QWERTZ users
- French content for AZERTY users
- Content selection based on keyboard

### Phase 5: Marketing Integration
- Update landing page
- Add theme selector to sign-up
- Update premium checkout messaging

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Premium conversion (level view) | +20% | Users clicking upgrade from collapsed section |
| Level completion rate | +15% | Users finishing themed levels |
| User engagement (themes) | 60%+ | Users selecting a preferred theme |
| Retention (themed users) | +25% | D7 retention for users in themed levels |

## Open Questions

1. Should themes be locked by progress or selectable from start (for premium)?
2. How many sentences per themed level? (Currently ~50 per regular level)
3. Should we allow theme mixing/custom playlists?
4. Pricing: Include themes in current premium or separate "Pro" tier?

## Appendix: Content Volume Estimate

| Theme | Levels | Sentences/Level | Total Sentences |
|-------|--------|-----------------|-----------------|
| AI Prompts | 5 | 40 | 200 |
| Developer | 5 | 40 | 200 |
| Business | 5 | 40 | 200 |
| Expert Mix | 5 | 40 | 200 |
| **Total New** | 20 | - | **800 sentences** |
