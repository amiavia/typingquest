import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';
import { SpeedTest } from '../components/SpeedTest';
import { EmailCapture } from '../components/EmailCapture';
import { useRegionalPricing } from '../hooks/useRegionalPricing';

const faqs = [
  {
    question: 'What is a good typing speed?',
    answer:
      'The average typing speed is 40 WPM. A good typing speed for most purposes is 60-80 WPM. Professional typists often exceed 80 WPM, while competitive typists can reach 150+ WPM.',
  },
  {
    question: 'How is WPM calculated?',
    answer:
      'WPM (Words Per Minute) is calculated by dividing the total characters typed by 5 (the standard word length), then dividing by the time in minutes. The formula is: WPM = (Characters / 5) / Minutes.',
  },
  {
    question: 'How can I improve my typing speed?',
    answer:
      'Practice daily with structured lessons, focus on accuracy before speed, maintain proper posture and hand position, and use all 10 fingers with touch typing technique.',
  },
  {
    question: 'Is this typing test free?',
    answer:
      'Yes, the typebit8 typing speed test is completely free. No account required to take the test and see your results.',
  },
];

export function TypingSpeedTestPage() {
  const [testResult, setTestResult] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);
  const { country } = useRegionalPricing();

  const handleComplete = useCallback(
    (
      results: {
        wpm: number;
        accuracy: number;
        charactersTyped: number;
        errors: number;
        detectedLayout: string;
        testDurationMs: number;
      },
      _confirmed: boolean
    ) => {
      setTestResult({ wpm: results.wpm, accuracy: results.accuracy });
    },
    []
  );

  return (
    <>
      <SEOHead
        title="Free Typing Speed Test - Measure Your WPM"
        description="Take our free typing speed test to measure your words per minute (WPM) and accuracy. No account required. Get instant results and tips to improve."
        path="/typing-speed-test"
        schema={[
          schemas.webApplication(
            'Free Typing Speed Test',
            'https://www.typebit8.com/typing-speed-test',
            ['60-second typing test', 'WPM calculation', 'Accuracy tracking', 'No account required']
          ),
          schemas.faqPage(faqs),
        ]}
      />

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
              style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac' }}
            >
              ← BACK TO APP
            </Link>
            <h1
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '20px',
                color: '#ffd93d',
                lineHeight: '1.8',
              }}
              className="text-glow-yellow"
            >
              FREE TYPING SPEED TEST
            </h1>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#3bceac',
                marginTop: '8px',
              }}
            >
              MEASURE YOUR WPM IN 60 SECONDS
            </p>
          </header>

          {/* Speed Test Component */}
          <main className="mb-12">
            <SpeedTest onComplete={handleComplete} />

            {/* Result Display */}
            {testResult && (
              <div className="mt-8 pixel-box p-6 text-center">
                <h2
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '14px',
                    color: '#ffd93d',
                    marginBottom: '16px',
                  }}
                >
                  YOUR RESULT
                </h2>
                <div className="flex justify-center gap-8">
                  <div>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '32px',
                        color: '#3bceac',
                      }}
                      className="text-glow-cyan"
                    >
                      {testResult.wpm}
                    </div>
                    <div
                      style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}
                    >
                      WPM
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '32px',
                        color: '#0ead69',
                      }}
                      className="text-glow-green"
                    >
                      {testResult.accuracy}%
                    </div>
                    <div
                      style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}
                    >
                      ACCURACY
                    </div>
                  </div>
                </div>

                {/* PRP-046: Email Capture */}
                <div className="mt-6">
                  <EmailCapture
                    wpm={testResult.wpm}
                    accuracy={testResult.accuracy}
                    source="speed_test"
                    country={country}
                  />
                </div>

                {/* CTA to full course */}
                <div className="mt-8 pt-6 border-t-2 border-[#2a2a4e]">
                  <p
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '10px',
                      color: '#eef5db',
                      marginBottom: '16px',
                    }}
                  >
                    WANT TO IMPROVE YOUR SPEED?
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-4 transition-transform hover:scale-105"
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '10px',
                      background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                      color: '#0f0f1b',
                      boxShadow: '0 4px 0 #0a8a54',
                    }}
                  >
                    START FREE TYPING COURSE
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* SEO Content Below the Fold */}
          <section className="space-y-8">
            {/* What is a good typing speed */}
            <div className="pixel-box p-6">
              <h2
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  color: '#3bceac',
                  marginBottom: '16px',
                }}
              >
                WHAT IS A GOOD TYPING SPEED?
              </h2>
              <div
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#eef5db',
                  lineHeight: '2.5',
                }}
              >
                <p className="mb-4">
                  Typing speed is measured in Words Per Minute (WPM). The average person types at
                  around 40 WPM, but with practice, you can significantly improve.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full mt-4">
                    <thead>
                      <tr style={{ borderBottom: '2px solid #3bceac' }}>
                        <th className="py-2 text-left" style={{ color: '#ffd93d' }}>
                          LEVEL
                        </th>
                        <th className="py-2 text-left" style={{ color: '#ffd93d' }}>
                          WPM RANGE
                        </th>
                        <th className="py-2 text-left" style={{ color: '#ffd93d' }}>
                          DESCRIPTION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #2a2a4e' }}>
                        <td className="py-2">BEGINNER</td>
                        <td className="py-2">20-30</td>
                        <td className="py-2">HUNT AND PECK</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #2a2a4e' }}>
                        <td className="py-2">AVERAGE</td>
                        <td className="py-2">40-50</td>
                        <td className="py-2">CASUAL TYPIST</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #2a2a4e' }}>
                        <td className="py-2">FAST</td>
                        <td className="py-2">60-80</td>
                        <td className="py-2">PROFICIENT</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #2a2a4e' }}>
                        <td className="py-2">EXPERT</td>
                        <td className="py-2">80-100</td>
                        <td className="py-2">PROFESSIONAL</td>
                      </tr>
                      <tr>
                        <td className="py-2">WORLD-CLASS</td>
                        <td className="py-2">150+</td>
                        <td className="py-2">COMPETITIVE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* How to improve */}
            <div className="pixel-box p-6">
              <h2
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  color: '#3bceac',
                  marginBottom: '16px',
                }}
              >
                HOW TO IMPROVE YOUR TYPING SPEED
              </h2>
              <ul
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#eef5db',
                  lineHeight: '3',
                }}
              >
                <li>1. LEARN PROPER FINGER PLACEMENT ON THE HOME ROW</li>
                <li>2. USE ALL 10 FINGERS - DON'T HUNT AND PECK</li>
                <li>3. FOCUS ON ACCURACY FIRST, SPEED COMES LATER</li>
                <li>4. PRACTICE DAILY, EVEN 15 MINUTES HELPS</li>
                <li>5. AVOID LOOKING AT THE KEYBOARD</li>
                <li>6. MAINTAIN GOOD POSTURE</li>
                <li>7. USE STRUCTURED LESSONS TO BUILD MUSCLE MEMORY</li>
              </ul>
            </div>

            {/* FAQ Section */}
            <div className="pixel-box p-6">
              <h2
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  color: '#3bceac',
                  marginBottom: '16px',
                }}
              >
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '9px',
                        color: '#ffd93d',
                        marginBottom: '8px',
                      }}
                    >
                      Q: {faq.question.toUpperCase()}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '7px',
                        color: '#eef5db',
                        lineHeight: '2.2',
                      }}
                    >
                      A: {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center py-8">
              <Link
                to="/"
                className="inline-block px-8 py-4 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                  color: '#0f0f1b',
                  boxShadow: '0 4px 0 #0a8a54',
                }}
              >
                START FREE TYPING COURSE
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
