/**
 * PRP-046: Regional Pricing Hook
 *
 * Detects user's country and returns appropriate pricing.
 */

import { useState, useEffect } from 'react';
import {
  detectCountry,
  getRegionalPricing,
  isEmergingMarket,
} from '../lib/pricing';
import type { RegionalPricing } from '../lib/pricing';

export interface UseRegionalPricingResult {
  pricing: RegionalPricing;
  country: string;
  isEmergingMarket: boolean;
  isLoading: boolean;
}

export function useRegionalPricing(): UseRegionalPricingResult {
  const [country, setCountry] = useState<string>('US');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        const detectedCountry = await detectCountry();
        setCountry(detectedCountry);
      } catch (e) {
        console.error('Failed to detect country:', e);
        setCountry('US');
      } finally {
        setIsLoading(false);
      }
    }

    detect();
  }, []);

  const pricing = getRegionalPricing(country);
  const emergingMarket = isEmergingMarket(country);

  return {
    pricing,
    country,
    isEmergingMarket: emergingMarket,
    isLoading,
  };
}
