import { expect, test } from "@playwright/test";

// Playwright normally hides the browser's scrollbar. Exercise the intro with
// a traditional scrollbar too, since restoring it changes the viewport width.
test.use({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
  launchOptions: {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ["--no-sandbox"] }
      : {}),
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

test("the intro remains centered when scrolling is restored", async ({ page }) => {
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
  await expect(page.locator("[data-intro]")).toBeHidden();
  await page.waitForTimeout(250);
  const shifts = await page.evaluate(() =>
    (window as Window & { heroLayoutShifts?: number[] }).heroLayoutShifts ?? []);
  expect(shifts.reduce((total, shift) => total + shift, 0)).toBeLessThan(0.0001);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`server content remains usable if the client scripts fail (${reducedMotion})`, async ({ page }) => {
    test.setTimeout(20_000);
    await page.emulateMedia({ reducedMotion });
    // Simulate a client bundle failing after an intro has locked scrolling.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => document.documentElement.classList.add("intro-active"));
    });
    await page.route(/\/_next\/static\/chunks\/.*\.js(?:\?.*)?$/, (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-root")).toHaveCSS("visibility", "hidden");
    await expect(page.locator("html")).toHaveCSS("overflow", "clip");
    await expect(page.locator("#site-root")).toHaveCSS("visibility", "visible", { timeout: 12_000 });
    await expect(page.locator("[data-intro]")).toHaveCSS("visibility", "hidden");
    await expect(page.locator("html")).toHaveCSS("overflow", "auto");
    await expect(page.locator(".site-header")).toHaveCSS("opacity", "1");
    await expect(page.getByRole("heading", { level: 1, name: "Interiors that feel as good as they look." })).toBeVisible();
    await expect(page.locator(".home-hero__actions").getByRole("link", { name: "Book a Consultation" })).toHaveAttribute("href", "/contact");
  });
}
