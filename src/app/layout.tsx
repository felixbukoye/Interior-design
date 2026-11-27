import type { Metadata, Viewport } from "next";
import { inter, playfair, urbanist } from "@/lib/fonts";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: site.seo.defaultTitle,
    template: site.seo.titleTemplate,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    title: site.seo.defaultTitle,
    description: site.description,
    siteName: site.name,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FFF1DF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      {/* Browser extensions can add attributes here before React hydrates.
          Limit the suppression to body attributes, not the component tree. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
