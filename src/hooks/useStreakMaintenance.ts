/**
 * PRP-027 Task 4.4: Streak Maintenance Logic Hook
 *
 * Runs on app load to check streak status and show warnings.
 */

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";

export interface UseStreakMaintenanceResult {
  currentStreak: number;
  isStreakAtRisk: boolean;
  isStreakBroken: boolean;
  hasActivityToday: boolean;
  freezeCount: number;
  canUseFreeze: boolean;
  useFreeze: () => Promise<boolean>;
  recordActivity: () => Promise<void>;
}

export function useStreakMaintenance(): UseStreakMaintenanceResult {
  const { userId } = useAuth();
  const [hasRecordedToday, setHasRecordedToday] = useState(false);

  const streak = useQuery(
    api.streaks.getStreak,
    userId ? { clerkId: userId } : "skip"
  );

  const recordActivityMutation = useMutation(api.streaks.recordActivity);
  const useFreezeMutation = useMutation(api.streaks.useStreakFreeze);

  const currentStreak = streak?.currentStreak ?? 0;
  const isActiveToday = streak?.isActiveToday ?? false;
  const isAtRisk = streak?.isAtRisk ?? false;
  const freezeCount = streak?.streakFreezeCount ?? 0;

  // Determine if streak is broken (not active today, at risk, and no freeze used)
  const isStreakBroken =
    currentStreak === 0 && !isActiveToday && streak !== undefined;

  const canUseFreeze = isAtRisk && freezeCount > 0 && !isActiveToday;

  const useFreeze = useCallback(async (): Promise<boolean> => {
    if (!userId || !canUseFreeze) return false;

    try {
      const result = await useFreezeMutation({ clerkId: userId });
      return result?.success ?? false;
    } catch (error) {
      console.error("Failed to use streak freeze:", error);
      return false;
    }
  }, [userId, canUseFreeze, useFreezeMutation]);

  const recordActivity = useCallback(async (): Promise<void> => {
    if (!userId || hasRecordedToday) return;

    try {
      await recordActivityMutation({ clerkId: userId });
      setHasRecordedToday(true);
    } catch (error) {
      console.error("Failed to record activity:", error);
    }
  }, [userId, hasRecordedToday, recordActivityMutation]);

  // Reset recorded today flag at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setHasRecordedToday(false);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  // Sync with server on whether activity was recorded today
  useEffect(() => {
    if (isActiveToday) {
      setHasRecordedToday(true);
    }
  }, [isActiveToday]);

  return {
    currentStreak,
    isStreakAtRisk: isAtRisk,
    isStreakBroken,
    hasActivityToday: isActiveToday || hasRecordedToday,
    freezeCount,
    canUseFreeze,
    useFreeze,
    recordActivity,
  };
}
