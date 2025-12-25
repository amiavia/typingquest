import { useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { getVisualTheme, applyTheme, type VisualTheme } from '../data/visualThemes';

export interface UseThemeReturn {
  currentTheme: VisualTheme;
  equippedThemeId: string | undefined;
  isLoading: boolean;
}

export function useTheme(): UseThemeReturn {
  const { userId } = useAuth();

  // Query equipped items from shop
  const equippedItems = useQuery(
    api.shop.getEquippedItems,
    userId ? { clerkId: userId } : 'skip'
  );

  // Extract equipped theme ID
  const equippedThemeId = useMemo(() => {
    if (!equippedItems) return undefined;
    // getEquippedItems returns { [category]: shopItem }
    const themeItem = equippedItems['theme'];
    return themeItem?.itemId;
  }, [equippedItems]);

  // Get the visual theme object
  const currentTheme = useMemo(() => {
    return getVisualTheme(equippedThemeId);
  }, [equippedThemeId]);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Also apply on mount for guests (no userId)
  useEffect(() => {
    if (!userId) {
      // Apply default theme for guests
      applyTheme(getVisualTheme('default'));
    }
  }, [userId]);

  return {
    currentTheme,
    equippedThemeId,
    isLoading: userId ? equippedItems === undefined : false,
  };
}
