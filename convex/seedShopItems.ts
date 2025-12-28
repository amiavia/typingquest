import { mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

// Shop item definitions
const SHOP_ITEMS = [
  // ═══════════════════════════════════════════════════════════════════
  // AVATARS (8 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    itemId: "pixel-knight",
    name: "Pixel Knight",
    description: "A brave armored warrior ready for typing adventures. Free starter avatar with a keyboard-shaped shield.",
    category: "avatar",
    rarity: "common",
    price: 0, // Free starter avatar
    imageUrl: "/avatars/pixel-knight.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "code-wizard",
    name: "Code Wizard",
    description: "Master of programming spells and keyboard magic. Wields a staff topped with the sacred @ symbol.",
    category: "avatar",
    rarity: "rare",
    price: 200,
    imageUrl: "/avatars/code-wizard.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "speed-ninja",
    name: "Speed Ninja",
    description: "Swift as the wind, accurate as a shuriken. This stealthy warrior turns keystrokes into lethal precision.",
    category: "avatar",
    rarity: "rare",
    price: 250,
    imageUrl: "/avatars/speed-ninja.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "robo-typer",
    name: "Robo Typer",
    description: "Mechanical precision meets digital soul. This friendly robot was built for one purpose: perfect typing.",
    category: "avatar",
    rarity: "common",
    price: 75,
    imageUrl: "/avatars/robo-typer.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "keyboard-cat",
    name: "Keyboard Cat",
    description: "The internet legend returns! This cool cat with headphones and shades is ready to teach you to type in style.",
    category: "avatar",
    rarity: "epic",
    price: 500,
    imageUrl: "/avatars/keyboard-cat.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "bit-hero",
    name: "Bit Hero",
    description: "Classic 8-bit platformer hero vibes. Cape flowing, fist raised, ready to conquer any typing challenge.",
    category: "avatar",
    rarity: "common",
    price: 150,
    imageUrl: "/avatars/bit-hero.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "arcade-ghost",
    name: "Arcade Ghost",
    description: "Haunting high scores since 1980! This friendly pixel ghost brings classic arcade energy to your typing.",
    category: "avatar",
    rarity: "epic",
    price: 400,
    imageUrl: "/avatars/arcade-ghost.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "dragon-coder",
    name: "Dragon Coder",
    description: "Legendary beast of the keyboard mountains. Breathes code instead of fire. Requires Level 10 to unlock.",
    category: "avatar",
    rarity: "legendary",
    price: 1200,
    imageUrl: "/avatars/dragon-coder.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
    requiredLevel: 10,
  },

  // ═══════════════════════════════════════════════════════════════════
  // THEMES (6 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    itemId: "retro-green",
    name: "Retro Green",
    description: "Classic CRT terminal aesthetic with glowing green text on black. Perfect for nostalgic hackers and old-school programmers.",
    category: "theme",
    rarity: "common",
    price: 50,
    imageUrl: "/themes/retro-green.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "synthwave",
    name: "Synthwave",
    description: "Transport yourself to the 80s with neon grids, sunset gradients, and that iconic retro-futuristic vibe.",
    category: "theme",
    rarity: "rare",
    price: 300,
    imageUrl: "/themes/synthwave.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "cyberpunk",
    name: "Cyberpunk",
    description: "High tech, low life. Neon-lit rain-soaked streets and futuristic cityscapes define this dystopian theme.",
    category: "theme",
    rarity: "epic",
    price: 600,
    imageUrl: "/themes/cyberpunk.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "ocean-depths",
    name: "Ocean Depths",
    description: "Dive into calming blues and bioluminescent creatures. A peaceful underwater sanctuary for focused typing.",
    category: "theme",
    rarity: "rare",
    price: 200,
    imageUrl: "/themes/ocean-depths.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "forest-zen",
    name: "Forest Zen",
    description: "Find your inner peace with gentle greens and natural earth tones. Inspired by Japanese zen gardens.",
    category: "theme",
    rarity: "rare",
    price: 200,
    imageUrl: "/themes/forest-zen.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "neon-nights",
    name: "Neon Nights",
    description: "Electric city vibes with vibrant neon signs and wet street reflections. Premium exclusive for night owls.",
    category: "theme",
    rarity: "legendary",
    price: 450,
    imageUrl: "/themes/neon-nights.png",
    isConsumable: false,
    isPremiumOnly: true,
    isFeatured: true,
    isOnSale: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD SKINS (4 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    itemId: "wooden-keys",
    name: "Wooden Keys",
    description: "Warm, natural wood grain texture for your keyboard. Brings a cozy, artisanal feel to every keystroke.",
    category: "keyboard-skin",
    rarity: "common",
    price: 100,
    imageUrl: "/skins/wooden-keys.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "neon-glow",
    name: "Neon Glow",
    description: "Keys that light up the night with vibrant cyan and pink edges. Perfect for late-night typing sessions.",
    category: "keyboard-skin",
    rarity: "rare",
    price: 250,
    imageUrl: "/skins/neon-glow.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "holographic",
    name: "Holographic",
    description: "Shimmering rainbow reflections dance across your keys. A premium iridescent finish that catches every eye.",
    category: "keyboard-skin",
    rarity: "epic",
    price: 550,
    imageUrl: "/skins/holographic.png",
    isConsumable: false,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "mechanical-rgb",
    name: "Mechanical RGB",
    description: "Gaming-grade floating keycaps with full RGB underglow. The ultimate esports aesthetic for serious typists.",
    category: "keyboard-skin",
    rarity: "legendary",
    price: 400,
    imageUrl: "/skins/mechanical-rgb.png",
    isConsumable: false,
    isPremiumOnly: true,
    isFeatured: false,
    isOnSale: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // POWER-UPS (4 items - Consumables)
  // ═══════════════════════════════════════════════════════════════════
  {
    itemId: "xp-boost-2x",
    name: "XP Boost 2x",
    description: "Double your XP gains for the next lesson! Stack the gains and level up faster than ever before.",
    category: "power-up",
    rarity: "common",
    price: 100,
    imageUrl: "/powerups/xp-boost-2x.png",
    isConsumable: true,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "streak-freeze",
    name: "Streak Freeze",
    description: "Life happens! Protect your hard-earned streak for one day. Your progress stays safe even if you miss practice.",
    category: "power-up",
    rarity: "rare",
    price: 75,
    imageUrl: "/powerups/streak-freeze.png",
    isConsumable: true,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
  {
    itemId: "hint-token",
    name: "Hint Token",
    description: "Stuck on a tough challenge? Use this token to reveal a helpful hint and keep your momentum going.",
    category: "power-up",
    rarity: "common",
    price: 25,
    imageUrl: "/powerups/hint-token.png",
    isConsumable: true,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "coin-magnet",
    name: "Coin Magnet",
    description: "Attract double the coins for 1 hour! Every keystroke becomes more rewarding with this powerful magnet.",
    category: "power-up",
    rarity: "rare",
    price: 150,
    imageUrl: "/powerups/coin-magnet.png",
    isConsumable: true,
    isPremiumOnly: false,
    isFeatured: true,
    isOnSale: false,
  },
];

// Mutation to seed all shop items
export const seedAllItems = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Get existing items
    const existingItems = await ctx.db.query("shopItems").collect();
    const existingIds = new Set(existingItems.map((item) => item.itemId));

    let inserted = 0;
    let skipped = 0;

    for (const item of SHOP_ITEMS) {
      if (existingIds.has(item.itemId)) {
        skipped++;
        continue;
      }

      await ctx.db.insert("shopItems", {
        ...item,
        createdAt: Date.now(),
      });
      inserted++;
    }

    return {
      inserted,
      skipped,
      total: SHOP_ITEMS.length,
    };
  },
});

// Mutation to clear and reseed all items (for development)
export const reseedAllItems = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Delete all existing items
    const existingItems = await ctx.db.query("shopItems").collect();
    for (const item of existingItems) {
      await ctx.db.delete(item._id);
    }

    // Insert all items
    for (const item of SHOP_ITEMS) {
      await ctx.db.insert("shopItems", {
        ...item,
        createdAt: Date.now(),
      });
    }

    return {
      deleted: existingItems.length,
      inserted: SHOP_ITEMS.length,
    };
  },
});

// Mutation to add a single item (for adding new items)
export const addShopItem = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // This is a template - modify as needed
    const item = {
      itemId: "new-item",
      name: "New Item",
      description: "Description here",
      category: "avatar" as const,
      rarity: "common" as const,
      price: 100,
      imageUrl: "/items/new-item.png",
      isConsumable: false,
      isPremiumOnly: false,
      isFeatured: false,
      isOnSale: false,
      createdAt: Date.now(),
    };

    // Check if exists
    const existing = await ctx.db.query("shopItems").collect();
    if (existing.some((e) => e.itemId === item.itemId)) {
      return { success: false, reason: "Item already exists" };
    }

    const id = await ctx.db.insert("shopItems", item);
    return { success: true, id };
  },
});

// Query to get shop item stats
export const getShopStats = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const items = await ctx.db.query("shopItems").collect();

    const stats = {
      total: items.length,
      byCategory: {} as Record<string, number>,
      byRarity: {} as Record<string, number>,
      premiumOnly: 0,
      featured: 0,
      onSale: 0,
    };

    for (const item of items) {
      stats.byCategory[item.category] =
        (stats.byCategory[item.category] || 0) + 1;
      stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;
      if (item.isPremiumOnly) stats.premiumOnly++;
      if (item.isFeatured) stats.featured++;
      if (item.isOnSale) stats.onSale++;
    }

    return stats;
  },
});
