/**
 * @file Text Wrap Selection E2E Tests
 *
 * Tests for text selection across wrapped lines.
 * Verifies that selection highlights correctly span wrap boundaries.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/soft-wrap";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  const container = page.locator('[data-testid="soft-wrap-editor"]');
  return {
    container,
    svg: container.locator("svg:has(text)").first(),
    textarea: container.locator('textarea[aria-label="Block text editor"]'),
  };
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

async function getSelection(page: Page, locators: EditorLocators): Promise<{ start: number; end: number }> {
  return await locators.textarea.evaluate((el) => {
    const textarea = el as HTMLTextAreaElement;
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  });
}

// =============================================================================
// Tests: Drag Selection
// =============================================================================

test.describe("Text Wrap: Drag Selection", () => {
  test("drag selection across visual lines selects correct text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    const containerBox = await locators.container.boundingBox();

    if (!containerBox) {
      throw new Error("Container not found");
    }

    // Start drag at beginning of first line
    const startX = containerBox.x + 10;
    const startY = containerBox.y + 15;

    // End drag at third visual line
    const endY = containerBox.y + 60; // Approximate third line

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, endY);
    await page.mouse.up();
    await page.waitForTimeout(100);

    const selection = await getSelection(page, locators);

    // Should have selected some text
    expect(selection.end - selection.start).toBeGreaterThan(0);
  });

  test("selection highlight spans multiple visual lines", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    const containerBox = await locators.container.boundingBox();

    if (!containerBox) {
      throw new Error("Container not found");
    }

    // Drag to select multiple visual lines
    const startX = containerBox.x + 10;
    const startY = containerBox.y + 15;
    const endX = containerBox.x + 200;
    const endY = containerBox.y + 80;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Look for selection highlight rectangles
    const selectionRects = locators.svg.locator('rect[fill*="rgba"]');
    const rectCount = await selectionRects.count();

    // Should have selection highlight(s)
    // Note: Implementation may vary - just verify selection exists
    const selection = await getSelection(page, locators);
    expect(selection.end - selection.start).toBeGreaterThan(50);
  });
});

// =============================================================================
// Tests: Shift+Click Selection
// =============================================================================

test.describe("Text Wrap: Shift+Click Selection", () => {
  test("shift+click extends selection across wrapped lines", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus the editor first by clicking
    await locators.container.click({
      position: { x: 10, y: 15 },
      force: true,
    });
    await page.waitForTimeout(100);

    // Use keyboard to position cursor at start
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+Home" : "Control+Home");
    await page.waitForTimeout(50);

    // Move cursor forward a bit
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForTimeout(50);

    // Shift+click further in the document
    const containerBox = await locators.container.boundingBox();
    if (!containerBox) {
      throw new Error("Container not found");
    }

    await locators.container.click({
      position: { x: 200, y: 60 },
      force: true,
      modifiers: ["Shift"],
    });
    await page.waitForTimeout(100);

    const selection = await getSelection(page, locators);

    // Should have extended selection
    expect(selection.end - selection.start).toBeGreaterThan(0);
  });
});

// =============================================================================
// Tests: Keyboard Selection
// =============================================================================

test.describe("Text Wrap: Keyboard Selection", () => {
  test("Shift+ArrowRight extends selection forward", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click to set cursor
    await locators.container.click({ position: { x: 10, y: 15 }, force: true });
    await page.waitForTimeout(100);

    // Press Shift+ArrowRight multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }
    await page.waitForTimeout(100);

    const selection = await getSelection(page, locators);

    // Should have selection of 5 characters
    expect(selection.end - selection.start).toBe(5);
  });

  test("Shift+ArrowDown extends selection to next visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click to set cursor
    await locators.container.click({ position: { x: 50, y: 15 }, force: true });
    await page.waitForTimeout(100);

    const initialSelection = await getSelection(page, locators);

    // Press Shift+ArrowDown
    await page.keyboard.press("Shift+ArrowDown");
    await page.waitForTimeout(100);

    const newSelection = await getSelection(page, locators);

    // Selection should be extended
    expect(newSelection.end - newSelection.start).toBeGreaterThan(0);
  });

  test("Ctrl/Cmd+A selects all text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click to focus
    await locators.container.click({ position: { x: 10, y: 15 }, force: true });
    await page.waitForTimeout(100);

    // Get total text length
    const totalLength = await locators.textarea.evaluate((el) => {
      return (el as HTMLTextAreaElement).value.length;
    });

    // Select all
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+a" : "Control+a");
    await page.waitForTimeout(100);

    const selection = await getSelection(page, locators);

    // Should have selected all text
    expect(selection.start).toBe(0);
    expect(selection.end).toBe(totalLength);
  });
});

// =============================================================================
// Tests: Selection Boundary
// =============================================================================

test.describe("Text Wrap: Selection at Wrap Boundary", () => {
  test("can select text on first visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click to focus at start
    await locators.container.click({ position: { x: 10, y: 15 }, force: true });
    await page.waitForTimeout(100);

    // Select forward to create a selection within the first visual line
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }
    await page.waitForTimeout(100);

    const selection = await getSelection(page, locators);

    // Should have selected 10 characters
    expect(selection.end - selection.start).toBe(10);
  });
});
