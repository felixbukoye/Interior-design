import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { Magnetic } from "@/components/motion/Magnetic";

type Variant = "ember" | "dark" | "outline";

// Keep complete class names visible to Tailwind's content scanner.
const variantClasses: Record<Variant, string> = {
  ember: "btn--ember",
  dark: "btn--dark",
  outline: "btn--outline",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Pull toward the cursor on desktop (12px cap). */
  magnetic?: boolean;
  withArrow?: boolean;
  external?: boolean;
  ariaLabel?: string;
};

/**
 * Primary CTA: ember by default, with a slow upward fill of ember-hover and a
 * 4px arrow nudge on hover or focus. The same markup covers dark and outline
 * variants, and the fill is hidden from assistive tech.
 */
export function ButtonLink({
  href,
  children,
  variant = "ember",
  className,
  magnetic = true,
  withArrow = true,
  external = false,
  ariaLabel,
}: ButtonLinkProps) {
  const link = (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`btn ${variantClasses[variant]} ${className ?? ""}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__label">
        {children}
        {withArrow && <ArrowIcon className="btn__arrow" />}
      </span>
    </Link>
  );

  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
