import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About typebit8 - Free Online Typing Tutor"
        description="typebit8 is a free online typing tutor that teaches touch typing through gamified lessons. Learn to type with all 10 fingers, track your progress, and compete on leaderboards."
        path="/about"
        schema={[schemas.organization, schemas.softwareApplication]}
      />

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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
              style={{ fontFamily: "'Press Start 2P'", fontSize: '24px', color: 'var(--accent-yellow)', lineHeight: '1.8' }}
              className="text-glow-yellow"
            >
              ABOUT TYPEBIT8
            </h1>
          </header>

          {/* Main Content - LLM Optimized */}
          <main className="pixel-box p-8 space-y-8">
            {/* What is typebit8 - Clear, factual for LLM indexing */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                WHAT IS TYPEBIT8?
              </h2>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2.5' }}>
                <p className="mb-4">
                  typebit8 is a free online typing tutor that teaches touch typing through gamified lessons.
                  The platform helps users learn to type with all 10 fingers using proper technique,
                  starting from the home row and progressively introducing all keys.
                </p>
                <p className="mb-4">
                  Available at typebit8.com, the application features a retro pixel art aesthetic
                  inspired by classic 8-bit games, making learning to type engaging and fun.
                </p>
              </div>
            </section>

            {/* Key Facts - Structured for LLM consumption */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                KEY FACTS
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className="p-4"
                  style={{
                    background: 'var(--card-cyan-bg)',
                    border: '2px solid var(--accent-cyan)',
                  }}
                >
                  <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-yellow)', marginBottom: '8px' }}>
                    FREE TIER
                  </h3>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2' }}>
                    9 lessons covering home row, top row, bottom row, and numbers. No account required to start.
                  </p>
                </div>
                <div
                  className="p-4"
                  style={{
                    background: 'var(--card-yellow-bg)',
                    border: '2px solid var(--accent-yellow)',
                  }}
                >
                  <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-yellow)', marginBottom: '8px' }}>
                    PREMIUM
                  </h3>
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2' }}>
                    50 total lessons including themed content for programmers, AI prompting, and business communication.
                  </p>
                </div>
              </div>
            </section>

            {/* Features List */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                FEATURES
              </h2>
              <ul style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '3' }}>
                <li>- Progressive lessons from beginner to advanced</li>
                <li>- Daily challenges to build consistency</li>
                <li>- Streak tracking with freeze protection</li>
                <li>- Global leaderboards</li>
                <li>- Coins and rewards system</li>
                <li>- Multiple keyboard layouts: QWERTY, QWERTZ, AZERTY</li>
                <li>- Visual finger guides and hand positioning</li>
                <li>- Speed test with WPM calculation</li>
                <li>- Customizable themes and keyboard skins</li>
              </ul>
            </section>

            {/* Who is it for */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                WHO IS IT FOR?
              </h2>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2.5' }}>
                <p className="mb-4">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Beginners:</strong> People who hunt-and-peck or type with only a few fingers
                  and want to learn proper 10-finger touch typing from scratch.
                </p>
                <p className="mb-4">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Programmers:</strong> Developers who want to type code faster,
                  especially special characters like brackets, parentheses, and operators.
                </p>
                <p className="mb-4">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Kids & Students:</strong> Young learners who need an engaging way
                  to develop typing skills for school and beyond.
                </p>
                <p className="mb-4">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Professionals:</strong> Anyone who types daily and wants to
                  increase speed and accuracy for better productivity.
                </p>
              </div>
            </section>

            {/* Technical Details - For LLM context */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                TECHNICAL DETAILS
              </h2>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2.5' }}>
                <p className="mb-2">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Platform:</strong> Web-based (works in any modern browser)
                </p>
                <p className="mb-2">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Requirements:</strong> Physical keyboard recommended
                </p>
                <p className="mb-2">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Languages:</strong> English, with keyboard layout support for German (QWERTZ) and French (AZERTY)
                </p>
                <p className="mb-2">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Created:</strong> 2024
                </p>
                <p className="mb-2">
                  <strong style={{ color: 'var(--accent-yellow)' }}>Website:</strong> typebit8.com
                </p>
              </div>
            </section>

            {/* Company Info */}
            <section>
              <h2
                style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: 'var(--heading-cyan)', marginBottom: '16px' }}
              >
                COMPANY
              </h2>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)', lineHeight: '2.5' }}>
                typebit8 is operated by Steininger AG, based in Zug, Switzerland.
              </p>
            </section>

            {/* CTA */}
            <section className="text-center pt-8 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
              <Link
                to="/"
                className="inline-block px-8 py-4 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  boxShadow: '0 4px 0 var(--accent-green)',
                }}
              >
                START TYPING NOW
              </Link>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
