/**
 * PRP-049: Color Mode Toggle Button
 *
 * Simple toggle between light and dark themes.
 * Shows sun icon for dark mode (click to switch to light)
 * Shows moon icon for light mode (click to switch to dark)
 */

import { useColorMode } from "../providers/ColorModeProvider";

interface ColorModeToggleProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show text label */
  showLabel?: boolean;
  /** Additional className */
  className?: string;
}

export function ColorModeToggle({
  size = "md",
  showLabel = false,
  className = "",
}: ColorModeToggleProps) {
  const { toggleColorMode, isDark } = useColorMode();

  const sizeStyles = {
    sm: { fontSize: "10px", padding: "6px 10px" },
    md: { fontSize: "12px", padding: "8px 14px" },
    lg: { fontSize: "14px", padding: "10px 18px" },
  };

  return (
    <button
      onClick={toggleColorMode}
      className={`pixel-btn ${className}`}
      style={{
        ...sizeStyles[size],
        minWidth: "auto",
        display: "flex",
        alignItems: "center",
        gap: showLabel ? "8px" : "0",
      }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span style={{ fontSize: size === "sm" ? "12px" : size === "lg" ? "18px" : "14px" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
      {showLabel && (
        <span>{isDark ? "LIGHT" : "DARK"}</span>
      )}
    </button>
  );
}

/**
 * Inline icon-only toggle (minimal footprint)
 */
export function ColorModeToggleIcon() {
  const { toggleColorMode, isDark } = useColorMode();

  return (
    <button
      onClick={toggleColorMode}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        fontSize: "16px",
        lineHeight: 1,
        opacity: 0.8,
        transition: "opacity 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.8";
        e.currentTarget.style.transform = "scale(1)";
      }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
