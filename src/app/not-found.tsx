import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col justify-center tone-cream">
      <div className="shell">
        <p className="eyebrow">404</p>
        <SplitHeading when="mount" as="h1" className="mt-4 max-w-[18ch] text-h1">
          This room doesn&apos;t exist.
        </SplitHeading>
        <p className="mt-6 max-w-[42ch] text-body-lg text-muted">
          The page may have moved, or the link may be old. Start again from the
          studio entrance.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <ButtonLink href="/">Back to the studio</ButtonLink>
          <ButtonLink href="/services" variant="outline" withArrow={false}>
            Explore services
          </ButtonLink>
        </div>
        <p className="mt-12 text-body-sm text-muted">
          Or reach us at{" "}
          <a href={site.emailHref} className="link-underline text-ink">
            {site.email}
          </a>
          .
        </p>
      </div>
      <Link href="/" className="sr-only-focusable">
        Skip to the studio home
      </Link>
    </main>
  );
}
