/**
 * PRP-048: Direct Stripe Premium Hook
 *
 * Uses Convex subscription data (populated by Stripe webhooks) to check premium status.
 * Replaces the previous Clerk Billing-based checking.
 */

import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface PremiumBenefits {
  coinMultiplier: number;
  xpMultiplier: number;
  freeStreakFreezes: number;
  exclusiveShopAccess: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

export interface SubscriptionInfo {
  status: string;
  plan: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface UsePremiumResult {
  isPremium: boolean;
  isLoading: boolean;
  plan: "free" | "monthly" | "yearly" | null;
  benefits: PremiumBenefits;
  subscription: SubscriptionInfo | null;
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
  const { userId, isLoaded: authLoaded } = useAuth();

  // Query subscription from Convex (populated by Stripe webhooks)
  const subscription = useQuery(
    api.subscriptions.getActiveSubscription,
    userId ? { clerkId: userId } : "skip"
  );

  const isLoading = !authLoaded || subscription === undefined;

  // Check if subscription is active
  const isPremium =
    subscription !== null &&
    subscription !== undefined &&
    ["active", "trialing"].includes(subscription.status);

  // Get plan type
  const plan = isPremium
    ? (subscription?.plan as "monthly" | "yearly")
    : "free";

  const benefits = isPremium ? PREMIUM_BENEFITS : FREE_BENEFITS;

  const applyMultiplier = (coins: number): number => {
    return Math.round(coins * benefits.coinMultiplier);
  };

  return {
    isPremium,
    isLoading,
    plan,
    benefits,
    subscription: subscription
      ? {
          status: subscription.status,
          plan: subscription.plan,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    applyMultiplier,
  };
}

/**
 * Simple boolean check for premium status
 * For use in components that only need to know if user is premium
 */
export function useIsPremium(): boolean {
  const { isPremium } = usePremium();
  return isPremium;
}

/**
 * Helper to check specific premium features
 * Returns true if user has premium access
 */
export function usePremiumFeature(_feature: string): boolean {
  const { isPremium } = usePremium();
  // All premium features are included in subscription
  return isPremium;
}
