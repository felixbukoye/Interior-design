import { expect, test, type Page } from "@playwright/test";

const eyebrow = "Welcome to Eden Interiors";
const headline = "Design with intention. Live with ease.";
const paragraph1 =
  "Great interiors are not about more. They are about the right things, placed with care. We combine clean modern lines, natural materials and thoughtful lighting to create spaces that feel calm, look timeless and work for the way you actually live.";
const paragraph2 =
  "From the first sketch to the final styling, we handle every detail so you can enjoy the result without the stress of the process.";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function waitForIntro(page: Page) {
  await expect(page.locator("[data-intro]")).toBeHidden();
}

async function revealSection(page: Page) {
  await page.locator("[data-home-intro]").scrollIntoViewIfNeeded();
}

const section = (page: Page) => page.locator("[data-home-intro]");

test.describe("introduction content and layout", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("renders the exact copy, stats and destination", async ({ page, request }) => {
    const response = await request.get("/");
    const html = await response.text();
    // React escapes the apostrophes in the prose; the copy is otherwise verbatim.
    for (const text of [eyebrow, headline, paragraph1, paragraph2]) {
      expect(html.replace(/&#x27;/g, "'")).toContain(text);
    }

    await page.goto("/");
    await waitForIntro(page);
    const intro = section(page);
    await intro.scrollIntoViewIfNeeded();
    await expect(intro.getByText(eyebrow)).toBeVisible();
    await expect(intro.getByRole("heading", { level: 2, name: headline })).toBeVisible();
    await expect(intro.getByText(paragraph1)).toBeVisible();
    await expect(intro.getByText(paragraph2)).toBeVisible();
    await expect(intro.getByRole("link", { name: "Discover our approach" })).toHaveAttribute("href", "/studio/about");
    await expect(intro.locator(".home-intro__stat-label")).toHaveText([
      "projects completed",
      "years of experience",
    ]);
  });

  test("desktop: photo spans 5 columns, the card overlaps it by 40px and fills its height", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);

    const metrics = await section(page).evaluate((root) => {
      const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
      const contentWidth = (element: Element) => {
        const style = getComputedStyle(element);
        return element.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      };
      const photo = rect(".home-intro__photo");
      const card = rect(".home-intro__card");
      const shell = rect(".shell");
      const shellInner = contentWidth(root.querySelector(".shell")!);
      const title = getComputedStyle(root.querySelector(".home-intro__title")!);
      const body = getComputedStyle(root.querySelector(".home-intro__body")!);
      const value = getComputedStyle(root.querySelector(".home-intro__stat-value")!);
      const inner = getComputedStyle(root.querySelector(".home-intro__card-inner")!);
      const gridGap = parseFloat(getComputedStyle(root.querySelector(".home-intro__grid")!).columnGap);
      return {
        photoLeft: photo.left,
        photoRight: photo.right,
        photoWidth: photo.width,
        photoHeight: photo.height,
        photoRatio: photo.width / photo.height,
        cardLeft: card.left,
        cardRight: card.right,
        cardTop: card.top,
        cardBottom: card.bottom,
        cardHeight: card.height,
        photoTop: photo.top,
        photoBottom: photo.bottom,
        shellLeft: shell.left + (shell.width - shellInner) / 2,
        shellRight: shell.right - (shell.width - shellInner) / 2,
        shellWidth: shellInner,
        gridGap,
        iconPadding: inner.padding,
        titleSize: title.fontSize,
        titleColor: title.color,
        bodySize: body.fontSize,
        bodyLineHeight: body.lineHeight,
        bodyColor: body.color,
        valueSize: value.fontSize,
        valueColor: value.color,
      };
    });

    // 12-column container: the photo is 5 columns wide.
    const columnWidth = (metrics.shellWidth - metrics.gridGap * 11) / 12;
    const expectedPhotoWidth = columnWidth * 5 + metrics.gridGap * 4;
    expect(metrics.photoWidth).toBeCloseTo(expectedPhotoWidth, 0);
    expect(metrics.photoLeft).toBeCloseTo(metrics.shellLeft, 0);
    // A 4:5 portrait crop; it fills the row when the card's copy is taller.
    expect(metrics.photoRatio).toBeLessThanOrEqual(4 / 5 + 0.02);

    // The card starts exactly 40px inside the photo's right edge.
    expect(metrics.cardLeft).toBeCloseTo(metrics.photoRight - 40, 0);
    // …and matches its height, top and bottom, so the pair sits flush.
    expect(metrics.cardTop).toBeCloseTo(metrics.photoTop, 0);
    expect(metrics.cardBottom).toBeCloseTo(metrics.photoBottom, 0);
    expect(metrics.cardHeight).toBeCloseTo(metrics.photoHeight, 0);
    // The card's outer edge stays flush with the container.
    expect(metrics.cardRight).toBeCloseTo(metrics.shellRight, 0);

    expect(metrics.iconPadding).toBe("56px");
    expect(metrics.titleSize).toBe("44px");
    expect(metrics.titleColor).toBe("rgb(255, 241, 223)");
    expect(metrics.bodySize).toBe("16px");
    expect(metrics.bodyLineHeight).toBe("28px");
    expect(metrics.bodyColor).toBe("rgba(255, 241, 223, 0.62)");
    expect(metrics.valueSize).toBe("44px");
    expect(metrics.valueColor).toBe("rgb(181, 138, 79)");
  });

  test("the image band is full-bleed and 560px tall, 120px below the block", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);

    const metrics = await section(page).evaluate((root) => {
      const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
      return {
        viewport: document.documentElement.clientWidth,
        bandLeft: rect(".home-intro__band-frame").left,
        bandWidth: rect(".home-intro__band-frame").width,
        bandHeight: rect(".home-intro__band-frame").height,
        cardBottom: rect(".home-intro__card").bottom,
        bandTop: rect(".home-intro__band").top,
        lineTop: rect(".home-intro__band-line").top,
      };
    });
    expect(metrics.bandWidth).toBeCloseTo(metrics.viewport, 0);
    expect(metrics.bandHeight).toBe(560);
    expect(metrics.bandTop - metrics.cardBottom).toBeCloseTo(120, 0);
    expect(metrics.lineTop).toBeCloseTo(metrics.bandTop, 0);
  });

  test("the block clears the sticky header with 120px of top padding", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);
    const padding = await section(page).evaluate((root) =>
      parseFloat(getComputedStyle(root).paddingTop));
    expect(padding).toBe(120);
  });
});

test.describe("introduction motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  test.setTimeout(60_000);

  test("photo wipes from the bottom with an inner scale, the card slides in, copy reveals", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);

    // Before entering: the card is waiting to the right and the photo clipped.
    const before = await section(page).evaluate((root) => ({
      clip: getComputedStyle(root.querySelector("[data-intro-photo-clip]")!).clipPath,
      cardX: new DOMMatrixReadOnly(getComputedStyle(root.querySelector("[data-intro-card]")!).transform).m41,
    }));
    expect(before.clip).not.toBe("none");
    expect(before.cardX).toBeGreaterThan(0);

    await revealSection(page);

    await expect.poll(() => section(page).evaluate((root) => {
      const clip = getComputedStyle(root.querySelector("[data-intro-photo-clip]")!).clipPath;
      return clip === "inset(0%)" || clip === "inset(0% 0% 0% 0%)";
    }), { timeout: 15_000 }).toBe(true);

    await expect.poll(() => section(page).evaluate((root) =>
      new DOMMatrixReadOnly(getComputedStyle(root.querySelector("[data-intro-photo-media]")!).transform).a))
      .toBeLessThan(1.01);

    await expect.poll(() => section(page).evaluate((root) =>
      new DOMMatrixReadOnly(getComputedStyle(root.querySelector("[data-intro-card]")!).transform).m41))
      .toBeCloseTo(0, 0);
    await expect(section(page).locator("[data-intro-card]")).toHaveCSS("opacity", "1");

    // Headline split into masked lines, paragraphs into their own lines.
    await expect.poll(() => section(page).locator(".home-intro__title .split-line").count()).toBeGreaterThan(0);
    await expect.poll(() => section(page).locator(".home-intro__body .split-line").count()).toBeGreaterThan(1);
  });

  test("stats count up from zero and the plus snaps in at the end", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);

    const numbers = section(page).locator("[data-count-number]");
    const suffixes = section(page).locator("[data-count-suffix]");

    // Suffix starts hidden, and the count starts below its final value.
    await expect(suffixes.first()).toHaveCSS("opacity", "0");

    await expect.poll(async () => Number(await numbers.first().textContent()), { timeout: 15_000 })
      .toBe(120);
    await expect.poll(async () => Number(await numbers.nth(1).textContent())).toBe(12);
    await expect(suffixes.first()).toHaveCSS("opacity", "1");
    await expect(section(page).locator(".home-intro__stat-value")).toHaveText(["120+", "12+"]);
  });

  test("the band parallaxes and draws its gold hairline", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);

    await expect.poll(() => section(page).evaluate((root) => {
      const path = root.querySelector("[data-intro-band-path]") as SVGPathElement;
      return getComputedStyle(path).strokeDasharray;
    }), { timeout: 10_000 }).not.toBe("none");

    const before = await section(page).evaluate((root) =>
      new DOMMatrixReadOnly(getComputedStyle(root.querySelector("[data-parallax-media]")!).transform).m42);
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(400);
    const after = await section(page).evaluate((root) =>
      new DOMMatrixReadOnly(getComputedStyle(root.querySelector("[data-parallax-media]")!).transform).m42);
    expect(after).not.toBeCloseTo(before, 1);
  });

  test("the CTA is magnetic", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);
    const cta = section(page).getByRole("link", { name: "Discover our approach" });
    const box = await cta.boundingBox();
    if (!box) throw new Error("CTA is missing");
    const wrapper = section(page).locator(".home-intro__action > span");
    await page.mouse.move(box.x + box.width - 4, box.y + 4);
    await expect.poll(() => wrapper.evaluate((el) =>
      new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)).toBeGreaterThan(2);
  });
});

test.describe("introduction on mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });

  test("stacks the card over the photo by 24px with 32px padding", async ({ page }) => {
    await page.goto("/");
    await waitForIntro(page);
    await revealSection(page);

    const metrics = await section(page).evaluate((root) => {
      const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
      return {
        photoBottom: rect(".home-intro__photo").bottom,
        cardTop: rect(".home-intro__card").top,
        padding: getComputedStyle(root.querySelector(".home-intro__card-inner")!).padding,
        bandHeight: rect(".home-intro__band-frame").height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    // The stacked card overlaps the bottom of the photo by exactly 24px.
    expect(metrics.photoBottom - metrics.cardTop).toBeCloseTo(24, 0);
    expect(metrics.padding).toBe("32px");
    expect(metrics.bandHeight).toBe(360);
    expect(metrics.overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("introduction without JavaScript", () => {
  test.use({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });

  test("keeps all copy, stats and the image band visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: headline })).toBeVisible();
    await expect(page.getByText(paragraph1)).toBeVisible();
    await expect(page.getByRole("link", { name: "Discover our approach" })).toBeVisible();
    await expect(page.locator(".home-intro__stat-value")).toHaveText(["120+", "12+"]);
    await expect(page.locator(".home-intro__band-frame img")).toBeVisible();
  });
});
