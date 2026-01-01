/**
 * PRP-046: Cookie Consent Banner
 *
 * Simple, non-intrusive cookie consent banner.
 * Stores consent in localStorage.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CONSENT_KEY = 'typebit8_cookie_consent';

export function CookieConsent() {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay to not be intrusive on first load
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      style={{
        fontFamily: "'Press Start 2P'",
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: '3px solid #3bceac',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '16px' }}>🍪</span>
          <div className="flex-1">
            <p style={{ fontSize: '7px', color: '#eef5db', lineHeight: '2', marginBottom: '12px' }}>
              {t('cookie.message')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 transition-all hover:scale-105"
                style={{
                  fontSize: '7px',
                  background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                  color: '#0f0f1b',
                  border: 'none',
                }}
              >
                {t('cookie.accept')}
              </button>
              <a
                href="/privacy"
                className="px-4 py-2 transition-all hover:opacity-80"
                style={{
                  fontSize: '7px',
                  background: 'transparent',
                  color: '#3bceac',
                  border: '1px solid #3bceac',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {t('cookie.learnMore')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
