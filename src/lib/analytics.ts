/**
 * PRP-027 Task 5.5: Analytics Events
 *
 * Track key user events for analytics.
 */

export type AnalyticsEvent =
  | "level_start"
  | "level_complete"
  | "quiz_start"
  | "quiz_complete"
  | "challenge_start"
  | "challenge_attempt"
  | "challenge_complete"
  | "streak_milestone"
  | "streak_broken"
  | "streak_freeze_used"
  | "purchase_item"
  | "purchase_attempt"
  | "equip_item"
  | "premium_subscribe"
  | "premium_cancel"
  | "premium_page_view"
  | "shop_page_view"
  | "signup_start"
  | "signup_complete"
  | "login";

export interface AnalyticsProperties {
  // Level events
  levelId?: number;
  tier?: number;
  wpm?: number;
  accuracy?: number;
  timeElapsed?: number;

  // Challenge events
  challengeType?: string;
  challengeTier?: string;
  targetValue?: number;
  achievedValue?: number;

  // Streak events
  streakCount?: number;
  milestone?: number;

  // Purchase events
  itemId?: string;
  itemName?: string;
  itemCategory?: string;
  itemPrice?: number;
  currency?: string;

  // Premium events
  plan?: string;
  priceId?: string;

  // Generic
  source?: string;
  referrer?: string;
}

// Simple analytics implementation
// In production, replace with actual analytics provider (Mixpanel, Amplitude, etc.)
class Analytics {
  private enabled: boolean;
  private userId: string | null;
  private sessionId: string;

  constructor() {
    this.enabled = true; // Can be controlled by user preference
    this.userId = null;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    if (!this.enabled) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        url: typeof window !== "undefined" ? window.location.pathname : null,
      },
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("[Analytics]", eventData);
    }

    // In production, send to analytics backend
    // this.sendToBackend(eventData);
  }

  // Track page views
  pageView(pageName: string): void {
    this.track("shop_page_view", { source: pageName });
  }

  // Convenience methods for common events
  trackLevelComplete(
    levelId: number,
    wpm: number,
    accuracy: number,
    timeElapsed: number
  ): void {
    this.track("level_complete", {
      levelId,
      wpm,
      accuracy,
      timeElapsed,
      tier: Math.ceil(levelId / 5),
    });
  }

  trackQuizComplete(
    levelId: number,
    passed: boolean,
    wpm: number,
    accuracy: number
  ): void {
    this.track("quiz_complete", {
      levelId,
      wpm,
      accuracy,
      source: passed ? "passed" : "failed",
    });
  }

  trackChallengeComplete(
    challengeType: string,
    tier: string,
    achievedValue: number,
    targetValue: number
  ): void {
    this.track("challenge_complete", {
      challengeType,
      challengeTier: tier,
      achievedValue,
      targetValue,
    });
  }

  trackStreakMilestone(streakCount: number): void {
    this.track("streak_milestone", {
      streakCount,
      milestone: streakCount,
    });
  }

  trackPurchase(
    itemId: string,
    itemName: string,
    itemCategory: string,
    price: number
  ): void {
    this.track("purchase_item", {
      itemId,
      itemName,
      itemCategory,
      itemPrice: price,
      currency: "coins",
    });
  }

  trackPremiumSubscribe(plan: string): void {
    this.track("premium_subscribe", {
      plan,
    });
  }

  trackPremiumCancel(plan: string): void {
    this.track("premium_cancel", {
      plan,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for analytics
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export function useAnalytics(): typeof analytics {
  const { userId } = useAuth();

  useEffect(() => {
    analytics.setUserId(userId ?? null);
  }, [userId]);

  return analytics;
}
