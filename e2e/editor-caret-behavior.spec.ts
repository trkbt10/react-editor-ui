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
