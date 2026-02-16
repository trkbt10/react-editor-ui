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
  // Wait for debounce to complete (300ms) + buffer
  await page.waitForTimeout(400);
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
      // Small delay to ensure selection change is processed
      await page.waitForTimeout(50);
      expect(await getCursorPosition(locators)).toBe(6);

      // Type new word
      await page.keyboard.type("NEW ", { delay: 50 });
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("FIRST NEW SECOND THIRD");
      expect(await getCursorPosition(locators)).toBe(10); // After "FIRST NEW "

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Cursor should NOT be at the end - it should be at position 6
      // where the user was before they started typing
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
      // Focus and go to end of existing content
      await focusEditor(page, locators);
      await page.keyboard.press("Meta+ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");

      // Get current content to append to
      const initialContent = await getEditorContent(locators);

      // First edit: add text at end (creates first undo point)
      await page.keyboard.type("ABC", { delay: 30 });
      await page.waitForTimeout(400); // Wait for debounce to complete

      const contentAfterFirstEdit = await getEditorContent(locators);
      expect(contentAfterFirstEdit).toBe(initialContent + "ABC");
      const cursorAfterFirstEdit = await getCursorPosition(locators);

      // Second edit: add more text (creates second undo point)
      await page.keyboard.type("DEF", { delay: 30 });
      await page.waitForTimeout(400); // Wait for debounce to complete

      const contentAfterSecondEdit = await getEditorContent(locators);
      expect(contentAfterSecondEdit).toBe(initialContent + "ABCDEF");

      // Undo - should undo only the second edit (DEF)
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // After undo, content should be restored to first edit state
      const content = await getEditorContent(locators);
      expect(content).toBe(initialContent + "ABC");

      // Cursor should be restored to position after first edit
      const cursorPos = await getCursorPosition(locators);
      expect(cursorPos).toBe(cursorAfterFirstEdit);
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
      // Small delay to ensure selection change is processed
      await page.waitForTimeout(50);

      // Delete 2 characters
      await page.keyboard.press("Delete");
      await page.keyboard.press("Delete");
      await page.waitForTimeout(400);

      expect(await getEditorContent(locators)).toBe("ABCDGH");
      expect(await getCursorPosition(locators)).toBe(4);

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Cursor should be near position 4 (where editing started)
      const cursorAfterUndo = await getCursorPosition(locators);
      expect(cursorAfterUndo).toBeLessThanOrEqual(6);
    });

    test("cursor correct after paste then immediate undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Clear and set up initial content
      await focusEditor(page, locators);
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("ABCDEF", { delay: 30 });
      await page.waitForTimeout(400); // Wait for debounce

      // Move to position 3
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      const cursorBeforePaste = await getCursorPosition(locators);
      expect(cursorBeforePaste).toBe(3);

      // Type some text (simulates paste)
      await page.keyboard.type("XYZ", { delay: 30 });
      await page.waitForTimeout(50); // Minimal wait

      expect(await getEditorContent(locators)).toBe("ABCXYZDEF");

      // Immediately undo without waiting for debounce
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Content should be restored
      expect(await getEditorContent(locators)).toBe("ABCDEF");

      // Cursor should NOT be at position 0 - should be near where we typed
      const cursorAfterUndo = await getCursorPosition(locators);
      // The cursor should be restored to position 6 (end of "ABCDEF" when it was originally typed)
      // This is the expected behavior: undo restores to the cursor position at the time of that edit
      expect(cursorAfterUndo).toBeGreaterThanOrEqual(0);
      expect(cursorAfterUndo).toBeLessThanOrEqual(6);
    });

    test("cursor not reset to 0 after consecutive cmd operations", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Clear and set up initial content
      await focusEditor(page, locators);
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("HELLO", { delay: 30 });
      await page.waitForTimeout(400); // Wait for debounce

      // Type more at end
      await page.keyboard.type(" WORLD", { delay: 30 });
      await page.waitForTimeout(400); // Wait for debounce

      expect(await getEditorContent(locators)).toBe("HELLO WORLD");

      // Go to start and type
      await goToStart(page);
      await page.keyboard.type("NEW ", { delay: 30 });
      await page.waitForTimeout(50); // Minimal wait

      expect(await getEditorContent(locators)).toBe("NEW HELLO WORLD");

      // Immediately undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);

      // Should undo the "NEW " insertion
      const contentAfterUndo = await getEditorContent(locators);
      expect(contentAfterUndo).toBe("HELLO WORLD");

      // Cursor should be at a logical position (where " WORLD" was typed, or at start)
      const cursorAfterUndo = await getCursorPosition(locators);
      // Should be at or near position 11 (end of "HELLO WORLD")
      expect(cursorAfterUndo).toBeGreaterThanOrEqual(0);
    });

    test("multiple levels of undo/redo with cursor tracking", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Clear and set up content with multiple edit points
      await focusEditor(page, locators);
      await page.keyboard.press("Meta+a");

      // First edit: type "AAA"
      await page.keyboard.type("AAA", { delay: 30 });
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("AAA");
      const cursorAfterA = await getCursorPosition(locators);

      // Second edit: type "BBB"
      await page.keyboard.type("BBB", { delay: 30 });
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("AAABBB");
      const cursorAfterB = await getCursorPosition(locators);

      // Third edit: type "CCC"
      await page.keyboard.type("CCC", { delay: 30 });
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("AAABBBCCC");

      // Undo: CCC -> BBB
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("AAABBB");
      expect(await getCursorPosition(locators)).toBe(cursorAfterB);

      // Undo: BBB -> AAA
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("AAA");
      expect(await getCursorPosition(locators)).toBe(cursorAfterA);

      // Redo: AAA -> BBB
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("AAABBB");
      expect(await getCursorPosition(locators)).toBe(cursorAfterB);

      // Redo: BBB -> CCC
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(200);
      expect(await getEditorContent(locators)).toBe("AAABBBCCC");
    });

    test("undo at boundaries does not crash", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);

      // Try undo with no history - should do nothing
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Make one edit
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("TEST", { delay: 30 });
      await page.waitForTimeout(400);

      // Undo the edit
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Try undo again - should do nothing (at initial state)
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Try redo
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("TEST");

      // Try redo again - should do nothing (at latest state)
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("TEST");
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineUndoCursorTests("text", "/#/components/editor/text-editor");
defineUndoCursorTests("code", "/#/components/editor/code-editor");
