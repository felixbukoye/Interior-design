"use client";

import { useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type LineFadeProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before the sequence begins. */
  delay?: number;
  /** Seconds between each line. */
  stagger?: number;
  /** ScrollTrigger start for the block's entrance. */
  start?: string;
  id?: string;
};

/**
 * A paragraph that fades in line by line as it enters the viewport. Each line
 * is masked, so the fade also lifts it gently into place. `autoSplit` keeps
 * the split correct across font loading and resizes without replaying a
 * sequence the visitor has already seen. Reduced motion renders the paragraph
 * as ordinary, fully visible text with no split at all.
 */
export function LineFade({
  children,
  as: Tag = "p",
  className,
  delay = 0,
  stagger = 0.09,
  start = "top 88%",
  id,
}: LineFadeProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      let revealed = false;

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(el, { autoAlpha: 1 });

        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            // A resize after the reveal should re-mask, not replay it.
            if (revealed) return;
            return gsap.from(self.lines, {
              opacity: 0,
              yPercent: 30,
              duration: 0.85,
              ease: "soft",
              stagger,
              delay,
              scrollTrigger: { trigger: el, start, once: true },
              onComplete: () => { revealed = true; },
            });
          },
        });

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, stagger, start] },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
