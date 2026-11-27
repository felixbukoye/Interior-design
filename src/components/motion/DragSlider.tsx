"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { Draggable, gsap, useGSAP } from "@/lib/gsap";

type DragSliderProps = {
  children: ReactNode;
  className?: string;
  /** Accessible label for the scrollable region. */
  label: string;
};

/**
 * Horizontal, keyboard-scrollable track that can also be dragged. Native
 * overflow and scroll-snap do the structural work (so keyboard, trackpad and
 * touch all behave); Draggable adds click-and-pull on pointer devices.
 */
export function DragSlider({ children, className, label }: DragSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const [draggable] = Draggable.create(track, {
          type: "x",
          inertia: false,
          edgeResistance: 0.9,
          dragResistance: 0.12,
          allowNativeTouchScrolling: true,
          cursor: "grab",
          activeCursor: "grabbing",
          onPress() {
            track.style.scrollSnapType = "none";
          },
        });

        return () => {
          draggable.kill();
          gsap.set(track, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { scope: trackRef },
  );

  return (
    <div
      ref={trackRef}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-cursor="Drag"
      data-lenis-prevent-wheel
      className={`flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&>*]:shrink-0 [&>*]:snap-start [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
