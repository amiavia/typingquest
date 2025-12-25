/**
 * PRP-031: Premium Sync Provider
 *
 * Syncs Clerk Billing premium status to Convex database.
 * This ensures the backend (shop, coins) can check premium status.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePremium } from "../hooks/usePremium";

interface PremiumSyncProviderProps {
  children: React.ReactNode;
}

export function PremiumSyncProvider({ children }: PremiumSyncProviderProps) {
  const { userId, isLoaded: authLoaded } = useAuth();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const syncPremiumStatus = useMutation(api.premium.syncPremiumStatus);

  // Track last synced value to avoid unnecessary mutations
  const lastSyncedRef = useRef<{ clerkId: string; isPremium: boolean } | null>(null);

  useEffect(() => {
    // Wait for both auth and premium status to load
    if (!authLoaded || premiumLoading || !userId) {
      return;
    }

    // Check if we need to sync (value changed)
    const lastSynced = lastSyncedRef.current;
    if (lastSynced?.clerkId === userId && lastSynced?.isPremium === isPremium) {
      return; // No change, skip sync
    }

    // Sync premium status to Convex
    syncPremiumStatus({ clerkId: userId, isPremium })
      .then(() => {
        lastSyncedRef.current = { clerkId: userId, isPremium };
        console.log(`[PremiumSync] Synced premium status: ${isPremium}`);
      })
      .catch((error) => {
        console.error("[PremiumSync] Failed to sync premium status:", error);
      });
  }, [userId, isPremium, authLoaded, premiumLoading, syncPremiumStatus]);

  return <>{children}</>;
}
