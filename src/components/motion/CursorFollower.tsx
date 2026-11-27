"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const DEFAULT_SIZE = 14;
const ACTIVE_SIZE = 68;

/**
 * A small gold disc that trails the pointer and expands with a label
 * ("View", "Drag", …) over any element carrying `data-cursor="View"`.
 * Desktop pointers only; it is not rendered at all for touch or
 * reduced-motion users.
 */
export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide once on mount: fine pointer, wide enough viewport, and motion
  // allowed. Anything else keeps the element out of the DOM entirely.
  // Rendering it only after mount avoids a server/client mismatch.
  useEffect(() => {
    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot capability probe
    setEnabled(ok);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to(dot, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    };

    const hide = () => {
      visible = false;
      gsap.to(dot, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
    };

    const expand = (text: string) => {
      dot.dataset.state = "active";
      label.textContent = text;
      gsap.to(dot, {
        width: ACTIVE_SIZE,
        height: ACTIVE_SIZE,
        duration: 0.45,
        ease: "soft",
      });
      gsap.to(label, { autoAlpha: 1, duration: 0.3, delay: 0.06 });
    };

    const collapse = () => {
      dot.dataset.state = "idle";
      gsap.to(dot, {
        width: DEFAULT_SIZE,
        height: DEFAULT_SIZE,
        duration: 0.4,
        ease: "soft",
      });
      gsap.to(label, { autoAlpha: 0, duration: 0.15 });
    };

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      if (!visible) show();
    };

    // Text fields keep the native caret; the follower steps aside.
    const onOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const host = target?.closest<HTMLElement>("[data-cursor]");
      if (host) {
        expand(host.dataset.cursor || "View");
        dot.dataset.mode = "label";
        return;
      }
      if (target?.closest("a, button, [role='button']")) {
        dot.dataset.mode = "link";
        gsap.to(dot, { scale: 1.6, duration: 0.35, ease: "soft" });
        return;
      }
      collapse();
      dot.dataset.mode = "default";
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "soft" });
    };

    const onLeaveWindow = () => hide();
    const onDocumentLeave = () => hide();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onDocumentLeave);
    window.addEventListener("blur", onLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onOver);
      document.documentElement.removeEventListener("pointerleave", onDocumentLeave);
      window.removeEventListener("blur", onLeaveWindow);
      gsap.killTweensOf([dot, label]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className="cursor-follower hidden lg:flex"
      data-state="idle"
      aria-hidden="true"
    >
      <span ref={labelRef} className="cursor-follower__label" />
    </div>
  );
}
