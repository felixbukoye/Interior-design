"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Maximum pull toward the cursor, in px. */
  strength?: number;
  /** Fraction of the cursor offset applied. */
  ease?: number;
};

/**
 * Pulls its child toward the cursor on desktop, capped at 12px, then springs
 * home on leave. Never active for touch or reduced-motion users.
 */
export function Magnetic({ children, className, strength = 12, ease = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });

        const clamp = gsap.utils.clamp(-strength, strength);

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = (event.clientX - (rect.left + rect.width / 2)) * ease;
          const dy = (event.clientY - (rect.top + rect.height / 2)) * ease;
          xTo(clamp(dx));
          yTo(clamp(dy));
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);

        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          gsap.set(el, { x: 0, y: 0 });
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [strength, ease] },
  );

  return (
    <span ref={ref} className={className ? `inline-flex ${className}` : "inline-flex"}>
      {children}
    </span>
  );
}
