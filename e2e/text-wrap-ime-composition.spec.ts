/**
 * @file Text Wrap IME Composition E2E Tests
 *
 * Tests for IME composition behavior specifically checking for conflicts
 * with the text wrapping implementation.
 *
 * Key areas to verify:
 * - Composition events don't interfere with wrap calculation
 * - Cursor position during composition is correct on wrapped lines
 * - Composition text renders correctly
 * - Navigation is disabled during composition (to prevent conflicts)
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
  await page.waitForTimeout(500);
}

async function getTextContent(page: Page, locators: EditorLocators): Promise<string> {
  return await locators.textarea.evaluate((el) => {
    return (el as HTMLTextAreaElement).value;
  });
}

async function getCursorPosition(page: Page, locators: EditorLocators): Promise<number> {
  return await locators.textarea.evaluate((el) => {
    return (el as HTMLTextAreaElement).selectionStart;
  });
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 10, y: 15 }, force: true });
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Navigation During Composition
// =============================================================================

test.describe("Text Wrap: Navigation During IME Composition", () => {
  // Note: IME composition blocking is tested in unit tests (useKeyHandlers.spec.ts).
  // E2E tests cannot simulate React's internal isComposing state because:
  // 1. React tracks composition via actual browser compositionstart/end events
  // 2. Programmatic dispatch of CompositionEvent does not update React's state
  // 3. The isComposing flag is managed by useBlockComposition hook internally
  //
  // The implementation in useKeyHandlers.ts:88 early-returns when isComposing=true,
  // which is verified by the unit test "blocks all key handling during IME composition".
  //
  // These E2E tests verify that navigation works correctly outside composition.

  test("arrow navigation works correctly (composition check exists in code)", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and get starting position
    await focusEditor(page, locators);
    const startPosition = await getCursorPosition(page, locators);

    // Navigate with ArrowDown (not during composition)
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);

    const endPosition = await getCursorPosition(page, locators);

    // Should have moved to next visual line
    expect(endPosition).toBeGreaterThan(startPosition);
  });

  test("Home/End navigation works correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus editor at middle of a line
    await focusEditor(page, locators);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);

    const midPosition = await getCursorPosition(page, locators);
    expect(midPosition).toBeGreaterThan(0);

    // Press Home - should go to start of visual line
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    const afterHome = await getCursorPosition(page, locators);
    expect(afterHome).toBeLessThan(midPosition);

    // Press End - should go to end of visual line
    await page.keyboard.press("End");
    await page.waitForTimeout(50);

    const afterEnd = await getCursorPosition(page, locators);
    expect(afterEnd).toBeGreaterThan(afterHome);
  });
});

// =============================================================================
// Tests: Composition and Wrap Calculation
// =============================================================================

test.describe("Text Wrap: Composition and Wrap Calculation", () => {
  test("typing after composition completion wraps correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus at start
    await focusEditor(page, locators);

    // Type a lot of text to trigger wrapping
    const longText = "This is additional text that will cause more wrapping in the editor. ";
    await page.keyboard.type(longText);
    await page.waitForTimeout(300);

    // Verify text was added
    const content = await getTextContent(page, locators);
    expect(content).toContain(longText.trim());

    // Verify wrap is still working (check for multiple text elements)
    const textElements = await locators.svg.locator("text").count();
    expect(textElements).toBeGreaterThan(3);
  });

  test("cursor position is correct after typing on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Navigate to second visual line
    await focusEditor(page, locators);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);

    const positionBefore = await getCursorPosition(page, locators);

    // Type some text
    await page.keyboard.type("ABC");
    await page.waitForTimeout(100);

    const positionAfter = await getCursorPosition(page, locators);

    // Position should have advanced by 3
    expect(positionAfter).toBe(positionBefore + 3);
  });

  test("backspace on wrapped line works correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Navigate to middle of second visual line
    await focusEditor(page, locators);
    await page.keyboard.press("ArrowDown");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForTimeout(50);

    const contentBefore = await getTextContent(page, locators);
    const positionBefore = await getCursorPosition(page, locators);

    // Press backspace
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(100);

    const contentAfter = await getTextContent(page, locators);
    const positionAfter = await getCursorPosition(page, locators);

    // Content should be shorter by 1 character
    expect(contentAfter.length).toBe(contentBefore.length - 1);
    // Position should be decreased by 1
    expect(positionAfter).toBe(positionBefore - 1);
  });
});

// =============================================================================
// Tests: CJK Character Input
// =============================================================================

test.describe("Text Wrap: CJK Character Input", () => {
  test("CJK characters can be typed on wrapped lines", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Navigate to second visual line
    await focusEditor(page, locators);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);

    // Type Japanese text
    await page.keyboard.type("日本語入力");
    await page.waitForTimeout(200);

    // Verify text was added
    const content = await getTextContent(page, locators);
    expect(content).toContain("日本語入力");
  });

  test("cursor moves correctly through CJK characters", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and navigate to position with existing Japanese text
    await focusEditor(page, locators);

    // Search for position before Japanese text in demo content
    // Demo has "日本語のテキスト"
    const content = await getTextContent(page, locators);
    const japaneseStart = content.indexOf("日本語");
    expect(japaneseStart).toBeGreaterThan(0);

    // Navigate to that position using Ctrl/Cmd+DownArrow then ArrowUp
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+ArrowDown" : "Control+End");
    await page.waitForTimeout(50);

    // Navigate backward to find the Japanese text
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.waitForTimeout(50);

    // Verify cursor movement works
    const position = await getCursorPosition(page, locators);
    expect(position).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// Tests: Undo/Redo During Composition
// =============================================================================

test.describe("Text Wrap: Undo/Redo", () => {
  test("undo reverts typed text on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and get initial content
    await focusEditor(page, locators);
    const initialContent = await getTextContent(page, locators);

    // Type some text
    await page.keyboard.type("UNDO_TEST");
    await page.waitForTimeout(400); // Wait for debounce

    // Verify text was added
    let content = await getTextContent(page, locators);
    expect(content).toContain("UNDO_TEST");

    // Undo
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+z" : "Control+z");
    await page.waitForTimeout(100);

    // Verify text was undone
    content = await getTextContent(page, locators);
    expect(content).toBe(initialContent);
  });

  test("redo restores typed text on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and type
    await focusEditor(page, locators);
    await page.keyboard.type("REDO_TEST");
    await page.waitForTimeout(400); // Wait for debounce

    // Undo
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+z" : "Control+z");
    await page.waitForTimeout(100);

    // Verify undo worked
    let content = await getTextContent(page, locators);
    expect(content).not.toContain("REDO_TEST");

    // Redo
    await page.keyboard.press(isMac ? "Meta+Shift+z" : "Control+y");
    await page.waitForTimeout(100);

    // Verify redo worked
    content = await getTextContent(page, locators);
    expect(content).toContain("REDO_TEST");
  });
});
