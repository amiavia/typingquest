import { useState, useEffect } from "react";

interface CoinBalanceProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export function CoinBalance({
  balance,
  size = "md",
  showIcon = true,
  animated = true,
  onClick,
}: CoinBalanceProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate balance changes
  useEffect(() => {
    if (!animated || displayBalance === balance) return;

    setIsAnimating(true);
    const diff = balance - displayBalance;
    const steps = Math.min(Math.abs(diff), 20);
    const stepValue = diff / steps;
    let current = displayBalance;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplayBalance(balance);
        setIsAnimating(false);
        clearInterval(interval);
      } else {
        current += stepValue;
        setDisplayBalance(Math.round(current));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [balance, displayBalance, animated]);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "gap-1 px-2 py-1",
      icon: "text-xs",
      text: "text-[8px]",
      iconSize: "w-4 h-4",
    },
    md: {
      container: "gap-2 px-3 py-2",
      icon: "text-sm",
      text: "text-[10px]",
      iconSize: "w-5 h-5",
    },
    lg: {
      container: "gap-3 px-4 py-3",
      icon: "text-lg",
      text: "text-[12px]",
      iconSize: "w-6 h-6",
    },
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        flex items-center ${config.container}
        ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-default"}
        ${isAnimating ? "animate-pulse" : ""}
      `}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        backgroundColor: "rgba(255, 217, 61, 0.1)",
        border: "2px solid #ffd93d",
        boxShadow: isAnimating ? "0 0 15px #ffd93d" : "none",
      }}
    >
      {showIcon && (
        <div
          className={`${config.iconSize} flex items-center justify-center`}
          style={{
            backgroundColor: "#ffd93d",
            borderRadius: "50%",
            boxShadow: "0 0 8px #ffd93d",
          }}
        >
          <span
            className={config.icon}
            style={{
              color: "#1a1a2e",
              fontWeight: "bold",
            }}
          >
            $
          </span>
        </div>
      )}
      <span
        className={config.text}
        style={{
          color: "#ffd93d",
          textShadow: "0 0 5px rgba(255, 217, 61, 0.5)",
        }}
      >
        {displayBalance.toLocaleString()}
      </span>
    </button>
  );
}

// Compact inline version for headers
export function CoinBalanceInline({
  balance,
  onClick,
}: {
  balance: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        flex items-center gap-1
        ${onClick ? "cursor-pointer hover:text-[#ffd93d] transition-colors" : "cursor-default"}
      `}
      style={{
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <span style={{ fontSize: "10px", color: "#ffd93d" }}>$</span>
      <span style={{ fontSize: "8px", color: "#eef5db" }}>
        {balance.toLocaleString()}
      </span>
    </button>
  );
}
