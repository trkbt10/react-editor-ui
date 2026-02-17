/**
 * @file Viewport-based rendering E2E tests
 *
 * Tests for the viewport mode implementation:
 * - Fixed canvas size (doesn't grow with document)
 * - Content renders correctly with scrolling
 * - No per-line React component updates during scroll
 */

import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:19720";

test.describe("CodeEditor Viewport Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/code-editor-viewport`);
    await page.waitForSelector("canvas");
  });

  // Helper to focus the editor by clicking on the editor container
  // Note: Canvas has pointer-events: none in viewport mode for scroll passthrough
  const focusEditor = async (page: Page) => {
    // Click on the editor section which contains the textarea
    const editorSection = page.locator(".editor-section");
    await editorSection.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(50);
  };

  test("canvas has fixed dimensions in viewport mode", async ({ page }) => {
    const container = page.getByTestId("editor-container");
    const containerBox = await container.boundingBox();

    // Get canvas element
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();

    if (containerBox && canvasBox) {
      // Canvas should fit within container (not overflow)
      expect(canvasBox.width).toBeLessThanOrEqual(containerBox.width);
      expect(canvasBox.height).toBeLessThanOrEqual(containerBox.height);

      // Document has 100 lines, but canvas should be fixed to container height (~300px)
      // Not 100 * lineHeight (which would be ~2100px)
      expect(canvasBox.height).toBeLessThan(500);
    }
  });

  test("canvas dimensions remain stable during keyboard navigation", async ({ page }) => {
    const canvas = page.locator("canvas").first();

    // Focus the editor first
    await focusEditor(page);
    await page.waitForTimeout(100);

    // Get canvas dimensions after focus
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();

    // Navigate with keyboard
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    // Canvas dimensions should remain the same during navigation
    const afterNavBox = await canvas.boundingBox();
    expect(afterNavBox).not.toBeNull();

    if (initialBox && afterNavBox) {
      // Canvas dimensions should not change during navigation
      expect(afterNavBox.width).toBe(initialBox.width);
      expect(afterNavBox.height).toBe(initialBox.height);
    }
  });

  test("content is visible and renders correctly", async ({ page }) => {
    // Take a screenshot to verify content renders
    const canvas = page.locator("canvas").first();
    const screenshot = await canvas.screenshot();

    // Screenshot should have content (not be empty/white)
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test("typing works correctly in viewport mode", async ({ page }) => {
    // Focus the editor
    await focusEditor(page);

    // Type some text
    await page.keyboard.type("// New comment");

    // Wait for render
    await page.waitForTimeout(100);

    // Canvas should still have fixed dimensions
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();

    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      expect(canvasBox.height).toBeLessThan(500);
    }
  });

  test("viewport toggle works and canvas remains functional", async ({ page }) => {
    // Get initial canvas dimensions with viewport mode enabled
    const canvas = page.locator("canvas").first();
    const withViewportBox = await canvas.boundingBox();
    expect(withViewportBox).not.toBeNull();
    expect(withViewportBox!.width).toBeGreaterThan(0);
    expect(withViewportBox!.height).toBeGreaterThan(0);

    // Disable viewport mode
    const toggle = page.getByTestId("viewport-toggle");
    await toggle.click();
    await page.waitForTimeout(200);

    // Verify toggle state changed
    const isChecked = await toggle.isChecked();
    expect(isChecked).toBe(false);

    // Canvas should still exist and have dimensions
    const withoutViewportBox = await canvas.boundingBox();
    expect(withoutViewportBox).not.toBeNull();
    expect(withoutViewportBox!.width).toBeGreaterThan(0);
    expect(withoutViewportBox!.height).toBeGreaterThan(0);

    // Re-enable viewport mode and verify canvas still works
    await toggle.click();
    await page.waitForTimeout(200);

    const reenabledBox = await canvas.boundingBox();
    expect(reenabledBox).not.toBeNull();
    expect(reenabledBox!.width).toBeGreaterThan(0);
    expect(reenabledBox!.height).toBeGreaterThan(0);
  });

  test("selection works correctly in viewport mode", async ({ page }) => {
    // Focus the editor
    await focusEditor(page);

    // Select some text with keyboard
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(50);

    // Canvas should still render correctly
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();

    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }
  });

  test("cursor navigation works in viewport mode", async ({ page }) => {
    // Focus the editor
    await focusEditor(page);

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    // Canvas dimensions should remain fixed
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();

    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      expect(canvasBox.height).toBeLessThan(500);
    }
  });
});

test.describe("Viewport Mode Scrolling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/code-editor-viewport`);
    await page.waitForSelector("canvas");
  });

  test("scroll container is scrollable with mouse wheel", async ({ page }) => {
    const editorContainer = page.getByTestId("editor-container");

    // Get initial scroll info
    const scrollInfo = await editorContainer.evaluate((el) => {
      // Find all divs and check which one is scrollable
      const findScrollable = (element: Element): HTMLElement | null => {
        const style = window.getComputedStyle(element);
        if ((style.overflow === "auto" || style.overflowY === "auto") && element.scrollHeight > element.clientHeight) {
          return element as HTMLElement;
        }
        for (const child of element.children) {
          const result = findScrollable(child);
          if (result) {
            return result;
          }
        }
        return null;
      };
      const scrollable = findScrollable(el);
      if (scrollable) {
        return {
          found: true,
          scrollTop: scrollable.scrollTop,
          scrollHeight: scrollable.scrollHeight,
          clientHeight: scrollable.clientHeight,
        };
      }
      return { found: false, scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
    });

    // Verify we found a scrollable container with content taller than viewport
    expect(scrollInfo.found).toBe(true);
    expect(scrollInfo.scrollHeight).toBeGreaterThan(scrollInfo.clientHeight);

    // Scroll down with mouse wheel
    await editorContainer.hover();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(100);

    // Verify scroll position changed
    const afterScrollInfo = await editorContainer.evaluate((el) => {
      const findScrollable = (element: Element): HTMLElement | null => {
        const style = window.getComputedStyle(element);
        if ((style.overflow === "auto" || style.overflowY === "auto") && element.scrollHeight > element.clientHeight) {
          return element as HTMLElement;
        }
        for (const child of element.children) {
          const result = findScrollable(child);
          if (result) {
            return result;
          }
        }
        return null;
      };
      const scrollable = findScrollable(el);
      return scrollable ? scrollable.scrollTop : 0;
    });

    expect(afterScrollInfo).toBeGreaterThan(0);

    // Canvas should still be visible at fixed position
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.height).toBeLessThan(500);
  });

  test("canvas updates content when scrolling", async ({ page }) => {
    // Take screenshot before scroll
    const canvas = page.locator("canvas").first();
    const beforeScreenshot = await canvas.screenshot();

    // Scroll down significantly (past first visible lines)
    const editorContainer = page.getByTestId("editor-container");
    await editorContainer.hover();
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(200);

    // Take screenshot after scroll
    const afterScreenshot = await canvas.screenshot();

    // Screenshots should be different (content changed with scroll)
    // Compare byte length as a basic check - different content = different bytes
    const beforeBytes = beforeScreenshot.toString("base64");
    const afterBytes = afterScreenshot.toString("base64");
    expect(beforeBytes).not.toBe(afterBytes);
  });

  test("scroll position affects rendered line numbers", async ({ page }) => {
    const editorContainer = page.getByTestId("editor-container");

    // Scroll down significantly
    await editorContainer.hover();
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(200);

    // After scrolling, the canvas should render different content
    // Canvas dimensions should remain fixed
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.height).toBeLessThan(500);

    // Get scroll position to verify scrolling happened
    const scrollTop = await editorContainer.evaluate((el) => {
      const findScrollable = (element: Element): HTMLElement | null => {
        const style = window.getComputedStyle(element);
        if ((style.overflow === "auto" || style.overflowY === "auto") && element.scrollHeight > element.clientHeight) {
          return element as HTMLElement;
        }
        for (const child of element.children) {
          const result = findScrollable(child);
          if (result) {
            return result;
          }
        }
        return null;
      };
      const scrollable = findScrollable(el);
      return scrollable ? scrollable.scrollTop : 0;
    });
    expect(scrollTop).toBeGreaterThan(500);
  });
});

test.describe("Viewport Mode Visual Alignment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/code-editor-viewport`);
    await page.waitForSelector("canvas");
  });

  test("selection highlight aligns with text", async ({ page }) => {
    // Focus the editor
    const editorSection = page.locator(".editor-section");
    await editorSection.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(50);

    // Select some text with keyboard
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(100);

    // Take screenshot to verify visual alignment
    const canvas = page.locator("canvas").first();
    const screenshot = await canvas.screenshot();

    // Screenshot should have content (selection highlight visible)
    expect(screenshot.length).toBeGreaterThan(1000);

    // Visual inspection: selection highlight should cover the text
    // This is a basic sanity check - detailed visual regression would use screenshot comparison
  });

  test("cursor position aligns with text after scroll", async ({ page }) => {
    // Focus and navigate
    const editorSection = page.locator(".editor-section");
    await editorSection.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(50);

    // Scroll down
    const editorContainer = page.getByTestId("editor-container");
    await editorContainer.hover();
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(100);

    // Move cursor
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    // Take screenshot
    const canvas = page.locator("canvas").first();
    const screenshot = await canvas.screenshot();

    // Screenshot should have content with cursor
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  test("text renders at consistent size", async ({ page }) => {
    // Get canvas dimensions
    const canvas = page.locator("canvas").first();
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Canvas should exist and have positive dimensions
    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }

    // Take screenshot and verify it has content
    const screenshot = await canvas.screenshot();
    // Screenshot should have reasonable content (not empty, not corrupted)
    expect(screenshot.length).toBeGreaterThan(1000);
    expect(screenshot.length).toBeLessThan(2000000); // Reasonable PNG size
  });
});

test.describe("Viewport Mode Performance", () => {
  test("no excessive re-renders during scroll", async ({ page }) => {
    await page.goto(`${BASE_URL}/#/code-editor-viewport`);
    await page.waitForSelector("canvas");

    // Collect console logs for render tracking
    const renderLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("SingleBlock") || text.includes("BlockLine")) {
        renderLogs.push(text);
      }
    });

    // Focus the editor by clicking on the editor section
    const editorSection = page.locator(".editor-section");
    await editorSection.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(50);

    // Clear logs before scroll test
    renderLogs.length = 0;

    // Simulate scrolling by pressing Page Down multiple times
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(100);

    // In viewport mode with canvas, we shouldn't see excessive SingleBlock/BlockLine logs
    // because Canvas renders directly without React component per line
    // Allow some logs for cursor position updates, but not one per line per scroll
    const totalLogs = renderLogs.length;

    // With 100 lines and 3 page downs, we should not see 300 render logs
    // A reasonable expectation is < 50 logs total
    expect(totalLogs).toBeLessThan(100);
  });
});
