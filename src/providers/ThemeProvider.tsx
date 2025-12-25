import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { getVisualTheme, applyTheme } from '../data/visualThemes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { userId } = useAuth();

  // Query equipped items from shop
  const equippedItems = useQuery(
    api.shop.getEquippedItems,
    userId ? { clerkId: userId } : 'skip'
  );

  // Apply theme whenever equipped items change
  useEffect(() => {
    // Get equipped theme ID
    const themeItem = equippedItems?.['theme'];
    const themeId = themeItem?.itemId;

    // Get and apply the theme
    const theme = getVisualTheme(themeId);
    applyTheme(theme);

    console.log('[ThemeProvider] Applied theme:', theme.id);
  }, [equippedItems]);

  // Apply default theme on mount for non-authenticated users
  useEffect(() => {
    if (!userId) {
      const defaultTheme = getVisualTheme('default');
      applyTheme(defaultTheme);
    }
  }, [userId]);

  return <>{children}</>;
}
