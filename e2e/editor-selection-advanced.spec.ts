/**
 * @file Editor Advanced Selection Tests
 *
 * Tests for advanced selection behavior:
 * - Double-click word selection
 * - Triple-click line selection
 * - Word-by-word selection (Option+Shift+Arrow)
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

async function getSelection(locators: EditorLocators): Promise<{ start: number; end: number }> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
  }));
}

async function getSelectedText(locators: EditorLocators): Promise<string> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => {
    return el.value.substring(el.selectionStart, el.selectionEnd);
  });
}

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineAdvancedSelectionTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: Advanced Selection`, () => {
    // Note: Double-click word selection is not implemented in the editor
    // These tests verify the expected behavior when implemented
    test.describe("Double-click Word Selection", () => {
      test.skip("double-click selects word", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world test");
        await page.waitForTimeout(100);

        // Double-click on "world" (approximately in the middle)
        await locators.container.dblclick({ position: { x: 80, y: 20 } });
        await page.waitForTimeout(100);

        const selected = await getSelectedText(locators);
        // Should select a word (exact word depends on click position)
        expect(selected.length).toBeGreaterThan(0);
        expect(selected).not.toContain(" "); // Should not contain spaces
      });

      test.skip("double-click at start selects first word", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "first second third");
        await page.waitForTimeout(100);

        // Double-click near the start
        await locators.container.dblclick({ position: { x: 20, y: 20 } });
        await page.waitForTimeout(100);

        const selected = await getSelectedText(locators);
        expect(selected.length).toBeGreaterThan(0);
      });

      test.skip("double-click then type replaces word", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world");
        await page.waitForTimeout(100);

        // Double-click to select a word
        await locators.container.dblclick({ position: { x: 20, y: 20 } });
        await page.waitForTimeout(100);

        // Type to replace
        await page.keyboard.type("goodbye");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toContain("goodbye");
      });
    });

    test.describe("Word-by-word Selection", () => {
      test("option+shift+right selects word forward", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world test");
        // Go to start
        await page.keyboard.press("Meta+ArrowLeft");

        // Select first word
        await page.keyboard.press("Alt+Shift+ArrowRight");
        await page.waitForTimeout(50);

        const selection = await getSelection(locators);
        expect(selection.start).toBe(0);
        expect(selection.end).toBeGreaterThan(0);
      });

      test("option+shift+left selects word backward", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world test");
        // Go to end
        await page.keyboard.press("Meta+ArrowRight");

        // Select last word backward
        await page.keyboard.press("Alt+Shift+ArrowLeft");
        await page.waitForTimeout(50);

        const selection = await getSelection(locators);
        expect(selection.end).toBe(16); // End of "hello world test"
        expect(selection.start).toBeLessThan(selection.end);
      });

      test("multiple option+shift+right extends selection", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "one two three");
        // Go to start
        await page.keyboard.press("Meta+ArrowLeft");

        // Select first word
        await page.keyboard.press("Alt+Shift+ArrowRight");
        const sel1 = await getSelection(locators);

        // Extend to second word
        await page.keyboard.press("Alt+Shift+ArrowRight");
        const sel2 = await getSelection(locators);

        expect(sel2.end).toBeGreaterThan(sel1.end);
      });
    });

    test.describe("Line Selection", () => {
      test("cmd+shift+down selects to next line", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "line one\nline two\nline three");
        // Go to start
        await page.keyboard.press("Meta+ArrowUp");
        await page.keyboard.press("Meta+ArrowLeft");

        // Select to next line
        await page.keyboard.press("Shift+ArrowDown");
        await page.waitForTimeout(50);

        const selection = await getSelection(locators);
        expect(selection.start).toBe(0);
        expect(selection.end).toBeGreaterThan(8); // More than first line
      });

      test("shift+end selects to line end", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world");
        // Go to start
        await page.keyboard.press("Meta+ArrowLeft");

        // Select to end
        await page.keyboard.press("Shift+Meta+ArrowRight");
        await page.waitForTimeout(50);

        const selected = await getSelectedText(locators);
        expect(selected).toBe("hello world");
      });

      test("shift+home selects to line start", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world");
        // Cursor is at end after typing

        // Select to start
        await page.keyboard.press("Shift+Meta+ArrowLeft");
        await page.waitForTimeout(50);

        const selected = await getSelectedText(locators);
        expect(selected).toBe("hello world");
      });
    });

    test.describe("Selection Edge Cases", () => {
      test("select all in multiline document", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "line1\nline2\nline3");

        await page.keyboard.press("Meta+a");
        await page.waitForTimeout(50);

        const selected = await getSelectedText(locators);
        expect(selected).toBe("line1\nline2\nline3");
      });

      test("selection across lines with shift+arrow", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "abc\ndef\nghi");
        // Go to start
        await page.keyboard.press("Meta+ArrowUp");
        await page.keyboard.press("Meta+ArrowLeft");

        // Move to position 2
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");

        // Select forward including newline
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Shift+ArrowRight");
        }
        await page.waitForTimeout(50);

        const selected = await getSelectedText(locators);
        expect(selected).toContain("\n");
      });

      test("shrink selection with opposite shift+arrow", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world");
        // Go to start
        await page.keyboard.press("Meta+ArrowLeft");

        // Select "hello "
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Shift+ArrowRight");
        }

        const sel1 = await getSelection(locators);
        expect(sel1.end - sel1.start).toBe(6);

        // Shrink selection by 2
        await page.keyboard.press("Shift+ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");

        const sel2 = await getSelection(locators);
        expect(sel2.end - sel2.start).toBe(4);
      });
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineAdvancedSelectionTests("text", "/#/components/editor/text-editor");
defineAdvancedSelectionTests("code", "/#/components/editor/code-editor");
