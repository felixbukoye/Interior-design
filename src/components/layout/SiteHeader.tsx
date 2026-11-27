"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/data/navigation";
import type { MegaMenuName } from "@/data/navigation";
import { site } from "@/data/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ChevronIcon } from "@/components/chrome/ChevronIcon";
import { Logo } from "@/components/chrome/Logo";
import { MegaMenu } from "@/components/chrome/MegaMenu";
import { MobileMenu } from "@/components/chrome/MobileMenu";

type SiteHeaderProps = {
  /** Pages whose first section is espresso pass "dark". */
  tone?: "cream" | "dark";
};

const MENU_NAMES: MegaMenuName[] = ["services", "projects", "studio"];
type MenuOpenSource = "hover" | "explicit";
const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function focusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) =>
    !element.closest("[inert]") &&
    element.getClientRects().length > 0 &&
    window.getComputedStyle(element).visibility !== "hidden",
  );
}

function cycleFocus(event: globalThis.KeyboardEvent, elements: HTMLElement[]) {
  if (!elements.length) return;
  const index = elements.indexOf(document.activeElement as HTMLElement);
  const next = index < 0
    ? (event.shiftKey ? elements.length - 1 : 0)
    : (index + (event.shiftKey ? -1 : 1) + elements.length) % elements.length;
  event.preventDefault();
  elements[next].focus();
}

export function SiteHeader({ tone = "cream" }: SiteHeaderProps) {
  const pathname = usePathname();
  const { isReady, setScrollLocked } = useMotion();
  const [activeMenu, setActiveMenuState] = useState<MegaMenuName | null>(null);
  const [loadedMenus, setLoadedMenus] = useState<MegaMenuName[]>([]);
  const [mobileOpen, setMobileOpenState] = useState(false);
  const activeMenuRef = useRef<MegaMenuName | null>(null);
  const menuOpenSourceRef = useRef<MenuOpenSource | null>(null);
  const mobileOpenRef = useRef(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const lastChromeFocusRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<MegaMenuName, HTMLButtonElement | null>>({
    services: null,
    projects: null,
    studio: null,
  });
  const hoverTimer = useRef<number | null>(null);
  const showHeaderRef = useRef<() => void>(() => {});

  const cancelHover = useCallback(() => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const setDesktopMenu = useCallback((next: MegaMenuName | null, source: MenuOpenSource = "explicit") => {
    const previous = activeMenuRef.current;
    if (previous === next) {
      if (next) menuOpenSourceRef.current = source;
      return;
    }
    // If a mouse switches panels while a link has keyboard focus, move focus
    // to the new disclosure rather than leaving it inside an inert panel.
    if (previous && next) {
      const oldPanel = document.getElementById(`mega-menu-${previous}`);
      if (oldPanel?.contains(document.activeElement)) triggerRefs.current[next]?.focus();
    }
    activeMenuRef.current = next;
    menuOpenSourceRef.current = next ? source : null;
    if (next) {
      // Keep the links in the server-rendered markup, but don't download
      // imagery from every closed menu on the first page load.
      setLoadedMenus((loaded) => loaded.includes(next) ? loaded : [...loaded, next]);
      showHeaderRef.current();
    }
    setActiveMenuState(next);
  }, []);

  const closeDesktop = useCallback((restoreFocus = false) => {
    cancelHover();
    const previous = activeMenuRef.current;
    if (restoreFocus && previous) triggerRefs.current[previous]?.focus({ preventScroll: true });
    setDesktopMenu(null);
  }, [cancelHover, setDesktopMenu]);

  const closeMobile = useCallback((restoreFocus = false) => {
    if (!mobileOpenRef.current) return;
    mobileOpenRef.current = false;
    setMobileOpenState(false);
    if (restoreFocus) mobileToggleRef.current?.focus({ preventScroll: true });
  }, []);

  const closeAll = useCallback(() => {
    closeDesktop();
    closeMobile();
  }, [closeDesktop, closeMobile]);

  const closeForNavigation = useCallback(() => {
    const current = activeMenuRef.current;
    const focused = document.activeElement;
    const desktopPanel = current ? document.getElementById(`mega-menu-${current}`) : null;
    const mobilePanel = document.getElementById("mobile-menu");
    // When a link to the current page is followed, there may be no route
    // change to move focus. Restore it before the panel becomes inert.
    closeDesktop(Boolean(desktopPanel?.contains(focused)));
    closeMobile(Boolean(mobilePanel?.contains(focused)));
  }, [closeDesktop, closeMobile]);

  const canHover = (event: PointerEvent) =>
    event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const scheduleOpen = (name: MegaMenuName, event: PointerEvent) => {
    if (!canHover(event)) return;
    cancelHover();
    if (activeMenuRef.current === name) return;
    hoverTimer.current = window.setTimeout(() => {
      const current = activeMenuRef.current;
      if (current && current !== name) {
        const focused = document.activeElement;
        const panel = document.getElementById(`mega-menu-${current}`);
        const trigger = triggerRefs.current[current];
        // Moving a mouse across the header must not steal focus from a
        // keyboard user already navigating another panel.
        if (panel?.contains(focused) || (focused === trigger && trigger?.matches(":focus-visible"))) return;
      }
      setDesktopMenu(name, "hover");
    }, 120);
  };

  const scheduleClose = (event: PointerEvent) => {
    if (!canHover(event)) return;
    cancelHover();
    hoverTimer.current = window.setTimeout(() => {
      const current = activeMenuRef.current;
      if (!current || menuOpenSourceRef.current === "explicit") return;
      const panel = document.getElementById(`mega-menu-${current}`);
      const focused = document.activeElement;
      // Pointer movement should never dismiss a menu being used by keyboard.
      if (panel?.contains(focused) || triggerRefs.current[current] === focused) return;
      setDesktopMenu(null);
    }, 120);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, name: MegaMenuName) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    cancelHover();
    setDesktopMenu(name);
    window.setTimeout(() => {
      if (activeMenuRef.current === name) {
        focusableElements(document.getElementById(`mega-menu-${name}`))[0]?.focus();
      }
    }, 220);
  };

  const toggleMobile = () => {
    cancelHover();
    if (mobileOpenRef.current) {
      closeMobile(true);
    } else {
      closeDesktop();
      mobileOpenRef.current = true;
      setMobileOpenState(true);
      showHeaderRef.current();
    }
  };

  // Treat each open desktop disclosure as a focus loop: the trigger plus
  // its panel. Hover alone never steals keyboard focus.
  useEffect(() => {
    if (!activeMenu) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDesktop(true);
      } else if (event.key === "Tab") {
        const trigger = triggerRefs.current[activeMenu];
        const panel = document.getElementById(`mega-menu-${activeMenu}`);
        cycleFocus(event, [...(trigger ? [trigger] : []), ...focusableElements(panel)]);
      }
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      const panel = document.getElementById(`mega-menu-${activeMenu}`);
      if (!panel?.contains(target) && !triggerRefs.current[activeMenu]?.contains(target)) {
        closeDesktop();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [activeMenu, closeDesktop]);

  // The mobile dialog includes the header, so its morphing close button is
  // inside the modal as well as the menu links. The page stays scroll-locked.
  useEffect(() => {
    if (!mobileOpen) return;
    setScrollLocked(true);
    if (!chromeRef.current?.contains(document.activeElement)) mobileToggleRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobile(true);
      } else if (event.key === "Tab") {
        cycleFocus(event, focusableElements(chromeRef.current));
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      setScrollLocked(false);
    };
  }, [mobileOpen, closeMobile, setScrollLocked]);

  // Avoid a hidden, still-trapping menu after resizing or browser history.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      cancelHover();
      // Some browsers blur a display:none control before firing the media
      // query event. Retain that last focused control for this handoff.
      const active = document.activeElement;
      const focused = active && active !== document.body ? active : lastChromeFocusRef.current;
      if (desktop.matches) {
        const mobilePanel = document.getElementById("mobile-menu");
        if (focused === mobileToggleRef.current || mobilePanel?.contains(focused)) {
          triggerRefs.current.services?.focus({ preventScroll: true });
        }
        closeMobile();
      } else {
        const desktopControl = focused instanceof Element &&
          focused.closest(".desktop-nav, .mega-panel-wrap, .site-header__action, .site-header__email");
        if (desktopControl) mobileToggleRef.current?.focus({ preventScroll: true });
        closeDesktop();
      }
    };
    const onHistory = () => closeAll();
    desktop.addEventListener("change", onBreakpoint);
    window.addEventListener("popstate", onHistory);
    return () => {
      cancelHover();
      desktop.removeEventListener("change", onBreakpoint);
      window.removeEventListener("popstate", onHistory);
    };
  }, [cancelHover, closeAll, closeDesktop, closeMobile]);

  // ScrollTrigger provides direction; keep an open menu visible while the
  // visitor is interacting with it. Reduced-motion users keep a stable bar.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const move = gsap.quickTo(header, "yPercent", { duration: 0.42, ease: "power3.out" });
      showHeaderRef.current = () => {
        if (reduceMotion.matches) gsap.set(header, { yPercent: 0 });
        else move(0);
      };
      const updateBackground = () => {
        header.dataset.scrolled = window.scrollY > 80 ? "true" : "false";
      };
      updateBackground();
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          updateBackground();
          if (reduceMotion.matches) {
            gsap.set(header, { yPercent: 0 });
          } else {
            const hide = self.scroll() > 80 && self.direction === 1 && !activeMenuRef.current && !mobileOpenRef.current;
            move(hide ? -110 : 0);
          }
        },
      });
      const onMotionChange = () => showHeaderRef.current();
      reduceMotion.addEventListener("change", onMotionChange);
      return () => {
        trigger.kill();
        reduceMotion.removeEventListener("change", onMotionChange);
        showHeaderRef.current = () => {};
      };
    },
    { scope: headerRef },
  );

  // Header appears as the one-time page intro lifts.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header || !isReady) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(header, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "soft", delay: 0.1 });
      });
      return () => mm.revert();
    },
    { dependencies: [isReady], scope: headerRef },
  );

  const isActive = (href: string, menu?: MegaMenuName) =>
    menu === "studio" ? pathname.startsWith("/studio") : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <div
        ref={chromeRef}
        className="site-chrome"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label={mobileOpen ? "Site menu" : undefined}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement) lastChromeFocusRef.current = event.target;
          showHeaderRef.current();
        }}
        onBlurCapture={(event) => {
          if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) return;
          // When a breakpoint hides the focused control, the browser can
          // blur it before dispatching the resize event. Remember it then.
          const hiddenByLayout = !event.relatedTarget && event.target.getClientRects().length === 0;
          if (!hiddenByLayout) lastChromeFocusRef.current = null;
        }}
        onClickCapture={(event) => {
          if ((event.target as Element).closest("a[href]")) closeForNavigation();
        }}
      >
        <header
          ref={headerRef}
          data-tone={tone}
          data-scrolled="false"
          data-desktop-open={activeMenu ? "true" : "false"}
          data-mobile-open={mobileOpen ? "true" : "false"}
          data-intro-hidden={isReady ? undefined : "true"}
          className="site-header"
        >
          <div className="shell site-header__bar">
            <div className="site-header__identity">
              <Logo />
              <span className="site-header__divider" aria-hidden="true" />
              <a href={site.emailHref} className="site-header__email">{site.email}</a>
            </div>

            <nav aria-label="Primary navigation" className="desktop-nav">
              <ul className="desktop-nav__list">
                {primaryNav.map((item) => (
                  <li
                    key={item.label}
                    className="desktop-nav__item"
                    onPointerEnter={item.menu ? (event) => scheduleOpen(item.menu!, event) : scheduleClose}
                    onPointerLeave={item.menu ? scheduleClose : undefined}
                  >
                    {item.menu ? (
                      <button
                        type="button"
                        ref={(element) => { triggerRefs.current[item.menu!] = element; }}
                        id={`menu-trigger-${item.menu}`}
                        className="nav-link desktop-nav__link"
                        data-active={isActive(item.href, item.menu) ? "true" : undefined}
                        aria-expanded={activeMenu === item.menu}
                        aria-controls={`mega-menu-${item.menu}`}
                        onClick={(event) => {
                          cancelHover();
                          if (activeMenuRef.current !== item.menu) {
                            setDesktopMenu(item.menu!);
                          } else if (event.detail > 0 && menuOpenSourceRef.current === "hover") {
                            // A click on a hover-open panel pins it instead of
                            // unexpectedly closing it under the pointer.
                            setDesktopMenu(item.menu!, "explicit");
                          } else {
                            closeDesktop();
                          }
                        }}
                        onKeyDown={(event) => onTriggerKeyDown(event, item.menu!)}
                      >
                        {item.label}<ChevronIcon className="desktop-nav__chevron" />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeForNavigation}
                        className="nav-link desktop-nav__link"
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="site-header__action">
              <ButtonLink href="/contact" variant="dark" withArrow={false} className="site-header__cta">
                Book a Consultation
              </ButtonLink>
            </div>
            <button
              ref={mobileToggleRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={toggleMobile}
              className="menu-toggle"
              data-open={mobileOpen ? "true" : "false"}
            >
              <span className="menu-toggle__bars" aria-hidden="true"><span /><span /></span>
            </button>
          </div>
          {MENU_NAMES.map((name) => (
            <MegaMenu
              key={name}
              name={name}
              open={activeMenu === name}
              loadImages={loadedMenus.includes(name)}
              onNavigate={closeForNavigation}
              onPointerEnter={cancelHover}
              onPointerLeave={scheduleClose}
            />
          ))}
        </header>
        <MobileMenu open={mobileOpen} onNavigate={closeForNavigation} />
      </div>
    </>
  );
}
