"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/images";
import { featuredProjects } from "@/data/projects";
import { site } from "@/data/site";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { Magnetic } from "@/components/motion/Magnetic";
import { useMotion } from "@/components/motion/MotionProvider";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * The home opening is rendered in its final layout on the server. Motion
 * changes only transforms, opacity and the photo's clip-path, so neither the
 * entrance nor the scroll treatment changes the space reserved for it.
 */
export function HomeHero() {
  const heroRef = useRef<HTMLElement>(null);
  const { isReady } = useMotion();

  useGSAP(
    () => {
      const root = heroRef.current;
      const heading = root?.querySelector<HTMLElement>("[data-hero-heading]");
      const copy = root?.querySelector<HTMLElement>("[data-hero-copy]");
      const actions = root?.querySelector<HTMLElement>("[data-hero-actions]");
      const frame = root?.querySelector<HTMLElement>("[data-hero-frame]");
      const reveal = root?.querySelector<HTMLElement>("[data-hero-reveal]");
      const image = root?.querySelector<HTMLElement>("[data-hero-image]");
      const badge = root?.querySelector<HTMLElement>("[data-hero-badge]");
      const badgeText = root?.querySelector<SVGElement>("[data-hero-badge-text]");
      const values = root?.querySelectorAll<HTMLElement>("[data-hero-value]");
      if (!root || !heading || !copy || !actions || !frame || !reveal || !image || !badge || !badgeText || !values) return;

      const mm = gsap.matchMedia();

      // The default, server-rendered styles are the reduced-motion state:
      // everything is present, with no hidden links, spinning or parallax.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(heading, { opacity: 0 });
        gsap.set([copy, actions], { opacity: 0, y: 24 });
        gsap.set(reveal, { "--hero-inset": "8%" });
        gsap.set(image, { scale: 1.15, yPercent: 0 });
        gsap.set(badge, { opacity: 0, scale: 0 });
        gsap.set(values, { opacity: 0, y: 14 });

        // The intro owns the page until it releases it. These initial states
        // are set behind the veil and then reused by the entrance timeline.
        if (!isReady) return;

        const intro = document.querySelector<HTMLElement>("[data-intro]");
        // The provider releases the page partway through the veil's lift.
        // Wait for that lift on a full load; client navigation needs no wait.
        const start = intro && getComputedStyle(intro).display !== "none" ? 0.5 : 0;
        let headingRevealed = false;
        const split = SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(heading, { opacity: 1 });
            // Re-measure on resize without replaying an already-seen reveal.
            if (headingRevealed) return;
            return gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.05,
              ease: "soft",
              stagger: 0.1,
              delay: start,
              onComplete: () => { headingRevealed = true; },
            });
          },
        });

        const rotation = gsap.to(badgeText, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 22,
          repeat: -1,
          ease: "none",
        });
        let velocityReset: gsap.core.Tween | undefined;
        const velocityTrigger = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate(self) {
            const speed = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 700);
            velocityReset?.kill();
            rotation.timeScale(speed);
            velocityReset = gsap.to(rotation, { timeScale: 1, duration: 1.4, ease: "power2.out" });
          },
        });

        // Create the scrub only after the entrance has finished; otherwise
        // two tweens would compete for the image's transform during reveal.
        let parallaxContext: gsap.Context | undefined;
        const startParallax = () => {
          parallaxContext = gsap.context(() => {
            gsap.to(image, {
              yPercent: 12,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "clamp(top bottom)",
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }, root);
        };

        gsap.timeline()
          .to(copy, { opacity: 1, y: 0, duration: 0.85, ease: "soft" }, start + 0.32)
          .to(actions, { opacity: 1, y: 0, duration: 0.85, ease: "soft" }, start + 0.46)
          .to(reveal, { "--hero-inset": "0%", duration: 1.6, ease: "luxe" }, start + 0.08)
          .to(badge, { opacity: 1, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" }, start + 1.05)
          .to(values, { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "soft" }, start + 1.15)
          .call(startParallax, [], start + 1.68);

        return () => {
          velocityReset?.kill();
          velocityTrigger.kill();
          parallaxContext?.revert();
          split.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: heroRef, dependencies: [isReady], revertOnUpdate: true },
  );

  return (
    <section ref={heroRef} className="home-hero" aria-labelledby="home-hero-heading">
      <div className="shell home-hero__intro">
        <h1 id="home-hero-heading" className="home-hero__title" data-hero-heading>
          Interiors that feel as good as they look.
        </h1>

        <div className="home-hero__side">
          <p className="home-hero__description" data-hero-copy>
            {`${site.name} is a full-service interior design studio creating refined, modern spaces for homes, workplaces and hospitality across ${site.city} and beyond.`}
          </p>
          <div className="home-hero__actions" data-hero-actions>
            <ButtonLink href="/contact">Book a Consultation</ButtonLink>
            <ButtonLink href="/projects" variant="outline" withArrow={false}>
              View Our Work
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="home-hero__stage">
        <Link
          href="/projects"
          className="home-hero__image-frame"
          aria-label="Explore our projects"
          data-hero-frame
          data-cursor="Explore"
        >
          <span className="home-hero__image-reveal" data-hero-reveal>
            <span className="home-hero__image-motion" data-hero-image>
              <Image
                src={images.heroLounge.src}
                alt={images.heroLounge.alt}
                fill
                sizes="100vw"
                preload
                fetchPriority="high"
                style={{ objectFit: "cover", objectPosition: "center 55%" }}
                onLoad={() => ScrollTrigger.refresh()}
              />
            </span>
          </span>
        </Link>

        <div className="home-hero__badge-position">
          <Magnetic className="home-hero__badge-magnetic">
            <Link
              href="/contact"
              className="home-hero__badge"
              aria-label="Complimentary consultation • Book yours •"
              data-hero-badge
            >
              <svg className="home-hero__badge-text" viewBox="0 0 120 120" aria-hidden="true" data-hero-badge-text>
                <defs>
                  <path id="hero-consultation-circle" d="M 60,60 m -47,0 a 47,47 0 1,1 94,0 a 47,47 0 1,1 -94,0" />
                </defs>
                <text>
                  <textPath href="#hero-consultation-circle" textLength="295" lengthAdjust="spacingAndGlyphs">
                    Complimentary consultation • Book yours •
                  </textPath>
                </text>
              </svg>
              <ArrowIcon className="home-hero__badge-arrow" />
            </Link>
          </Magnetic>
        </div>

        <Link href="/projects" className="home-hero__info" data-tone="espresso" data-lenis-prevent>
          <dl className="shell home-hero__info-content">
            <div className="home-hero__info-cell">
              <dt>Latest Project</dt>
              <dd data-hero-value>{featuredProjects[0].name}</dd>
            </div>
            <div className="home-hero__info-cell">
              <dt>Type</dt>
              <dd data-hero-value>Residential</dd>
            </div>
            <div className="home-hero__info-cell home-hero__info-cell--last">
              <dt>Location</dt>
              <dd data-hero-value>{site.city}</dd>
              <ArrowIcon className="home-hero__info-arrow" />
            </div>
          </dl>
        </Link>
      </div>
    </section>
  );
}
