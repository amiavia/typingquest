import { useEffect, useState } from "react";

interface RewardPopupProps {
  coins?: number;
  xp?: number;
  streak?: number;
  items?: string[];
  tier?: "bronze" | "silver" | "gold";
  message?: string;
  onClose: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function RewardPopup({
  coins,
  xp,
  streak,
  items,
  tier,
  message,
  onClose,
  autoDismiss = true,
  autoDismissDelay = 3000,
}: RewardPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    // Entry animation
    requestAnimationFrame(() => setIsVisible(true));

    // Stagger reward reveals
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (coins) {
      timers.push(setTimeout(() => setShowCoins(true), 200));
    }
    if (xp) {
      timers.push(setTimeout(() => setShowXP(true), 400));
    }
    if (streak) {
      timers.push(setTimeout(() => setShowStreak(true), 600));
    }
    if (items && items.length > 0) {
      timers.push(setTimeout(() => setShowItems(true), 800));
    }

    // Auto-dismiss
    if (autoDismiss) {
      timers.push(
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, autoDismissDelay)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [coins, xp, streak, items, autoDismiss, autoDismissDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Tier colors
  const tierColors = {
    bronze: "#cd7f32",
    silver: "#c0c0c0",
    gold: "#ffd93d",
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-300
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      {/* Backdrop with coin shower effect */}
      <div className="absolute inset-0 bg-black bg-opacity-80">
        {/* Coin particles */}
        {coins && coins > 0 && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${-10 - Math.random() * 20}%`,
                  animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                  animationDelay: `${Math.random() * 1}s`,
                  fontSize: "20px",
                }}
              >
                💰
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main popup */}
      <div
        className={`
          relative pixel-box p-8 max-w-md w-full mx-4
          transform transition-all duration-500
          ${isVisible ? "scale-100 translate-y-0" : "scale-75 translate-y-8"}
        `}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          boxShadow: tier
            ? `0 0 30px ${tierColors[tier]}`
            : "0 0 30px #3bceac",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="text-center mb-6">
          {tier && (
            <span
              className="text-3xl mb-2 block"
              style={{
                textShadow: `0 0 20px ${tierColors[tier]}`,
              }}
            >
              {tier === "gold" ? "🥇" : tier === "silver" ? "🥈" : "🥉"}
            </span>
          )}
          <h2
            className="text-lg mb-2"
            style={{
              color: tier ? tierColors[tier] : "#ffd93d",
              textShadow: `0 0 10px ${tier ? tierColors[tier] : "#ffd93d"}`,
            }}
          >
            {message || "REWARDS!"}
          </h2>
        </div>

        {/* Rewards Grid */}
        <div className="space-y-4">
          {/* Coins */}
          {coins !== undefined && coins > 0 && (
            <div
              className={`
                flex items-center justify-between p-3 border-2 border-[#ffd93d]
                transform transition-all duration-300
                ${showCoins ? "scale-100 opacity-100" : "scale-90 opacity-0"}
              `}
              style={{ backgroundColor: "rgba(255, 217, 61, 0.1)" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "20px" }}>💰</span>
                <span style={{ fontSize: "10px", color: "#eef5db" }}>
                  COINS
                </span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#ffd93d",
                  textShadow: "0 0 10px #ffd93d",
                }}
              >
                +{coins}
              </span>
            </div>
          )}

          {/* XP */}
          {xp !== undefined && xp > 0 && (
            <div
              className={`
                flex items-center justify-between p-3 border-2 border-[#3bceac]
                transform transition-all duration-300
                ${showXP ? "scale-100 opacity-100" : "scale-90 opacity-0"}
              `}
              style={{ backgroundColor: "rgba(59, 206, 172, 0.1)" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "20px" }}>⭐</span>
                <span style={{ fontSize: "10px", color: "#eef5db" }}>XP</span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#3bceac",
                  textShadow: "0 0 10px #3bceac",
                }}
              >
                +{xp}
              </span>
            </div>
          )}

          {/* Streak */}
          {streak !== undefined && streak > 0 && (
            <div
              className={`
                flex items-center justify-between p-3 border-2 border-[#f97316]
                transform transition-all duration-300
                ${showStreak ? "scale-100 opacity-100" : "scale-90 opacity-0"}
              `}
              style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "20px" }}>🔥</span>
                <span style={{ fontSize: "10px", color: "#eef5db" }}>
                  STREAK
                </span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#f97316",
                  textShadow: "0 0 10px #f97316",
                }}
              >
                {streak} DAYS
              </span>
            </div>
          )}

          {/* Items */}
          {items && items.length > 0 && (
            <div
              className={`
                p-3 border-2 border-[#8b5cf6]
                transform transition-all duration-300
                ${showItems ? "scale-100 opacity-100" : "scale-90 opacity-0"}
              `}
              style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: "20px" }}>🎁</span>
                <span style={{ fontSize: "10px", color: "#eef5db" }}>
                  ITEMS
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 border border-[#8b5cf6]"
                    style={{
                      fontSize: "8px",
                      color: "#8b5cf6",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close hint */}
        <p
          className="text-center mt-6"
          style={{ fontSize: "6px", color: "#4a4a6e" }}
        >
          TAP ANYWHERE TO CONTINUE
        </p>
      </div>

      {/* CSS for coin animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
