import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  hasTouchScreen: boolean;
  hasPhysicalKeyboard: boolean | 'unknown';
}

/**
 * Synchronously detect device capabilities.
 * Used for initial state to avoid flash of wrong content.
 */
function getInitialCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      hasTouchScreen: false,
      hasPhysicalKeyboard: 'unknown',
    };
  }

  // Touch capability detection - primary signal for mobile/tablet
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Screen size detection
  const isSmallScreen = window.innerWidth < 768;
  const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isLargeScreen = window.innerWidth >= 1024;

  // User agent analysis
  const ua = navigator.userAgent;

  // Direct mobile UA detection
  const mobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

  // iPad detection (older iPads)
  const oldIPadUA = /ipad/i.test(ua);

  // iOS 13+ iPad detection: reports as Mac but has touch support
  // Check for Mac + touch capability (real Macs don't have touch)
  const isMacWithTouch = /macintosh|mac os x/i.test(ua) && isTouchDevice;

  // Additional iOS detection via platform (catches more cases)
  const platform = navigator.platform || '';
  const isIOSPlatform = /iPhone|iPod|iPad/.test(platform) ||
    (platform === 'MacIntel' && isTouchDevice && navigator.maxTouchPoints > 1);

  // Combine signals for mobile detection
  // Mobile: iPhone-sized screen with touch OR explicit mobile UA
  const isMobile = (isSmallScreen && isTouchDevice) || mobileUA;

  // Tablet: iPad or larger touch device that's not mobile
  // Catches: explicit iPad UA, iOS 13+ iPad (Mac + touch), medium screen touch devices
  const isTablet = !isMobile && (
    oldIPadUA ||
    isMacWithTouch ||
    isIOSPlatform ||
    (isMediumScreen && isTouchDevice) ||
    (isLargeScreen && isTouchDevice) // Large touch screen = tablet/iPad Pro
  );

  return {
    isMobile,
    isTablet,
    hasTouchScreen: isTouchDevice,
    hasPhysicalKeyboard: 'unknown',
  };
}

/**
 * Detects device type and input capabilities.
 * Used to gate mobile users to the MobileLanding page.
 */
export function useDeviceDetection(): DeviceCapabilities {
  // Initialize synchronously to avoid flash of desktop content on mobile
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(getInitialCapabilities);

  useEffect(() => {
    const detectDevice = () => {
      setCapabilities(getInitialCapabilities());
    };

    // Re-detect on resize (e.g., orientation change)
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return capabilities;
}

/**
 * Check if device should show mobile landing page.
 * Returns true for mobile/tablet devices without verified keyboard.
 */
export function shouldShowMobileLanding(
  capabilities: DeviceCapabilities,
  keyboardVerified: boolean
): boolean {
  // Show mobile landing if:
  // - Device is mobile or tablet
  // - AND no physical keyboard has been verified
  return (capabilities.isMobile || capabilities.isTablet) && !keyboardVerified;
}
