/**
 * PRP-029: Nickname Privacy System
 * Editor component for users to change their display nickname
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface NicknameEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NicknameEditor({ isOpen, onClose }: NicknameEditorProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nicknameInfo = useQuery(api.nicknames.getNicknameInfo);
  const setNicknameMutation = useMutation(api.nicknames.setNickname);
  const clearNicknameMutation = useMutation(api.nicknames.clearCustomNickname);

  // Initialize with current nickname
  useEffect(() => {
    if (nicknameInfo?.customNickname) {
      setNickname(nicknameInfo.customNickname);
    } else {
      setNickname('');
    }
  }, [nicknameInfo]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await setNicknameMutation({ nickname: nickname.trim() });
      if (result.success) {
        setSuccess('Nickname saved!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.reason || 'Failed to save nickname');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await clearNicknameMutation();
      if (result.success) {
        setSuccess(`Reset to: ${result.nickname}`);
        setNickname('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.reason || 'Failed to reset nickname');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="pixel-box p-6 w-full max-w-md"
        style={{
          background: '#1a1a2e',
          border: '3px solid #3bceac',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
              color: '#ffd93d',
            }}
          >
            EDIT NICKNAME
          </h3>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#ff6b9d',
            }}
          >
            ✕
          </button>
        </div>

        {/* Current display name */}
        <div className="mb-4">
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#9a9ab0',
              marginBottom: '4px',
            }}
          >
            CURRENT NAME
          </p>
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#3bceac',
            }}
          >
            {nicknameInfo?.displayName || 'Loading...'}
          </p>
          {nicknameInfo?.isCustom && (
            <p
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: '#6a6a7a',
                marginTop: '2px',
              }}
            >
              (CUSTOM)
            </p>
          )}
        </div>

        {/* Input */}
        <div className="mb-4">
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#9a9ab0',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            NEW NICKNAME
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            maxLength={20}
            placeholder="Enter nickname..."
            className="w-full p-3"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#eef5db',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #4a4a6e',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3bceac')}
            onBlur={(e) => (e.target.style.borderColor = '#4a4a6e')}
          />
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '6px',
              color: '#6a6a7a',
              marginTop: '4px',
            }}
          >
            3-20 CHARS, LETTERS/NUMBERS/UNDERSCORES
          </p>
        </div>

        {/* Error/Success messages */}
        {error && (
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ff6b6b',
              marginBottom: '16px',
            }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#0ead69',
              marginBottom: '16px',
            }}
          >
            {success}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 transition-colors"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: isLoading ? '#6a6a7a' : '#1a1a2e',
              background: isLoading ? '#4a4a6e' : '#3bceac',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'SAVING...' : 'SAVE'}
          </button>

          {nicknameInfo?.isCustom && (
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="py-3 px-4 transition-colors"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                color: '#ffd93d',
                background: 'transparent',
                border: '2px solid #ffd93d',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              RESET
            </button>
          )}
        </div>

        {/* Auto nickname preview */}
        {nicknameInfo?.autoNickname && !nicknameInfo?.isCustom && (
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '6px',
              color: '#6a6a7a',
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            AUTO-GENERATED: {nicknameInfo.autoNickname}
          </p>
        )}
      </div>
    </div>
  );
}
