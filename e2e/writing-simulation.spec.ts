/**
 * @file Writing Simulation E2E Tests
 *
 * Simulates realistic writing scenarios including Japanese text input,
 * corrections, undo/redo, and creative editing workflows.
 *
 * Scenario: Natsume Soseki writing the opening of "Yume Juuya" (Ten Nights of Dreams)
 *
 * HISTORY MODEL:
 * - setContent() creates one history entry (default -> new content)
 * - Each typeText() + debounce creates additional history entries
 * - Undo traverses: current -> previous entries -> default content
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  return {
    container: page.locator("div:has(> svg:has(text))").first(),
    textarea: page.locator('textarea[aria-label="Text editor"]').first(),
  };
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 50, y: 20 }, force: true });
  await page.waitForTimeout(100);
}

async function getContent(locators: EditorLocators): Promise<string> {
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

async function goToStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

async function goToEnd(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("Meta+ArrowRight");
}

/**
 * Type text using keyboard.type() with small delay.
 */
async function typeText(page: Page, text: string): Promise<void> {
  await page.keyboard.type(text, { delay: 10 });
}

/**
 * Set editor to specific content by selecting all and typing.
 * Creates ONE history entry (default -> content).
 */
async function setContent(page: Page, locators: EditorLocators, content: string): Promise<void> {
  await focusEditor(page, locators);
  await page.keyboard.press("Meta+a");
  await page.waitForTimeout(50);
  if (content === "") {
    await page.keyboard.press("Backspace");
  } else {
    await typeText(page, content);
  }
  await page.waitForTimeout(400); // Wait for debounce
}

// =============================================================================
// Writing Simulation Tests
// =============================================================================

test.describe("Writing Simulation: Yume Juuya", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");
  });

  test("writes the famous opening line with corrections", async ({ page }) => {
    const locators = getEditorLocators(page);

    // === Start with the famous opening line ===
    await setContent(page, locators, "こんな夢を見た。");
    expect(await getContent(locators)).toBe("こんな夢を見た。");

    // === Select "夢" (at position 3) and replace with "夢（ゆめ）" ===
    await goToStart(page);
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowRight");
    }
    expect(await getCursorPosition(locators)).toBe(3);

    await page.keyboard.press("Shift+ArrowRight");
    const selection = await getSelection(locators);
    expect(selection.end - selection.start).toBe(1);

    await typeText(page, "夢（ゆめ）");
    await page.waitForTimeout(400);

    expect(await getContent(locators)).toBe("こんな夢（ゆめ）を見た。");

    // === Undo the annotation ===
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);

    expect(await getContent(locators)).toBe("こんな夢を見た。");

    // === Redo the annotation ===
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("こんな夢（ゆめ）を見た。");
  });

  test("writes multiple drafts and navigates undo history", async ({ page }) => {
    const locators = getEditorLocators(page);

    // === Draft 1: setContent creates history entry ===
    await setContent(page, locators, "女は静かに目を閉じた。");
    const draft1 = "女は静かに目を閉じた。";
    expect(await getContent(locators)).toBe(draft1);
    const cursor1 = await getCursorPosition(locators);

    // === Draft 2: Add more text (creates second history entry) ===
    await typeText(page, "長い睫の影が頬に落ちている。");
    await page.waitForTimeout(400);

    const draft2 = draft1 + "長い睫の影が頬に落ちている。";
    expect(await getContent(locators)).toBe(draft2);
    const cursor2 = await getCursorPosition(locators);

    // === Draft 3: Add even more (creates third history entry) ===
    await typeText(page, "その顔は蝋のように青白い。");
    await page.waitForTimeout(400);

    const draft3 = draft2 + "その顔は蝋のように青白い。";
    expect(await getContent(locators)).toBe(draft3);

    // === Undo: Draft3 -> Draft2 ===
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(draft2);
    expect(await getCursorPosition(locators)).toBe(cursor2);

    // === Undo: Draft2 -> Draft1 ===
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(draft1);
    expect(await getCursorPosition(locators)).toBe(cursor1);

    // === Redo: Draft1 -> Draft2 ===
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(draft2);

    // === Redo: Draft2 -> Draft3 ===
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(draft3);
  });

  test("handles corrections with undo", async ({ page }) => {
    const locators = getEditorLocators(page);

    // Start with text
    await setContent(page, locators, "夢を見た");
    expect(await getContent(locators)).toBe("夢を見た");

    // Add more text at end (without goToEnd - cursor should already be there)
    await typeText(page, "。美しい夢だった。");
    await page.waitForTimeout(400);

    expect(await getContent(locators)).toBe("夢を見た。美しい夢だった。");

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("夢を見た");

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("夢を見た。美しい夢だった。");
  });

  test("full passage with paragraph breaks", async ({ page }) => {
    const locators = getEditorLocators(page);

    const line1 = "こんな夢を見た。";
    await setContent(page, locators, line1);
    expect(await getContent(locators)).toBe(line1);

    // Add paragraph break and second line
    await page.keyboard.press("Enter");
    const line2 = "腕組をして枕元に坐っていると、仰向に寝た女が、静かな声でもう死にますと云う。";
    await typeText(page, line2);
    await page.waitForTimeout(400);

    const fullText = line1 + "\n" + line2;
    expect(await getContent(locators)).toBe(fullText);
    expect(await getCursorPosition(locators)).toBe(fullText.length);

    // Add third sentence
    await typeText(page, "女は長い髪を枕に敷いている。");
    await page.waitForTimeout(400);

    const extendedText = fullText + "女は長い髪を枕に敷いている。";
    expect(await getContent(locators)).toBe(extendedText);

    // Undo third sentence
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(fullText);
    expect(await getCursorPosition(locators)).toBe(fullText.length);

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(extendedText);
  });

  test("selection replacement in middle of text", async ({ page }) => {
    const locators = getEditorLocators(page);

    await setContent(page, locators, "私は美しい夢を見た。");
    expect(await getContent(locators)).toBe("私は美しい夢を見た。");

    // Select "美しい" and replace with "不思議な"
    await goToStart(page);
    await page.keyboard.press("ArrowRight"); // 私
    await page.keyboard.press("ArrowRight"); // は

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Shift+ArrowRight");
    }

    expect((await getSelection(locators)).end - (await getSelection(locators)).start).toBe(3);

    await typeText(page, "不思議な");
    await page.waitForTimeout(400);

    expect(await getContent(locators)).toBe("私は不思議な夢を見た。");
    expect(await getCursorPosition(locators)).toBe(6);

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("私は美しい夢を見た。");
  });

  test("rapid typing creates separate undo points", async ({ page }) => {
    const locators = getEditorLocators(page);

    // Start with first phrase
    await setContent(page, locators, "夢、");
    const base = "夢、";
    expect(await getContent(locators)).toBe(base);

    // Add second phrase (creates history entry)
    await typeText(page, "幻、");
    await page.waitForTimeout(400);
    const state2 = base + "幻、";
    expect(await getContent(locators)).toBe(state2);

    // Add third phrase (creates history entry)
    await typeText(page, "泡沫。");
    await page.waitForTimeout(400);
    const state3 = state2 + "泡沫。";
    expect(await getContent(locators)).toBe(state3);

    // Undo: state3 -> state2
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(state2);

    // Undo: state2 -> base
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(base);

    // Redo: base -> state2
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(state2);

    // Redo: state2 -> state3
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(state3);
  });

  test("IME-like character input batching", async ({ page }) => {
    const locators = getEditorLocators(page);

    // First sentence
    await setContent(page, locators, "夢を見た。");
    const sentence1 = "夢を見た。";
    expect(await getContent(locators)).toBe(sentence1);

    // Second sentence (creates new history entry after debounce)
    await typeText(page, "その夢は美しかった。");
    await page.waitForTimeout(400);
    const sentence2 = sentence1 + "その夢は美しかった。";
    expect(await getContent(locators)).toBe(sentence2);

    // Undo second sentence
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(sentence1);

    // Redo second sentence
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(sentence2);
  });

  test("Tab key inserts spaces", async ({ page }) => {
    const locators = getEditorLocators(page);

    await setContent(page, locators, "text");
    expect(await getContent(locators)).toBe("text");

    // Insert tab at start
    await goToStart(page);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const contentWithTab = await getContent(locators);
    // Tab should insert spaces (default tabSize=2)
    expect(contentWithTab.length).toBeGreaterThan("text".length);
    expect(contentWithTab).toContain("text");

    // Cursor should be after the inserted spaces
    const cursor = await getCursorPosition(locators);
    expect(cursor).toBeGreaterThan(0);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

test.describe("Writing Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("svg text");
  });

  test("empty to content workflow", async ({ page }) => {
    const locators = getEditorLocators(page);

    await setContent(page, locators, "");
    expect(await getContent(locators)).toBe("");

    await typeText(page, "テスト");
    await page.waitForTimeout(400);
    expect(await getContent(locators)).toBe("テスト");

    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("");

    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("テスト");
  });

  test("long text editing", async ({ page }) => {
    const locators = getEditorLocators(page);

    const baseText = "あいうえお";
    await setContent(page, locators, baseText);
    expect(await getContent(locators)).toBe(baseText);

    // Add more
    await typeText(page, "かきくけこ");
    await page.waitForTimeout(400);
    const extended = baseText + "かきくけこ";
    expect(await getContent(locators)).toBe(extended);

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(baseText);

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(extended);
  });

  test("special characters", async ({ page }) => {
    const locators = getEditorLocators(page);

    const specialText = "「夢」——『幻』…‥※★☆";
    await setContent(page, locators, specialText);
    expect(await getContent(locators)).toBe(specialText);

    await typeText(page, "追加");
    await page.waitForTimeout(400);
    expect(await getContent(locators)).toBe(specialText + "追加");

    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(specialText);
  });

  test("mixed Japanese and ASCII", async ({ page }) => {
    const locators = getEditorLocators(page);

    const mixedText = "Hello世界";
    await setContent(page, locators, mixedText);
    expect(await getContent(locators)).toBe(mixedText);

    // Edit: add at end
    await typeText(page, "123");
    await page.waitForTimeout(400);
    const extended = mixedText + "123";
    expect(await getContent(locators)).toBe(extended);

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(mixedText);

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe(extended);
  });

  test("cursor preserved after undo", async ({ page }) => {
    const locators = getEditorLocators(page);

    await setContent(page, locators, "ABCDEFGH");

    // Go to position 4
    await goToStart(page);
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowRight");
    }
    expect(await getCursorPosition(locators)).toBe(4);

    // Insert
    await typeText(page, "XYZ");
    await page.waitForTimeout(400);
    expect(await getContent(locators)).toBe("ABCDXYZEFGH");
    expect(await getCursorPosition(locators)).toBe(7);

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(200);
    expect(await getContent(locators)).toBe("ABCDEFGH");

    // Cursor should be in valid range
    const cursor = await getCursorPosition(locators);
    expect(cursor).toBeGreaterThanOrEqual(0);
    expect(cursor).toBeLessThanOrEqual(8);
  });
});
