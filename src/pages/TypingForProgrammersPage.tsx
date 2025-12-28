import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';

const faqs = [
  {
    question: 'What typing speed should a programmer have?',
    answer:
      "Most professional programmers type at 60-80 WPM. While coding isn't just about speed, being able to type quickly means you can implement ideas faster and stay in flow state.",
  },
  {
    question: 'Which special characters are most important for coding?',
    answer:
      'The most common coding characters are: { } [ ] ( ) < > ; : = + - * / | \\ @ # $ % ^ & _ . These vary by language but are essential for most programming.',
  },
  {
    question: 'Should I learn Vim keybindings or just regular typing?',
    answer:
      'Start with regular touch typing first. Once you can type without looking at the keyboard, adding Vim or other keyboard shortcuts becomes much easier.',
  },
  {
    question: 'Is it worth relearning typing as an experienced developer?',
    answer:
      "Absolutely! If you currently hunt-and-peck or use only a few fingers, learning proper technique can significantly boost your productivity and reduce strain.",
  },
];

export function TypingForProgrammersPage() {
  return (
    <>
      <SEOHead
        title="Typing for Programmers - Code Faster with Touch Typing"
        description="Learn touch typing optimized for programming. Master special characters like {} [] () <>, terminal commands, and coding patterns. Type code faster."
        path="/learn-typing-for-programmers"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Typing for Programmers',
            description:
              'Learn touch typing with a focus on programming symbols, terminal commands, and code patterns.',
            provider: {
              '@type': 'Organization',
              name: 'typebit8',
              sameAs: 'https://www.typebit8.com',
            },
            educationalLevel: 'Intermediate',
            isAccessibleForFree: true,
            teaches: [
              'Programming symbol fluency',
              'Terminal command typing',
              'Code pattern muscle memory',
              'Special character proficiency',
            ],
          },
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
                fontSize: '18px',
                color: '#ffd93d',
                lineHeight: '1.8',
              }}
              className="text-glow-yellow"
            >
              TYPING FOR PROGRAMMERS
            </h1>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#3bceac',
                marginTop: '8px',
              }}
            >
              MASTER THE KEYBOARD. SHIP CODE FASTER.
            </p>
          </header>

          {/* Demo Section */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: '#ffd93d',
                marginBottom: '16px',
              }}
            >
              PRACTICE CODE PATTERNS
            </h2>
            <div
              className="p-4"
              style={{
                background: '#0f0f1b',
                border: '2px solid #3bceac',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#eef5db',
                lineHeight: '1.8',
              }}
            >
              <pre>
                {`const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await submitForm(data);
  } catch (err) {
    console.error(err);
  }
}`}
              </pre>
            </div>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#3bceac',
                marginTop: '12px',
                textAlign: 'center',
              }}
            >
              TYPE REAL CODE PATTERNS TO BUILD MUSCLE MEMORY
            </p>
          </section>

          {/* Why programmers need touch typing */}
          <section className="mb-12">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '24px',
              }}
            >
              WHY PROGRAMMERS NEED TOUCH TYPING
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="pixel-box p-4">
                <div className="text-3xl mb-3">⌨️</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  30K+ KEYSTROKES/DAY
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  AVERAGE DEVELOPER TYPES THOUSANDS OF CHARACTERS DAILY. EFFICIENCY MATTERS.
                </p>
              </div>

              <div className="pixel-box p-4">
                <div className="text-3xl mb-3">{'{ }'}</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  SPECIAL CHARACTERS
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  {`BRACKETS, BRACES, PIPES - CODING REQUIRES SYMBOLS MOST PEOPLE NEVER USE.`}
                </p>
              </div>

              <div className="pixel-box p-4">
                <div className="text-3xl mb-3">🧠</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  FLOW STATE
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  LOOKING AT THE KEYBOARD BREAKS CONCENTRATION. STAY IN THE ZONE.
                </p>
              </div>

              <div className="pixel-box p-4">
                <div className="text-3xl mb-3">🐛</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  FEWER BUGS
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  EYES ON SCREEN = CATCH TYPOS INSTANTLY. NO MORE MISSING SEMICOLONS.
                </p>
              </div>
            </div>
          </section>

          {/* What you'll learn */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '16px',
              }}
            >
              WHAT YOU'LL LEARN
            </h2>
            <ul
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db',
                lineHeight: '3',
              }}
            >
              <li>
                {`SYMBOL MASTERY: ( ) { } [ ] < > | \\ @ # $ % ^ & * _ + =`}
              </li>
              <li>COMMON PATTERNS: {`=> -> :: && || !== ===`}</li>
              <li>TERMINAL FLUENCY: GIT, NPM, DOCKER COMMANDS</li>
              <li>IDE SHORTCUTS: CMD+SHIFT+P, CTRL+/, ALT+ENTER</li>
              <li>VARIABLE NAMING: CAMELCASE, SNAKE_CASE, KEBAB-CASE</li>
              <li>COMMENT SYNTAX: // /* */ # {`<!-- -->`}</li>
            </ul>
          </section>

          {/* Terminal Commands Section */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: '#ffd93d',
                marginBottom: '16px',
              }}
            >
              TERMINAL COMMAND PRACTICE
            </h2>
            <div className="space-y-3">
              {[
                "git commit -m 'feat: add user authentication'",
                'npm install --save-dev @types/react',
                'docker-compose up -d --build',
                'kubectl get pods -n production',
                'ssh user@server.example.com -p 22',
              ].map((cmd, i) => (
                <div
                  key={i}
                  className="p-3"
                  style={{
                    background: '#0f0f1b',
                    border: '1px solid #2a2a4e',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#3bceac',
                  }}
                >
                  $ {cmd}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12 pixel-box p-6">
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
          </section>

          {/* CTA */}
          <section className="text-center py-8">
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
              START FREE COURSE
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
