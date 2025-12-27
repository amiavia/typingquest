import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  hasTouchScreen: boolean;
  hasPhysicalKeyboard: boolean | 'unknown';
}

/**
 * Detects device type and input capabilities.
 * Used to gate mobile users to the MobileLanding page.
 */
export function useDeviceDetection(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    hasTouchScreen: false,
    hasPhysicalKeyboard: 'unknown',
  });

  useEffect(() => {
    const detectDevice = () => {
      // Touch capability detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Screen size detection
      const isSmallScreen = window.innerWidth < 768;
      const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;

      // User agent hints (secondary signal)
      const ua = navigator.userAgent.toLowerCase();
      const mobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const tabletUA = /ipad|android(?!.*mobile)/i.test(ua);

      // Combine signals for detection
      // Mobile: small screen + touch OR mobile user agent
      const isMobile = (isSmallScreen && isTouchDevice) || mobileUA;

      // Tablet: medium screen + touch OR tablet user agent (but not if also mobile UA)
      const isTablet = ((isMediumScreen && isTouchDevice) || tabletUA) && !mobileUA;

      setCapabilities({
        isMobile,
        isTablet,
        hasTouchScreen: isTouchDevice,
        hasPhysicalKeyboard: 'unknown', // Will be determined by keyboard verification
      });
    };

    detectDevice();

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
