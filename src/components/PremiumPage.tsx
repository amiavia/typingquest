/**
 * PRP-030: Clerk Billing Premium Page
 *
 * Uses Clerk's PricingTable component for subscription management.
 * Subscription management is handled through the UserProfile component.
 */

import { PricingTable, UserProfile } from "@clerk/clerk-react";
import { usePremium } from "../hooks/usePremium";
import { useState } from "react";

interface PremiumPageProps {
  onClose?: () => void;
}

// Premium benefits for display
const PREMIUM_BENEFITS = [
  { icon: "🎮", title: "ADVANCED LEVELS", description: "Unlock levels 10-30 with premium" },
  { icon: "💰", title: "2X COINS", description: "Double coin earnings on all activities" },
  { icon: "🧊", title: "STREAK FREEZES", description: "3 free freezes every month" },
  { icon: "🏪", title: "EXCLUSIVE ITEMS", description: "Access premium-only shop items" },
  { icon: "👑", title: "PREMIUM BADGE", description: "Show off your supporter status" },
  { icon: "⚡", title: "PRIORITY SUPPORT", description: "Get help faster" },
];

export function PremiumPage({ onClose }: PremiumPageProps) {
  const { isPremium, plan, isLoading } = usePremium();
  const [showManage, setShowManage] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: "10px", color: "#3bceac" }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ fontFamily: "'Press Start 2P'" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        {onClose && (
          <button
            onClick={onClose}
            className="pixel-btn"
            style={{ fontSize: "12px" }}
          >
            ← BACK
          </button>
        )}
        <h1
          className="flex items-center gap-3"
          style={{ fontSize: "16px", color: "#ffd93d" }}
        >
          <span>👑</span>
          <span>PREMIUM</span>
        </h1>
        <div /> {/* Spacer */}
      </header>

      {/* Already Premium - Show status and management */}
      {isPremium && (
        <section
          className="max-w-2xl mx-auto mb-8 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,217,61,0.2) 0%, rgba(249,115,22,0.2) 100%)",
            border: "4px solid #ffd93d",
            boxShadow: "0 0 30px rgba(255,217,61,0.3)",
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span style={{ fontSize: "32px" }}>👑</span>
            <div>
              <h2 style={{ fontSize: "14px", color: "#ffd93d" }}>
                YOU ARE PREMIUM!
              </h2>
              <p style={{ fontSize: "8px", color: "#eef5db" }}>
                {plan?.replace("premium_", "").toUpperCase()} PLAN
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowManage(!showManage)}
            className="mt-4 px-4 py-2 border-2 border-[#3bceac] hover:bg-[#3bceac] hover:text-[#1a1a2e] transition-colors"
            style={{ fontSize: "8px", color: "#3bceac" }}
          >
            {showManage ? "HIDE MANAGEMENT" : "MANAGE SUBSCRIPTION"}
          </button>

          {/* Clerk UserProfile for subscription management */}
          {showManage && (
            <div className="mt-6 rounded-lg overflow-hidden" style={{ background: "#1a1a2e" }}>
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: { width: "100%" },
                    card: { backgroundColor: "#1a1a2e", border: "none" },
                  },
                }}
              />
            </div>
          )}
        </section>
      )}

      {/* Benefits */}
      <section className="max-w-4xl mx-auto mb-8">
        <h2
          className="text-center mb-6"
          style={{ fontSize: "14px", color: "#eef5db" }}
        >
          PREMIUM BENEFITS
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREMIUM_BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="pixel-box p-4 text-center"
              style={{ borderColor: "#ffd93d" }}
            >
              <span style={{ fontSize: "24px" }}>{benefit.icon}</span>
              <h3
                className="mt-2 mb-1"
                style={{ fontSize: "10px", color: "#ffd93d" }}
              >
                {benefit.title}
              </h3>
              <p style={{ fontSize: "6px", color: "#3bceac", lineHeight: "1.8" }}>
                {benefit.description.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Journey - Motivational Section */}
      {!isPremium && (
        <section className="max-w-3xl mx-auto mb-8">
          <div
            className="relative overflow-hidden p-6"
            style={{
              background: "linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)",
              border: "4px solid #3bceac",
              boxShadow: "0 0 40px rgba(59,206,172,0.2), inset 0 0 60px rgba(59,206,172,0.05)",
            }}
          >
            {/* Decorative corner elements */}
            <div
              className="absolute top-0 left-0 w-16 h-16"
              style={{
                background: "linear-gradient(135deg, #3bceac 0%, transparent 50%)",
                opacity: 0.3,
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-16 h-16"
              style={{
                background: "linear-gradient(315deg, #3bceac 0%, transparent 50%)",
                opacity: 0.3,
              }}
            />

            <h2
              className="text-center mb-2"
              style={{ fontSize: "12px", color: "#3bceac" }}
            >
              ⌨️ YOUR TYPING JOURNEY ⌨️
            </h2>
            <p
              className="text-center mb-6"
              style={{ fontSize: "7px", color: "#eef5db", opacity: 0.8 }}
            >
              MASTER 10-FINGER TOUCH TYPING IN JUST A FEW MONTHS
            </p>

            {/* Journey Timeline */}
            <div className="relative">
              {/* Progress line */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block"
                style={{
                  background: "linear-gradient(180deg, #3bceac 0%, #ffd93d 50%, #f97316 100%)",
                  opacity: 0.5,
                }}
              />

              <div className="grid md:grid-cols-4 gap-4">
                {/* Week 1-2 */}
                <div
                  className="text-center p-4 relative"
                  style={{
                    background: "rgba(59,206,172,0.1)",
                    border: "2px solid rgba(59,206,172,0.3)",
                  }}
                >
                  <div
                    className="inline-block px-3 py-1 mb-2"
                    style={{ background: "#3bceac", color: "#1a1a2e", fontSize: "6px" }}
                  >
                    WEEK 1-2
                  </div>
                  <p style={{ fontSize: "16px", marginBottom: "4px" }}>🌱</p>
                  <p style={{ fontSize: "8px", color: "#3bceac" }}>15-20 WPM</p>
                  <p style={{ fontSize: "6px", color: "#eef5db", marginTop: "4px", lineHeight: "1.6" }}>
                    BUILDING MUSCLE MEMORY
                  </p>
                </div>

                {/* Month 1-2 */}
                <div
                  className="text-center p-4 relative"
                  style={{
                    background: "rgba(59,206,172,0.15)",
                    border: "2px solid rgba(59,206,172,0.4)",
                  }}
                >
                  <div
                    className="inline-block px-3 py-1 mb-2"
                    style={{ background: "#6ee7b7", color: "#1a1a2e", fontSize: "6px" }}
                  >
                    MONTH 1-2
                  </div>
                  <p style={{ fontSize: "16px", marginBottom: "4px" }}>🌿</p>
                  <p style={{ fontSize: "8px", color: "#6ee7b7" }}>30-40 WPM</p>
                  <p style={{ fontSize: "6px", color: "#eef5db", marginTop: "4px", lineHeight: "1.6" }}>
                    COMFORTABLE TYPING
                  </p>
                </div>

                {/* Month 3-6 */}
                <div
                  className="text-center p-4 relative"
                  style={{
                    background: "rgba(255,217,61,0.15)",
                    border: "2px solid rgba(255,217,61,0.4)",
                  }}
                >
                  <div
                    className="inline-block px-3 py-1 mb-2"
                    style={{ background: "#ffd93d", color: "#1a1a2e", fontSize: "6px" }}
                  >
                    MONTH 3-6
                  </div>
                  <p style={{ fontSize: "16px", marginBottom: "4px" }}>🌳</p>
                  <p style={{ fontSize: "8px", color: "#ffd93d" }}>50-60 WPM</p>
                  <p style={{ fontSize: "6px", color: "#eef5db", marginTop: "4px", lineHeight: "1.6" }}>
                    PROFICIENT TYPIST
                  </p>
                </div>

                {/* Month 6-12 */}
                <div
                  className="text-center p-4 relative"
                  style={{
                    background: "rgba(249,115,22,0.15)",
                    border: "2px solid rgba(249,115,22,0.4)",
                  }}
                >
                  <div
                    className="inline-block px-3 py-1 mb-2"
                    style={{ background: "#f97316", color: "#1a1a2e", fontSize: "6px" }}
                  >
                    MONTH 6-12
                  </div>
                  <p style={{ fontSize: "16px", marginBottom: "4px" }}>🏆</p>
                  <p style={{ fontSize: "8px", color: "#f97316" }}>70+ WPM</p>
                  <p style={{ fontSize: "6px", color: "#eef5db", marginTop: "4px", lineHeight: "1.6" }}>
                    TYPING MASTER
                  </p>
                </div>
              </div>
            </div>

            {/* Pro tip */}
            <div
              className="mt-6 p-3 text-center"
              style={{
                background: "rgba(255,217,61,0.1)",
                border: "2px dashed rgba(255,217,61,0.4)",
              }}
            >
              <p style={{ fontSize: "6px", color: "#ffd93d", lineHeight: "1.8" }}>
                💡 PRO TIP: 15-30 MIN DAILY PRACTICE BEATS OCCASIONAL LONG SESSIONS.<br />
                CONSISTENCY IS KEY - NEVER LOOK AT THE KEYBOARD!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Table - Only show if not premium */}
      {!isPremium && (
        <section className="max-w-3xl mx-auto mb-8">
          <h2
            className="text-center mb-6"
            style={{ fontSize: "14px", color: "#eef5db" }}
          >
            CHOOSE YOUR PLAN
          </h2>

          {/* Clerk PricingTable handles all checkout logic */}
          <div className="pixel-box p-6" style={{ background: "#1a1a2e" }}>
            <PricingTable />
          </div>

          <p
            className="text-center mt-4"
            style={{ fontSize: "6px", color: "#4a4a6e" }}
          >
            SECURE PAYMENT POWERED BY STRIPE
          </p>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-2xl mx-auto">
        <h2
          className="text-center mb-6"
          style={{ fontSize: "14px", color: "#eef5db" }}
        >
          FAQ
        </h2>

        <div className="space-y-4">
          <FaqItem
            question="CAN I CANCEL ANYTIME?"
            answer="Yes! You can cancel your subscription at any time through your profile. Your premium benefits will remain active until the end of your billing period."
          />
          <FaqItem
            question="WHAT PAYMENT METHODS ARE ACCEPTED?"
            answer="We accept all major credit cards through our secure payment provider Stripe."
          />
          <FaqItem
            question="DO I KEEP MY PURCHASES IF I CANCEL?"
            answer="Yes! Any items you purchased from the shop remain yours forever, even if you cancel your premium subscription."
          />
          <FaqItem
            question="HOW DO I MANAGE MY SUBSCRIPTION?"
            answer="Click 'Manage Subscription' above (if premium) or access billing through your profile settings."
          />
        </div>
      </section>

      {/* Footer Note */}
      <p
        className="text-center mt-12"
        style={{ fontSize: "6px", color: "#4a4a6e" }}
      >
        PRICES IN USD. SUBSCRIPTIONS AUTO-RENEW UNTIL CANCELLED.
      </p>
    </div>
  );
}

// FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="pixel-box p-4">
      <h4 className="mb-2" style={{ fontSize: "8px", color: "#3bceac" }}>
        {question}
      </h4>
      <p style={{ fontSize: "6px", color: "#eef5db", lineHeight: "1.8" }}>
        {answer.toUpperCase()}
      </p>
    </div>
  );
}
