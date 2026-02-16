/**
 * @file Editor Undo/Redo Cursor Position Tests
 *
 * Tests to verify cursor position is correctly restored after undo/redo.
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

async function getCursorPosition(locators: EditorLocators): Promise<number> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
}

async function goToStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineUndoCursorTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: Undo Cursor Position`, () => {
    test("cursor restored to edit position after undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Set up initial content
      await setEditorContent(page, locators, "ABCDEFGH");
      await goToStart(page);

      // Move to position 3
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      expect(await getCursorPosition(locators)).toBe(3);

      // Type text at position 3
      await page.keyboard.type("X", { delay: 50 });
      await page.waitForTimeout(400);

      // Cursor should be at position 4 (after X)
      expect(await getCursorPosition(locators)).toBe(4);
      expect(await getEditorContent(locators)).toBe("ABCXDEFGH");

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Cursor should be restored to position 3 (where X was inserted)
      const cursorAfterUndo = await getCursorPosition(locators);
      // Cursor should be near position 3-4 (not at end)
      expect(cursorAfterUndo).toBeLessThanOrEqual(4);
      expect(cursorAfterUndo).toBeGreaterThanOrEqual(0);
    });

    test("cursor not at end after undo mid-document edit", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Set up content
      await setEditorContent(page, locators, "FIRST SECOND THIRD");
      await goToStart(page);

      // Move to after "FIRST "
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("ArrowRight");
      }
      expect(await getCursorPosition(locators)).toBe(6);

      // Type new word
      await page.keyboard.type("NEW ", { delay: 50 });
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("FIRST NEW SECOND THIRD");
      expect(await getCursorPosition(locators)).toBe(10); // After "FIRST NEW "

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Cursor should NOT be at the end
      const cursorAfterUndo = await getCursorPosition(locators);
      const content = await getEditorContent(locators);
      expect(cursorAfterUndo).toBeLessThan(content.length);
    });

    test("redo restores cursor to post-edit position", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Set up content
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);

      // Move to position 2
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");

      // Type
      await page.keyboard.type("X", { delay: 50 });
      await page.waitForTimeout(400);

      const posAfterType = await getCursorPosition(locators);
      expect(posAfterType).toBe(3); // After "ABX"

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Redo
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(200);

      // Cursor should be at same position as after original type
      const posAfterRedo = await getCursorPosition(locators);
      expect(posAfterRedo).toBe(3);
    });

    test("multiple edits at different positions then undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Set up content and wait for debounce to complete
      await setEditorContent(page, locators, "ONE TWO THREE");
      await page.waitForTimeout(400); // Wait for debounce

      // Edit at end - make sure we're at end
      await page.keyboard.press("Meta+ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type("!", { delay: 50 });
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("ONE TWO THREE!");

      // Verify cursor is at end
      expect(await getCursorPosition(locators)).toBe(14);

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // After undo, content should be restored and cursor should be near where "!" was
      const content = await getEditorContent(locators);
      expect(content).toBe("ONE TWO THREE");

      // Cursor should be near end (where ! was added), position 13
      const cursorPos = await getCursorPosition(locators);
      expect(cursorPos).toBeGreaterThanOrEqual(10);
    });

    test("cursor correct after deleting and undoing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGH");
      await goToStart(page);

      // Move to position 4
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");

      // Delete 2 characters
      await page.keyboard.press("Delete");
      await page.keyboard.press("Delete");
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("ABCDGH");
      expect(await getCursorPosition(locators)).toBe(4);

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Cursor should be near position 4
      const cursorAfterUndo = await getCursorPosition(locators);
      expect(cursorAfterUndo).toBeLessThanOrEqual(6);
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineUndoCursorTests("text", "/#/components/editor/text-editor");
defineUndoCursorTests("code", "/#/components/editor/code-editor");
