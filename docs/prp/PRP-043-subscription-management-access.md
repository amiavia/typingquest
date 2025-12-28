# PRP-043: Subscription Management Access

## Status: Implemented

## Summary

Add accessible navigation for premium users to manage their subscription (view status, cancel, update payment). Currently, premium users have no way to reach the subscription management UI because the "PREMIUM" upgrade button is hidden once they subscribe.

## Problem Statement

After subscribing to premium:
1. The "PREMIUM" button in the header is replaced with a non-clickable `PremiumBadge`
2. The `UserButton` dropdown only has: Change Avatar, Edit Nickname, Sign Out
3. The `PremiumPage` component has a "MANAGE SUBSCRIPTION" button that opens Clerk's UserProfile with billing management
4. **But premium users cannot navigate to the PremiumPage** - it's unreachable

This means:
- Users cannot cancel their subscription from within the app
- Users cannot view their billing status
- Users cannot update their payment method
- This violates user expectations and potentially consumer protection regulations

## Goals

1. **Allow premium users to access subscription management** from within the app
2. **Minimal UI changes** - add to existing patterns
3. **Clear path to cancellation** - meet user expectations and legal requirements

## Non-Goals

- Changing the Premium page layout
- Building custom billing UI (we use Clerk's built-in components)
- Adding billing notifications/reminders

## Solution: Add "Manage Subscription" to UserButton

Add a conditional menu item in the UserButton dropdown that only appears for premium users.

### UI Design

```
┌──────────────────────────────────┐
│  Anton                           │
│  anton@example.com               │
├──────────────────────────────────┤
│  🎨 CHANGE AVATAR                │
│  ✏️ EDIT NICKNAME                │
├──────────────────────────────────┤  ← New divider
│  👑 MANAGE SUBSCRIPTION          │  ← New item (premium only)
├──────────────────────────────────┤
│  🚪 SIGN OUT                     │
└──────────────────────────────────┘
```

### Alternative Considered: Clickable PremiumBadge

We could make the `PremiumBadge` in the header clickable to navigate to the Premium page. However:
- Badges are not typically interactive UI elements
- Users expect account/billing settings in their profile menu
- The UserButton is the established pattern for account actions

**Decision**: Add to UserButton dropdown (Option A) as it aligns with user expectations.

## Implementation

### Files to Modify

| File | Change |
|------|--------|
| `src/components/UserButton.tsx` | Add "Manage Subscription" menu item |
| `src/hooks/usePremium.ts` | Already exports `isPremium` - no change needed |

### Code Changes

#### UserButton.tsx

```tsx
// Add import
import { usePremium } from '../hooks/usePremium';

// Inside UserButton component, add:
const { isPremium } = usePremium();

// Add prop for navigation
interface UserButtonProps {
  userLevel?: number;
  onOpenShop?: () => void;
  onOpenPremium?: () => void;  // NEW
}

// In the dropdown menu, after "Edit Nickname" and before "Sign Out":
{isPremium && (
  <button
    onClick={() => {
      setShowMenu(false);
      onOpenPremium?.();
    }}
    className="w-full px-4 py-3 text-left hover:bg-[#2a2a3e] transition-colors flex items-center gap-2"
    style={{
      fontFamily: "'Press Start 2P'",
      fontSize: '6px',
      color: '#ffd93d',
    }}
  >
    <span>👑</span> MANAGE SUBSCRIPTION
  </button>
)}
```

#### App.tsx

```tsx
// Update UserButton usage (around line 568):
<UserButton
  userLevel={gameState.level}
  onOpenShop={() => navigateTo('shop')}
  onOpenPremium={() => navigateTo('premium')}  // NEW
/>
```

## User Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User clicks   │────▶│   Dropdown menu  │────▶│   Premium Page  │
│   avatar        │     │   appears        │     │   loads         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                │ Click "Manage          │ Click "Manage
                                │ Subscription"          │ Subscription"
                                ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   navigateTo     │────▶│   Clerk         │
                        │   ('premium')    │     │   UserProfile   │
                        └──────────────────┘     │   (billing tab) │
                                                 └─────────────────┘
                                                         │
                                                         │ User can:
                                                         │ - View status
                                                         │ - Cancel
                                                         │ - Update payment
                                                         ▼
                                                 ┌─────────────────┐
                                                 │   Subscription  │
                                                 │   managed!      │
                                                 └─────────────────┘
```

## Testing

### Manual Test Cases

1. **Non-premium user**: "Manage Subscription" should NOT appear in dropdown
2. **Premium user**: "Manage Subscription" SHOULD appear in dropdown
3. **Click flow**: Clicking "Manage Subscription" navigates to Premium page
4. **Cancellation**: User can successfully cancel via Clerk UI

### Test Account Setup

Use Stripe test mode to create a test subscription, then verify the flow.

## Success Metrics

| Metric | Target |
|--------|--------|
| Support tickets re: cancellation | -90% |
| Time to cancel (user flow) | < 30 seconds |
| Subscription management page views | Trackable baseline |

## Rollout Plan

1. Implement changes in development
2. Test with Stripe test mode subscription
3. Deploy to production
4. Monitor for issues

## Timeline

- Implementation: ~30 minutes
- Testing: ~15 minutes
- Total: < 1 hour

## Open Questions

None - straightforward implementation.
