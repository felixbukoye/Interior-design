"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { primaryNav, servicesNav, studioNav } from "@/data/navigation";
import { site, wordmark } from "@/data/site";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Logo } from "@/components/chrome/Logo";
import { useMotion } from "@/components/motion/MotionProvider";

// Hydrate with the server snapshot, then use the current UTC year on the
// client. A page built before New Year can never hydrate with a different date.
const subscribeToYear = () => () => {};
const getCurrentYear = () => new Date().getUTCFullYear();

export function SiteFooter({ initialYear }: { initialYear: number }) {
  const year = useSyncExternalStore(subscribeToYear, getCurrentYear, () => initialYear);
  const { scrollTo } = useMotion();

  return (
    <footer data-tone="ink" className="tone-ink relative overflow-hidden">
      <div className="shell">
        <div className="grid gap-14 py-16 md:grid-cols-12 md:gap-8 md:py-20 lg:py-24">
          <div className="md:col-span-5 lg:col-span-4">
            <p className="eyebrow">Say hello</p>
            <a
              href={site.emailHref}
              className="mt-6 block font-display text-[clamp(24px,2.4vw,32px)] font-normal leading-tight tracking-[-0.02em] text-cream transition-colors duration-300 hover:text-gold"
            >
              {site.email}
            </a>
            <a
              href={site.phoneHref}
              className="mt-2 inline-block text-body-lg text-muted-dark transition-colors duration-300 hover:text-cream"
            >
              {site.phone}
            </a>

            <address className="mt-8 not-italic text-body-sm leading-7 text-muted-dark">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.line3}
            </address>

            <p className="mt-6 text-body-sm text-muted-dark">{site.hours}</p>

            <div className="mt-8">
              <ButtonLink href="/contact" variant="gold" className="h-11 px-6">
                Start a project
              </ButtonLink>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:col-span-7 lg:col-span-8 lg:pl-12"
          >
            <div>
              <h2 className="footer-heading">Studio</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {studioNav.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="footer-heading">Explore</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {primaryNav
                  .filter((link) => !link.href.startsWith("/studio") && link.href !== "/contact")
                  .map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link href="/studio/press-and-awards" className="footer-link">
                    Press & awards
                  </Link>
                </li>
                <li>
                  <Link href="/studio/careers" className="footer-link">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="footer-heading">Services</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {servicesNav.slice(0, 6).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/services" className="link-underline text-body-sm font-medium text-cream">
                    All services
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-hairline-dark py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Logo className="text-cream" />
            <p className="text-body-sm text-muted-dark">
              © {year} {site.name}. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href={site.social.instagram}
              className="inline-flex items-center gap-2 text-body-sm text-muted-dark transition-colors duration-300 hover:text-cream"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
            <Link
              href="/contact"
              className="link-underline text-body-sm text-muted-dark transition-colors duration-300 hover:text-cream"
            >
              Press enquiries
            </Link>
            <button
              type="button"
              onClick={() => scrollTo(document.body)}
              className="group inline-flex items-center gap-2.5 text-body-sm text-cream"
            >
              Back to top
              <span className="grid h-8 w-8 place-items-center rounded-full border border-hairline-dark transition-colors duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                <ArrowIcon className="h-3 w-3 -rotate-45" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap px-6 pb-1 pt-8 font-display text-[clamp(56px,13vw,190px)] font-normal leading-[0.78] tracking-[-0.045em] text-cream/[0.07]"
      >
        {wordmark}
      </p>
    </footer>
  );
}
