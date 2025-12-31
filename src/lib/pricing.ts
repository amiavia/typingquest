/**
 * PRP-046: Regional Pricing Detection
 *
 * Detects user's country and returns appropriate pricing tier.
 * Uses IP geolocation via Cloudflare headers or browser locale as fallback.
 */

export type PricingTier = 'standard' | 'emerging';

export interface RegionalPricing {
  tier: PricingTier;
  monthly: {
    amount: number;
    currency: string;
    display: string;
  };
  yearly: {
    amount: number;
    currency: string;
    display: string;
    savings: string;
  };
}

// Countries eligible for emerging market pricing (lower prices)
const EMERGING_MARKETS = [
  'IN', // India
  'BR', // Brazil
  'ID', // Indonesia
  'PH', // Philippines
  'VN', // Vietnam
  'PK', // Pakistan
  'BD', // Bangladesh
  'NG', // Nigeria
  'MX', // Mexico
  'CO', // Colombia
  'AR', // Argentina
  'PE', // Peru
  'EG', // Egypt
  'ZA', // South Africa
  'KE', // Kenya
  'TH', // Thailand
  'MY', // Malaysia
  'TR', // Turkey
  'UA', // Ukraine
  'PL', // Poland (borderline, but included for accessibility)
];

// Standard pricing (US/EU/UK/AU/CA)
const STANDARD_PRICING: RegionalPricing = {
  tier: 'standard',
  monthly: {
    amount: 499,
    currency: 'usd',
    display: '$4.99',
  },
  yearly: {
    amount: 3999,
    currency: 'usd',
    display: '$39.99',
    savings: 'Save 33%',
  },
};

// Emerging market pricing (60% discount)
const EMERGING_PRICING: RegionalPricing = {
  tier: 'emerging',
  monthly: {
    amount: 199,
    currency: 'usd',
    display: '$1.99',
  },
  yearly: {
    amount: 1499,
    currency: 'usd',
    display: '$14.99',
    savings: 'Save 37%',
  },
};

/**
 * Detect user's country from various sources
 * Priority: Cloudflare header > cached value > browser locale
 */
export async function detectCountry(): Promise<string> {
  // Check cached value first
  const cached = localStorage.getItem('typebit8_country');
  if (cached) {
    return cached;
  }

  // Try Cloudflare's country header (works if deployed on CF)
  // This is set automatically by Cloudflare on their edge
  try {
    // For CF-deployed sites, we can check the request headers
    // But since we're client-side, we need to use a CF Worker or check navigator
    // For now, use browser locale as primary method

    // Option 1: Use browser locale
    const locale = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en-US';
    const countryFromLocale = extractCountryFromLocale(locale);

    if (countryFromLocale) {
      localStorage.setItem('typebit8_country', countryFromLocale);
      return countryFromLocale;
    }

    // Option 2: Use timezone as hint (rough approximation)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTimezone = getCountryFromTimezone(timezone);

    if (countryFromTimezone) {
      localStorage.setItem('typebit8_country', countryFromTimezone);
      return countryFromTimezone;
    }
  } catch (e) {
    console.warn('Failed to detect country:', e);
  }

  // Default to US
  return 'US';
}

/**
 * Extract country code from locale string (e.g., "en-IN" -> "IN")
 */
function extractCountryFromLocale(locale: string): string | null {
  const parts = locale.split('-');
  if (parts.length >= 2) {
    return parts[1].toUpperCase();
  }
  return null;
}

/**
 * Get approximate country from timezone (rough heuristic)
 */
function getCountryFromTimezone(timezone: string): string | null {
  const timezoneToCountry: Record<string, string> = {
    // India
    'Asia/Kolkata': 'IN',
    'Asia/Calcutta': 'IN',

    // Brazil
    'America/Sao_Paulo': 'BR',
    'America/Rio_Branco': 'BR',
    'America/Manaus': 'BR',

    // Indonesia
    'Asia/Jakarta': 'ID',
    'Asia/Makassar': 'ID',

    // Philippines
    'Asia/Manila': 'PH',

    // Vietnam
    'Asia/Ho_Chi_Minh': 'VN',
    'Asia/Saigon': 'VN',

    // Pakistan
    'Asia/Karachi': 'PK',

    // Bangladesh
    'Asia/Dhaka': 'BD',

    // Nigeria
    'Africa/Lagos': 'NG',

    // Mexico
    'America/Mexico_City': 'MX',
    'America/Cancun': 'MX',

    // Colombia
    'America/Bogota': 'CO',

    // Argentina
    'America/Buenos_Aires': 'AR',
    'America/Argentina/Buenos_Aires': 'AR',

    // Egypt
    'Africa/Cairo': 'EG',

    // South Africa
    'Africa/Johannesburg': 'ZA',

    // Turkey
    'Europe/Istanbul': 'TR',

    // Ukraine
    'Europe/Kiev': 'UA',
    'Europe/Kyiv': 'UA',

    // Thailand
    'Asia/Bangkok': 'TH',

    // Malaysia
    'Asia/Kuala_Lumpur': 'MY',
  };

  return timezoneToCountry[timezone] || null;
}

/**
 * Get pricing tier based on detected country
 */
export function getPricingTier(countryCode: string): PricingTier {
  if (EMERGING_MARKETS.includes(countryCode.toUpperCase())) {
    return 'emerging';
  }
  return 'standard';
}

/**
 * Get regional pricing based on country code
 */
export function getRegionalPricing(countryCode: string): RegionalPricing {
  const tier = getPricingTier(countryCode);
  return tier === 'emerging' ? EMERGING_PRICING : STANDARD_PRICING;
}

/**
 * Check if country is in emerging market
 */
export function isEmergingMarket(countryCode: string): boolean {
  return EMERGING_MARKETS.includes(countryCode.toUpperCase());
}

/**
 * Get all pricing options (for admin/debugging)
 */
export function getAllPricingTiers() {
  return {
    standard: STANDARD_PRICING,
    emerging: EMERGING_PRICING,
  };
}
