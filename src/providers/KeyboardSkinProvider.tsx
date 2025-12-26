import { createContext, useContext, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { getKeyboardSkin, type KeyboardSkin } from '../data/keyboardSkins';

interface SkinContextValue {
  currentSkin: KeyboardSkin;
  skinId: string | undefined;
  isLoading: boolean;
}

const SkinContext = createContext<SkinContextValue>({
  currentSkin: getKeyboardSkin('default'),
  skinId: undefined,
  isLoading: false,
});

export function useKeyboardSkin() {
  return useContext(SkinContext);
}

interface KeyboardSkinProviderProps {
  children: React.ReactNode;
}

export function KeyboardSkinProvider({ children }: KeyboardSkinProviderProps) {
  const { userId } = useAuth();

  // Query equipped items from shop
  const equippedItems = useQuery(
    api.shop.getEquippedItems,
    userId ? { clerkId: userId } : 'skip'
  );

  // Extract equipped skin ID
  const skinId = useMemo(() => {
    if (!equippedItems) return undefined;
    const skinItem = equippedItems['keyboard-skin'];
    return skinItem?.itemId;
  }, [equippedItems]);

  // Get the skin object
  const currentSkin = useMemo(() => {
    return getKeyboardSkin(skinId);
  }, [skinId]);

  const value = useMemo(() => ({
    currentSkin,
    skinId,
    isLoading: userId ? equippedItems === undefined : false,
  }), [currentSkin, skinId, userId, equippedItems]);

  return (
    <SkinContext.Provider value={value}>
      {children}
    </SkinContext.Provider>
  );
}
