import { PageShell } from "@/components/layout/PageShell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell initialYear={new Date().getUTCFullYear()}>
      {/* Remounts per route so scroll resets and ScrollTrigger re-measures. */}
      {children}
    </PageShell>
  );
}
