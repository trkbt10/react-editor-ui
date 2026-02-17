/**
 * @file Editor interaction tests
 *
 * Tests actual editing operations to ensure the editor works correctly.
 * These tests verify:
 * - Text input
 * - Cursor visibility on focus
 * - Selection
 * - Copy/paste
 * - Keyboard navigation
 */

import { test, expect, Page } from "@playwright/test";

/**
 * Get the editor container that handles pointer events.
 */
function getEditorContainer(page: Page) {
  return page.locator("div:has(> svg:has(text))").first();
}

/**
 * Get the hidden textarea used for input.
 */
function getEditorTextarea(page: Page) {
  return page.locator('textarea[aria-label="Text editor"], textarea[aria-label="Code editor"]').first();
}

/**
 * Get the editor SVG element.
 */
function getEditorSvg(page: Page) {
  return page.locator("svg:has(text)").first();
}

/**
 * Go to document start (works on macOS)
 */
async function goToDocumentStart(page: Page) {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

/**
 * Go to document end (works on macOS)
 */
async function goToDocumentEnd(page: Page) {
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("Meta+ArrowRight");
}

test.describe("Editor Interaction: TextEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/text-editor");
    await page.waitForSelector("svg text");
  });

  test("cursor appears when editor is focused", async ({ page }) => {
    const container = getEditorContainer(page);
    const svg = getEditorSvg(page);

    // Before click - no cursor (rect with width=2 is the cursor)
    const cursorsBefore = await svg.locator('rect[width="2"]').count();
    expect(cursorsBefore).toBe(0);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // After click - cursor should be visible
    const cursorsAfter = await svg.locator('rect[width="2"]').count();
    expect(cursorsAfter).toBeGreaterThan(0);
  });

  test("cursor disappears when editor loses focus", async ({ page }) => {
    const container = getEditorContainer(page);
    const svg = getEditorSvg(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Cursor should be visible (rect with width=2)
    const cursorsWhileFocused = await svg.locator('rect[width="2"]').count();
    expect(cursorsWhileFocused).toBeGreaterThan(0);

    // Click outside to blur (click on the page title)
    await page.locator("h1").first().click();
    await page.waitForTimeout(100);

    // Cursor should disappear
    const cursorsAfterBlur = await svg.locator('rect[width="2"]').count();
    expect(cursorsAfterBlur).toBe(0);
  });

  test("text can be typed into the editor", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Get initial text
    const initialText = await textarea.inputValue();

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type some text
    await page.keyboard.type("Hello ");

    // Check that text was added
    const newText = await textarea.inputValue();
    expect(newText).toContain("Hello ");
    expect(newText.length).toBeGreaterThan(initialText.length);
  });

  test("text can be selected and deleted", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Select all and delete
    await page.keyboard.press("Meta+a");
    await page.keyboard.press("Backspace");

    // Check that text was deleted
    const newText = await textarea.inputValue();
    expect(newText).toBe("");
  });

  test("keyboard navigation works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Get initial position
    const initialPosition = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);

    // Move cursor right
    await page.keyboard.press("ArrowRight");
    const afterRight = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
    expect(afterRight).toBe(initialPosition + 1);

    // Move cursor left
    await page.keyboard.press("ArrowLeft");
    const afterLeft = await textarea.evaluate((el: HTMLTextAreaElement) => el.selectionStart);
    expect(afterLeft).toBe(initialPosition);

    // Select All (Cmd+A)
    await page.keyboard.press("Meta+a");
    const { start, end } = await textarea.evaluate((el: HTMLTextAreaElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }));
    expect(start).toBe(0);
    expect(end).toBeGreaterThan(0);
  });

  test("undo/redo works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus and go to end
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await goToDocumentEnd(page);

    // Get initial text
    const initialText = await textarea.inputValue();

    // Type some text (type slowly to avoid debounce batching issues)
    await page.keyboard.type("TEST", { delay: 50 });
    await page.waitForTimeout(400); // Wait for debounce to complete

    const afterType = await textarea.inputValue();
    expect(afterType).toContain("TEST");
    expect(afterType.length).toBe(initialText.length + 4);

    // Undo - may need multiple undos depending on debounce batching
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(100);

    const afterUndo = await textarea.inputValue();
    // Undo should remove some or all of the typed text
    expect(afterUndo.length).toBeLessThan(afterType.length);

    // If not fully undone, continue undoing
    const undoUntilTestGone = async (): Promise<string> => {
      const text = await textarea.inputValue();
      if (!text.includes("TEST") || text.length <= initialText.length) {
        return text;
      }
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      return undoUntilTestGone();
    };
    const finalText = await undoUntilTestGone();

    // After full undo, TEST should be gone
    expect(finalText).not.toContain("TEST");

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(100);

    const afterRedo = await textarea.inputValue();
    // Redo should restore some text
    expect(afterRedo.length).toBeGreaterThan(finalText.length);
  });

  test("range selection and replace works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Go to start and select first 3 characters
    await goToDocumentStart(page);
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");

    // Verify selection exists
    const { start, end } = await textarea.evaluate((el: HTMLTextAreaElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }));
    expect(end - start).toBe(3);

    // Type to replace selection
    await page.keyboard.type("XXX");

    // Verify replacement
    const newText = await textarea.inputValue();
    expect(newText.startsWith("XXX")).toBe(true);
  });

  test("SVG rendering reflects textarea content changes", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);
    const svg = getEditorSvg(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Select all and replace with unique text
    await page.keyboard.press("Meta+a");
    const uniqueText = "UNIQUE123 TEST CONTENT";
    await page.keyboard.type(uniqueText);
    await page.waitForTimeout(200);

    // Verify textarea has the text
    const textareaContent = await textarea.inputValue();
    expect(textareaContent).toBe(uniqueText);

    // Verify SVG renders the text
    const svgText = await svg.locator("text").allTextContents();
    const combinedSvgText = svgText.join("");
    expect(combinedSvgText).toContain("UNIQUE123");
  });

  test("backspace deletes character before cursor", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace with known text first
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJ");
    await page.waitForTimeout(100);

    // Go to position 5
    await goToDocumentStart(page);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowRight");
    }

    const beforeBackspace = await textarea.inputValue();
    expect(beforeBackspace).toBe("ABCDEFGHIJ");

    // Press backspace (deletes 'E' at position 4)
    await page.keyboard.press("Backspace");

    const afterBackspace = await textarea.inputValue();
    expect(afterBackspace).toBe("ABCDFGHIJ");
  });

  test("delete key removes character after cursor", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace with known text first
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJ");
    await page.waitForTimeout(100);

    // Go to start
    await goToDocumentStart(page);

    // Press delete (removes 'A')
    await page.keyboard.press("Delete");

    const afterDelete = await textarea.inputValue();
    expect(afterDelete).toBe("BCDEFGHIJ");
  });

  test("typing in middle of text inserts correctly", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace with known text first
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("ABCDEFGHIJ");
    await page.waitForTimeout(100);

    // Go to position 5
    await goToDocumentStart(page);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowRight");
    }

    // Type text
    await page.keyboard.type("XXX");

    const afterInsert = await textarea.inputValue();
    expect(afterInsert).toBe("ABCDEXXXFGHIJ");
  });

  test("multi-line selection and delete works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    const beforeDelete = await textarea.inputValue();

    // Select from start to end of first line
    await goToDocumentStart(page);
    await page.keyboard.press("Shift+ArrowDown");

    // Delete selection
    await page.keyboard.press("Backspace");

    const afterDelete = await textarea.inputValue();
    // Text should be shorter
    expect(afterDelete.length).toBeLessThan(beforeDelete.length);
  });

  test("copy and paste works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace with known text
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("HELLO WORLD");
    await page.waitForTimeout(100);

    // Select "HELLO"
    await goToDocumentStart(page);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }

    // Copy
    await page.keyboard.press("Meta+c");

    // Move to end
    await goToDocumentEnd(page);

    // Paste
    await page.keyboard.press("Meta+v");
    await page.waitForTimeout(100);

    const afterPaste = await textarea.inputValue();
    expect(afterPaste).toBe("HELLO WORLDHELLO");
  });

  test("cut and paste works", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = getEditorTextarea(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace with known text
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("HELLO WORLD");
    await page.waitForTimeout(100);

    // Select "HELLO "
    await goToDocumentStart(page);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }

    // Cut
    await page.keyboard.press("Meta+x");
    await page.waitForTimeout(100);

    const afterCut = await textarea.inputValue();
    expect(afterCut).toBe("WORLD");

    // Move to end and paste
    await goToDocumentEnd(page);
    await page.keyboard.press("Meta+v");
    await page.waitForTimeout(100);

    const afterPaste = await textarea.inputValue();
    expect(afterPaste).toBe("WORLDHELLO ");
  });
});

test.describe("Editor Interaction: CodeEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/code-editor");
    await page.waitForSelector("svg text");
  });

  test("cursor appears when editor is focused", async ({ page }) => {
    const container = getEditorContainer(page);
    const svg = getEditorSvg(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // After click - cursor should be visible (rect with width=2)
    const cursorsAfter = await svg.locator('rect[width="2"]').count();
    expect(cursorsAfter).toBeGreaterThan(0);
  });

  test("text can be typed into the editor", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = page.locator('textarea[aria-label="Code editor"]').first();

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type some text
    await page.keyboard.type("// comment");

    // Check that text was added
    const newText = await textarea.inputValue();
    expect(newText).toContain("// comment");
  });

  test("SVG rendering reflects content changes", async ({ page }) => {
    const container = getEditorContainer(page);
    const textarea = page.locator('textarea[aria-label="Code editor"]').first();
    const svg = getEditorSvg(page);

    // Click to focus
    await container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Replace all with unique content
    await page.keyboard.press("Meta+a");
    await page.keyboard.type("NEWCODE123");
    await page.waitForTimeout(200);

    // Verify textarea
    const textareaContent = await textarea.inputValue();
    expect(textareaContent).toBe("NEWCODE123");

    // Verify SVG
    const svgText = await svg.locator("text").allTextContents();
    const combinedSvgText = svgText.join("");
    expect(combinedSvgText).toContain("NEWCODE123");
  });
});
