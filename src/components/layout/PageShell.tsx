"use client";

import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

type PageShellProps = {
  children: ReactNode;
  /** Server-rendered value keeps the footer identical during hydration. */
  initialYear: number;
  /** Pass "dark" when a page opens on espresso. */
  headerTone?: "cream" | "dark";
};

/**
 * Client chrome shared by every route: motion provider (Lenis + intro),
 * header, footer, cursor follower and the ambient grain.
 */
export function PageShell({ children, initialYear, headerTone = "cream" }: PageShellProps) {
  return (
    <MotionProvider>
      <SiteHeader tone={headerTone} />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter initialYear={initialYear} />
      <CursorFollower />
      <div className="grain" aria-hidden="true" />
    </MotionProvider>
  );
}
