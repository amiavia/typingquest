/**
 * PRP-027 Task 4.5: Premium Perks Integration Hook
 *
 * Provides premium status and benefits across the app.
 */

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";

export interface PremiumBenefits {
  coinMultiplier: number;
  xpMultiplier: number;
  freeStreakFreezes: number;
  exclusiveShopAccess: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

export interface UsePremiumResult {
  isPremium: boolean;
  isLoading: boolean;
  premiumExpiresAt: Date | null;
  plan: string | null;
  cancelAtPeriodEnd: boolean;
  benefits: PremiumBenefits;
  applyMultiplier: (coins: number) => number;
}

const FREE_BENEFITS: PremiumBenefits = {
  coinMultiplier: 1,
  xpMultiplier: 1,
  freeStreakFreezes: 0,
  exclusiveShopAccess: false,
  adFree: false,
  prioritySupport: false,
};

const PREMIUM_BENEFITS: PremiumBenefits = {
  coinMultiplier: 2,
  xpMultiplier: 1.5,
  freeStreakFreezes: 3,
  exclusiveShopAccess: true,
  adFree: true,
  prioritySupport: true,
};

export function usePremium(): UsePremiumResult {
  const { userId } = useAuth();

  const premiumStatus = useQuery(
    api.premium.getPremiumStatus,
    userId ? { clerkId: userId } : "skip"
  );

  const isPremium = premiumStatus?.isPremium ?? false;
  const isLoading = premiumStatus === undefined;

  const benefits = isPremium ? PREMIUM_BENEFITS : FREE_BENEFITS;

  const applyMultiplier = (coins: number): number => {
    return Math.round(coins * benefits.coinMultiplier);
  };

  return {
    isPremium,
    isLoading,
    premiumExpiresAt: premiumStatus?.currentPeriodEnd
      ? new Date(premiumStatus.currentPeriodEnd)
      : null,
    plan: premiumStatus?.plan ?? null,
    cancelAtPeriodEnd: premiumStatus?.cancelAtPeriodEnd ?? false,
    benefits,
    applyMultiplier,
  };
}
