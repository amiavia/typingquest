/**
 * PRP-027 Task 5.3: Loading States Components
 *
 * Consistent loading UI across the app.
 */

import { type ReactNode } from "react";

// Skeleton loader for shop items
export function ShopItemSkeleton(): ReactNode {
  return (
    <div className="pixel-box p-3 animate-pulse">
      <div className="w-full aspect-square mb-3 bg-[#4a4a6e] border-2 border-[#4a4a6e]" />
      <div className="h-3 bg-[#4a4a6e] rounded w-3/4 mb-2" />
      <div className="h-2 bg-[#4a4a6e] rounded w-1/2 mb-3" />
      <div className="h-8 bg-[#4a4a6e] rounded w-full" />
    </div>
  );
}

// Skeleton loader for lesson cards
export function LessonCardSkeleton(): ReactNode {
  return (
    <div className="pixel-box p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#4a4a6e] border-2 border-[#4a4a6e]" />
        <div className="flex-1">
          <div className="h-3 bg-[#4a4a6e] rounded w-3/4 mb-2" />
          <div className="h-2 bg-[#4a4a6e] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for challenge card
export function ChallengeCardSkeleton(): ReactNode {
  return (
    <div className="pixel-box p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-[#4a4a6e] rounded" />
        <div className="flex-1">
          <div className="h-4 bg-[#4a4a6e] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[#4a4a6e] rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-[#4a4a6e] rounded w-full mb-3" />
      <div className="h-10 bg-[#4a4a6e] rounded w-full" />
    </div>
  );
}

// Spinner for actions
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function Spinner({ size = "md", color = "#ffd93d" }: SpinnerProps): ReactNode {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeMap[size]} animate-spin`}
      style={{
        border: `3px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
      }}
    />
  );
}

// Progress bar for syncing
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps): ReactNode {
  return (
    <div>
      {label && (
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: "6px",
            color: "#4a4a6e",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
      )}
      <div className="h-3 bg-[#16213e] border border-[#4a4a6e]">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: "linear-gradient(90deg, #3bceac, #0ead69)",
          }}
        />
      </div>
    </div>
  );
}

// Full-screen loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "LOADING..." }: LoadingOverlayProps): ReactNode {
  return (
    <div
      className="fixed inset-0 bg-[#1a1a2e] bg-opacity-90 flex flex-col items-center justify-center z-50"
      style={{ fontFamily: "'Press Start 2P'" }}
    >
      {/* Pixel art loading animation */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-[#ffd93d] animate-bounce" style={{ animationDelay: "0s" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(45deg)" }}>
          <div className="w-4 h-4 bg-[#3bceac] animate-bounce" style={{ animationDelay: "0.1s" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(90deg)" }}>
          <div className="w-4 h-4 bg-[#ff6b9d] animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(135deg)" }}>
          <div className="w-4 h-4 bg-[#0ead69] animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>

      <p style={{ fontSize: "10px", color: "#eef5db" }}>{message}</p>
    </div>
  );
}

// Inline loading dots
export function LoadingDots(): ReactNode {
  return (
    <span className="inline-flex gap-1">
      <span className="w-2 h-2 bg-[#ffd93d] animate-bounce" style={{ animationDelay: "0s" }} />
      <span className="w-2 h-2 bg-[#ffd93d] animate-bounce" style={{ animationDelay: "0.1s" }} />
      <span className="w-2 h-2 bg-[#ffd93d] animate-bounce" style={{ animationDelay: "0.2s" }} />
    </span>
  );
}
