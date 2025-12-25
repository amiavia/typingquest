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
  plan: "free" | "premium_monthly" | "premium_yearly" | null;
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

  // Check premium plans using Clerk Billing's has() helper
  // Plans must be configured in Clerk Dashboard:
  // - premium_monthly: $4.99/month
  // - premium_yearly: $39.99/year
  const isMonthly = has?.({ plan: "premium_monthly" }) ?? false;
  const isYearly = has?.({ plan: "premium_yearly" }) ?? false;
  const isPremium = isMonthly || isYearly;

  const plan = isYearly
    ? "premium_yearly"
    : isMonthly
      ? "premium_monthly"
      : "free";

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
