import Link from "next/link";
import type { RouteMeta } from "@/data/routes";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { site } from "@/data/site";

type PageHeroProps = RouteMeta & {
  /** Shown as a small status line above the copy. */
  status?: string;
};

/**
 * Shared opening block for every inner route: eyebrow, split headline,
 * lede, and a quiet status tag explaining that the full page is on its way.
 * Placeholder pages stay honest rather than pretending to be finished.
 */
export function PageHero({
  title,
  eyebrow,
  description,
  note,
  onward,
  status = "Page design in progress",
}: PageHeroProps) {
  return (
    <section className="page-hero tone-cream" data-tone="cream">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <p className="eyebrow">{eyebrow}</p>
            </Reveal>

            <SplitHeading as="h1" when="mount" delay={0.12} className="page-title mt-4">
              {title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <Reveal delay={0.24}>
              <p className="max-w-[46ch] text-body-lg text-muted">{description}</p>
              <p className="mt-5 text-body-sm text-muted">{note}</p>
            </Reveal>

            <Reveal delay={0.34} className="mt-8">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-hairline-cream px-4 py-2 text-[12px] font-medium text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                {status}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-x-8 border-t border-hairline-cream pt-2 md:grid-cols-2">
          {onward.map((link) => (
            <Link key={link.href} href={link.href} className="onward-card group">
              <span>{link.label}</span>
              <ArrowIcon className="h-4 w-4 shrink-0 text-gold" />
            </Link>
          ))}
        </div>

        <p className="mt-14 max-w-[52ch] text-body-sm leading-7 text-muted">
          Meanwhile, you can reach the studio directly at{" "}
          <a href={site.emailHref} className="link-underline text-ink">
            {site.email}
          </a>{" "}
          or{" "}
          <a href={site.phoneHref} className="link-underline text-ink">
            {site.phone}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
