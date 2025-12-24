/**
 * PRP-003: Avatar Selector Modal Component
 *
 * Modal for users to select and change their avatar.
 */

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getUnlockedAvatars, getLockedAvatars } from '../data/avatars';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
}

export function AvatarSelector({ isOpen, onClose, userLevel }: AvatarSelectorProps) {
  const currentAvatarId = useQuery(api.users.getAvatar);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const unlockedAvatars = getUnlockedAvatars(userLevel);
  const lockedAvatars = getLockedAvatars(userLevel);

  const handleSelect = async (avatarId: string) => {
    if (isUpdating) return;
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

        {/* Unlocked Avatars */}
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#3bceac',
            marginBottom: '12px',
          }}
        >
          AVAILABLE ({unlockedAvatars.length})
        </p>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {unlockedAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              disabled={isUpdating}
              className={`p-2 transition-all ${
                currentAvatarId === avatar.id
                  ? 'ring-4 ring-offset-2 ring-offset-[#1a1a2e]'
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

        {/* Locked Avatars */}
        {lockedAvatars.length > 0 && (
          <>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
                marginBottom: '12px',
              }}
            >
              LOCKED ({lockedAvatars.length})
            </p>
            <div className="grid grid-cols-5 gap-4 opacity-50">
              {lockedAvatars.map((avatar) => (
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
                      LV{avatar.unlockLevel}
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
          LEVEL UP TO UNLOCK MORE AVATARS!
        </p>
      </div>
    </div>
  );
}
