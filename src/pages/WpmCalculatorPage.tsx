import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';

const faqs = [
  {
    question: 'How is WPM calculated?',
    answer:
      'WPM = (Total Characters / 5) / Minutes. The standard word length is 5 characters. So if you type 250 characters in 1 minute, your WPM is 250/5 = 50 WPM.',
  },
  {
    question: 'What is the difference between WPM and CPM?',
    answer:
      'WPM (Words Per Minute) measures words, while CPM (Characters Per Minute) measures individual characters. WPM = CPM / 5.',
  },
  {
    question: 'Should I count spaces in character count?',
    answer:
      'Yes, spaces count as characters. When calculating WPM, include all typed characters including spaces between words.',
  },
  {
    question: 'What is gross vs net WPM?',
    answer:
      'Gross WPM is your raw speed without considering errors. Net WPM subtracts errors: Net WPM = Gross WPM - (Errors / Minutes).',
  },
];

export function WpmCalculatorPage() {
  const [characters, setCharacters] = useState<string>('');
  const [timeSeconds, setTimeSeconds] = useState<string>('');
  const [result, setResult] = useState<{ wpm: number; cpm: number } | null>(null);

  const handleCalculate = () => {
    const chars = parseInt(characters);
    const seconds = parseInt(timeSeconds);

    if (chars > 0 && seconds > 0) {
      const minutes = seconds / 60;
      const wpm = Math.round(chars / 5 / minutes);
      const cpm = Math.round(chars / minutes);
      setResult({ wpm, cpm });
    }
  };

  return (
    <>
      <SEOHead
        title="WPM Calculator - Words Per Minute Calculator"
        description="Free WPM calculator to calculate your typing speed. Enter characters typed and time to get your words per minute (WPM) and characters per minute (CPM)."
        path="/wpm-calculator"
        schema={[
          schemas.webApplication('WPM Calculator', 'https://www.typebit8.com/wpm-calculator', [
            'WPM calculation',
            'CPM calculation',
            'Instant results',
            'No account required',
          ]),
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
              style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--accent-cyan)' }}
            >
              ← BACK TO APP
            </Link>
            <h1
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '20px',
                color: 'var(--accent-yellow)',
                lineHeight: '1.8',
              }}
              className="text-glow-yellow"
            >
              WPM CALCULATOR
            </h1>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--accent-cyan)',
                marginTop: '8px',
              }}
            >
              CALCULATE YOUR WORDS PER MINUTE
            </p>
          </header>

          {/* Calculator */}
          <section className="mb-12 pixel-box p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--accent-yellow)',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  CHARACTERS TYPED
                </label>
                <input
                  type="number"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="e.g., 250"
                  className="w-full p-4"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '14px',
                    background: 'var(--bg-tertiary)',
                    border: '3px solid var(--accent-cyan)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--accent-yellow)',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  TIME (SECONDS)
                </label>
                <input
                  type="number"
                  value={timeSeconds}
                  onChange={(e) => setTimeSeconds(e.target.value)}
                  placeholder="e.g., 60"
                  className="w-full p-4"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '14px',
                    background: 'var(--bg-tertiary)',
                    border: '3px solid var(--accent-cyan)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full py-4 transition-transform hover:scale-105"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--accent-green)',
              }}
            >
              CALCULATE
            </button>

            {/* Result */}
            {result && (
              <div className="mt-8 pt-6 border-t-2 text-center" style={{ borderColor: 'var(--border-color)' }}>
                <h2
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '12px',
                    color: 'var(--accent-yellow)',
                    marginBottom: '16px',
                  }}
                >
                  YOUR RESULT
                </h2>
                <div className="flex justify-center gap-12">
                  <div>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '36px',
                        color: 'var(--accent-cyan)',
                      }}
                      className="text-glow-cyan"
                    >
                      {result.wpm}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)' }}>
                      WPM
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '36px',
                        color: 'var(--accent-green)',
                      }}
                      className="text-glow-green"
                    >
                      {result.cpm}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: 'var(--text-primary)' }}>
                      CPM
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Formula Explanation */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: 'var(--heading-cyan)',
                marginBottom: '16px',
              }}
            >
              HOW WPM IS CALCULATED
            </h2>
            <div
              className="p-4 mb-4"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--accent-yellow)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: 'var(--accent-yellow)',
                }}
              >
                WPM = (Characters / 5) / Minutes
              </p>
            </div>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--text-primary)',
                lineHeight: '2.5',
              }}
            >
              THE STANDARD "WORD" IN TYPING IS DEFINED AS 5 CHARACTERS. THIS INCLUDES SPACES. SO IF
              YOU TYPE 300 CHARACTERS IN 60 SECONDS:
            </p>
            <div
              className="mt-4 p-4"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: 'var(--accent-cyan)',
                  lineHeight: '2.5',
                }}
              >
                WORDS = 300 / 5 = 60 WORDS
                <br />
                TIME = 60 / 60 = 1 MINUTE
                <br />
                WPM = 60 / 1 = 60 WPM
              </p>
            </div>
          </section>

          {/* WPM Benchmarks */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: 'var(--heading-cyan)',
                marginBottom: '16px',
              }}
            >
              WPM BENCHMARKS
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--accent-cyan)' }}>
                    <th
                      className="py-2 text-left"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      LEVEL
                    </th>
                    <th
                      className="py-2 text-left"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      WPM
                    </th>
                    <th
                      className="py-2 text-left"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      CPM
                    </th>
                    <th
                      className="py-2 text-left"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '10px',
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-2">BEGINNER</td>
                    <td className="py-2">20-30</td>
                    <td className="py-2">100-150</td>
                    <td className="py-2">HUNT AND PECK</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-2">AVERAGE</td>
                    <td className="py-2">40-50</td>
                    <td className="py-2">200-250</td>
                    <td className="py-2">CASUAL TYPIST</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-2">FAST</td>
                    <td className="py-2">60-80</td>
                    <td className="py-2">300-400</td>
                    <td className="py-2">PROFICIENT</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-2">EXPERT</td>
                    <td className="py-2">80-100</td>
                    <td className="py-2">400-500</td>
                    <td className="py-2">PROFESSIONAL</td>
                  </tr>
                  <tr>
                    <td className="py-2">WORLD-CLASS</td>
                    <td className="py-2">150+</td>
                    <td className="py-2">750+</td>
                    <td className="py-2">COMPETITIVE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: 'var(--heading-cyan)',
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
                      fontSize: '10px',
                      color: 'var(--accent-yellow)',
                      marginBottom: '8px',
                    }}
                  >
                    Q: {faq.question.toUpperCase()}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '10px',
                      color: 'var(--text-primary)',
                      lineHeight: '2.2',
                    }}
                  >
                    A: {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}
            >
              WANT TO IMPROVE YOUR WPM?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/typing-speed-test"
                className="inline-block px-6 py-4 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  background: 'transparent',
                  color: 'var(--accent-cyan)',
                  border: '3px solid var(--accent-cyan)',
                }}
              >
                TAKE SPEED TEST
              </Link>
              <Link
                to="/"
                className="inline-block px-6 py-4 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  boxShadow: '0 4px 0 var(--accent-green)',
                }}
              >
                START FREE COURSE
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
