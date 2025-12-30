/**
 * PRP-046: Email Capture Component
 *
 * Captures email leads with speed test results.
 * Offers to send results via email.
 */

import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface EmailCaptureProps {
  wpm: number;
  accuracy: number;
  source: 'speed_test' | 'level_complete' | 'landing_page';
  country?: string;
}

export function EmailCapture({ wpm, accuracy, source, country }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const captureLead = useMutation(api.leads.captureLead);
  const sendWelcomeEmail = useAction(api.emails.triggerWelcomeEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('PLEASE ENTER A VALID EMAIL');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Capture lead first
      const result = await captureLead({
        email,
        source,
        speedTestResult: { wpm, accuracy },
        country,
        marketingConsent: consent,
      });

      // Send welcome email if new lead and consented
      if (result.isNew && consent) {
        sendWelcomeEmail({ email, wpm, accuracy }).catch((err) => {
          console.error('[EmailCapture] Failed to send welcome email:', err);
        });
      }

      setStatus('success');
    } catch (err) {
      console.error('Failed to capture lead:', err);
      setErrorMessage('SOMETHING WENT WRONG. TRY AGAIN.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="p-4 text-center"
        style={{
          fontFamily: "'Press Start 2P'",
          background: 'rgba(14, 173, 105, 0.1)',
          border: '2px solid #0ead69',
        }}
      >
        <span style={{ fontSize: '20px' }}>✓</span>
        <p style={{ fontSize: '8px', color: '#0ead69', marginTop: '8px' }}>
          RESULTS SAVED!
        </p>
        <p style={{ fontSize: '6px', color: '#3bceac', marginTop: '4px' }}>
          CHECK YOUR EMAIL FOR TIPS TO IMPROVE
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4"
      style={{
        fontFamily: "'Press Start 2P'",
        background: 'rgba(59, 206, 172, 0.1)',
        border: '2px solid #3bceac',
      }}
    >
      <p style={{ fontSize: '8px', color: '#ffd93d', marginBottom: '12px', textAlign: 'center' }}>
        📧 GET YOUR RESULTS + IMPROVEMENT TIPS
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR EMAIL"
          className="w-full p-3"
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            background: '#1a1a2e',
            border: '2px solid #3bceac',
            color: '#eef5db',
          }}
          disabled={status === 'loading'}
        />

        <label
          className="flex items-start gap-2 cursor-pointer"
          style={{ fontSize: '6px', color: '#4a4a6e' }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: '#3bceac' }}
          />
          <span>
            I AGREE TO RECEIVE TYPING TIPS AND UPDATES.
            <br />
            YOU CAN UNSUBSCRIBE ANYTIME.
          </span>
        </label>

        {status === 'error' && (
          <p style={{ fontSize: '6px', color: '#ff6b9d', textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 transition-all hover:scale-105"
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            background: status === 'loading' ? '#4a4a6e' : 'linear-gradient(180deg, #3bceac, #0ead69)',
            color: '#0f0f1b',
            border: 'none',
            cursor: status === 'loading' ? 'wait' : 'pointer',
          }}
        >
          {status === 'loading' ? 'SENDING...' : 'SEND MY RESULTS'}
        </button>
      </div>

      <p style={{ fontSize: '5px', color: '#4a4a6e', marginTop: '8px', textAlign: 'center' }}>
        WE NEVER SPAM. UNSUBSCRIBE ANYTIME.
      </p>
    </form>
  );
}
