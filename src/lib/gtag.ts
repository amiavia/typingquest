/**
 * Google Analytics 4 and Google Ads Tag Integration
 *
 * Provides visitor tracking (GA4) and retargeting audiences (Google Ads).
 */

// Environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as
  | string
  | undefined;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;

// Check if gtag is available
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Track if we've already initialized
let initialized = false;

/**
 * Initialize Google tags by injecting the gtag.js script
 * Call this once on app startup
 */
export function initializeGoogleTags(): void {
  // Skip if no IDs configured or already initialized
  if ((!GA_MEASUREMENT_ID && !GOOGLE_ADS_ID) || initialized) {
    return;
  }

  initialized = true;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Set initial timestamp
  window.gtag("js", new Date());

  // Configure GA4
  if (GA_MEASUREMENT_ID) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: true,
    });
  }

  // Configure Google Ads (for retargeting)
  if (GOOGLE_ADS_ID) {
    window.gtag("config", GOOGLE_ADS_ID);
  }

  // Load the gtag.js script
  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;
  if (primaryId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
    document.head.appendChild(script);
  }
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!window.gtag) return;

  window.gtag("event", eventName, params);
}

/**
 * Track a conversion event (for Google Ads)
 */
export function trackConversion(
  conversionLabel: string,
  value?: number,
  currency?: string
): void {
  if (!window.gtag || !GOOGLE_ADS_ID) return;

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value: value,
    currency: currency || "USD",
  });
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string | null): void {
  if (!window.gtag) return;

  if (userId) {
    window.gtag("set", { user_id: userId });
  }
}

/**
 * Track signup completion (useful for conversion tracking)
 */
export function trackSignup(method: string): void {
  trackEvent("sign_up", { method });
}

/**
 * Track premium subscription (useful for conversion tracking)
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = "USD",
  itemName: string = "Premium Subscription"
): void {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: [{ item_name: itemName }],
  });
}

// Export IDs for reference
export const gaId = GA_MEASUREMENT_ID;
export const adsId = GOOGLE_ADS_ID;
