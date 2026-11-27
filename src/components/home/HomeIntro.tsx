"use client";

import { useRef } from "react";
import Image from "next/image";
import { images } from "@/data/images";
import { site } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { CountUp } from "@/components/motion/CountUp";
import { LineFade } from "@/components/motion/LineFade";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** The thin gold rule drawn across the top edge of the image band. */
function BandLine() {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const path = svg.querySelector<SVGPathElement>("[data-intro-band-path]");
      if (!path) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(path, { drawSVG: "0% 100%" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(path, { drawSVG: "0% 0%" });
        gsap.to(path, {
          drawSVG: "0% 100%",
          duration: 1.4,
          ease: "luxe",
          scrollTrigger: { trigger: svg, start: "top 92%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      className="home-intro__band-line"
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path data-intro-band-path d="M0 0.5H100" stroke="var(--color-gold)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * The home introduction, following the reference "About Us" block: a portrait
 * photograph on the left, an espresso card that overlaps it on the right, and
 * a full-bleed image band below.
 *
 * Layout is plain CSS so the overlap is exact at every width; motion only
 * animates transforms, opacity, clip-path and a drawn SVG line, so the
 * reserved space never changes.
 */
export function HomeIntro() {
  const photoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Photo wipe: clip-path from the bottom edge with a slow inner settle.
  useGSAP(
    () => {
      const frame = photoRef.current;
      if (!frame) return;
      // The wipe runs on an inner layer so the frame's rounded corners stay
      // intact — clip-path on the frame itself would square them off.
      const clip = frame.querySelector<HTMLElement>("[data-intro-photo-clip]");
      const media = frame.querySelector<HTMLElement>("[data-intro-photo-media]");
      if (!clip || !media) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(clip, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(media, { scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          clip,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "luxe",
            scrollTrigger: { trigger: frame, start: "top 82%", once: true },
          },
        );
        gsap.fromTo(
          media,
          { scale: 1.2 },
          {
            scale: 1,
            duration: 1.9,
            ease: "soft",
            scrollTrigger: { trigger: frame, start: "top 82%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: photoRef },
  );

  // Card slides in from the right with a fade as the block enters.
  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(card, { autoAlpha: 1, x: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: 60 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 1.15,
            ease: "soft",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: cardRef },
  );

  return (
    <section className="home-intro" aria-labelledby="home-intro-heading" data-home-intro>
      <div className="shell">
        <div className="home-intro__grid">
          {/* Portrait photo, clipped from the bottom as it enters. */}
          <div ref={photoRef} className="home-intro__photo" data-intro-photo>
            <div className="home-intro__photo-clip" data-intro-photo-clip>
              <div className="home-intro__photo-motion" data-intro-photo-media>
                <Image
                  src={images.introDiningRoom.src}
                  alt={images.introDiningRoom.alt}
                  fill
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {/* Espresso card, overlapping the photo by 40px on desktop. */}
          <div ref={cardRef} className="home-intro__card" data-tone="espresso" data-intro-card>
            <div className="home-intro__card-inner">
              <Reveal className="home-intro__eyebrow" distance={20}>
                <p className="home-intro__eyebrow-text">
                  <span className="home-intro__eyebrow-rule" aria-hidden="true" />
                  Welcome to {site.name}
                </p>
              </Reveal>

              <SplitHeading
                as="h2"
                id="home-intro-heading"
                when="scroll"
                delay={0.1}
                className="home-intro__title"
              >
                Design with intention. Live with ease.
              </SplitHeading>

              <div className="home-intro__copy">
                <LineFade className="home-intro__body" start="top 88%">
                  Great interiors are not about more. They are about the right things,
                  placed with care. We combine clean modern lines, natural materials and
                  thoughtful lighting to create spaces that feel calm, look timeless and
                  work for the way you actually live.
                </LineFade>

                <LineFade className="home-intro__body" delay={0.08} start="top 90%">
                  From the first sketch to the final styling, we handle every detail so
                  you can enjoy the result without the stress of the process.
                </LineFade>
              </div>

              <div className="home-intro__rule" aria-hidden="true" />

              <dl className="home-intro__stats">
                {site.stats.map((stat) => (
                  <div className="home-intro__stat" key={stat.label}>
                    <dt className="home-intro__stat-label">{stat.label}</dt>
                    <dd className="home-intro__stat-value">
                      <CountUp value={stat.value} suffix="+" />
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="home-intro__action">
                <ButtonLink href="/studio/about" variant="gold">
                  Discover our approach
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed band with a scrubbed parallax and a drawn top hairline. */}
      <div className="home-intro__band-wrap">
        <div className="home-intro__band">
          <BandLine />
          <ParallaxImage
            image={images.introConsoleBand}
            frameClassName="home-intro__band-frame"
            sizes="100vw"
            strength={1}
            shift={12}
            scaleFrom={1.08}
          />
        </div>
      </div>
    </section>
  );
}
