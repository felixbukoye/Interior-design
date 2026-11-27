import { expect, test, type Page } from "@playwright/test";
import {
  featuredProjects,
  projectTypes,
  serviceGroups,
  studioNav,
} from "../src/data/navigation";

async function waitForHeader(page: Page) {
  await expect(page.locator(".site-header")).not.toHaveAttribute("data-intro-hidden", "true");
}

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500 && new URL(response.url()).pathname.startsWith("/_next/")) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}

const errorsByPage = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  errorsByPage.set(page, collectBrowserErrors(page));
});
test.afterEach(async ({ page }) => {
  expect(errorsByPage.get(page)).toEqual([]);
});

test.describe("server rendering and hydration", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("the server and hydrated mega-menu structures match", async ({ page, request }) => {
    const errors = collectBrowserErrors(page);
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    const html = await response.text();

    await page.goto("/");
    await waitForHeader(page);
    const structures = await page.evaluate((serverHtml) => {
      const server = new DOMParser().parseFromString(serverHtml, "text/html");
      const shape = (element: Element): string =>
        `${element.tagName}:${element.getAttribute("class") ?? ""}[${Array.from(element.children, shape).join(",")}]`;
      return ["services", "projects", "studio"].map((name) => {
        const selector = `#mega-menu-${name}`;
        const serverMenu = server.querySelector(selector);
        const clientMenu = document.querySelector(selector);
        if (!serverMenu || !clientMenu) throw new Error(`Missing ${selector}`);
        return { server: shape(serverMenu), client: shape(clientMenu) };
      });
    }, html);
    for (const menu of structures) expect(menu.client).toBe(menu.server);

    await page.getByRole("button", { name: "Services", exact: true }).click();
    await expect(page.locator("#mega-menu-services")).toHaveAttribute("aria-hidden", "false");
    expect(errors).toEqual([]);
  });

  test("body attributes added by a browser extension do not break hydration", async ({ page }) => {
    const errors = collectBrowserErrors(page);
    await page.addInitScript(() => {
      const addAttributes = () => {
        if (!document.body) return false;
        document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1351.0");
        document.body.setAttribute("data-gr-ext-installed", "");
        return true;
      };
      if (!addAttributes()) {
        const observer = new MutationObserver(() => {
          if (addAttributes()) observer.disconnect();
        });
        observer.observe(document, { childList: true, subtree: true });
      }
    });

    for (const route of ["/", "/services", "/projects/project-one"]) {
      await page.goto(route);
      await waitForHeader(page);
      await expect(page.locator("body")).toHaveAttribute("data-gr-ext-installed", "");
      const trigger = page.locator("#menu-trigger-services");
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
    expect(errors).toEqual([]);
  });

  test("the intro remains React-owned in normal and reduced motion", async ({ page }) => {
    const errors = collectBrowserErrors(page);
    await page.goto("/");
    await waitForHeader(page);
    await expect(page.locator("[data-intro]")).toHaveCount(1);
    await expect(page.locator("[data-intro]")).toBeHidden();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
    await waitForHeader(page);
    await expect(page.locator("[data-intro]")).toHaveCount(1);
    await expect(page.locator("[data-intro]")).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("every menu destination has a placeholder page", async ({ request }) => {
    test.setTimeout(60_000);
    const hrefs = new Set([
      "/", "/services", "/projects", "/journal", "/contact",
      ...serviceGroups.flatMap((group) => group.links.map((link) => link.href)),
      ...projectTypes.map((link) => link.href),
      ...featuredProjects.map((link) => link.href),
      ...studioNav.map((link) => link.href),
    ]);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} returned ${response.status()}`).toBe(200);
    }
  });
});

test.describe("desktop navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForHeader(page);
  });

  test("hover opens and closes; clicking a hover-open menu pins it", async ({ page }) => {
    const trigger = page.locator("#menu-trigger-services");
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(1380, 800);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(1380, 800);
    // Wait past the close-intent delay: the click-pinned panel should remain open.
    await page.waitForTimeout(200);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(1380, 800);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard focus stays in the panel and is not stolen by hover", async ({ page }) => {
    const trigger = page.locator("#menu-trigger-services");
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    const first = page.locator('#mega-menu-services a[href="/services/full-home-design"]');
    await expect(first).toBeFocused();

    await page.locator("#menu-trigger-projects").hover();
    await page.waitForTimeout(200);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(first).toBeFocused();

    await page.locator("#mega-menu-services a").last().focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("clicking the current-page link closes the panel without losing focus", async ({ page }) => {
    await page.goto("/services/full-home-design");
    await waitForHeader(page);
    const trigger = page.locator("#menu-trigger-services");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const link = page.locator('#mega-menu-services a[href="/services/full-home-design"]');
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });
});

test.describe("mobile navigation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });

  test("accordions, focus loop, Escape and scroll lock work", async ({ page }) => {
    await page.goto("/");
    await waitForHeader(page);
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow", "clip");

    const services = page.getByRole("button", { name: "Services", exact: true });
    await services.click();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-accordion-services .mobile-menu__sub-link")).toHaveCount(12);
    const projects = page.getByRole("button", { name: "Projects", exact: true });
    await projects.click();
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await expect(projects).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-accordion-projects .mobile-menu__type-list a")).toHaveCount(6);

    const last = page.locator(".mobile-menu__cta");
    await last.focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-header .site-logo")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "clip");
  });

  test("a same-page link restores focus to the menu button", async ({ page }) => {
    await page.goto("/contact");
    await waitForHeader(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator(".mobile-menu__cta").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "clip");
  });
});

test("resizing an open menu moves focus to a visible control", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHeader(page);
  await page.locator("#menu-trigger-services").focus();
  await page.keyboard.press("Enter");
  await page.locator('#mega-menu-services a[href="/services/full-home-design"]').focus();

  await page.setViewportSize({ width: 900, height: 900 });
  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await page.locator('#mobile-accordion-services a[href="/services/full-home-design"]').focus();

  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(page.locator("#menu-trigger-services")).toBeFocused();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "clip");
});

test.describe("animated header behavior", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("the hover bridge stays open while the panel is revealing", async ({ page }) => {
    const errors = collectBrowserErrors(page);
    await page.goto("/");
    await waitForHeader(page);
    const services = page.locator("#menu-trigger-services");
    await services.hover();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    const rect = await services.boundingBox();
    if (!rect) throw new Error("Services trigger has no bounding box");
    await page.mouse.move(rect.x + rect.width / 2, 280);
    // Stay longer than the close delay while the clipped panel is opening.
    await page.waitForTimeout(250);
    await expect(services).toHaveAttribute("aria-expanded", "true");

    await page.locator("#menu-trigger-studio").hover();
    await expect(page.locator("#menu-trigger-studio")).toHaveAttribute("aria-expanded", "true");
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await page.mouse.move(1380, 800);
    await expect(page.locator("#menu-trigger-studio")).toHaveAttribute("aria-expanded", "false");
    expect(errors).toEqual([]);
  });

  test("the header shrinks and follows the scroll direction", async ({ page }) => {
    await page.goto("/services");
    await waitForHeader(page);
    const header = page.locator(".site-header");
    await page.evaluate(() => window.scrollTo(0, 450));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await expect.poll(async () => header.evaluate((element) => element.getBoundingClientRect().top))
      .toBeLessThan(-60);
    await expect(page.locator(".site-header__bar")).toHaveCSS("height", "72px");
    await page.evaluate(() => window.scrollTo(0, 250));
    await expect.poll(async () => header.evaluate((element) => element.getBoundingClientRect().top))
      .toBeGreaterThan(-3);
  });
});

test("mobile accordions animate while the consultation button stays pinned", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
    baseURL: process.env.E2E_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_PORT ?? 3000}`,
  });
  const page = await context.newPage();
  const errors = collectBrowserErrors(page);
  try {
    await page.goto("/");
    await waitForHeader(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const cta = page.locator(".mobile-menu__cta");
    await expect(cta).toBeVisible();
    const before = await cta.boundingBox();
    await page.getByRole("button", { name: "Services", exact: true }).click();
    await expect.poll(async () => page.locator("#mobile-accordion-services").evaluate((element) => element.clientHeight))
      .toBeGreaterThan(500);
    await page.locator(".mobile-menu__scroll").evaluate((element) => { element.scrollTop = 500; });
    const after = await cta.boundingBox();
    expect(after?.y).toBeCloseTo(before?.y ?? -1, 0);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
