# PRP-040: Mobile Experience & Desktop Handoff

## Status: Implemented

## Summary

TypeBit8 is designed for physical keyboards. When users visit on mobile without an external keyboard, show a polished landing page that explains the requirement and provides seamless ways to continue on desktop.

## Problem Statement

Currently, mobile users arriving at TypeBit8 encounter an experience designed for desktop:
- Speed test requires physical keyboard input
- Touch keyboard typing defeats the purpose of learning touch typing
- Users may be confused, frustrated, or bounce immediately
- No clear path to continue on a proper device
- Missed opportunity to capture interested users

## Goals

1. **Detect mobile + no external keyboard** reliably
2. **Explain clearly** why desktop/physical keyboard is needed
3. **Seamless handoff** to desktop via multiple methods
4. **Support external keyboards** on tablets/phones
5. **Brand the experience** - mobile page should still feel premium
6. **Capture interest** - don't lose potential users

## Non-Goals

- Building a touch-typing experience for mobile
- Full mobile app functionality
- SMS-based link sending (privacy/cost concerns)

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Mobile bounce rate | <40% (vs current ~90%+) | Analytics |
| Desktop conversion | >25% of mobile visitors return on desktop | Cross-device tracking |
| External keyboard success | >90% proceed successfully | `external_keyboard_verified` |
| Time on mobile page | >15 seconds | Engagement metric |

## User Flow

```
Mobile Visit
    │
    ▼
┌─────────────────────────┐
│   Detect Device Type    │
│  + Input Capabilities   │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
 Mobile          Desktop/
 (touch)         External KB
    │               │
    ▼               ▼
┌─────────┐    ┌──────────┐
│ Mobile  │    │  Normal  │
│ Landing │    │   Flow   │
│  Page   │    │(SpeedTest)│
└────┬────┘    └──────────┘
     │
     ▼
┌─────────────────────────┐
│   Handoff Options:      │
│   • URL display         │
│   • Remember for later  │
│   • Copy URL            │
│   • "I have a keyboard" │
└─────────────────────────┘
```

## Technical Approach

### 1. Device & Input Detection

```typescript
// src/hooks/useDeviceDetection.ts

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  hasTouchScreen: boolean;
  hasPhysicalKeyboard: boolean | 'unknown';
  userAgent: string;
}

export function useDeviceDetection(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    hasTouchScreen: false,
    hasPhysicalKeyboard: 'unknown',
    userAgent: '',
  });

  useEffect(() => {
    // Primary detection: screen size + touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;

    // User agent hints (secondary)
    const ua = navigator.userAgent.toLowerCase();
    const mobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const tabletUA = /ipad|android(?!.*mobile)/i.test(ua);

    setCapabilities({
      isMobile: (isSmallScreen && isTouchDevice) || mobileUA,
      isTablet: (isMediumScreen && isTouchDevice) || tabletUA,
      hasTouchScreen: isTouchDevice,
      hasPhysicalKeyboard: 'unknown', // Determined by keyboard test
      userAgent: ua,
    });
  }, []);

  return capabilities;
}
```

### 2. External Keyboard Verification

For users who claim they have an external keyboard, verify before proceeding:

```typescript
// src/components/KeyboardVerification.tsx

interface KeyboardVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function KeyboardVerification({ onVerified, onCancel }: KeyboardVerificationProps) {
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const requiredKeys = ['a', 's', 'd', 'f']; // Home row test

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Touch keyboards don't fire reliable keydown events with proper codes
      // Physical keyboards will have e.code like "KeyA", "KeyS", etc.
      if (e.code && e.code.startsWith('Key')) {
        const key = e.key.toLowerCase();
        if (requiredKeys.includes(key) && !keysPressed.includes(key)) {
          setKeysPressed(prev => [...prev, key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keysPressed]);

  useEffect(() => {
    if (requiredKeys.every(k => keysPressed.includes(k))) {
      onVerified();
    }
  }, [keysPressed, onVerified]);

  return (
    <div className="keyboard-verification">
      <h3>Verify Your Keyboard</h3>
      <p>Place your fingers on the home row and press:</p>
      <div className="key-indicators">
        {requiredKeys.map(key => (
          <div
            key={key}
            className={`key ${keysPressed.includes(key) ? 'pressed' : ''}`}
          >
            {key.toUpperCase()}
          </div>
        ))}
      </div>
      <button onClick={onCancel} className="cancel-btn">
        Never mind, I'll use desktop
      </button>
    </div>
  );
}
```

### 3. Mobile Landing Page Component

```typescript
// src/components/MobileLanding.tsx

interface MobileLandingProps {
  onKeyboardVerified: () => void;
}

export function MobileLanding({ onKeyboardVerified }: MobileLandingProps) {
  const [showKeyboardTest, setShowKeyboardTest] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRememberForLater = () => {
    const subject = encodeURIComponent('TypeBit8 - Continue on Desktop');
    const body = encodeURIComponent(
      `Open this link on your desktop to start practicing:\n\n${currentUrl}\n\nTypeBit8 - Master touch typing`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (showKeyboardTest) {
    return (
      <KeyboardVerification
        onVerified={onKeyboardVerified}
        onCancel={() => setShowKeyboardTest(false)}
      />
    );
  }

  return (
    <div className="mobile-landing">
      {/* Hero Section */}
      <div className="mobile-hero">
        <div className="logo">
          <TypeBit8Logo />
        </div>
        <h1>Master Touch Typing</h1>
        <p className="tagline">
          Learn to type without looking at your keyboard
        </p>
      </div>

      {/* Explanation */}
      <div className="explanation">
        <div className="keyboard-icon">
          <PhysicalKeyboardIcon />
        </div>
        <h2>Physical Keyboard Required</h2>
        <p>
          TypeBit8 teaches touch typing on physical keyboards.
          Open on your desktop or laptop to get started.
        </p>
      </div>

      {/* Easy URL Section */}
      <div className="url-section">
        <h3>Open on your desktop</h3>
        <div className="url-display">
          <span className="url-text">typebit8.com</span>
        </div>
        <p className="url-hint">
          Type this in your desktop browser to continue
        </p>
      </div>

      {/* Alternative Options */}
      <div className="alternatives">
        <button onClick={handleRememberForLater} className="option-btn remember">
          <BookmarkIcon />
          <span>Remember for later</span>
        </button>

        <button onClick={handleCopyLink} className="option-btn copy">
          <CopyIcon />
          <span>{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
      </div>

      {/* External Keyboard Option */}
      <div className="external-keyboard-option">
        <button
          onClick={() => setShowKeyboardTest(true)}
          className="keyboard-btn"
        >
          I have a keyboard connected
        </button>
        <p className="keyboard-hint">
          Using a Bluetooth or USB keyboard? Tap to verify and continue.
        </p>
      </div>

      {/* Footer */}
      <footer className="mobile-footer">
        <p>Free typing lessons for QWERTY, QWERTZ & AZERTY keyboards</p>
      </footer>
    </div>
  );
}
```

### 4. App.tsx Integration

```typescript
// src/App.tsx - Updated flow

function App() {
  const { isMobile, isTablet, hasPhysicalKeyboard } = useDeviceDetection();
  const [keyboardVerified, setKeyboardVerified] = useState(false);

  // Show mobile landing if:
  // - Device is mobile/tablet
  // - AND no physical keyboard verified
  // - AND not already dismissed/verified
  const showMobileLanding = (isMobile || isTablet) && !keyboardVerified;

  if (showMobileLanding) {
    return (
      <MobileLanding
        onKeyboardVerified={() => setKeyboardVerified(true)}
      />
    );
  }

  // Normal desktop flow
  return (
    <KeyboardLayoutProvider>
      {/* ... existing app */}
    </KeyboardLayoutProvider>
  );
}
```


## Design Specifications

### Mobile Landing Page Layout

```
┌─────────────────────────────┐
│                             │
│      [TypeBit8 Logo]        │
│                             │
│   Master Touch Typing       │
│   Learn to type without     │
│   looking at your keyboard  │
│                             │
├─────────────────────────────┤
│                             │
│    ⌨️  [Keyboard Icon]       │
│                             │
│  Physical Keyboard Required │
│                             │
│  TypeBit8 teaches touch     │
│  typing on physical         │
│  keyboards. Open on your    │
│  desktop to get started.    │
│                             │
├─────────────────────────────┤
│                             │
│   Open on your desktop      │
│                             │
│      ┌───────────────┐      │
│      │               │      │
│      │ typebit8.com  │      │
│      │               │      │
│      └───────────────┘      │
│                             │
│   Type this URL in your     │
│   desktop browser           │
│                             │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │ 🔖 Remember for later│    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 📋  Copy link       │    │
│  └─────────────────────┘    │
│                             │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │ ⌨️ I have a keyboard │    │
│  └─────────────────────┘    │
│  Bluetooth/USB? Tap to      │
│  verify and continue.       │
│                             │
├─────────────────────────────┤
│  Free typing lessons for    │
│  QWERTY, QWERTZ & AZERTY    │
└─────────────────────────────┘
```

### Color & Typography

- Match existing TypeBit8 brand colors
- Large, readable text (min 16px body)
- High contrast for outdoor/sunlight readability
- Touch targets min 44x44px (Apple HIG)

### Animations

- Subtle fade-in on load
- QR code gentle pulse to draw attention
- Button press feedback
- "Copied!" / "Sent!" confirmation animations

## Keyboard Verification UX

When user taps "I have a keyboard":

```
┌─────────────────────────────┐
│                             │
│    Verify Your Keyboard     │
│                             │
│  Place your fingers on the  │
│  home row and press:        │
│                             │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│    │ A │ │ S │ │ D │ │ F │  │
│    └───┘ └───┘ └───┘ └───┘  │
│     ✓     ✓     ○     ○     │
│                             │
│  ──────────────────────────  │
│                             │
│  [Never mind, use desktop]  │
│                             │
└─────────────────────────────┘
```

- Keys light up green as pressed
- All 4 pressed = auto-proceed with success animation
- Prevents false positives from touch keyboard (no reliable keyCode)

## Analytics Events

```typescript
// Mobile landing events
trackEvent('mobile_landing_shown', {
  device: 'mobile' | 'tablet',
  referrer: document.referrer
});

trackEvent('mobile_handoff_method', {
  method: 'remember_for_later' | 'link_copied'
});

trackEvent('external_keyboard_test_started');

trackEvent('external_keyboard_verified', {
  device: 'mobile' | 'tablet'
});

trackEvent('external_keyboard_test_cancelled');

// Cross-device tracking (if user signs in on both)
trackEvent('desktop_conversion_from_mobile', {
  timeToConvert: number // minutes between mobile visit and desktop visit
});
```

## Edge Cases

### 1. Tablet with Detachable Keyboard
- User starts with keyboard attached → normal flow
- Keyboard detached mid-session → warning modal
- Re-attach → resume without verification

### 2. iPad + Magic Keyboard
- Will pass keyboard verification
- Proceed to normal speed test
- Layout detection works normally

### 3. Desktop with Touch Screen
- Touch capability detected but large screen
- Don't show mobile landing
- Use screen width as primary signal

### 4. Chromebook / 2-in-1 Laptops
- Has both touch and physical keyboard
- Screen size check takes precedence
- Proceed to normal flow

### 5. User Rotates to Landscape
- Responsive layout adjusts
- QR code remains scannable
- All buttons remain accessible

## Implementation Phases

### Phase 1: Core Detection & Landing
- [ ] `useDeviceDetection` hook
- [ ] `MobileLanding` component
- [ ] URL display section
- [ ] Copy link functionality
- [ ] "Remember for later" functionality (mailto:)
- [ ] App.tsx integration

### Phase 2: Keyboard Verification
- [ ] `KeyboardVerification` component
- [ ] Home row key detection
- [ ] Success/failure states
- [ ] Proceed to normal flow on success

### Phase 3: Polish & Analytics
- [ ] Animations and transitions
- [ ] Analytics events
- [ ] Cross-device tracking setup
- [ ] A/B test URL display prominence vs "Remember for later" button

### Phase 4: Persistence & Optimization
- [ ] Remember verified keyboard in localStorage
- [ ] Don't re-verify on return visits

## Dependencies

### New Packages
None required - uses only standard browser APIs.

### Files to Create
- `src/hooks/useDeviceDetection.ts`
- `src/components/MobileLanding.tsx`
- `src/components/KeyboardVerification.tsx`
- `src/components/mobile/MobileHero.tsx`
- `src/components/mobile/HandoffOptions.tsx`

### Files to Modify
- `src/App.tsx` - Add mobile detection gate
- `src/index.css` - Mobile-specific styles

## Accessibility

- Email/copy buttons are keyboard accessible (for external KB users)
- High contrast mode support
- Reduced motion option for animations
- Screen reader announces verification progress
- URL display is selectable for screen reader users

## Security Considerations

- Email link uses mailto: (no server-side email, no data sent to our servers)
- No tracking pixels in email body
- Copy uses standard clipboard API
- No PII collected on mobile landing page

## Future Enhancements

1. **Push notification**: "Your desktop session is ready" when user opens on desktop
2. **Account linking**: Sign in on mobile, session ready on desktop
3. **Progress sync**: Start on tablet with keyboard, continue on desktop
4. **Native app prompt**: "Add to home screen" for easy return

## Open Questions

1. **Conversion tracking**: Should we add UTM params to track "remember for later"->desktop conversion?
2. **Keyboard re-verification**: How often? Every session? Once per device?
3. **Landscape mode**: Optimize layout for landscape tablet orientation?
4. **URL display**: Show full URL with path if user came from specific lesson/page?
