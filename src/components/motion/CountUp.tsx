"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type CountUpProps = {
  value: number;
  /** Text after the number, e.g. "+". Popped in once the count settles. */
  suffix?: string;
  className?: string;
  /** Total seconds for the count. */
  duration?: number;
};

/**
 * Counts from zero to `value` the first time it enters the viewport, snapping
 * to whole numbers. The suffix stays hidden until the count finishes, then
 * springs in. Reduced motion shows the final figure and suffix immediately.
 *
 * The animated digits are aria-hidden with a static, complete label beside
 * them, so assistive tech reads the number once rather than on every tick.
 */
export function CountUp({ value, suffix, className, duration = 1.6 }: CountUpProps) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const number = root.querySelector<HTMLElement>("[data-count-number]");
      const tail = root.querySelector<HTMLElement>("[data-count-suffix]");
      if (!number) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        number.textContent = String(value);
        if (tail) gsap.set(tail, { autoAlpha: suffix ? 1 : 0, scale: 1, clearProps: "transform" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        number.textContent = "0";
        if (tail) gsap.set(tail, { autoAlpha: 0, scale: 0.4 });

        const counter = { current: 0 };
        const tween = gsap.to(counter, {
          current: value,
          duration,
          ease: "power2.out",
          snap: { current: 1 },
          paused: true,
          onUpdate: () => { number.textContent = String(Math.round(counter.current)); },
          onComplete: () => {
            number.textContent = String(value);
            if (tail && suffix) {
              gsap.to(tail, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2.4)" });
            }
          },
        });

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 92%",
          once: true,
          onEnter: () => tween.play(),
        });

        return () => {
          trigger.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [value, suffix, duration] },
  );

  return (
    <span ref={rootRef} className={className}>
      <span className="sr-only">{`${value}${suffix ?? ""}`}</span>
      <span aria-hidden="true">
        <span data-count-number>{value}</span>
        {suffix && <span data-count-suffix className="inline-block">{suffix}</span>}
      </span>
    </span>
  );
}
