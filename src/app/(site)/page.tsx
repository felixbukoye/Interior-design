import type { Metadata } from "next";
import { site } from "@/data/site";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Interior Architecture & Design",
  description: site.description,
};

/**
 * Foundation state for the home route.
 *
 * Deliberately holds no marketing sections yet: this exists so the intro
 * lifts onto a composed page and the type, tones, buttons and split-reveal
 * system can be verified in situ. Sections replace this block next.
 */
export default function HomePage() {
  return (
    <section className="flex min-h-svh flex-col justify-center pb-24 pt-[136px]">
      <div className="shell">
        <Reveal delay={0.06}>
          <p className="eyebrow">Foundation</p>
        </Reveal>

        <SplitHeading as="h1" when="ready" delay={0.12} className="mt-4 max-w-[17ch] text-h1">
          Quiet interiors, made to be lived in.
        </SplitHeading>

        <Reveal delay={0.34} className="mt-14 border-t border-hairline-cream pt-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[52ch] text-body text-muted">
              Type, colour, motion and navigation are in place. Home page
              sections are built next, against these tokens.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="/services">Explore services</ButtonLink>
              <ButtonLink href="/contact" variant="outline" withArrow={false}>
                Start a project
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
