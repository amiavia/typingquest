import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto py-8 px-4"
      style={{
        borderTop: '3px solid var(--border-color)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Learn */}
          <div>
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--accent-yellow)',
                marginBottom: '16px',
              }}
            >
              {t('footer.learn')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/10-finger-typing-course"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.tenFingerCourse')}
                </Link>
              </li>
              <li>
                <Link
                  to="/learn-typing-for-programmers"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.typingForDevs')}
                </Link>
              </li>
              <li>
                <Link
                  to="/typing-games-for-kids"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.gamesForKids')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--accent-yellow)',
                marginBottom: '16px',
              }}
            >
              {t('footer.tools')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/typing-speed-test"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.speedTest')}
                </Link>
              </li>
              <li>
                <Link
                  to="/wpm-calculator"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.wpmCalculator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--accent-yellow)',
                marginBottom: '16px',
              }}
            >
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                  className="hover:text-[var(--accent-cyan)] transition-colors"
                >
                  {t('footer.home')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand */}
          <div>
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: 'var(--accent-cyan)',
                marginBottom: '8px',
              }}
              className="text-glow"
            >
              TYPEBIT8
            </h3>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--text-primary)',
                lineHeight: '2',
                marginBottom: '16px',
              }}
            >
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://x.com/typebit873696"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: 'var(--text-primary)',
                }}
                className="hover:text-[var(--accent-cyan)] transition-colors"
              >
                X.COM
              </a>
              <a
                href="https://www.tiktok.com/@typebit8"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: 'var(--text-primary)',
                }}
                className="hover:text-[var(--accent-cyan)] transition-colors"
              >
                TIKTOK
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 text-center"
          style={{ borderTop: '1px solid var(--border-color-muted)' }}
        >
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}
          >
            {currentYear} TYPEBIT8. {t('footer.levelUp')}
          </p>
        </div>
      </div>
    </footer>
  );
}
