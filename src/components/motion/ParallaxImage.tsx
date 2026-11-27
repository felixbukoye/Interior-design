"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import type { SiteImage } from "@/data/images";

type ParallaxImageProps = {
  image: SiteImage;
  className?: string;
  /** Aspect ratio of the frame, e.g. "aspect-[4/5]". */
  frameClassName?: string;
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  priority?: boolean;
  /** 0 disables movement; 1 is the default depth. */
  strength?: number;
  /** Vertical offset of the scrub, in percent of the image height. */
  shift?: number;
  /** Starting scale, relaxing to 1 as the frame crosses the viewport. */
  scaleFrom?: number;
};

/**
 * Image inside a fixed frame, running 120% tall and scrubbing ±10% of its
 * own height as the frame crosses the viewport. Motion is disabled entirely
 * for reduced-motion users, who see a plain, correctly cropped image.
 */
export function ParallaxImage({
  image,
  className,
  frameClassName = "aspect-[4/5]",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  strength = 1,
  shift = 10,
  scaleFrom = 1,
}: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      if (!frame) return;
      const media = frame.querySelector<HTMLElement>("[data-parallax-media]");
      if (!media) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(media, { yPercent: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          media,
          { yPercent: -shift * strength, scale: scaleFrom },
          {
            yPercent: shift * strength,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: frameRef, dependencies: [strength, shift, scaleFrom] },
  );

  return (
    <div ref={frameRef} className={`media ${frameClassName} ${className ?? ""}`}>
      <div
        data-parallax-media
        className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform"
      >
        {/*
          The wrapper is the parallax layer (120% tall); the image itself is
          pinned to that layer with inset + object-cover. `fill` writes inline
          width/height, so sizing comes from the layer rather than utilities.
        */}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
