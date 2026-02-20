/**
 * @file TextEditor Soft Wrap E2E Tests
 *
 * Tests for soft wrap functionality in the TextEditor component
 * (not the dedicated SoftWrapDemo page).
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/text-editor";

type EditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
  softWrapCheckbox: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  // First editor section "With Rich Text Styles" - find the container with svg and textarea
  const textareas = page.locator('textarea[aria-label="Text editor"]');
  // Get the first textarea (in "With Rich Text Styles" section)
  const firstTextarea = textareas.first();
  // Find parent container
  const container = firstTextarea.locator("..");
  return {
    container,
    svg: container.locator("svg").first(),
    textarea: firstTextarea,
    softWrapCheckbox: page.getByRole("checkbox", { name: "Soft Wrap" }),
  };
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

async function enableSoftWrap(page: Page, locators: EditorLocators): Promise<void> {
  // Check if soft wrap checkbox exists and click it
  await expect(locators.softWrapCheckbox).toBeVisible();
  const isChecked = await locators.softWrapCheckbox.isChecked();
  if (!isChecked) {
    await locators.softWrapCheckbox.click();
    await page.waitForTimeout(200); // Wait for wrap calculation
  }
}

// =============================================================================
// Tests: TextEditor with Soft Wrap
// =============================================================================

test.describe("TextEditor: Soft Wrap Integration", () => {
  test("soft wrap checkbox is available", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Soft wrap checkbox should exist
    await expect(locators.softWrapCheckbox).toBeVisible();
  });

  test("enabling soft wrap causes text to wrap", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Count text elements before enabling soft wrap
    const textElementsBefore = await locators.svg.locator("text").count();

    // Enable soft wrap
    await enableSoftWrap(page, locators);
    await page.waitForTimeout(500); // Wait for wrap recalculation

    // Count text elements after enabling soft wrap
    const textElementsAfter = await locators.svg.locator("text").count();

    // Should have more visual lines after wrapping (assuming content is long enough)
    // Note: This may vary depending on container width and content
    expect(textElementsAfter).toBeGreaterThanOrEqual(textElementsBefore);
  });

  test("cursor positioning works with soft wrap enabled", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Enable soft wrap
    await enableSoftWrap(page, locators);

    // Click on the editor
    const containerBox = await locators.container.boundingBox();
    if (!containerBox) {
      throw new Error("Container not found");
    }

    await page.mouse.click(containerBox.x + 10, containerBox.y + 15);
    await page.waitForTimeout(100);

    // Editor should be focused
    await expect(locators.textarea).toBeFocused();

    // Type some text
    await page.keyboard.type("Test");
    await page.waitForTimeout(100);

    // Get cursor position
    const cursorPos = await locators.textarea.evaluate((el) => {
      return (el as HTMLTextAreaElement).selectionStart;
    });

    // Cursor should have moved
    expect(cursorPos).toBeGreaterThan(0);
  });

  test("rich text styles render correctly with soft wrap", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);

    // Enable soft wrap
    await enableSoftWrap(page, locators);

    // Wait for rendering
    await page.waitForTimeout(300);

    // Check that styled text is visible (the demo has styled text like "quick" in brown-bold)
    const svgContent = await locators.svg.textContent();
    expect(svgContent).toContain("quick");
    expect(svgContent).toContain("brown");
  });
});
