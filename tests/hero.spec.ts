import { expect, test, type Page } from "@playwright/test";

const headline = "Interiors that feel as good as they look.";
const description = "Eden Interiors is a full-service interior design studio creating refined, modern spaces for homes, workplaces and hospitality across Lagos and beyond.";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500 && new URL(response.url()).pathname.startsWith("/_next/")) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function waitForIntro(page: Page) {
  await expect(page.locator("[data-intro]")).toBeHidden();
}

test.describe("home hero content and layout", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("renders the exact copy and a stable, container-aligned desktop composition", async ({ page, request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain(headline);

    await page.goto("/");
    await waitForIntro(page);
    const hero = page.locator(".home-hero");
    await expect(hero.getByRole("heading", { level: 1, name: headline })).toBeVisible();
    await expect(hero.locator(".home-hero__description")).toHaveText(description);
    await expect(hero.getByRole("link", { name: "Book a Consultation" })).toHaveAttribute("href", "/contact");
    await expect(hero.getByRole("link", { name: "View Our Work" })).toHaveAttribute("href", "/projects");
    await expect(hero.locator("[data-hero-badge]")).toHaveAttribute("href", "/contact");
    await expect(hero.locator("[data-hero-frame]")).toHaveAttribute("href", "/projects");
    await expect(hero.locator(".home-hero__info")).toHaveAttribute("href", "/projects");
    await expect(hero.locator(".home-hero__info-cell dt")).toHaveText(["Latest Project", "Type", "Location"]);
    await expect(hero.locator(".home-hero__info-cell dd")).toHaveText(["Lekki Residence", "Residential", "Lagos"]);
    await expect(hero.locator("img")).toHaveAttribute("alt", /burnt-orange velvet sectional/);
    await expect(hero.locator("img")).toHaveAttribute("fetchpriority", "high");
    await expect.poll(() => hero.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

    const layout = await hero.evaluate((section) => {
      const rect = (selector: string) => section.querySelector(selector)!.getBoundingClientRect();
      const title = rect(".home-hero__title");
      const side = rect(".home-hero__side");
      const actions = rect(".home-hero__actions");
      const image = rect(".home-hero__image-frame");
      const badge = rect(".home-hero__badge-position");
      const info = rect(".home-hero__info");
      const firstCell = rect(".home-hero__info-cell");
      const titleStyle = getComputedStyle(section.querySelector(".home-hero__title")!);
      const copyStyle = getComputedStyle(section.querySelector(".home-hero__description")!);
      return {
        top: Math.min(title.top, side.top),
        titleBottom: title.bottom,
        sideBottom: side.bottom,
        imageTop: image.top,
        imageWidth: image.width,
        imageHeight: image.height,
        imageBottom: image.bottom,
        badgeWidth: badge.width,
        badgeHeight: badge.height,
        badgeTop: badge.top,
        actionsBottom: actions.bottom,
        badgeCenterY: badge.top + badge.height / 2,
        infoTop: info.top,
        infoHeight: info.height,
        firstCellLeft: firstCell.left,
        titleLeft: title.left,
        titleLines: Math.round(title.height / parseFloat(titleStyle.lineHeight)),
        copyFontSize: copyStyle.fontSize,
        actionsHeight: actions.height,
      };
    });
    expect(layout.top).toBeCloseTo(90 + 64, 0);
    expect(layout.titleBottom).toBeCloseTo(layout.sideBottom, 0);
    expect(layout.imageTop - layout.sideBottom).toBeCloseTo(56, 0);
    expect(layout.titleLines).toBeGreaterThanOrEqual(2);
    expect(layout.titleLines).toBeLessThanOrEqual(3);
    expect(layout.copyFontSize).toBe("18px");
    expect(layout.actionsHeight).toBe(48);
    expect(layout.imageWidth).toBe(1440);
    expect(layout.imageHeight).toBeCloseTo(900 * 0.62, 0);
    expect(layout.badgeWidth).toBe(120);
    expect(layout.badgeHeight).toBe(120);
    expect(layout.badgeTop).toBeGreaterThanOrEqual(layout.actionsBottom);
    expect(layout.badgeCenterY).toBeCloseTo(layout.imageTop, 0);
    expect(layout.infoTop).toBeCloseTo(layout.imageBottom, 0);
    expect(layout.infoHeight).toBe(120);
    expect(layout.firstCellLeft).toBeCloseTo(layout.titleLeft, 0);
  });

  test("preloads regular Inter and loads its real italic face only when needed", async ({ page }) => {
    const fontRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes(".woff2")) fontRequests.push(request.url());
    });
    await page.goto("/");
    await waitForIntro(page);
    await page.evaluate(() => document.fonts.ready);
    const faces = () => page.evaluate(() => Array.from(document.fonts)
      .filter((font) => font.family.toLowerCase() === "inter")
      .map((font) => ({ style: font.style, status: font.status })));
    expect(await faces()).toEqual(expect.arrayContaining([
      { style: "normal", status: "loaded" },
      { style: "italic", status: "unloaded" },
    ]));
    expect(fontRequests.some((url) => url.includes("inter_latin_wght_italic"))).toBe(false);
    await page.evaluate(() => document.fonts.load("italic 400 16px inter"));
    expect(await faces()).toEqual(expect.arrayContaining([{ style: "italic", status: "loaded" }]));
    expect(fontRequests.some((url) => url.includes("inter_latin_wght_italic"))).toBe(true);
  });

  test("all hero calls to action navigate to their intended routes", async ({ page }) => {
    const destinations = [
      { selector: ".home-hero__actions .btn--ember", route: "/contact" },
      { selector: ".home-hero__actions .btn--outline", route: "/projects" },
      { selector: ".home-hero__badge", route: "/contact" },
      { selector: ".home-hero__image-frame", route: "/projects" },
      { selector: ".home-hero__info", route: "/projects" },
    ];
    for (const { selector, route } of destinations) {
      await page.goto("/");
      await waitForIntro(page);
      await page.locator(selector).click();
      await expect(page).toHaveURL(new RegExp(`${route}$`));
    }
  });
});

test.describe("without JavaScript", () => {
  test.use({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });

  test("keeps the hero and navigation visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-intro]")).toBeHidden();
    await expect(page.locator(".site-header .site-logo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: headline })).toBeVisible();
    await expect(page.locator(".home-hero__actions .btn--ember")).toHaveAttribute("href", "/contact");
    await expect(page.locator(".home-hero__image-frame")).toBeVisible();
  });
});

test.describe("mobile hero", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });

  test("stacks the hero and exposes all project details in a keyboard-scrollable bar", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    const title = page.locator(".home-hero__title");
    const image = page.locator(".home-hero__image-frame");
    const info = page.locator(".home-hero__info");
    await expect(title).toHaveCSS("font-size", "44px");
    expect((await image.boundingBox())?.height).toBeCloseTo(844 * 0.56, 0);
    const dimensions = await info.evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.width);
    await info.scrollIntoViewIfNeeded();
    await info.focus();
    await expect(info).toBeFocused();
    for (let index = 0; index < 8; index += 1) await page.keyboard.press("ArrowRight");
    await expect.poll(() => info.evaluate((element) => element.scrollLeft)).toBeGreaterThan(150);
    const city = await page.locator(".home-hero__info-cell").last().boundingBox();
    expect(city?.x).toBeGreaterThanOrEqual(0);
    expect(city?.x).toBeLessThan(390);

    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 844 });
      const viewport = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(viewport.scrollWidth, `document overflow at ${width}px`).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("touch swipes the project bar and its last cell still navigates", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await waitForIntro(page);
    const info = page.locator(".home-hero__info");
    await info.scrollIntoViewIfNeeded();
    const box = await info.boundingBox();
    if (!box) throw new Error("Project bar is missing");

    const client = await context.newCDPSession(page);
    const y = box.y + box.height / 2;
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 335, y }] });
    for (const x of [300, 260, 220, 180, 140, 100, 60]) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
      await page.waitForTimeout(25);
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => info.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
    await page.locator(".home-hero__info-cell").last().tap();
    await expect(page).toHaveURL(/\/projects$/);
    await client.detach();
  });
});

test("slow font loading does not move the hero", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200 * 1024,
    uploadThroughput: 100 * 1024,
    connectionType: "cellular3g",
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    const shifts: number[] = [];
    Object.assign(window, { heroLayoutShifts: shifts });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) shifts.push(shift.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/", { waitUntil: "load", timeout: 60_000 });
  await expect(page.locator("[data-intro]")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("[data-hero-reveal]")).toHaveCSS("clip-path", "inset(0%)", { timeout: 15_000 });
  const shifts = await page.evaluate(() =>
    (window as Window & { heroLayoutShifts?: number[] }).heroLayoutShifts ?? []);
  expect(shifts.reduce((total, shift) => total + shift, 0)).toBeLessThan(0.001);
  await client.detach();
});

test.describe("stalled fonts", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`keeps a stable fallback when fonts arrive late (${reducedMotion})`, async ({ page }) => {
      test.setTimeout(30_000);
      await page.emulateMedia({ reducedMotion });
      await page.route(/\.woff2(?:\?.*)?$/, async (route) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 6000));
        await route.continue();
      });
      await page.addInitScript(() => {
        const shifts: number[] = [];
        Object.assign(window, { heroLayoutShifts: shifts });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!shift.hadRecentInput) shifts.push(shift.value);
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-font-fallback", "true", { timeout: 10_000 });
      const loading = await page.evaluate(() => Array.from(document.fonts)
        .filter((font) => ["inter", "urbanist"].includes(font.family.toLowerCase()) && font.style === "normal")
        .map((font) => font.status));
      expect(loading).toEqual(["loading", "loading"]);
      await waitForIntro(page);
      await expect(page.locator("[data-hero-reveal]")).toHaveCSS("clip-path", "inset(0%)", { timeout: 10_000 });
      const image = page.locator("[data-hero-frame]");
      const imageTop = (await image.boundingBox())?.y;
      expect(imageTop).toBeDefined();
      await expect(page.locator("[data-hero-heading]")).toHaveCSS("font-family", /system-ui/);

      await page.waitForFunction(() => {
        const faces = Array.from(document.fonts).filter((font) =>
          ["inter", "urbanist"].includes(font.family.toLowerCase()) && font.style === "normal");
        return faces.length === 2 && faces.every((font) => font.status === "loaded");
      }, null, { timeout: 12_000 });
      await page.waitForTimeout(250);
      expect((await image.boundingBox())?.y).toBeCloseTo(imageTop!, 1);
      const shifts = await page.evaluate(() =>
        (window as Window & { heroLayoutShifts?: number[] }).heroLayoutShifts ?? []);
      expect(shifts.reduce((total, shift) => total + shift, 0)).toBeLessThan(0.001);
      await expect(page.locator("html")).toHaveAttribute("data-font-fallback", "true");
    });
  }
});

test.describe("animated hero", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("reveals all four image edges together, then scrubs without layout shift", async ({ page }) => {
    await page.addInitScript(() => {
      const shifts: number[] = [];
      Object.assign(window, { heroLayoutShifts: shifts });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput) shifts.push(shift.value);
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    const partial = await page.waitForFunction(() => {
      const element = document.querySelector<HTMLElement>("[data-hero-reveal]");
      if (!element) return false;
      const style = getComputedStyle(element);
      const inset = parseFloat(style.getPropertyValue("--hero-inset"));
      return inset > 0.5 && inset < 7.5 ? { inset, clip: style.clipPath } : false;
    }, null, { timeout: 15_000 });
    const sample = await partial.jsonValue() as { inset: number; clip: string };
    // Chromium serializes four equal inset sides as one value.
    expect(sample.clip).toMatch(/^inset\([\d.]+%\)$/);
    expect(parseFloat(sample.clip.slice(6))).toBeCloseTo(sample.inset, 1);

    await waitForIntro(page);
    await expect(page.locator("[data-hero-heading] .split-line")).toHaveCount(2);
    await expect.poll(() => page.locator("[data-hero-reveal]").evaluate((element) =>
      parseFloat(getComputedStyle(element).getPropertyValue("--hero-inset"))), { timeout: 8_000 }).toBeLessThan(0.01);
    await expect(page.locator("[data-hero-badge]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-hero-copy]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-hero-value]").first()).toHaveCSS("opacity", "1");
    const shifts = await page.evaluate(() =>
      (window as Window & { heroLayoutShifts?: number[] }).heroLayoutShifts ?? []);
    expect(shifts.reduce((total, shift) => total + shift, 0)).toBeLessThan(0.001);

    const badgeText = page.locator("[data-hero-badge-text]");
    const angle = () => badgeText.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
    });
    const rotationBefore = await angle();
    await page.waitForTimeout(350);
    const rotationAfter = await angle();
    const normalRotation = (rotationAfter - rotationBefore + 360) % 360;
    expect(normalRotation).toBeGreaterThan(1);

    await page.evaluate(() => window.scrollTo(0, 450));
    await page.waitForTimeout(50);
    const fastStart = await angle();
    await page.waitForTimeout(350);
    const fastEnd = await angle();
    const fastRotation = (fastEnd - fastStart + 360) % 360;
    expect(fastRotation).toBeGreaterThan(normalRotation * 1.25);
    await expect.poll(() => page.locator("[data-hero-image]").evaluate((element) =>
      new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeGreaterThan(5);
    const coverage = await page.evaluate(() => {
      const frame = document.querySelector("[data-hero-frame]")!.getBoundingClientRect();
      const media = document.querySelector("[data-hero-image]")!.getBoundingClientRect();
      const transform = new DOMMatrixReadOnly(getComputedStyle(document.querySelector("[data-hero-image]")!).transform);
      return { frameTop: frame.top, frameBottom: frame.bottom, mediaTop: media.top, mediaBottom: media.bottom, scale: transform.a };
    });
    expect(coverage.scale).toBeLessThan(1.15);
    expect(coverage.scale).toBeGreaterThanOrEqual(1);
    expect(coverage.mediaTop).toBeLessThanOrEqual(coverage.frameTop);
    expect(coverage.mediaBottom).toBeGreaterThanOrEqual(coverage.frameBottom);
  });

  test("the badge is magnetic, the cursor says Explore only on the photo, and cells respond individually", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    const badge = page.locator("[data-hero-badge]");
    await expect(badge).toHaveCSS("opacity", "1");
    const photo = await page.locator("[data-hero-frame]").boundingBox();
    const badgeBox = await badge.boundingBox();
    if (!photo || !badgeBox) throw new Error("Hero photo or badge is missing");

    await page.mouse.move(photo.x + 80, photo.y + 80);
    const cursor = page.locator(".cursor-follower");
    await expect(cursor).toHaveAttribute("data-state", "active");
    await expect(cursor).toContainText("Explore");
    await page.mouse.move(badgeBox.x + 100, badgeBox.y + 60);
    await expect(cursor).toHaveAttribute("data-state", "idle");
    await expect.poll(() => page.locator(".home-hero__badge-magnetic").evaluate((element) =>
      new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBeGreaterThan(5);
    await expect.poll(() => page.locator(".home-hero__badge-arrow").evaluate((element) =>
      new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeLessThan(0.75);

    const cells = page.locator(".home-hero__info-cell");
    await cells.nth(1).hover();
    await expect.poll(() => cells.nth(1).locator("dd").evaluate((element) => getComputedStyle(element).color))
      .toBe("rgb(255, 178, 122)");
    await expect(cells.nth(0).locator("dd")).toHaveCSS("color", "rgb(255, 243, 234)");
  });

  test("client navigation back home replays the hero without replaying the intro", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await expect(page.locator("[data-hero-actions]")).toHaveCSS("opacity", "1");
    await page.getByRole("link", { name: "View Our Work", exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await page.locator(".site-header .site-logo").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-intro]")).toBeHidden();
    await expect(page.getByRole("heading", { name: headline, level: 1 })).toBeVisible();
    await expect(page.locator("[data-hero-reveal]")).toHaveCSS("clip-path", "inset(0%)", { timeout: 6_000 });
  });

  test("enabling reduced motion during the intro releases it immediately", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".intro__inner")).toHaveCSS("visibility", "visible", { timeout: 10_000 });
    await expect(page.locator("[data-intro]")).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("[data-intro]")).toBeHidden();
    await expect(page.locator("[data-hero-heading]")).toHaveCSS("opacity", "1");
    await expect(page.locator(".site-header")).not.toHaveAttribute("data-intro-hidden", "true");
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  });

  test("switching to reduced motion stops the effects and restores the complete hero", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => page.locator("[data-hero-heading] .split-line").count(), { timeout: 10_000 }).toBeGreaterThan(0);
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await expect(page.locator(".cursor-follower")).toHaveCount(0);
    await expect(page.locator("[data-hero-heading]")).toHaveText(headline);
    await expect(page.locator("[data-hero-heading] .split-line")).toHaveCount(0);
    await expect(page.locator("[data-hero-copy]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-hero-badge]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-hero-badge-text]")).toHaveCSS("transform", "none");
    await expect(page.locator("[data-hero-reveal]")).toHaveCSS("clip-path", "inset(0%)");
    await page.evaluate(() => window.scrollTo(0, 450));
    await expect(page.locator("[data-hero-image]")).toHaveCSS("transform", "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  });
});
