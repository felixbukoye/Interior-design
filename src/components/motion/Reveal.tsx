"use client";

import { useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before the reveal begins. */
  delay?: number;
  /** Pixels of rise. */
  distance?: number;
  duration?: number;
  /** ScrollTrigger start for the section's entrance. */
  start?: string;
  id?: string;
};

/**
 * The site's base entrance: a 1s opacity fade with a 40px rise on `soft`.
 * Reduced motion collapses it to a fade with no travel.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  distance = 40,
  duration = 1,
  start = "top 85%",
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Reduced motion: instant, no travel. Scroll still triggers nothing
      // except making the element present.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: distance },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            delay,
            ease: "soft",
            scrollTrigger: { trigger: el, start, once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, distance, duration, start] },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal>
      {children}
    </Tag>
  );
}
