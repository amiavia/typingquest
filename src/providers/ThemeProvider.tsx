import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { getVisualTheme, applyTheme } from '../data/visualThemes';
import { useColorMode } from './ColorModeProvider';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { userId } = useAuth();
  const { isLight } = useColorMode();

  // Query equipped items from shop
  const equippedItems = useQuery(
    api.shop.getEquippedItems,
    userId ? { clerkId: userId } : 'skip'
  );

  // Apply theme whenever equipped items change (only in dark mode)
  useEffect(() => {
    // Skip shop theme in light mode - ColorModeProvider handles it
    if (isLight) {
      console.log('[ThemeProvider] Light mode active, skipping shop theme');
      return;
    }

    // Get equipped theme ID
    const themeItem = equippedItems?.['theme'];
    const themeId = themeItem?.itemId;

    // Get and apply the theme
    const theme = getVisualTheme(themeId);
    applyTheme(theme);

    console.log('[ThemeProvider] Applied theme:', theme.id);
  }, [equippedItems, isLight]);

  // Apply default theme on mount for non-authenticated users (only in dark mode)
  useEffect(() => {
    if (!userId && !isLight) {
      const defaultTheme = getVisualTheme('default');
      applyTheme(defaultTheme);
    }
  }, [userId, isLight]);

  return <>{children}</>;
}
