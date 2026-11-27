import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routeMeta, routeMetaByHref } from "@/data/routes";
import { site } from "@/data/site";
import { PageHero } from "@/components/layout/PageHero";

type Params = { slug?: string[] };

/** Every menu route is generated ahead of time, so no link can 404. */
export function generateStaticParams(): Params[] {
  return routeMeta.map((route) => ({
    slug: route.href.replace(/^\//, "").split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const route = routeMetaByHref.get(`/${slug.join("/")}`);
  if (!route) return {};

  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: route.href },
    openGraph: {
      title: `${route.title} — ${site.name}`,
      description: route.description,
    },
  };
}

export default async function PlaceholderPage({ params }: { params: Promise<Params> }) {
  const { slug = [] } = await params;
  const route = routeMetaByHref.get(`/${slug.join("/")}`);
  if (!route) notFound();

  return (
    <>
      <PageHero {...route} />
      <section
        className="tone-espresso border-t border-hairline-dark"
        data-tone="espresso"
        aria-labelledby="next-title"
      >
        <div className="shell section grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow">Next</p>
            <h2
              id="next-title"
              className="mt-4 font-display text-h3 font-medium text-cream"
            >
              A closer look at how we work
            </h2>
          </div>
          <div className="md:col-span-6">
            <p className="lede">
              The studio&apos;s approach, process and the people behind the work —
              set out plainly, without much ceremony.
            </p>
            <p className="mt-6">
              <Link
                href="/studio/process"
                className="link-underline text-btn font-medium text-cream"
              >
                Read the process
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
