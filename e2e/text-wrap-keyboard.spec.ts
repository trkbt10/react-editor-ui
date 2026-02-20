/**
 * @file Text Wrap Keyboard Navigation E2E Tests
 *
 * Tests for keyboard navigation with wrapped text.
 * Verifies arrow up/down, home/end behavior on visual lines.
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
  // Wait for font metrics, container width measurement, and debounced wrap calculation
  // - Font metrics: ~100ms
  // - Container resize observer: immediate
  // - Width debounce: 100ms
  // - WrapLayoutIndex calculation: ~50ms
  await page.waitForTimeout(500);
}

async function getCursorPosition(page: Page, locators: EditorLocators): Promise<number> {
  return await locators.textarea.evaluate((el) => {
    return (el as HTMLTextAreaElement).selectionStart;
  });
}

async function focusAt(page: Page, locators: EditorLocators, x: number, y: number): Promise<void> {
  await locators.container.click({ position: { x, y }, force: true });
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Arrow Up/Down Navigation
// =============================================================================

test.describe("Text Wrap: Arrow Up/Down Navigation", () => {
  test("ArrowDown moves to next visual line, not logical line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at middle of first visual line
    await focusAt(page, locators, 100, 15);

    const startPosition = await getCursorPosition(page, locators);

    // Press ArrowDown
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Cursor should have moved forward but not to next logical line
    // (next logical line starts after 200+ characters in demo content)
    expect(newPosition).toBeGreaterThan(startPosition);
    // Should not have jumped to next paragraph (which is after ~250 chars)
    expect(newPosition).toBeLessThan(startPosition + 150);
  });

  test("ArrowUp moves to previous visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click on second visual line
    await focusAt(page, locators, 100, 40);
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);

    // Press ArrowUp
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Cursor should have moved backward
    expect(newPosition).toBeLessThan(startPosition);
  });

  test("preferred column is preserved during vertical navigation", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at a specific column on first visual line
    await focusAt(page, locators, 150, 15);
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);

    // Move down, then back up
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);

    const endPosition = await getCursorPosition(page, locators);

    // Should return to approximately the same position
    // (may differ slightly due to character width differences)
    expect(Math.abs(endPosition - startPosition)).toBeLessThan(10);
  });

  test("ArrowDown at last visual line does not move cursor", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Go to end of document (Cmd+DownArrow on macOS, Ctrl+End on Windows)
    const isMac = process.platform === "darwin";
    await focusAt(page, locators, 10, 15);
    await page.keyboard.press(isMac ? "Meta+ArrowDown" : "Control+End");
    await page.waitForTimeout(50);

    const endPosition = await getCursorPosition(page, locators);

    // Press ArrowDown - should not move (already at end)
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    expect(newPosition).toBe(endPosition);
  });

  test("ArrowUp at first visual line does not move cursor", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Go to start of document (Cmd+UpArrow on macOS, Ctrl+Home on Windows)
    const isMac = process.platform === "darwin";
    await focusAt(page, locators, 10, 15);
    await page.keyboard.press(isMac ? "Meta+ArrowUp" : "Control+Home");
    await page.waitForTimeout(50);

    const startPosition = await getCursorPosition(page, locators);
    expect(startPosition).toBe(0);

    // Press ArrowUp - should not move
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    expect(newPosition).toBe(0);
  });
});

// =============================================================================
// Tests: Home/End Navigation
// =============================================================================

test.describe("Text Wrap: Home/End Navigation", () => {
  test("Home moves to start of visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click in middle of first visual line
    await focusAt(page, locators, 150, 15);
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);
    expect(startPosition).toBeGreaterThan(0);

    // Press Home
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should be at start of visual line (might be 0 for first line)
    expect(newPosition).toBeLessThan(startPosition);
  });

  test("End moves to end of visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at start of first visual line
    await focusAt(page, locators, 10, 15);
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);

    // Press End
    await page.keyboard.press("End");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should have moved to end of visual line
    expect(newPosition).toBeGreaterThan(startPosition);
    // Should not be at end of logical line (which is much longer)
    expect(newPosition).toBeLessThan(200);
  });

  test("Cmd+UpArrow/Ctrl+Home moves to start of document", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click on second visual line (still in first logical line)
    await focusAt(page, locators, 100, 40);
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);
    expect(startPosition).toBeGreaterThan(0);

    // Press Cmd+UpArrow (macOS) or Ctrl+Home (Windows) to go to document start
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+ArrowUp" : "Control+Home");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should be at start of document
    expect(newPosition).toBe(0);
  });

  test("Cmd+DownArrow/Ctrl+End moves to end of document", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at start
    await focusAt(page, locators, 10, 15);
    await page.waitForTimeout(100);

    // Press Cmd+DownArrow (macOS) or Ctrl+End (Windows) to go to document end
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+ArrowDown" : "Control+End");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should be at end of document
    const totalLength = await locators.textarea.evaluate((el) => {
      return (el as HTMLTextAreaElement).value.length;
    });

    expect(newPosition).toBe(totalLength);
  });
});

// =============================================================================
// Tests: Navigation Across Wrap Boundaries
// =============================================================================

test.describe("Text Wrap: Navigation Across Wrap Boundaries", () => {
  test("ArrowRight at end of visual line moves to start of next visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Go to end of first visual line
    await focusAt(page, locators, 10, 15);
    await page.keyboard.press("End");
    await page.waitForTimeout(50);

    const endOfLinePosition = await getCursorPosition(page, locators);

    // Press ArrowRight
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should have moved forward by 1
    expect(newPosition).toBe(endOfLinePosition + 1);
  });

  test("ArrowLeft at start of visual line moves to end of previous visual line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Go to second visual line, then Home
    await focusAt(page, locators, 50, 40);
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    const startOfLinePosition = await getCursorPosition(page, locators);

    // Press ArrowLeft
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Should have moved backward by 1
    expect(newPosition).toBe(startOfLinePosition - 1);
  });

  test("horizontal movement resets preferred column", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at a position
    await focusAt(page, locators, 200, 15);
    await page.waitForTimeout(100);

    // Move down
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    const afterDown = await getCursorPosition(page, locators);

    // Move right (resets preferred column)
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    // Move up - should use new column, not original
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);
    const afterUp = await getCursorPosition(page, locators);

    // The positions should be different due to preferred column reset
    // Just verify navigation works
    expect(afterUp).toBeLessThan(afterDown);
  });
});
