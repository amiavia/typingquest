# PRP-003: Predefined Avatar Selection System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 3 phases, ~25 tasks

---

## Executive Summary

This PRP introduces a predefined avatar selection system for TypeBit8. Users will be able to choose from 8 unique, professionally generated 8-bit pixel art avatars that match the retro gaming aesthetic of the app. Avatars will be generated once using Google Gemini 2.5 Flash Image API and stored as static assets, then made available for user selection.

---

## Problem Statement

### Current State

1. **No avatar system**: Users currently have no visual identity in the app
2. **Leaderboard anonymity**: All users appear the same on leaderboards
3. **Missing personalization**: No way for users to express themselves
4. **Clerk default avatars**: If using Clerk avatars, they don't match the 8-bit aesthetic

### Impact

| Issue | User Impact |
|-------|-------------|
| No avatars | Reduced sense of identity and ownership |
| Generic leaderboard | Hard to find yourself, less engaging |
| No personalization | Lower emotional connection to the app |
| Style mismatch | Clerk avatars break the retro aesthetic |

### Success Criteria

- [ ] 8 unique 8-bit avatars available for selection
- [ ] Avatars match TypeBit8's retro pixel art style
- [ ] Users can select and change their avatar
- [ ] Avatar displays in header, leaderboard, and user profile
- [ ] Avatar preference persists across sessions (Convex)

---

## Avatar Designs

### Design Principles

1. **8-bit Pixel Art Style**: Low resolution, limited color palette, chunky pixels
2. **Gaming Theme**: Characters should feel like they belong in a retro game
3. **Keyboard/Typing Theme**: Subtle references to typing, keyboards, or coding
4. **Distinct Silhouettes**: Each avatar should be recognizable at small sizes (32x32)
5. **Consistent Palette**: Use TypeBit8's color scheme as base:
   - Primary Yellow: `#ffd93d`
   - Cyan/Teal: `#3bceac`
   - Green: `#0ead69`
   - Pink: `#ff6b9d`
   - Dark Navy: `#1a1a2e`
   - Light Cream: `#eef5db`

### The 8 Avatars

| # | Name | Description | Primary Color |
|---|------|-------------|---------------|
| 1 | **Pixel Knight** | Armored warrior with keyboard shield | Yellow `#ffd93d` |
| 2 | **Code Wizard** | Hooded mage with glowing keyboard staff | Cyan `#3bceac` |
| 3 | **Speed Ninja** | Fast-typing ninja with keyboard shuriken | Pink `#ff6b9d` |
| 4 | **Robo Typer** | Retro robot with monitor face showing `:)` | Green `#0ead69` |
| 5 | **Keyboard Cat** | Cool pixel cat wearing headphones | Yellow `#ffd93d` |
| 6 | **8-Bit Hero** | Classic platformer hero with cape | Cyan `#3bceac` |
| 7 | **Arcade Ghost** | Friendly ghost (Pac-Man style) with keyboard | Pink `#ff6b9d` |
| 8 | **Dragon Coder** | Small pixel dragon breathing code/fire | Green `#0ead69` |

---

## Phase 1: Avatar Generation

### 1.1 Gemini Image Generation Script

Create a Node.js script to generate avatars using Google Gemini 2.5 Flash Image API.

**New file: `scripts/generate-avatars.ts`**

```typescript
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

interface AvatarSpec {
  id: string;
  name: string;
  prompt: string;
}

const avatars: AvatarSpec[] = [
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    prompt: `Create an 8-bit pixel art avatar of a heroic knight character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Armored warrior knight facing forward
- Helmet with T-shaped visor
- Holding a shield shaped like a keyboard/with keyboard keys pattern
- Yellow (#ffd93d) as primary armor color
- Dark navy (#1a1a2e) for outlines and shadows
- Confident, heroic pose

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Character fills ~80% of frame
- Simple, iconic, instantly recognizable silhouette`
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    prompt: `Create an 8-bit pixel art avatar of a wizard/mage character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Mysterious wizard with pointed hood/hat
- Holding a glowing staff topped with a keyboard key or @ symbol
- Flowing robe with pixel details
- Cyan/teal (#3bceac) as primary robe color
- Magical sparkles around staff (yellow #ffd93d)
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Character fills ~80% of frame
- Mystical, wise appearance`
  },
  {
    id: 'speed-ninja',
    name: 'Speed Ninja',
    prompt: `Create an 8-bit pixel art avatar of a ninja character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Agile ninja in action pose
- Mask covering lower face, visible determined eyes
- Holding keyboard-key shaped throwing stars (shuriken)
- Pink (#ff6b9d) as primary outfit color
- Speed lines or motion blur pixels behind
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Dynamic, fast-looking pose
- Sleek and cool appearance`
  },
  {
    id: 'robo-typer',
    name: 'Robo Typer',
    prompt: `Create an 8-bit pixel art avatar of a friendly robot character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Cute retro robot with boxy body
- Monitor/screen face displaying happy :) emoticon
- Antenna on head with small light
- Keyboard integrated into chest or hands
- Green (#0ead69) as primary body color
- Yellow (#ffd93d) accents and screen glow
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Friendly, approachable appearance
- Classic 80s robot aesthetic`
  },
  {
    id: 'keyboard-cat',
    name: 'Keyboard Cat',
    prompt: `Create an 8-bit pixel art avatar of a cool cat character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Stylish pixel cat with attitude
- Wearing chunky retro headphones
- Sunglasses or cool half-closed eyes
- Paws ready to type or on keyboard
- Yellow/orange (#ffd93d) fur color
- Cyan (#3bceac) headphone accents
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Cool, confident expression
- Internet meme cat energy`
  },
  {
    id: 'bit-hero',
    name: '8-Bit Hero',
    prompt: `Create an 8-bit pixel art avatar of a classic platformer hero for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Classic video game hero character
- Small cape flowing behind
- Determined heroic expression
- Fist raised or victory pose
- Cyan/teal (#3bceac) as primary outfit color
- Yellow (#ffd93d) cape or accents
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Iconic platformer hero silhouette
- Mario/Mega Man inspired but original`
  },
  {
    id: 'arcade-ghost',
    name: 'Arcade Ghost',
    prompt: `Create an 8-bit pixel art avatar of a friendly ghost character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Cute friendly ghost (Pac-Man ghost inspired but original)
- Wavy bottom edge like classic game ghosts
- Big happy eyes, maybe winking
- Holding or wearing a tiny keyboard
- Pink (#ff6b9d) as primary ghost color
- Lighter pink or white highlights
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Friendly, not scary appearance
- Playful bouncy energy`
  },
  {
    id: 'dragon-coder',
    name: 'Dragon Coder',
    prompt: `Create an 8-bit pixel art avatar of a small dragon character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Small cute pixel dragon
- Breathing fire/code symbols instead of flames
- Small wings, spiky back
- Sitting or in playful pose
- Green (#0ead69) as primary scale color
- Yellow (#ffd93d) for fire/code breath and belly
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Cute but fierce expression
- Baby dragon energy, mascot-like`
  }
];

async function generateAvatar(spec: AvatarSpec): Promise<Buffer> {
  const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: spec.prompt }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'],
        imageSizes: ['512x512']
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const imageData = data.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('image/')
  )?.inlineData?.data;

  if (!imageData) {
    throw new Error('No image in response');
  }

  return Buffer.from(imageData, 'base64');
}

async function main() {
  const outputDir = path.join(__dirname, '../public/avatars');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const avatar of avatars) {
    console.log(`Generating ${avatar.name}...`);
    try {
      const imageBuffer = await generateAvatar(avatar);
      const outputPath = path.join(outputDir, `${avatar.id}.png`);
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  Saved to ${outputPath}`);
    } catch (error) {
      console.error(`  Failed: ${error}`);
    }
  }
}

main();
```

### 1.2 Run Generation Script

```bash
# Set API key
export GEMINI_API_KEY="your-api-key-here"

# Run generation
npx tsx scripts/generate-avatars.ts
```

### 1.3 Manual Review & Touch-up

After generation:
1. Review each avatar for quality and style consistency
2. If any don't meet standards, regenerate with adjusted prompts
3. Optionally touch up in pixel art editor (Aseprite, Piskel)
4. Ensure all are exactly 512x512 PNG with transparent or dark background

---

## Phase 2: Storage & Backend

### 2.1 Static Asset Storage

Store generated avatars as static assets:

```
public/
└── avatars/
    ├── pixel-knight.png
    ├── code-wizard.png
    ├── speed-ninja.png
    ├── robo-typer.png
    ├── keyboard-cat.png
    ├── bit-hero.png
    ├── arcade-ghost.png
    └── dragon-coder.png
```

### 2.2 Avatar Metadata

**New file: `src/data/avatars.ts`**

```typescript
export interface Avatar {
  id: string;
  name: string;
  description: string;
  src: string;
  unlockLevel?: number; // Optional: some avatars require level to unlock
}

export const AVATARS: Avatar[] = [
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    description: 'Armored warrior with a keyboard shield',
    src: '/avatars/pixel-knight.png',
    unlockLevel: 1, // Available immediately
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    description: 'Mystical mage wielding keyboard magic',
    src: '/avatars/code-wizard.png',
    unlockLevel: 1,
  },
  {
    id: 'speed-ninja',
    name: 'Speed Ninja',
    description: 'Lightning-fast typing warrior',
    src: '/avatars/speed-ninja.png',
    unlockLevel: 3,
  },
  {
    id: 'robo-typer',
    name: 'Robo Typer',
    description: 'Friendly robot built for typing',
    src: '/avatars/robo-typer.png',
    unlockLevel: 1,
  },
  {
    id: 'keyboard-cat',
    name: 'Keyboard Cat',
    description: 'The coolest cat on the keyboard',
    src: '/avatars/keyboard-cat.png',
    unlockLevel: 5,
  },
  {
    id: 'bit-hero',
    name: '8-Bit Hero',
    description: 'Classic gaming champion',
    src: '/avatars/bit-hero.png',
    unlockLevel: 1,
  },
  {
    id: 'arcade-ghost',
    name: 'Arcade Ghost',
    description: 'Friendly phantom from the arcade',
    src: '/avatars/arcade-ghost.png',
    unlockLevel: 7,
  },
  {
    id: 'dragon-coder',
    name: 'Dragon Coder',
    description: 'Breathes code instead of fire',
    src: '/avatars/dragon-coder.png',
    unlockLevel: 10,
  },
];

export const DEFAULT_AVATAR_ID = 'pixel-knight';

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find(a => a.id === id);
}

export function getUnlockedAvatars(userLevel: number): Avatar[] {
  return AVATARS.filter(a => (a.unlockLevel || 1) <= userLevel);
}
```

### 2.3 Convex Schema Update

**Modify: `convex/schema.ts`**

Add `avatarId` field to users table:

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  avatarId: v.optional(v.string()), // NEW: Selected avatar ID
  createdAt: v.number(),
})
```

### 2.4 Convex Functions

**Modify: `convex/users.ts`**

Add avatar update function:

```typescript
export const updateAvatar = mutation({
  args: { avatarId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { avatarId: args.avatarId });
    return { success: true };
  },
});

export const getAvatar = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    return user?.avatarId || 'pixel-knight';
  },
});
```

---

## Phase 3: UI Components

### 3.1 Avatar Display Component

**New file: `src/components/Avatar.tsx`**

```typescript
import { AVATARS, DEFAULT_AVATAR_ID, getAvatarById } from '../data/avatars';

interface AvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 96,
};

export function Avatar({ avatarId, size = 'md', className = '' }: AvatarProps) {
  const avatar = getAvatarById(avatarId || DEFAULT_AVATAR_ID) || AVATARS[0];
  const pixelSize = SIZES[size];

  return (
    <div
      className={`pixel-avatar ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        border: '3px solid #ffd93d',
        background: '#1a1a2e',
        imageRendering: 'pixelated',
      }}
    >
      <img
        src={avatar.src}
        alt={avatar.name}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
```

### 3.2 Avatar Selector Component

**New file: `src/components/AvatarSelector.tsx`**

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AVATARS, getUnlockedAvatars, type Avatar } from '../data/avatars';
import { useGameState } from '../hooks/useGameState';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarSelector({ isOpen, onClose }: AvatarSelectorProps) {
  const gameState = useGameState();
  const currentAvatarId = useQuery(api.users.getAvatar);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const unlockedAvatars = getUnlockedAvatars(gameState.level);
  const lockedAvatars = AVATARS.filter(a => (a.unlockLevel || 1) > gameState.level);

  const handleSelect = async (avatarId: string) => {
    setSelectedId(avatarId);
    await updateAvatar({ avatarId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
            SELECT AVATAR
          </h2>
          <button
            onClick={onClose}
            className="pixel-btn"
            style={{ fontSize: '10px', padding: '4px 8px' }}
          >
            X
          </button>
        </div>

        {/* Unlocked Avatars */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {unlockedAvatars.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={`p-2 transition-all ${
                currentAvatarId === avatar.id
                  ? 'ring-2 ring-[#ffd93d]'
                  : 'hover:ring-2 hover:ring-[#3bceac]'
              }`}
              style={{ background: '#1a1a2e' }}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                className="w-full aspect-square"
                style={{ imageRendering: 'pixelated' }}
              />
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                color: '#eef5db',
                marginTop: '4px',
                textAlign: 'center'
              }}>
                {avatar.name.toUpperCase()}
              </p>
            </button>
          ))}
        </div>

        {/* Locked Avatars */}
        {lockedAvatars.length > 0 && (
          <>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#4a4a6e',
              marginBottom: '12px'
            }}>
              LOCKED
            </p>
            <div className="grid grid-cols-4 gap-4 opacity-50">
              {lockedAvatars.map(avatar => (
                <div
                  key={avatar.id}
                  className="p-2 relative"
                  style={{ background: '#1a1a2e' }}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full aspect-square grayscale"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '8px',
                      color: '#ffd93d'
                    }}>
                      LV{avatar.unlockLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

### 3.3 Update Header

**Modify: `src/App.tsx`**

Replace Clerk's default avatar with custom avatar in header:

```typescript
import { Avatar } from './components/Avatar';
import { AvatarSelector } from './components/AvatarSelector';

// In App component:
const [showAvatarSelector, setShowAvatarSelector] = useState(false);
const currentAvatarId = useQuery(api.users.getAvatar);

// In header JSX:
<button onClick={() => setShowAvatarSelector(true)}>
  <Avatar avatarId={currentAvatarId} size="md" />
</button>

// Add modal:
<AvatarSelector
  isOpen={showAvatarSelector}
  onClose={() => setShowAvatarSelector(false)}
/>
```

### 3.4 Update Leaderboard

**Modify: `src/components/Leaderboard.tsx`**

Display user avatars in leaderboard rows:

```typescript
import { Avatar } from './Avatar';

// In leaderboard row:
<div className="flex items-center gap-3">
  <Avatar avatarId={entry.avatarId} size="sm" />
  <span>{entry.username}</span>
</div>
```

### 3.5 Update Leaderboard Schema

**Modify: `convex/schema.ts`**

Add avatarId to leaderboard entries for denormalized display:

```typescript
leaderboard: defineTable({
  lessonId: v.number(),
  score: v.number(),
  accuracy: v.number(),
  timestamp: v.number(),
  username: v.string(),
  userId: v.id("users"),
  avatarId: v.optional(v.string()), // NEW
})
```

---

## File Structure (New/Modified)

```
typingquest/
├── scripts/
│   └── generate-avatars.ts        (new) - One-time generation script
├── public/
│   └── avatars/                   (new) - Static avatar images
│       ├── pixel-knight.png
│       ├── code-wizard.png
│       ├── speed-ninja.png
│       ├── robo-typer.png
│       ├── keyboard-cat.png
│       ├── bit-hero.png
│       ├── arcade-ghost.png
│       └── dragon-coder.png
├── src/
│   ├── data/
│   │   └── avatars.ts             (new) - Avatar metadata
│   ├── components/
│   │   ├── Avatar.tsx             (new) - Avatar display
│   │   ├── AvatarSelector.tsx     (new) - Selection modal
│   │   ├── Leaderboard.tsx        (modify) - Show avatars
│   │   └── UserButton.tsx         (modify) - Show avatar
│   └── App.tsx                    (modify) - Avatar selector integration
└── convex/
    ├── schema.ts                  (modify) - Add avatarId fields
    └── users.ts                   (modify) - Avatar mutations/queries
```

---

## Implementation Order

1. **Setup** - Create scripts folder, install dependencies
2. **Generation** - Write and run avatar generation script
3. **Review** - Quality check generated avatars, regenerate if needed
4. **Assets** - Move final PNGs to public/avatars/
5. **Metadata** - Create src/data/avatars.ts
6. **Schema** - Update Convex schema with avatarId fields
7. **Backend** - Add Convex avatar mutations/queries
8. **Components** - Build Avatar and AvatarSelector components
9. **Integration** - Update App.tsx, Leaderboard.tsx, UserButton.tsx
10. **Testing** - Test selection, persistence, display across components

---

## Future Enhancements

### Phase 4 (Future)

- **Seasonal Avatars**: Special avatars for holidays (Santa hat, pumpkin, etc.)
- **Achievement Avatars**: Unlock via specific accomplishments
- **Avatar Frames**: Decorative borders earned through progression
- **Animated Avatars**: Subtle pixel animations for premium avatars
- **User-Generated**: Allow users to create custom pixel avatars (with moderation)

---

## Notes

- **One-time Generation**: Avatars are generated once, not on-demand
- **Static Assets**: Stored in public/ for fast CDN delivery
- **Pixel Perfect**: Use `image-rendering: pixelated` CSS for crisp display
- **Level Gating**: Some avatars locked behind progression to encourage play
- **Fallback**: Always default to 'pixel-knight' if no avatar selected
- **No Clerk Override**: Custom avatars take precedence over Clerk profile pictures
