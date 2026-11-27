type ArrowIconProps = {
  className?: string;
  /** Diagonal (↗) by default, matching the studio's link language. */
  direction?: "diagonal" | "right" | "down";
};

/** Stroke arrow that inherits `currentColor`; used inside buttons and links. */
export function ArrowIcon({ className, direction = "diagonal" }: ArrowIconProps) {
  const rotation = direction === "right" ? 45 : direction === "down" ? 135 : 0;

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      <path
        d="M3.5 12.5 12.5 3.5M5.6 3.5h6.9v6.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
