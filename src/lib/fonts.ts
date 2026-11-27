import localFont from "next/font/local";

/**
 * Self-hosted variable fonts (SIL Open Font License — see src/fonts).
 * Self-hosting removes a third-party request, avoids layout shift and keeps
 * the site fast with no external font CDN.
 */

export const urbanist = localFont({
  src: [
    {
      path: "../fonts/urbanist-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-urbanist",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

// Keep both faces in the same family, but preload only the regular face.
// next/font applies `preload` to every source in one call, so registering the
// italic face separately avoids a 52 KB request before the hero image.
export const inter = localFont({
  src: [{ path: "../fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  declarations: [{ prop: "font-family", value: "inter" }],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const interItalic = localFont({
  src: [{ path: "../fonts/inter-latin-wght-italic.woff2", weight: "100 900", style: "italic" }],
  declarations: [{ prop: "font-family", value: "inter" }],
  variable: "--font-inter-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const playfair = localFont({
  src: [
    {
      path: "../fonts/playfair-display-latin-wght-italic.woff2",
      weight: "400 900",
      style: "italic",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});
