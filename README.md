# Interior Design Studio — Marketing Site

A premium, motion-led marketing site for a modern interior design studio.
Next.js App Router · TypeScript · Tailwind CSS · GSAP · Lenis.

## Status

The foundation, responsive Eden Interiors header and home hero are in place:
tokens, type, motion, the page-load intro, desktop mega menus, the mobile menu,
and placeholder routes for every menu link. No other home page sections have
been added yet.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run typecheck
npm run lint
n# Browser regression tests (install Chromium once)
npx playwright install chromium
npm run test:e2e
```

The tests reuse a running dev server on port 3000, or start one automatically.
To test a different running server, set `E2E_BASE_URL` before running the suite.

## Project structure

```
src/
  app/
    layout.tsx              fonts, metadata, html shell
    globals.css             tokens, primitives, chrome, intro, grain
    (site)/layout.tsx       PageShell: motion provider + header + footer
    (site)/template.tsx     per-route scroll reset + ScrollTrigger refresh
    (site)/page.tsx         home hero
    (site)/[...slug]/       one static page per placeholder route
    not-found.tsx           404
  components/
    chrome/                 Logo, MegaMenu, MobileMenu, ChevronIcon
    home/                   HomeHero (copy, image, badge, project bar)
    layout/                 PageShell, SiteHeader, SiteFooter, PageHero
    motion/                 MotionProvider (Lenis + intro), Reveal,
                            SplitHeading, ParallaxImage, Magnetic,
                            CursorFollower, DragSlider
    ui/                     ButtonLink, CircleArrowLink, ArrowIcon,
                            InstagramIcon
  data/
    site.ts                 every [bracketed] placeholder + wordmark
    images.ts               every image: src, width, height, alt
    navigation.ts           header / footer / services menus
    routes.ts               title + copy + onward links per placeholder page
  lib/
    gsap.ts                 core plugin registration + custom eases
    gsap-advanced.ts        on-demand Flip / Draggable registration
    fonts.ts                self-hosted variable fonts (next/font/local)
  fonts/                    woff2 files + OFL licences
```

## Editing content

- **Studio details** — `src/data/site.ts`. The name and email are Eden
  Interiors; the hero's requested `[Studio Name]` and the unresolved city,
  project names and other details remain bracketed placeholders in this file.
- **Photography** — `src/data/images.ts`, each entry with `src`, `width`,
  `height` and `alt`. Drop files in `public/images/` and update the entry.
  To swap in Unsplash URLs later, replace `src` and add the host to
  `images.remotePatterns` in `next.config.ts`.
- **Navigation** — `src/data/navigation.ts`. The service groups, project
  types, featured projects and studio links are shared by both menus.
- **Placeholder pages** — `src/data/routes.ts` (one entry per route; the
  `[...slug]` page is statically generated from it). Project categories and
  the three featured projects have their own placeholder pages; the featured
  case-study card points to the first project placeholder.

## Design tokens

Colours resolve to CSS custom properties declared once in `globals.css` and
exposed through `tailwind.config.ts`, so a hue changes in one place.

| Token | Value | Notes |
| --- | --- | --- |
| cream | `#FFF1DF` | primary background |
| cream-deep | `#F8E4C9` | tonal break / hairline sections |
| espresso | `#2A2723` → `#34302A` | subtle vertical gradient |
| ink | `#171513` | footer |
| gold / gold-hover | `#B58A4F` / `#C99A5B` | accent, CTA fill |
| gold text | `#806039` | AA-safe menu labels on cream (5.18:1) |
| muted-on-cream | `#6B6157` | **AA-safe body copy** (5.44:1) |
| muted-on-dark | `rgba(255,241,223,0.62)` | 6.06:1 on espresso |
| hairline cream / dark | `rgba(23,21,19,0.1)` / `rgba(255,255,255,0.08)` | dividers |

Type: Urbanist (display, 400–500), Inter (body 16/28), Playfair Display
Italic (small accents) — all self-hosted variable woff2 subsets, with no
third-party font requests. A font gate prevents visible metric swaps on load.

Layout: 1240px container, 40px desktop gutters, 120/88/64px section padding,
card radius 6px, button 48px tall with 28px padding, eyebrow 14px at 0.04em.

## Motion system

`src/lib/gsap.ts` registers ScrollTrigger, SplitText, DrawSVGPlugin and
CustomEase exactly once, and defines the studio eases. The heavier Flip and
Draggable plugins register once in `gsap-advanced.ts` when an interaction
imports them, keeping them out of the initial home-page bundle:

- `luxe` — `CustomEase 0.65, 0, 0.35, 1` for spatial movement
- `soft` — `CustomEase 0.16, 1, 0.3, 1` for entrances

GSAP animations run inside `useGSAP`, so StrictMode remounts revert tweens,
splits and ScrollTriggers cleanly. Each component uses `gsap.matchMedia` to
disable parallax, pinning and cursor effects for `prefers-reduced-motion`,
and ScrollTrigger is refreshed after fonts and images load. Lenis loads after
the intro releases scrolling, and switches to native scrolling whenever the
reduced-motion preference is enabled.

**Page-load intro** (`MotionProvider`): espresso veil → wordmark → gold rule
drawn with DrawSVG → veil lifts on `clip-path`. The page stays laid out behind
the veil while Inter and Urbanist load. If they stall for 1.2s after hydration,
the page uses system fallbacks for that page load, preventing late font swaps
from moving visible content. The intro then takes about 1.8s; the home hero
begins its sequence as the veil finishes lifting. The provider lives in the
route layout, so the intro plays once per full page load and never replays on
client-side navigation. With JavaScript disabled the server content is shown;
an 8s CSS fail-safe also exposes it if the client scripts fail.

## Home hero

`HomeHero` keeps the headline, copy, calls to action and project details in
server-rendered markup. Once the intro lifts, masked SplitText lines rise in;
the copy follows as the full-width image reveals from an equal 8% inset. The
image's overscanned layer then scrubs gently on scroll without exposing an
empty edge. The consultation badge has a magnetic pull and rotating text that
responds to scroll velocity. The photo and info bar link to `/projects`, while
the badge and primary button link to `/contact`. The info bar is horizontally
scrollable by touch or keyboard on mobile. With reduced motion, content is
shown without an intro or spatial reveal after the font gate; parallax, badge
rotation, smooth scrolling and the cursor are disabled. The image frame has a
reserved height, so its loading and animation do not move the rest of the page.

## Header and navigation

The desktop bar is transparent at the top and becomes a 72px cream bar after
80px of scrolling. ScrollTrigger hides it on downward scroll and brings it
back on upward scroll. Services, Projects and Studio open full-width
mega menus after a 120ms hover intent, or via click, Enter/Space or Arrow Down.
Clicking a hover-open menu keeps it open; clicking outside or pressing Escape
closes it. An open menu cycles focus between its trigger and links, and pointer
movement cannot steal focus from a keyboard user in a panel. Menu images load
only when that menu is opened.

Below 1024px, the header opens a full-screen espresso dialog with animated
accordions, a scrollable link area and a pinned consultation button. Focus
stays in the dialog, background scrolling is locked, and Escape returns focus
to the close/open control. Reduced-motion preferences disable the spatial
entrances and image tilt. Focus moves to the appropriate visible control if
the viewport crosses the desktop/mobile breakpoint while a menu is open.

## Hydration and preview

The initial menu markup is identical on the server and client. The browser test
suite compares both trees and checks reloads with simulated Grammarly body
attributes; only the `<body>` element suppresses warnings about extension-added
attributes, so component mismatches remain visible. The intro hides its overlay
without removing React-owned DOM nodes, including during Strict Mode replays.

A production server must be restarted after `next build`: keeping an older
`next start` process alive while its build files are replaced can serve stale
HTML with missing or mismatched assets. If a preview was open during a rebuild,
restart that preview and reload the browser.

## Imagery

Placeholder photography is **stored locally** in `public/images/` rather than
hot-linked. It is warm, natural-light interior editorial work, and the whole
set is catalogued in `src/data/images.ts` with intrinsic dimensions and alt
text. Local files keep `next/image` optimisation, AVIF/WebP output, blur-free
layout shift and offline dev working — and they swap for real photography
with a single edit per image.

## Quality results

Four Lighthouse 13.6 runs on the production build with the hero measured mobile
performance **89–91** and desktop **98–99**; accessibility, best practices and
SEO were **100** in each run. CLS was **0** on both devices. Mobile performance
varies around the 90 target rather than consistently exceeding it. The 31
Playwright checks pass on development and production, and axe found no WCAG
2/2.1 A/AA violations in the desktop and mobile hero with normal or reduced
motion.

A Lighthouse 12.8 production run on the earlier scaffold, before the hero was
added (scores vary between runs):

| Category | Home (mobile) | Home (desktop) |
| --- | --- | --- |
| Performance | 92 | 99 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

The measured mobile LCP was 3.2s and CLS 0; desktop LCP was 0.7s and CLS
0.001. Browser checks covered 31 unique internal header destinations, focus
loops, Escape, fast hover, scrolling, breakpoints and reduced motion. An axe
WCAG 2 A/AA and 2.1 A/AA scan found no violations in the closed header, the
three desktop menus or the mobile menu and its three accordions.

## Accessibility notes

- Semantic landmarks, a skip link, and visible focus rings (gold on dark).
- The mobile dialog locks scroll, traps focus, closes on Escape and restores focus.
- Desktop disclosures support hover and keyboard activation; focus loops through
  the open panel and its trigger, and Escape restores focus to that trigger.
- Body copy uses `#6B6157` on cream for AA contrast. The requested lighter
  `#8A7F72` measures 3.53:1 on cream, which fails AA for body text.
- Reduced motion: no Lenis, no intro animation, no parallax, no cursor
  follower, and reveals collapse to content that is simply present.
- Placeholder pages say so plainly ("Page design in progress") rather than
  pretending to be finished, and offer two onward links.
