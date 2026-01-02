import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SEOHead } from '../components/SEOHead';

export function LinkClaudePage() {
  const { user, isLoaded } = useUser();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [linkedEmail, setLinkedEmail] = useState('');

  const claimLinkCode = useMutation(api.claudePlugin.claimLinkCode);

  // Format code as user types (ABC-123 format)
  const handleCodeChange = (value: string) => {
    // Remove non-alphanumeric characters and uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Add hyphen after first 3 characters
    if (cleaned.length <= 3) {
      setCode(cleaned);
    } else {
      setCode(cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setStatus('error');
      setErrorMessage('Please sign in first');
      return;
    }

    if (code.length !== 7) { // ABC-123 = 7 chars
      setStatus('error');
      setErrorMessage('Please enter a valid 6-character code');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await claimLinkCode({
        linkCode: code,
        clerkId: user.id,
      });

      if (result.success) {
        setStatus('success');
        setLinkedEmail(result.email || user.primaryEmailAddress?.emailAddress || '');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to link account');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <SEOHead
        title="Link Claude Code Plugin - typebit8"
        description="Connect your typebit8 account to the Claude Code plugin to sync your typing practice results."
        path="/link-claude"
      />

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
              style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}
            >
              ← BACK TO APP
            </Link>
            <h1
              style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: 'var(--accent-yellow)', lineHeight: '1.8' }}
              className="text-glow-yellow"
            >
              LINK CLAUDE CODE
            </h1>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '2', marginTop: '8px' }}>
              Connect your Claude Code plugin to sync typing practice results
            </p>
          </header>

          {/* Main Content */}
          <main className="pixel-box p-8">
            <SignedOut>
              {/* Not signed in */}
              <div className="text-center space-y-6">
                <div
                  className="p-4 mb-4"
                  style={{
                    background: 'var(--card-yellow-bg)',
                    border: '2px solid var(--accent-yellow)',
                  }}
                >
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2' }}>
                    Sign in to link your Claude Code plugin
                  </p>
                </div>
                <SignInButton mode="modal">
                  <button
                    className="pixel-button"
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '12px',
                      padding: '16px 32px',
                      background: 'var(--accent-cyan)',
                      color: 'var(--bg-primary)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    SIGN IN
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              {status === 'success' ? (
                /* Success State */
                <div className="text-center space-y-6">
                  <div
                    className="p-6"
                    style={{
                      background: 'var(--card-green-bg, rgba(0, 255, 0, 0.1))',
                      border: '2px solid var(--accent-green, #00ff00)',
                    }}
                  >
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--accent-green, #00ff00)', marginBottom: '16px' }}>
                      ✓
                    </div>
                    <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--accent-green, #00ff00)', marginBottom: '12px' }}>
                      ACCOUNT LINKED!
                    </h2>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2' }}>
                      Connected as: {linkedEmail}
                    </p>
                  </div>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '2' }}>
                    Your typing results from Claude Code will now sync to your account.
                    You can close this page and return to Claude Code.
                  </p>
                  <Link
                    to="/"
                    className="inline-block pixel-button"
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '10px',
                      padding: '12px 24px',
                      background: 'var(--accent-cyan)',
                      color: 'var(--bg-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    GO TO TYPEBIT8
                  </Link>
                </div>
              ) : (
                /* Code Entry Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="link-code"
                      style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}
                    >
                      ENTER YOUR 6-CHARACTER CODE:
                    </label>
                    <input
                      id="link-code"
                      type="text"
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="ABC-123"
                      maxLength={7}
                      disabled={status === 'loading'}
                      autoComplete="off"
                      autoFocus
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '24px',
                        width: '100%',
                        padding: '16px',
                        textAlign: 'center',
                        letterSpacing: '4px',
                        background: 'var(--bg-secondary)',
                        border: '2px solid var(--accent-cyan)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {status === 'error' && (
                    <div
                      className="p-4"
                      style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '2px solid #ff4444',
                      }}
                    >
                      <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ff4444', lineHeight: '2' }}>
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading' || code.length !== 7}
                    className="w-full pixel-button"
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '12px',
                      padding: '16px',
                      background: code.length === 7 ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                      color: code.length === 7 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: code.length === 7 ? 'pointer' : 'not-allowed',
                      opacity: status === 'loading' ? 0.7 : 1,
                    }}
                  >
                    {status === 'loading' ? 'LINKING...' : 'LINK ACCOUNT'}
                  </button>

                  <div
                    className="p-4"
                    style={{
                      background: 'var(--card-cyan-bg)',
                      border: '2px solid var(--accent-cyan)',
                    }}
                  >
                    <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-yellow)', marginBottom: '8px' }}>
                      HOW TO GET A CODE:
                    </h3>
                    <ol style={{ fontFamily: "'Press Start 2P'", fontSize: '9px', color: 'var(--text-primary)', lineHeight: '2.5', paddingLeft: '20px' }}>
                      <li>Run /typebit8:speed-test --link in Claude Code</li>
                      <li>Copy the 6-character code shown</li>
                      <li>Enter it above and click Link Account</li>
                    </ol>
                  </div>
                </form>
              )}
            </SignedIn>
          </main>
        </div>
      </div>
    </>
  );
}
