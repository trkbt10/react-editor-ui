/**
 * @file LogViewer E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("LogViewer", () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await page.goto("/#/components/feedback/log-viewer");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Wait for the LogViewer heading to be visible
    await expect(page.getByRole("heading", { name: "LogViewer" })).toBeVisible({ timeout: 10000 });

    // Take screenshot for debugging
    await page.screenshot({ path: "e2e/screenshots/log-viewer-debug.png" });

    // Log any errors
    if (errors.length > 0) {
      console.log("Console errors:", errors);
    }
  });

  test("renders with 10,000 items", async ({ page }) => {
    // Wait for log entries to render
    const logContainer = page.locator('[style*="overflow: auto"]').first();
    await expect(logContainer).toBeVisible();

    // Wait for virtual items to render
    await expect(page.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    // Check that we have log entries with level badges
    const levelBadges = page.locator('span').filter({ hasText: /\[(INFO|DEBUG|ERROR|WARNING|SUCCESS)\]/ });
    await expect(levelBadges.first()).toBeVisible();
  });

  test("virtual scrolling renders only visible items", async ({ page }) => {
    // Get the scroll container
    const scrollContainer = page.locator('[style*="overflow: auto"]').first();
    await expect(scrollContainer).toBeVisible();

    // Wait for initial items to render
    await expect(page.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    // Count initially rendered items (should be much less than 10,000)
    const initialItems = await page.locator('[data-index]').count();
    expect(initialItems).toBeLessThan(50);
    expect(initialItems).toBeGreaterThan(5);
  });

  test("scrolling updates visible items", async ({ page }) => {
    // Find the first LogViewer's scroll container (has explicit height in px and large scrollHeight)
    const scrollContainer = page.locator('[style*="overflow: auto"][style*="height: 400"]').first();
    await expect(scrollContainer).toBeVisible();

    // Wait for initial items to render
    await expect(scrollContainer.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    // Scroll down significantly using mouse wheel simulation
    await scrollContainer.hover();
    await page.mouse.wheel(0, 3600);

    // Wait for scroll to take effect
    await page.waitForTimeout(500);

    // After scrolling, get all visible data-index values in this container
    const indices = await scrollContainer.locator('[data-index]').evaluateAll((elements) =>
      elements.map((el) => Number(el.getAttribute('data-index')))
    );

    // At least some items should have indices > 50 after scrolling 100 items worth
    const hasHighIndices = indices.some((idx) => idx > 50);
    expect(hasHighIndices).toBe(true);
  });

  test("filter by level works", async ({ page }) => {
    // Wait for initial render
    await expect(page.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    // Select error filter
    const filterSelect = page.locator("select").first();
    await filterSelect.selectOption("error");

    // Wait for filter to apply
    await page.waitForTimeout(200);

    // Should show filtered count text
    await expect(page.getByText(/filtered from/)).toBeVisible();
  });

  test("pagination controls work", async ({ page }) => {
    // Find the pagination section by looking for "With Pagination" text
    await expect(page.getByText("With Pagination")).toBeVisible();

    // Find the page indicator (starts at page 1)
    const pageIndicator = page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first();
    await expect(pageIndicator).toBeVisible({ timeout: 5000 });

    // Get initial page text
    const initialPage = await pageIndicator.textContent();
    expect(initialPage).toContain("1 / 100");

    // Click Next button
    const nextButton = page.locator("button", { hasText: "Next" }).first();
    await nextButton.click();

    // Wait for page change
    await page.waitForTimeout(100);

    // Page should be 2
    await expect(pageIndicator).toHaveText("2 / 100");

    // Click Last button
    const lastButton = page.locator("button", { hasText: "Last" }).first();
    await lastButton.click();

    // Wait for page change
    await page.waitForTimeout(100);

    // Page should be 100
    await expect(pageIndicator).toHaveText("100 / 100");
  });

  test("no layout overflow", async ({ page }) => {
    const scrollContainer = page.locator('[style*="overflow: auto"]').first();
    await expect(scrollContainer).toBeVisible();

    // Wait for content to render
    await expect(page.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    const overflowInfo = await scrollContainer.evaluate((el) => {
      const checkOverflow = (element: Element, path: string): { hasOverflow: boolean; path: string } | null => {
        const htmlEl = element as HTMLElement;
        const style = window.getComputedStyle(htmlEl);

        const hasOverflowHandling = style.overflow === "hidden" || style.overflowX === "hidden" || style.overflow === "auto";

        if (!hasOverflowHandling && htmlEl.scrollWidth > htmlEl.clientWidth + 1) {
          return { hasOverflow: true, path };
        }

        for (const child of Array.from(element.children)) {
          const result = checkOverflow(child, `${path} > ${child.tagName}`);
          if (result) {
            return result;
          }
        }
        return null;
      };
      return checkOverflow(el, "root");
    });

    expect(overflowInfo).toBeNull();
  });

  test("performance: scrolling is smooth", async ({ page }) => {
    const scrollContainer = page.locator('[style*="overflow: auto"]').first();
    await expect(scrollContainer).toBeVisible();

    // Wait for content to render
    await expect(page.locator('[data-index]').first()).toBeVisible({ timeout: 5000 });

    // Measure scroll performance
    const scrollTimes: number[] = [];

    for (const scrollTop of [500, 1000, 2000, 5000, 10000]) {
      const start = Date.now();
      await scrollContainer.evaluate((el, top) => {
        el.scrollTop = top;
      }, scrollTop);
      await page.waitForTimeout(16); // One frame
      scrollTimes.push(Date.now() - start);
    }

    // Average scroll time should be under 100ms
    const avgTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
    expect(avgTime).toBeLessThan(100);
  });
});
