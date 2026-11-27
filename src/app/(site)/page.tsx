import type { Metadata } from "next";
import { site } from "@/data/site";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntro } from "@/components/home/HomeIntro";

export const metadata: Metadata = {
  title: "Interior Architecture & Design",
  description: site.description,
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeIntro />
    </>
  );
}
