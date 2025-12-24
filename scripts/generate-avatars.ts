/**
 * PRP-003: Avatar Generation Script using Google Gemini 2.5 Flash
 *
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   npx tsx scripts/generate-avatars.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GEMINI_API_KEY;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  console.error('Usage: export GEMINI_API_KEY="your-api-key" && npx tsx scripts/generate-avatars.ts');
  process.exit(1);
}

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
  },
  {
    id: 'cyber-fox',
    name: 'Cyber Fox',
    prompt: `Create an 8-bit pixel art avatar of a cyberpunk fox character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Sly cyberpunk fox with hacker vibes
- One eye is a glowing cyber implant (cyan glow)
- Large pointed ears
- Pink/magenta (#ff6b9d) fur with circuit patterns
- Yellow (#ffd93d) eye and accents
- Cyan (#3bceac) for cyber elements
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e)
- Clever, mischievous expression
- Futuristic hacker aesthetic`
  },
  {
    id: 'star-captain',
    name: 'Star Captain',
    prompt: `Create an 8-bit pixel art avatar of a space captain character for a typing game.

CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 32x32 or 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

CHARACTER DESIGN:
- Commanding space captain with uniform
- Captain's hat with star emblem
- Determined, leadership expression
- Standing proud pose
- Yellow/gold (#ffd93d) as primary uniform color
- Cyan (#3bceac) accents and badges
- Dark navy (#1a1a2e) for outlines

COMPOSITION:
- Square format, character centered
- Solid dark background (#1a1a2e) with tiny stars
- Heroic, commanding presence
- Star Trek/space opera inspired but original`
  }
];

async function generateAvatar(spec: AvatarSpec): Promise<Buffer | null> {
  console.log(`  Requesting image from Gemini...`);

  const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: spec.prompt }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  API error: ${response.status} ${response.statusText}`);
    console.error(`  ${errorText}`);
    return null;
  }

  const data = await response.json();

  // Find image in response
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('image/')
  );

  if (!imagePart?.inlineData?.data) {
    console.error(`  No image in response`);
    console.log(`  Response:`, JSON.stringify(data, null, 2).slice(0, 500));
    return null;
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function main() {
  const outputDir = path.join(__dirname, '../public/avatars');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating 10 pixel art avatars with Gemini 2.5 Flash...\n');

  let successCount = 0;
  let failCount = 0;

  for (const avatar of avatars) {
    console.log(`[${avatars.indexOf(avatar) + 1}/${avatars.length}] Generating ${avatar.name}...`);

    try {
      const imageBuffer = await generateAvatar(avatar);

      if (imageBuffer) {
        const outputPath = path.join(outputDir, `${avatar.id}.png`);
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`  Saved to ${outputPath}\n`);
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`  Failed: ${error}\n`);
      failCount++;
    }

    // Rate limiting - wait between requests
    if (avatars.indexOf(avatar) < avatars.length - 1) {
      console.log(`  Waiting 2s before next request...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n========================================`);
  console.log(`Generation complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`========================================`);
}

main().catch(console.error);
