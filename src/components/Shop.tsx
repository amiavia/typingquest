import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { CoinBalance } from "./CoinBalance";
import { PremiumLock } from "./PremiumBadge";
import { usePremium } from "../hooks/usePremium";

type ShopCategory = "all" | "avatar" | "theme" | "keyboard-skin" | "power-up";
type ShopRarity = "all" | "common" | "rare" | "epic" | "legendary";

interface ShopProps {
  onClose?: () => void;
  onUpgrade?: () => void;
}

export function Shop({ onClose, onUpgrade }: ShopProps) {
  const { userId } = useAuth();
  const [category, setCategory] = useState<ShopCategory>("all");
  const [rarity, setRarity] = useState<ShopRarity>("all");
  const [purchaseItemId, setPurchaseItemId] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Queries
  const allItems = useQuery(api.shop.getShopItems, {});
  const featuredItems = useQuery(api.shop.getFeaturedItems);
  const inventory = useQuery(
    api.shop.getInventory,
    userId ? { clerkId: userId } : "skip"
  );
  const coinBalance = useQuery(
    api.coins.getCoinBalance,
    userId ? { clerkId: userId } : "skip"
  );

  // Get premium status from Clerk Billing
  const { isPremium } = usePremium();

  // Mutations
  const purchaseItem = useMutation(api.shop.purchaseItem);
  const equipItem = useMutation(api.shop.equipItem);

  // Filter items
  const filteredItems = allItems?.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (rarity !== "all" && item.rarity !== rarity) return false;
    return true;
  });

  // Check if user owns an item
  const ownsItem = (itemId: string) => {
    return inventory?.some((inv) => inv.itemId === itemId && inv.quantity > 0);
  };

  // Check if item is equipped
  const isEquipped = (itemId: string) => {
    return inventory?.some((inv) => inv.itemId === itemId && inv.isEquipped);
  };

  // Handle purchase
  const handlePurchase = async (itemId: string) => {
    if (!userId) return;

    setPurchaseItemId(itemId);
    try {
      const result = await purchaseItem({ clerkId: userId, itemId });
      if (result.success) {
        setPurchaseResult({
          success: true,
          message: `Purchased ${result.item?.name}!`,
        });
      } else {
        setPurchaseResult({ success: false, message: result.reason || "Failed" });
      }
    } catch (error) {
      setPurchaseResult({ success: false, message: "Purchase failed" });
    }
    setPurchaseItemId(null);

    // Clear result after 2 seconds
    setTimeout(() => setPurchaseResult(null), 2000);
  };

  // Handle equip
  const handleEquip = async (itemId: string) => {
    if (!userId) return;
    await equipItem({ clerkId: userId, itemId });
  };

  // Get rarity color
  const getRarityColor = (r: string) => {
    switch (r) {
      case "common":
        return "#eef5db";
      case "rare":
        return "#3b82f6";
      case "epic":
        return "#8b5cf6";
      case "legendary":
        return "#ffd93d";
      default:
        return "#eef5db";
    }
  };

  // Categories config
  const categories: { id: ShopCategory; label: string; icon: string }[] = [
    { id: "all", label: "ALL", icon: "🏪" },
    { id: "avatar", label: "AVATARS", icon: "👤" },
    { id: "theme", label: "THEMES", icon: "🎨" },
    { id: "keyboard-skin", label: "SKINS", icon: "⌨️" },
    { id: "power-up", label: "POWER-UPS", icon: "⚡" },
  ];

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ fontFamily: "'Press Start 2P'" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="pixel-btn"
              style={{ fontSize: "12px" }}
            >
              ← BACK
            </button>
          )}
          <h1 style={{ fontSize: "16px", color: "#ffd93d" }}>🏪 SHOP</h1>
        </div>
        <CoinBalance balance={coinBalance ?? 0} size="lg" />
      </header>

      {/* Purchase Result Toast */}
      {purchaseResult && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 border-2 ${
            purchaseResult.success
              ? "border-[#0ead69] bg-[#0ead69]"
              : "border-[#ff6b9d] bg-[#ff6b9d]"
          }`}
          style={{ fontSize: "10px", color: "#1a1a2e" }}
        >
          {purchaseResult.message}
        </div>
      )}

      {/* Featured Section */}
      {featuredItems && featuredItems.length > 0 && (
        <section className="mb-8">
          <h2
            className="mb-4 flex items-center gap-2"
            style={{ fontSize: "12px", color: "#ff6b9d" }}
          >
            <span>⭐</span> FEATURED
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredItems.map((item) => (
              <ShopItemCard
                key={item._id}
                item={item}
                owned={ownsItem(item.itemId) ?? false}
                equipped={isEquipped(item.itemId) ?? false}
                canAfford={(coinBalance ?? 0) >= item.price}
                isPremium={isPremium ?? false}
                isPurchasing={purchaseItemId === item.itemId}
                onPurchase={() => handlePurchase(item.itemId)}
                onEquip={() => handleEquip(item.itemId)}
                onUpgrade={onUpgrade}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-2 border-2 transition-colors ${
              category === cat.id
                ? "border-[#3bceac] bg-[#3bceac] text-[#1a1a2e]"
                : "border-[#4a4a6e] hover:border-[#3bceac]"
            }`}
            style={{ fontSize: "8px", color: category === cat.id ? "#1a1a2e" : "#eef5db" }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Rarity Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span style={{ fontSize: "8px", color: "#4a4a6e" }}>RARITY:</span>
        {(["all", "common", "rare", "epic", "legendary"] as ShopRarity[]).map(
          (r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={`px-2 py-1 transition-colors ${
                rarity === r ? "underline" : ""
              }`}
              style={{
                fontSize: "6px",
                color: r === "all" ? "#eef5db" : getRarityColor(r),
              }}
            >
              {r.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems?.map((item) => (
          <ShopItemCard
            key={item._id}
            item={item}
            owned={ownsItem(item.itemId) ?? false}
            equipped={isEquipped(item.itemId) ?? false}
            canAfford={(coinBalance ?? 0) >= item.price}
            isPremium={isPremium ?? false}
            isPurchasing={purchaseItemId === item.itemId}
            onPurchase={() => handlePurchase(item.itemId)}
            onEquip={() => handleEquip(item.itemId)}
            onUpgrade={onUpgrade}
          />
        ))}
      </div>

      {/* Empty state */}
      {(!filteredItems || filteredItems.length === 0) && (
        <div className="text-center py-12">
          <p style={{ fontSize: "10px", color: "#4a4a6e" }}>NO ITEMS FOUND</p>
        </div>
      )}
    </div>
  );
}

// Shop Item Card Component
interface ShopItemCardProps {
  item: {
    _id: string;
    itemId: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    price: number;
    imageUrl: string;
    isConsumable: boolean;
    isPremiumOnly: boolean;
    isOnSale: boolean;
    salePrice?: number;
    requiredLevel?: number;
  };
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  isPremium: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
  onEquip: () => void;
  onUpgrade?: () => void;
}

function ShopItemCard({
  item,
  owned,
  equipped,
  canAfford,
  isPremium,
  isPurchasing,
  onPurchase,
  onEquip,
  onUpgrade,
}: ShopItemCardProps) {
  const getRarityColor = (r: string) => {
    switch (r) {
      case "common":
        return "#eef5db";
      case "rare":
        return "#3b82f6";
      case "epic":
        return "#8b5cf6";
      case "legendary":
        return "#ffd93d";
      default:
        return "#eef5db";
    }
  };

  const rarityColor = getRarityColor(item.rarity);
  const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
  const showPremiumLock = item.isPremiumOnly && !isPremium;

  return (
    <div
      className="pixel-box p-3 relative overflow-hidden"
      style={{
        borderColor: equipped ? "#0ead69" : rarityColor,
        boxShadow: equipped ? `0 0 15px #0ead69` : undefined,
      }}
    >
      {/* Premium Lock Overlay */}
      {showPremiumLock && <PremiumLock onUpgrade={onUpgrade ?? (() => {})} />}

      {/* Rarity Badge */}
      <span
        className="absolute top-2 right-2 px-1"
        style={{
          fontSize: "5px",
          color: "#1a1a2e",
          backgroundColor: rarityColor,
        }}
      >
        {item.rarity.toUpperCase()}
      </span>

      {/* Sale Badge */}
      {item.isOnSale && (
        <span
          className="absolute top-2 left-2 px-1"
          style={{
            fontSize: "5px",
            backgroundColor: "#ff6b9d",
            color: "#1a1a2e",
          }}
        >
          SALE
        </span>
      )}

      {/* Item Image */}
      <div
        className="w-full aspect-square mb-3 border-2 flex items-center justify-center overflow-hidden"
        style={{
          borderColor: rarityColor,
          backgroundColor: "rgba(26, 26, 46, 0.5)",
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement("span");
              fallback.style.fontSize = "32px";
              fallback.textContent =
                item.category === "avatar"
                  ? "👤"
                  : item.category === "theme"
                    ? "🎨"
                    : item.category === "keyboard-skin"
                      ? "⌨️"
                      : "⚡";
              parent.appendChild(fallback);
            }
          }}
        />
      </div>

      {/* Item Name */}
      <h4
        className="mb-2"
        style={{
          fontSize: "11px",
          color: "#eef5db",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.name.toUpperCase()}
      </h4>

      {/* Description */}
      <p
        className="mb-3"
        style={{
          fontSize: "9px",
          color: "#b0b0d0",
          lineHeight: "1.7",
          minHeight: "48px",
          maxHeight: "64px",
          overflow: "hidden",
        }}
      >
        {item.description}
      </p>

      {/* Price / Action */}
      {owned ? (
        <button
          onClick={onEquip}
          disabled={equipped || item.isConsumable}
          className={`w-full py-2 border-2 transition-colors ${
            equipped
              ? "border-[#0ead69] bg-[#0ead69] text-[#1a1a2e]"
              : "border-[#3bceac] hover:bg-[#3bceac] hover:text-[#1a1a2e]"
          }`}
          style={{ fontSize: "7px", color: equipped ? "#1a1a2e" : "#3bceac" }}
        >
          {equipped ? "EQUIPPED" : item.isConsumable ? "OWNED" : "EQUIP"}
        </button>
      ) : (
        <button
          onClick={onPurchase}
          disabled={!canAfford || showPremiumLock || isPurchasing}
          className={`w-full py-2 border-2 transition-colors ${
            canAfford && !showPremiumLock
              ? "border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e]"
              : "border-[#4a4a6e] opacity-50"
          }`}
          style={{
            fontSize: "7px",
            color: canAfford && !showPremiumLock ? "#ffd93d" : "#4a4a6e",
          }}
        >
          {isPurchasing ? (
            "..."
          ) : (
            <>
              {item.isOnSale && (
                <span
                  style={{
                    textDecoration: "line-through",
                    marginRight: "4px",
                    color: "#4a4a6e",
                  }}
                >
                  {item.price}
                </span>
              )}
              {price === 0 ? "FREE" : `${price}$`}
            </>
          )}
        </button>
      )}
    </div>
  );
}
