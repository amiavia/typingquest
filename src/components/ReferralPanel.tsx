/**
 * PRP-046: Referral Panel Component
 *
 * Displays user's referral code, stats, and sharing options.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';

export function ReferralPanel() {
  const { userId } = useAuth();
  const [copied, setCopied] = useState(false);

  // Get or create referral code
  const referralCode = useQuery(
    api.referrals.getMyReferralCode,
    userId ? { clerkId: userId } : 'skip'
  );
  const createCode = useMutation(api.referrals.createReferralCode);
  const stats = useQuery(
    api.referrals.getMyReferralStats,
    userId ? { clerkId: userId } : 'skip'
  );

  // Create code if user doesn't have one
  useEffect(() => {
    async function ensureCode() {
      if (userId && referralCode === null) {
        // Need username - for now use a placeholder based on clerkId
        await createCode({
          clerkId: userId,
          username: userId.substring(0, 8),
        });
      }
    }
    ensureCode();
  }, [userId, referralCode, createCode]);

  if (!userId) {
    return (
      <div
        className="p-6 text-center"
        style={{
          fontFamily: "'Press Start 2P'",
          background: '#1a1a2e',
          border: '3px solid #4a4a6e',
        }}
      >
        <p style={{ fontSize: '8px', color: '#4a4a6e' }}>
          SIGN IN TO ACCESS REFERRALS
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="p-6 text-center"
        style={{
          fontFamily: "'Press Start 2P'",
          background: '#1a1a2e',
          border: '3px solid #3bceac',
        }}
      >
        <p style={{ fontSize: '8px', color: '#3bceac' }}>LOADING...</p>
      </div>
    );
  }

  const referralLink = `https://typebit8.com/?ref=${stats.code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Learn Touch Typing with TypeBit8!',
        text: `I'm learning to type faster with TypeBit8! Use my code ${stats.code} for 30% off premium.`,
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="p-6"
      style={{
        fontFamily: "'Press Start 2P'",
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: '3px solid #ffd93d',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <span style={{ fontSize: '24px' }}>🎁</span>
        <h3 style={{ fontSize: '12px', color: '#ffd93d', marginTop: '8px' }}>
          INVITE FRIENDS
        </h3>
        <p style={{ fontSize: '7px', color: '#eef5db', marginTop: '4px', lineHeight: '1.8' }}>
          SHARE TYPEBIT8 AND EARN REWARDS
        </p>
      </div>

      {/* Referral Code Display */}
      <div
        className="p-4 mb-4 text-center"
        style={{
          background: 'rgba(255, 217, 61, 0.1)',
          border: '2px dashed #ffd93d',
        }}
      >
        <p style={{ fontSize: '6px', color: '#3bceac', marginBottom: '8px' }}>
          YOUR REFERRAL CODE
        </p>
        <p style={{ fontSize: '16px', color: '#ffd93d', letterSpacing: '2px' }}>
          {stats.code || '...'}
        </p>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 transition-all hover:scale-105"
          style={{
            fontSize: '8px',
            background: copied ? '#0ead69' : '#3bceac',
            color: '#0f0f1b',
            border: 'none',
          }}
        >
          {copied ? '✓ COPIED!' : '📋 COPY LINK'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-3 transition-all hover:scale-105"
          style={{
            fontSize: '8px',
            background: 'linear-gradient(180deg, #ffd93d, #f97316)',
            color: '#0f0f1b',
            border: 'none',
          }}
        >
          📤 SHARE
        </button>
      </div>

      {/* Rewards Explanation */}
      <div
        className="p-4 mb-4"
        style={{
          background: 'rgba(59, 206, 172, 0.1)',
          border: '2px solid rgba(59, 206, 172, 0.3)',
        }}
      >
        <p style={{ fontSize: '8px', color: '#3bceac', marginBottom: '8px' }}>
          HOW IT WORKS
        </p>
        <div style={{ fontSize: '7px', color: '#eef5db', lineHeight: '2.2' }}>
          <div className="flex items-start gap-2 mb-2">
            <span>1️⃣</span>
            <span>FRIEND SIGNS UP WITH YOUR CODE</span>
          </div>
          <div className="flex items-start gap-2 mb-2">
            <span>2️⃣</span>
            <span>THEY GET <span style={{ color: '#ffd93d' }}>30% OFF</span> FIRST MONTH</span>
          </div>
          <div className="flex items-start gap-2">
            <span>3️⃣</span>
            <span>YOU GET <span style={{ color: '#ffd93d' }}>50% OFF</span> NEXT MONTH</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-3 text-center"
          style={{
            background: 'rgba(255, 217, 61, 0.1)',
            border: '2px solid rgba(255, 217, 61, 0.3)',
          }}
        >
          <p style={{ fontSize: '20px', color: '#ffd93d' }}>
            {stats.totalReferrals}
          </p>
          <p style={{ fontSize: '6px', color: '#3bceac' }}>REFERRALS</p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            background: 'rgba(14, 173, 105, 0.1)',
            border: '2px solid rgba(14, 173, 105, 0.3)',
          }}
        >
          <p style={{ fontSize: '20px', color: '#0ead69' }}>
            {stats.earnedCredits}%
          </p>
          <p style={{ fontSize: '6px', color: '#3bceac' }}>CREDITS EARNED</p>
        </div>
      </div>

      {/* Pending Credits Notice */}
      {stats.pendingCredits > 0 && (
        <div
          className="mt-4 p-3 text-center"
          style={{
            background: 'rgba(255, 107, 157, 0.1)',
            border: '2px solid #ff6b9d',
          }}
        >
          <p style={{ fontSize: '7px', color: '#ff6b9d' }}>
            🎉 {stats.pendingCredits}% CREDITS PENDING!
          </p>
          <p style={{ fontSize: '6px', color: '#4a4a6e', marginTop: '4px' }}>
            APPLIED TO YOUR NEXT BILLING
          </p>
        </div>
      )}

      {/* Fine Print */}
      <p style={{ fontSize: '5px', color: '#4a4a6e', marginTop: '16px', textAlign: 'center', lineHeight: '1.8' }}>
        REFERRAL REWARDS APPLY WHEN YOUR FRIEND SUBSCRIBES TO PREMIUM.
        <br />
        NO LIMIT ON REFERRALS. 2 REFERRALS = 1 FREE MONTH!
      </p>
    </div>
  );
}
