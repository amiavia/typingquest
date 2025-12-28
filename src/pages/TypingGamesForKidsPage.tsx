import { Link } from 'react-router-dom';
import { SEOHead, schemas } from '../components/SEOHead';

const faqs = [
  {
    question: 'What age is appropriate for learning to type?',
    answer:
      'Children can start learning typing basics around age 7-8 when their hands are large enough for a standard keyboard. Our lessons are designed for ages 7-14.',
  },
  {
    question: 'How long should kids practice typing each day?',
    answer:
      '15-20 minutes of focused practice is ideal for children. Short, consistent sessions are more effective than long, irregular ones.',
  },
  {
    question: 'Is typebit8 safe for children?',
    answer:
      'Yes! typebit8 has no ads, no chat features, and no external links. The content is educational and age-appropriate.',
  },
  {
    question: 'Do kids need to create an account?',
    answer:
      'No account is required to start. Kids can try the first 2 levels as a guest. Creating a free account unlocks progress tracking and more levels.',
  },
];

export function TypingGamesForKidsPage() {
  return (
    <>
      <SEOHead
        title="Typing Games for Kids - Fun Way to Learn Touch Typing"
        description="Free typing games for kids ages 7-14. Learn touch typing through fun, gamified lessons with pixel art graphics, rewards, and progress tracking."
        path="/typing-games-for-kids"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Typing Games for Kids',
            description:
              'Fun, gamified typing lessons designed for children ages 7-14 to learn touch typing.',
            provider: {
              '@type': 'Organization',
              name: 'typebit8',
              sameAs: 'https://www.typebit8.com',
            },
            educationalLevel: 'Beginner',
            isAccessibleForFree: true,
            audience: {
              '@type': 'EducationalAudience',
              educationalRole: 'student',
              suggestedMinAge: 7,
              suggestedMaxAge: 14,
            },
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
              🎮 TYPING GAMES FOR KIDS
            </h1>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#3bceac',
                marginTop: '8px',
              }}
            >
              LEARN TO TYPE WHILE HAVING FUN!
            </p>
          </header>

          {/* Hero Features */}
          <section className="mb-12 pixel-box p-6 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#3bceac' }}>
                  FUN LESSONS
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🪙</div>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffd93d' }}>
                  EARN COINS
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ff6b9d' }}>
                  BUILD STREAKS
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <p style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#0ead69' }}>
                  LEADERBOARDS
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-block px-8 py-4 transition-transform hover:scale-105"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                color: '#0f0f1b',
                boxShadow: '0 6px 0 #0a8a54',
              }}
            >
              LET'S START!
            </Link>
          </section>

          {/* Perfect for Ages */}
          <section className="mb-12">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '24px',
              }}
            >
              PERFECT FOR AGES 7-14
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="p-6"
                style={{
                  background: 'rgba(59, 206, 172, 0.1)',
                  border: '3px solid #3bceac',
                }}
              >
                <div className="text-3xl mb-3">🎮</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginBottom: '12px',
                  }}
                >
                  GAMIFIED LEARNING
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  EARN COINS, BUILD COMBOS, AND DEFEAT TYPING CHALLENGES. LEARNING FEELS LIKE
                  PLAYING!
                </p>
              </div>

              <div
                className="p-6"
                style={{
                  background: 'rgba(255, 217, 61, 0.1)',
                  border: '3px solid #ffd93d',
                }}
              >
                <div className="text-3xl mb-3">🎨</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginBottom: '12px',
                  }}
                >
                  PIXEL ART STYLE
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  RETRO 8-BIT GRAPHICS THAT KIDS LOVE. REMINISCENT OF CLASSIC VIDEO GAMES.
                </p>
              </div>

              <div
                className="p-6"
                style={{
                  background: 'rgba(255, 107, 157, 0.1)',
                  border: '3px solid #ff6b9d',
                }}
              >
                <div className="text-3xl mb-3">📊</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginBottom: '12px',
                  }}
                >
                  PROGRESS TRACKING
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  PARENTS CAN SEE HOW THEIR CHILD IS IMPROVING. TRACK WPM, ACCURACY, AND LEVELS
                  COMPLETED.
                </p>
              </div>

              <div
                className="p-6"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '3px solid #8b5cf6',
                }}
              >
                <div className="text-3xl mb-3">🛡️</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginBottom: '12px',
                  }}
                >
                  SAFE & AD-FREE
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  NO ADS, NO CHAT, NO EXTERNAL LINKS. 100% FOCUSED ON LEARNING.
                </p>
              </div>
            </div>
          </section>

          {/* For Parents Section */}
          <section className="mb-12 pixel-box p-6">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '16px',
              }}
            >
              FOR PARENTS
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
                <strong style={{ color: '#ffd93d' }}>SCREEN TIME THAT BUILDS SKILLS:</strong> Unlike
                passive entertainment, typebit8 teaches a real, valuable skill that your child
                will use throughout their life.
              </p>
              <p className="mb-4">
                <strong style={{ color: '#ffd93d' }}>SELF-PACED LEARNING:</strong> Kids can progress
                at their own speed. No pressure, no time limits on lessons.
              </p>
              <p className="mb-4">
                <strong style={{ color: '#ffd93d' }}>PROPER TECHNIQUE:</strong> Children learn
                correct finger placement from the start, avoiding bad habits that are hard to
                break later.
              </p>
              <p>
                <strong style={{ color: '#ffd93d' }}>FUTURE-READY:</strong> Keyboard skills are
                essential for school, standardized tests, and future careers.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#3bceac',
                marginBottom: '24px',
              }}
            >
              HOW IT WORKS
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="pixel-box p-4 text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  START A LEVEL
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  EACH LEVEL INTRODUCES NEW KEYS WITH VISUAL FINGER GUIDES
                </p>
              </div>

              <div className="pixel-box pixel-box-yellow p-4 text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  TYPE & EARN
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  BUILD COMBOS AND EARN COINS FOR ACCURACY AND SPEED
                </p>
              </div>

              <div className="pixel-box pixel-box-green p-4 text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '9px',
                    color: '#ffd93d',
                    marginBottom: '8px',
                  }}
                >
                  LEVEL UP
                </h3>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '7px',
                    color: '#eef5db',
                    lineHeight: '2',
                  }}
                >
                  UNLOCK NEW LEVELS AND CUSTOMIZE YOUR AVATAR
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
              PARENT FAQs
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
                fontSize: '14px',
                background: 'linear-gradient(180deg, #3bceac, #0ead69)',
                color: '#0f0f1b',
                boxShadow: '0 6px 0 #0a8a54',
              }}
            >
              🎮 LET'S START TYPING!
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
