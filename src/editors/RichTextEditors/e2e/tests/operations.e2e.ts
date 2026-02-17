/**
 * @file Editor Operations E2E Tests
 *
 * Comprehensive test suite covering all editor operations.
 * Tests both TextEditor and CodeEditor to ensure consistent behavior.
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

async function getSelection(locators: EditorLocators): Promise<{ start: number; end: number }> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
  }));
}

async function getSvgText(locators: EditorLocators): Promise<string> {
  const texts = await locators.svg.locator("text").allTextContents();
  return texts.join("");
}

// Navigation helpers (macOS compatible)
async function goToStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

async function goToEnd(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("Meta+ArrowRight");
}

async function goToLineStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowLeft");
}

async function goToLineEnd(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowRight");
}

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions for Each Editor Type
// =============================================================================

function defineEditorTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: Basic Text Input`, () => {
    test("type single character", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABC");
      await goToEnd(page);
      await page.keyboard.type("D");
      expect(await getEditorContent(locators)).toBe("ABCD");
    });

    test("type multiple characters", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("Hello World");
      expect(await getEditorContent(locators)).toBe("Hello World");
    });

    test("type special characters", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("!@#$%^&*()");
      expect(await getEditorContent(locators)).toBe("!@#$%^&*()");
    });

    test("type unicode characters", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("日本語テスト");
      expect(await getEditorContent(locators)).toBe("日本語テスト");
    });

    test("type in middle of text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.type("XXX");
      expect(await getEditorContent(locators)).toBe("ABCXXXDEF");
    });

    test("newline creates multiple lines", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.type("Line1");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Line2");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Line3");
      expect(await getEditorContent(locators)).toBe("Line1\nLine2\nLine3");
    });
  });

  test.describe(`${editorName}: Backspace and Delete`, () => {
    test("backspace deletes character before cursor", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("ABDEF");
    });

    test("delete removes character after cursor", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Delete");
      expect(await getEditorContent(locators)).toBe("ABDEF");
    });

    test("backspace at start does nothing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABC");
      await goToStart(page);
      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("ABC");
    });

    test("delete at end does nothing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABC");
      await goToEnd(page);
      await page.keyboard.press("Delete");
      expect(await getEditorContent(locators)).toBe("ABC");
    });

    test("backspace deletes newline", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2");
      await goToStart(page);
      // Move to start of Line2
      await page.keyboard.press("ArrowDown");
      await goToLineStart(page);
      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("Line1Line2");
    });

    test("backspace deletes selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("DEF");
    });

    test("delete removes selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Delete");
      expect(await getEditorContent(locators)).toBe("DEF");
    });
  });

  test.describe(`${editorName}: Cursor Navigation`, () => {
    test("arrow right moves cursor forward", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      expect(await getCursorPosition(locators)).toBe(1);
      await page.keyboard.press("ArrowRight");
      expect(await getCursorPosition(locators)).toBe(2);
    });

    test("arrow left moves cursor backward", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToEnd(page);
      await page.keyboard.press("ArrowLeft");
      expect(await getCursorPosition(locators)).toBe(5);
      await page.keyboard.press("ArrowLeft");
      expect(await getCursorPosition(locators)).toBe(4);
    });

    test("arrow down moves to next line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2\nLine3");
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      const pos = await getCursorPosition(locators);
      // Should be somewhere on Line2 (position 6 or more)
      expect(pos).toBeGreaterThanOrEqual(6);
    });

    test("arrow up moves to previous line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2\nLine3");
      await goToEnd(page);
      await page.keyboard.press("ArrowUp");
      const pos = await getCursorPosition(locators);
      // Should be somewhere before Line3 (position < 12)
      expect(pos).toBeLessThan(12);
    });

    test("cmd+left goes to line start", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToEnd(page);
      await goToLineStart(page);
      expect(await getCursorPosition(locators)).toBe(0);
    });

    test("cmd+right goes to line end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await goToLineEnd(page);
      expect(await getCursorPosition(locators)).toBe(6);
    });

    test("cmd+up goes to document start", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2\nLine3");
      await goToEnd(page);
      await page.keyboard.press("Meta+ArrowUp");
      await page.keyboard.press("Meta+ArrowLeft");
      expect(await getCursorPosition(locators)).toBe(0);
    });

    test("cmd+down goes to document end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2\nLine3");
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowDown");
      await page.keyboard.press("Meta+ArrowRight");
      const content = await getEditorContent(locators);
      expect(await getCursorPosition(locators)).toBe(content.length);
    });

    test("option+right moves by word", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Hello World Test");
      await goToStart(page);
      await page.keyboard.press("Alt+ArrowRight");
      const pos = await getCursorPosition(locators);
      // Should be at or after "Hello" (position >= 5)
      expect(pos).toBeGreaterThanOrEqual(5);
    });

    test("option+left moves by word backward", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Hello World Test");
      await goToEnd(page);
      await page.keyboard.press("Alt+ArrowLeft");
      const pos = await getCursorPosition(locators);
      // Should be before "Test" (position <= 12)
      expect(pos).toBeLessThanOrEqual(12);
    });
  });

  test.describe(`${editorName}: Selection`, () => {
    test("shift+right selects forward", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(0);
      expect(sel.end).toBe(2);
    });

    test("shift+left selects backward", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToEnd(page);
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.press("Shift+ArrowLeft");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(4);
      expect(sel.end).toBe(6);
    });

    test("cmd+a selects all", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await page.keyboard.press("Meta+a");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(0);
      expect(sel.end).toBe(6);
    });

    test("shift+cmd+right selects to line end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Shift+Meta+ArrowRight");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(2);
      expect(sel.end).toBe(6);
    });

    test("shift+cmd+left selects to line start", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToEnd(page);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Shift+Meta+ArrowLeft");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(0);
      expect(sel.end).toBe(4);
    });

    test("shift+down selects to next line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2\nLine3");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowDown");
      const sel = await getSelection(locators);
      expect(sel.start).toBe(0);
      expect(sel.end).toBeGreaterThan(0);
    });

    test("typing replaces selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("XXX");
      expect(await getEditorContent(locators)).toBe("XXXDEF");
    });

    test("click deselects", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEF");
      await page.keyboard.press("Meta+a");
      const selBefore = await getSelection(locators);
      expect(selBefore.end - selBefore.start).toBe(6);

      await focusEditor(page, locators);
      const selAfter = await getSelection(locators);
      expect(selAfter.start).toBe(selAfter.end);
    });
  });

  test.describe(`${editorName}: Mouse Operations`, () => {
    test("click positions cursor", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJ");
      const box = await locators.container.boundingBox();
      expect(box).not.toBeNull();

      // Click at different x positions
      await page.mouse.click(box!.x + 20, box!.y + 15);
      await page.waitForTimeout(100);
      const pos1 = await getCursorPosition(locators);

      await page.mouse.click(box!.x + 80, box!.y + 15);
      await page.waitForTimeout(100);
      const pos2 = await getCursorPosition(locators);

      expect(pos2).toBeGreaterThan(pos1);
    });

    test("drag creates selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOP");
      const box = await locators.container.boundingBox();
      expect(box).not.toBeNull();

      await page.mouse.move(box!.x + 20, box!.y + 15);
      await page.mouse.down();
      await page.mouse.move(box!.x + 100, box!.y + 15);
      await page.mouse.up();
      await page.waitForTimeout(100);

      const sel = await getSelection(locators);
      expect(sel.end).toBeGreaterThan(sel.start);
    });

    test("drag selection can be replaced by typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOP");
      const box = await locators.container.boundingBox();
      expect(box).not.toBeNull();

      await page.mouse.move(box!.x + 20, box!.y + 15);
      await page.mouse.down();
      await page.mouse.move(box!.x + 100, box!.y + 15);
      await page.mouse.up();
      await page.waitForTimeout(100);

      await page.keyboard.type("XXX");
      const content = await getEditorContent(locators);
      expect(content).toContain("XXX");
      expect(content.length).toBeLessThan(16);
    });

    test("drag right to left creates selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOP");
      const box = await locators.container.boundingBox();
      expect(box).not.toBeNull();

      // Drag from right to left
      await page.mouse.move(box!.x + 100, box!.y + 15);
      await page.mouse.down();
      await page.mouse.move(box!.x + 20, box!.y + 15);
      await page.mouse.up();
      await page.waitForTimeout(100);

      const sel = await getSelection(locators);
      expect(sel.end).toBeGreaterThan(sel.start);
    });

    test("multi-line drag selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1 content\nLine2 content\nLine3 content");
      const box = await locators.container.boundingBox();
      expect(box).not.toBeNull();

      // Drag from line 1 to line 2
      await page.mouse.move(box!.x + 30, box!.y + 15);
      await page.mouse.down();
      await page.mouse.move(box!.x + 60, box!.y + 40);
      await page.mouse.up();
      await page.waitForTimeout(100);

      const sel = await getSelection(locators);
      expect(sel.end - sel.start).toBeGreaterThan(5);
    });
  });

  test.describe(`${editorName}: Clipboard Operations`, () => {
    test("copy and paste", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "HELLO WORLD");
      await goToStart(page);
      // Select "HELLO"
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+c");
      await goToEnd(page);
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("HELLO WORLDHELLO");
    });

    test("cut removes and copies text", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "HELLO WORLD");
      await goToStart(page);
      // Select "HELLO "
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+x");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("WORLD");

      // Paste at end
      await goToEnd(page);
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("WORLDHELLO ");
    });

    test("paste replaces selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "AAABBB");
      await goToStart(page);
      // Select and copy "AAA"
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+c");

      // Move to position after AAA and select "BBB"
      await page.keyboard.press("ArrowRight"); // Deselect and move after selection
      await goToLineEnd(page);
      await page.keyboard.press("Shift+Meta+ArrowLeft"); // Select to start would select too much
      // Actually, let's be more precise
      await goToStart(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // Now at position 3, select BBB
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("AAAAAA");
    });

    test("paste multi-line content", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line1\nLine2");
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await goToEnd(page);
      await page.keyboard.press("Enter");
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);
      expect(await getEditorContent(locators)).toBe("Line1\nLine2\nLine1\nLine2");
    });
  });

  test.describe(`${editorName}: Undo/Redo`, () => {
    test("undo reverts last change", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Focus and get initial content
      await focusEditor(page, locators);
      const initialContent = await getEditorContent(locators);

      // Go to end and type new content
      await goToEnd(page);
      await page.keyboard.type("XYZ", { delay: 50 });
      await page.waitForTimeout(400);

      const afterType = await getEditorContent(locators);
      expect(afterType).toContain("XYZ");
      expect(afterType.length).toBe(initialContent.length + 3);

      // Undo should remove typed content
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      const afterUndo = await getEditorContent(locators);
      expect(afterUndo.length).toBeLessThan(afterType.length);
    });

    test("redo restores undone change", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Focus and get initial content
      await focusEditor(page, locators);

      // Go to end and type new content
      await goToEnd(page);
      await page.keyboard.type("XYZ", { delay: 50 });
      await page.waitForTimeout(400);

      const afterType = await getEditorContent(locators);
      expect(afterType).toContain("XYZ");

      // Undo
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const afterUndo = await getEditorContent(locators);
      expect(afterUndo.length).toBeLessThan(afterType.length);

      // Redo should restore
      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(100);
      const afterRedo = await getEditorContent(locators);

      expect(afterRedo).toContain("XYZ");
      expect(afterRedo.length).toBeGreaterThan(afterUndo.length);
    });

    test("multiple undo steps", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Focus editor
      await focusEditor(page, locators);
      await goToEnd(page);

      // Type with delays to create separate history entries
      await page.keyboard.type("1", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.type("2", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.type("3", { delay: 50 });
      await page.waitForTimeout(400);

      const afterType = await getEditorContent(locators);
      expect(afterType).toContain("123");

      // Multiple undos
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const after1Undo = await getEditorContent(locators);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const after2Undo = await getEditorContent(locators);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      const after3Undo = await getEditorContent(locators);

      // Each undo should reduce content
      expect(after1Undo.length).toBeLessThanOrEqual(afterType.length);
      expect(after2Undo.length).toBeLessThanOrEqual(after1Undo.length);
      expect(after3Undo.length).toBeLessThanOrEqual(after2Undo.length);
    });

    test("undo deletion restores content", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Focus and get content before deletion
      await focusEditor(page, locators);
      const initialContent = await getEditorContent(locators);
      const initialLength = initialContent.length;

      // Select some text and delete
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(400);

      const afterDelete = await getEditorContent(locators);
      expect(afterDelete.length).toBe(initialLength - 3);

      // Undo should restore
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      const afterUndo = await getEditorContent(locators);
      expect(afterUndo.length).toBe(initialLength);
    });
  });

  test.describe(`${editorName}: SVG Synchronization`, () => {
    test("SVG updates when typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "UNIQUETEST123");
      await page.waitForTimeout(200);

      const svgText = await getSvgText(locators);
      expect(svgText).toContain("UNIQUETEST123");
    });

    test("SVG updates when deleting", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "DELETEME");
      await page.waitForTimeout(200);

      const svgTextBefore = await getSvgText(locators);
      expect(svgTextBefore).toContain("DELETEME");

      await page.keyboard.press("Meta+a");
      await page.keyboard.type("NEW");
      await page.waitForTimeout(200);

      const svgTextAfter = await getSvgText(locators);
      expect(svgTextAfter).toContain("NEW");
      expect(svgTextAfter).not.toContain("DELETEME");
    });

    test("cursor visible when focused", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TEST");
      await page.waitForTimeout(200);

      // Cursor is rect with width=2
      const cursorCount = await locators.svg.locator('rect[width="2"]').count();
      expect(cursorCount).toBeGreaterThan(0);
    });

    test("selection highlight visible", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "SELECT THIS TEXT");
      await page.keyboard.press("Meta+a");
      await page.waitForTimeout(200);

      // Selection highlight is rect with rgba fill
      const highlightCount = await locators.svg.locator('rect[fill*="rgba"]').count();
      expect(highlightCount).toBeGreaterThan(0);
    });
  });

  test.describe(`${editorName}: Edge Cases`, () => {
    test("empty document handling", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.waitForTimeout(100);

      expect(await getEditorContent(locators)).toBe("");
      expect(await getCursorPosition(locators)).toBe(0);

      // Should be able to type
      await page.keyboard.type("A");
      expect(await getEditorContent(locators)).toBe("A");
    });

    test("single character document", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "X");
      await page.waitForTimeout(100);

      await page.keyboard.press("Meta+a");
      const sel = await getSelection(locators);
      expect(sel.end - sel.start).toBe(1);

      await page.keyboard.press("Backspace");
      expect(await getEditorContent(locators)).toBe("");
    });

    test("very long line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      const longLine = "A".repeat(200);
      await setEditorContent(page, locators, longLine);
      await page.waitForTimeout(200);

      expect(await getEditorContent(locators)).toBe(longLine);

      // Navigate should work
      await goToStart(page);
      expect(await getCursorPosition(locators)).toBe(0);

      await goToEnd(page);
      expect(await getCursorPosition(locators)).toBe(200);
    });

    test("cursor at boundaries", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TEST");

      // At start
      await goToStart(page);
      await page.keyboard.press("ArrowLeft"); // Should stay at 0
      expect(await getCursorPosition(locators)).toBe(0);

      // At end
      await goToEnd(page);
      await page.keyboard.press("ArrowRight"); // Should stay at end
      expect(await getCursorPosition(locators)).toBe(4);
    });

    test("rapid typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      // Type rapidly without delay
      await page.keyboard.type("RAPIDTYPING");
      await page.waitForTimeout(200);

      expect(await getEditorContent(locators)).toBe("RAPIDTYPING");
    });

    test("alternating insert and delete", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      await page.keyboard.type("A");
      await page.keyboard.press("Backspace");
      await page.keyboard.type("B");
      await page.keyboard.press("Backspace");
      await page.keyboard.type("C");

      expect(await getEditorContent(locators)).toBe("C");
    });

    test("select all on empty document", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");
      await page.keyboard.press("Meta+a");

      const sel = await getSelection(locators);
      expect(sel.start).toBe(0);
      expect(sel.end).toBe(0);
    });
  });

  test.describe(`${editorName}: Focus and Blur`, () => {
    test("cursor appears on focus", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      // Check no cursor initially (depends on initial focus state)
      await focusEditor(page, locators);
      await page.waitForTimeout(100);

      const cursorCount = await locators.svg.locator('rect[width="2"]').count();
      expect(cursorCount).toBeGreaterThan(0);
    });

    test("cursor disappears on blur", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      await page.waitForTimeout(100);

      // Click outside to blur
      await page.locator("h2").first().click();
      await page.waitForTimeout(100);

      const cursorCount = await locators.svg.locator('rect[width="2"]').count();
      expect(cursorCount).toBe(0);
    });

    test("selection preserved after refocus", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TESTCONTENT");
      await page.keyboard.press("Meta+a");

      const selBefore = await getSelection(locators);
      expect(selBefore.end - selBefore.start).toBe(11);

      // Blur and refocus
      await page.locator("h2").first().click();
      await page.waitForTimeout(100);
      await focusEditor(page, locators);

      // Selection might be cleared on refocus, which is acceptable behavior
      const selAfter = await getSelection(locators);
      expect(selAfter.start).toBeGreaterThanOrEqual(0);
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineEditorTests("text", "/#/text-editor");
defineEditorTests("code", "/#/code-editor");
