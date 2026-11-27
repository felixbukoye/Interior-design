"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Remounts on every navigation (not on first load): resets scroll and
 * re-measures ScrollTrigger against the new route.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const before = window.scrollY;
    if (before > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, []);

  return <>{children}</>;
}
