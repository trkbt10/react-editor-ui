/**
 * @file LogViewer selection and scroll interaction tests
 *
 * Tests for the bug where selecting a line and then scrolling
 * causes the virtual scroll to stop updating.
 */

import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Helper to get the first LogViewer's scroll container
 */
async function getFirstLogViewerScrollContainer(page: Page): Promise<Locator> {
  // Get scroll containers that have data-index children
  const allScrollContainers = page.locator('div[style*="overflow"][style*="auto"]');
  const logViewerContainers = allScrollContainers.filter({ has: page.locator('[data-index]') });

  // Return the first one (Virtual Scrolling demo)
  return logViewerContainers.nth(0);
}

test.describe("LogViewer selection and scroll", () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors for debugging
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("Browser console error:", msg.text());
      }
    });
    page.on("pageerror", (err) => {
      console.log("Page error:", err.message);
    });

    await page.goto("/#/components/feedback/log-viewer");
    // Wait for the page to be ready
    await page.waitForLoadState("networkidle");
  });

  test("clicking a line should not break virtual scrolling", async ({ page }) => {
    // Wait for items to be rendered
    await page.waitForSelector('[data-index="0"]', { timeout: 15000 });

    // Get the first LogViewer's scroll container
    const scrollContainer = await getFirstLogViewerScrollContainer(page);

    // Verify initial state - should have visible items
    const initialItems = await scrollContainer.locator('[data-index]').count();
    expect(initialItems).toBeGreaterThan(0);

    // Click on a log entry to select it - use .first() to avoid strict mode issues
    const firstItem = scrollContainer.locator('[data-index="0"]').first();
    await firstItem.click();

    // Wait a bit for any state updates
    await page.waitForTimeout(100);

    // Verify items are still visible after selection
    const afterClickItems = await scrollContainer.locator('[data-index]').count();
    expect(afterClickItems).toBeGreaterThan(0);

    // Now scroll down
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 500;
    });

    // Wait for virtual scroll to update
    await page.waitForTimeout(200);

    // Verify items are still visible after scrolling
    const afterScrollItems = await scrollContainer.locator('[data-index]').count();
    expect(afterScrollItems).toBeGreaterThan(0);

    // The inner container should have height (not be empty)
    const innerContainer = scrollContainer.locator('div[style*="position: relative"]').first();
    const innerHeight = await innerContainer.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.height);
    });
    expect(innerHeight).toBeGreaterThan(0);
  });

  test("scrolling after selection should render correct items", async ({ page }) => {
    // Wait for items to be rendered
    await page.waitForSelector('[data-index="0"]', { timeout: 10000 });

    const scrollContainer = await getFirstLogViewerScrollContainer(page);

    // Click to select an item (may cause auto-scroll)
    await scrollContainer.locator('[data-index="5"]').first().click();
    await page.waitForTimeout(150);

    // Verify items are still visible after selection
    const afterSelectItems = await scrollContainer.locator('[data-index]').count();
    expect(afterSelectItems).toBeGreaterThan(0);

    // Scroll to different position
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 1000;
    });
    await page.waitForTimeout(200);

    // Get the visible items - should still have items rendered (not blank)
    const visibleItems = await scrollContainer.locator('[data-index]').count();
    expect(visibleItems).toBeGreaterThan(0);

    // Continue scrolling in different directions
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 500;
    });
    await page.waitForTimeout(100);
    expect(await scrollContainer.locator('[data-index]').count()).toBeGreaterThan(0);

    await scrollContainer.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(100);
    expect(await scrollContainer.locator('[data-index]').count()).toBeGreaterThan(0);
  });

  test("rapid scrolling after selection should not cause blank screen", async ({ page }) => {
    // Wait for items to be rendered
    await page.waitForSelector('[data-index="0"]', { timeout: 10000 });

    const scrollContainer = await getFirstLogViewerScrollContainer(page);

    // Select an item
    await scrollContainer.locator('[data-index="3"]').first().click();

    // Rapid scroll
    for (const scrollTop of [200, 500, 1000, 2000, 3000]) {
      await scrollContainer.evaluate((el, top) => {
        el.scrollTop = top;
      }, scrollTop);
      await page.waitForTimeout(100);

      // Verify items are visible at each scroll position
      const itemCount = await scrollContainer.locator('[data-index]').count();
      expect(itemCount, `Should have visible items at scrollTop=${scrollTop}`).toBeGreaterThan(0);
    }
  });

  test("scroll position should remain stable after selection", async ({ page }) => {
    // Wait for items to be rendered
    await page.waitForSelector('[data-index="0"]', { timeout: 10000 });

    const scrollContainer = await getFirstLogViewerScrollContainer(page);

    // First, scroll down to a specific position
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 800;
    });
    await page.waitForTimeout(200);

    // Record the visible indices before selection
    const itemsBeforeClick = await scrollContainer.locator('[data-index]').all();
    expect(itemsBeforeClick.length).toBeGreaterThan(0);

    // Click an item (this should auto-scroll if item is not visible)
    const middleItem = itemsBeforeClick[Math.floor(itemsBeforeClick.length / 2)];
    await middleItem.click();
    await page.waitForTimeout(100);

    // Scroll slightly
    await scrollContainer.evaluate((el) => {
      el.scrollTop += 100;
    });
    await page.waitForTimeout(200);

    // Should still have items rendered
    const itemsAfterScroll = await scrollContainer.locator('[data-index]').count();
    expect(itemsAfterScroll).toBeGreaterThan(0);

    // Verify items are positioned correctly (transforms should match scroll position)
    const firstItem = scrollContainer.locator('[data-index]').first();
    const transform = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transform).not.toBe("none");
  });
});
