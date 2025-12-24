import { mutation } from "./_generated/server";

// Shop item definitions
const SHOP_ITEMS = [
  // ═══════════════════════════════════════════════════════════════════
  // AVATARS (8 items)
  // ═══════════════════════════════════════════════════════════════════
  {
    itemId: "pixel-knight",
    name: "Pixel Knight",
    description: "A brave knight ready for typing adventures",
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
    description: "Master of programming spells and keyboard magic",
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
    description: "Swift as the wind, accurate as a shuriken",
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
    description: "Mechanical precision meets digital soul",
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
    description: "The internet legend returns to teach you to type",
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
    description: "8-bit champion of the typing realm",
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
    description: "Haunting high scores since 1980",
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
    description: "Legendary beast of the keyboard mountains",
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
    description: "Classic terminal green on black",
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
    description: "Neon grids and sunset gradients",
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
    description: "High tech, low life aesthetics",
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
    description: "Calming blues of the deep sea",
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
    description: "Peaceful greens and natural tones",
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
    description: "Electric city vibes - Premium exclusive",
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
    description: "Warm, natural wood texture",
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
    description: "Keys that light up the night",
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
    description: "Shimmering rainbow reflections",
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
    description: "Gaming-grade RGB effects - Premium exclusive",
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
    description: "Double XP for your next lesson",
    category: "power-up",
    rarity: "common",
    price: 100,
    imageUrl: "/powerups/xp-boost.png",
    isConsumable: true,
    isPremiumOnly: false,
    isFeatured: false,
    isOnSale: false,
  },
  {
    itemId: "streak-freeze",
    name: "Streak Freeze",
    description: "Protect your streak for one day",
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
    description: "Get a hint during a difficult challenge",
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
    description: "2x coins for 1 hour of play",
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
