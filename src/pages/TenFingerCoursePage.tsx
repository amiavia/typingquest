import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';
import { KeyboardWithHands } from '../components/KeyboardWithHands';

const faqs = [
  {
    question: 'How long does it take to learn 10-finger typing?',
    answer:
      'Most people can learn the basics of touch typing in 2-4 weeks with daily practice of 15-30 minutes. Achieving proficiency (60+ WPM) typically takes 1-3 months of consistent practice.',
  },
  {
    question: 'Do I really need to use all 10 fingers?',
    answer:
      'Yes! Using all 10 fingers with proper technique allows each finger to cover specific keys, minimizing hand movement and maximizing speed and accuracy.',
  },
  {
    question: 'Is it too late to learn touch typing as an adult?',
    answer:
      "It's never too late! Adults can absolutely learn touch typing. While children may pick it up faster, adults benefit from discipline and understanding of the process.",
  },
  {
    question: 'What is the home row?',
    answer:
      'The home row is ASDF JKL; on a QWERTY keyboard. This is where your fingers rest when not actively typing. Your left fingers rest on ASDF and right fingers on JKL;.',
  },
];

export function TenFingerCoursePage() {
  return (
    <>
      <SEOHead
        title="Free 10-Finger Typing Course - Learn Touch Typing"
        description="Learn proper touch typing with all 10 fingers. Our free course covers home row, top row, bottom row, and numbers with progressive lessons and visual guides."
        path="/10-finger-typing-course"
        schema={[schemas.course, schemas.faqPage(faqs)]}
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
              FREE 10-FINGER TYPING COURSE
            </h1>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#3bceac',
                marginTop: '8px',
              }}
            >
              LEARN PROPER TOUCH TYPING FROM SCRATCH
            </p>
          </header>

          {/* Keyboard Visualization */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                color: '#ffd93d',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              FINGER POSITIONING
            </h2>
            <KeyboardWithHands
              activeKey=""
              highlightKeys={['a', 's', 'd', 'f', 'j', 'k', 'l', ';']}
              layout="qwerty-us"
            />
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db',
                textAlign: 'center',
                marginTop: '16px',
                lineHeight: '2',
              }}
            >
              YOUR FINGERS REST ON THE HOME ROW: ASDF JKL;
            </p>
          </section>

          {/* Course Structure */}
          <section className="mb-12">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '24px',
              }}
            >
              COURSE STRUCTURE
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Tier 1 */}
              <div
                className="p-6"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '3px solid #22c55e',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#22c55e',
                    marginBottom: '12px',
                  }}
                >
                  LEVELS 1-3: HOME ROW
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  MASTER THE FOUNDATION: ASDF JKL; KEYS. LEARN PROPER FINGER PLACEMENT AND BUILD
                  MUSCLE MEMORY.
                </p>
              </div>

              {/* Tier 2 */}
              <div
                className="p-6"
                style={{
                  background: 'rgba(59, 206, 172, 0.1)',
                  border: '3px solid #3bceac',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#3bceac',
                    marginBottom: '12px',
                  }}
                >
                  LEVELS 4-6: TOP ROW
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  ADD THE TOP ROW: QWERTY UIOP. PRACTICE REACHING UP FROM HOME ROW AND RETURNING.
                </p>
              </div>

              {/* Tier 3 */}
              <div
                className="p-6"
                style={{
                  background: 'rgba(255, 217, 61, 0.1)',
                  border: '3px solid #ffd93d',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginBottom: '12px',
                  }}
                >
                  LEVELS 7-8: BOTTOM ROW
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  COMPLETE THE ALPHABET: ZXCVB NM. MASTER REACHING DOWN WHILE MAINTAINING POSITION.
                </p>
              </div>

              {/* Tier 4 */}
              <div
                className="p-6"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '3px solid #8b5cf6',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#8b5cf6',
                    marginBottom: '12px',
                  }}
                >
                  LEVEL 9: NUMBERS & SYMBOLS
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  ADD THE NUMBER ROW AND COMMON SYMBOLS. ESSENTIAL FOR CODING AND DOCUMENTS.
                </p>
              </div>
            </div>

            {/* Advanced Levels */}
            <div
              className="mt-4 p-6"
              style={{
                background: 'rgba(255, 107, 157, 0.1)',
                border: '3px solid #ff6b9d',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: '#ff6b9d',
                  marginBottom: '12px',
                }}
              >
                LEVELS 10+: SPEED BUILDING (PREMIUM)
              </h3>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '7px',
                  color: '#eef5db',
                  lineHeight: '2',
                }}
              >
                ADVANCED EXERCISES TO BUILD SPEED TO 80+ WPM. INCLUDES THEMED CONTENT FOR
                PROGRAMMERS, AI PROMPTING, AND BUSINESS COMMUNICATION.
              </p>
            </div>
          </section>

          {/* Why 10-finger typing */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '16px',
              }}
            >
              WHY LEARN 10-FINGER TYPING?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  SPEED
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  TOUCH TYPISTS AVERAGE 60-80 WPM, WHILE HUNT-AND-PECK TYPISTS STRUGGLE TO EXCEED
                  30 WPM.
                </p>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  ACCURACY
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  MUSCLE MEMORY MEANS FEWER ERRORS. NO NEED TO LOOK AT THE KEYBOARD.
                </p>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  FOCUS
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  KEEP YOUR EYES ON THE SCREEN. STAY IN FLOW STATE WITHOUT CONSTANT CONTEXT
                  SWITCHING.
                </p>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  ERGONOMICS
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  PROPER TECHNIQUE REDUCES STRAIN AND RSI RISK. BETTER FOR LONG-TERM HEALTH.
                </p>
              </div>
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
              START LESSON 1 FREE
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
