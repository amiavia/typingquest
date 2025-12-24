/**
 * PRP-003: Avatar Display Component
 *
 * Displays a user's selected pixel art avatar.
 */

import { AVATARS, DEFAULT_AVATAR_ID, getAvatarById } from '../data/avatars';

interface AvatarProps {
  avatarId?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showBorder?: boolean;
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function Avatar({
  avatarId,
  size = 'md',
  className = '',
  onClick,
  showBorder = true,
}: AvatarProps) {
  const avatar = getAvatarById(avatarId || DEFAULT_AVATAR_ID) || AVATARS[0];
  const pixelSize = SIZES[size];

  return (
    <div
      className={`pixel-avatar relative ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        border: showBorder ? `3px solid ${avatar.colors.primary}` : 'none',
        background: '#1a1a2e',
        imageRendering: 'pixelated',
        boxShadow: showBorder ? `0 0 10px ${avatar.colors.primary}40` : 'none',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <img
        src={avatar.src}
        alt={avatar.name}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span style="font-size: ${pixelSize * 0.6}px; display: flex; align-items: center; justify-content: center; height: 100%;">${avatar.emoji}</span>`;
          }
        }}
      />
    </div>
  );
}
