import Link from "next/link";
import { ArrowIcon } from "./ArrowIcon";

type CircleArrowLinkProps = {
  href: string;
  label: string;
  className?: string;
};

/**
 * 44px gold disc with a diagonal arrow that rotates a further 45° on hover.
 * Used for "go to project" affordances inside cards.
 */
export function CircleArrowLink({ href, label, className }: CircleArrowLinkProps) {
  return (
    <Link href={href} aria-label={label} className={`circle-arrow ${className ?? ""}`}>
      <ArrowIcon />
    </Link>
  );
}
