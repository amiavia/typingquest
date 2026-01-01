import { useState, useRef, useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useClerk,
  useUser,
} from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { useAuthContext } from '../contexts/AuthContext';
import { usePremium } from '../hooks/usePremium';
import { Avatar } from './Avatar';
import { AvatarSelector } from './AvatarSelector';
import { NicknameEditor } from './NicknameEditor';

interface UserButtonProps {
  userLevel?: number;
  onOpenShop?: () => void;
  onOpenPremium?: () => void;
}

export function UserButton({ userLevel = 1, onOpenShop, onOpenPremium }: UserButtonProps) {
  const { t } = useTranslation();
  const { hasLocalData, migrateLocalData, migrationStatus } = useAuthContext();
  const { signOut } = useClerk();
  const { isPremium } = usePremium();
  const { user } = useUser();
  const userAvatarId = useQuery(api.users.getAvatar);

  const [showMenu, setShowMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showNicknameEditor, setShowNicknameEditor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="pixel-box px-2 py-1 sm:px-4 sm:py-2 cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#3bceac',
              background: 'rgba(59, 206, 172, 0.1)',
              border: '2px solid #3bceac',
            }}
          >
            {t('user.signIn')}
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        {/* Show sync button if user has local data to migrate */}
        {hasLocalData && migrationStatus === 'idle' && (
          <button
            onClick={migrateLocalData}
            className="pixel-box px-3 py-2 cursor-pointer transition-all hover:scale-105 animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ffd93d',
              background: 'rgba(255, 217, 61, 0.1)',
              border: '2px solid #ffd93d',
            }}
          >
            {t('user.syncData')}
          </button>
        )}

        {migrationStatus === 'pending' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ffd93d',
            }}
          >
            {t('user.syncing')}
          </span>
        )}

        {migrationStatus === 'success' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#0ead69',
            }}
          >
            {t('user.synced')}
          </span>
        )}

        {migrationStatus === 'error' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ff6b6b',
            }}
          >
            {t('user.error')}
          </span>
        )}

        {/* Custom Avatar with dropdown menu */}
        <div className="relative" ref={menuRef}>
          <Avatar
            avatarId={userAvatarId}
            size="md"
            onClick={() => setShowMenu(!showMenu)}
          />

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-48 z-50"
              style={{
                background: '#1a1a2e',
                border: '3px solid #3bceac',
                boxShadow: '0 4px 20px rgba(59, 206, 172, 0.3)',
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: '#2a2a3e' }}
              >
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    marginBottom: '4px',
                  }}
                >
                  {user?.username || user?.firstName || t('user.player')}
                </p>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '5px',
                    color: '#4a4a6e',
                  }}
                >
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>

              {/* Menu items */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowAvatarSelector(true);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2a2a3e] transition-colors flex items-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: '#ffd93d',
                }}
              >
                <span>🎨</span> {t('user.changeAvatar')}
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowNicknameEditor(true);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2a2a3e] transition-colors flex items-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: '#3bceac',
                }}
              >
                <span>✏️</span> {t('user.editNickname')}
              </button>

              {isPremium && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenPremium?.();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#2a2a3e] transition-colors flex items-center gap-2 border-t"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '6px',
                    color: '#ffd93d',
                    borderColor: '#2a2a3e',
                  }}
                >
                  <span>👑</span> {t('user.manageSubscription')}
                </button>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#2a2a3e] transition-colors flex items-center gap-2 border-t"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: '#ff6b9d',
                  borderColor: '#2a2a3e',
                }}
              >
                <span>🚪</span> {t('user.signOut')}
              </button>
            </div>
          )}
        </div>

        {/* Avatar Selector Modal */}
        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          userLevel={userLevel}
          onOpenShop={onOpenShop}
        />

        {/* Nickname Editor Modal */}
        <NicknameEditor
          isOpen={showNicknameEditor}
          onClose={() => setShowNicknameEditor(false)}
        />
      </SignedIn>
    </div>
  );
}
