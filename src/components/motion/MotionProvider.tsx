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
import type Lenis from "lenis";
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
  const scrollLockedRef = useRef(false);
  const finished = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [areFontsReady, setAreFontsReady] = useState(false);

  // Hidden text may not count as a used font, so explicitly request the two
  // faces used in the initial viewport. Until their metrics settle, the site
  // is laid out but not painted behind the intro.
  useEffect(() => {
    let disposed = false;
    let released = false;
    let ownsFallback = false;
    let frame = 0;
    let fallbackTimer = 0;
    const release = (useFallback: boolean) => {
      if (disposed || released) return;
      released = true;
      window.clearTimeout(fallbackTimer);
      if (useFallback) {
        // If fonts are stalled, keep a stable system fallback for this page
        // load. A late font response must not rearrange an already-visible hero.
        document.documentElement.dataset.fontFallback = "true";
        ownsFallback = true;
      }
      setAreFontsReady(true);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    fallbackTimer = window.setTimeout(() => release(true), 1200);
    const fontSet = document.fonts;
    if (!fontSet) {
      release(true);
    } else {
      const styles = getComputedStyle(document.documentElement);
      const family = (token: string) => styles.getPropertyValue(token).split(",")[0].trim() || "sans-serif";
      try {
        Promise.all([
          fontSet.load(`500 16px ${family("--font-inter")}`),
          fontSet.load(`500 44px ${family("--font-urbanist")}`),
        ])
          .then((faces) => {
            if (faces.some((face) => face.length === 0)) {
              release(true);
              return;
            }
            return fontSet.ready.then(() => release(false));
          })
          .catch(() => release(true));
      } catch {
        release(true);
      }
    }

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(frame);
      if (ownsFallback) delete document.documentElement.dataset.fontFallback;
    };
  }, []);

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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let disposed = false;
    let generation = 0;
    const raf = (time: number) => lenis?.raf(time * 1000);
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
      lenisRef.current = null;
    };
    const syncMotion = () => {
      if (reducedMotion.matches) {
        generation += 1;
        stop();
      } else if (isReady && !lenis) {
        // The intro locks scrolling, so defer Lenis until it releases the page.
        // Native scrolling remains usable if the optional chunk cannot load.
        const request = ++generation;
        void import("lenis").then(({ default: Lenis }) => {
          if (disposed || request !== generation || reducedMotion.matches) return;
          lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            autoRaf: false,
            anchors: false,
          });
          lenisRef.current = lenis;
          if (scrollLockedRef.current) lenis.stop();
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
        }).catch(() => {});
      }
    };

    syncMotion();
    reducedMotion.addEventListener("change", syncMotion);
    return () => {
      disposed = true;
      generation += 1;
      reducedMotion.removeEventListener("change", syncMotion);
      stop();
    };
  }, [isReady]);

  /* ---------------------------------------------------------------- *
   * Page-load intro: espresso veil → wordmark → gold rule draws across →
   * veil lifts on clip-path → hero takes over.
   * ---------------------------------------------------------------- */
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const inner = overlay?.querySelector<HTMLElement>(".intro__inner");
      const label = labelRef.current;
      const line = lineRef.current;
      if (!overlay) return;

      // Never remove a React-owned node: Strict Mode replays effects in
      // development, and removing it leaves React's tree out of sync.
      if (finished.current) {
        gsap.set(overlay, { display: "none" });
        return;
      }

      document.documentElement.classList.add("intro-active");
      // Do not lift the veil onto a hidden page on a slow connection. The
      // shared font gate releases either with the fonts or a stable fallback.
      if (!areFontsReady) {
        return () => document.documentElement.classList.remove("intro-active");
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches) {
        gsap.set(overlay, { display: "none" });
        finishIntro();
        return;
      }
      if (inner) inner.style.visibility = "visible";

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

      // Cancel the timer on cleanup so Strict Mode's effect replay cannot
      // start a stale timeline or mutate an unmounted tree. If the preference
      // changes mid-intro, finish immediately instead of continuing the lift.
      const startTimer = window.setTimeout(() => timeline.play(0), 80);
      const onMotionChange = () => {
        if (!reducedMotion.matches) return;
        window.clearTimeout(startTimer);
        timeline.kill();
        gsap.set(overlay, { display: "none" });
        finishIntro();
      };
      reducedMotion.addEventListener("change", onMotionChange);
      return () => {
        reducedMotion.removeEventListener("change", onMotionChange);
        window.clearTimeout(startTimer);
        timeline.kill();
        if (inner) inner.style.visibility = "";
        document.documentElement.classList.remove("intro-active");
      };
    },
    { scope: rootRef, dependencies: [areFontsReady], revertOnUpdate: true },
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, []);

  const setScrollLocked = useCallback((locked: boolean) => {
    scrollLockedRef.current = locked;
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
    () => ({ isReady: isReady && areFontsReady, scrollTo, setScrollLocked }),
    [isReady, areFontsReady, scrollTo, setScrollLocked],
  );

  return (
    <MotionContext.Provider value={value}>
      <div ref={rootRef} id="site-root" data-fonts-ready={areFontsReady}>
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
