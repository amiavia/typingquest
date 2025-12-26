interface LegalPageProps {
  page: 'impressum' | 'privacy' | 'terms';
  onBack: () => void;
}

export function LegalPage({ page, onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pixel-btn mb-8"
          style={{ fontSize: '10px' }}
        >
          ← BACK
        </button>

        <div className="pixel-box p-6 md:p-8">
          {page === 'impressum' && <Impressum />}
          {page === 'privacy' && <PrivacyPolicy />}
          {page === 'terms' && <TermsOfService />}
        </div>
      </div>
    </div>
  );
}

function Impressum() {
  return (
    <div className="legal-content">
      <h1
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '32px',
        }}
      >
        IMPRESSUM
      </h1>

      {/* Contact Address */}
      <Section title="CONTACT ADDRESS">
        <p>Steininger AG</p>
        <p>c/o Zwicky und Partner</p>
        <p>Gartenstrasse 4</p>
        <p>6300 Zug</p>
        <p>Switzerland</p>
        <p className="mt-4">
          Email:{' '}
          <a href="mailto:info@miavia.ai" className="text-[#3bceac] hover:underline">
            info@miavia.ai
          </a>
        </p>
      </Section>

      {/* Trade Register */}
      <Section title="TRADE REGISTER ENTRY">
        <p>Registered Company: Steininger AG</p>
        <p>Commercial Register Office: Zug</p>
        <p>UID: CHE-457.951.283</p>
      </Section>

      {/* Copyright */}
      <Section title="COPYRIGHT">
        <p>
          The copyright and all other rights to the content, images, photos, or other files on
          this website belong exclusively to Steininger AG or the specifically named rights
          holders. Written consent from the copyright holder must be obtained in advance for the
          reproduction of any files.
        </p>
        <p className="mt-4">
          Anyone who commits a copyright infringement without the consent of the respective
          copyright holders may be liable to prosecution and potentially subject to damage claims.
        </p>
      </Section>

      {/* Disclaimer */}
      <Section title="DISCLAIMER">
        <p>
          All information on our website has been carefully checked. We endeavor to ensure that
          the information we provide is current, correct, and complete. Nevertheless, the
          occurrence of errors cannot be completely excluded, so we cannot guarantee the
          completeness, correctness, and timeliness of the information. Liability claims relating
          to damage of a material or ideal nature caused by the use or non-use of the information
          provided or by the use of incorrect and incomplete information are fundamentally
          excluded.
        </p>
        <p className="mt-4">
          The publisher may change or delete texts at their own discretion and without prior
          notice and is not obliged to update the contents of this website. The use of this
          website or access to it is at the visitor's own risk.
        </p>
        <p className="mt-4">
          The publisher also assumes no responsibility or liability for the content and
          availability of third-party websites that can be accessed via external links from this
          website. The operators of the linked pages are solely responsible for their content.
        </p>
        <p className="mt-4">
          All offers are non-binding. The publisher expressly reserves the right to change,
          supplement, delete parts of the pages or the entire offer, or to temporarily or
          permanently cease publication without special notice.
        </p>
      </Section>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="legal-content">
      <h1
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '32px',
        }}
      >
        PRIVACY POLICY
      </h1>

      <p
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#9a9ab0',
          marginBottom: '24px',
        }}
      >
        Last updated: December 25, 2025
      </p>

      <Section title="1. INTRODUCTION">
        <p>
          typebit8 ("we", "our", or "us") is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, and safeguard your information when you use our
          typing practice application at typebit8.com.
        </p>
      </Section>

      <Section title="2. INFORMATION WE COLLECT">
        <h4 className="text-[#ffd93d] mb-2">Account Information</h4>
        <p>
          When you create an account, we collect your email address and authentication
          information through our authentication provider (Clerk). If you sign in with Google,
          Apple, or GitHub, we receive your name and profile picture from these services.
        </p>

        <h4 className="text-[#ffd93d] mt-4 mb-2">Usage Data</h4>
        <p>
          We collect information about your typing practice sessions, including:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Words per minute (WPM) scores</li>
          <li>Accuracy percentages</li>
          <li>Lesson progress and completion status</li>
          <li>XP points and level progression</li>
          <li>Keyboard layout preferences</li>
        </ul>

        <h4 className="text-[#ffd93d] mt-4 mb-2">Technical Data</h4>
        <p>
          We automatically collect certain technical information, including browser type, device
          type, and general location (country level) for analytics purposes.
        </p>
      </Section>

      <Section title="3. HOW WE USE YOUR INFORMATION">
        <p>We use your information to:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Provide and maintain the typing practice service</li>
          <li>Track your progress and save your game state</li>
          <li>Display leaderboards and rankings</li>
          <li>Improve our service and user experience</li>
          <li>Send important service-related communications</li>
        </ul>
      </Section>

      <Section title="4. DATA STORAGE AND SECURITY">
        <p>
          Your data is stored securely using Convex, a modern backend platform with built-in
          security features. Authentication is handled by Clerk, which employs industry-standard
          security practices.
        </p>
        <p className="mt-4">
          We implement appropriate technical and organizational measures to protect your personal
          data against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </Section>

      <Section title="5. DATA SHARING">
        <p>
          We do not sell your personal data. We may share your data with:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>
            <strong>Service Providers:</strong> Clerk (authentication), Convex (database), and
            Vercel (hosting)
          </li>
          <li>
            <strong>Public Leaderboards:</strong> Your username and scores may appear on public
            leaderboards if you achieve a top ranking
          </li>
        </ul>
      </Section>

      <Section title="6. YOUR RIGHTS">
        <p>You have the right to:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p className="mt-4">
          To exercise these rights, please contact us at{' '}
          <a href="mailto:info@miavia.ai" className="text-[#3bceac] hover:underline">
            info@miavia.ai
          </a>
          .
        </p>
      </Section>

      <Section title="7. COOKIES AND LOCAL STORAGE">
        <p>
          We use local storage to save your keyboard layout preferences and session information.
          Our authentication provider (Clerk) uses cookies for session management. These are
          essential for the service to function properly.
        </p>
      </Section>

      <Section title="8. CHILDREN'S PRIVACY">
        <p>
          typebit8 is suitable for users of all ages. We do not knowingly collect personal
          information from children under 13 without parental consent. If you believe a child has
          provided us with personal data, please contact us.
        </p>
      </Section>

      <Section title="9. CHANGES TO THIS POLICY">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes
          by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </Section>

      <Section title="10. CONTACT US">
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <p className="mt-4">
          Email:{' '}
          <a href="mailto:info@miavia.ai" className="text-[#3bceac] hover:underline">
            info@miavia.ai
          </a>
        </p>
        <p className="mt-2">
          Steininger AG
          <br />
          Gartenstrasse 4
          <br />
          6300 Zug, Switzerland
        </p>
      </Section>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="legal-content">
      <h1
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '32px',
        }}
      >
        TERMS OF SERVICE
      </h1>

      <p
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#9a9ab0',
          marginBottom: '24px',
        }}
      >
        Last updated: December 25, 2025
      </p>

      <Section title="1. ACCEPTANCE OF TERMS">
        <p>
          By accessing or using typebit8 (typebit8.com), you agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use the service.
        </p>
      </Section>

      <Section title="2. DESCRIPTION OF SERVICE">
        <p>
          typebit8 is a free typing practice application designed to help users improve their
          keyboard typing skills through gamified lessons and exercises. The service includes
          progress tracking, leaderboards, and various typing challenges.
        </p>
      </Section>

      <Section title="3. USER ACCOUNTS">
        <p>
          To save your progress and appear on leaderboards, you may create an account using
          email, Google, Apple, or GitHub authentication. You are responsible for:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Maintaining the confidentiality of your account</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us of any unauthorized use</li>
        </ul>
      </Section>

      <Section title="4. ACCEPTABLE USE">
        <p>You agree not to:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Use automated tools or scripts to gain unfair advantages</li>
          <li>Attempt to manipulate leaderboard rankings</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use the service for any illegal purpose</li>
          <li>Create multiple accounts to circumvent restrictions</li>
        </ul>
      </Section>

      <Section title="5. INTELLECTUAL PROPERTY">
        <p>
          All content, features, and functionality of typebit8, including but not limited to
          text, graphics, logos, and software, are owned by Steininger AG and are protected by
          international copyright, trademark, and other intellectual property laws.
        </p>
      </Section>

      <Section title="6. USER CONTENT">
        <p>
          By using our leaderboard features, you grant us the right to display your username and
          scores publicly. You retain ownership of your personal data as described in our Privacy
          Policy.
        </p>
      </Section>

      <Section title="7. DISCLAIMER OF WARRANTIES">
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </p>
      </Section>

      <Section title="8. LIMITATION OF LIABILITY">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, STEININGER AG SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
          PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
          GOODWILL, OR OTHER INTANGIBLE LOSSES.
        </p>
      </Section>

      <Section title="9. MODIFICATIONS TO SERVICE">
        <p>
          We reserve the right to modify, suspend, or discontinue the service at any time without
          notice. We may also modify these Terms of Service at any time. Continued use of the
          service after changes constitutes acceptance of the modified terms.
        </p>
      </Section>

      <Section title="10. GOVERNING LAW">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          Switzerland, without regard to its conflict of law provisions. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in Zug, Switzerland.
        </p>
      </Section>

      <Section title="11. CONTACT">
        <p>
          For questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:info@miavia.ai" className="text-[#3bceac] hover:underline">
            info@miavia.ai
          </a>
          .
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: '#3bceac',
          marginBottom: '16px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#eef5db',
          lineHeight: '2.2',
        }}
      >
        {children}
      </div>
    </section>
  );
}
