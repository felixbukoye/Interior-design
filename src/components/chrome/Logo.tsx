import Link from "next/link";
import { wordmark } from "@/data/site";

/** A typographic wordmark, shared by the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${wordmark} — home`}
      className={`site-logo ${className ?? ""}`}
    >
      {wordmark}
    </Link>
  );
}
