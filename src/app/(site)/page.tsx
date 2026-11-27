import type { Metadata } from "next";
import { site } from "@/data/site";
import { HomeHero } from "@/components/home/HomeHero";

export const metadata: Metadata = {
  title: "Interior Architecture & Design",
  description: site.description,
};

export default function HomePage() {
  return <HomeHero />;
}
