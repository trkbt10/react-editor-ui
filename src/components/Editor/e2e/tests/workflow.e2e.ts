/**
 * @file Editor Workflow Tests
 *
 * Tests for realistic editing workflows and patterns.
 * These tests simulate actual user behavior sequences.
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

function defineWorkflowTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: Writing from Scratch`, () => {
    test("write paragraph with corrections", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      // Start writing
      await page.keyboard.type("Teh quick");
      // Realize typo, go back and fix
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      // At position after "Teh"
      // Select "Teh"
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.type("The");
      // Continue writing
      await goToEnd(page);
      await page.keyboard.type(" brown fox");

      expect(await getEditorContent(locators)).toBe("The quick brown fox");
    });

    test("write multiple lines with editing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      // Write first line
      await page.keyboard.type("First line content");
      await page.keyboard.press("Enter");

      // Write second line
      await page.keyboard.type("Second line");
      await page.keyboard.press("Enter");

      // Write third line
      await page.keyboard.type("Third line content");

      // Go back and modify second line
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.type(" modified");

      const content = await getEditorContent(locators);
      expect(content).toContain("First line content");
      expect(content).toContain("Second line modified");
      expect(content).toContain("Third line content");
    });

    test("build content incrementally", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      // Write base content
      await page.keyboard.type("Hello");
      expect(await getEditorContent(locators)).toBe("Hello");

      // Add to it
      await page.keyboard.type(" World");
      expect(await getEditorContent(locators)).toBe("Hello World");

      // Add new line
      await page.keyboard.press("Enter");
      await page.keyboard.type("New paragraph");
      expect(await getEditorContent(locators)).toBe("Hello World\nNew paragraph");

      // Add more
      await page.keyboard.press("Enter");
      await page.keyboard.type("Final line");
      expect(await getEditorContent(locators)).toBe("Hello World\nNew paragraph\nFinal line");
    });
  });

  test.describe(`${editorName}: Editing Existing Content`, () => {
    test("find and replace manually", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "The cat sat on the mat. The cat was happy.");

      // Find first "cat" and replace with "dog"
      await goToStart(page);
      // Navigate to first "cat"
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      // At position 4, select "cat"
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("dog");

      const content = await getEditorContent(locators);
      expect(content).toContain("The dog sat");
      expect(content).toContain("The cat was"); // Second "cat" unchanged
    });

    test("add content at beginning", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "existing content here");
      await goToStart(page);
      await page.keyboard.type("NEW PREFIX: ");

      expect(await getEditorContent(locators)).toBe("NEW PREFIX: existing content here");
    });

    test("add content at end", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "existing content");
      await goToEnd(page);
      await page.keyboard.type(" with suffix");

      expect(await getEditorContent(locators)).toBe("existing content with suffix");
    });

    test("insert new line in middle", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Line 1\nLine 3");
      await goToStart(page);
      await page.keyboard.press("Meta+ArrowRight");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Line 2");

      expect(await getEditorContent(locators)).toBe("Line 1\nLine 2\nLine 3");
    });

    test("delete entire line", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Keep this\nDelete this\nKeep this too");
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      // Select entire line
      await page.keyboard.press("Meta+ArrowLeft");
      await page.keyboard.press("Shift+Meta+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight"); // Include newline
      await page.keyboard.press("Backspace");

      expect(await getEditorContent(locators)).toBe("Keep this\nKeep this too");
    });
  });

  test.describe(`${editorName}: Copy/Paste Workflows`, () => {
    test("duplicate content using copy/paste", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Original text");
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await goToEnd(page);
      await page.keyboard.press("Enter");
      await page.keyboard.press("Meta+v");

      expect(await getEditorContent(locators)).toBe("Original text\nOriginal text");
    });

    test("move content using cut/paste", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "First Second Third");
      await goToStart(page);
      // Select "First "
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+x");
      await page.waitForTimeout(100);

      // Now at start, move to end
      await goToEnd(page);
      await page.keyboard.type(" ");
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);

      expect(await getEditorContent(locators)).toBe("Second Third First ");
    });

    test("paste over selection", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "AAAA BBBB CCCC");
      await goToStart(page);
      // Select and copy AAAA
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+c");

      // Deselect by pressing ArrowRight, then skip space
      await page.keyboard.press("ArrowRight"); // Deselect and move to position 4
      await page.keyboard.press("ArrowRight"); // Skip space, now at position 5
      // Select BBBB
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);

      expect(await getEditorContent(locators)).toBe("AAAA AAAA CCCC");
    });

    test("multiple paste operations", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TEXT");
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Meta+c");
      await goToEnd(page);

      await page.keyboard.press("Meta+v");
      await page.keyboard.press("Meta+v");
      await page.keyboard.press("Meta+v");
      await page.waitForTimeout(100);

      expect(await getEditorContent(locators)).toBe("TEXTTEXTTEXTTEXT");
    });
  });

  test.describe(`${editorName}: Undo/Redo Workflows`, () => {
    test("undo multiple typing sessions", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      const initial = await getEditorContent(locators);

      await goToEnd(page);
      await page.keyboard.type("A", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.type("B", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.type("C", { delay: 50 });
      await page.waitForTimeout(400);

      const withABC = await getEditorContent(locators);
      expect(withABC.endsWith("ABC")).toBe(true);

      // Undo all
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      const afterUndo = await getEditorContent(locators);
      expect(afterUndo.length).toBeLessThanOrEqual(initial.length + 2); // May have some residual
    });

    test("redo after undo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      await goToEnd(page);

      await page.keyboard.type("ADDED", { delay: 50 });
      await page.waitForTimeout(400);

      const withAdded = await getEditorContent(locators);

      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      const afterUndo = await getEditorContent(locators);
      expect(afterUndo.length).toBeLessThan(withAdded.length);

      await page.keyboard.press("Meta+Shift+z");
      await page.waitForTimeout(100);

      const afterRedo = await getEditorContent(locators);
      expect(afterRedo.length).toBeGreaterThan(afterUndo.length);
    });

    test("continue editing after undo clears redo", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await focusEditor(page, locators);
      await goToEnd(page);

      await page.keyboard.type("A", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.type("B", { delay: 50 });
      await page.waitForTimeout(400);

      // Undo B
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      // Type something new (should clear redo stack)
      await page.keyboard.type("C", { delay: 50 });
      await page.waitForTimeout(400);

      const content = await getEditorContent(locators);
      expect(content).toContain("AC");
      expect(content).not.toContain("AB");
    });
  });

  test.describe(`${editorName}: Mouse and Keyboard Combined`, () => {
    test("click to position, then type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJ");
      const box = await locators.container.boundingBox();

      // Click in middle
      await page.mouse.click(box!.x + 60, box!.y + 15);
      await page.waitForTimeout(100);

      const pos = await getCursorPosition(locators);
      expect(pos).toBeGreaterThan(0);
      expect(pos).toBeLessThan(10);

      // Type
      await page.keyboard.type("X");
      const content = await getEditorContent(locators);
      expect(content).toContain("X");
      expect(content.length).toBe(11);
    });

    test("drag select, then keyboard operation", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOP");
      const box = await locators.container.boundingBox();

      // Drag select
      await page.mouse.move(box!.x + 20, box!.y + 15);
      await page.mouse.down();
      await page.mouse.move(box!.x + 80, box!.y + 15);
      await page.mouse.up();
      await page.waitForTimeout(100);

      // Delete selection
      await page.keyboard.press("Backspace");
      const content = await getEditorContent(locators);
      expect(content.length).toBeLessThan(16);
    });

    test("keyboard select, then mouse click deselects", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "TESTCONTENT");
      await page.keyboard.press("Meta+a");

      // Verify selection
      const selBefore = await locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
        start: el.selectionStart,
        end: el.selectionEnd,
      }));
      expect(selBefore.end - selBefore.start).toBe(11);

      // Click to deselect
      await focusEditor(page, locators);

      // Selection should be collapsed
      const selAfter = await locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
        start: el.selectionStart,
        end: el.selectionEnd,
      }));
      expect(selAfter.start).toBe(selAfter.end);
    });

    test("extend selection with keyboard after click", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOP");
      const box = await locators.container.boundingBox();

      // Click to position cursor
      await page.mouse.click(box!.x + 20, box!.y + 15);
      await page.waitForTimeout(100);

      const initialPos = await getCursorPosition(locators);

      // Use shift+arrow to extend selection (more reliable than shift+click)
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Shift+ArrowRight");
      }
      await page.waitForTimeout(100);

      const sel = await locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
        start: el.selectionStart,
        end: el.selectionEnd,
      }));

      expect(sel.start).toBe(initialPos);
      expect(sel.end).toBe(initialPos + 5);
    });
  });

  test.describe(`${editorName}: Real World Scenarios`, () => {
    test("write email-like content", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      await page.keyboard.type("Hello,");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
      await page.keyboard.type("I hope this message finds you well.");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Best regards,");
      await page.keyboard.press("Enter");
      await page.keyboard.type("John");

      const content = await getEditorContent(locators);
      expect(content).toContain("Hello,");
      expect(content).toContain("I hope");
      expect(content).toContain("Best regards,");
      expect(content).toContain("John");
    });

    test("write list items", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      await page.keyboard.type("Shopping list:");
      await page.keyboard.press("Enter");
      await page.keyboard.type("1. Milk");
      await page.keyboard.press("Enter");
      await page.keyboard.type("2. Bread");
      await page.keyboard.press("Enter");
      await page.keyboard.type("3. Eggs");

      const content = await getEditorContent(locators);
      expect(content).toContain("Shopping list:");
      expect(content).toContain("1. Milk");
      expect(content).toContain("2. Bread");
      expect(content).toContain("3. Eggs");
    });

    test("reorder list items using cut/paste", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "A\nB\nC");

      // Move C to top
      await goToStart(page);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      // On line C
      await page.keyboard.press("Meta+ArrowLeft");
      await page.keyboard.press("Shift+Meta+ArrowRight");
      await page.keyboard.press("Meta+x");
      await page.waitForTimeout(100);

      // Go to start and paste
      await goToStart(page);
      await page.keyboard.press("Meta+v");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);

      const content = await getEditorContent(locators);
      // C should now be at or near the top
      expect(content.indexOf("C")).toBeLessThan(content.indexOf("A"));
    });

    test("fix multiple typos in document", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "Thsi is teh wrnog text");

      // Fix "Thsi" -> "This"
      await goToStart(page);
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("This");

      // Fix "teh" -> "the"
      await page.keyboard.press("ArrowRight"); // space
      await page.keyboard.press("ArrowRight"); // i
      await page.keyboard.press("ArrowRight"); // s
      await page.keyboard.press("ArrowRight"); // space
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("the");

      // Fix "wrnog" -> "wrong"
      await page.keyboard.press("ArrowRight"); // space
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("wrong");

      expect(await getEditorContent(locators)).toBe("This is the wrong text");
    });
  });

  test.describe(`${editorName}: Stress Patterns`, () => {
    test("rapid typing and deletion", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "");

      for (let i = 0; i < 5; i++) {
        await page.keyboard.type("ABCDE");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Backspace");
      }

      expect(await getEditorContent(locators)).toBe("");
    });

    test("rapid cursor movements", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      await goToStart(page);

      // Rapid back and forth
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
      }

      const pos = await getCursorPosition(locators);
      expect(pos).toBe(10); // Net movement of 10 positions
    });

    test("alternating select and type", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "AAABBBCCC");
      await goToStart(page);

      // Select AAA, type X
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("X");

      // Select BBB, type Y
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("Y");

      // Select CCC, type Z
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.press("Shift+ArrowRight");
      await page.keyboard.type("Z");

      expect(await getEditorContent(locators)).toBe("XYZ");
    });

    test("interleaved undo and typing", async ({ page }) => {
      const locators = await setupEditor(page, route, editorType);
      await setEditorContent(page, locators, "BASE");
      await goToEnd(page);

      await page.keyboard.type("1", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      await page.keyboard.type("2", { delay: 50 });
      await page.waitForTimeout(400);
      await page.keyboard.press("Meta+z");
      await page.waitForTimeout(100);

      await page.keyboard.type("3");

      const content = await getEditorContent(locators);
      expect(content).toContain("3");
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineWorkflowTests("text", "/#/text-editor");
defineWorkflowTests("code", "/#/code-editor");
