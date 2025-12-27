/**
 * PRP-003: Avatar Selector Modal Component
 *
 * Modal for users to select and change their avatar.
 * Only allows selection of avatars that user owns (purchased from shop).
 * Default avatar (pixel-knight) is always available for free.
 */

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
  onOpenShop?: () => void;
}

export function AvatarSelector({ isOpen, onClose, userLevel, onOpenShop }: AvatarSelectorProps) {
  const { userId } = useAuth();
  const currentAvatarId = useQuery(api.users.getAvatar);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const inventory = useQuery(
    api.shop.getInventory,
    userId ? { clerkId: userId } : 'skip'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  // Get owned avatar IDs from inventory
  const ownedAvatarIds = new Set<string>(
    inventory
      ?.filter(item => item.item?.category === 'avatar')
      .map(item => item.itemId) ?? []
  );

  // Default avatar is always free/owned
  ownedAvatarIds.add(DEFAULT_AVATAR_ID);

  // Categorize avatars
  const ownedAvatars = AVATARS.filter(a => ownedAvatarIds.has(a.id));
  const availableToBuy = AVATARS.filter(a =>
    !ownedAvatarIds.has(a.id) && a.unlockLevel <= userLevel
  );
  const levelLocked = AVATARS.filter(a =>
    !ownedAvatarIds.has(a.id) && a.unlockLevel > userLevel
  );

  const handleSelect = async (avatarId: string) => {
    if (isUpdating) return;
    if (!ownedAvatarIds.has(avatarId)) return; // Can't select unowned avatars

    setIsUpdating(true);
    try {
      await updateAvatar({ avatarId });
      onClose();
    } catch (error) {
      console.error('Failed to update avatar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoToShop = () => {
    onClose();
    onOpenShop?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        style={{
          background: '#1a1a2e',
          border: '4px solid #ffd93d',
          boxShadow: '0 0 30px #ffd93d40',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '14px',
              color: '#ffd93d',
            }}
          >
            SELECT AVATAR
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: '#ff6b9d',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>

        {/* Owned Avatars */}
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#0ead69',
            marginBottom: '12px',
          }}
        >
          OWNED ({ownedAvatars.length})
        </p>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {ownedAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              disabled={isUpdating}
              className={`p-2 transition-all ${
                currentAvatarId === avatar.id
                  ? 'ring-4 ring-offset-2 ring-offset-[#1a1a2e] ring-[#ffd93d]'
                  : 'hover:ring-2 hover:ring-[#3bceac]'
              }`}
              style={{
                background: '#0d0d1a',
                border: `2px solid ${avatar.colors.primary}`,
                borderRadius: '4px',
                cursor: isUpdating ? 'wait' : 'pointer',
              }}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                className="w-full aspect-square"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = `<span style="font-size: 24px; display: flex; align-items: center; justify-content: center; aspect-ratio: 1;">${avatar.emoji}</span>`;
                }}
              />
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '5px',
                  color: '#eef5db',
                  marginTop: '6px',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}
              >
                {avatar.name.toUpperCase()}
              </p>
              {currentAvatarId === avatar.id && (
                <div
                  className="mt-1 text-center"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '4px',
                    color: '#ffd93d',
                  }}
                >
                  EQUIPPED
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Available to Buy */}
        {availableToBuy.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#3bceac',
                }}
              >
                GET IN SHOP ({availableToBuy.length})
              </p>
              {onOpenShop && (
                <button
                  onClick={handleGoToShop}
                  className="hover:brightness-125 transition-all"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '6px',
                    color: '#ffd93d',
                    background: 'transparent',
                    border: '2px solid #ffd93d',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  OPEN SHOP
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-4 mb-6 opacity-60">
              {availableToBuy.map((avatar) => (
                <div
                  key={avatar.id}
                  className="p-2 relative cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    background: '#0d0d1a',
                    border: '2px solid #3bceac',
                    borderRadius: '4px',
                  }}
                  onClick={handleGoToShop}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full aspect-square"
                    style={{ imageRendering: 'pixelated', filter: 'saturate(0.5)' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.outerHTML = `<span style="font-size: 24px; display: flex; align-items: center; justify-content: center; aspect-ratio: 1; filter: saturate(0.5);">${avatar.emoji}</span>`;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '6px',
                        color: '#ffd93d',
                      }}
                    >
                      💰 BUY
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '5px',
                      color: '#3bceac',
                      marginTop: '6px',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}
                  >
                    {avatar.name.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Level Locked */}
        {levelLocked.length > 0 && (
          <>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
                marginBottom: '12px',
              }}
            >
              LOCKED ({levelLocked.length})
            </p>
            <div className="grid grid-cols-5 gap-4 opacity-40">
              {levelLocked.map((avatar) => (
                <div
                  key={avatar.id}
                  className="p-2 relative"
                  style={{
                    background: '#0d0d1a',
                    border: '2px solid #4a4a6e',
                    borderRadius: '4px',
                  }}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full aspect-square grayscale"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.outerHTML = `<span style="font-size: 24px; display: flex; align-items: center; justify-content: center; aspect-ratio: 1; filter: grayscale(100%);">${avatar.emoji}</span>`;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '8px',
                        color: '#ffd93d',
                      }}
                    >
                      🔒 LV{avatar.unlockLevel}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '5px',
                      color: '#4a4a6e',
                      marginTop: '6px',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}
                  >
                    {avatar.name.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer tip */}
        <p
          className="mt-6 text-center"
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#4a4a6e',
          }}
        >
          BUY AVATARS IN THE SHOP OR LEVEL UP TO UNLOCK MORE!
        </p>
      </div>
    </div>
  );
}
