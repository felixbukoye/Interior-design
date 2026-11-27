"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useMotion } from "./MotionProvider";

type SplitHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Mount immediately, wait for the intro to lift, or wait for scroll. */
  when?: "mount" | "ready" | "scroll";
  delay?: number;
  /** Seconds between each line. */
  stagger?: number;
  id?: string;
};

/**
 * Headline reveal: lines split and masked, each rising into place with a
 * 0.08s stagger. `autoSplit` re-splits after fonts and resizes, and re-runs
 * the animation so the mask never clips a reflowed line.
 */
export function SplitHeading({
  children,
  as: Tag = "h2",
  className,
  when = "scroll",
  delay = 0,
  stagger = 0.08,
  id,
}: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { isReady } = useMotion();
  const waitingForIntro = when === "ready" && !isReady;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (waitingForIntro) {
        gsap.set(el, { autoAlpha: 0 });
        return;
      }

      gsap.set(el, { autoAlpha: 1 });

      const mm = gsap.matchMedia();

      // Reduced motion: no travel and no fade-in; the heading is simply set.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.05,
              ease: "soft",
              stagger,
              delay,
              scrollTrigger:
                when === "scroll"
                  ? { trigger: el, start: "top 88%", once: true }
                  : undefined,
            });
          },
        });

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [when, delay, stagger, waitingForIntro] },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
