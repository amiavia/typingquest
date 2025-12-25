import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-react";

interface PremiumPageProps {
  onClose?: () => void;
}

export function PremiumPage({ onClose }: PremiumPageProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stripe actions
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const cancelStripeSubscription = useAction(api.stripe.cancelSubscription);
  const reactivateStripeSubscription = useAction(api.stripe.reactivateSubscription);

  // Get plans and benefits
  const plans = useQuery(api.premium.getPlans);
  const benefits = useQuery(api.premium.getBenefits);
  const premiumStatus = useQuery(
    api.premium.getPremiumStatus,
    userId ? { clerkId: userId } : "skip"
  );

  // Get subscription for Stripe subscription ID
  const subscription = useQuery(
    api.premium.getSubscriptionByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  // Handle subscribe click
  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!userId || !user?.primaryEmailAddress?.emailAddress) {
      setError("Please sign in to subscribe");
      return;
    }

    setIsLoading(plan);
    setError(null);

    try {
      const result = await createCheckoutSession({
        clerkId: userId,
        email: user.primaryEmailAddress.emailAddress,
        plan,
        successUrl: `${window.location.origin}/?premium=success`,
        cancelUrl: `${window.location.origin}/?premium=cancelled`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to start checkout");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!subscription?.stripeSubscriptionId) {
      setError("No subscription found");
      return;
    }

    setIsLoading("cancel");
    setError(null);

    try {
      await cancelStripeSubscription({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      });
      // The webhook will update the database
    } catch (err: any) {
      console.error("Cancel error:", err);
      setError(err.message || "Failed to cancel subscription");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle reactivate subscription
  const handleReactivate = async () => {
    if (!subscription?.stripeSubscriptionId) {
      setError("No subscription found");
      return;
    }

    setIsLoading("reactivate");
    setError(null);

    try {
      await reactivateStripeSubscription({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      });
      // The webhook will update the database
    } catch (err: any) {
      console.error("Reactivate error:", err);
      setError(err.message || "Failed to reactivate subscription");
    } finally {
      setIsLoading(null);
    }
  };

  // Icon mapping
  const iconMap: Record<string, string> = {
    coin: "💰",
    freeze: "🧊",
    shop: "🏪",
    badge: "👑",
    priority: "⚡",
    "ad-free": "🚫",
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

      {/* Error Message */}
      {error && (
        <div
          className="max-w-2xl mx-auto mb-4 p-4 text-center"
          style={{
            background: "rgba(255, 107, 155, 0.2)",
            border: "2px solid #ff6b9d",
          }}
        >
          <p style={{ fontSize: "8px", color: "#ff6b9d" }}>{error.toUpperCase()}</p>
        </div>
      )}

      {/* Already Premium */}
      {premiumStatus?.isPremium && (
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
                {premiumStatus.plan?.toUpperCase()} PLAN
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p style={{ fontSize: "8px", color: "#3bceac" }}>
              {premiumStatus.cancelAtPeriodEnd
                ? "YOUR SUBSCRIPTION WILL END ON:"
                : "RENEWS ON:"}
            </p>
            <p style={{ fontSize: "10px", color: "#eef5db" }}>
              {premiumStatus.currentPeriodEnd
                ? formatDate(premiumStatus.currentPeriodEnd)
                : "N/A"}
            </p>
          </div>

          {premiumStatus.cancelAtPeriodEnd ? (
            <button
              onClick={handleReactivate}
              disabled={isLoading === "reactivate"}
              className="mt-4 px-4 py-2 border-2 border-[#0ead69] hover:bg-[#0ead69] hover:text-[#1a1a2e] transition-colors disabled:opacity-50"
              style={{ fontSize: "8px", color: "#0ead69" }}
            >
              {isLoading === "reactivate" ? "REACTIVATING..." : "REACTIVATE SUBSCRIPTION"}
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={isLoading === "cancel"}
              className="mt-4 px-4 py-2 border-2 border-[#ff6b9d] hover:bg-[#ff6b9d] hover:text-[#1a1a2e] transition-colors disabled:opacity-50"
              style={{ fontSize: "8px", color: "#ff6b9d" }}
            >
              {isLoading === "cancel" ? "CANCELLING..." : "CANCEL SUBSCRIPTION"}
            </button>
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
          {benefits?.map((benefit, i) => (
            <div
              key={i}
              className="pixel-box p-4 text-center"
              style={{ borderColor: "#ffd93d" }}
            >
              <span style={{ fontSize: "24px" }}>
                {iconMap[benefit.icon] || "✨"}
              </span>
              <h3
                className="mt-2 mb-1"
                style={{ fontSize: "10px", color: "#ffd93d" }}
              >
                {benefit.title.toUpperCase()}
              </h3>
              <p style={{ fontSize: "6px", color: "#3bceac", lineHeight: "1.8" }}>
                {benefit.description.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Plans */}
      {!premiumStatus?.isPremium && (
        <section className="max-w-3xl mx-auto mb-8">
          <h2
            className="text-center mb-6"
            style={{ fontSize: "14px", color: "#eef5db" }}
          >
            CHOOSE YOUR PLAN
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={`pixel-box p-6 text-center relative ${
                  plan.id === "yearly" ? "pixel-box-yellow" : ""
                }`}
                style={{
                  borderWidth: plan.id === "yearly" ? "4px" : "2px",
                  boxShadow:
                    plan.id === "yearly" ? "0 0 20px rgba(255,217,61,0.3)" : undefined,
                }}
              >
                {/* Best Value Badge */}
                {plan.id === "yearly" && (
                  <span
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1"
                    style={{
                      fontSize: "8px",
                      backgroundColor: "#ff6b9d",
                      color: "#1a1a2e",
                    }}
                  >
                    BEST VALUE
                  </span>
                )}

                <h3
                  className="mb-2"
                  style={{ fontSize: "12px", color: "#eef5db" }}
                >
                  {plan.name.toUpperCase()}
                </h3>

                <div className="mb-4">
                  <span style={{ fontSize: "24px", color: "#ffd93d" }}>
                    ${plan.price}
                  </span>
                  <span style={{ fontSize: "8px", color: "#4a4a6e" }}>
                    {" "}
                    / {plan.interval}
                  </span>
                </div>

                {/* Savings badge for yearly */}
                {"savings" in plan && (
                  <p
                    className="mb-4"
                    style={{ fontSize: "8px", color: "#0ead69" }}
                  >
                    SAVE {plan.savings}
                  </p>
                )}

                <button
                  onClick={() => handleSubscribe(plan.id as "monthly" | "yearly")}
                  disabled={isLoading === plan.id}
                  className="w-full py-3 border-4 border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors disabled:opacity-50"
                  style={{ fontSize: "10px", color: "#ffd93d" }}
                >
                  {isLoading === plan.id ? "LOADING..." : "SUBSCRIBE"}
                </button>
              </div>
            ))}
          </div>
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
            answer="Yes! You can cancel your subscription at any time. Your premium benefits will remain active until the end of your billing period."
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
            question="CAN I UPGRADE FROM MONTHLY TO YEARLY?"
            answer="Yes! You can upgrade at any time and we'll pro-rate the difference."
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
