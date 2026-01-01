# PRP-051: New Year 2025 Promotion Strategy

**Status:** IMPLEMENTED
**Created:** January 1, 2025
**Campaign Period:** January 1-14, 2025

---

## Overview

A 14-day New Year promotion offering 50% off TypeBit8 Premium to drive first conversions and establish paying customer base.

### Goals
- [ ] First 10+ paying customers
- [ ] Validate pricing and conversion funnel
- [ ] Build email list engagement
- [ ] Establish social media presence

---

## Offer Details

| Attribute | Value |
|-----------|-------|
| Discount | 50% off first payment |
| Code | `NEWYEAR25` |
| Duration | January 1-14, 2025 |
| Applies to | Monthly and Yearly plans |

### Pricing During Promotion

| Plan | Regular | Promo Price |
|------|---------|-------------|
| Monthly (Standard) | $4.99/mo | $2.50 first month |
| Yearly (Standard) | $39.99/yr | $19.99 first year |
| Monthly (Emerging) | $1.99/mo | $0.99 first month |
| Yearly (Emerging) | $14.99/yr | $7.50 first year |

---

## Implementation Checklist

### Stripe Configuration
- [x] Create coupon `NEWYEAR25` (50% off, once)
- [x] Coupon works for all price tiers
- [x] `allow_promotion_codes: true` in checkout

### Website Components
- [x] `NewYearBanner.tsx` - Announcement banner with countdown
- [x] Banner dismissible with localStorage persistence
- [x] Banner auto-hides after Jan 14, 2025
- [x] PremiumPage promo banner with countdown
- [x] Strike-through original prices during promo
- [x] Discounted prices shown in green
- [x] "50% OFF!" badge on yearly plan
- [x] Promo code hint at bottom of pricing section

### Email Campaign
- [x] 6 email templates created:
  1. `launch` - Jan 1: Launch announcement
  2. `value` - Jan 4: Value proposition (2x AI productivity)
  3. `week` - Jan 7: 1 week left reminder
  4. `3days` - Jan 11: 3 days left urgency
  5. `lastday` - Jan 13: Last day warning
  6. `final` - Jan 14: Final hours
- [x] `sendNewYearPromoEmail` action in `convex/emails.ts`
- [x] All emails include unsubscribe link
- [x] UTM tracking parameters on all links

### Social Media
- [x] X/Twitter content calendar (7 posts)
- [x] TikTok content calendar (6 videos)
- [x] Hashtag strategy documented
- [x] Posting schedule documented
- [ ] Actually post content (manual execution)

---

## Technical Implementation

### Files Created/Modified

| File | Changes |
|------|---------|
| `src/components/NewYearBanner.tsx` | New component with countdown |
| `src/components/PremiumPage.tsx` | Added promo display, strike-through prices |
| `src/App.tsx` | Added NewYearBanner import and usage |
| `convex/emails.ts` | Added 6 New Year email templates |
| `social/NEW-YEAR-2025-CAMPAIGN.md` | Social content calendar |

### Promo Detection Logic

```typescript
// Promotion dates
const PROMO_START_DATE = new Date('2025-01-01T00:00:00Z').getTime();
const PROMO_END_DATE = new Date('2025-01-14T23:59:59Z').getTime();

function isPromoActive(): boolean {
  const now = Date.now();
  return now >= PROMO_START_DATE && now <= PROMO_END_DATE;
}
```

### Countdown Calculation

```typescript
function calculateTimeLeft(): { days: number; hours: number; minutes: number } | null {
  const now = Date.now();
  if (now < PROMO_START_DATE || now > PROMO_END_DATE) return null;

  const difference = PROMO_END_DATE - now;
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
  };
}
```

---

## Email Schedule

| Date | Campaign | Subject |
|------|----------|---------|
| Jan 1 | `launch` | 2025 Deal: 50% Off TypeBit8 Premium |
| Jan 4 | `value` | The one skill that will 2x your AI output in 2025 |
| Jan 7 | `week` | 1 Week Left: 50% Off Premium |
| Jan 11 | `3days` | 3 Days Left to Save 50% |
| Jan 13 | `lastday` | LAST DAY: 50% Off Ends Tomorrow |
| Jan 14 | `final` | HOURS LEFT: Your 50% Discount Expires Tonight |

### Sending Emails

```typescript
// To send promo email to all leads:
await ctx.runAction(internal.emails.sendNewYearPromoEmail, {
  email: "user@example.com",
  campaign: "launch" // or "value", "week", "3days", "lastday", "final"
});
```

---

## Post-Campaign Tasks

### January 15, 2025
- [ ] Remove `NewYearBanner` from App.tsx (or let it auto-hide)
- [ ] Clear localStorage `typebit8_newyear_banner_dismissed` keys
- [ ] Document campaign results
- [ ] Analyze conversion metrics
- [ ] Plan next promotion based on learnings

### Metrics to Capture
- Total promo codes used
- Revenue generated
- Email open/click rates
- Social engagement
- Traffic sources

---

## Success Criteria

| Metric | Target | Actual |
|--------|--------|--------|
| Email sends | 6 campaigns | - |
| Email open rate | >40% | - |
| Email click rate | >10% | - |
| Premium page visits | 500+ | - |
| Conversions | 10+ | - |
| Revenue | $200+ | - |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Coupon abuse | One-time use, Stripe handles this |
| Banner fatigue | Dismissible with localStorage |
| Email spam complaints | Unsubscribe link in every email |
| Checkout failures | Stripe webhook properly configured |

---

## Related PRPs

- PRP-046: Growth and Conversion Strategy (parent initiative)
- PRP-048: Stripe Migration (enables checkout)
- PRP-050: Internationalization (multi-language support)
