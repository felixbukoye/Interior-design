"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ChevronIcon } from "./ChevronIcon";

type MobileMenuProps = {
  open: boolean;
  onNavigate: () => void;
};

function MobileLink({ item, onNavigate }: { item: DescribedNavLink; onNavigate: () => void }) {
  return (
    <li>
      <Link href={item.href} onClick={onNavigate} className="mobile-menu__sub-link">
        <span>{item.label}</span>
        <small>{item.description}</small>
      </Link>
    </li>
  );
}

type AccordionProps = {
  name: MegaMenuName;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

function Accordion({ name, label, open, onToggle, children }: AccordionProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      gsap.killTweensOf(panel);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(panel, { height: open ? "auto" : 0 });
      } else {
        gsap.to(panel, { height: open ? "auto" : 0, duration: open ? 0.5 : 0.34, ease: "luxe" });
      }
    },
    { scope: panelRef, dependencies: [open] },
  );

  return (
    <li data-mobile-item>
      <button
        type="button"
        className="mobile-menu__row"
        aria-expanded={open}
        aria-controls={`mobile-accordion-${name}`}
        onClick={onToggle}
      >
        <span>{label}</span>
        <ChevronIcon className="mobile-menu__chevron" />
      </button>
      <div
        id={`mobile-accordion-${name}`}
        ref={panelRef}
        className="mobile-menu__accordion"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="mobile-menu__accordion-inner">{children}</div>
      </div>
    </li>
  );
}

/** Espresso full-screen menu; the parent owns the dialog and its focus trap. */
export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasOpened = useRef(false);
  const [expanded, setExpanded] = useState<MegaMenuName | null>(null);
  const [loadedGroups, setLoadedGroups] = useState<MegaMenuName[]>([]);

  // Let the exit finish before resetting the accordions for the next visit.
  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => setExpanded(null), 350);
    return () => window.clearTimeout(timer);
  }, [open]);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      timelineRef.current?.kill();
      const items = panel.querySelectorAll<HTMLElement>("[data-mobile-item]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (open) {
        hasOpened.current = true;
        if (reduced) {
          gsap.set(panel, { visibility: "visible", clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(items, { clearProps: "all" });
          return;
        }
        gsap.set(panel, { visibility: "visible" });
        const timeline = gsap.timeline();
        timeline
          .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "luxe" }, 0)
          .fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.055, ease: "soft" }, 0.14);
        timelineRef.current = timeline;
      } else if (hasOpened.current) {
        if (reduced) {
          gsap.set(panel, { visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" });
          return;
        }
        const timeline = gsap.timeline({ onComplete: () => gsap.set(panel, { visibility: "hidden" }) });
        timeline
          .to(items, { opacity: 0, y: -8, duration: 0.16, stagger: 0.01, ease: "power2.in" }, 0)
          .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.3, ease: "luxe" }, 0);
        timelineRef.current = timeline;
      }
    },
    { scope: panelRef, dependencies: [open] },
  );

  const toggle = (name: MegaMenuName) => {
    setLoadedGroups((loaded) => loaded.includes(name) ? loaded : [...loaded, name]);
    setExpanded((current) => current === name ? null : name);
  };

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className="mobile-menu"
      data-open={open ? "true" : "false"}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="mobile-menu__scroll" data-lenis-prevent>
        <div className="shell mobile-menu__inner">
          <p className="mobile-menu__eyebrow">Navigation</p>
          <nav aria-label="Mobile navigation">
            <ul className="mobile-menu__list">
              <Accordion name="services" label="Services" open={expanded === "services"} onToggle={() => toggle("services")}>
                {serviceGroups.map((group) => (
                  <div className="mobile-menu__group" key={group.label}>
                    <p className="mobile-menu__group-label">{group.label}</p>
                    <ul>{group.links.map((item) => <MobileLink key={item.href} item={item} onNavigate={onNavigate} />)}</ul>
                  </div>
                ))}
                <Link href="/services" onClick={onNavigate} className="mobile-menu__all-link">All services <ArrowIcon /></Link>
                <div className="mobile-menu__feature">
                  {loadedGroups.includes("services") && <Image src={featuredCaseStudy.image.src} alt={featuredCaseStudy.image.alt} fill sizes="(max-width: 600px) 90vw, 520px" />}
                  <div className="mobile-menu__feature-content">
                    <p>{featuredCaseStudy.description}</p>
                    <Link href={featuredCaseStudy.href} onClick={onNavigate}>Read the case study <ArrowIcon /></Link>
                  </div>
                </div>
              </Accordion>
              <Accordion name="projects" label="Projects" open={expanded === "projects"} onToggle={() => toggle("projects")}>
                <div className="mobile-menu__group">
                  <p className="mobile-menu__group-label">By type</p>
                  <ul className="mobile-menu__type-list">
                    {projectTypes.map((item) => (
                      <li key={item.href}><Link href={item.href} onClick={onNavigate}>{item.label}</Link></li>
                    ))}
                  </ul>
                </div>
                <div className="mobile-menu__group">
                  <p className="mobile-menu__group-label">Featured projects</p>
                  <ul className="mobile-menu__projects">
                    {featuredProjectCards.map((project) => (
                      <li key={project.href}>
                        <Link href={project.href} onClick={onNavigate}>
                          <span className="mobile-menu__project-image">{loadedGroups.includes("projects") && <Image src={project.image.src} alt={project.image.alt} fill sizes="30vw" />}</span>
                          <span>{project.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mobile-menu__project-note">Every project begins with a story. Explore ours.</p>
                <Link href="/projects" onClick={onNavigate} className="mobile-menu__all-link">All projects <ArrowIcon /></Link>
              </Accordion>
              <Accordion name="studio" label="Studio" open={expanded === "studio"} onToggle={() => toggle("studio")}>
                <ul>{studioNav.map((item) => <MobileLink key={item.href} item={item} onNavigate={onNavigate} />)}</ul>
              </Accordion>
              <li data-mobile-item>
                <Link href="/journal" onClick={onNavigate} className="mobile-menu__row">
                  <span>Journal</span><ArrowIcon className="mobile-menu__arrow" />
                </Link>
              </li>
              <li data-mobile-item>
                <Link href="/contact" onClick={onNavigate} className="mobile-menu__row">
                  <span>Contact</span><ArrowIcon className="mobile-menu__arrow" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="mobile-menu__bottom">
        <div className="shell">
          <Link href="/contact" onClick={onNavigate} className="btn btn--ember mobile-menu__cta">
            <span className="btn__fill" aria-hidden="true" />
            <span className="btn__label">Book a Consultation <ArrowIcon className="btn__arrow" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
