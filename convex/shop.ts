import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get shop items with optional filters
export const getShopItems = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    rarity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.featured === true) {
      items = await ctx.db
        .query("shopItems")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    } else if (args.category) {
      items = await ctx.db
        .query("shopItems")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else if (args.rarity) {
      items = await ctx.db
        .query("shopItems")
        .withIndex("by_rarity", (q) => q.eq("rarity", args.rarity))
        .collect();
    } else {
      items = await ctx.db.query("shopItems").collect();
    }

    // Sort by price
    return items.sort((a, b) => a.price - b.price);
  },
});

// Get a specific shop item
export const getShopItem = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("shopItems").collect();
    return items.find((item) => item.itemId === args.itemId);
  },
});

// Get user's inventory
export const getInventory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    // Get item details
    const allItems = await ctx.db.query("shopItems").collect();
    const itemMap = new Map(allItems.map((item) => [item.itemId, item]));

    return inventory.map((inv) => ({
      ...inv,
      item: itemMap.get(inv.itemId),
    }));
  },
});

// Check if user owns an item
export const ownsItem = query({
  args: {
    clerkId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
      )
      .first();

    return inventoryItem !== null && inventoryItem.quantity > 0;
  },
});

// Purchase an item
export const purchaseItem = mutation({
  args: {
    clerkId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the shop item
    const allItems = await ctx.db.query("shopItems").collect();
    const shopItem = allItems.find((item) => item.itemId === args.itemId);

    if (!shopItem) {
      return { success: false, reason: "Item not found" };
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Check premium requirement
    if (shopItem.isPremiumOnly && !user.isPremium) {
      return { success: false, reason: "Premium subscription required" };
    }

    // Get game state for coins and level
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentLevel = gameState?.level ?? 1;
    const currentBalance = gameState?.coins ?? 0;

    // Check level requirement
    if (shopItem.requiredLevel && currentLevel < shopItem.requiredLevel) {
      return {
        success: false,
        reason: `Level ${shopItem.requiredLevel} required`,
      };
    }

    // Check if already owned (for non-consumables)
    if (!shopItem.isConsumable) {
      const existing = await ctx.db
        .query("inventory")
        .withIndex("by_clerk_item", (q) =>
          q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
        )
        .first();

      if (existing && existing.quantity > 0) {
        return { success: false, reason: "Already owned" };
      }
    }

    // Calculate price (use sale price if on sale)
    const price = shopItem.isOnSale && shopItem.salePrice ? shopItem.salePrice : shopItem.price;

    // Check coin balance
    if (currentBalance < price) {
      return { success: false, reason: "Insufficient coins" };
    }

    // Deduct coins
    if (gameState) {
      await ctx.db.patch(gameState._id, {
        coins: currentBalance - price,
        updatedAt: Date.now(),
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      clerkId: args.clerkId,
      type: "purchase",
      amount: -price,
      source: "shop",
      itemId: args.itemId,
      metadata: { itemName: shopItem.name, category: shopItem.category },
      balanceBefore: currentBalance,
      balanceAfter: currentBalance - price,
      timestamp: Date.now(),
    });

    // Add to inventory
    const existingInventory = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
      )
      .first();

    if (existingInventory) {
      await ctx.db.patch(existingInventory._id, {
        quantity: existingInventory.quantity + 1,
      });
    } else {
      await ctx.db.insert("inventory", {
        clerkId: args.clerkId,
        itemId: args.itemId,
        quantity: 1,
        purchasedAt: Date.now(),
        isEquipped: false,
      });
    }

    return {
      success: true,
      newBalance: currentBalance - price,
      item: shopItem,
    };
  },
});

// Equip an item (for avatars, themes, keyboard skins)
export const equipItem = mutation({
  args: {
    clerkId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get inventory item
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
      )
      .first();

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, reason: "Item not owned" };
    }

    // Get shop item for category
    const allItems = await ctx.db.query("shopItems").collect();
    const shopItem = allItems.find((item) => item.itemId === args.itemId);

    if (!shopItem) {
      return { success: false, reason: "Item not found" };
    }

    // Unequip other items in same category
    const userInventory = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    for (const inv of userInventory) {
      if (inv.isEquipped) {
        const invItem = allItems.find((i) => i.itemId === inv.itemId);
        if (invItem && invItem.category === shopItem.category) {
          await ctx.db.patch(inv._id, { isEquipped: false });
        }
      }
    }

    // Equip this item
    await ctx.db.patch(inventoryItem._id, { isEquipped: true });

    // If it's an avatar, update user's avatarId
    if (shopItem.category === "avatar") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (user) {
        await ctx.db.patch(user._id, { avatarId: args.itemId });
      }
    }

    return { success: true };
  },
});

// Unequip an item
export const unequipItem = mutation({
  args: {
    clerkId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
      )
      .first();

    if (!inventoryItem) {
      return { success: false, reason: "Item not found" };
    }

    await ctx.db.patch(inventoryItem._id, { isEquipped: false });

    // If it's an avatar, clear user's avatarId
    const allItems = await ctx.db.query("shopItems").collect();
    const shopItem = allItems.find((item) => item.itemId === args.itemId);

    if (shopItem?.category === "avatar") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (user && user.avatarId === args.itemId) {
        await ctx.db.patch(user._id, { avatarId: undefined });
      }
    }

    return { success: true };
  },
});

// Use a consumable item
export const useConsumable = mutation({
  args: {
    clerkId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.itemId)
      )
      .first();

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, reason: "Item not owned" };
    }

    // Get shop item
    const allItems = await ctx.db.query("shopItems").collect();
    const shopItem = allItems.find((item) => item.itemId === args.itemId);

    if (!shopItem || !shopItem.isConsumable) {
      return { success: false, reason: "Not a consumable item" };
    }

    // Reduce quantity
    if (inventoryItem.quantity === 1) {
      await ctx.db.delete(inventoryItem._id);
    } else {
      await ctx.db.patch(inventoryItem._id, {
        quantity: inventoryItem.quantity - 1,
      });
    }

    return {
      success: true,
      itemId: args.itemId,
      effect: shopItem.itemId, // The consuming code should handle the effect
      remainingQuantity: inventoryItem.quantity - 1,
    };
  },
});

// Get equipped items for a user
export const getEquippedItems = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const equipped = inventory.filter((inv) => inv.isEquipped);

    // Get item details
    const allItems = await ctx.db.query("shopItems").collect();
    const itemMap = new Map(allItems.map((item) => [item.itemId, item]));

    const result: Record<string, typeof allItems[0] | undefined> = {};
    for (const inv of equipped) {
      const item = itemMap.get(inv.itemId);
      if (item) {
        result[item.category] = item;
      }
    }

    return result;
  },
});

// Get featured items for shop homepage
export const getFeaturedItems = query({
  args: {},
  handler: async (ctx) => {
    const featured = await ctx.db
      .query("shopItems")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .take(6);

    return featured;
  },
});

// Get items on sale
export const getSaleItems = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("shopItems").collect();
    return allItems.filter((item) => item.isOnSale);
  },
});
