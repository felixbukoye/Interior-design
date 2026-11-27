import type { Config } from "tailwindcss";

/**
 * Design tokens. Colors resolve to CSS custom properties defined in
 * `src/app/globals.css` so there is exactly one place to change a hue.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "var(--color-cream)",
          deep: "var(--color-cream-deep)",
        },
        espresso: {
          DEFAULT: "var(--color-espresso)",
          lift: "var(--color-espresso-lift)",
        },
        ink: "var(--color-ink)",
        gold: {
          DEFAULT: "var(--color-gold)",
          hover: "var(--color-gold-hover)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          dark: "var(--color-muted-on-dark)",
        },
        hairline: {
          cream: "var(--color-hairline-cream)",
          dark: "var(--color-hairline-dark)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-urbanist)",
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        accent: ["var(--font-playfair)", "Georgia", "serif"],
      },
      fontSize: {
        h1: [
          "clamp(48px, 5.2vw, 76px)",
          { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        h2: [
          "clamp(36px, 3.6vw, 52px)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        h3: ["24px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "500" }],
        eyebrow: ["14px", { lineHeight: "1.2", letterSpacing: "0.04em", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.75" }],
        "body-lg": ["18px", { lineHeight: "1.7" }],
        "body-sm": ["14px", { lineHeight: "1.6" }],
        btn: ["15px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "500" }],
      },
      maxWidth: {
        shell: "1240px",
        prose: "58ch",
      },
      borderRadius: {
        card: "6px",
        btn: "4px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.65, 0, 0.35, 1)",
        soft: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        600: "600ms",
        900: "900ms",
      },
      aspectRatio: {
        editorial: "4 / 5",
        landscape: "16 / 10",
        portrait: "3 / 4",
        square: "1 / 1",
      },
      screens: {
        xs: "480px",
      },
      zIndex: {
        header: "50",
        overlay: "90",
        cursor: "95",
        intro: "100",
      },
    },
  },
  plugins: [],
};

export default config;
