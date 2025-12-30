/**
 * PRP-046: Referral Code Hook
 *
 * Handles referral code detection from URL, storage, and redemption.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const REFERRAL_STORAGE_KEY = 'typebit8_referral_code';

/**
 * Get referral code from URL or localStorage
 */
export function getReferralCode(): string | null {
  // Check URL first
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      // Store in localStorage for persistence
      localStorage.setItem(REFERRAL_STORAGE_KEY, refCode.toUpperCase());
      // Clean URL without losing other params
      params.delete('ref');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return refCode.toUpperCase();
    }
    // Fall back to localStorage
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  }
  return null;
}

/**
 * Clear stored referral code (after successful redemption)
 */
export function clearReferralCode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  }
}

/**
 * Hook to manage referral code lifecycle
 */
export function useReferral() {
  const { userId, isSignedIn } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const redeemCode = useMutation(api.referrals.redeemReferralCode);
  const pendingReferral = useQuery(
    api.referrals.getMyPendingReferral,
    userId ? { clerkId: userId } : 'skip'
  );

  // Detect referral code on mount
  useEffect(() => {
    const code = getReferralCode();
    if (code) {
      setReferralCode(code);
    }
  }, []);

  // Auto-redeem when user signs in with a stored referral code
  useEffect(() => {
    async function redeemOnSignup() {
      if (isSignedIn && userId && referralCode && !isRedeemed) {
        try {
          const result = await redeemCode({
            code: referralCode,
            refereeClerkId: userId,
          });

          if (result.success) {
            console.log('[Referral] Code redeemed successfully:', referralCode);
            clearReferralCode();
            setIsRedeemed(true);
          } else {
            console.log('[Referral] Redemption failed:', result.error);
            // Clear invalid code
            if (result.error === 'Invalid referral code') {
              clearReferralCode();
            }
          }
        } catch (err) {
          console.error('[Referral] Error redeeming code:', err);
        }
      }
    }

    redeemOnSignup();
  }, [isSignedIn, userId, referralCode, isRedeemed, redeemCode]);

  return {
    referralCode,
    pendingReferral,
    hasDiscount: !!pendingReferral && !pendingReferral.refereeCouponUsed,
    discountCode: 'FRIEND30', // 30% off for referee
  };
}
