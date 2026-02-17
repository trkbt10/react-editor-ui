/**
 * @file Editor IME Advanced Tests
 *
 * Advanced IME composition tests:
 * - IME input at various positions (start, middle, end)
 * - IME input replacing selection
 * - Mixed IME and regular typing
 * - CJK character width handling
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

/**
 * Simulate IME input using Playwright's insertText with composition events.
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

  // Update composition
  for (let i = 1; i <= finalText.length; i++) {
    const partialText = finalText.slice(0, i);
    await textarea.evaluate((el, text) => {
      el.dispatchEvent(new CompositionEvent("compositionupdate", { data: text }));
    }, partialText);
    await page.waitForTimeout(30);
  }

  // Insert text
  await page.keyboard.insertText(finalText);
  await page.waitForTimeout(50);

  // End composition
  await textarea.evaluate((el, text) => {
    el.dispatchEvent(new CompositionEvent("compositionend", { data: text }));
  }, finalText);
  await page.waitForTimeout(100);
}

async function setupEditor(page: Page, route: string, editorType: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, editorType);
}

// =============================================================================
// Test Definitions
// =============================================================================

function defineIMEAdvancedTests(editorType: EditorType, route: string): void {
  const editorName = editorType === "text" ? "TextEditor" : "CodeEditor";

  test.describe(`${editorName}: IME Advanced`, () => {
    test.describe("IME at Different Positions", () => {
      test("IME input at document start", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "END");
        await goToStart(page);

        await simulateIMEInput(page, locators, "開始");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("開始END");
      });

      test("IME input at document end", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "START");
        // Cursor is already at end after typing

        await simulateIMEInput(page, locators, "終了");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("START終了");
      });

      test("IME input in middle of text", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "ABCDEF");
        await goToStart(page);

        // Move to position 3
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");

        await simulateIMEInput(page, locators, "中間");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("ABC中間DEF");
      });

      test("IME input on empty document", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        await simulateIMEInput(page, locators, "空文書");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("空文書");
      });
    });

    test.describe("IME with Selection", () => {
      test("IME replaces selection", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "hello world");
        await goToStart(page);

        // Select "hello"
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Shift+ArrowRight");
        }

        // IME input should replace selection
        await simulateIMEInput(page, locators, "こんにちは");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("こんにちは world");
      });

      test("IME replaces select-all", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "replace me");

        // Select all
        await page.keyboard.press("Meta+a");

        // IME input should replace all
        await simulateIMEInput(page, locators, "新しいテキスト");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("新しいテキスト");
      });
    });

    test.describe("Mixed IME and Regular Input", () => {
      test("regular typing after IME", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        // IME input
        await simulateIMEInput(page, locators, "日本語");
        await page.waitForTimeout(100);

        // Regular typing
        await page.keyboard.type(" English");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("日本語 English");
      });

      test("IME after regular typing", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        // Regular typing
        await page.keyboard.type("Hello ");

        // IME input
        await simulateIMEInput(page, locators, "世界");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("Hello 世界");
      });

      test("alternating IME and regular input", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        await page.keyboard.type("A");
        await simulateIMEInput(page, locators, "あ");
        await page.keyboard.type("B");
        await simulateIMEInput(page, locators, "い");
        await page.keyboard.type("C");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("AあBいC");
      });
    });

    test.describe("CJK Character Handling", () => {
      test("cursor position after CJK input", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "ABC");
        await goToStart(page);

        // Move to position 1
        await page.keyboard.press("ArrowRight");

        // Insert Japanese characters
        await simulateIMEInput(page, locators, "漢字");
        await page.waitForTimeout(100);

        // Cursor should be after the inserted text
        const cursorPos = await getCursorPosition(locators);
        expect(cursorPos).toBe(3); // "A" + 2 chars of "漢字"

        const content = await getEditorContent(locators);
        expect(content).toBe("A漢字BC");
      });

      test("Korean input", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        await simulateIMEInput(page, locators, "한글");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("한글");
      });

      test("Chinese input", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        await simulateIMEInput(page, locators, "中文");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("中文");
      });

      test("mixed CJK scripts", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");

        await simulateIMEInput(page, locators, "日本");
        await simulateIMEInput(page, locators, "한국");
        await simulateIMEInput(page, locators, "中国");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("日本한국中国");
      });
    });

    test.describe("IME Undo/Redo Integration", () => {
      test("undo removes complete IME phrase", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "START");
        await page.waitForTimeout(400);

        // Go to end
        await page.keyboard.press("Meta+ArrowRight");

        // IME input
        await simulateIMEInput(page, locators, "日本語");
        await page.waitForTimeout(400);

        expect(await getEditorContent(locators)).toBe("START日本語");

        // Undo should remove the entire phrase
        await page.keyboard.press("Meta+z");
        await page.waitForTimeout(200);

        const content = await getEditorContent(locators);
        expect(content).toBe("START");
      });

      test("redo restores complete IME phrase", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "");
        await page.waitForTimeout(400);

        // IME input
        await simulateIMEInput(page, locators, "テスト");
        await page.waitForTimeout(400);

        // Undo
        await page.keyboard.press("Meta+z");
        await page.waitForTimeout(200);

        // Redo
        await page.keyboard.press("Meta+Shift+z");
        await page.waitForTimeout(200);

        const content = await getEditorContent(locators);
        expect(content).toBe("テスト");
      });

      test("cursor position correct after IME undo", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "ABC");
        await page.waitForTimeout(400);

        // Go to end
        await page.keyboard.press("Meta+ArrowRight");

        // IME input at end
        await simulateIMEInput(page, locators, "X");
        await page.waitForTimeout(400);

        expect(await getEditorContent(locators)).toBe("ABCX");

        // Undo
        await page.keyboard.press("Meta+z");
        await page.waitForTimeout(200);

        // Content should be restored
        expect(await getEditorContent(locators)).toBe("ABC");

        // Cursor should be at end (where X was added)
        const cursorPos = await getCursorPosition(locators);
        expect(cursorPos).toBe(3);
      });
    });

    test.describe("Multiline IME", () => {
      test("IME on second line", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "line1\nline2");
        // Cursor is at end of line2

        await simulateIMEInput(page, locators, "追加");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("line1\nline2追加");
      });

      test("IME at start of second line", async ({ page }) => {
        const locators = await setupEditor(page, route, editorType);
        await setEditorContent(page, locators, "line1\nline2");
        await goToStart(page);

        // Move to start of line2
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Meta+ArrowLeft");

        await simulateIMEInput(page, locators, "前置");
        await page.waitForTimeout(100);

        const content = await getEditorContent(locators);
        expect(content).toBe("line1\n前置line2");
      });
    });
  });
}

// =============================================================================
// Run Tests for Both Editor Types
// =============================================================================

defineIMEAdvancedTests("text", "/#/text-editor");
defineIMEAdvancedTests("code", "/#/code-editor");
