/**
 * Privacy Policy Page
 *
 * Standalone route for /privacy
 */

import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { LegalPage } from '../components/LegalPage';

export function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Privacy Policy for typebit8 - Learn how we collect, use, and protect your personal information."
        path="/privacy"
      />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}
          >
            ← BACK TO APP
          </Link>
          <LegalPage page="privacy" onBack={() => window.history.back()} />
        </div>
      </div>
    </>
  );
}
