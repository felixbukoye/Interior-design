"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";

type MotionContextValue = {
  /** True once the page-load intro has released the page. */
  isReady: boolean;
  scrollTo: (target: string | HTMLElement) => void;
  setScrollLocked: (locked: boolean) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

const FALLBACK: MotionContextValue = {
  isReady: true,
  scrollTo: () => {},
  setScrollLocked: () => {},
};

export function useMotion(): MotionContextValue {
  return useContext(MotionContext) ?? FALLBACK;
}

type MotionProviderProps = {
  children: ReactNode;
};

/**
 * Owns the single Lenis instance and the page-load intro timeline, and is
 * the only place Lenis is bridged into ScrollTrigger. It lives in the route
 * layout, so the intro plays exactly once per full page load and never
 * replays on client-side navigation.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const finished = useRef(false);

  const [isReady, setIsReady] = useState(false);

  const finishIntro = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setIsReady(true);
    document.documentElement.classList.remove("intro-active");
    ScrollTrigger.refresh();
  }, []);

  /* ---------------------------------------------------------------- *
   * Lenis ⇄ ScrollTrigger
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
      anchors: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- *
   * Page-load intro: espresso veil → wordmark → gold rule draws across →
   * veil lifts on clip-path → hero takes over.
   * ---------------------------------------------------------------- */
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const label = labelRef.current;
      const line = lineRef.current;
      if (!overlay) return;

      // Never remove a React-owned node: Strict Mode replays effects in
      // development, and removing it leaves React's tree out of sync.
      if (finished.current) {
        gsap.set(overlay, { display: "none" });
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(overlay, { display: "none" });
        finishIntro();
        return;
      }

      document.documentElement.classList.add("intro-active");

      const timeline = gsap.timeline({ defaults: { ease: "luxe" }, paused: true });

      // Kept deliberately brisk: ~0.55s to settle, ~1.1s to draw and lift.
      // A slower veil delays first meaningful paint for no visual gain.
      timeline
        .fromTo(
          label,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "soft" },
          0.02,
        )
        // DrawSVG runs the gold rule out from its left edge.
        .fromTo(
          line,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.6 },
          0.22,
        )
        .addLabel("lift", ">-0.12")
        .to(label, { autoAlpha: 0, y: -14, duration: 0.4, ease: "soft" }, "lift")
        .to(
          overlay,
          { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "luxe" },
          "lift+=0.08",
        )
        // Release the hero while the veil is still lifting out of frame.
        .call(finishIntro, [], "lift+=0.42")
        .set(overlay, { display: "none" });

      // Cancel the font gate and timers on cleanup so Strict Mode's effect
      // replay cannot start a stale timeline or mutate an unmounted tree.
      let disposed = false;
      let startTimer = 0;
      let fallbackTimer = 0;
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const fallback = new Promise<void>((resolve) => {
        fallbackTimer = window.setTimeout(resolve, 1200);
      });
      Promise.race([fontsReady, fallback]).then(() => {
        if (disposed) return;
        window.clearTimeout(fallbackTimer);
        startTimer = window.setTimeout(() => timeline.play(0), 80);
      });

      return () => {
        disposed = true;
        window.clearTimeout(startTimer);
        window.clearTimeout(fallbackTimer);
        timeline.kill();
        document.documentElement.classList.remove("intro-active");
      };
    },
    { scope: rootRef },
  );

  /* ---------------------------------------------------------------- *
   * Re-measure after fonts, images and resize
   * ---------------------------------------------------------------- */
  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    refresh();
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.4 });
      return;
    }
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const setScrollLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (locked) {
      lenis?.stop();
      document.documentElement.style.overflow = "clip";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({ isReady, scrollTo, setScrollLocked }),
    [isReady, scrollTo, setScrollLocked],
  );

  return (
    <MotionContext.Provider value={value}>
      <div ref={rootRef} id="site-root">
        {children}
      </div>

      <div ref={overlayRef} className="intro" aria-hidden="true" data-intro>
        <div className="intro__inner">
          <div ref={labelRef} className="intro__label">
            <span className="intro__eyebrow">{site.descriptor}</span>
            <span className="intro__name">{site.name}</span>
          </div>
          <svg
            className="intro__rule"
            width="240"
            height="2"
            viewBox="0 0 240 2"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={lineRef}
              d="M0 1H240"
              stroke="var(--color-gold)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="intro__city">{site.city}</span>
        </div>
      </div>
    </MotionContext.Provider>
  );
}
