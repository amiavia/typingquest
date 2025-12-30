/**
 * PRP-046: Unsubscribe Page
 *
 * Allows users to unsubscribe from marketing emails.
 */

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface UnsubscribePageProps {
  onBack: () => void;
}

export function UnsubscribePage({ onBack }: UnsubscribePageProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle');

  const unsubscribe = useMutation(api.leads.unsubscribe);

  // Try to get email from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setStatus('loading');

    try {
      const result = await unsubscribe({ email });
      if (result.success) {
        setStatus('success');
        // Clean URL
        window.history.replaceState({}, '', '/unsubscribe');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pixel-btn mb-8"
          style={{ fontSize: '10px' }}
        >
          ← BACK
        </button>

        <div className="pixel-box p-6 md:p-8">
          <h1
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              color: '#ffd93d',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            UNSUBSCRIBE
          </h1>

          {status === 'success' ? (
            <div className="text-center">
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '10px',
                  color: '#3bceac',
                  marginBottom: '16px',
                }}
              >
                ✓ YOU'VE BEEN UNSUBSCRIBED
              </p>
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: '#9a9ab0',
                  lineHeight: '2',
                }}
              >
                You won't receive any more marketing emails from typebit8.
              </p>
              <button
                onClick={onBack}
                className="pixel-btn mt-6"
                style={{ fontSize: '10px' }}
              >
                RETURN HOME
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: '#eef5db',
                  marginBottom: '20px',
                  lineHeight: '2',
                  textAlign: 'center',
                }}
              >
                Enter your email to unsubscribe from marketing emails.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="w-full p-3 mb-4"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  background: '#1a1a2e',
                  border: '2px solid #3bceac',
                  color: '#eef5db',
                }}
                disabled={status === 'loading'}
              />

              {status === 'error' && (
                <p
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '6px',
                    color: '#ff6b9d',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  EMAIL NOT FOUND OR ALREADY UNSUBSCRIBED
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full py-3"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '10px',
                  background: status === 'loading' ? '#4a4a6e' : '#ff6b9d',
                  color: '#0f0f1b',
                  border: 'none',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                }}
              >
                {status === 'loading' ? 'PROCESSING...' : 'UNSUBSCRIBE'}
              </button>

              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '6px',
                  color: '#4a4a6e',
                  textAlign: 'center',
                  marginTop: '16px',
                  lineHeight: '2',
                }}
              >
                You'll still receive important account notifications.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
