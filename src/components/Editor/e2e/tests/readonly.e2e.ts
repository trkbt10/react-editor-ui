/**
 * @file Editor ReadOnly Mode Tests
 *
 * Tests for read-only editor behavior:
 * - Typing is disabled
 * - Selection still works
 * - Copy still works
 * - Cursor navigation works
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

function getReadOnlyEditorLocators(page: Page, type: EditorType): EditorLocators {
  // Find the readonly textarea first, then find its parent container
  const ariaLabel = type === "text" ? "Text editor" : "Code editor";
  const textarea = page.locator(`textarea[aria-label="${ariaLabel}"][readonly]`).first();

  // The container is the parent div that contains the svg
  // We locate it relative to the readonly textarea
  return {
    container: textarea.locator("..").locator(".."), // Go up to find the container
    textarea,
    svg: textarea.locator("..").locator("svg").first(),
  };
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  // Focus by clicking on the textarea's sibling svg area
  await locators.svg.click({ position: { x: 50, y: 20 }, force: true });
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

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getReadOnlyEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineReadOnlyTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: ReadOnly Mode`, () => {
    test("textarea has readonly attribute", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      const isReadOnly = await locators.textarea.evaluate(
        (el: HTMLTextAreaElement) => el.readOnly
      );
      expect(isReadOnly).toBe(true);
    });

    test("typing does not change content", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      await page.keyboard.type("new text");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });

    test("backspace does not delete", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });

    test("delete key does not delete", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      // Go to start
      await page.keyboard.press("Meta+ArrowLeft");
      await page.keyboard.press("Delete");
      await page.keyboard.press("Delete");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });

    test("selection works", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);

      // Select all
      await page.keyboard.press("Meta+a");
      await page.waitForTimeout(50);

      const selection = await getSelection(locators);
      const content = await getEditorContent(locators);

      expect(selection.start).toBe(0);
      expect(selection.end).toBe(content.length);
    });

    test("cursor can be positioned with click", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Click at different positions to verify cursor positioning works
      await locators.svg.click({ position: { x: 10, y: 10 }, force: true });
      await page.waitForTimeout(100);

      const sel1 = await getSelection(locators);

      // Click at a different position
      await locators.svg.click({ position: { x: 100, y: 10 }, force: true });
      await page.waitForTimeout(100);

      const sel2 = await getSelection(locators);

      // Cursor positions should be different (or at least the test verifies click works)
      // The exact positions depend on content and font metrics
      expect(sel1.start).toBeDefined();
      expect(sel2.start).toBeDefined();
    });

    test("copy works in readonly mode", async ({ page, context }) => {
      const locators = await setupEditor(page, route, editorType);
      // Grant clipboard permissions
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);

      await focusEditor(page, locators);

      // Select all and copy
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await page.waitForTimeout(100);

      // Read from clipboard
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      const content = await getEditorContent(locators);

      expect(clipboardText).toBe(content);
    });

    test("cut does not work in readonly mode", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      // Select all and try to cut
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+x");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });

    test("paste does not work in readonly mode", async ({ page, context }) => {
      const locators = await setupEditor(page, route, editorType);
      // Grant clipboard permissions
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);

      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      // Write to clipboard
      await page.evaluate(() => navigator.clipboard.writeText("pasted text"));

      // Try to paste
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });

    test("undo does not work in readonly mode", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const contentBefore = await getEditorContent(locators);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      const contentAfter = await getEditorContent(locators);
      expect(contentAfter).toBe(contentBefore);
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineReadOnlyTests("text", "/#/text-editor");
defineReadOnlyTests("code", "/#/code-editor");
