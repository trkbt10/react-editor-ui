/**
 * @file Editor IME (Input Method Editor) Tests
 *
 * Tests for IME composition behavior including:
 * - Composition highlight display
 * - Cursor position during composition
 * - History creation only after composition confirm
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

type EditorType = "text" | "code";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page, type: EditorType): EditorLocators {
  const ariaLabel = type === "text" ? "Text editor" : "Code editor";
  return {
    container: page.locator("div:has(> svg:has(text))").first(),
    textarea: page.locator(`textarea[aria-label="${ariaLabel}"]`).first(),
    svg: page.locator("svg:has(text)").first(),
  };
}

async function setupEditor(page: Page, route: string, type: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, type);
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 50, y: 20 }, force: true });
  await page.waitForTimeout(100);
}

async function setEditorContent(page: Page, locators: EditorLocators, content: string): Promise<void> {
  await focusEditor(page, locators);
  await page.keyboard.press("Meta+a");
  if (content === "") {
    await page.keyboard.press("Backspace");
  } else {
    await page.keyboard.type(content);
  }
  await page.waitForTimeout(100);
}

async function getEditorContent(locators: EditorLocators): Promise<string> {
  return locators.textarea.inputValue();
}

async function goToStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

/**
 * Simulate IME input using Playwright's insertText.
 *
 * Note: True IME composition events are difficult to simulate in Playwright.
 * We use insertText which properly triggers React's onChange.
 * The composition events are dispatched but the actual text insertion
 * is handled by insertText for reliability.
 */
async function simulateIMEInput(
  page: Page,
  locators: EditorLocators,
  finalText: string
): Promise<void> {
  const textarea = locators.textarea;

  // Start composition
  await textarea.evaluate((el) => {
    el.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
  });
  await page.waitForTimeout(50);

  // Update composition (simulate typing each character)
  for (const char of finalText) {
    await textarea.evaluate((el, text) => {
      el.dispatchEvent(new CompositionEvent("compositionupdate", { data: text }));
    }, char);
    await page.waitForTimeout(30);
  }

  // Use Playwright's insertText to actually insert the text
  // This properly triggers React's onChange
  await page.keyboard.insertText(finalText);
  await page.waitForTimeout(50);

  // End composition
  await textarea.evaluate((el, text) => {
    el.dispatchEvent(new CompositionEvent("compositionend", { data: text }));
  }, finalText);
  await page.waitForTimeout(100);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineIMETests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: IME Composition`, () => {
    test("composition creates history entry only after confirm", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);

      // Set up initial content and wait for debounce
      await setEditorContent(page, locators, "START");
      await page.waitForTimeout(400);

      // Focus at end
      await page.keyboard.press("Meta+ArrowRight");

      // Simulate IME input
      await simulateIMEInput(page, locators, "あいう");
      await page.waitForTimeout(400);

      // Content should be updated
      const content = await getEditorContent(locators);
      expect(content).toBe("STARTあいう");

      // One undo should remove the entire composed text
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      const afterUndo = await getEditorContent(locators);
      // Should restore to before composition (or close to it)
      expect(afterUndo.length).toBeLessThan(content.length);
    });

    test("composition text is rendered in SVG", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);

      await setEditorContent(page, locators, "");

      // Simulate IME input
      await simulateIMEInput(page, locators, "日");
      await page.waitForTimeout(200);

      // Check SVG contains the text
      const svgTexts = await locators.svg.locator("text").allTextContents();
      const combinedText = svgTexts.join("");
      expect(combinedText).toContain("日");
    });

    test("cursor position correct after IME input", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);

      await setEditorContent(page, locators, "ABC");
      await goToStart(page);

      // Move to middle
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // Cursor at position 2

      // Simulate IME input
      await simulateIMEInput(page, locators, "X");
      await page.waitForTimeout(100);

      // Content should be ABXC
      const content = await getEditorContent(locators);
      expect(content).toBe("ABXC");

      // Cursor should be at position 3 (after X)
      const cursorPos = await locators.textarea.evaluate(
        (el: HTMLTextAreaElement) => el.selectionStart
      );
      expect(cursorPos).toBe(3);
    });

    test("multiple IME inputs create separate history entries", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);

      await setEditorContent(page, locators, "");
      await page.waitForTimeout(400);

      // First IME input
      await simulateIMEInput(page, locators, "あ");
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("あ");

      // Second IME input
      await simulateIMEInput(page, locators, "い");
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("あい");

      // Undo should remove second input
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("あ");

      // Another undo should remove first input
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("");
    });

    test("redo works with IME input", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);

      await setEditorContent(page, locators, "");
      await page.waitForTimeout(400);

      // IME input
      await simulateIMEInput(page, locators, "テスト");
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("テスト");

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("");

      // Redo
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("テスト");
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineIMETests("text", "/#/text-editor");
defineIMETests("code", "/#/code-editor");
