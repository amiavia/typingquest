import { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';

interface ActivePowerUp {
  _id: string;
  powerUpType: string;
  multiplier?: number;
  remainingUses?: number;
  expiresAt?: number;
  activatedAt: number;
}

interface PowerUpContextValue {
  activePowerUps: ActivePowerUp[];
  xpMultiplier: number;
  coinMultiplier: number;
  isLoading: boolean;
  activatePowerUp: (itemId: string) => Promise<void>;
  useHintToken: () => Promise<{ remainingUses: number } | null>;
  getHintTokensRemaining: () => number;
  hasActivePowerUp: (type: string) => boolean;
  getTimeRemaining: (type: string) => number | null;
}

const PowerUpContext = createContext<PowerUpContextValue>({
  activePowerUps: [],
  xpMultiplier: 1,
  coinMultiplier: 1,
  isLoading: false,
  activatePowerUp: async () => {},
  useHintToken: async () => null,
  getHintTokensRemaining: () => 0,
  hasActivePowerUp: () => false,
  getTimeRemaining: () => null,
});

export function usePowerUps() {
  return useContext(PowerUpContext);
}

interface PowerUpProviderProps {
  children: React.ReactNode;
}

export function PowerUpProvider({ children }: PowerUpProviderProps) {
  const { userId } = useAuth();

  // Query active power-ups
  const activePowerUps = useQuery(
    api.powerups.getActivePowerUps,
    userId ? { clerkId: userId } : 'skip'
  );

  // Query multipliers
  const multipliers = useQuery(
    api.powerups.getActiveMultipliers,
    userId ? { clerkId: userId } : 'skip'
  );

  // Mutations
  const activatePowerUpMutation = useMutation(api.powerups.activatePowerUp);
  const useHintTokenMutation = useMutation(api.powerups.useHintToken);

  const activatePowerUp = useCallback(async (itemId: string) => {
    if (!userId) return;
    await activatePowerUpMutation({ clerkId: userId, itemId });
  }, [userId, activatePowerUpMutation]);

  const useHintToken = useCallback(async () => {
    if (!userId) return null;
    try {
      return await useHintTokenMutation({ clerkId: userId });
    } catch {
      return null;
    }
  }, [userId, useHintTokenMutation]);

  const getHintTokensRemaining = useCallback(() => {
    if (!activePowerUps) return 0;
    const hintToken = activePowerUps.find(p => p.powerUpType === 'hint-token');
    return hintToken?.remainingUses || 0;
  }, [activePowerUps]);

  const hasActivePowerUp = useCallback((type: string) => {
    if (!activePowerUps) return false;
    const now = Date.now();
    return activePowerUps.some(p => {
      if (p.powerUpType !== type) return false;
      if (p.expiresAt && p.expiresAt < now) return false;
      if (p.remainingUses !== undefined && p.remainingUses <= 0) return false;
      return true;
    });
  }, [activePowerUps]);

  const getTimeRemaining = useCallback((type: string) => {
    if (!activePowerUps) return null;
    const powerUp = activePowerUps.find(p => p.powerUpType === type);
    if (!powerUp?.expiresAt) return null;
    const remaining = powerUp.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
  }, [activePowerUps]);

  const value = useMemo(() => ({
    activePowerUps: activePowerUps || [],
    xpMultiplier: multipliers?.xpMultiplier || 1,
    coinMultiplier: multipliers?.coinMultiplier || 1,
    isLoading: userId ? (activePowerUps === undefined || multipliers === undefined) : false,
    activatePowerUp,
    useHintToken,
    getHintTokensRemaining,
    hasActivePowerUp,
    getTimeRemaining,
  }), [activePowerUps, multipliers, userId, activatePowerUp, useHintToken, getHintTokensRemaining, hasActivePowerUp, getTimeRemaining]);

  return (
    <PowerUpContext.Provider value={value}>
      {children}
    </PowerUpContext.Provider>
  );
}
