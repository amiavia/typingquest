import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardVerification } from './KeyboardVerification';

interface MobileLandingProps {
  onKeyboardVerified: () => void;
}

/**
 * Mobile landing page shown to users on touch devices.
 * Provides options to:
 * 1. Open on desktop (shows memorable URL)
 * 2. Remember for later (mailto: with link)
 * 3. Copy link
 * 4. Verify external keyboard and proceed
 */
export function MobileLanding({ onKeyboardVerified }: MobileLandingProps) {
  const { t } = useTranslation();
  const [showKeyboardTest, setShowKeyboardTest] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;
  const displayUrl = 'typebit8.com';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRememberForLater = () => {
    const subject = encodeURIComponent('TypeBit8 - Continue on Desktop');
    const body = encodeURIComponent(
      `Open this link on your desktop to start practicing:\n\n${currentUrl}\n\nTypeBit8 - Master touch typing`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Show keyboard verification screen
  if (showKeyboardTest) {
    return (
      <KeyboardVerification
        onVerified={onKeyboardVerified}
        onCancel={() => setShowKeyboardTest(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0f0f1b' }}
    >
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div
          className="w-20 h-20 mb-6 border-4 border-[#ffd93d] bg-[#1a1a2e] flex items-center justify-center"
          style={{ boxShadow: '6px 6px 0 #0f0f1b, 0 0 20px rgba(255, 217, 61, 0.3)' }}
        >
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#ffd93d' }}>
            ⌨
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffd93d',
            marginBottom: '8px',
          }}
          className="text-glow-yellow"
        >
          TYPEBIT8
        </h1>
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#3bceac',
            marginBottom: '32px',
          }}
        >
          {t('mobile.subtitle')}
        </p>

        {/* Physical Keyboard Notice */}
        <div
          className="pixel-box p-6 mb-8 max-w-sm w-full"
          style={{
            background: 'rgba(59, 206, 172, 0.1)',
            border: '4px solid #3bceac',
          }}
        >
          <div className="text-4xl mb-4">⌨️</div>
          <h2
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
              marginBottom: '12px',
            }}
          >
            {t('mobile.keyboardRequired')}
          </h2>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '7px',
              color: '#3bceac',
              lineHeight: '2.2',
            }}
          >
            {t('mobile.keyboardExplanation')}
          </p>
        </div>

        {/* URL Display */}
        <div className="mb-6 max-w-sm w-full">
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
              marginBottom: '12px',
            }}
          >
            {t('mobile.openOnDesktop')}
          </p>
          <div
            className="p-4"
            style={{
              background: '#2a2a3e',
              border: '4px solid #ffd93d',
              boxShadow: '0 0 15px rgba(255, 217, 61, 0.2)',
            }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#ffd93d',
              }}
            >
              {displayUrl}
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '6px',
              color: '#4a4a6e',
              marginTop: '8px',
            }}
          >
            {t('mobile.typeUrlHint')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-sm w-full mb-8">
          <button
            onClick={handleRememberForLater}
            className="w-full px-6 py-4 transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '9px',
              background: 'linear-gradient(180deg, #3bceac, #0ead69)',
              color: '#0f0f1b',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #0a8a54',
            }}
          >
            🔖 {t('mobile.rememberForLater')}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full px-6 py-4 transition-all"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '9px',
              background: copied ? '#0ead69' : '#2a2a3e',
              color: copied ? '#0f0f1b' : '#eef5db',
              border: '3px solid #4a4a6e',
              cursor: 'pointer',
            }}
          >
            {copied ? t('mobile.copied') : t('mobile.copyLink')}
          </button>
        </div>

        {/* External Keyboard Option */}
        <div className="max-w-sm w-full">
          <button
            onClick={() => setShowKeyboardTest(true)}
            className="w-full px-6 py-4 transition-all hover:border-[#3bceac]"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#4a4a6e',
              background: 'transparent',
              border: '2px dashed #4a4a6e',
              cursor: 'pointer',
            }}
          >
            ⌨️ {t('mobile.haveKeyboard')}
          </button>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '6px',
              color: '#4a4a6e',
              marginTop: '8px',
              lineHeight: '1.8',
            }}
          >
            {t('mobile.verifyHint')}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#4a4a6e',
            lineHeight: '2',
          }}
        >
          {t('mobile.footerText')}
        </p>
      </footer>
    </div>
  );
}
