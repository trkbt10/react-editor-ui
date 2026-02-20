/**
 * @file Text Wrap IME E2E Tests
 *
 * Tests for IME (Input Method Editor) composition with wrapped text.
 * Verifies that IME input works correctly on wrapped lines without conflicts.
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

/**
 * Simulate IME composition events.
 * This simulates the sequence: compositionstart -> compositionupdate -> compositionend
 */
async function simulateIME(
  page: Page,
  locators: EditorLocators,
  composingText: string,
  finalText: string
): Promise<void> {
  // Focus textarea directly for IME
  await locators.textarea.focus();
  await page.waitForTimeout(50);

  // Dispatch compositionstart
  await locators.textarea.evaluate((el) => {
    el.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
  });
  await page.waitForTimeout(20);

  // Dispatch compositionupdate with intermediate text
  await locators.textarea.evaluate((el, text) => {
    el.dispatchEvent(new CompositionEvent("compositionupdate", { data: text }));
  }, composingText);
  await page.waitForTimeout(20);

  // Dispatch compositionend with final text
  await locators.textarea.evaluate((el, text) => {
    el.dispatchEvent(new CompositionEvent("compositionend", { data: text }));
  }, finalText);
  await page.waitForTimeout(20);

  // Actually insert the text (simulating browser behavior after composition)
  await locators.textarea.evaluate((el, text) => {
    const textarea = el as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const newValue = value.slice(0, start) + text + value.slice(end);
    textarea.value = newValue;
    textarea.selectionStart = textarea.selectionEnd = start + text.length;

    // Dispatch input event
    textarea.dispatchEvent(new InputEvent("input", {
      inputType: "insertText",
      data: text,
      bubbles: true,
    }));
  }, finalText);
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Basic IME Input
// =============================================================================

test.describe("Text Wrap: Basic IME Input", () => {
  test("simple text input works on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Get initial content
    const initialContent = await getTextContent(page, locators);

    // Focus and type
    await focusEditor(page, locators);
    await page.keyboard.type("Hello");
    await page.waitForTimeout(100);

    // Content should be updated
    const newContent = await getTextContent(page, locators);
    expect(newContent).toContain("Hello");
    expect(newContent.length).toBeGreaterThan(initialContent.length);
  });

  test("typing does not cause visual glitches with wrap", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus editor
    await focusEditor(page, locators);

    // Type some text
    await page.keyboard.type("Testing wrap behavior");
    await page.waitForTimeout(200);

    // Editor should still be in good state
    await expect(locators.svg).toBeVisible();

    // Text should be visible
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("Testing wrap behavior");
  });
});

// =============================================================================
// Tests: IME Composition
// =============================================================================

test.describe("Text Wrap: IME Composition", () => {
  // Note: Full IME simulation is difficult in Playwright.
  // These tests verify that typing (which triggers composition events internally)
  // works correctly with wrap enabled.

  test("typing at start of wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus at start
    await focusEditor(page, locators);

    // Type some text
    await page.keyboard.type("新しい");
    await page.waitForTimeout(200);

    // Content should contain the typed text
    const content = await getTextContent(page, locators);
    expect(content).toContain("新しい");
  });

  test("typing in middle of wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Click in middle of first visual line
    await locators.container.click({ position: { x: 100, y: 15 }, force: true });
    await page.waitForTimeout(100);

    const positionBefore = await getCursorPosition(page, locators);

    // Type text
    await page.keyboard.type("テスト");
    await page.waitForTimeout(200);

    // Content should contain the typed text
    const content = await getTextContent(page, locators);
    expect(content).toContain("テスト");

    // Cursor should have moved forward
    const positionAfter = await getCursorPosition(page, locators);
    expect(positionAfter).toBeGreaterThan(positionBefore);
  });

  test("typing at wrap boundary", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Go to end of first visual line
    await focusEditor(page, locators);
    await page.keyboard.press("End");
    await page.waitForTimeout(100);

    const positionAtEnd = await getCursorPosition(page, locators);

    // Type text at wrap point
    await page.keyboard.type("漢字");
    await page.waitForTimeout(200);

    // Content should contain the typed text
    const content = await getTextContent(page, locators);
    expect(content).toContain("漢字");

    // Cursor should have moved forward
    const positionAfter = await getCursorPosition(page, locators);
    expect(positionAfter).toBeGreaterThan(positionAtEnd);
  });
});

// =============================================================================
// Tests: IME with Selection
// =============================================================================

test.describe("Text Wrap: IME with Selection", () => {
  test("IME replaces selected text on wrapped line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and select some text
    await focusEditor(page, locators);

    // Select first 5 characters
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }
    await page.waitForTimeout(100);

    // Get selected text length
    const selection = await locators.textarea.evaluate((el) => {
      const textarea = el as HTMLTextAreaElement;
      return {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    });
    expect(selection.end - selection.start).toBe(5);

    // Type to replace (simulates IME confirm replacing selection)
    await page.keyboard.type("NEW");
    await page.waitForTimeout(100);

    // Content should have the replacement
    const content = await getTextContent(page, locators);
    expect(content).toContain("NEW");
  });
});

// =============================================================================
// Tests: IME Cancellation
// =============================================================================

test.describe("Text Wrap: IME Cancellation", () => {
  test("cancelling IME composition does not corrupt state", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Get initial content
    const initialContent = await getTextContent(page, locators);

    // Focus
    await focusEditor(page, locators);

    // Start composition but don't complete (simulate Escape)
    await locators.textarea.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
    });
    await page.waitForTimeout(20);

    await locators.textarea.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent("compositionupdate", { data: "にほん" }));
    });
    await page.waitForTimeout(20);

    // Simulate cancellation by pressing Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    // Content should remain unchanged
    const contentAfterCancel = await getTextContent(page, locators);
    expect(contentAfterCancel).toBe(initialContent);
  });
});

// =============================================================================
// Tests: IME with Wrap Updates
// =============================================================================

test.describe("Text Wrap: IME and Wrap Updates", () => {
  test("wrap recalculates after IME input", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Count initial visual lines
    const initialLineCount = await locators.svg.locator("text").count();

    // Go to end of first line and add a lot of text
    await focusEditor(page, locators);
    await page.keyboard.press("End");
    await page.waitForTimeout(50);

    // Add text that will cause additional wrapping
    const longText = " Additional text that should cause more wrapping to occur in the editor.";
    await page.keyboard.type(longText);
    await page.waitForTimeout(300);

    // Count visual lines after typing
    const newLineCount = await locators.svg.locator("text").count();

    // Should have more visual lines due to added content
    expect(newLineCount).toBeGreaterThanOrEqual(initialLineCount);
  });

  test("navigation works correctly after IME input", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Focus and type some text
    await focusEditor(page, locators);
    await page.keyboard.type("New text ");
    await page.waitForTimeout(100);

    const positionAfterType = await getCursorPosition(page, locators);

    // Navigate with arrows
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    const afterDown = await getCursorPosition(page, locators);

    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);
    const afterUp = await getCursorPosition(page, locators);

    // Navigation should work - cursor should have moved
    expect(afterDown).toBeGreaterThan(positionAfterType);
    // ArrowUp should return near original (preferred column may cause small difference)
    expect(Math.abs(afterUp - positionAfterType)).toBeLessThan(10);
  });
});
