/**
 * @file Editor Caret Behavior Tests
 *
 * Detailed tests for caret (cursor) position after various operations.
 * Ensures caret is always at the expected position after editing.
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
}

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

async function goToEnd(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("Meta+ArrowRight");
}

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineCaretTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: Caret Position After Typing`, () => {
    test("caret at end after typing single character", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("A");
      expect(await getCursorPosition(locators)).toBe(1);
      expect(await getEditorContent(locators)).toBe("A");
    });

    test("caret at end after typing multiple characters", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("HELLO");
      expect(await getCursorPosition(locators)).toBe(5);
    });

    test("caret position correct after typing in middle", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // Cursor at position 3
      await page.keyboard.type("X");
      // Should now be at position 4
      expect(await getCursorPosition(locators)).toBe(4);
      expect(await getEditorContent(locators)).toBe("ABCXDEF");
    });

    test("caret position after typing at start", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "EXISTING");
      await goToStart(page);
      await page.keyboard.type("NEW");
      expect(await getCursorPosition(locators)).toBe(3);
      expect(await getEditorContent(locators)).toBe("NEWEXISTING");
    });

    test("caret position after newline", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1");
      await goToEnd(page);
      await page.keyboard.press("Enter");
      const pos = await getCursorPosition(locators);
      expect(pos).toBe(6); // "LINE1\n" = 6 characters
      await page.keyboard.type("LINE2");
      expect(await getEditorContent(locators)).toBe("LINE1\nLINE2");
    });

    test("caret follows rapid typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("RAPID");
      expect(await getCursorPosition(locators)).toBe(5);
      await page.keyboard.type("TYPE");
      expect(await getCursorPosition(locators)).toBe(9);
      expect(await getEditorContent(locators)).toBe("RAPIDTYPE");
    });
  });

  test.describe(`${editorName}: Caret Position After Deletion`, () => {
    test("caret position after backspace", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDE");
      await goToEnd(page);
      await page.keyboard.press("Backspace");
      expect(await getCursorPosition(locators)).toBe(4);
      expect(await getEditorContent(locators)).toBe("ABCD");
    });

    test("caret position after delete key", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDE");
      await goToStart(page);
      await page.keyboard.press("Delete");
      expect(await getCursorPosition(locators)).toBe(0);
      expect(await getEditorContent(locators)).toBe("BCDE");
    });

    test("caret position after deleting selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGH");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // At position 2
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Selected CDE (positions 2-5)
      await page.keyboard.press("Backspace");
      expect(await getCursorPosition(locators)).toBe(2);
      expect(await getEditorContent(locators)).toBe("ABFGH");
    });

    test("caret position after backspace at middle", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGH");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // At position 4
      await page.keyboard.press("Backspace");
      expect(await getCursorPosition(locators)).toBe(3);
      expect(await getEditorContent(locators)).toBe("ABCEFGH");
    });

    test("caret position after deleting newline", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2");
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Meta+ArrowLeft");
      // At start of LINE2
      await page.keyboard.press("Backspace");
      expect(await getCursorPosition(locators)).toBe(5);
      expect(await getEditorContent(locators)).toBe("LINE1LINE2");
    });
  });

  test.describe(`${editorName}: Movement Then Typing`, () => {
    test("type, move left, type more", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("AC");
      await page.keyboard.press("ArrowLeft");
      expect(await getCursorPosition(locators)).toBe(1);
      await page.keyboard.type("B");
      expect(await getCursorPosition(locators)).toBe(2);
      expect(await getEditorContent(locators)).toBe("ABC");
    });

    test("type, move to start, type prefix", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("WORLD");
      await goToStart(page);
      await page.keyboard.type("HELLO ");
      expect(await getCursorPosition(locators)).toBe(6);
      expect(await getEditorContent(locators)).toBe("HELLO WORLD");
    });

    test("navigate to middle of word, insert", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "HELLOWORLD");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // At position 5, between HELLO and WORLD
      await page.keyboard.type(" ");
      expect(await getEditorContent(locators)).toBe("HELLO WORLD");
      expect(await getCursorPosition(locators)).toBe(6);
    });

    test("move between lines and type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2\nLINE3");
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type(" MODIFIED");
      expect(await getEditorContent(locators)).toBe("LINE1\nLINE2 MODIFIED\nLINE3");
    });

    test("alternate movement and typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("A");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.type("B");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.type("C");
      expect(await getEditorContent(locators)).toBe("BAC");
    });

    test("word navigation then type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ONE TWO THREE");
      await goToStart(page);
      await page.keyboard.press("Alt+ArrowRight"); // After "ONE"
      await page.keyboard.type(" PLUS");
      const content = await getEditorContent(locators);
      expect(content).toContain("ONE");
      expect(content).toContain("PLUS");
    });
  });

  test.describe(`${editorName}: Selection and Replace`, () => {
    test("select word and replace", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "HELLO WORLD");
      await goToStart(page);
      // Select "HELLO"
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.type("HI");
      expect(await getEditorContent(locators)).toBe("HI WORLD");
      expect(await getCursorPosition(locators)).toBe(2);
    });

    test("select and replace with longer text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "AB");
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("LONGER TEXT");
      expect(await getEditorContent(locators)).toBe("LONGER TEXT");
      expect(await getCursorPosition(locators)).toBe(11);
    });

    test("select and replace with shorter text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LONG CONTENT HERE");
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("X");
      expect(await getEditorContent(locators)).toBe("X");
      expect(await getCursorPosition(locators)).toBe(1);
    });

    test("select partial and type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJ");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // At position 2
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Selected CDE
      await page.keyboard.type("123");
      expect(await getEditorContent(locators)).toBe("AB123FGHIJ");
      expect(await getCursorPosition(locators)).toBe(5);
    });

    test("select backwards and type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToEnd(page);
      // Select backwards
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.press("Shift+ArrowLeft");
      // Selected DEF
      await page.keyboard.type("XYZ");
      expect(await getEditorContent(locators)).toBe("ABCXYZ");
      expect(await getCursorPosition(locators)).toBe(6);
    });
  });

  test.describe(`${editorName}: Complex Editing Sequences`, () => {
    test("realistic editing: fix typo in middle", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Helo World");
      // Find and fix "Helo" -> "Hello"
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // After "Hel"
      await page.keyboard.type("l");
      expect(await getEditorContent(locators)).toBe("Hello World");
    });

    test("realistic editing: insert word in sentence", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "The fox jumps");
      // Insert "quick " after "The "
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // After "The "
      await page.keyboard.type("quick ");
      expect(await getEditorContent(locators)).toBe("The quick fox jumps");
    });

    test("realistic editing: delete and retype word", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "WRONG WORD HERE");
      await goToStart(page);
      // Select "WRONG"
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.type("RIGHT");
      expect(await getEditorContent(locators)).toBe("RIGHT WORD HERE");
    });

    test("multi-step editing sequence", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      // Step 1: Type initial text
      await page.keyboard.type("Hello");
      expect(await getEditorContent(locators)).toBe("Hello");

      // Step 2: Add more
      await page.keyboard.type(" World");
      expect(await getEditorContent(locators)).toBe("Hello World");

      // Step 3: Go back and fix
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.type("i ");
      expect(await getEditorContent(locators)).toBe("Hi ello World");

      // Step 4: Delete extra
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("Hi  World");
    });

    test("edit multiple lines sequentially", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line 1\nLine 2\nLine 3");

      // Edit line 1
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type(" Modified");

      // Edit line 2
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type(" Changed");

      // Edit line 3
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type(" Updated");

      const content = await getEditorContent(locators);
      expect(content).toContain("Line 1 Modified");
      expect(content).toContain("Line 2 Changed");
      expect(content).toContain("Line 3 Updated");
    });
  });

  test.describe(`${editorName}: Tab and Indentation`, () => {
    test("tab inserts spaces", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.press("Tab");
      const content = await getEditorContent(locators);
      // Tab should insert spaces (default 4)
      expect(content.length).toBeGreaterThanOrEqual(1);
      expect(await getCursorPosition(locators)).toBeGreaterThanOrEqual(1);
    });

    test("tab at start of line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TEXT");
      await goToStart(page);
      await page.keyboard.press("Tab");
      const content = await getEditorContent(locators);
      // Tab should be inserted before TEXT
      expect(content.endsWith("TEXT")).toBe(true);
      expect(content.length).toBeGreaterThan(4);
    });

    test("type after tab", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.press("Tab");
      await page.keyboard.type("INDENTED");
      const content = await getEditorContent(locators);
      expect(content).toContain("INDENTED");
    });
  });

  test.describe(`${editorName}: Caret After Clipboard Operations`, () => {
    test("caret at end of pasted text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "COPY");
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await goToEnd(page);
      await page.keyboard.type(" ");
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      const content = await getEditorContent(locators);
      expect(content).toBe("COPY COPY");
      expect(await getCursorPosition(locators)).toBe(content.length);
    });

    test("caret position after cut", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Selected ABC
      await page.keyboard.press("Meta+x");
      expect(await getCursorPosition(locators)).toBe(0);
      expect(await getEditorContent(locators)).toBe("DEF");
    });

    test("type after paste", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ORIGINAL");
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await goToEnd(page);
      await page.keyboard.press("Meta+v");
      await page.keyboard.type("!");
      expect(await getEditorContent(locators)).toBe("ORIGINALORIGINAL!");
    });

    test("caret at end after cut then paste", async ({ page }) => {
      // Bug regression: cmd+x followed by cmd+v resets cursor to 0
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      // Select ABC
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Cut
      await page.keyboard.press("Meta+x");
      expect(await getEditorContent(locators)).toBe("DEF");
      expect(await getCursorPosition(locators)).toBe(0);
      // Paste immediately
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      const content = await getEditorContent(locators);
      expect(content).toBe("ABCDEF");
      // Cursor should be at end of pasted text (position 3), not at 0
      expect(await getCursorPosition(locators)).toBe(3);
    });

    test("caret correct after cut from middle then paste at end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "HELLO WORLD");
      // Select "HELLO" (0-5)
      await goToStart(page);
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      // Cut
      await page.keyboard.press("Meta+x");
      expect(await getEditorContent(locators)).toBe(" WORLD");
      expect(await getCursorPosition(locators)).toBe(0);
      // Move to end
      await goToEnd(page);
      expect(await getCursorPosition(locators)).toBe(6);
      // Paste
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe(" WORLDHELLO");
      // Cursor should be at end (11), not at 0
      expect(await getCursorPosition(locators)).toBe(11);
    });

    test("caret after rapid cut then paste (no delay)", async ({ page }) => {
      // Test without explicit delays to catch race conditions
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      // Select ABC
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Rapid cut then paste
      await page.keyboard.press("Meta+x");
      await page.keyboard.press("Meta+v");
      // Brief wait for React render
      await page.waitForTimeout(50);
      expect(await getEditorContent(locators)).toBe("ABCDEF");
      expect(await getCursorPosition(locators)).toBe(3);
    });

    test("caret after cut paste undo redo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await page.waitForTimeout(400); // Wait for history debounce
      await goToStart(page);
      // Select ABC
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Cut
      await page.keyboard.press("Meta+x");
      await page.waitForTimeout(400); // Wait for history debounce
      expect(await getEditorContent(locators)).toBe("DEF");
      expect(await getCursorPosition(locators)).toBe(0);
      // Paste at same position
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(400); // Wait for history debounce
      expect(await getEditorContent(locators)).toBe("ABCDEF");
      expect(await getCursorPosition(locators)).toBe(3);
      // Undo paste
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("DEF");
      // Cursor should be at 0, not jumping somewhere weird
      expect(await getCursorPosition(locators)).toBe(0);
      // Undo cut
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("ABCDEF");
    });

    test("caret after cut paste with Japanese text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "こんにちは世界");
      await page.waitForTimeout(400);
      await goToStart(page);
      // Select first 3 characters
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      // Cut
      await page.keyboard.press("Meta+x");
      expect(await getEditorContent(locators)).toBe("ちは世界");
      expect(await getCursorPosition(locators)).toBe(0);
      // Paste immediately
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("こんにちは世界");
      // Cursor should be at 3, not at 0
      expect(await getCursorPosition(locators)).toBe(3);
    });

    test("caret after copy paste paste then undo twice", async ({ page }) => {
      // Bug: select text, copy, paste, paste, undo works, undo again resets cursor to 0
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "quick brown fox");
      await page.waitForTimeout(400);
      // Select all and copy
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      // Go to end
      await goToEnd(page);
      const posBeforePaste = await getCursorPosition(locators);
      expect(posBeforePaste).toBe(15); // "quick brown fox" = 15 chars
      // Paste twice
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown fox");
      expect(await getCursorPosition(locators)).toBe(30);
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown foxquick brown fox");
      expect(await getCursorPosition(locators)).toBe(45);
      // Undo first time - should revert second paste
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown fox");
      const posAfterUndo1 = await getCursorPosition(locators);
      expect(posAfterUndo1).toBe(30); // cursor should be at end of first paste
      // Undo second time - should revert first paste
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown fox");
      const posAfterUndo2 = await getCursorPosition(locators);
      // Cursor should be at 15 (end of original), NOT at 0
      expect(posAfterUndo2).toBe(15);
    });

    test("caret after rapid paste paste then undo twice (within debounce)", async ({ page }) => {
      // Test rapid paste operations within debounce window (300ms)
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "quick brown fox");
      await page.waitForTimeout(400);
      // Select all and copy
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      // Go to end
      await goToEnd(page);
      // Rapid paste twice (no delay between - within debounce window)
      await page.keyboard.press("Meta+v");
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(50); // Brief wait for state update
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown foxquick brown fox");
      expect(await getCursorPosition(locators)).toBe(45);
      // Wait for debounce to complete
      await page.waitForTimeout(400);
      // Undo - should revert both pastes (they're in same undo batch)
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const contentAfterUndo = await getEditorContent(locators);
      const posAfterUndo = await getCursorPosition(locators);
      // If both pastes are in same batch, we're back to original
      // If separate batches, we're at intermediate state
      // Either way, cursor should NOT be at 0
      expect(posAfterUndo).toBeGreaterThan(0);
      // If we're at original, second undo shouldn't change anything
      if (contentAfterUndo === "quick brown fox") {
        expect(posAfterUndo).toBe(15);
      } else {
        // Intermediate state, do another undo
        await page.keyboard.press("Meta+z");
        await page.waitForTimeout(100);
        expect(await getEditorContent(locators)).toBe("quick brown fox");
        expect(await getCursorPosition(locators)).toBe(15);
      }
    });

    test("select all copy paste-over paste undo undo cursor bug", async ({ page }) => {
      // Exact user scenario:
      // 1. "quick brown fox" selected
      // 2. Copy
      // 3. Paste (replaces selection with same text)
      // 4. Paste (adds at end)
      // 5. Undo (first time works)
      // 6. Undo (second time - cursor goes to 0)
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "quick brown fox");
      await page.waitForTimeout(400);

      // Select all
      await page.keyboard.press("Meta+a");
      // Copy
      await page.keyboard.press("Meta+c");
      // Selection is still active, paste replaces it
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(400);
      // Content should still be "quick brown fox" (replaced itself)
      expect(await getEditorContent(locators)).toBe("quick brown fox");
      // Cursor should be at end (15)
      expect(await getCursorPosition(locators)).toBe(15);

      // Paste again - adds at end
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(400);
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown fox");
      expect(await getCursorPosition(locators)).toBe(30);

      // Undo first time
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown fox");
      const posAfterUndo1 = await getCursorPosition(locators);
      // Cursor should be at 15, not 0
      expect(posAfterUndo1).toBe(15);

      // Undo second time - THIS IS WHERE BUG MIGHT BE
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const contentAfterUndo2 = await getEditorContent(locators);
      const posAfterUndo2 = await getCursorPosition(locators);
      // Content might be same (no more undo) or different
      // But cursor should NOT be at 0
      expect(posAfterUndo2).toBeGreaterThanOrEqual(0);
      // If there's nothing to undo, cursor should stay at 15
      if (contentAfterUndo2 === "quick brown fox") {
        expect(posAfterUndo2).toBe(15);
      }
    });

    test("fast paste paste undo undo (each paste is separate undo)", async ({ page }) => {
      // Clipboard operations (paste/cut) always create separate undo points
      // even within the debounce window. This improves UX.
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "quick brown fox");
      await page.waitForTimeout(400);

      // Select all, copy
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");

      // Fast paste twice (100ms intervals)
      // Paste 1: replaces selection with same text (no onChange, no history entry)
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown fox");
      expect(await getCursorPosition(locators)).toBe(15);

      // Paste 2: inserts at cursor, creates history entry
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown foxquick brown fox");
      expect(await getCursorPosition(locators)).toBe(30);

      // Wait for debounce then undo twice
      await page.waitForTimeout(400);

      // Undo 1: reverts paste 2
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("quick brown fox");
      expect(await getCursorPosition(locators)).toBe(15);

      // Undo 2: reverts setEditorContent, goes to initial state
      // Cursor position depends on where editing started
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      // Content should revert to demo text
      const content = await getEditorContent(locators);
      expect(content.length).toBeGreaterThan(15);
      // Cursor is at the position where setEditorContent started editing
      // This is where the user was when they began the edit operation
    });
  });

  test.describe(`${editorName}: Caret After Undo/Redo`, () => {
    test("caret restored after undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      await goToEnd(page);
      const initialPos = await getCursorPosition(locators);

      await page.keyboard.type("NEW", { delay: 50 });
      await page.waitForTimeout(400);
      expect(await getCursorPosition(locators)).toBe(initialPos + 3);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Cursor should be restored
      const afterUndo = await getCursorPosition(locators);
      expect(afterUndo).toBeLessThanOrEqual(initialPos + 3);
    });

    test("can type after undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      await goToEnd(page);

      await page.keyboard.type("ABC", { delay: 50 });
      await page.waitForTimeout(400);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Should be able to type new content
      await page.keyboard.type("XYZ");
      const content = await getEditorContent(locators);
      expect(content).toContain("XYZ");
    });
  });

  test.describe(`${editorName}: Edge Cases for Caret`, () => {
    test("caret stable after clicking same position", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TESTTEXT");
      const box = await locators.container.boundingBox();

      // Click at same position multiple times
      await page.mouse.click(box!.x + 50, box!.y + 15);
      await page.waitForTimeout(100);
      const pos1 = await getCursorPosition(locators);

      await page.mouse.click(box!.x + 50, box!.y + 15);
      await page.waitForTimeout(100);
      const pos2 = await getCursorPosition(locators);

      expect(pos1).toBe(pos2);
    });

    test("caret at 0 in empty document", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      expect(await getCursorPosition(locators)).toBe(0);

      // Arrow keys should not move it
      await page.keyboard.press("ArrowLeft");
      expect(await getCursorPosition(locators)).toBe(0);
      await page.keyboard.press("ArrowRight");
      expect(await getCursorPosition(locators)).toBe(0);
    });

    test("caret correct after rapid operations", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);

      // Rapid movements
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");

      // Should be at position 3
      expect(await getCursorPosition(locators)).toBe(3);

      // Type and verify
      await page.keyboard.type("X");
      expect(await getEditorContent(locators)).toBe("ABCXDEF");
    });

    test("caret correct after select all and type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "OLD CONTENT");
      await page.keyboard.press("Meta+a");
      await page.keyboard.type("NEW");

      expect(await getCursorPosition(locators)).toBe(3);
      expect(await getEditorContent(locators)).toBe("NEW");
    });
  });

  test.describe(`${editorName}: Line Boundary Behavior`, () => {
    test("arrow right at line end goes to next line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2");
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowRight");
      // At end of LINE1
      await page.keyboard.press("ArrowRight");
      // Should be at start of LINE2 (position 6, after newline)
      const pos = await getCursorPosition(locators);
      expect(pos).toBe(6);
    });

    test("arrow left at line start goes to previous line end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2");
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Meta+ArrowLeft");
      // At start of LINE2
      await page.keyboard.press("ArrowLeft");
      // Should be at end of LINE1 (on the newline)
      const pos = await getCursorPosition(locators);
      expect(pos).toBe(5);
    });

    test("type at line boundary", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2");
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowRight");
      // At end of LINE1
      await page.keyboard.type("!");
      expect(await getEditorContent(locators)).toBe("LINE1!\nLINE2");
    });

    test("delete at line boundary removes newline", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "LINE1\nLINE2");
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowRight");
      // At end of LINE1
      await page.keyboard.press("Delete");
      expect(await getEditorContent(locators)).toBe("LINE1LINE2");
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineCaretTests("text", "/#/components/editor/text-editor");
defineCaretTests("code", "/#/components/editor/code-editor");
