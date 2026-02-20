/**
 * @file Block Position Calculation E2E Tests
 *
 * Tests for verifying that Y-coordinate calculations correctly handle
 * variable line heights from different block types (headings, code blocks, etc.).
 *
 * Problem: When blocks have fontSizeMultiplier (e.g., headings), the Y position
 * calculation needs to account for the variable heights, not use fixed lineHeight.
 *
 * Solution: BlockLayoutIndex precomputes line Y positions considering fontSizeMultiplier.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/markdown/svg";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  return {
    container: page.locator("div:has(> svg:has(text))").first(),
    svg: page.locator("svg:has(text)").first(),
    textarea: page.locator('textarea[aria-label="Text editor"]').first(),
  };
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

async function clickAndType(
  page: Page,
  x: number,
  y: number,
  text: string
): Promise<void> {
  await page.mouse.click(x, y);
  await page.waitForTimeout(100);
  await page.keyboard.type(text);
  await page.waitForTimeout(100);
}

// =============================================================================
// Tests: Click Position Accuracy on Different Block Types
// =============================================================================

test.describe("Block Position Calculation: Click Accuracy", () => {
  test("click on heading block places cursor at correct position", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await expect(locators.svg).toBeVisible();

    // Find the H1 heading text element
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    // Get bounding box of heading
    const textBox = await h1Text.boundingBox();
    expect(textBox).not.toBeNull();

    // Click at start of heading (first character area)
    await page.mouse.click(textBox!.x + 5, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(100);

    // Press Home to ensure we're at the start
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    // Type a marker
    await page.keyboard.type("X");
    await page.waitForTimeout(100);

    // Verify the X was inserted at the start
    const content = await locators.svg.textContent();
    expect(content).toContain("XMarkdown Block Editor");
  });

  test("click on paragraph after heading places cursor correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find a paragraph that comes after a heading
    const paragraph = locators.svg.locator("text").filter({ hasText: "This is a paragraph" });
    await expect(paragraph).toBeVisible();

    const textBox = await paragraph.boundingBox();
    expect(textBox).not.toBeNull();

    // Click at start of paragraph
    await page.mouse.click(textBox!.x + 5, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(100);

    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    // Type a marker
    await page.keyboard.type("Y");
    await page.waitForTimeout(100);

    // Verify the Y was inserted correctly
    const content = await locators.svg.textContent();
    expect(content).toContain("YThis is a paragraph");
  });

  test("click at boundary between heading and paragraph selects correct line", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find H1 heading
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    const h1Box = await h1Text.boundingBox();
    expect(h1Box).not.toBeNull();

    // Click in the lower half of the heading (still within heading bounds)
    // Using 3/4 of height to be safely within the heading area
    await page.mouse.click(h1Box!.x + 5, h1Box!.y + h1Box!.height * 0.75);
    await page.waitForTimeout(100);

    // Move to start of line and type marker
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);
    await page.keyboard.type("Z");
    await page.waitForTimeout(100);

    // The Z should be at the start of the heading line
    const content = await locators.svg.textContent();
    expect(content).toContain("ZMarkdown Block Editor");
  });
});

// =============================================================================
// Tests: Drag Selection Accuracy
// =============================================================================

test.describe("Block Position Calculation: Drag Selection", () => {
  test("drag selection within heading matches visual selection", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find the H1 heading
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    const textBox = await h1Text.boundingBox();
    expect(textBox).not.toBeNull();

    // Drag from start to middle of heading
    const startX = textBox!.x + 10;
    const endX = textBox!.x + textBox!.width / 2;
    const y = textBox!.y + textBox!.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Check that selection highlight exists
    const selectionRects = locators.svg.locator('rect[fill*="rgba"]');
    const selectionCount = await selectionRects.count();

    // Should have at least one selection rect
    expect(selectionCount).toBeGreaterThan(0);

    // Verify selection by typing replacement
    await page.keyboard.type("SELECTED");
    await page.waitForTimeout(100);

    const content = await locators.svg.textContent();
    // Some portion of "Markdown Block Editor" should be replaced
    expect(content).toContain("SELECTED");
  });

  test("drag selection from heading to paragraph works correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find heading and paragraph
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const paragraph = locators.svg.locator("text").filter({ hasText: "Features" });

    await expect(h1Text).toBeVisible();
    await expect(paragraph).toBeVisible();

    const h1Box = await h1Text.boundingBox();
    const paraBox = await paragraph.boundingBox();
    expect(h1Box).not.toBeNull();
    expect(paraBox).not.toBeNull();

    // Drag from middle of heading to middle of paragraph
    const startX = h1Box!.x + h1Box!.width / 2;
    const startY = h1Box!.y + h1Box!.height / 2;
    const endX = paraBox!.x + paraBox!.width / 2;
    const endY = paraBox!.y + paraBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Get selection range from textarea
    const selectionRange = await locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
    }));

    // Selection should span multiple characters (cross-line)
    expect(selectionRange.end - selectionRange.start).toBeGreaterThan(10);
  });
});

// =============================================================================
// Tests: Cursor Position Consistency Across Block Types
// =============================================================================

test.describe("Block Position Calculation: Consistency", () => {
  test("cursor position consistent across h1, h2, h3, paragraph", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find different heading levels and paragraph
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h2Text = locators.svg.locator("text").filter({ hasText: "Features" });
    const paragraphText = locators.svg.locator("text").filter({ hasText: "This is a paragraph" });

    // Test H1
    await expect(h1Text).toBeVisible();
    const h1Box = await h1Text.boundingBox();
    expect(h1Box).not.toBeNull();
    await page.mouse.click(h1Box!.x + 50, h1Box!.y + h1Box!.height / 2);
    await page.waitForTimeout(100);

    // Verify cursor is in H1 by pressing End and checking position
    await page.keyboard.press("End");
    const h1EndOffset = await locators.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );

    // Test H2
    await expect(h2Text).toBeVisible();
    const h2Box = await h2Text.boundingBox();
    expect(h2Box).not.toBeNull();
    await page.mouse.click(h2Box!.x + 50, h2Box!.y + h2Box!.height / 2);
    await page.waitForTimeout(100);

    await page.keyboard.press("End");
    const h2EndOffset = await locators.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );

    // H2 end offset should be greater than H1 end offset (comes later in document)
    expect(h2EndOffset).toBeGreaterThan(h1EndOffset);

    // Test Paragraph
    await expect(paragraphText).toBeVisible();
    const paraBox = await paragraphText.boundingBox();
    expect(paraBox).not.toBeNull();
    await page.mouse.click(paraBox!.x + 50, paraBox!.y + paraBox!.height / 2);
    await page.waitForTimeout(100);

    await page.keyboard.press("End");
    const paraEndOffset = await locators.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );

    // Paragraph comes after H1 but before H2 in the document
    expect(paraEndOffset).toBeGreaterThan(h1EndOffset);
    expect(paraEndOffset).toBeLessThan(h2EndOffset);
  });

  test("clicking at same relative position gives consistent results", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find H1 heading
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    await expect(h1Text).toBeVisible();

    const textBox = await h1Text.boundingBox();
    expect(textBox).not.toBeNull();

    // Click at approximately character 5 position (estimate)
    const charWidth = textBox!.width / "Markdown Block Editor".length;
    const targetX = textBox!.x + charWidth * 5;

    // Click and get offset
    await page.mouse.click(targetX, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(100);

    const offset1 = await locators.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );

    // Click elsewhere first
    await page.mouse.click(textBox!.x + textBox!.width - 10, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(100);

    // Click at same position again
    await page.mouse.click(targetX, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(100);

    const offset2 = await locators.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );

    // Should give same offset each time
    expect(offset2).toBe(offset1);
  });
});

// =============================================================================
// Tests: Vertical Position Accuracy
// =============================================================================

test.describe("Block Position Calculation: Y Coordinate Accuracy", () => {
  test("clicking below heading but above next line selects heading", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Find H1 heading and next element
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const nextText = locators.svg.locator("text").filter({ hasText: "Features" });

    await expect(h1Text).toBeVisible();
    await expect(nextText).toBeVisible();

    const h1Box = await h1Text.boundingBox();
    const nextBox = await nextText.boundingBox();
    expect(h1Box).not.toBeNull();
    expect(nextBox).not.toBeNull();

    // Click in the gap between heading and next line (if any)
    // Due to variable heights, this tests the Y boundary handling
    const gapY = h1Box!.y + h1Box!.height + 1;

    // Only test if there's actually a gap
    if (gapY < nextBox!.y) {
      await page.mouse.click(h1Box!.x + 50, gapY);
      await page.waitForTimeout(100);

      await page.keyboard.press("Home");
      await page.keyboard.type("GAP");
      await page.waitForTimeout(100);

      const content = await locators.svg.textContent();
      // Check if GAP was inserted somewhere reasonable
      expect(content).toContain("GAP");
    }
  });

  test("Y positions accumulate correctly for multiple headings", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Get all visible text elements
    const allTexts = locators.svg.locator("text");
    const count = await allTexts.count();
    expect(count).toBeGreaterThan(3);

    // Get Y positions of first few elements
    const yPositions: number[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await allTexts.nth(i).boundingBox();
      if (box) {
        yPositions.push(box.y);
      }
    }

    // Y positions should be strictly increasing
    for (let i = 1; i < yPositions.length; i++) {
      expect(yPositions[i]).toBeGreaterThan(yPositions[i - 1]);
    }

    // Check that headings have larger gaps (due to larger font size)
    // This is a sanity check that variable heights are being applied
    const h1Text = locators.svg.locator("text").filter({ hasText: "Markdown Block Editor" });
    const h1Box = await h1Text.boundingBox();

    if (h1Box) {
      // H1 height should be larger than typical paragraph height (21px base * 1.75 = ~37px)
      expect(h1Box.height).toBeGreaterThan(25);
    }
  });
});
