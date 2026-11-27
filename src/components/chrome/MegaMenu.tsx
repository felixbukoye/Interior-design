"use client";

import { useRef } from "react";
import type { PointerEventHandler } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  featuredCaseStudy,
  featuredProjectCards,
  projectTypes,
  serviceGroups,
  studioNav,
} from "@/data/navigation";
import type { DescribedNavLink, MegaMenuName } from "@/data/navigation";
import { images } from "@/data/images";
import type { SiteImage } from "@/data/images";
import { site } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

type MegaMenuProps = {
  name: MegaMenuName;
  open: boolean;
  loadImages: boolean;
  onNavigate: () => void;
  onPointerEnter: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
};

function DescribedLink({ item, onNavigate }: { item: DescribedNavLink; onNavigate: () => void }) {
  return (
    <li data-mega-item>
      <Link href={item.href} onClick={onNavigate} className="mega-link">
        <span className="mega-link__title">{item.label}</span>
        <span className="mega-link__description">{item.description}</span>
      </Link>
    </li>
  );
}

type FeatureCardProps = {
  image: SiteImage;
  description: string;
  href: string;
  linkText: string;
  open: boolean;
  loadImage: boolean;
  onNavigate: () => void;
  eyebrow?: string;
};

/** The image moves independently from the card so its edges stay covered. */
function FeatureCard({ image, description, href, linkText, open, loadImage, onNavigate, eyebrow }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      const imageElement = imageRef.current;
      if (!open || !card || !imageElement) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const x = gsap.quickTo(imageElement, "x", { duration: 0.8, ease: "power3.out" });
        const y = gsap.quickTo(imageElement, "y", { duration: 0.8, ease: "power3.out" });
        const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3.out" });

        const move = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const horizontal = gsap.utils.clamp(-1, 1, (event.clientX - rect.left) / rect.width * 2 - 1);
          const vertical = gsap.utils.clamp(-1, 1, (event.clientY - rect.top) / rect.height * 2 - 1);
          x(horizontal * -6);
          y(vertical * -6);
          rotateX(vertical * -2);
          rotateY(horizontal * 2);
        };
        const reset = () => {
          x(0);
          y(0);
          rotateX(0);
          rotateY(0);
        };

        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", reset);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: cardRef, dependencies: [open], revertOnUpdate: true },
  );

  return (
    <div ref={cardRef} className="mega-feature">
      <div ref={imageRef} className="mega-feature__image" data-feature-image>
        {loadImage && <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1200px) 260px, 22vw" />}
      </div>
      <div className="mega-feature__shade" aria-hidden="true" />
      <div className="mega-feature__content">
        {eyebrow && <p className="mega-feature__eyebrow">{eyebrow}</p>}
        <p className="mega-feature__text">{description}</p>
        <Link href={href} onClick={onNavigate} className="mega-feature__link">
          <span>{linkText}</span>
          <ArrowIcon className="mega-feature__arrow" />
        </Link>
      </div>
    </div>
  );
}

function ServicesContent({ open, loadImages, onNavigate }: { open: boolean; loadImages: boolean; onNavigate: () => void }) {
  return (
    <div className="shell mega-panel__inner mega-services">
      {serviceGroups.map((group, index) => (
        <div className="mega-column" data-mega-column key={group.label}>
          <p className="mega-label">{group.label}</p>
          <ul className="mega-link-list">
            {group.links.map((item) => <DescribedLink key={item.href} item={item} onNavigate={onNavigate} />)}
          </ul>
          {index === 0 && (
            <Link href="/services" onClick={onNavigate} className="mega-all-link" data-mega-item>
              All services <ArrowIcon />
            </Link>
          )}
        </div>
      ))}
      <div className="mega-feature-column" data-mega-column>
        <FeatureCard
          image={featuredCaseStudy.image}
          description={featuredCaseStudy.description}
          href={featuredCaseStudy.href}
          linkText="Read the case study"
          eyebrow="Featured project"
          open={open}
          loadImage={loadImages}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

function ProjectsContent({ open, loadImages, onNavigate }: { open: boolean; loadImages: boolean; onNavigate: () => void }) {
  return (
    <div className="shell mega-panel__inner mega-projects">
      <div className="mega-column" data-mega-column>
        <p className="mega-label">By type</p>
        <ul className="mega-type-list">
          {projectTypes.map((item) => (
            <li key={item.href} data-mega-item>
              <Link href={item.href} onClick={onNavigate} className="mega-type-link">
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/projects" onClick={onNavigate} className="mega-all-link" data-mega-item>
          All projects <ArrowIcon />
        </Link>
      </div>
      <div className="mega-column mega-projects__featured" data-mega-column>
        <p className="mega-label">Featured projects</p>
        <ul className="mega-project-list">
          {featuredProjectCards.map((project) => (
            <li key={project.href} data-mega-item>
              <Link href={project.href} onClick={onNavigate} className="mega-project-link">
                <span className="mega-project-link__image">
                  {loadImages && <Image src={project.image.src} alt={project.image.alt} fill sizes="(min-width: 1200px) 170px, 15vw" />}
                </span>
                <span className="mega-project-link__name"><span>{project.label}</span><ArrowIcon /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mega-feature-column" data-mega-column>
        <FeatureCard
          image={images.projectLounge}
          description="Every project begins with a story. Explore ours."
          href="/projects"
          linkText="Explore projects"
          open={open}
          loadImage={loadImages}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

function StudioContent({ loadImages, onNavigate }: { loadImages: boolean; onNavigate: () => void }) {
  return (
    <div className="shell mega-panel__inner mega-studio">
      <div className="mega-studio__intro" data-mega-column>
        <p className="mega-label">The studio</p>
        <p className="mega-studio__name">{site.name}</p>
        <p className="mega-studio__descriptor">{site.descriptor}</p>
      </div>
      <div className="mega-column" data-mega-column>
        <ul className="mega-link-list mega-link-list--studio">
          {studioNav.slice(0, 3).map((item) => <DescribedLink key={item.href} item={item} onNavigate={onNavigate} />)}
        </ul>
      </div>
      <div className="mega-column" data-mega-column>
        <ul className="mega-link-list mega-link-list--studio">
          {studioNav.slice(3).map((item) => <DescribedLink key={item.href} item={item} onNavigate={onNavigate} />)}
        </ul>
      </div>
      <div className="mega-studio__image" data-mega-column>
        {loadImages && <Image src={images.projectStudio.src} alt={images.projectStudio.alt} fill sizes="(min-width: 1200px) 260px, 22vw" />}
      </div>
    </div>
  );
}

/**
 * A disclosure panel rather than an ARIA menu: its children remain ordinary
 * links. Closed panels are inert immediately, even while their exit animates.
 */
export function MegaMenu({ name, open, loadImages, onNavigate, onPointerEnter, onPointerLeave }: MegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasOpened = useRef(false);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      timelineRef.current?.kill();
      const columns = Array.from(panel.querySelectorAll<HTMLElement>("[data-mega-column]"));
      const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-mega-item]"));
      const featureImages = Array.from(panel.querySelectorAll<HTMLElement>("[data-feature-image]"));
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (open) {
        hasOpened.current = true;
        if (reduced) {
          // A little extra clip area below the panel leaves room for its shadow.
          gsap.set(panel, { visibility: "visible", clipPath: "inset(0% -5% -15% -5%)" });
          gsap.set([...columns, ...items, ...featureImages], { clearProps: "all" });
          return;
        }

        gsap.set(panel, { visibility: "visible" });
        const timeline = gsap.timeline();
        timeline
          .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% -5% -15% -5%)", duration: 0.6, ease: "luxe" }, 0)
          .fromTo(columns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "soft" }, 0.1)
          .fromTo(items, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.38, stagger: 0.025, ease: "soft" }, 0.2);
        if (featureImages.length) {
          timeline.fromTo(featureImages, { scale: 1.08 }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);
        }
        timelineRef.current = timeline;
      } else if (hasOpened.current) {
        if (reduced) {
          gsap.set(panel, { visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" });
          return;
        }
        const timeline = gsap.timeline({
          onComplete: () => gsap.set(panel, { visibility: "hidden" }),
        });
        timeline
          .to(columns, { opacity: 0, y: -8, duration: 0.18, stagger: 0.01, ease: "power2.in" }, 0)
          .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.3, ease: "luxe" }, 0);
        timelineRef.current = timeline;
      }
    },
    { scope: panelRef, dependencies: [open] },
  );

  return (
    <div
      id={`mega-menu-${name}`}
      role="region"
      aria-labelledby={`menu-trigger-${name}`}
      aria-hidden={!open}
      inert={!open}
      data-open={open ? "true" : "false"}
      className="mega-panel-wrap"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* The un-clipped wrapper is the hover bridge while the panel reveals. */}
      <div ref={panelRef} className="mega-panel" data-lenis-prevent>
        {name === "services" && <ServicesContent open={open} loadImages={loadImages} onNavigate={onNavigate} />}
        {name === "projects" && <ProjectsContent open={open} loadImages={loadImages} onNavigate={onNavigate} />}
        {name === "studio" && <StudioContent loadImages={loadImages} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}
