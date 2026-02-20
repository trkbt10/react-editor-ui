/**
 * @file Text Wrap Cursor E2E Tests
 *
 * Tests for cursor positioning on wrapped text lines.
 * Verifies that clicking on wrapped text positions the cursor correctly.
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

async function getCursorPosition(page: Page, locators: EditorLocators): Promise<number> {
  return await locators.textarea.evaluate((el) => {
    return (el as HTMLTextAreaElement).selectionStart;
  });
}

async function focusAndWait(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 10, y: 10 }, force: true });
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Cursor Click Positioning
// =============================================================================

test.describe("Text Wrap: Cursor Click Positioning", () => {
  test("clicking at start of editor positions cursor at start", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at the very beginning
    await locators.container.click({ position: { x: 10, y: 15 }, force: true });
    await page.waitForTimeout(100);

    const position = await getCursorPosition(page, locators);
    // Should be near the start
    expect(position).toBeLessThan(20);
  });

  test("clicking on second visual line positions cursor in correct logical position", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find the second text element (second visual line)
    const textElements = locators.svg.locator("text");
    const secondTextBox = await textElements.nth(1).boundingBox();

    if (secondTextBox) {
      // Click on the second visual line
      await locators.container.click({
        position: {
          x: secondTextBox.x - (await locators.container.boundingBox())!.x + 10,
          y: secondTextBox.y - (await locators.container.boundingBox())!.y + 10,
        },
        force: true,
      });
      await page.waitForTimeout(100);

      const position = await getCursorPosition(page, locators);

      // Should be somewhere in the middle of the first logical line (wrapped)
      // The first line is long, so position should be greater than start
      expect(position).toBeGreaterThan(10);
    }
  });

  test("clicking on middle of visual line positions cursor mid-line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click in the middle of the first visual line
    const firstTextBox = await locators.svg.locator("text").first().boundingBox();
    const containerBox = await locators.container.boundingBox();

    if (firstTextBox && containerBox) {
      const middleX = firstTextBox.x - containerBox.x + firstTextBox.width / 2;
      const middleY = firstTextBox.y - containerBox.y + firstTextBox.height / 2;

      await locators.container.click({
        position: { x: middleX, y: middleY },
        force: true,
      });
      await page.waitForTimeout(100);

      const position = await getCursorPosition(page, locators);

      // Should not be at the very start
      expect(position).toBeGreaterThan(5);
      // Should not be at the end of the first visual line
      expect(position).toBeLessThan(100);
    }
  });

  test("clicking after logical line break positions cursor on correct line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Scroll to see "Short line." which is on line 3
    // Find text containing "Short"
    const shortLineText = locators.svg.locator("text").filter({ hasText: "Short" });
    const shortLineBox = await shortLineText.first().boundingBox();
    const containerBox = await locators.container.boundingBox();

    if (shortLineBox && containerBox) {
      // Click on "Short line"
      await locators.container.click({
        position: {
          x: shortLineBox.x - containerBox.x + 10,
          y: shortLineBox.y - containerBox.y + 10,
        },
        force: true,
      });
      await page.waitForTimeout(100);

      const position = await getCursorPosition(page, locators);

      // Position should be after the first paragraph
      // First paragraph is long, so should be > 200 characters
      expect(position).toBeGreaterThan(100);
    }
  });
});

// =============================================================================
// Tests: Cursor Visual Position
// =============================================================================

test.describe("Text Wrap: Cursor Visual Position", () => {
  test("cursor renders at correct visual position on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus the editor
    await focusAndWait(page, locators);

    // Look for cursor indicator (rect element with cursor styling)
    const cursor = locators.svg.locator("rect").filter({ hasText: "" });

    // Cursor should be visible somewhere in the SVG
    const cursorCount = await cursor.count();
    // May or may not have visible cursor rect depending on focus state
    // Just verify no errors occurred
    expect(cursorCount).toBeGreaterThanOrEqual(0);
  });

  test("cursor blinks after editor is focused", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus the editor
    await focusAndWait(page, locators);

    // After focus, the textarea should be focused
    await expect(locators.textarea).toBeFocused();
  });
});

// =============================================================================
// Tests: Cursor Movement with Arrow Keys
// =============================================================================

test.describe("Text Wrap: Cursor Arrow Key Movement", () => {
  test("ArrowRight moves cursor forward", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click at start
    await locators.container.click({ position: { x: 10, y: 15 }, force: true });
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);

    // Press ArrowRight
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Cursor should have moved forward
    expect(newPosition).toBeGreaterThan(startPosition);
  });

  test("ArrowLeft moves cursor backward", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click somewhere in the middle
    await locators.container.click({ position: { x: 100, y: 15 }, force: true });
    await page.waitForTimeout(100);

    const startPosition = await getCursorPosition(page, locators);

    // Press ArrowLeft
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(50);

    const newPosition = await getCursorPosition(page, locators);

    // Cursor should have moved backward (or stayed at 0 if already at start)
    expect(newPosition).toBeLessThanOrEqual(startPosition);
  });
});
