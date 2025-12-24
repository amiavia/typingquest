import { useState } from "react";

interface PremiumBadgeProps {
  size?: "sm" | "md";
  showTooltip?: boolean;
  onClick?: () => void;
}

const PREMIUM_BENEFITS = [
  "2x Coin Earnings",
  "3 Free Streak Freezes/Month",
  "Exclusive Shop Items",
  "Premium Badge",
  "Priority Support",
  "Ad-Free Experience",
];

export function PremiumBadge({
  size = "md",
  showTooltip = true,
  onClick,
}: PremiumBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeConfig = {
    sm: {
      container: "px-2 py-1",
      icon: "text-xs",
      text: "text-[6px]",
    },
    md: {
      container: "px-3 py-1.5",
      icon: "text-sm",
      text: "text-[8px]",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={!onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center gap-1 ${config.container}
          ${onClick ? "cursor-pointer hover:scale-105" : "cursor-default"}
          transition-all
        `}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          background: "linear-gradient(135deg, #ffd93d 0%, #f97316 100%)",
          border: "2px solid #ffd93d",
          boxShadow: "0 0 15px rgba(255, 217, 61, 0.5)",
          animation: "pulse 2s infinite",
        }}
      >
        <span className={config.icon}>👑</span>
        <span className={config.text} style={{ color: "#1a1a2e" }}>
          PREMIUM
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div
          className="absolute top-full left-0 mt-2 z-50"
          style={{
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          <div
            className="pixel-box p-3 w-48"
            style={{
              boxShadow: "0 0 20px rgba(255, 217, 61, 0.3)",
            }}
          >
            <h4
              className="mb-2"
              style={{ fontSize: "8px", color: "#ffd93d" }}
            >
              PREMIUM BENEFITS
            </h4>
            <ul className="space-y-1">
              {PREMIUM_BENEFITS.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2"
                  style={{ fontSize: "6px", color: "#eef5db" }}
                >
                  <span style={{ color: "#0ead69" }}>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 217, 61, 0.5);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 217, 61, 0.8);
          }
        }
      `}</style>
    </div>
  );
}

// Smaller inline version for usernames etc
export function PremiumIcon({ size = 12 }: { size?: number }) {
  return (
    <span
      style={{
        fontSize: `${size}px`,
        textShadow: "0 0 5px #ffd93d",
      }}
    >
      👑
    </span>
  );
}

// Premium upsell button for non-premium users
interface PremiumUpsellProps {
  message?: string;
  onClick: () => void;
}

export function PremiumUpsell({
  message = "Upgrade to Premium",
  onClick,
}: PremiumUpsellProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2 px-4 py-2
        border-2 border-dashed border-[#ffd93d]
        hover:border-solid hover:bg-[#ffd93d] hover:text-[#1a1a2e]
        transition-all
      "
      style={{
        fontFamily: "'Press Start 2P', monospace",
        color: "#ffd93d",
      }}
    >
      <span>👑</span>
      <span style={{ fontSize: "8px" }}>{message.toUpperCase()}</span>
    </button>
  );
}

// Premium feature lock overlay
interface PremiumLockProps {
  onUpgrade: () => void;
}

export function PremiumLock({ onUpgrade }: PremiumLockProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e] bg-opacity-90 z-10"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <span className="text-4xl mb-4">🔒</span>
      <p className="text-center mb-4" style={{ fontSize: "8px", color: "#eef5db" }}>
        PREMIUM FEATURE
      </p>
      <button
        onClick={onUpgrade}
        className="
          px-4 py-2
          border-2 border-[#ffd93d]
          hover:bg-[#ffd93d] hover:text-[#1a1a2e]
          transition-colors
        "
        style={{ fontSize: "8px", color: "#ffd93d" }}
      >
        👑 UPGRADE NOW
      </button>
    </div>
  );
}
