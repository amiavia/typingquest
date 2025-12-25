/**
 * PRP-030: Shop Image Generation Script using Google Gemini 2.0 Flash
 *
 * Generates pixel art images for all shop items:
 * - Themes
 * - Keyboard Skins
 * - Power-ups
 *
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   npx tsx scripts/generate-shop-images.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GEMINI_API_KEY;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  console.error('Usage: export GEMINI_API_KEY="your-api-key" && npx tsx scripts/generate-shop-images.ts');
  process.exit(1);
}

interface ShopItemSpec {
  id: string;
  name: string;
  category: 'theme' | 'keyboard-skin' | 'power-up';
  prompt: string;
  outputDir: string;
}

const BASE_STYLE = `
CRITICAL STYLE REQUIREMENTS:
- Pure 8-bit pixel art style like classic NES/Game Boy games
- Maximum 64x64 pixel resolution feel
- Limited color palette (max 8-12 colors)
- Chunky visible pixels, NO anti-aliasing, NO gradients
- Clean pixel edges, no blur or smoothing

COMPOSITION:
- Square format
- Solid dark background (#1a1a2e)
- Icon fills ~80% of frame
- Simple, iconic, instantly recognizable
`;

const shopItems: ShopItemSpec[] = [
  // ═══════════════════════════════════════════════════════════════════
  // THEMES (6 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'retro-green',
    name: 'Retro Green',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing a "Retro Green Terminal" theme for a typing game.
${BASE_STYLE}

DESIGN:
- Classic CRT monitor shape with thick bezel
- Glowing green (#0ead69) text lines on black screen
- Scanlines visible as horizontal pixel rows
- Matrix-style falling characters or command prompt
- Phosphor glow effect using pixel dithering
- Yellow (#ffd93d) power LED indicator
- Dark navy (#1a1a2e) background`
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing a "Synthwave" aesthetic theme for a typing game.
${BASE_STYLE}

DESIGN:
- Neon grid perspective lines (magenta #ff6b9d and cyan #3bceac)
- Sunset gradient background (use dithered pixels for gradient effect)
- Retro sun circle at horizon with horizontal line stripes
- Palm tree silhouettes or geometric shapes
- 80s Miami Vice / Outrun aesthetic
- Vibrant neon pink, cyan, purple pixel colors
- Dark navy (#1a1a2e) for darker areas`
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing a "Cyberpunk" theme for a typing game.
${BASE_STYLE}

DESIGN:
- Futuristic city skyline silhouette
- Neon signs with Asian characters or symbols
- Rain effect using vertical pixel lines
- Glowing cyan (#3bceac) and pink (#ff6b9d) neon accents
- Dark moody atmosphere
- Circuit board patterns integrated
- Corporate logo shapes
- Dark navy (#1a1a2e) dominant with neon highlights`
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing an "Ocean Depths" underwater theme for a typing game.
${BASE_STYLE}

DESIGN:
- Deep blue underwater scene
- Pixel art bubbles rising
- Bioluminescent creatures (jellyfish or anglerfish) with cyan (#3bceac) glow
- Seaweed or coral silhouettes
- Gradient from dark to lighter blue using dithering
- Small fish swimming
- Peaceful, calming underwater atmosphere
- Dark navy (#1a1a2e) for deepest areas`
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing a "Forest Zen" nature theme for a typing game.
${BASE_STYLE}

DESIGN:
- Peaceful forest scene
- Pixel art trees with green (#0ead69) foliage
- Soft sunlight rays using yellow (#ffd93d) pixels
- Bamboo stalks or Japanese maple leaves
- Small zen garden elements (rocks, sand patterns)
- Calming nature aesthetic
- Muted greens and earth tones
- Dark navy (#1a1a2e) for shadows`
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    category: 'theme',
    outputDir: 'themes',
    prompt: `Create an 8-bit pixel art icon representing a "Neon Nights" premium theme for a typing game.
${BASE_STYLE}

DESIGN:
- Night city street view
- Bright neon shop signs (pink #ff6b9d, cyan #3bceac, yellow #ffd93d)
- Wet street reflections using mirrored pixels
- "PREMIUM" or star badge element
- Vibrant electric colors
- Japanese/Hong Kong alley aesthetic
- Dark navy (#1a1a2e) night sky with neon glow`
  },

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD SKINS (4 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'wooden-keys',
    name: 'Wooden Keys',
    category: 'keyboard-skin',
    outputDir: 'skins',
    prompt: `Create an 8-bit pixel art icon of wooden keyboard keys for a typing game shop.
${BASE_STYLE}

DESIGN:
- 3-4 keyboard keycaps in wood texture
- Warm brown pixel wood grain pattern
- Keys arranged in row like WASD or ASDF
- Natural wood tones (tan, brown)
- Subtle grain lines using darker brown pixels
- Carved/etched key letter symbols
- Vintage typewriter aesthetic
- Dark navy (#1a1a2e) background`
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    category: 'keyboard-skin',
    outputDir: 'skins',
    prompt: `Create an 8-bit pixel art icon of neon glowing keyboard keys for a typing game shop.
${BASE_STYLE}

DESIGN:
- 3-4 keyboard keycaps with neon glow effect
- Keys lit from within (cyan #3bceac edge glow)
- Pink (#ff6b9d) and cyan alternating key colors
- Pixel glow halos around each key
- Futuristic gaming keyboard aesthetic
- Transparent/glass-like keycap look
- RGB LED underglow effect
- Dark navy (#1a1a2e) background to emphasize glow`
  },
  {
    id: 'holographic',
    name: 'Holographic',
    category: 'keyboard-skin',
    outputDir: 'skins',
    prompt: `Create an 8-bit pixel art icon of holographic/rainbow keyboard keys for a typing game shop.
${BASE_STYLE}

DESIGN:
- 3-4 keyboard keycaps with rainbow holographic effect
- Shimmer effect using alternating colored pixels
- Rainbow spectrum (pink, cyan, yellow, green) on each key
- Iridescent/prismatic appearance
- Sparkle pixel highlights
- Premium luxury aesthetic
- Oil-slick/hologram color shifting illusion
- Dark navy (#1a1a2e) background`
  },
  {
    id: 'mechanical-rgb',
    name: 'Mechanical RGB',
    category: 'keyboard-skin',
    outputDir: 'skins',
    prompt: `Create an 8-bit pixel art icon of RGB mechanical keyboard keys for a typing game shop.
${BASE_STYLE}

DESIGN:
- 3-4 mechanical keyboard keycaps (Cherry MX style)
- RGB lighting underneath showing through gaps
- Gaming keyboard aesthetic with floating keys
- Multiple colors visible (pink #ff6b9d, cyan #3bceac, yellow #ffd93d)
- Cherry switch stem visible between keys
- Pro gamer / esports aesthetic
- "PREMIUM" badge or star icon
- Dark navy (#1a1a2e) background with RGB glow`
  },

  // ═══════════════════════════════════════════════════════════════════
  // POWER-UPS (4 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'xp-boost-2x',
    name: 'XP Boost 2x',
    category: 'power-up',
    outputDir: 'powerups',
    prompt: `Create an 8-bit pixel art icon of an "XP Boost" power-up item for a typing game shop.
${BASE_STYLE}

DESIGN:
- Glowing star or crystal shape
- "2X" text integrated into design
- Yellow (#ffd93d) as primary color with golden glow
- Sparkle pixel effects around it
- Upward arrow or rising effect
- Energy/power emanating from item
- Video game power-up item aesthetic
- Dark navy (#1a1a2e) background`
  },
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    category: 'power-up',
    outputDir: 'powerups',
    prompt: `Create an 8-bit pixel art icon of a "Streak Freeze" power-up item for a typing game shop.
${BASE_STYLE}

DESIGN:
- Ice crystal or snowflake shape
- Frozen/ice blue color (cyan #3bceac tones)
- Clock or calendar element frozen in ice
- Icicle details hanging off
- Cold mist/vapor pixels
- Shield or protection visual
- Preserves/protects streak concept
- Dark navy (#1a1a2e) background with frost`
  },
  {
    id: 'hint-token',
    name: 'Hint Token',
    category: 'power-up',
    outputDir: 'powerups',
    prompt: `Create an 8-bit pixel art icon of a "Hint Token" power-up item for a typing game shop.
${BASE_STYLE}

DESIGN:
- Lightbulb or question mark coin shape
- Yellow (#ffd93d) glowing lightbulb
- "?" symbol or idea rays emanating
- Coin/token circular shape
- Helpful, illuminating visual
- Light rays or sparkles
- Knowledge/wisdom aesthetic
- Dark navy (#1a1a2e) background`
  },
  {
    id: 'coin-magnet',
    name: 'Coin Magnet',
    category: 'power-up',
    outputDir: 'powerups',
    prompt: `Create an 8-bit pixel art icon of a "Coin Magnet" power-up item for a typing game shop.
${BASE_STYLE}

DESIGN:
- Horseshoe magnet shape (classic red/blue)
- Golden coins (#ffd93d) being attracted to magnet
- Magnetic field lines as pixel arcs
- "2X" multiplier element
- Pink (#ff6b9d) and cyan (#3bceac) magnet poles
- Coins flying toward magnet
- Money/reward attraction concept
- Dark navy (#1a1a2e) background`
  },
];

async function generateImage(spec: ShopItemSpec): Promise<Buffer | null> {
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
  const publicDir = path.join(__dirname, '../public');

  // Create output directories
  const outputDirs = ['themes', 'skins', 'powerups'];
  for (const dir of outputDirs) {
    const dirPath = path.join(publicDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  console.log(`\nGenerating ${shopItems.length} shop item images with Gemini 2.0 Flash...\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const item of shopItems) {
    const outputPath = path.join(publicDir, item.outputDir, `${item.id}.png`);

    // Skip if image already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[${shopItems.indexOf(item) + 1}/${shopItems.length}] Skipping ${item.name} (already exists)`);
      skippedCount++;
      continue;
    }

    console.log(`[${shopItems.indexOf(item) + 1}/${shopItems.length}] Generating ${item.name} (${item.category})...`);

    try {
      const imageBuffer = await generateImage(item);

      if (imageBuffer) {
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
    if (shopItems.indexOf(item) < shopItems.length - 1) {
      console.log(`  Waiting 2s before next request...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n========================================`);
  console.log(`Generation complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`========================================`);
}

main().catch(console.error);
