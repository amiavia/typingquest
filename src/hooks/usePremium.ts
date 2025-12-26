/**
 * PRP-030: Clerk Billing Integration Hook
 *
 * Uses Clerk's has() helper to check premium status.
 * Replaces the previous Convex-based premium checking.
 */

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
  plan: "free" | "premium_monthly" | null;
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
  const { has, isLoaded } = useAuth();

  // Check premium plan using Clerk Billing's has() helper
  // Clerk uses a single plan with both monthly and annual billing options
  // Plan key: premium_monthly (covers both billing frequencies)
  const isPremium = has?.({ plan: "premium_monthly" }) ?? false;

  // Note: Clerk's single plan covers both monthly and annual billing
  // The plan key is the same regardless of billing frequency
  const plan = isPremium ? "premium_monthly" : "free";

  const benefits = isPremium ? PREMIUM_BENEFITS : FREE_BENEFITS;

  const applyMultiplier = (coins: number): number => {
    return Math.round(coins * benefits.coinMultiplier);
  };

  return {
    isPremium,
    isLoading: !isLoaded,
    plan,
    benefits,
    applyMultiplier,
  };
}

/**
 * Helper to check specific premium features
 * Usage: const hasDoubleCoins = usePremiumFeature('double_coins');
 */
export function usePremiumFeature(feature: string): boolean {
  const { has } = useAuth();
  return has?.({ feature }) ?? false;
}
